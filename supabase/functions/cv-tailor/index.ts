import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), { status: 503 })
  }

  const { job_id } = await req.json()
  if (!job_id) {
    return new Response(JSON.stringify({ error: 'job_id required' }), { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const [{ data: job }, { data: resume }, { data: profile }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', job_id).maybeSingle(),
    supabase.from('master_resume').select('*').eq('is_active', true).maybeSingle(),
    supabase.from('profile').select('*').maybeSingle(),
  ])

  if (!job) return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 })
  if (!resume) return new Response(JSON.stringify({ error: 'No active resume — add one in /resume first' }), { status: 400 })
  if (!profile) return new Response(JSON.stringify({ error: 'No profile set up — complete /profile first' }), { status: 400 })

  const prompt = `
You are a professional resume writer for senior e-commerce and account management roles.

## Master Resume (Markdown)
${resume.content_markdown}

## Target Job
Title: ${job.title}
Company: ${job.company}
Description:
${(job.description_raw ?? '').slice(0, 3000)}

## Candidate Context
- US citizen moving to Valencia, Spain
- Needs to communicate remote-from-abroad capability confidently
- Trilingual: English (native), Korean (native), German (C1)

## Deliverables

### 1. TAILORED_CV
Rewrite the resume for THIS role. Rules:
- ATS-optimized: mirror keywords from JD naturally
- Lead with strongest Amazon/Pan-EU achievement
- Add subtle "Remote-Ready" framing (e.g. "proven remote collaboration across 11 countries")
- 1 page, ~600 words
- Keep all facts true; only reframe and reorder

### 2. COVER_LETTER
3 tight paragraphs:
- P1: Specific hook about ${job.company}'s product/market (1-2 sentences)
- P2: Single strongest achievement with €/$ metric
- P3: Remote setup + Spain base + call to action

### 3. LINKEDIN_INMAIL
Max 280 characters. Hook with one metric. Mention remote availability.

### 4. COLD_EMAIL
Subject line + 4-sentence body. Professional, direct, no fluff.

Return ONLY valid JSON:
{
  "tailored_cv_markdown": "...",
  "cover_letter_text": "...",
  "outreach_linkedin": "...",
  "outreach_email": "Subject: ...\\n\\n<body>"
}
`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    },
  )

  const geminiData = await response.json()
  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

  let result
  try {
    result = JSON.parse(text)
  } catch (e) {
    await supabase.from('activity_log').insert({
      entity_type: 'job',
      entity_id: job_id,
      action: 'tailor_failed',
      details: { error: e instanceof Error ? e.message : String(e), raw: text?.slice(0, 200) },
    })
    return new Response(JSON.stringify({ error: 'Failed to parse Gemini response' }), { status: 500 })
  }

  const { data: application } = await supabase
    .from('applications')
    .upsert(
      {
        job_id,
        ...result,
        generation_model: GEMINI_MODEL,
        status: 'draft',
      },
      { onConflict: 'job_id' },
    )
    .select()
    .single()

  await supabase.from('jobs').update({ status: 'reviewing' }).eq('id', job_id)

  await supabase.from('activity_log').insert({
    entity_type: 'application',
    entity_id: application?.id,
    action: 'tailored',
    details: { model: GEMINI_MODEL, job_title: job.title, company: job.company },
  })

  return new Response(JSON.stringify({ application_id: application?.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
