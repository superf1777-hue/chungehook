# COPD Hook Studio — runnable MVP

A bilingual, responsive MVP for creating, reviewing, saving, and tracking COPD-related short-form ad hooks.

## Included
- Hook generator with creative angles, audience, language, and quantity controls.
- Optional OpenAI API integration (server-side; API key is never exposed to the browser).
- Works without an API key in **demo mode** using clearly labeled sample concepts.
- English hook + Chinese translation, angle notes, appeal score, and health-claim review flags.
- Saved hook library with search, category filtering, favorites, deletion, and CSV export.
- Performance Lab for manually recording spend, impressions, clicks, and conversions.
- Local browser persistence for the MVP.

## Run locally
Requirements: Node.js 18.17+ (Node 20 LTS recommended).

```bash
npm install
cp .env.example .env.local
# Optional: add your OpenAI API key to .env.local
npm run dev
```

Open http://localhost:3000

Without `OPENAI_API_KEY`, the app runs in demo mode. With a key, generation calls the OpenAI API from the server route.

## Deploy to a temporary URL
1. Push this folder to a private GitHub repository.
2. Create a Vercel account and import the repository.
3. Keep the default Next.js settings and deploy.
4. In Vercel Project Settings → Environment Variables, optionally add:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional; default `gpt-4o-mini`)
5. Redeploy after adding environment variables.

Vercel will provide a temporary `*.vercel.app` URL. A custom domain can be connected later.

## Important MVP notes
- Saved records currently live in the user's browser (`localStorage`); they are not shared across devices or team members.
- Add Supabase Auth + Postgres before multi-user production use.
- Health-related outputs are creative drafts, not medical advice. The app flags unsupported cure, reversal, detox, oxygen, and smoking-substitution claims for human review. It does not guarantee ad approval or bypass platform policies.
- Never put API keys in client-side code or commit `.env.local`.
