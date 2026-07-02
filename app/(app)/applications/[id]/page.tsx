import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/app/copy-button'
import { ApplicationStatusSelect } from '@/components/app/application-status-select'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: app } = await supabase
    .from('applications')
    .select('*, jobs(id, title, company, relevance_score, spain_valencia_compatible, salary_text, url)')
    .eq('id', id)
    .maybeSingle()

  if (!app) notFound()

  const job = app.jobs as {
    id: string
    title: string
    company: string
    relevance_score: number | null
    spain_valencia_compatible: boolean | null
    salary_text: string | null
    url: string
  } | null

  const score = job?.relevance_score ?? null
  const scoreBadgeClass =
    score === null ? 'text-muted-foreground bg-muted'
    : score >= 8 ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40'
    : score >= 5 ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40'
    : 'text-muted-foreground bg-muted'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back */}
      <Link href="/applications" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Applications
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {score !== null && (
            <span className={`rounded px-2 py-0.5 text-sm font-mono font-semibold ${scoreBadgeClass}`}>
              {score}
            </span>
          )}
          {job?.spain_valencia_compatible && <Badge variant="secondary">🇪🇸 Spain-compatible</Badge>}
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{job?.title ?? 'Application'}</h1>
        {job?.company && job.company !== 'Unknown' && (
          <p className="text-lg text-muted-foreground">{job.company}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {job?.salary_text && <span className="font-mono">💵 {job.salary_text}</span>}
          {job?.url && (
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
              Original posting ↗
            </a>
          )}
          {job?.id && (
            <Link href={`/jobs/${job.id}`} className="text-primary underline underline-offset-4">
              Job details →
            </Link>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <ApplicationStatusSelect applicationId={id} currentStatus={app.status ?? 'draft'} />
      </div>

      {/* Tailored CV */}
      {app.tailored_cv_markdown && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tailored CV</CardTitle>
              <CopyButton text={app.tailored_cv_markdown} label="Copy markdown" />
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed overflow-x-auto bg-muted/30 rounded p-4 max-h-[60vh] overflow-y-auto">
              {app.tailored_cv_markdown}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter */}
      {app.cover_letter_text && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cover Letter</CardTitle>
              <CopyButton text={app.cover_letter_text} label="Copy" />
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed bg-muted/30 rounded p-4">
              {app.cover_letter_text}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* LinkedIn InMail */}
      {app.outreach_linkedin && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">LinkedIn InMail</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {app.outreach_linkedin.length} chars
                </span>
                <CopyButton text={app.outreach_linkedin} label="Copy" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded p-4">
              {app.outreach_linkedin}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cold Email */}
      {app.outreach_email && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cold Email</CardTitle>
              <CopyButton text={app.outreach_email} label="Copy" />
            </div>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed bg-muted/30 rounded p-4">
              {app.outreach_email}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
        <p>Generated with: {app.generation_model ?? '—'}</p>
        <p>Created: {app.created_at ? new Date(app.created_at).toLocaleString() : '—'}</p>
      </div>
    </div>
  )
}
