import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/server'
import { getProfile } from '@/lib/queries/settings'
import { updateFirstTimePassword, signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, LogOut } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Change Password | Teqfocus Worklog',
  description: 'Change your temporary password on your first login.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChangePasswordPage({ searchParams }: PageProps) {
  const params = await searchParams
  const error = params.error as string | undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if user is not authenticated
  if (!user) {
    redirect('/auth/login')
  }

  // Double check if the user actually needs to change their password
  const profile = await getProfile(user.id)
  
  if (!profile) {
    redirect('/auth/login')
  }

  if (profile && !profile.is_active) {
    redirect('/inactive')
  }

  if (profile && !profile.requires_password_change) {
    redirect('/logs')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-background to-background dark:from-indigo-950/20 dark:via-background dark:to-background p-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
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

        {/* Change Password Card */}
        <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border shadow-xl p-8 relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-600" />

          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Change Password</h2>
              <p className="text-xs text-muted-foreground mt-0.5">First-time login security verification.</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            For security reasons, you must update the temporary password created by your administrator before accessing the system.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Form submitting to updateFirstTimePassword Server Action */}
          <form action={updateFirstTimePassword} className="space-y-4">
            
            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                New Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                required
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white font-semibold text-sm border-0 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_-2px_rgba(99,102,241,0.5)] active:scale-95 transition-all duration-200"
            >
              Update Password & Continue
            </Button>
          </form>

          {/* Back to Sign In option */}
          <div className="mt-5 pt-4 border-t border-border/40 flex justify-center">
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-indigo-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out and login as another user
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Teqfocus Consulting LLC @ 2026
        </p>
      </div>
    </div>
  )
}
