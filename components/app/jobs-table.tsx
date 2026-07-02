'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { JobRow } from '@/lib/supabase/queries'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface Props {
  jobs: JobRow[]
}

function formatSalary(job: JobRow): string {
  if (job.salary_min_usd) {
    const min = `$${Math.round(job.salary_min_usd / 1000)}k`
    const max = job.salary_max_usd ? ` – $${Math.round(job.salary_max_usd / 1000)}k` : '+'
    return min + max
  }
  return job.salary_text || '–'
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  contract: 'Contract',
  freelance: 'Freelance',
  part_time: 'Part-time',
}

const EMPLOYMENT_COLORS: Record<string, string> = {
  contract: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  freelance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  part_time: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

function EmploymentBadge({ type }: { type: string | null }) {
  if (!type || type === 'full_time') return null
  const label = EMPLOYMENT_LABELS[type] ?? type
  const colors = EMPLOYMENT_COLORS[type] ?? 'bg-muted text-muted-foreground'
  return (
    <span className={`ml-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors}`}>
      {label}
    </span>
  )
}

function ScoreBadge({ score, reasoning }: { score: number | null; reasoning: string | null }) {
  if (score === null) {
    return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-muted">—</span>
  }
  const cls =
    score >= 8
      ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40'
      : score >= 5
      ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40'
      : 'text-muted-foreground bg-muted'
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold cursor-help ${cls}`}
      title={reasoning ?? undefined}
    >
      {score}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'bg-muted text-muted-foreground',
    reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    shortlisted: 'bg-primary/10 text-primary',
    applied: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    skipped: 'bg-muted text-muted-foreground line-through',
  }
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

export function JobsTable({ jobs }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const currentStatus = searchParams.get('status') ?? ''
  const currentMinScore = searchParams.get('minScore') ?? ''
  const currentSpain = searchParams.get('spain') === 'true'
  const currentEmployment = searchParams.get('employment') ?? ''

  const filteredJobs = currentEmployment
    ? jobs.filter((j) => j.employment_type === currentEmployment)
    : jobs

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={currentStatus}
          onChange={(e) => updateParam('status', e.target.value)}
          className="w-36"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="applied">Applied</option>
          <option value="skipped">Skipped</option>
        </Select>

        <Select
          value={currentEmployment}
          onChange={(e) => updateParam('employment', e.target.value)}
          className="w-36"
        >
          <option value="">All types</option>
          <option value="full_time">Full-time</option>
          <option value="contract">Contract</option>
          <option value="freelance">Freelance</option>
          <option value="part_time">Part-time</option>
        </Select>

        <div className="flex items-center gap-1.5">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Min score</label>
          <Input
            type="number"
            min={0}
            max={10}
            value={currentMinScore}
            onChange={(e) => updateParam('minScore', e.target.value)}
            className="w-20"
            placeholder="0"
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={currentSpain}
            onChange={(e) => updateParam('spain', e.target.checked ? 'true' : '')}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-muted-foreground">Spain-compatible only</span>
        </label>

        <span className="ml-auto text-xs text-muted-foreground">{filteredJobs.length} jobs</span>
      </div>

      {/* Table */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No jobs yet. The job-fetcher runs daily at 06:00 UTC — or trigger it manually in the Supabase dashboard.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-12" title="AI relevance score — hover a score to see reasoning">Score</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden md:table-cell">Company</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground hidden lg:table-cell">Salary</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8" title="Spain-compatible">🇪🇸</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden xl:table-cell">Found</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job, i) => (
                <tr
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <td className="px-3 py-2.5" title={job.source ?? undefined}>
                    <ScoreBadge score={job.relevance_score} reasoning={job.score_reasoning} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center flex-wrap gap-y-0.5">
                      <span className="font-medium text-foreground line-clamp-1">{job.title}</span>
                      <EmploymentBadge type={job.employment_type} />
                    </div>
                    <span className="block text-xs text-muted-foreground md:hidden">{job.company}</span>
                  </td>
                  <td className="px-3 py-2.5 hidden md:table-cell text-muted-foreground" title={job.company_source ?? undefined}>
                    {job.company}
                  </td>
                  <td className="px-3 py-2.5 hidden lg:table-cell font-mono text-muted-foreground text-xs text-right">
                    {formatSalary(job)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {job.spain_valencia_compatible ? '✓' : ''}
                  </td>
                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <StatusBadge status={job.status ?? 'new'} />
                  </td>
                  <td className="px-3 py-2.5 hidden xl:table-cell text-xs text-muted-foreground">
                    {job.discovered_at ? new Date(job.discovered_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
