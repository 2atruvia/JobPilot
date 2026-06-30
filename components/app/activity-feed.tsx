'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { fadeInUp, staggerContainer } from '@/lib/animation-utils'

const ACTION_LABELS: Record<string, string> = {
  tailored: 'CV tailored',
  scoring_failed: 'Scoring failed',
  tailor_failed: 'Tailoring failed',
  follow_up_due: 'Follow-up due',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return rtf.format(-Math.round(diff / 60_000), 'minute')
  if (diff < 86_400_000) return rtf.format(-Math.round(diff / 3_600_000), 'hour')
  return rtf.format(-Math.round(diff / 86_400_000), 'day')
}

interface ActivityItem {
  id: string
  action: string
  entity_type: string | null
  details: Record<string, string> | null
  created_at: string
}

interface Props {
  initialItems: ActivityItem[]
}

export function ActivityFeed({ initialItems }: Props) {
  const [items, setItems] = useState<ActivityItem[]>(initialItems)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload) => {
          setItems((prev) => [payload.new as ActivityItem, ...prev].slice(0, 20))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">No activity yet. Run the job-fetcher to start.</p>
      </div>
    )
  }

  return (
    <motion.ul
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-2"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const label = ACTION_LABELS[item.action] ?? item.action
          const detail = item.details?.job_title
            ? `${item.details.job_title} @ ${item.details.company ?? ''}`
            : item.details?.error
            ? item.details.error
            : item.entity_type ?? ''

          return (
            <motion.li
              key={item.id}
              variants={fadeInUp}
              layout
              className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground font-medium">{label}</p>
                {detail && <p className="text-xs text-muted-foreground truncate">{detail}</p>}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                {relativeTime(item.created_at)}
              </time>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </motion.ul>
  )
}
