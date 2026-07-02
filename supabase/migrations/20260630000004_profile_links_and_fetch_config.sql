-- Add LinkedIn URL, resume PDF URL, and job fetch tags to profile
alter table public.profile
  add column if not exists linkedin_url text,
  add column if not exists resume_file_url text,
  add column if not exists job_fetch_tags text[] default array['account-manager','marketing','ecommerce','management'];

-- Storage bucket for original resume PDFs
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "auth_all_resumes" on storage.objects
  for all to authenticated
  using (bucket_id = 'resumes')
  with check (bucket_id = 'resumes');
