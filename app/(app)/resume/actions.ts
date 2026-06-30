'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createResumeVersion(contentMarkdown: string, label: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('master_resume')
    .select('version')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextVersion = (existing?.version ?? 0) + 1

  await supabase
    .from('master_resume')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000')

  const { error } = await supabase.from('master_resume').insert({
    content_markdown: contentMarkdown,
    label: label || null,
    version: nextVersion,
    is_active: true,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/resume')
}

export async function setActiveVersion(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await supabase
    .from('master_resume')
    .update({ is_active: false })
    .neq('id', id)

  const { error } = await supabase.from('master_resume').update({ is_active: true }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/resume')
}
