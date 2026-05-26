# NameMap

A personal CRM built around **remembering names**. Add people (optionally by dropping
in a LinkedIn/photo screenshot that Claude parses), then drill your recall with a
spaced-repetition flashcard test and explore everyone as a force-directed "neural web".

## Stack
React + Vite · Tailwind · Supabase (Postgres + Auth + Storage) · D3 · Claude (Haiku) via a Supabase Edge Function.

## Local setup
1. `npm install`
2. Copy env: create `.env.local` with
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
   ```
3. `npm run dev` and open http://localhost:5173

## Supabase
Tables (`nm_circles`, `nm_people`, `nm_connections`), RLS policies scoped to the signed-in
user, the `nm-profile-photos` storage bucket, and a trigger that seeds default circles on
signup are all already provisioned in the project.

### AI screenshot parsing
The `nm-parse-profile` Edge Function calls Claude. It needs an Anthropic key set as a secret:
```
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   # or set it in the dashboard
```
Until that's set, screenshot auto-fill returns an error and you simply enter details manually.

## Scripts
- `npm run dev` – dev server
- `npm run build` – production build
- `npm run lint` – eslint
