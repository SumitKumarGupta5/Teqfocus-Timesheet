import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/server'
import { getProfile } from '@/lib/queries/settings'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { ShieldAlert, LogOut } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Inactive | Teqfocus Worklog',
  description: 'Your account is currently inactive.',
}

export default async function InactivePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no session exists, redirect them to login page
  if (!user) {
    redirect('/auth/login')
  }

  // Double check if the user is actually active (if they are active, let them back in)
  const profile = await getProfile(user.id)
  if (profile && profile.is_active) {
    redirect('/logs')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-50/10 via-background to-background dark:from-rose-950/10 dark:via-background dark:to-background p-4 relative overflow-hidden">
      {/* Premium ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3 bg-white p-3 rounded-xl border border-border/40 shadow-sm">
            <Image
              src="https://www.teqfocus.com/wp-content/uploads/2024/06/Teqfocus-Corrected-Logo156x70.png"
              alt="Teqfocus Logo"
              width={156}
              height={70}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <p className="text-xs font-semibold text-muted-foreground mt-1.5 uppercase tracking-widest">
            Employee Worklog Tracker
          </p>
        </div>

        {/* Glassmorphic block card */}
        <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border shadow-xl p-8 text-center relative overflow-hidden">
          {/* Subtle inside gradient/glow */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />
          
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_20px_-3px_rgba(239,68,68,0.2)] animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
            Account Inactive
          </h2>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Your user profile has been deactivated by an organization administrator. As a result, you are blocked from accessing the site or logging hours. 
            <br />
            <br />
            If you believe this is a mistake or need your access restored, please contact your administrator or IT support team.
          </p>

          {/* Action form to trigger sign-out */}
          <form action={signOut}>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm border-0 shadow-[0_4px_15px_-3px_rgba(225,29,72,0.3)] hover:shadow-[0_4px_20px_-2px_rgba(225,29,72,0.4)] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Teqfocus Consulting LLC @ 2026
        </p>
      </div>
    </div>
  )
}
