import { getApplications } from '@/lib/supabase/queries'
import { KanbanBoard } from '@/components/app/kanban-board'

export default async function ApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag cards between columns to update application status.
        </p>
      </div>
      <KanbanBoard initialApplications={applications} />
    </div>
  )
}
