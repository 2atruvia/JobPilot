import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WHITELISTED_EMAIL = 'jungechu@gmail.com'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== WHITELISTED_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { job_id } = body
  if (!job_id) {
    return NextResponse.json({ error: 'job_id required' }, { status: 400 })
  }

  const { data, error } = await supabase.functions.invoke('cv-tailor', {
    body: { job_id },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
