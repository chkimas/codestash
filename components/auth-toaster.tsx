'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { ERROR_MESSAGES } from '@/lib/constants'

// Map URL error parameters to user-friendly messages
const ERROR_MAP: Record<string, string> = {
  invalid_code: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
  recovery_failed: 'Password reset link is invalid or expired.',
  link_expired: 'Your verification link has expired.',
  auth_failed: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
  rate_limited: ERROR_MESSAGES.GENERAL.RATE_LIMITED,
  social_login_failed: 'Social login failed. Please try again.',
  'Verification+failed': 'Email verification failed. Please try again.',
  unexpected: ERROR_MESSAGES.GENERAL.SERVER_ERROR
}

export function AuthToaster() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    let shouldUpdateUrl = false

    const successMessage = params.get('success')
    if (successMessage) {
      toast.success('Success!', {
        description: decodeURIComponent(successMessage),
        duration: 5000,
        dismissible: true
      })
      params.delete('success')
      shouldUpdateUrl = true
    }

    const verified = params.get('verified')
    if (verified) {
      toast.success('Email verified successfully!', {
        description: 'Welcome to CodeStash. Your account is now active.',
        duration: 5000,
        dismissible: true
      })
      params.delete('verified')
      shouldUpdateUrl = true
    }

    const resetSuccess = params.get('reset')
    if (resetSuccess) {
      toast.success('Password reset successful!', {
        description: 'You can now log in with your new password.',
        duration: 5000,
        dismissible: true
      })
      params.delete('reset')
      shouldUpdateUrl = true
    }

    const errorParam = params.get('error')
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam)
      const friendlyMessage =
        ERROR_MAP[errorParam] || decodedError || ERROR_MESSAGES.GENERAL.SERVER_ERROR

      toast.error('Authentication Error', {
        description: friendlyMessage,
        duration: 10000,
        dismissible: true
      })
      params.delete('error')
      shouldUpdateUrl = true
    }

    const message = params.get('message')
    if (message) {
      toast.info('Information', {
        description: decodeURIComponent(message),
        duration: 5000,
        dismissible: true
      })
      params.delete('message')
      shouldUpdateUrl = true
    }

    if (shouldUpdateUrl) {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, pathname])

  return null
}
