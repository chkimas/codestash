import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Metadata } from 'next'
import { ShieldCheck, Home } from 'lucide-react'
import { AdminSidebar } from '@/components/admin-sidebar'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Console',
    default: 'Admin Console'
  },
  description: 'CodeStash Administrative Dashboard',
  robots: {
    index: false,
    follow: false
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('[ADMIN_LAYOUT_AUTH_ERROR]', authError)
    redirect('/login')
  }

  const { data: dbUser, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('[ADMIN_LAYOUT_USER_ERROR]', { userId: user.id, error: userError })
    redirect('/')
  }

  // Verify admin role
  if (!dbUser || dbUser.role !== 'admin') {
    console.warn('[ADMIN_LAYOUT_UNAUTHORIZED]', { userId: user.id, role: dbUser?.role })
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-background px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Admin Console</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <AdminSidebar />
        {/* Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
