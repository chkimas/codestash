import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { SettingsForm } from '@/features/settings/components/settings-form'
import { MFAForm } from '@/features/settings/components/mfa-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings'
}

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
  const initialBio = dbUser[0]?.bio || ''
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const isMFAEnabled = factors?.totp.some((f) => f.status === 'verified') ?? false

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full flex-col px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and security preferences.
          </p>
        </header>

        <section className="grid w-full gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="border-r-0 md:border-r border-border pr-0 md:pr-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Profile
            </h2>
            <SettingsForm
              initialName={initialName}
              initialBio={initialBio}
              email={user.email || ''}
              initialImage={initialImage}
            />
          </div>

          <div className="md:pl-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Turn on multi‑factor authentication to add an extra layer of protection to your
                account.
              </p>
              <MFAForm isEnabled={isMFAEnabled} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
