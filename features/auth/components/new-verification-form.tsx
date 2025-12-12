'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { newVerification } from '@/features/auth/actions'
import { Code2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const NewVerificationForm = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | undefined>(!token ? 'Missing token!' : undefined)
  const [success, setSuccess] = useState<string | undefined>()
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return

    if (!token) return
    hasFired.current = true

    newVerification(token)
      .then((data) => {
        setSuccess(data.success)
        setError(data.error)
      })
      .catch(() => {
        setError('Something went wrong!')
      })
  }, [token])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
      <div className="w-full max-w-[400px] rounded-lg border border-neutral-800 bg-black p-8 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-white">
            <Code2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-white">Verifying your email</h1>
          <p className="text-sm text-neutral-500">Please wait while we confirm your identity.</p>
        </div>

        {/* Status Area */}
        <div className="flex flex-col items-center justify-center gap-4">
          {!success && !error && <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />}

          {success && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500">{success}</div>
          )}

          {error && (
            <div className="rounded-md bg-red-500/15 p-3 text-sm text-red-500">{error}</div>
          )}

          <Button asChild className="mt-4 w-full bg-white text-black hover:bg-neutral-200">
            <Link href="/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
