# Portfolio chatbot Worker

This Cloudflare Worker powers the chatbot on the main portfolio and PhD defense pages. It calls Groq from the server so the Groq API key is never shipped to the browser.

The current version migrates the public-safe material from the original Pikachu Flask/ChromaDB project. It uses hybrid semantic and lexical retrieval over curated profile information, experience, education, skills, interests, stories, detailed projects, and publications. Cloudflare Workers AI generates BGE query embeddings, while a free Workers KV namespace caches the document index. Private fields from the old knowledge base are deliberately excluded.

## Deploy

From the repository root:

1. Sign in with `npx wrangler login`.
2. Add the Groq key using the secure prompt: `npx wrangler secret put GROQ_API_KEY --config chatbot-worker/wrangler.jsonc`.
3. Deploy: `npx wrangler deploy --config chatbot-worker/wrangler.jsonc`.
4. The deployed endpoint is `https://sanchit-portfolio-chatbot.coolboysanch.workers.dev/api/chat`, configured in `CB_API` at the top of `assets/js/chatbot.js`.

Do not put the Groq key in this repository or in browser-side JavaScript.

## Local development

The website uses the deployed Worker during ordinary local previews. To test a local Worker instead, create `chatbot-worker/.dev.vars` containing `GROQ_API_KEY=...`, run:

```sh
npx wrangler dev --config chatbot-worker/wrangler.jsonc --var SITE_ORIGIN:http://127.0.0.1:8000
python3 -m http.server 8000 --bind 127.0.0.1
```

Then set `window.CHATBOT_API_URL` to `http://127.0.0.1:8787/api/chat` before `chatbot.js` loads.

Run the Worker tests with `node --test chatbot-worker/test/worker.test.mjs`.

## Inspect retrieval

`POST /api/retrieve` accepts the same `messages` body as `/api/chat` and returns the selected passages, sources, retrieval scores, and whether the evidence threshold was met. It does not call Groq. Normal chat responses also include compact source metadata and an `answerable` flag.
