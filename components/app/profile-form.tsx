'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ProfileRow } from '@/lib/supabase/queries'
import { updateProfile } from '@/app/(app)/profile/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  current_location: z.string(),
  target_location: z.string(),
  target_location_alt: z.string(),
  remote_policy: z.enum(['work_from_anywhere', 'spain_only']),
  nationality: z.string(),
  target_salary_usd_min: z.coerce.number().int().nonnegative().optional(),
  target_salary_usd_max: z.coerce.number().int().nonnegative().optional(),
  target_roles_raw: z.string(),
  languages_raw: z.string(),
  skills_raw: z.string(),
  blocklist_keywords_raw: z.string(),
  spain_remote_keywords_raw: z.string(),
})

type FormValues = z.infer<typeof formSchema>

function toComma(arr: string[] | null | undefined) {
  return arr?.join(', ') ?? ''
}

function fromComma(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

interface Props {
  profile: ProfileRow | null
}

export function ProfileForm({ profile }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      current_location: profile?.current_location ?? '',
      target_location: profile?.target_location ?? '',
      target_location_alt: profile?.target_location_alt ?? '',
      remote_policy: (profile?.remote_policy as 'work_from_anywhere' | 'spain_only') ?? 'work_from_anywhere',
      nationality: profile?.nationality ?? '',
      target_salary_usd_min: profile?.target_salary_usd_min ?? undefined,
      target_salary_usd_max: profile?.target_salary_usd_max ?? undefined,
      target_roles_raw: toComma(profile?.target_roles),
      languages_raw: toComma(profile?.languages),
      skills_raw: toComma(profile?.skills),
      blocklist_keywords_raw: toComma(profile?.blocklist_keywords),
      spain_remote_keywords_raw: toComma(profile?.spain_remote_keywords),
    },
  })

  async function onSubmit(values: FormValues) {
    setStatus('saving')
    setErrorMsg(null)
    try {
      await updateProfile(
        {
          full_name: values.full_name,
          current_location: values.current_location || null,
          target_location: values.target_location || null,
          target_location_alt: values.target_location_alt || null,
          remote_policy: values.remote_policy,
          nationality: values.nationality || null,
          target_salary_usd_min: values.target_salary_usd_min ?? null,
          target_salary_usd_max: values.target_salary_usd_max ?? null,
          target_roles: fromComma(values.target_roles_raw),
          languages: fromComma(values.languages_raw),
          skills: fromComma(values.skills_raw),
          blocklist_keywords: fromComma(values.blocklist_keywords_raw),
          spain_remote_keywords: fromComma(values.spain_remote_keywords_raw),
        },
        profile?.id
      )
      setStatus('saved')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value="jungechu@gmail.com" readOnly className="opacity-60 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" {...register('nationality')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="remote_policy">Remote Policy</Label>
            <Select id="remote_policy" {...register('remote_policy')}>
              <option value="work_from_anywhere">Work From Anywhere</option>
              <option value="spain_only">Spain Only</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_location">Current Location</Label>
            <Input id="current_location" {...register('current_location')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target_location">Target Location</Label>
            <Input id="target_location" placeholder="Valencia, Spain" {...register('target_location')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target_location_alt">Target Location (alt)</Label>
            <Input id="target_location_alt" placeholder="Spain" {...register('target_location_alt')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salary Targets (USD)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="target_salary_usd_min">Min</Label>
            <Input id="target_salary_usd_min" type="number" {...register('target_salary_usd_min')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target_salary_usd_max">Max</Label>
            <Input id="target_salary_usd_max" type="number" {...register('target_salary_usd_max')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences (comma-separated)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="target_roles_raw">Target Roles</Label>
            <Input id="target_roles_raw" placeholder="Account Manager, Business Development Manager" {...register('target_roles_raw')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="languages_raw">Languages</Label>
              <Input id="languages_raw" placeholder="English, Korean, German" {...register('languages_raw')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills_raw">Skills</Label>
              <Input id="skills_raw" placeholder="Account Management, P&L Ownership" {...register('skills_raw')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blocklist_keywords_raw">Blocklist Keywords</Label>
            <Input id="blocklist_keywords_raw" placeholder="US only, clearance required" {...register('blocklist_keywords_raw')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spain_remote_keywords_raw">Spain-Remote Positive Keywords</Label>
            <Input id="spain_remote_keywords_raw" placeholder="work from anywhere, fully remote" {...register('spain_remote_keywords_raw')} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save Profile'}
        </Button>
        {status === 'saved' && <p className="text-sm text-primary">Saved.</p>}
        {status === 'error' && <p className="text-sm text-destructive">{errorMsg}</p>}
      </div>
    </form>
  )
}
