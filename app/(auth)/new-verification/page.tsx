import { NewVerificationForm } from '@/features/auth/components/new-verification-form'
import { Suspense } from 'react'

export default function NewVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <NewVerificationForm />
    </Suspense>
  )
}
