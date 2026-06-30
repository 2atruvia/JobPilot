import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface JobCandidate {
  title: string
  company: string
  url: string
  description_raw?: string
  location_text?: string
  salary_text?: string
  posted_at?: string
}

const SOURCES = [
  {
    name: 'remoteok',
    url: 'https://remoteok.com/api?tags=account-manager,marketing,ecommerce',
    parser: 'remoteok_json',
  },
  {
    name: 'workingnomads',
    url: 'https://www.workingnomads.com/api/exposed_jobs/?category=management&category=marketing',
    parser: 'workingnomads_json',
  },
  {
    name: 'realworkfromanywhere',
    url: 'https://www.realworkfromanywhere.com/jobs.json',
    parser: 'generic_json',
  },
  {
    name: 'weworkremotely',
    url: 'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
    parser: 'rss_xml',
  },
  {
    name: 'jobicy',
    url: 'https://jobicy.com/api/v2/remote-jobs?count=20&tag=account-manager,marketing,ecommerce',
    parser: 'jobicy_json',
  },
]

const HARD_DISQUALIFIERS = [
  'must be located in', 'us citizens only in us', 'requires clearance',
  'in-office required', 'on-site only', 'relocation required',
  'must reside in', 'us-based only', 'cannot work outside us',
]

const REMOTE_ABROAD_SIGNALS = [
  'work from anywhere', 'location independent', 'fully remote',
  'remote worldwide', 'distributed team', 'async', 'global team',
  'anywhere in the world', 'no location restrictions',
]

// --- Parsers ---

// deno-lint-ignore no-explicit-any
function parseRemoteOK(data: any[]): JobCandidate[] {
  // Element 0 is a metadata/legal notice object — skip it
  // deno-lint-ignore no-explicit-any
  return data.slice(1).map((j: any) => ({
    title: j.position ?? j.title ?? '',
    company: j.company ?? '',
    url: j.url ?? `https://remoteok.com/l/${j.slug ?? ''}`,
    description_raw: j.description ?? '',
    location_text: j.location ?? '',
    salary_text: j.salary ?? '',
    posted_at: j.date ?? '',
  })).filter((j: JobCandidate) => j.title && j.url)
}

// deno-lint-ignore no-explicit-any
function parseWorkingNomads(data: any[]): JobCandidate[] {
  // deno-lint-ignore no-explicit-any
  return data.map((j: any) => ({
    title: j.title ?? '',
    company: j.company_name ?? '',
    url: j.url ?? '',
    description_raw: j.description ?? '',
    location_text: j.location ?? '',
    salary_text: j.salary_from && j.salary_to
      ? `$${j.salary_from}–$${j.salary_to}`
      : (j.salary_from ? `$${j.salary_from}+` : ''),
    posted_at: j.pub_date ?? '',
  })).filter((j: JobCandidate) => j.title && j.url)
}

// deno-lint-ignore no-explicit-any
function parseGenericJson(data: any): JobCandidate[] {
  // deno-lint-ignore no-explicit-any
  const items: any[] = Array.isArray(data) ? data : (data.jobs ?? [])
  // deno-lint-ignore no-explicit-any
  return items.map((j: any) => ({
    title: j.title ?? j.job_title ?? '',
    company: j.company ?? j.company_name ?? '',
    url: j.url ?? j.link ?? '',
    description_raw: j.description ?? j.job_description ?? '',
    location_text: j.location ?? j.candidate_required_location ?? '',
    salary_text: j.salary ?? '',
    posted_at: j.date ?? j.publication_date ?? j.pub_date ?? '',
  })).filter((j: JobCandidate) => j.title && j.url)
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(
    new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'),
  )
  return m?.[1]?.trim() ?? ''
}

function parseRssXml(xml: string): JobCandidate[] {
  return xml
    .split('<item>')
    .slice(1)
    .map((item) => ({
      title: extractTag(item, 'title'),
      company: extractTag(item, 'author') || extractTag(item, 'dc:creator') || 'Unknown',
      url: extractTag(item, 'link') || extractTag(item, 'guid'),
      description_raw: extractTag(item, 'description'),
      posted_at: extractTag(item, 'pubDate'),
    }))
    .filter((j) => !!j.url && !!j.title)
}

// deno-lint-ignore no-explicit-any
function parseJobicy(data: any): JobCandidate[] {
  const items = data.jobs ?? []
  // deno-lint-ignore no-explicit-any
  return items.map((j: any) => ({
    title: j.job_title ?? '',
    company: j.company_name ?? '',
    url: j.url ?? j.job_link ?? '',
    description_raw: j.job_description ?? '',
    location_text: j.candidate_required_location ?? '',
    salary_text: j.salary ?? '',
    posted_at: j.publication_date ?? '',
  })).filter((j: JobCandidate) => j.title && j.url)
}

// --- Source dispatcher ---

async function fetchSource(source: typeof SOURCES[number]): Promise<JobCandidate[]> {
  const res = await fetch(source.url, {
    headers: { 'User-Agent': 'JobPilot/1.0 (job search automation)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${source.url}`)

  switch (source.parser) {
    case 'remoteok_json':
      return parseRemoteOK(await res.json())
    case 'workingnomads_json':
      return parseWorkingNomads(await res.json())
    case 'generic_json':
      return parseGenericJson(await res.json())
    case 'rss_xml':
      return parseRssXml(await res.text())
    case 'jobicy_json':
      return parseJobicy(await res.json())
    default:
      return []
  }
}

// --- Main handler ---

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const results = { total: 0, new: 0, duplicate: 0, errors: [] as string[] }

  for (const source of SOURCES) {
    let jobs: JobCandidate[] = []
    try {
      jobs = await fetchSource(source)

      for (const job of jobs) {
        const descLower = (job.description_raw ?? '').toLowerCase()
        const isDisqualified = HARD_DISQUALIFIERS.some((kw) => descLower.includes(kw))
        const remoteAbroadScore = REMOTE_ABROAD_SIGNALS.filter((s) => descLower.includes(s)).length

        const { error } = await supabase
          .from('jobs')
          .upsert(
            {
              ...job,
              source: source.name,
              is_disqualified: isDisqualified,
              disqualify_reason: isDisqualified ? 'Hard disqualifier keyword found' : null,
              remote_abroad_score: Math.min(remoteAbroadScore, 5),
              spain_valencia_compatible: remoteAbroadScore >= 2,
            },
            { onConflict: 'url', ignoreDuplicates: true },
          )

        if (error?.code === '23505') results.duplicate++
        else if (!error) results.new++
        results.total++
      }

      await supabase.from('fetch_runs').insert({
        source: source.name,
        jobs_found: jobs.length,
        jobs_new: results.new,
        status: 'success',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`${source.name}: ${msg}`)
      await supabase.from('fetch_runs').insert({
        source: source.name,
        jobs_found: jobs.length,
        status: 'error',
        error_message: msg,
      })
    }
  }

  await supabase.functions.invoke('job-scorer')

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' },
  })
})
