# Progress
> Completed work log. Most recent first.

---

## 2026-06-30 — Phases 6–11 Complete

### Phase 6: job-scorer Edge Function
- Fixed `console.error` → `activity_log` insert for parse failures
- Added `GEMINI_API_KEY` 503 guard + null `profile` early return
- Added `deno-lint-ignore` for `any` types (Deno runtime)
- Deployed to `hhucioscpdeaoooureua`

### Phase 7: /jobs Table + Filters + [id] Detail
- `lib/supabase/queries.ts`: added `getJobs(filters)`, `JobRow` type
- `app/(app)/jobs/page.tsx`: Server Component reads `searchParams` (Next.js 16 async)
- `components/app/jobs-table.tsx`: Client Component — status/score/spain filter bar, score-colored badges, row click → `/jobs/[id]`
- `app/(app)/jobs/[id]/page.tsx`: Server Component — full job detail, AI reasoning card, keyword chips, TailorButton

### Phase 8: cv-tailor + API Route + TailorButton
- `supabase/functions/cv-tailor/index.ts`: null guards for resume/profile, Gemini parse error → activity_log
- `app/api/tailor/route.ts`: POST, verifies user + whitelist, invokes `cv-tailor` Edge Function
- `components/app/tailor-button.tsx`: Client Component with loading state (~20s generation)
- All 3 updated Edge Functions redeployed

### Phase 9: /applications Kanban Board
- `lib/supabase/queries.ts`: added `getApplications()`, `ApplicationWithJob`, `ApplicationRow` types
- `app/(app)/applications/actions.ts`: `updateApplicationStatus` Server Action
- `components/app/kanban-board.tsx`: native HTML5 DnD, 7 columns, shortlist filter (score ≥7 + Spain)
- `app/(app)/applications/page.tsx`: Server Component → KanbanBoard

### Phase 10: Dashboard Realtime Activity Feed
- `lib/supabase/queries.ts`: added `getActivityLog(limit)` helper
- `components/app/activity-feed.tsx`: Client Component with Supabase Realtime subscription, Framer Motion stagger animation
- `app/(app)/dashboard/page.tsx`: parallel-fetches stats + activity, renders both

### Phase 11: GitHub Actions
- `.github/workflows/migrations-ci.yml`: lints SQL on push to supabase/migrations/**
- `.github/workflows/keep-alive.yml`: weekly Monday ping to prevent Supabase project pausing

### Bug fix
- `job-fetcher` + `jobs-table` + `jobs/[id]`: changed `salary_raw`/`location_raw` → `salary_text`/`location_text` to match actual DB column names

### Verification
- `bun run build`: green (11 routes)
- `bun run lint`: clean

---

## 2026-06-30 — Auth UI Upgrade + Phase 5

### Auth UI: Tabbed Sign-in / Register + Google OAuth
- `app/(auth)/login/page.tsx`: fully rewritten — two-tab card UI (Sign in / Register)
  - Sign in: email + password → whitelist check → `signInWithPassword` → `/dashboard`
  - Register: email + password + confirm (refine match) → whitelist check → `signUp` → success msg
  - Google OAuth: `signInWithOAuth({ provider: 'google' })` in both tabs, redirects to `/auth/callback`
  - UI: centered card, pill tab switcher, "OR" divider, inline Google SVG icon button
- `app/auth/callback/route.ts`: new GET handler — `exchangeCodeForSession(code)` → redirect `/dashboard`
- `lib/supabase/middleware.ts`: added `/auth/callback` bypass (pass-through before session is set)

### Phase 5: Job Fetcher — Real Source Parsers
- `supabase/functions/job-fetcher/index.ts`: replaced stub `fetchSource()` with 5 real parsers
  - `parseRemoteOK`: JSON API, skips metadata element[0]
  - `parseWorkingNomads`: JSON array, maps salary_from/to to salary_raw string
  - `parseGenericJson`: defensive — handles both `{ jobs: [...] }` and bare `[...]`
  - `parseRssXml`: pure string split on `<item>`, no external dep, handles CDATA
  - `parseJobicy`: JSON API replacing the infeasible `linkedin_html` source
- `SOURCES` updated: `linkedin_html` → `jobicy` (Jobicy JSON API, no auth required)
- Deployed updated function to `hhucioscpdeaoooureua`

### Verification
- `bun run build`: green (all 10 routes, `/auth/callback` shows as ƒ Dynamic)
- `bun run lint`: clean (zero errors/warnings)

---

## 2026-06-30 — Phase 3 + 4 complete

### Phase 3: Sidebar + Auth
- Login page: real email/password sign-in form (react-hook-form + zod, Supabase `signInWithPassword`)
  with client-side whitelist check before auth call
- `components/app/sign-out-button.tsx`: calls `supabase.auth.signOut()`, pushes to `/login`
- `components/app/sidebar.tsx`: active-route highlighting via `usePathname()`, user label, sign-out button in footer; icons via `lucide-react`
- `proxy.ts` + `lib/supabase/middleware.ts`: unchanged — whitelist redirect already correct

### Phase 4: /profile + /resume UI
- `components/ui/`: 7 primitives created (button, input, label, textarea, select, card, badge)
- Profile page: Server Component → `getProfile()` → `<ProfileForm>` (Client Component)
  All fields: personal info, locations, salary range, 5 comma-separated array fields
  Server Action `updateProfile()` in `app/(app)/profile/actions.ts`: zod-validated, upserts to `public.profile`
- Resume page: Server Component → `getResumeVersions()` → `<ResumeEditor>` (Client Component)
  Markdown textarea + label input → "Save as new version" (increments version, sets active)
  Version list sidebar with "Set active" button per version
  Server Actions `createResumeVersion()` + `setActiveVersion()` in `app/(app)/resume/actions.ts`

### Infra / Types
- `lib/supabase/types.ts`: generated from linked remote project (511 lines)
- `lib/supabase/queries.ts`: added `ProfileRow` type export + `getResumeVersions()` function
- `package.json` `db:types` script: fixed `--local` → `--linked`
- `bun run build` + `bun run lint`: both clean (zero errors, zero warnings)
- Dev server verified: root → 307 /login, /login → 200 with form

## 2026-06-30 — Phase 1 + 2 complete

### Phase 1: Supabase Setup
- `supabase init` + `supabase link --project-ref hhucioscpdeaoooureua`
- `supabase/migrations/20260630000001_initial_schema.sql`: 6 tables, RLS, pg_cron schedules
  Fixed: `uuid_generate_v4()` → `gen_random_uuid()` (uuid-ossp in extensions schema, not public)
- Migration pushed to live project (verified via `supabase migration list`)
- 4 Edge Functions deployed: job-fetcher, job-scorer, cv-tailor, followup-checker

### Phase 2: Next.js 16 Scaffold
- Full app structure: app/(auth)/login, app/(app)/{dashboard,jobs,applications,resume,profile}
- Next.js 16 specifics: proxy.ts (not middleware.ts), eslint.config.mjs (next lint removed), async params
- `bun run build` + `bun run lint`: both clean
- `.env.local` with real credentials (gitignored)
- Dockerfile (bun multi-stage, standalone output)
