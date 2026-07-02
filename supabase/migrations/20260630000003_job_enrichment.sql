-- Enrich jobs table with structured metadata extracted by fetcher and scorer
alter table public.jobs
  add column if not exists employment_type text,
  add column if not exists timezone_requirement text,
  add column if not exists experience_years_required integer,
  add column if not exists company_source text;

comment on column public.jobs.employment_type is 'full_time | contract | freelance | part_time';
comment on column public.jobs.timezone_requirement is 'us_only | us_friendly | flexible | any';
comment on column public.jobs.experience_years_required is 'Parsed minimum years of experience from job description';
comment on column public.jobs.company_source is 'api | title_parsed | domain_extracted | ai_extracted — how company name was determined';
