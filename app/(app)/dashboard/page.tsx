import { getDashboardStats, getActivityLog } from '@/lib/supabase/queries'
import { DashboardStats } from '@/components/sections/dashboard-stats'
import { ActivityFeed } from '@/components/app/activity-feed'

export default async function DashboardPage() {
  const [stats, activityItems] = await Promise.all([
    getDashboardStats(),
    getActivityLog(20),
  ])

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your job search at a glance.</p>
      </div>

      <DashboardStats {...stats} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Activity Feed</h2>
        <ActivityFeed initialItems={activityItems as Parameters<typeof ActivityFeed>[0]['initialItems']} />
      </div>
    </div>
  )
}
