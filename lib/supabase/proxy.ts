import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isProtectedPath, isGuestOnlyPath, isPublicPath } from '@/lib/constants'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // --- NOISE FILTER START ---
    if (error) {
      // Supabase throws 'AuthSessionMissingError' when no session is found.
      // This is expected for guests/prefetching, so we ignore it to clean up the terminal.
      const isIgnorableError =
        error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')

      // Only log if it is a REAL system error
      if (!isIgnorableError) {
        console.error('Auth error in proxy:', error)
      }
    }
    // --- NOISE FILTER END ---

    if (user) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('is_banned, banned_until')
        .eq('id', user.id)
        .single()

      const isPermanentlyBanned = dbUser?.is_banned
      const isTemporarilyBanned = dbUser?.banned_until && new Date(dbUser.banned_until) > new Date()

      if (isPermanentlyBanned || isTemporarilyBanned) {
        await supabase.auth.signOut()

        let msg = 'Your account has been suspended permanently.'
        if (isTemporarilyBanned && dbUser?.banned_until) {
          const date = new Date(dbUser.banned_until).toLocaleDateString()
          const time = new Date(dbUser.banned_until).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
          msg = `Your account is suspended until ${date} at ${time}.`
        }

        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('error', msg)
        return NextResponse.redirect(url)
      }

      request.headers.set('x-user-id', user.id)
      supabaseResponse.headers.set('x-user-id', user.id)
    }

    if (!user && isProtectedPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    if (user && isGuestOnlyPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/library'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Unexpected error in updateSession:', error)
  }

  return supabaseResponse
}
