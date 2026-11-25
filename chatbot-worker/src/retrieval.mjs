import { KNOWLEDGE_CHUNKS, KNOWLEDGE_VERSION } from './knowledge.mjs';

export const EMBEDDING_MODEL = '@cf/baai/bge-small-en-v1.5';
export const INDEX_KEY = `semantic-index:${KNOWLEDGE_VERSION}:bge-small-cls`;
const TOP_K = 6;
const BATCH_SIZE = 32;
const SYNTHESIS_PATTERN = /\b(bigger picture|connect|connection|theme|overall|why (does|is|it)|why matter|significance|philosophy)\b/i;

const STOPWORDS = new Set(`a an and are as at be been being but by can could did do does for from had has have he her hers him his how i if in into is it its may me might more most my no not of on or our ours she should so than that the their theirs them they this those to too us was we were what when where which who why will with would you your yours about tell explain describe please sanchit minocha`.split(' '));

function stem(token) {
  if (token.length > 5 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

function tokens(text) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(token => token.length > 1 && !STOPWORDS.has(token))
    .map(stem);
}

const TOKENIZED_CHUNKS = KNOWLEDGE_CHUNKS.map(chunk => tokens(`${chunk.title} ${chunk.text}`));
const DOC_FREQUENCIES = new Map();
for (const docTokens of TOKENIZED_CHUNKS) {
  for (const token of new Set(docTokens)) DOC_FREQUENCIES.set(token, (DOC_FREQUENCIES.get(token) || 0) + 1);
}
const AVERAGE_DOC_LENGTH = TOKENIZED_CHUNKS.reduce((sum, item) => sum + item.length, 0) / Math.max(TOKENIZED_CHUNKS.length, 1);

function lexicalScore(queryTokens, docTokens) {
  if (!queryTokens.length) return 0;
  const counts = new Map();
  for (const token of docTokens) counts.set(token, (counts.get(token) || 0) + 1);
  const k1 = 1.2;
  const b = 0.75;
  let score = 0;
  for (const token of new Set(queryTokens)) {
    const tf = counts.get(token) || 0;
    if (!tf) continue;
    const df = DOC_FREQUENCIES.get(token) || 0;
    const idf = Math.log(1 + (KNOWLEDGE_CHUNKS.length - df + 0.5) / (df + 0.5));
    score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docTokens.length / AVERAGE_DOC_LENGTH)));
  }
  return score;
}

function normalizeLexical(score) {
  return 1 - Math.exp(-score / 4);
}

function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

function isFollowUp(question) {
  return /\b(it|that|those|they|them|this|these|the project|the paper|the tool)\b/i.test(question)
    || /^(yes|yeah|sure|okay|ok|tell me more|go on|more details|what else|anything else|continue)[\s!?.]*$/i.test(question.trim());
}

export function buildRetrievalQuery(messages) {
  const question = messages.at(-1)?.content?.trim() || '';
  let query = question
    .replace(/\bsanchit\s+minocha\b/gi, ' ')
    .replace(/\bsanchit\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (messages.length > 1 && isFollowUp(query)) {
    const earlier = messages.slice(0, -1);
    const lastUser = [...earlier].reverse().find(item => item.role === 'user')?.content || '';
    const lastAssistant = [...earlier].reverse().find(item => item.role === 'assistant')?.content || '';
    query = `${lastUser.slice(0, 140)} ${lastAssistant.slice(0, 180)} ${query}`.trim();
  }

  const expansions = [];
  if (/\b(employ|employed|employment|job|workplace|current role|current position|works? now)\b/i.test(query)) {
    expansions.push('current role position employer workplace organization');
  }
  if (/\b(publish|published|publication|paper|article|journal)\b/i.test(query)) {
    expansions.push('publication paper journal research');
  }
  if (/\b(study|studied|education|degree|university|college|advisor|thesis)\b/i.test(query)) {
    expansions.push('education degree institution university advisor thesis');
  }
  if (/\b(hobby|hobbies|interest|favorite|favourite)\b/i.test(query)) {
    expansions.push('interests hobbies favorite');
  }
  if (SYNTHESIS_PATTERN.test(query)) {
    expansions.push('research philosophy current work MIT sustainability actionable science themes impact');
  }
  if (expansions.length) query = `${query} ${expansions.join(' ')}`;
  return query.length >= 3 ? query : question;
}

export function privateQuestionResponse(question) {
  const privatePattern = /\b(phone|telephone|mobile number|home address|street address|date of birth|birthday|age|how old|born|visa|immigration|salary|social security|ssn|passport|family member|sibling|brother|relationship status)\b/i;
  if (!privatePattern.test(question)) return null;
  return "I don't share Sanchit's private personal, family, immigration, or financial details. For professional inquiries, you can contact him at msanchit@mit.edu.";
}

let memoryIndex = null;

async function embed(env, textsToEmbed) {
  const result = await env.AI.run(EMBEDDING_MODEL, { text: textsToEmbed, pooling: 'cls' });
  if (!Array.isArray(result?.data) || result.data.length !== textsToEmbed.length) {
    throw new Error('INVALID_EMBEDDING_RESPONSE');
  }
  return result.data;
}

async function buildSemanticIndex(env) {
  const vectors = [];
  for (let start = 0; start < KNOWLEDGE_CHUNKS.length; start += BATCH_SIZE) {
    const batch = KNOWLEDGE_CHUNKS.slice(start, start + BATCH_SIZE)
      .map(chunk => `${chunk.title}\n${chunk.text}`);
    vectors.push(...await embed(env, batch));
  }
  const index = { version: KNOWLEDGE_VERSION, model: EMBEDDING_MODEL, vectors };
  if (env.RAG_INDEX) {
    try {
      await env.RAG_INDEX.put(INDEX_KEY, JSON.stringify(index));
    } catch {
      // Retrieval can continue with the in-memory index if a concurrent build won the KV write.
    }
  }
  memoryIndex = index;
  return index;
}

async function getSemanticIndex(env) {
  if (memoryIndex?.version === KNOWLEDGE_VERSION) return memoryIndex;
  if (env.RAG_INDEX) {
    const stored = await env.RAG_INDEX.get(INDEX_KEY, { type: 'json', cacheTtl: 300 });
    if (stored?.version === KNOWLEDGE_VERSION && stored?.vectors?.length === KNOWLEDGE_CHUNKS.length) {
      memoryIndex = stored;
      return stored;
    }
  }
  if (!env.AI) return null;
  return buildSemanticIndex(env);
}

export async function retrievalStatus(env) {
  if (!env.RAG_INDEX) return { mode: 'lexical', indexReady: false, chunks: KNOWLEDGE_CHUNKS.length };
  const ready = Boolean(await env.RAG_INDEX.get(INDEX_KEY, { cacheTtl: 60 }));
  return { mode: env.AI ? 'hybrid-semantic' : 'lexical', indexReady: ready, chunks: KNOWLEDGE_CHUNKS.length };
}

export async function retrieve(messages, env, topK = TOP_K) {
  const query = buildRetrievalQuery(messages);
  const queryTokens = tokens(query);
  const latestQuestion = messages.at(-1)?.content || '';
  const synthesisFollowUp = messages.length > 1 && SYNTHESIS_PATTERN.test(latestQuestion);
  let index = null;
  let queryVector = null;

  try {
    index = await getSemanticIndex(env);
    if (index && env.AI) [queryVector] = await embed(env, [query]);
  } catch {
    index = null;
    queryVector = null;
  }

  const rankedMatches = KNOWLEDGE_CHUNKS.map((chunk, position) => {
    const lexicalRaw = lexicalScore(queryTokens, TOKENIZED_CHUNKS[position]);
    const lexical = normalizeLexical(lexicalRaw);
    const queryTerms = new Set(queryTokens);
    const documentTerms = new Set(TOKENIZED_CHUNKS[position]);
    const matchedTerms = [...queryTerms].filter(term => documentTerms.has(term)).length;
    const coverage = queryTerms.size ? matchedTerms / queryTerms.size : 0;
    const semantic = queryVector && index?.vectors?.[position]
      ? cosine(queryVector, index.vectors[position])
      : 0;
    const score = queryVector ? (semantic * 0.82 + lexical * 0.18) : lexical;
    return { ...chunk, score, semantic, lexical, lexicalRaw, coverage };
  }).sort((a, b) => b.score - a.score);

  let matches = rankedMatches.slice(0, Math.min(Math.max(topK, 1), 10));
  if (synthesisFollowUp) {
    const anchorIds = ['profile-current', 'research-philosophy'];
    matches = matches.map(item => anchorIds.includes(item.id) ? { ...item, synthesisAnchor: true } : item);
    for (const id of anchorIds) {
      if (matches.some(item => item.id === id)) continue;
      const anchor = rankedMatches.find(item => item.id === id);
      if (anchor) matches.push({ ...anchor, synthesisAnchor: true });
    }
  }

  const top = matches[0] || { score: 0, semantic: 0, lexical: 0, lexicalRaw: 0 };
  const semanticAvailable = Boolean(queryVector);
  const lexicalEvidence = (top.lexical >= 0.34 && top.coverage >= 0.6)
    || (synthesisFollowUp && top.lexical >= 0.55 && top.coverage >= 0.3);
  const semanticEvidence = top.semantic >= 0.68 || (top.semantic >= 0.56 && top.coverage >= 0.5);
  const answerable = semanticAvailable ? semanticEvidence || lexicalEvidence : lexicalEvidence;

  return {
    query,
    answerable,
    mode: semanticAvailable ? 'hybrid-semantic' : 'lexical',
    confidence: Number(top.score.toFixed(4)),
    matches: matches.map(item => ({
      ...item,
      score: Number(item.score.toFixed(4)),
      semantic: Number(item.semantic.toFixed(4)),
      lexical: Number(item.lexical.toFixed(4)),
      coverage: Number(item.coverage.toFixed(4))
    }))
  };
}

export function selectGroundedMatches(result) {
  const topScore = result.matches[0]?.score || 0;
  const cutoff = Math.max(0.5, topScore - 0.22);
  const anchors = result.matches.filter(item => item.synthesisAnchor);
  const anchorIds = new Set(anchors.map(item => item.id));
  const regular = result.matches.filter((item, index) => !anchorIds.has(item.id) && (index === 0 || (
    item.score >= cutoff && (item.semantic >= 0.58 || item.coverage >= 0.25)
  ))).slice(0, Math.max(1, 5 - anchors.length));
  return [...regular, ...anchors].slice(0, 5);
}

export function formatRetrievedContext(result) {
  return selectGroundedMatches(result).map((item, index) => [
    `[${index + 1}] ${item.title}`,
    `Source: ${item.source}${item.url ? ` | ${item.url}` : ''}`,
    `Retrieval score: ${item.score}`,
    item.text
  ].join('\n')).join('\n\n---\n\n');
}
