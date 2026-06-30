# JobPilot — Agent Quick-Reference (Claude Code + Gemini)

> This file is read by ALL agents (Claude Code CLI, Gemini in Antigravity/Canvas, Codex).
> It is a dense look-up table — not narrative. Refer to `CLAUDE.md` for Claude Code workflow rules.

## ⚠️ Framework Warning
This is **Next.js 16** — breaking changes vs 14/15. APIs, routing, and caching conventions
differ from training data. Always check `node_modules/next/dist/docs/` before writing
routing or API code. Heed all deprecation notices. Use `--turbopack` for `next dev`.

## Project
| Key | Value |
|---|---|
| App | JobPilot – Personal Automated Job Search OS |
| Owner | Jungeun Sophia Chu |
| Email | jungechu@gmail.com |
| Location | Munich → Valencia, Spain (in transition) |
| Access | Single-user, whitelist-only auth |
| Repo | Private GitHub, NO Vercel — runs via `next start` or Docker |

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript 5.6 strict, Tailwind CSS 3.4, shadcn/ui |
| Animations | Framer Motion 12 — use `lib/animation-utils.ts` patterns |
| Backend | Supabase PostgreSQL 15 (RLS on ALL tables) |
| AI | Google Gemini via REST — model from `GEMINI_MODEL` env var |
| Default Model | `gemini-2.5-flash-preview` (fallback: `gemini-2.5-flash`) |
| Pkg mgr | `bun` — NEVER npm/yarn/pnpm |
| Deploy | Docker / `next start` — NO Vercel |
| Edge Functions | Supabase Deno Edge Functions |
| Scheduling | `pg_cron` + `pg_net` (in Supabase) |

## Critical Constraints
- `bun` only — no npm, no yarn, no pnpm
- RLS + policies required on EVERY new DB table — in the same migration
- Never edit committed migration files → always new additive migration
- Run `bun run build` before finishing any task — zero tolerance for build errors
- All Gemini calls go through `lib/gemini.ts` — never inline `fetch` to Gemini API
- GEMINI_MODEL env var controls model — never hardcode model name
- Colors: CSS Custom Properties (oklch tokens in globals.css) — no hardcoded hex/rgb
- Every `/api/` route: enforce `getUser()` + email whitelist — no bypass
- Edge Functions: return `503` if required env var is missing

## DB Tables (Supabase PostgreSQL)
profile – Single row: Jungeun's targets, skills, preferences
master_resume – Versioned Markdown resume (is_active flag)
jobs – Discovered jobs: raw data + AI scores
applications – Per-job: tailored CV, cover letter, outreach, status
fetch_runs – Log of every automated job fetch
activity_log – Audit trail: all actions (scored, tailored, applied...)

## Key Columns (jobs)
relevance_score – 1–10 Gemini score (null = not yet scored)
remote_abroad_score – 1–5 confidence Spain-remote is possible
spain_valencia_compatible – boolean | null
is_disqualified – Hard-keyword triggered auto-disqualify
status – new | reviewing | shortlisted | applied |
interview | offer | rejected | skipped

## Key Columns (applications)
status – draft | applied | first_response |
interview_scheduled | technical | final |
offer | rejected | ghosted
tailored_cv_markdown – Gemini-generated tailored resume
cover_letter_text – Gemini-generated cover letter
outreach_linkedin – Max 280 chars InMail
outreach_email – Subject + body cold email
generation_model – Which Gemini model generated this
follow_up_date – Computed follow-up reminder date

## File Map (most-used)
lib/supabase/client.ts – Browser Supabase client
lib/supabase/server.ts – Server Component Supabase client
lib/supabase/middleware.ts – Auth session refresh middleware
lib/supabase/types.ts – Generated types (bun run db:types)
lib/supabase/queries.ts – Shared DB queries (don't modify exports)
lib/gemini.ts – Gemini API wrapper (single source of truth)
lib/animation-utils.ts – Framer Motion variants (stagger, fadeInUp...)
lib/utils.ts – cn(), formatters (salary, date, score)
app/layout.tsx – Root: ThemeProvider, Inter font, auth check
app/(auth)/login/page.tsx – Supabase Auth UI
app/(app)/layout.tsx – Sidebar + main content
app/(app)/dashboard/page.tsx – Stats + Top Jobs + Activity Feed
app/(app)/jobs/page.tsx – Jobs table with filters
app/(app)/jobs/[id]/page.tsx – Job detail + Tailor CTA
app/(app)/applications/page.tsx – Kanban board
app/(app)/resume/page.tsx – Markdown editor + versions
app/(app)/profile/page.tsx – Profile settings
components/app/sidebar.tsx – Navigation sidebar
components/app/tailor-button.tsx – Triggers cv-tailor Edge Function
components/sections/ – Page-level animated sections
components/ui/ – shadcn/ui base components
supabase/migrations/ – Sequential SQL (read-only once committed)
supabase/functions/job-fetcher/ – Daily job discovery
supabase/functions/job-scorer/ – Gemini batch scoring
supabase/functions/cv-tailor/ – Gemini CV + cover letter generation
supabase/functions/followup-checker/ – Auto-ghost + follow-up alerts
.github/workflows/supabase-migrations.yml – Auto-migrate on main push
.github/workflows/keep-alive.yml – Weekly Supabase ping (no pause)
docs/PRD.md – Full PRD (source of truth)

## Patterns (always apply)
- Parallel DB queries in Server Components: `Promise.all([...])`
- Upsert on conflict in Edge Functions: `.upsert({...}, { onConflict: 'url' })`
- Empty result: `maybeSingle()` not `single()` — avoids PGRST116 errors
- Framer Motion: always use variants from `lib/animation-utils.ts` — no inline variants
- Score badges: ≥8 = primary blue, 6–7 = yellow, ≤5 = red (oklch tokens)
- Salary display: monospace font, right-aligned, USD prefix, dash for null
- Edge Function missing env var: `return new Response('Missing env', { status: 503 })`

## Agent Routing Guidance
| Task type | Best agent |
|---|---|
| Multi-file refactor, DB migrations, Edge Functions | Claude Code CLI |
| UI prototyping, Tailwind styling, quick components | Gemini in Canvas |
| Kanban / drag-drop / complex animations | Claude Code CLI |
| Reviewing Gemini prompts / scoring logic | Either |
| Architecture decisions | Claude Code — reference `docs/PRD.md` |

## Living Knowledge
- Patterns log: `LEARNINGS.md` (update every session)
- Current tasks: `TASK_PLAN.md`
- Completed work: `PROGRESS.md`
- Full PRD: `docs/PRD.md`
