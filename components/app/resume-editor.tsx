'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ResumeVersion } from '@/lib/supabase/queries'
import { createResumeVersion, setActiveVersion } from '@/app/(app)/resume/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

const formSchema = z.object({
  content_markdown: z.string().min(10, 'Resume content is required'),
  label: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Props {
  versions: ResumeVersion[]
}

export function ResumeEditor({ versions }: Props) {
  const activeVersion = versions.find((v) => v.is_active)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content_markdown: activeVersion?.content_markdown ?? '',
      label: '',
    },
  })

  async function onSubmit(values: FormValues) {
    setSaveStatus('saving')
    setErrorMsg(null)
    try {
      await createResumeVersion(values.content_markdown, values.label ?? '')
      setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  async function handleSetActive(id: string) {
    setSavingId(id)
    await setActiveVersion(id)
    setSavingId(null)
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="content_markdown">Resume (Markdown)</Label>
            <Textarea
              id="content_markdown"
              className="min-h-[480px] font-mono text-xs"
              placeholder="# Jungeun Sophia Chu&#10;&#10;## Experience&#10;..."
              {...register('content_markdown')}
            />
            {errors.content_markdown && (
              <p className="text-xs text-destructive">{errors.content_markdown.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label">Version Label (optional)</Label>
            <Input id="label" placeholder="e.g. Account Manager Focus" {...register('label')} />
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? 'Saving…' : 'Save as new version'}
            </Button>
            {saveStatus === 'saved' && <p className="text-sm text-primary">Saved as new version.</p>}
            {saveStatus === 'error' && <p className="text-sm text-destructive">{errorMsg}</p>}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Versions</h2>
        {versions.length === 0 && (
          <p className="text-sm text-muted-foreground">No versions yet.</p>
        )}
        {versions.map((v) => (
          <Card key={v.id} className={v.is_active ? 'border-primary' : ''}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>v{v.version}{v.label ? ` — ${v.label}` : ''}</span>
                {v.is_active && <Badge variant="default">Active</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <p className="text-xs text-muted-foreground">{formatDate(v.created_at)}</p>
              {!v.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={savingId === v.id}
                  onClick={() => handleSetActive(v.id)}
                >
                  {savingId === v.id ? 'Setting…' : 'Set active'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
