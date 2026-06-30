'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Send,
  FileText,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SignOutButton } from './sign-out-button'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/applications', label: 'Applications', icon: Send },
  { href: '/resume', label: 'Resume', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="p-4">
        <span className="text-lg font-semibold text-sidebar-foreground">JobPilot</span>
        <p className="mt-0.5 text-xs text-muted-foreground">Jungeun Sophia Chu</p>
      </div>

      <ul className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto border-t border-sidebar-border p-2">
        <SignOutButton />
      </div>
    </nav>
  )
}
