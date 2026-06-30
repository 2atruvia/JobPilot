'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ApplicationWithJob } from '@/lib/supabase/queries'
import { updateApplicationStatus } from '@/app/(app)/applications/actions'

const COLUMNS: { id: string; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'applied', label: 'Applied' },
  { id: 'first_response', label: 'Response' },
  { id: 'interview_scheduled', label: 'Interview' },
  { id: 'offer', label: 'Offer 🎉' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'ghosted', label: 'Ghosted' },
]

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null
  const cls =
    score >= 8
      ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/40'
      : score >= 5
      ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/40'
      : 'text-muted-foreground bg-muted'
  return (
    <span className={`rounded px-1 py-0.5 text-[10px] font-mono font-semibold ${cls}`}>{score}</span>
  )
}

interface Props {
  initialApplications: ApplicationWithJob[]
}

export function KanbanBoard({ initialApplications }: Props) {
  const router = useRouter()
  const [apps, setApps] = useState(initialApplications)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [shortlistOnly, setShortlistOnly] = useState(false)

  const displayApps = shortlistOnly
    ? apps.filter((a) => (a.jobs?.relevance_score ?? 0) >= 7 && a.jobs?.spain_valencia_compatible)
    : apps

  function onDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  async function onDrop(e: React.DragEvent, targetStatus: string) {
    e.preventDefault()
    if (!draggingId) return

    const app = apps.find((a) => a.id === draggingId)
    if (!app || app.status === targetStatus) {
      setDraggingId(null)
      return
    }

    setApps((prev) => prev.map((a) => (a.id === draggingId ? { ...a, status: targetStatus } : a)))
    setDraggingId(null)

    await updateApplicationStatus(draggingId, targetStatus)
    router.refresh()
  }

  const visibleColumns = COLUMNS.filter((col) =>
    displayApps.some((a) => a.status === col.id),
  )
  const columnsToShow = visibleColumns.length > 0 ? visibleColumns : [COLUMNS[0]]

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={shortlistOnly}
            onChange={(e) => setShortlistOnly(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-muted-foreground">Shortlist only (score ≥7 + Spain-compatible)</span>
        </label>
        <span className="ml-auto text-xs text-muted-foreground">{displayApps.length} applications</span>
      </div>

      {/* Kanban columns */}
      {displayApps.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No applications yet. Use &quot;Generate Tailored CV&quot; on a job listing to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnsToShow.length}, minmax(200px, 1fr))` }}>
          {columnsToShow.map((col) => {
            const colApps = displayApps.filter((a) => a.status === col.id)
            return (
              <div
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 min-h-[120px]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {col.label}
                  </h3>
                  {colApps.length > 0 && (
                    <span className="text-xs text-muted-foreground">{colApps.length}</span>
                  )}
                </div>

                {colApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, app.id)}
                    className={`rounded-md border border-border bg-card p-3 cursor-grab active:cursor-grabbing shadow-sm space-y-1.5 transition-opacity ${draggingId === app.id ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                        {app.jobs?.title ?? 'Unknown role'}
                      </p>
                      <ScoreBadge score={app.jobs?.relevance_score ?? null} />
                    </div>
                    <p className="text-xs text-muted-foreground">{app.jobs?.company ?? '—'}</p>
                    {app.applied_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                    )}
                    {app.jobs?.spain_valencia_compatible && (
                      <span className="text-[10px] text-muted-foreground">🇪🇸</span>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
