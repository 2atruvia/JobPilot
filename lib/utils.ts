import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return '—'
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`
  if (min && max) return `${fmt(min)}–${fmt(max)}`
  return fmt(min ?? max!)
}

export function formatDate(value: string | Date | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function scoreColorClass(score: number | null): string {
  if (score === null) return 'text-muted-foreground'
  if (score >= 8) return 'text-primary'
  if (score >= 6) return 'text-chart-3'
  return 'text-destructive'
}
