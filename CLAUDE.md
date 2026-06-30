# JobPilot — Claude Code Session Context

> AI Teammate Onboarding — nicht README für Menschen. Jede Zeile verdient ihren Platz.
> Lese `AGENTS.md` für das Projekt-LUT. Lese `LEARNINGS.md` vor jedem Task.
> Update `LEARNINGS.md` am Session-Ende.

@.claude/rules/git-conventions.md
@.claude/rules/security-rules.md
@.claude/rules/architecture.md
@.claude/rules/nextjs.md
@.claude/rules/supabase.md
@.claude/rules/gemini.md

---

## WHAT — Projekt-Kontext

**Purpose:** Persönliche, KI-gestützte Job-Search-Automatisierungs-App für Jungeun Sophia Chu —
eine US-Bürgerin, die in Valencia, Spanien leben und remote für US-Unternehmen arbeiten möchte.
Die App automatisiert Job-Discovery, KI-Scoring, CV-Tailoring und Bewerbungs-Tracking.

**Tech Stack:**
- Runtime: Bun (package manager + runtime) — **NIEMALS npm, yarn oder pnpm**
- Framework: Next.js 16 (App Router, Turbopack) — **Breaking Changes vs 14/15 — lies `node_modules/next/dist/docs/`**
- Language: TypeScript 5.6 strict — `any` verboten, `// @ts-ignore` verboten
- DB: Supabase PostgreSQL 15, RLS auf JEDER Tabelle
- UI: React 19, Tailwind CSS 3.4, shadcn/ui, lucide-react, Framer Motion 12
- AI: Google Gemini REST API — Modell immer via `process.env.GEMINI_MODEL`
- Deployment: Docker / `next start` — **KEIN Vercel**
- Edge Functions: Supabase Deno Runtime

**Repo-Struktur:**
```
app/(auth)/ → Login (Supabase Auth UI)
app/(app)/ → Dashboard, Jobs, Applications, Resume, Profile
app/api/ → Webhooks, ggf. Server Actions
components/sections/ → Animated page sections (Framer Motion)
components/app/ → Feature-spezifische Komponenten
components/ui/ → shadcn/ui base components
lib/ → Supabase clients, Gemini wrapper, utils, animation-utils
supabase/migrations/ → Sequentielle SQL (NIEMALS alte bearbeiten)
supabase/functions/ → Edge Functions (job-fetcher, job-scorer, cv-tailor, followup-checker)
.claude/commands/ → Slash Commands (/project:*)
.claude/rules/ → Pfad-scoped Context (auto-geladen)
docs/ → PRD, Architecture (bei Bedarf referenzieren)
.github/workflows/ → Migrations CI + Keep-Alive
```

**Kritische Dependencies:**
- `@supabase/ssr` ^0.6 + `@supabase/supabase-js` ^2.50 — DB + Auth (SSR-safe)
- `next` ^16.1 — Router, Server Components, API Routes
- `framer-motion` ^12 — Animationen (IMMER via `lib/animation-utils.ts`)
- `next-themes` ^0.4 — Dark/Light Mode
- `lucide-react` ^0.460 — Icons
- `react-hook-form` + `zod` — alle Formulare mit Validation

**Key DB-Tabellen:**
`profile`, `master_resume`, `jobs`, `applications`, `fetch_runs`, `activity_log`

**Key Edge Functions:**
`job-fetcher` (täglich 06:00 UTC), `job-scorer` (nach fetch, batch 15 Jobs),
`cv-tailor` (on-demand), `followup-checker` (täglich 07:00 UTC)

---

## WHY — Architektur-Prinzipien

**Entscheidungen:**
- Server Components fetchen Supabase-Daten direkt — KEIN client-side fetch für initial load
- `"use client"` nur für: Hooks, Event Handler, Kanban-Interaktivität, Framer Motion
- Jede `/api/`-Route: `getUser()` + Email-Whitelist `jungechu@gmail.com` — IMMER, kein Bypass
- RLS auf jeder neuen Tabelle — Policies in derselben Migration
- `bun` als einziger Package Manager — kein Lock-file Mix
- Alle Gemini-Calls gehen durch `lib/gemini.ts` — keine inline fetch-Aufrufe zu Gemini
- `GEMINI_MODEL` env var steuert das Modell — nie im Code hardcoden
- Kein Vercel — App läuft via Docker oder `bun run start`

**Code-Style:**
- Variablen: `camelCase` | Komponenten/Klassen: `PascalCase` | Konstanten: `SCREAMING_SNAKE_CASE`
- MUST: TypeScript strict | MUST NOT: `any`, `// @ts-ignore`
- MUST: Funktionale Komponenten | MUST NOT: Class Components
- Salary-Werte: `font-mono`, rechts-aligned, USD-Prefix, Dash für null
- Score-Badges: oklch Design-Tokens — niemals Hex hardcoden
- Animationen: IMMER Variants aus `lib/animation-utils.ts` — niemals Inline-Variants

**Anti-Patterns (NEVER DO):**
- NEVER direkt auf `main` committen
- NEVER `console.log` in Produktionscode
- NEVER Credentials oder API Keys in Code oder Git
- NEVER `rm -rf` ohne explizite Bestätigung
- NEVER alte `supabase/migrations/` Dateien bearbeiten
- NEVER `lib/supabase/queries.ts` Exports modifizieren — nur neue Helpers hinzufügen
- NEVER `lib/gemini.ts` Exports modifizieren — nur neue Prompt-Funktionen hinzufügen
- NEVER `npm install`, `yarn add` oder `pnpm add` — immer `bun add`
- NEVER das Gemini-Modell hardcoden — immer `process.env.GEMINI_MODEL`

**Auth & Security:**
- Supabase Auth (Email/Password + ggf. Google OAuth)
- Whitelist: `jungechu@gmail.com` (client + server enforced)
- Inactivity auto-logout: 30 min (Single-user App, aber Laptop-Schutz)
- Edge Functions: `503` wenn required Env Var fehlt
- RLS: jede Tabelle hat `auth_all` Policy — `auth.role() = 'authenticated'`

---

## HOW — Operationale Workflows

**Build & Verify (nach JEDER Änderung):**
```bash
bun run build    # MUSS grün sein — kein Task ist "done" ohne Build-Pass
bun run lint     # ESLint 9 + Next.js config
```

**Supabase lokal testen:**
```bash
supabase start           # Lokale Supabase-Instanz
supabase functions serve # Edge Functions lokal
```

**DB Types generieren (nach Migration):**
```bash
bun run db:types   # → lib/supabase/types.ts
```

**Edge Function deployen:**
```bash
supabase functions deploy job-fetcher
supabase functions deploy job-scorer
supabase functions deploy cv-tailor
supabase functions deploy followup-checker
```

**Git-Workflow:**
- ALWAYS: Neuen Branch per Task (`feat/`, `fix/`, `refactor/`, `docs/`)
- ALWAYS: Conventional Commits — `feat(scope): kurze beschreibung`
- NEVER: direkt auf `main` pushen

**Supabase-Migrationen:**
- Immer neue sequentielle Migration: `YYYYMMDDNNNNNN_feature_name.sql`
- `ADD COLUMN IF NOT EXISTS` für additive Änderungen
- `ALTER TABLE x ENABLE ROW LEVEL SECURITY` + Policies in derselben Migration
- pg_cron Jobs: in Migration definieren, in `fetch_runs` loggen

**Slash Commands:**
| Command | Zweck |
|---|---|
| `/project:session-summary` | Session-Ende: LEARNINGS + Commit-Message generieren |
| `/project:new-migration` | Neue Supabase-Migration mit RLS scaffolden |
| `/project:rls-check` | RLS-Policy-Audit über alle Tabellen |
| `/project:new-component` | Neues `components/app/` Component mit Framer Motion scaffolden |
| `/project:new-edge-function` | Neue Supabase Edge Function mit Error-Handling scaffolden |
| `/project:tailor-job` | CV-Tailor für Job-ID manuell triggern |
| `/project:score-batch` | Job-Scorer manuell für alle unscored Jobs triggern |

**Plan Mode (bei Tasks mit 3+ Schritten):**
- IMMER Plan Mode nutzen — warte auf Approval bevor Ausführung
- Subagent für Research-Tasks spawnen → Main Context sauber halten

**Wenn unsicher:**
1. Lese zuerst die relevante Datei komplett
2. Schlage vor — frage nicht nach Erlaubnis für WHAT, sondern für HOW
3. Führe `bun run build` aus, bevor du "done" meldest

---

## COMPOUND ENGINEERING

Jedes Mal wenn Claude einen Fehler macht und korrigiert wird → `LEARNINGS.md` updaten.

Gemini-Prompt-Änderungen immer mit vorher/nachher und Begründung in `LEARNINGS.md` dokumentieren.

**Aktueller Status:**
- `TASK_PLAN.md` — priorisierte nächste Schritte
- `PROGRESS.md` — abgeschlossene Arbeit
