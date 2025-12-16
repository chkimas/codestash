'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { startMFAEnrollment, verifyAndEnableMFA, disableMFA } from '../actions'
import { Loader2 } from 'lucide-react'
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
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
        <div>
          <p className="font-medium text-green-900">MFA is Active</p>
          <p className="text-sm text-green-700">
            Your account is secured with an authenticator app.
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDisable}>
          Disable
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-neutral-500">Secure your account with an authenticator app.</p>
        </div>
        {step === 'idle' && (
          <Button onClick={handleStart} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Enable MFA'}
          </Button>
        )}
      </div>

      {step === 'qr' && (
        <div className="rounded-md border p-4 space-y-4 bg-neutral-50">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">1. Scan this with your Authenticator App</p>
            {/* Display the QR Code */}
            <div className="flex justify-center bg-white p-2 rounded w-fit mx-auto border">
              <Image
                src={qrCode}
                alt="QR Code"
                width={128}
                height={128}
                className="w-32 h-32"
                unoptimized
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">2. Enter the code</p>
            <div className="flex gap-2">
              <Input
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button onClick={handleVerify} disabled={loading || code.length !== 6}>
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
