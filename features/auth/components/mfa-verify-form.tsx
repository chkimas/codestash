'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function MFAVerifyForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const verifyCode = useCallback(
    async (inputCode: string) => {
      setLoading(true)
      setError(null)

      try {
        const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
        if (listError) throw listError

        const totpFactor = factors.totp.find((f) => f.status === 'verified')
        if (!totpFactor) throw new Error('No MFA factor found.')

        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: totpFactor.id,
          code: inputCode
        })

        if (error) {
          setError('Invalid code. Please try again.')
          setLoading(false)
          return
        }

        toast.success('Verified!')
        router.push('/library')
        router.refresh()
      } catch (err: unknown) {
        console.error(err)
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    },
    [router, supabase]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '')

    if (newValue.length <= 6) {
      setCode(newValue)
      setError(null)
    }

    if (newValue.length === 6) {
      verifyCode(newValue)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        verifyCode(code)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Input
          name="code"
          placeholder="000000"
          className={cn(
            'text-center text-lg tracking-[0.5em] font-mono h-12 transition-all',
            error &&
              'border-red-500 ring-red-500 focus-visible:ring-red-500 bg-red-50 text-red-900 placeholder:text-red-300'
          )}
          maxLength={6}
          value={code}
          onChange={handleChange}
          autoFocus
          autoComplete="one-time-code"
          disabled={loading}
        />

        {error && (
          <p className="text-sm text-red-500 font-medium text-center animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={loading || code.length !== 6}>
        {loading ? <Loader2 className="animate-spin" /> : 'Verify'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="text-xs text-neutral-400 hover:text-neutral-900 underline"
        >
          Back to Login
        </button>
      </div>
    </form>
  )
}
