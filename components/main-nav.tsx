import { createClient } from '@/lib/supabase/server'
import { MainNavClient } from '@/components/main-nav-client' // Import the new client component

export async function MainNav() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  let profile = null

  if (user) {
    const { data } = await supabase
      .from('users')
      .select('username, name, image, email')
      .eq('id', user.id)
      .single()

    profile = data
  }

  return <MainNavClient user={user} profile={profile} />
}
