import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple in-memory rate limiting
const callbackAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = callbackAttempts.get(ip)

  if (!attempt) {
    callbackAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  if (now - attempt.lastAttempt > WINDOW_MS) {
    callbackAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  if (attempt.count >= MAX_ATTEMPTS) {
    return false
  }

  callbackAttempts.set(ip, {
    count: attempt.count + 1,
    lastAttempt: now
  })

  return true
}

// Validate redirect URL to prevent open redirects
function validateRedirectUrl(url: string, baseUrl: string): string {
  try {
    const parsed = new URL(url, baseUrl)

    if (parsed.origin !== baseUrl) {
      return '/library'
    }

    const dangerousPatterns = ['//', '\\', 'javascript:', 'data:', 'vbscript:']
    if (dangerousPatterns.some((pattern) => parsed.pathname.includes(pattern))) {
      return '/library'
    }

    return parsed.pathname + parsed.search
  } catch {
    return '/library'
  }
}

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (!checkRateLimit(ip)) {
      console.error('[CALLBACK_RATE_LIMIT] Too many attempts from IP:', ip)
      const url = new URL(request.url)
      return NextResponse.redirect(`${url.origin}/login?error=rate_limited`)
    }

    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/library'
    const type = searchParams.get('type') // 'signup', 'recovery', 'invite', 'magiclink'

    if (!code || typeof code !== 'string' || code.length > 1000) {
      console.error('[CALLBACK_INVALID_CODE] Missing or invalid code parameter')
      return NextResponse.redirect(`${origin}/login?error=invalid_code`)
    }

    const safeNext = validateRedirectUrl(next, origin)
    const supabase = await createClient()

    // 1. Handle Password Recovery Flow
    if (type === 'recovery') {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[CALLBACK_RECOVERY_ERROR]', {
          error: error.message,
          ip,
          codeLength: code.length
        })
        return NextResponse.redirect(`${origin}/login?error=recovery_failed`)
      }

      return NextResponse.redirect(`${origin}/settings?reset=true`)
    }

    // 2. Handle Standard OAuth / Magic Link Flow
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[CALLBACK_AUTH_ERROR]', {
        error: error.message,
        ip,
        codeLength: code.length
      })

      if (error.message.includes('expired')) {
        return NextResponse.redirect(`${origin}/login?error=link_expired`)
      }

      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    console.info('[CALLBACK_SUCCESS]', {
      userId: data.user?.id?.slice(0, 8),
      provider: data.user?.app_metadata?.provider,
      ip
    })

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    let redirectUrl = `${origin}${safeNext}`

    if (!isLocalEnv && forwardedHost) {
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      redirectUrl = `${protocol}://${forwardedHost}${safeNext}`
    }

    const redirectWithParams = new URL(redirectUrl)

    // Only show "Verified" toast if this is actually a verification event
    // Standard logins (OAuth return) or Magic Links shouldn't trigger it every time.
    if (type === 'signup' || type === 'invite') {
      redirectWithParams.searchParams.set('verified', 'true')
    }

    return NextResponse.redirect(redirectWithParams.toString())
  } catch (error) {
    console.error('[CALLBACK_UNEXPECTED_ERROR]', error)
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/login?error=unexpected`)
  }
}
