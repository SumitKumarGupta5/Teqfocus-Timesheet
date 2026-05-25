'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { LogOut, Bell, Search } from 'lucide-react'
import { MobileNav } from '@/components/layout/MobileNav'
import { TeqfocusLogo } from '@/components/layout/TeqfocusLogo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Profile } from '@/lib/types'

interface TopbarProps {
  profile: Profile | null
  weeklyHours?: number
}

export function Topbar({ profile, weeklyHours = 0 }: TopbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/auth/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-card/80 backdrop-blur-sm border-b border-border shrink-0">
      {/* Left: mobile menu + logo */}
      <div className="flex items-center gap-3">
        <MobileNav profile={profile} weeklyHours={weeklyHours} />
        <div className="lg:ml-12">
          <TeqfocusLogo className="hidden lg:block" />
        </div>
      </div>

      {/* Center: mobile/tablet centered logo */}
      <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <TeqfocusLogo />
      </div>

      {/* Center: search (decorative for now) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-accent border border-border text-muted-foreground text-sm max-w-xs w-full">
        <Search className="w-4 h-4 shrink-0" />
        <span className="text-xs">Quick search…</span>
        <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-2">
        <button
          id="notifications-btn"
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="user-menu-btn"
              className="flex items-center gap-2 rounded-lg hover:bg-accent p-1.5 transition-colors outline-none"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize font-normal">
                {profile?.role ?? 'employee'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id="sign-out-btn"
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
