'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        We encountered an error while loading this page. Please try again or contact support if the issue persists.
      </p>
      <Button onClick={() => reset()} className="gap-2">
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  )
}
