'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  X,
  HelpCircle,
  Users,
  Building2,
  Briefcase,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { TeqfocusLogo } from '@/components/layout/TeqfocusLogo'
import type { Profile } from '@/lib/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface MobileNavProps {
  profile: Profile | null
  weeklyHours?: number
}

export function MobileNav({ profile, weeklyHours = 0 }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const userId = searchParams.get('userId')
  const month = searchParams.get('month')
  const projectId = searchParams.get('projectId')

  const goal = profile?.weekly_goal ?? 40
  const progress = Math.min(Math.round((weeklyHours / goal) * 100), 100)

  // Build nav items dynamically
  const mainNavItems: NavItem[] = [
    { href: '/logs', label: 'Work Logs', icon: ClipboardList },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      <button
        id="mobile-menu-toggle"
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
 
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <TeqfocusLogo />
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            
            // Construct URL preserving parameters
            const params = new URLSearchParams()
            if (item.href === '/logs' || item.href === '/analytics') {
              if (userId) params.set('userId', userId)
              if (month) params.set('month', month)
              if (projectId) params.set('projectId', projectId)
            }
            const queryString = params.toString()
            const href = queryString ? `${item.href}?${queryString}` : item.href

            return (
              <Link
                key={item.href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}

          {profile?.role === 'manager' && (
            <>
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-4">
                Organisation
              </div>
              <Link
                href="/users"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/users')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Users className="w-4 h-4 shrink-0" />
                Users
              </Link>
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/projects')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                Projects
              </Link>
            </>
          )}

          {profile?.role === 'admin' && (
            <>
              <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-4">
                Organisation
              </div>
              <Link
                href="/organisation/users"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/organisation/users')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Users className="w-4 h-4 shrink-0" />
                Users
              </Link>
              <Link
                href="/organisation/departments"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/organisation/departments')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                Department
              </Link>
              <Link
                href="/organisation/projects"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  pathname.startsWith('/organisation/projects')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                Projects
              </Link>
            </>
          )}

          <Link
            href="/support"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150 mt-auto"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            Support
          </Link>
        </nav>

        <div className="mx-3 mb-3 p-4 rounded-xl bg-accent border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold">Weekly Goal</p>
            <span className="text-xs font-bold text-primary">
              {weeklyHours}h / {goal}h
            </span>
          </div>
          <Progress value={progress} className="h-1.5 mb-2" />
          <p className="text-[11px] text-muted-foreground">
            {progress >= 100 ? '🎉 Goal achieved!' : `${goal - weeklyHours}h remaining`}
          </p>
        </div>
      </aside>
    </>
  )
}
