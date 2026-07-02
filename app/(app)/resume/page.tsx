import { getResumeVersions, getProfile } from '@/lib/supabase/queries'
import { ResumeEditor } from '@/components/app/resume-editor'

export default async function ResumePage() {
  const [versions, profile] = await Promise.all([getResumeVersions(), getProfile()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Resume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage versioned Markdown resumes. The active version is used by the AI tailor.
        </p>
      </div>
      <ResumeEditor versions={versions} resumeFileUrl={profile?.resume_file_url ?? null} />
    </div>
  )
}
