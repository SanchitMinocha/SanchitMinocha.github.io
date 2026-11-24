# Portfolio chatbot Worker

This Cloudflare Worker powers the chatbot on the main portfolio and PhD defense pages. It calls Groq from the server so the Groq API key is never shipped to the browser.

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
