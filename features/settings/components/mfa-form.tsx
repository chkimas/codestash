'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { startMFAEnrollment, verifyAndEnableMFA, disableMFA } from '../actions'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export function MFAForm({ isEnabled }: { isEnabled: boolean }) {
  const [step, setStep] = useState<'idle' | 'qr' | 'verify'>('idle')
  const [qrCode, setQrCode] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    const result = await startMFAEnrollment()
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success && result.qrCode && result.factorId) {
      setQrCode(result.qrCode)
      setFactorId(result.factorId)
      setStep('qr')
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    const result = await verifyAndEnableMFA(factorId, code)
    setLoading(false)

    if (result.success) {
      toast.success('Two-factor authentication enabled!')
      setStep('idle')
      window.location.reload()
    } else {
      toast.error(result.error)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Are you sure? This will lower your account security.')) return
    await disableMFA()
    window.location.reload()
  }

  if (isEnabled) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-400">MFA is Active</p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80">
              Your account is secured with an authenticator app.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisable}
          className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          Disable
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Secure your account with an authenticator app.
          </p>
        </div>
        {step === 'idle' && (
          <Button onClick={handleStart} disabled={loading} size="sm">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Enable MFA'}
          </Button>
        )}
      </div>

      {step === 'qr' && (
        <div className="rounded-lg border border-border bg-muted/30 p-6 space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-foreground">
              1. Scan this with your Authenticator App
            </p>
            {/* Display the QR Code */}
            <div className="flex justify-center bg-white p-3 rounded-xl w-fit mx-auto border border-border shadow-sm">
              <Image
                src={qrCode}
                alt="QR Code"
                width={140}
                height={140}
                className="w-36 h-36"
                unoptimized
              />
            </div>
          </div>

          <div className="space-y-2 max-w-xs mx-auto">
            <p className="text-sm font-medium text-center text-foreground">2. Enter the code</p>
            <div className="flex gap-2">
              <Input
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-background text-center font-mono tracking-widest text-lg"
              />
              <Button onClick={handleVerify} disabled={loading || code.length !== 6}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
