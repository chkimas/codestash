import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/library'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let domain = origin
      if (!isLocalEnv && forwardedHost) {
        domain = `https://${forwardedHost}`
      }

      return NextResponse.redirect(`${domain}${next}?verified=true`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Verification+failed`)
}
