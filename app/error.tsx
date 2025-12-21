'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong!</h2>
      <p className="mt-2 text-muted-foreground max-w-sm">
        An unexpected error occurred. Our team has been notified.
      </p>
      <div className="mt-8">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
      </div>
    </div>
  )
}
