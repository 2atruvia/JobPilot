-- Add unique constraint on applications.job_id so cv-tailor upsert works
-- (one application per job — duplicate tailoring overwrites the draft)
alter table public.applications
  add constraint applications_job_id_unique unique (job_id);
