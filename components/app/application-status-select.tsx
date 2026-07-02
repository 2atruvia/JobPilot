'use client'

import { useRouter } from 'next/navigation'
import { updateApplicationStatus } from '@/app/(app)/applications/actions'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'applied', label: 'Applied' },
  { value: 'first_response', label: 'First Response' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'technical', label: 'Technical' },
  { value: 'final', label: 'Final Round' },
  { value: 'offer', label: 'Offer 🎉' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ghosted', label: 'Ghosted' },
]

interface Props {
  applicationId: string
  currentStatus: string
}

export function ApplicationStatusSelect({ applicationId, currentStatus }: Props) {
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateApplicationStatus(applicationId, e.target.value)
    router.refresh()
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
