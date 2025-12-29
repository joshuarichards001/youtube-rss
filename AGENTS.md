# Project AGENTS.md

> **Persona:** Senior Full-Stack Engineer (React/Node/TypeScript) specializing in Monorepos.

## Operational Commands (HOW)

**Build & Run:**
```bash
pnpm install  # Install dependencies (strict pnpm only)
pnpm dev      # Start all services (web:5173, server:3000)
pnpm build    # Build all packages
```

**Quality Control:**
```bash
pnpm lint     # Run ESLint across workspace
```

## Project Context (WHY & WHAT)
A full-stack application to manage and generate RSS feeds from YouTube subscriptions, synchronizing via Google OAuth and Supabase.
**Stack:** React 19 (Vite + Tailwind v4 + DaisyUI), Node.js (Express 5 + TypeScript), Supabase, pnpm workspaces.

## Codebase Map
- **`/web`**: Frontend SPA (React, Vite, Supabase Client).
- **`/server`**: Backend API & Background Workers (Express, RSS Polling).
- **`/packages/types`**: Shared TypeScript definitions (Models, API Responses).
- **`/supabase/public_schema.sql`**: Supabase schema definition.

## Standards & Patterns

**Architectural Style:**
Favor **shared types** for API contracts and **functional composition**.

**Good vs. Bad:**
```typescript
// GOOD: Uses shared types, explicit return, typed async
import { YouTubeSubscription } from '@youtube-rss/types';

export const syncSubscriptions = async (token: string): Promise<YouTubeSubscription[]> => {
  const response = await fetch('/api/subscriptions/sync', { ... });
  if (!response.ok) throw new Error('Sync failed');
  return response.json();
};

// BAD: Inline types, relative cross-package imports, ignores error handling
import { type Subscription } from '../../packages/types/src'; // Violation

export async function sync(token: any) { // Violation: any
  return fetch('/api/subscriptions/sync'); // Violation: no error check
}
```

## Boundaries

### Always
- Use `pnpm` for package management (never `npm` or `yarn`).
- Update `@youtube-rss/types` first when modifying API contracts.
- Use `async/await` over raw Promises.

### Ask First
- Adding new heavy dependencies.
- Modifying Supabase schema or policies.
- creating new shared packages in `/packages`.

### Never
- Commit `.env` files or secrets.
- Use `any` type unless strictly necessary (and commented).
- Import directly from `packages/*/src` (use the defined workspace package name).
