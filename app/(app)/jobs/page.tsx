import { Suspense } from 'react'
import { getJobs } from '@/lib/supabase/queries'
import { JobsTable } from '@/components/app/jobs-table'

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams
  const jobs = await getJobs({
    status: params.status,
    minScore: params.minScore ? Number(params.minScore) : undefined,
    spainOnly: params.spain === 'true',
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-scored remote jobs filtered for Valencia, Spain compatibility.
        </p>
      </div>
      <Suspense>
        <JobsTable jobs={jobs} />
      </Suspense>
    </div>
  )
}
