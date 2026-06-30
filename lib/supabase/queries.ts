import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type ProfileRow = Database['public']['Tables']['profile']['Row']
export type ResumeVersion = Database['public']['Tables']['master_resume']['Row']

export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profile').select('*').maybeSingle()
  return data as ProfileRow | null
}

export async function getDashboardStats() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [newToday, activeApps, interviews, spainJobs] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).gte('discovered_at', today),
    supabase.from('applications').select('id', { count: 'exact', head: true }).not('status', 'in', '(rejected,ghosted)'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'interview_scheduled'),
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('spain_valencia_compatible', true),
  ])

  return {
    newToday: newToday.count ?? 0,
    activeApps: activeApps.count ?? 0,
    interviews: interviews.count ?? 0,
    spainJobs: spainJobs.count ?? 0,
  }
}

export async function getResumeVersions(): Promise<ResumeVersion[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('master_resume')
    .select('*')
    .order('version', { ascending: false })
  return data ?? []
}

export type JobRow = Database['public']['Tables']['jobs']['Row']

export async function getJobs(filters: {
  status?: string
  minScore?: number
  spainOnly?: boolean
} = {}): Promise<JobRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('jobs')
    .select('*')
    .order('relevance_score', { ascending: false, nullsFirst: false })
    .order('discovered_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.minScore && filters.minScore > 0) query = query.gte('relevance_score', filters.minScore)
  if (filters.spainOnly) query = query.eq('spain_valencia_compatible', true)

  const { data } = await query
  return (data ?? []) as JobRow[]
}

export type ApplicationRow = Database['public']['Tables']['applications']['Row']
export type ApplicationWithJob = ApplicationRow & {
  jobs: Pick<JobRow, 'title' | 'company' | 'relevance_score' | 'spain_valencia_compatible'> | null
}

export async function getApplications(): Promise<ApplicationWithJob[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('applications')
    .select('*, jobs(title, company, relevance_score, spain_valencia_compatible)')
    .order('updated_at', { ascending: false })
  return (data ?? []) as ApplicationWithJob[]
}

export async function getActivityLog(limit = 20) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}
