'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ClipboardList, BarChart3, Settings, HelpCircle, Users, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
]

interface SidebarProps {
  profile: Profile | null
  weeklyHours?: number
}

export function Sidebar({ profile, weeklyHours = 0 }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const userId = searchParams.get('userId')
  const month = searchParams.get('month')
  const projectId = searchParams.get('projectId')
  
  const goal = profile?.weekly_goal ?? 40
  const progress = Math.min(Math.round((weeklyHours / goal) * 100), 100)

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-full bg-card border-r border-border">
      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
        {navItems.map((item) => {
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
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <>
            <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-4">
              Organisation
            </div>
            <Link
              href="/organisation/users"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                pathname.startsWith('/organisation/users')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Users className="w-4 h-4 shrink-0" />
              Users
            </Link>
            <Link
              href="/organisation/departments"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                pathname.startsWith('/organisation/departments')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              Department
            </Link>
          </>
        )}

        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150 mt-auto"
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          Support
        </Link>
      </nav>

      {/* Weekly goal widget */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-accent border border-border">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-foreground">Weekly Goal</p>
          <span className="text-xs font-bold text-primary">
            {weeklyHours}h / {goal}h
          </span>
        </div>
        <Progress value={progress} className="h-1.5 mb-2" />
        <p className="text-[11px] text-muted-foreground">
          {progress >= 100
            ? '🎉 Goal achieved!'
            : `${goal - weeklyHours}h remaining this week`}
        </p>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile?.full_name ?? 'User'}
            </p>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 font-medium capitalize"
            >
              {roleLabel[profile?.role ?? 'employee']}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  )
}
