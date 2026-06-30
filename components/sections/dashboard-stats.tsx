'use client'

import { motion } from 'framer-motion'
import { Briefcase, Send, Calendar, MapPin } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/animation-utils'

interface DashboardStatsProps {
  newToday: number
  activeApps: number
  interviews: number
  spainJobs: number
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className={accent ? 'text-primary' : 'text-muted-foreground'}>{icon}</div>
      <div className="mt-2 text-2xl font-semibold text-card-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

export function DashboardStats({ newToday, activeApps, interviews, spainJobs }: DashboardStatsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-4 md:grid-cols-4"
    >
      <motion.div variants={fadeInUp}>
        <StatCard icon={<Briefcase size={20} />} label="Neue Jobs heute" value={newToday} />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <StatCard icon={<Send size={20} />} label="Aktive Bewerbungen" value={activeApps} />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <StatCard icon={<Calendar size={20} />} label="Interviews" value={interviews} />
      </motion.div>
      <motion.div variants={fadeInUp}>
        <StatCard icon={<MapPin size={20} />} label="Spain-Compatible" value={spainJobs} accent />
      </motion.div>
    </motion.div>
  )
}
