import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/worker.mjs';
import { KNOWLEDGE_CHUNKS } from '../src/knowledge.mjs';
import { retrieve } from '../src/retrieval.mjs';

const origin = 'https://sanchitminocha.github.io';
const env = {
  SITE_ORIGIN: origin,
  ALLOW_LOCAL_PREVIEW: 'true',
  GROQ_API_KEY: 'test-key',
  GROQ_MODEL: 'openai/gpt-oss-20b',
  CHAT_LIMIT: { limit: async () => ({ success: true }) }
};

function request(body, options = {}) {
  return new Request(`https://worker.example${options.path || '/api/chat'}`, {
    method: options.method || 'POST',
    headers: {
      Origin: options.origin === undefined ? origin : options.origin,
      'Content-Type': options.contentType || 'application/json',
      'CF-Connecting-IP': '192.0.2.1'
    },
    body: options.method === 'GET' ? undefined : JSON.stringify(body)
  });
}

test('the migrated corpus excludes stale and sensitive fields', () => {
  const corpus = KNOWLEDGE_CHUNKS.map(item => item.text).join('\n');
  assert.ok(KNOWLEDGE_CHUNKS.length > 40);
  assert.doesNotMatch(corpus, /206[- )]436[- ]9521/);
  assert.doesNotMatch(corpus, /date of birth/i);
  assert.doesNotMatch(corpus, /F-1 visa|H1B|OPT-STEM/i);
  assert.doesNotMatch(corpus, /msanchit@uw\.edu/i);
  assert.match(corpus, /Postdoctoral Associate at the MIT Center/);
  assert.match(corpus, /favorite food is biryani/i);
  assert.match(corpus, /Pikachu knows it is a conversational AI/i);
});

test('retrieval recognizes employment paraphrases and rejects partial keyword traps', async () => {
  const employment = await retrieve([{ role: 'user', content: 'Where is he employed now?' }], {});
  assert.equal(employment.answerable, true);
  assert.match(employment.matches[0].text, /MIT|Massachusetts Institute of Technology/);

  for (const question of ['Can he play the violin?', 'Give me weather tomorrow', 'What is his shoe size?']) {
    const result = await retrieve([{ role: 'user', content: question }], {});
    assert.equal(result.answerable, false, question);
  }
});

test('retrieval brings together project and philosophy evidence for bigger-picture follow-ups', async () => {
  const result = await retrieve([
    { role: 'user', content: 'Tell me about RAT and reservoir monitoring.' },
    { role: 'assistant', content: 'RAT is the Reservoir Assessment Tool for satellite-based reservoir monitoring.' },
    { role: 'user', content: 'Why does it matter, and how does that connect to the bigger picture of his work?' }
  ], {});
  assert.equal(result.answerable, true);
  const types = new Set(result.matches.slice(0, 6).map(item => item.type));
  assert.ok(types.has('profile'));
  assert.ok(types.has('philosophy'));
  assert.ok(types.has('publication') || types.has('project'));
});

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
    const payload = await response.json();
    assert.equal(payload.response, 'Sanchit uses satellite observations and machine learning.');
    assert.equal(payload.answerable, true);
    assert.equal(payload.retrieval_mode, 'lexical');
    assert.ok(payload.sources.length > 0);
    assert.equal(upstreamBody.model, 'openai/gpt-oss-20b');
    assert.equal(upstreamBody.max_completion_tokens, 600);
    assert.equal(upstreamBody.temperature, 0.5);
    assert.match(upstreamBody.messages[0].content, /You are Pikachu/);
    assert.match(upstreamBody.messages[0].content, /Treat retrieved evidence as knowledge to reason with/);
    assert.match(upstreamBody.messages[0].content, /RAT: Satellite-based Reservoir Monitoring/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('passes prior turns to Pikachu for contextual follow-up reasoning', async () => {
  const originalFetch = globalThis.fetch;
  let upstreamBody;
  globalThis.fetch = async (_url, init) => {
    upstreamBody = JSON.parse(init.body);
    return Response.json({ choices: [{ message: { content: 'It matters because RAT turns satellite observations into actionable reservoir information.' } }] });
  };

  try {
    const conversation = [
      { role: 'user', content: 'Tell me about RAT and reservoir monitoring.' },
      { role: 'assistant', content: 'RAT is the Reservoir Assessment Tool for satellite-based reservoir monitoring.' },
      { role: 'user', content: 'Why does it matter?' }
    ];
    const response = await worker.fetch(request({ messages: conversation }), env);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.answerable, true);
    assert.deepEqual(upstreamBody.messages.slice(1), conversation);
    assert.match(upstreamBody.messages[0].content, /Use the prior conversation turns/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('does not expose provider error details', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('private provider detail', { status: 500 });
  try {
    const response = await worker.fetch(request({ messages: [{ role: 'user', content: 'Tell me about RAT reservoir monitoring' }] }), env);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'The assistant is temporarily unavailable.' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('lets Pikachu handle unsupported questions naturally without inventing evidence', async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  let upstreamBody;
  globalThis.fetch = async (_url, init) => {
    called = true;
    upstreamBody = JSON.parse(init.body);
    return Response.json({
      choices: [{ message: { content: "That detail isn't in my Pokédex yet, so I don't want to guess. ⚡" } }]
    });
  };
  try {
    const response = await worker.fetch(request({
      messages: [{ role: 'user', content: 'Can Sanchit play the violin?' }]
    }), env);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.answerable, false);
    assert.match(payload.response, /Pokédex/i);
    assert.equal(called, true);
    assert.deepEqual(payload.sources, []);
    assert.match(upstreamBody.messages[0].content, /No sufficiently reliable evidence was retrieved/);
    assert.match(upstreamBody.messages[0].content, /do not invent a factual answer/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('does not disclose private information', async () => {
  const response = await worker.fetch(request({
    messages: [{ role: 'user', content: "What is Sanchit's phone number?" }]
  }), env);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.answerable, false);
  assert.equal(payload.reason, 'private-information');
  assert.match(payload.response, /don't share/i);
});

test('retrieval inspection endpoint returns evidence without calling Groq', async () => {
  const response = await worker.fetch(request({
    messages: [{ role: 'user', content: 'What is RECLAIM?' }]
  }, { path: '/api/retrieve' }), env);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.answerable, true);
  assert.equal(payload.retrieval_mode, 'lexical');
  assert.match(payload.matches[0].title, /RECLAIM/i);
  assert.ok(payload.matches[0].excerpt.length > 20);
});
