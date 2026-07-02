import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { TailorButton } from '@/components/app/tailor-button'

interface Props {
  params: Promise<{ id: string }>
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  contract: 'Contract',
  freelance: 'Freelance',
  part_time: 'Part-time',
}

const EMPLOYMENT_COLORS: Record<string, string> = {
  full_time: 'bg-muted text-muted-foreground',
  contract: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  freelance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  part_time: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

const TIMEZONE_LABELS: Record<string, string> = {
  us_only: 'US timezone required',
  us_friendly: 'US-friendly hours',
  flexible: 'Flexible timezone',
  any: 'Any timezone',
}

function formatSalary(min: number | null, max: number | null, text: string | null): string | null {
  if (min) {
    const minStr = `$${Math.round(min / 1000)}k`
    const maxStr = max ? ` – $${Math.round(max / 1000)}k` : '+'
    return minStr + maxStr
  }
  return text || null
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: job } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle()

  if (!job) notFound()

  const score = job.relevance_score
  const scoreBadgeClass =
    score === null
      ? 'text-muted-foreground bg-muted'
      : score >= 8
      ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40'
      : score >= 5
      ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40'
      : 'text-muted-foreground bg-muted'

  const salaryDisplay = formatSalary(job.salary_min_usd, job.salary_max_usd, job.salary_text)
  const isCompanyInferred = job.company_source === 'ai_extracted' || job.company_source === 'domain_extracted'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back */}
      <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Jobs
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-sm font-mono font-semibold ${scoreBadgeClass}`}
            title={job.score_reasoning ?? undefined}
          >
            {score !== null ? score : '—'}
          </span>
          {job.employment_type && (
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${EMPLOYMENT_COLORS[job.employment_type] ?? 'bg-muted text-muted-foreground'}`}>
              {EMPLOYMENT_LABELS[job.employment_type] ?? job.employment_type}
            </span>
          )}
          {job.spain_valencia_compatible && (
            <Badge variant="secondary">🇪🇸 Spain-compatible</Badge>
          )}
          {job.salary_fit && (
            <Badge variant="secondary">💰 Salary fit</Badge>
          )}
          {job.is_disqualified && (
            <Badge variant="destructive">Disqualified</Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{job.title}</h1>
        <p className="text-lg text-muted-foreground">
          {job.company}
          {isCompanyInferred && (
            <span className="ml-1.5 text-xs text-muted-foreground/60 font-normal">(inferred)</span>
          )}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location_text && (
            <span>📍 {job.location_text}</span>
          )}
          {salaryDisplay && (
            <span className="font-mono">💵 {salaryDisplay}</span>
          )}
          {job.timezone_requirement && TIMEZONE_LABELS[job.timezone_requirement] && (
            <span>🕐 {TIMEZONE_LABELS[job.timezone_requirement]}</span>
          )}
          {job.experience_years_required && (
            <span>🎯 {job.experience_years_required}+ years required</span>
          )}
          {job.source && <span>Source: {job.source}</span>}
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm text-primary underline underline-offset-4"
        >
          View original posting ↗
        </a>
      </div>

      {/* AI Score reasoning */}
      {job.score_reasoning && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">AI Assessment</h2>
          <p className="text-sm text-muted-foreground">{job.score_reasoning}</p>
          {job.disqualify_reason && (
            <p className="text-sm text-destructive">Disqualified: {job.disqualify_reason}</p>
          )}
          {job.matched_keywords && job.matched_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {job.matched_keywords.map((kw: string) => (
                <span key={kw} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tailor CTA */}
      {!job.is_disqualified && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Generate Application Materials</h2>
          <p className="text-xs text-muted-foreground">
            Gemini will tailor your active resume + write a cover letter, LinkedIn InMail, and cold email for this role.
            Requires an active resume in <Link href="/resume" className="underline underline-offset-4">Resume</Link>.
          </p>
          <TailorButton jobId={job.id} />
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Job Description</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed overflow-x-auto">
            {job.description_raw ?? 'No description available.'}
          </pre>
        </div>
      </div>
    </div>
  )
}
