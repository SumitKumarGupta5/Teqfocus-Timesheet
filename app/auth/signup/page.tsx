import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SignupForm } from '@/components/auth/SignupForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Teqfocus Worklog',
  description: 'Create a new account for Teqfocus Employee Worklog Tracker',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams
  const error = params.error as string | undefined

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/logs')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-background to-background dark:from-indigo-950/20 dark:via-background dark:to-background p-4 relative overflow-hidden">
      {/* Decorative background blobs for a modern glassmorphic look */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3 hover:scale-105 transition-transform duration-300 bg-white p-3 rounded-xl border border-border/40 shadow-sm">
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

        {/* Card */}
        <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border shadow-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-1">Create an account</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your details to register for the Worklog Tracker
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          <SignupForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Teqfocus Consulting LLC @ 2026
        </p>
      </div>
    </div>
  )
}

