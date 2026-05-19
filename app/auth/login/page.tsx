import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Work Log',
  description: 'Sign in to Work Log Employee Tracker',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const error = params.error as string | undefined
  const success = params.success as string | undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/logs')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4 shadow-md">
            <svg
              className="w-6 h-6 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Work Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Enterprise Edition</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <h2 className="text-xl font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with your credentials to continue
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium">
              {success}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Work Log Enterprise &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
