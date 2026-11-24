import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/worker.mjs';

const origin = 'https://sanchitminocha.github.io';
const env = {
  SITE_ORIGIN: origin,
  ALLOW_LOCAL_PREVIEW: 'true',
  GROQ_API_KEY: 'test-key',
  GROQ_MODEL: 'openai/gpt-oss-20b',
  CHAT_LIMIT: { limit: async () => ({ success: true }) }
};

function request(body, options = {}) {
  return new Request('https://worker.example/api/chat', {
    method: options.method || 'POST',
    headers: {
      Origin: options.origin === undefined ? origin : options.origin,
      'Content-Type': options.contentType || 'application/json',
      'CF-Connecting-IP': '192.0.2.1'
    },
    body: options.method === 'GET' ? undefined : JSON.stringify(body)
  });
}

test('rejects a foreign origin', async () => {
  const response = await worker.fetch(request({}, { origin: 'https://evil.example' }), env);
  assert.equal(response.status, 403);
});

test('allows local and direct-file previews when enabled', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({
    choices: [{ message: { content: 'Preview works.' } }]
  });
  try {
    for (const previewOrigin of ['http://127.0.0.1:5500', 'http://localhost:8000', 'null']) {
      const response = await worker.fetch(request(
        { messages: [{ role: 'user', content: 'Hello' }] },
        { origin: previewOrigin }
      ), env);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), previewOrigin);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('answers an allowed CORS preflight', async () => {
  const response = await worker.fetch(new Request('https://worker.example/api/chat', {
    method: 'OPTIONS',
    headers: { Origin: origin }
  }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
});

test('rejects invalid conversations before calling Groq', async () => {
  const response = await worker.fetch(request({ messages: [] }), env);
  assert.equal(response.status, 400);
});

test('rejects an oversized request body', async () => {
  const response = await worker.fetch(request({
    messages: [{ role: 'user', content: 'x'.repeat(65 * 1024) }]
  }), env);
  assert.equal(response.status, 413);
});

test('enforces the rate limiter', async () => {
  const limitedEnv = { ...env, CHAT_LIMIT: { limit: async () => ({ success: false }) } };
  const response = await worker.fetch(request({ messages: [{ role: 'user', content: 'Hello' }] }), limitedEnv);
  assert.equal(response.status, 429);
});

test('sends grounded context to Groq and returns only the reply', async () => {
  const originalFetch = globalThis.fetch;
  let upstreamBody;
  globalThis.fetch = async (_url, init) => {
    upstreamBody = JSON.parse(init.body);
    return Response.json({ choices: [{ message: { content: 'Sanchit uses satellite observations and machine learning.' } }] });
  };

  try {
    const response = await worker.fetch(request({
      length: 'short',
      messages: [{ role: 'user', content: 'Tell me about RAT and reservoir monitoring' }]
    }), env);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { response: 'Sanchit uses satellite observations and machine learning.' });
    assert.equal(upstreamBody.model, 'openai/gpt-oss-20b');
    assert.equal(upstreamBody.max_completion_tokens, 500);
    assert.match(upstreamBody.messages[0].content, /RAT: Satellite-based Reservoir Monitoring/);
    assert.match(upstreamBody.messages[0].content, /MIT's Center for Sustainability Science and Strategy/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('does not expose provider error details', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('private provider detail', { status: 500 });
  try {
    const response = await worker.fetch(request({ messages: [{ role: 'user', content: 'Hello' }] }), env);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'The assistant is temporarily unavailable.' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
