'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { TeqfocusLogo } from '@/components/layout/TeqfocusLogo'
import type { Profile } from '@/lib/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/logs', label: 'Work Logs', icon: ClipboardList },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/support', label: 'Support', icon: HelpCircle },
]

interface MobileNavProps {
  profile: Profile | null
  weeklyHours?: number
}

export function MobileNav({ profile, weeklyHours = 0 }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const goal = profile?.weekly_goal ?? 40
  const progress = Math.min(Math.round((weeklyHours / goal) * 100), 100)

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
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
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
