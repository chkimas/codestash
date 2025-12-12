import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { SettingsForm } from '@/features/settings/components/settings-form'

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

  return (
    <main className="min-h-screen bg-neutral-50/50 py-8">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <SettingsForm
          initialName={initialName}
          email={user.email || ''}
          initialImage={initialImage}
        />
      </div>
    </main>
  )
}
