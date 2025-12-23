'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function AuthToaster() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const successMessage = searchParams.get('success')
    if (successMessage) {
      toast.success('Account created!', {
        description: successMessage,
        duration: 5000
      })
      // Clean URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete('success')
      router.replace(`${pathname}?${params.toString()}`)
    }

    const verified = searchParams.get('verified')
    if (verified) {
      toast.success('Email verified successfully!', {
        description: 'Welcome to CodeStash. Your account is now active.',
        duration: 5000
      })
      const params = new URLSearchParams(searchParams.toString())
      params.delete('verified')
      router.replace(`${pathname}?${params.toString()}`)
    }

    const error = searchParams.get('error')
    if (error) {
      toast.error('Authentication failed', {
        description: decodeURIComponent(error)
      })
    }
  }, [searchParams, router, pathname])

  return null
}
