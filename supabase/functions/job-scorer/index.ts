import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash'
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async () => {
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), { status: 503 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .is('relevance_score', null)
    .eq('is_disqualified', false)
    .order('discovered_at', { ascending: false })
    .limit(15)

  if (!jobs?.length) return new Response(JSON.stringify({ scored: 0, reason: 'no jobs to score' }))

  const { data: profile } = await supabase.from('profile').select('*').maybeSingle()
  if (!profile) {
    return new Response(JSON.stringify({ scored: 0, reason: 'no profile set up yet' }))
  }

  let scored = 0
  for (const job of jobs) {
    const prompt = buildScoringPrompt(job, profile)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    const data = await response.json()
    // Gemini 2.5 Flash Preview returns thinking tokens in parts[0] (thought: true)
    // and the actual response in the last non-thought part
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const text = (parts.find((p: { thought?: boolean; text?: string }) => !p.thought)?.text)
      ?? parts[parts.length - 1]?.text

    try {
      const result = JSON.parse(text)
      await supabase.from('jobs').update({
        relevance_score: result.score,
        score_reasoning: result.reasoning,
        spain_valencia_compatible: result.spain_compatible,
        matched_keywords: result.matched_keywords,
        salary_fit: result.salary_fit,
        is_disqualified: result.disqualified,
        disqualify_reason: result.disqualify_reason,
        scored_at: new Date().toISOString(),
      }).eq('id', job.id)
      scored++
    } catch (e) {
      await supabase.from('activity_log').insert({
        entity_type: 'job',
        entity_id: job.id,
        action: 'scoring_failed',
        details: { error: e instanceof Error ? e.message : String(e), raw: text?.slice(0, 200) },
      })
    }
  }

  return new Response(JSON.stringify({ scored }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// deno-lint-ignore no-explicit-any
function buildScoringPrompt(job: any, profile: any): string {
  return `
You are evaluating a job for ${profile.full_name ?? 'a candidate'}, a trilingual (English/Korean/German)
e-commerce professional. She is a US citizen planning to live in Valencia, Spain,
and REQUIRES the ability to work remotely from Spain (or anywhere outside the US).

## Candidate Profile
- Current role: Key Account Manager at Amazon EU, Munich
- Experience: Pan-EU markets, $40MM+ GMS portfolio, 11 countries, C-level relationships
- Education: Master's in Digital Business (EU Business School)
- Skills: ${(profile.skills ?? []).join(', ')}
- Target salary: $${profile.target_salary_usd_min ?? '?'}–$${profile.target_salary_usd_max ?? '?'} USD/year
- Target roles: ${(profile.target_roles ?? []).join(', ')}

## Job Posting
Title: ${job.title}
Company: ${job.company}
Location: ${job.location_text ?? job.location_raw ?? 'Not specified'}
Salary: ${job.salary_text ?? job.salary_raw ?? 'Not specified'}
Description:
${(job.description_raw ?? '').slice(0, 2500) || 'No description'}

## Scoring Criteria
Score 1–10:
- 9–10: Perfect match, remote-from-Spain confirmed, strong profile alignment
- 7–8: Good match, likely remote-from-anywhere, solid role fit
- 5–6: Partial match or unclear remote policy
- 1–4: Poor match or US-location required

## DISQUALIFY if any of these appear:
${(profile.blocklist_keywords ?? []).map((k: string) => `- "${k}"`).join('\n') || '- (no blocklist set)'}

## Return ONLY valid JSON:
{
  "score": <1-10>,
  "spain_compatible": <true|false|null>,
  "salary_fit": <true|false|null>,
  "reasoning": "<2 sentences explaining the score>",
  "matched_keywords": ["keyword1", "keyword2"],
  "disqualified": <true|false>,
  "disqualify_reason": "<null or reason>"
}
`
}
