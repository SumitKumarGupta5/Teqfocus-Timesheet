'use client'

import * as React from 'react'
import { PasswordInput } from '@/components/ui/password-input'
import { signIn, checkEmailAndSendResetLink } from '@/lib/actions/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [email, setEmail] = React.useState('')
  const [resetEmail, setResetEmail] = React.useState('')
  const [isResetOpen, setIsResetOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [resetSuccess, setResetSuccess] = React.useState<string | null>(null)
  const [resetError, setResetError] = React.useState<string | null>(null)

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return

    setResetSuccess(null)
    setResetError(null)

    startTransition(async () => {
      const origin = window.location.origin
      const result = await checkEmailAndSendResetLink(resetEmail, origin)
      if (result?.error) {
        setResetError(result.error)
      } else {
        setResetSuccess('We have found your account and sent a password reset link to your email.')
      }
    })
  }

  const handleOpenChange = (open: boolean) => {
    setIsResetOpen(open)
    if (!open) {
      setResetEmail('')
      setResetSuccess(null)
      setResetError(null)
    }
  }

  return (
    <>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={() => setIsResetOpen(true)}
              className="text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          Sign In
        </button>
      </form>

      {/* Forgot Password Dialog */}
      <Dialog open={isResetOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your registered email address below. We will verify it exists in our system and send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetSubmit} className="space-y-4 py-2">
            {resetError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium">
                {resetSuccess}
              </div>
            )}

            {!resetSuccess && (
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isPending}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            )}

            <DialogFooter className="mt-4">
              {resetSuccess ? (
                <Button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Close
                </Button>
              ) : (
                <div className="flex w-full gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetOpen(false)}
                    disabled={isPending}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="cursor-pointer min-w-[120px]"
                  >
                    {isPending ? 'Checking...' : 'Send Reset Link'}
                  </Button>
                </div>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
