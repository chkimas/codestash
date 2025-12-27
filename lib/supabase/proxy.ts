// lib/supabase/proxy.ts
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { isProtectedPath, isGuestOnlyPath, isPublicPath } from '@/lib/constants'
import type { Database } from '@/types/supabase'

function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  }

  return { url, anonKey }
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey } = getPublicSupabaseEnv()

  const supabase: SupabaseClient<Database> = createServerClient<Database>(url, anonKey, {
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
  })

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      const isIgnorableError =
        error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')

      if (!isIgnorableError) {
        console.error('Auth error in proxy:', error)
      }
    }

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
          const bannedDate = new Date(dbUser.banned_until)
          const date = bannedDate.toLocaleDateString()
          const time = bannedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
          msg = `Your account is suspended until ${date} at ${time}.`
        }

        const urlClone = request.nextUrl.clone()
        urlClone.pathname = '/login'
        urlClone.searchParams.set('error', msg)
        return NextResponse.redirect(urlClone)
      }

      request.headers.set('x-user-id', user.id)
      supabaseResponse.headers.set('x-user-id', user.id)
    }

    if (!user && isProtectedPath(pathname)) {
      const urlClone = request.nextUrl.clone()
      urlClone.pathname = '/login'
      urlClone.searchParams.set('next', pathname)
      return NextResponse.redirect(urlClone)
    }

    if (user && isGuestOnlyPath(pathname)) {
      const urlClone = request.nextUrl.clone()
      urlClone.pathname = '/library'
      return NextResponse.redirect(urlClone)
    }
  } catch (error) {
    console.error('Unexpected error in updateSession:', error)
  }

  return supabaseResponse
}
