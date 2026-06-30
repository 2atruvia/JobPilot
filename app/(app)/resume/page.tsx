import { getResumeVersions } from '@/lib/supabase/queries'
import { ResumeEditor } from '@/components/app/resume-editor'

export default async function ResumePage() {
  const versions = await getResumeVersions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Resume</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage versioned Markdown resumes. The active version is used by the AI tailor.
        </p>
      </div>
      <ResumeEditor versions={versions} />
    </div>
  )
}
