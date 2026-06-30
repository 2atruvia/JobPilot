# JobPilot — Learnings & Patterns
> Updated every session. Claude errors + corrections logged here.

---

## 2026-06-30 — Phase 1-4 Session

### Migration: use gen_random_uuid() not uuid_generate_v4()
Supabase installs `uuid-ossp` into the `extensions` schema, not `public`. Unqualified
`uuid_generate_v4()` fails with SQLSTATE 42883 even though extension reports "already exists".
Fix: use `gen_random_uuid()` (built into Postgres 13+ core, no extension needed).

### @supabase/ssr v0.6.1 type mismatch with supabase-js ^2.50.0 resolved to 2.110.0
`createServerClient<Database>` and `createBrowserClient<Database>` from `@supabase/ssr ^0.6.1`
produce broken type resolution for `.update()` / `.insert()` calls when used with
supabase-js 2.110.0. Root cause: `@supabase/ssr` types use `SchemaName extends string &
keyof Database` but supabase-js 2.110.0's `SupabaseClient` requires
`keyof Omit<Database, '__InternalSupabase'>` — version drift. The mismatch causes `Relation` to
resolve to `never` inside `PostgrestQueryBuilder.update()`, making its argument type `never`.

**Fix:** Do NOT pass `<Database>` generic to `createServerClient`/`createBrowserClient`.
Use explicit return type annotations in queries.ts (`Promise<ProfileRow | null>` etc.)
and import DB row types from `lib/supabase/types.ts` directly in components.

For mutations in Server Actions, the untyped client accepts any object — safe to use since
zod validates all inputs before the Supabase call.

### Next.js 16 breaking changes vs 14/15
- `middleware.ts` → `proxy.ts`, exported function `middleware` → `proxy`
- `next lint` CLI subcommand removed entirely → use `eslint .` with flat config
- `params` in dynamic routes are `Promise<{ id: string }>` — must be `await`ed
- `cookies()` from `next/headers` is async, must be `await`ed

### ESLint flat config for Next.js 16
`eslint-config-next` exports a flat config array directly (ESLint 9).
`eslint.config.mjs`:
```js
import nextConfig from 'eslint-config-next'
const config = [...nextConfig, { ignores: ['supabase/functions/**'] }]
export default config
```
`package.json` lint script: `"lint": "eslint ."` (not `next lint`).

### DB column names must match supabase/migrations — not JobCandidate interface names
Edge Function `JobCandidate` interface fields were named `salary_raw`/`location_raw` but the actual DB columns are `salary_text`/`location_text`. The upsert spread `...job` silently ignored unknown columns. TypeScript in Next.js caught it at build time. Always cross-check interface field names against the migration SQL before writing parsers.

### supabase db:types — use --linked not --local
`bun run db:types` script must use `--linked` when no local Docker stack is running.
Default `--local` requires the local Supabase instance. Change:
`supabase gen types typescript --linked > lib/supabase/types.ts`
Always prefix with `SUPABASE_ACCESS_TOKEN=sbp_...` when a different account's token
is set in shell environment (avoids privilege mismatch).
