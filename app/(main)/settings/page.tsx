import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { SettingsForm } from '@/features/settings/components/settings-form'
import { MFAForm } from '@/features/settings/components/mfa-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await sql`SELECT name, image FROM users WHERE id = ${user.id}`
  const initialName = dbUser[0]?.name || ''
  const initialImage = dbUser[0]?.image || ''
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const isMFAEnabled = factors?.totp.some((f) => f.status === 'verified') ?? false

  return (
    <main className="min-h-screen bg-neutral-50/60">
      <div className="mx-auto flex w-full flex-col px-4 sm:px-6 lg:px-8 py-4">
        <header className="mb-4 border-b border-neutral-200 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your profile and security preferences.
          </p>
        </header>

        <section className="grid w-full gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="border-r border-neutral-200 pr-0 md:pr-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Profile
            </h2>
            <SettingsForm
              initialName={initialName}
              email={user.email || ''}
              initialImage={initialImage}
            />
          </div>

          <div className="md:pl-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Security
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-neutral-600">
                Turn on multi‑factor authentication to add an extra layer of protection.
              </p>
              <MFAForm isEnabled={isMFAEnabled} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
