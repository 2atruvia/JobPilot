import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Checks applications where follow_up_date = today and follow_up_sent = false
// Updates status to 'ghosted' after 14 days with no response
// Inserts activity_log entries as notification
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const today = new Date().toISOString().split('T')[0]

  // Due follow-ups
  const { data: due } = await supabase
    .from('applications')
    .select('*, jobs(title, company)')
    .eq('follow_up_date', today)
    .eq('follow_up_sent', false)

  for (const app of (due || [])) {
    await supabase.from('activity_log').insert({
      entity_type: 'application',
      entity_id: app.id,
      action: 'follow_up_due',
      details: { company: app.jobs?.company, title: app.jobs?.title }
    })
  }

  // Auto-ghost after 14 days of no response
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString()
  await supabase.from('applications')
    .update({ status: 'ghosted' })
    .eq('status', 'applied')
    .lt('applied_at', twoWeeksAgo)
    .is('response_received_at', null)

  return new Response(JSON.stringify({ checked: due?.length || 0 }))
})
