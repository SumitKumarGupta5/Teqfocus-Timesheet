'use client'

import * as React from 'react'
import { PasswordInput } from '@/components/ui/password-input'
import {
  signIn,
  checkEmailAndSendResetLink,
  verifyChangePasswordCredentials,
  updateVerifiedPasswordAndLogin,
} from '@/lib/actions/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  KeyRound,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = React.useState('')
  const [resetEmail, setResetEmail] = React.useState('')
  const [isResetOpen, setIsResetOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [resetSuccess, setResetSuccess] = React.useState<string | null>(null)
  const [resetError, setResetError] = React.useState<string | null>(null)

  // Change Password Modal States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)
  const [changePasswordStep, setChangePasswordStep] = React.useState<1 | 2>(1)
  const [cpEmail, setCpEmail] = React.useState('')
  const [cpCurrentPassword, setCpCurrentPassword] = React.useState('')
  const [cpNewPassword, setCpNewPassword] = React.useState('')
  const [cpConfirmPassword, setCpConfirmPassword] = React.useState('')
  const [cpError, setCpError] = React.useState<string | null>(null)
  const [cpSuccess, setCpSuccess] = React.useState<string | null>(null)
  const [cpPending, setCpPending] = React.useState(false)

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

  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cpEmail || !cpCurrentPassword) return

    setCpError(null)
    setCpPending(true)

    startTransition(async () => {
      try {
        const result = await verifyChangePasswordCredentials(cpEmail, cpCurrentPassword)
        if (result?.error) {
          setCpError(result.error)
        } else {
          setChangePasswordStep(2)
        }
      } catch (err) {
        setCpError(err instanceof Error ? err.message : 'An error occurred during verification.')
      } finally {
        setCpPending(false)
      }
    })
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cpNewPassword || !cpConfirmPassword) return

    if (cpNewPassword.length < 6) {
      setCpError('Password must be at least 6 characters.')
      return
    }

    if (cpNewPassword !== cpConfirmPassword) {
      setCpError('Passwords do not match.')
      return
    }

    setCpError(null)
    setCpPending(true)

    startTransition(async () => {
      try {
        const result = await updateVerifiedPasswordAndLogin(
          cpEmail,
          cpCurrentPassword,
          cpNewPassword,
          cpConfirmPassword
        )
        if (result?.error) {
          setCpError(result.error)
        } else {
          toast.success('Password changed successfully! Redirecting to dashboard...')
          setCpSuccess('Password updated successfully. Redirecting you to the dashboard...')
          
          // Clear inputs
          setCpNewPassword('')
          setCpConfirmPassword('')
          
          // Redirect to the logs/dashboard page after a short delay
          setTimeout(() => {
            window.location.href = '/logs'
          }, 1500)
        }
      } catch (err) {
        setCpError(err instanceof Error ? err.message : 'An error occurred while updating password.')
      } finally {
        setCpPending(false)
      }
    })
  }

  const handleChangePasswordOpenChange = (open: boolean) => {
    setIsChangePasswordOpen(open)
    if (!open) {
      setChangePasswordStep(1)
      setCpEmail('')
      setCpCurrentPassword('')
      setCpNewPassword('')
      setCpConfirmPassword('')
      setCpError(null)
      setCpSuccess(null)
    }
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

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setIsChangePasswordOpen(true)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium hover:underline"
        >
          Want to change password?
        </button>
      </div>

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

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={handleChangePasswordOpenChange}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {changePasswordStep === 1
                ? 'Enter your email and current password to verify your identity.'
                : 'Set a secure new password for your account.'}
            </DialogDescription>
          </DialogHeader>

          {cpError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cpError}</span>
            </div>
          )}

          {cpSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cpSuccess}</span>
            </div>
          )}

          {/* Step 1: Verify current credentials */}
          {changePasswordStep === 1 && !cpSuccess && (
            <form onSubmit={handleVerifyCredentials} className="space-y-4 py-2">
              <div>
                <label htmlFor="cpEmail" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="cpEmail"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={cpEmail}
                    onChange={(e) => setCpEmail(e.target.value)}
                    disabled={cpPending}
                    className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cpCurrentPassword" className="block text-sm font-medium text-foreground mb-1.5">
                  Current Password
                </label>
                <PasswordInput
                  id="cpCurrentPassword"
                  required
                  placeholder="••••••••"
                  value={cpCurrentPassword}
                  onChange={(e) => setCpCurrentPassword(e.target.value)}
                  disabled={cpPending}
                />
              </div>

              <DialogFooter className="mt-6">
                <div className="flex w-full gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleChangePasswordOpenChange(false)}
                    disabled={cpPending}
                    className="cursor-pointer rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={cpPending || !cpEmail || !cpCurrentPassword}
                    className="cursor-pointer min-w-[100px] rounded-lg"
                  >
                    {cpPending ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Next
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Choose new password */}
          {changePasswordStep === 2 && !cpSuccess && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 py-2">
              <div>
                <label htmlFor="cpNewPassword" className="block text-sm font-medium text-foreground mb-1.5">
                  New Password
                </label>
                <PasswordInput
                  id="cpNewPassword"
                  required
                  placeholder="••••••••"
                  value={cpNewPassword}
                  onChange={(e) => setCpNewPassword(e.target.value)}
                  disabled={cpPending}
                />
              </div>

              <div>
                <label htmlFor="cpConfirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm New Password
                </label>
                <PasswordInput
                  id="cpConfirmPassword"
                  required
                  placeholder="••••••••"
                  value={cpConfirmPassword}
                  onChange={(e) => setCpConfirmPassword(e.target.value)}
                  disabled={cpPending}
                />
              </div>

              <DialogFooter className="mt-6">
                <div className="flex w-full gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleChangePasswordOpenChange(false)}
                    disabled={cpPending}
                    className="cursor-pointer rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={cpPending || !cpNewPassword || !cpConfirmPassword}
                    className="cursor-pointer min-w-[140px] rounded-lg"
                  >
                    {cpPending ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}

          {cpSuccess && (
            <DialogFooter className="mt-6">
              <Button
                type="button"
                onClick={() => handleChangePasswordOpenChange(false)}
                className="w-full sm:w-auto cursor-pointer rounded-lg"
              >
                Done
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
