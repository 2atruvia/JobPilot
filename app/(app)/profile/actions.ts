'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  linkedin_url: z.string().url().optional().nullable(),
  current_location: z.string().optional().nullable(),
  target_location: z.string().optional().nullable(),
  target_location_alt: z.string().optional().nullable(),
  remote_policy: z.enum(['work_from_anywhere', 'spain_only']).optional().nullable(),
  nationality: z.string().optional().nullable(),
  target_salary_usd_min: z.number().int().optional().nullable(),
  target_salary_usd_max: z.number().int().optional().nullable(),
  target_roles: z.array(z.string()).optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  blocklist_keywords: z.array(z.string()).optional().nullable(),
  spain_remote_keywords: z.array(z.string()).optional().nullable(),
  job_fetch_tags: z.array(z.string()).optional().nullable(),
})

export type ProfilePayload = z.infer<typeof profileSchema>

export async function updateProfile(data: ProfilePayload, existingId?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const validated = profileSchema.parse(data)
  const base = { ...validated, user_id: user.id, updated_at: new Date().toISOString() }

  if (existingId) {
    const { error } = await supabase.from('profile').update(base).eq('id', existingId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('profile').insert(base)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/profile')
}
