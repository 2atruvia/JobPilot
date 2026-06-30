'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const WHITELISTED_EMAIL = 'jungechu@gmail.com'

const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})

const registerSchema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignInValues = z.infer<typeof signInSchema>
type RegisterValues = z.infer<typeof registerSchema>

type Tab = 'signin' | 'register'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">OR</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  function clearMessages() {
    setServerError(null)
    setSuccessMsg(null)
  }

  function switchTab(t: Tab) {
    setTab(t)
    clearMessages()
    signInForm.reset()
    registerForm.reset()
  }

  async function handleGoogleOAuth() {
    setGoogleLoading(true)
    clearMessages()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(error.message)
      setGoogleLoading(false)
    }
    // On success, browser navigates away — no need to setGoogleLoading(false)
  }

  async function onSignIn(values: SignInValues) {
    setLoading(true)
    clearMessages()

    if (values.email !== WHITELISTED_EMAIL) {
      setServerError('This account is not authorized to access JobPilot.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function onRegister(values: RegisterValues) {
    setLoading(true)
    clearMessages()

    if (values.email !== WHITELISTED_EMAIL) {
      setServerError('This account is not authorized to access JobPilot.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError(error.message)
      setLoading(false)
      return
    }

    setSuccessMsg('Account created. Check your email to confirm, or sign in if confirmation is disabled.')
    setLoading(false)
    registerForm.reset()
  }

  const signInErrors = signInForm.formState.errors
  const registerErrors = registerForm.formState.errors

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mb-1 text-3xl">✈</div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">JobPilot</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI-powered job search</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          {/* Tabs */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {/* Sign-in form */}
          {tab === 'signin' && (
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jungechu@gmail.com"
                  {...signInForm.register('email')}
                />
                {signInErrors.email && (
                  <p className="text-xs text-destructive">{signInErrors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  type="password"
                  autoComplete="current-password"
                  {...signInForm.register('password')}
                />
                {signInErrors.password && (
                  <p className="text-xs text-destructive">{signInErrors.password.message}</p>
                )}
              </div>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              {successMsg && <p className="text-sm text-primary">{successMsg}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              <Divider />

              <GoogleButton onClick={handleGoogleOAuth} loading={googleLoading} />
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jungechu@gmail.com"
                  {...registerForm.register('email')}
                />
                {registerErrors.email && (
                  <p className="text-xs text-destructive">{registerErrors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register('password')}
                />
                {registerErrors.password && (
                  <p className="text-xs text-destructive">{registerErrors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  {...registerForm.register('confirmPassword')}
                />
                {registerErrors.confirmPassword && (
                  <p className="text-xs text-destructive">{registerErrors.confirmPassword.message}</p>
                )}
              </div>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              {successMsg && <p className="text-sm text-primary">{successMsg}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>

              <Divider />

              <GoogleButton onClick={handleGoogleOAuth} loading={googleLoading} />
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
