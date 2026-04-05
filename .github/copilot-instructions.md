# Copilot / AI Coding Agent Instructions

Purpose: help an AI agent be immediately productive in this Next.js + TypeScript project.

- **Big picture**: This is a Next.js (App Router) site using Tailwind v4 and TypeScript. UI lives under `app/` (App Router). Server logic and shared utilities live in `lib/`. Question and CE content lives in `data/` and `app/_data` style folders. Server endpoints are in `api/` and integrate with Supabase and Stripe.

- **Key directories & examples**:
  - `app/` — App Router pages and layouts (`page.tsx`, `layout.tsx`). Prefer editing this root `app/`, not backup folders like `app.before-explanation-fix.*`.
  - `app/_components/`, `app/_hooks/`, `app/_data/` — local component/hook/data conventions; underscore-prefixed folders are intentional grouping.
  - `lib/` — shared server/client helpers: e.g. `lib/supabaseClient.ts`, `lib/supabaseServer.ts`, `lib/stripe.ts`, `lib/load-questions.ts`.
  - `api/` — Next.js route handlers used by the client and server.
  - `data/` — static JSON and question banks (e.g. `data/validator-ce-store.json`).

- **Integration & env vars** (use these exact names):
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (used in `lib/supabaseClient.ts` and `lib/supabaseServer.ts`).
  - Stripe: `STRIPE_SECRET_KEY` and price IDs like `STRIPE_PRICE_PRO_1M`, `STRIPE_PRICE_PRO_3M`, `STRIPE_PRICE_PRO_6M` (refer `lib/stripe.ts`).

- **Conventions and patterns to follow**:
  - App Router: files named `page.tsx` and `layout.tsx` define routes and layouts. Dynamic routes use `[slug]` folders.
  - Server components are default. Add `"use client"` at the top of files that must run in the browser (search shows client hooks in `app/_hooks`).
  - Shared logic goes into `lib/`; changes there impact both server and client code—limit breaking changes.
  - UI theme lives in `app/globals.css` — color variables are used as the single source of truth.
  - Backups: there are backup folders like `app.before-explanation-fix.*` and `masteryContent.ts.bak.*`. Avoid editing backups; they exist for safety.

- **Build & dev workflow** (commands in `package.json`):
  - Install dependencies: `npm install`
  - Dev server: `npm run dev` (opens at http://localhost:3000)
  - Production build: `npm run build` then `npm start`
  - Lint: `npm run lint`

- **Editing guidance / safety checks**:
  - When modifying question data, update `data/` files and confirm `lib/load-questions.ts` behavior.
  - For auth/session work, prefer `lib/supabaseServer.ts` for server-side flows and `lib/supabaseClient.ts` for browser flows.
  - When adding new API routes, place them under `api/` and mirror any required env vars in the README or this file.
  - No test suite detected — run the dev app to validate behavior after changes.

- **Examples to inspect when implementing features**:
  - `app/page.tsx` and `app/layout.tsx` — entry points for layout and routing
  - `lib/stripe.ts` — plan and price env naming
  - `lib/supabaseServer.ts` — cookie-based server client pattern
  - `data/validator-ce-store.json` — canonical data shape for question stores

If anything here is unclear or you want deeper guidance (routing patterns, data shape examples, or automated tests), tell me which area to expand. 
