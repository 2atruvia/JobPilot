-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "pg_cron" with schema "pg_catalog";
create extension if not exists "pg_net";

-- ============================================
-- TABLE: profile
-- Single-row user profile for Jungeun
-- ============================================
create table public.profile (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users(id) on delete cascade,
  full_name                 text not null default 'Jungeun Sophia Chu',
  email                     text not null default 'jungechu@gmail.com',
  current_location          text default 'Munich, Germany',
  target_location           text default 'Valencia, Spain',   -- Präferenz
  target_location_alt       text default 'Spain',             -- Fallback
  remote_policy             text default 'work_from_anywhere', -- work_from_anywhere | spain_only
  nationality               text default 'US Citizen',
  target_roles              text[] default array['Account Manager','Marketplace Manager','Strategic Partnerships Manager','E-Commerce Director','Business Development Manager'],
  target_salary_usd_min     integer default 80000,
  target_salary_usd_max     integer default 130000,
  languages                 text[] default array['English','Korean','German'],
  skills                    text[] default array['Account Management','P&L Ownership','Joint Business Planning','Marketplace Operation','International Expansion','Amazon KAM','Pan-EU'],
  blocklist_keywords        text[] default array['US only','must be located','clearance required','in-office required','no international','W2 US-based only'],
  spain_remote_keywords     text[] default array['work from anywhere','location independent','fully remote','remote worldwide','distributed team','async-first','global team'],
  updated_at                timestamptz default now()
);

-- ============================================
-- TABLE: master_resume
-- Versioned Markdown resume for AI tailoring
-- ============================================
create table public.master_resume (
  id               uuid primary key default gen_random_uuid(),
  content_markdown text not null,
  version          integer default 1,
  is_active        boolean default true,
  label            text,               -- e.g. "Account Manager Focus", "BD Focus"
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================
-- TABLE: jobs
-- Discovered via automated RSS/API fetching
-- ============================================
create table public.jobs (
  id                          uuid primary key default gen_random_uuid(),

  -- Raw data
  title                       text not null,
  company                     text not null,
  url                         text unique not null,
  description_raw             text,
  description_cleaned         text,     -- Stripped HTML
  source                      text,     -- remoteok | workingnomads | realworkfromanywhere | linkedin_rss | weworkremotely
  location_text               text,     -- Original location string from posting
  salary_text                 text,     -- Raw salary string
  salary_min_usd              integer,  -- Parsed
  salary_max_usd              integer,  -- Parsed
  posted_at                   timestamptz,
  discovered_at               timestamptz default now(),

  -- AI Scoring (Gemini)
  relevance_score             integer,         -- 1–10, null = not yet scored
  remote_abroad_score         integer,         -- 1–5: how confident remote-from-Spain is possible
  spain_valencia_compatible   boolean,         -- Explicit work-from-Spain confirmed
  score_reasoning             text,            -- AI explanation (2-3 sentences)
  matched_keywords            text[],          -- Keywords from JD matching profile
  salary_fit                  boolean,         -- Within target range?
  scored_at                   timestamptz,

  -- Qualification
  is_disqualified             boolean default false,
  disqualify_reason           text,
  is_duplicate                boolean default false,

  -- Status (user-controlled)
  status                      text default 'new',
  -- new | reviewing | shortlisted | applied | interview | offer | rejected | skipped

  created_at                  timestamptz default now()
);

create index idx_jobs_status on public.jobs(status);
create index idx_jobs_score on public.jobs(relevance_score desc);
create index idx_jobs_discovered on public.jobs(discovered_at desc);
create index idx_jobs_source on public.jobs(source);

-- ============================================
-- TABLE: applications
-- One row per active application
-- ============================================
create table public.applications (
  id                      uuid primary key default gen_random_uuid(),
  job_id                  uuid references public.jobs(id) on delete cascade,

  -- AI-generated assets
  tailored_cv_markdown    text,
  cover_letter_text       text,
  outreach_linkedin       text,   -- InMail text (300 chars max)
  outreach_email          text,   -- Cold email body
  cv_pdf_url              text,   -- Supabase Storage URL
  generation_model        text,   -- Which Gemini model was used

  -- Application tracking
  status                  text default 'draft',
  -- draft | applied | first_response | interview_scheduled | technical | final | offer | rejected | ghosted
  applied_at              timestamptz,
  response_received_at    timestamptz,
  interview_date          timestamptz,
  follow_up_date          date,
  follow_up_sent          boolean default false,

  -- Contact info
  recruiter_name          text,
  recruiter_email         text,
  recruiter_linkedin      text,
  hiring_manager_name     text,

  -- Notes & feedback
  notes                   text,
  rejection_reason        text,
  salary_offered          integer,

  -- Meta
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index idx_applications_status on public.applications(status);
create index idx_applications_follow_up on public.applications(follow_up_date);

-- ============================================
-- TABLE: fetch_runs
-- Log every automated job fetch
-- ============================================
create table public.fetch_runs (
  id              uuid primary key default gen_random_uuid(),
  source          text,
  jobs_found      integer default 0,
  jobs_new        integer default 0,
  jobs_duplicate  integer default 0,
  status          text,   -- success | error
  error_message   text,
  duration_ms     integer,
  ran_at          timestamptz default now()
);

-- ============================================
-- TABLE: activity_log
-- Audit trail for all app actions
-- ============================================
create table public.activity_log (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text,   -- job | application | fetch_run | resume
  entity_id    uuid,
  action       text,   -- created | scored | tailored | applied | status_changed
  old_value    text,
  new_value    text,
  details      jsonb,
  created_at   timestamptz default now()
);

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.profile enable row level security;
alter table public.master_resume enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.fetch_runs enable row level security;
alter table public.activity_log enable row level security;

-- Allow all authenticated users (single-user app)
do $$
declare
  t text;
begin
  foreach t in array array['profile','master_resume','jobs','applications','fetch_runs','activity_log']
  loop
    execute format('create policy "auth_all" on public.%I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t);
  end loop;
end $$;

-- ============================================
-- AUTOMATED SCHEDULING (pg_cron)
-- ============================================

-- Job fetcher: täglich 06:00 UTC (= 08:00 CEST, 09:00 Spanien Sommer)
select cron.schedule(
  'jobpilot-fetch-daily',
  '0 6 * * *',
  $$
  select net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/job-fetcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Follow-up reminders: täglich 07:00 UTC
select cron.schedule(
  'jobpilot-followup-check',
  '0 7 * * *',
  $$
  select net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/followup-checker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
