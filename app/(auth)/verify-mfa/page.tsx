import { MFAVerifyForm } from '@/features/auth/components/mfa-verify-form'

export default function VerifyMfaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-neutral-500">
            Enter the code from your authenticator app to continue.
          </p>
        </div>
        <MFAVerifyForm />
      </div>
    </div>
  )
}
