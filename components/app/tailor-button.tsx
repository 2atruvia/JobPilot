'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function TailorButton({ jobId }: { jobId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleTailor() {
    setState('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      setState('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Unexpected error')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p className="text-sm text-primary">
        CV tailored.{' '}
        <Link href="/applications" className="underline underline-offset-4">
          View in Applications →
        </Link>
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleTailor} disabled={state === 'loading'}>
        {state === 'loading' ? 'Generating… (this takes ~20s)' : 'Generate Tailored CV'}
      </Button>
      {state === 'error' && errorMsg && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}
    </div>
  )
}
