# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies (strict pnpm only, never npm/yarn)
pnpm dev                  # Start server (3000) + Vite dev server (5173) in parallel
pnpm dev:server           # Start only the Express server
pnpm dev:web              # Start only the Vite dev server
pnpm build                # Build server (tsc) + web (vite)
pnpm lint                 # ESLint across web/
```

The server uses `tsx watch` for dev, so changes auto-reload. The web app uses Vite (via rolldown-vite).

## Architecture

**Single project** with server code in `src/` and frontend code in `web/`.

- `src/` — Express server (Node/TypeScript, ESM)
- `web/` — React frontend (Vite + React 19)
- Types are defined locally in `src/types.ts` (server) and `web/src/types.ts` (web), duplicated intentionally to avoid coupling.

### Data Flow

1. **Auth**: User signs in via Google OAuth through Supabase Auth on the frontend (`web/src/helpers/supabaseClient.ts`). A DB trigger (`handle_new_user`) auto-creates a `public.users` row.
2. **Subscription Sync**: Frontend sends the Google provider token + Supabase JWT to `POST /api/subscriptions/sync`. The server uses the Google token to fetch YouTube subscriptions via the YouTube Data API, upserts channels into Supabase, and creates subscription records.
3. **RSS Polling**: After sync, the server's `rssWorker` fetches YouTube RSS feeds (`/feeds/videos.xml?channel_id=...`) in batches of 10 with a 2.5s delay between batches, upserting videos into Supabase. Progress is streamed to the client via SSE (`GET /api/sse`).
4. **Video Display**: Frontend reads from a `subscription_videos` Supabase view (joins subscriptions → channels → videos, scoped to user) with infinite scroll pagination.
5. **CSV Import**: Alternative to OAuth sync — users can upload a YouTube takeout CSV via `POST /api/import-csv`.

### Key Patterns

- **State**: Single Zustand store (`web/src/store/useAppStore.ts`) holds session, subscriptions, videos, sync progress, and UI state.
- **Auth middleware**: `src/middleware/auth.ts` validates Supabase JWT (from `Authorization` header or `token` query param for SSE).
- **Server uses `.js` extensions** in imports (ESM requirement with `tsx`), e.g. `import { supabase } from "../config/supabase.js"`.
- **Static serving**: In production, the server serves the built web app from `web/dist`.

### Database (Supabase)

Tables: `users`, `channels`, `subscriptions` (user↔channel join), `videos`. All have RLS enabled. There is a `subscription_videos` view used by the frontend for querying videos scoped to a user's subscriptions.

Schema defined in `/supabase/public_schema.sql`.

## Standards

- Use `async/await`, not raw Promises.
- Keep types in `src/types.ts` (server) and `web/src/types.ts` (web). Duplicate where needed.
- Avoid `any` unless strictly necessary (and commented).
- Tailwind v4 + DaisyUI for styling. React Router v7 for routing.

### Ask First

- Adding new heavy dependencies.
- Modifying Supabase schema or RLS policies.
