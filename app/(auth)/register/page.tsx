import RegisterForm from '@/features/auth/components/register-form'
import { Suspense } from 'react'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
