'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { RegisterSchema, UsernameAvailabilityResult } from '@/lib/definitions'
import { ERROR_MESSAGES } from '@/lib/constants'
import { headers } from 'next/headers'

// --- Types ---

type SuccessResult<T = undefined> = {
  success: true
  data?: T
  message?: string
}

type ErrorResult = {
  success: false
  message: string
  errors?: Record<string, string[]>
  error?: string
}

export type ActionResult<T = undefined> = SuccessResult<T> | ErrorResult
export type RegisterResult = ActionResult
export type AuthState =
  | {
      errorMessage?: string
      message?: string
      errors?: Record<string, string[]> | null
    }
  | undefined

// --- Rate Limiting ---

const authAttempts = new Map<string, { count: number; lastAttempt: number }>()
const RESET_INTERVAL = 15 * 60 * 1000

function checkRateLimit(identifier: string, action: 'login' | 'register' | 'reset'): boolean {
  const now = Date.now()
  const key = `${identifier}:${action}`
  const attempt = authAttempts.get(key)

  if (!attempt) {
    authAttempts.set(key, { count: 1, lastAttempt: now })
    return true
  }

  if (now - attempt.lastAttempt > RESET_INTERVAL) {
    authAttempts.set(key, { count: 1, lastAttempt: now })
    return true
  }

  const maxAttempts = action === 'login' ? 5 : 3

  if (attempt.count >= maxAttempts) return false

  authAttempts.set(key, {
    count: attempt.count + 1,
    lastAttempt: now
  })

  return true
}

// --- Helpers ---

function createErrorResult(message: string, errors?: Record<string, string[]>): ErrorResult {
  return {
    success: false,
    message,
    errors,
    error: message // Backward compatibility
  }
}

function createSuccessResult<T>(data?: T, message?: string): ActionResult<T> {
  return {
    success: true,
    data,
    message
  }
}

async function getIp() {
  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')
  // If behind a proxy/Vercel, x-forwarded-for contains the real IP.
  // Localhost will return '::1' or '127.0.0.1'
  return forwardedFor ? forwardedFor.split(',')[0] : 'Unknown'
}

const EmailSchema = z.string().email({ message: 'Invalid email address' })

// --- Actions ---

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const ip = await getIp() // <--- Capture IP

  const identifier = formData.get('email') as string
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { errorMessage: ERROR_MESSAGES.VALIDATION.REQUIRED }
  }

  if (!checkRateLimit(identifier, 'login')) {
    return { errorMessage: ERROR_MESSAGES.GENERAL.RATE_LIMITED }
  }

  let emailToLogin = identifier
  const isEmail = EmailSchema.safeParse(identifier).success

  // Resolve username to email if necessary
  if (!isEmail) {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('email')
        .ilike('username', identifier.trim())
        .single()

      if (error || !userProfile?.email) {
        return { errorMessage: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }
      }

      emailToLogin = userProfile.email
    } catch {
      return { errorMessage: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToLogin.trim(),
      password: password.trim()
    })

    if (error) {
      console.error('[LOGIN_ERROR]', {
        email: emailToLogin.slice(0, 3) + '...',
        error: error.message
      })
      return { errorMessage: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS }
    }

    // --- INTEGRATION: Save IP Address ---
    if (data.user) {
      // We don't await this so it doesn't block the user login flow
      supabase.from('users').update({ last_ip: ip }).eq('id', data.user.id).then()
    }
    // ------------------------------------

    // Check MFA status
    if (data.session) {
      const { data: mfaStatus } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (mfaStatus?.nextLevel === 'aal2' && mfaStatus.currentLevel === 'aal1') {
        redirect('/verify-mfa')
      }
    }
  } catch (error) {
    console.error('[LOGIN_EXCEPTION]', error)
    return { errorMessage: ERROR_MESSAGES.GENERAL.SERVER_ERROR }
  }

  revalidatePath('/', 'layout')
  redirect('/library')
}

export async function loginWithSocial(provider: 'github' | 'google'): Promise<never> {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Social login doesn't capture IP here easily because it redirects away.
  // The IP will be captured by the "Update User" trigger or subsequent logins.

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/library`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  })

  if (error) {
    console.error('[SOCIAL_LOGIN_ERROR]', { provider, error })
    redirect('/login?error=social_login_failed')
  }

  if (data.url) {
    redirect(data.url)
  }

  redirect('/login?error=unknown')
}

export async function registerUser(
  formData: z.infer<typeof RegisterSchema>
): Promise<ActionResult> {
  const supabase = await createClient()
  const ip = await getIp()

  const rateLimitKey = `register:${formData.email}`
  if (!checkRateLimit(rateLimitKey, 'register')) {
    return createErrorResult(ERROR_MESSAGES.GENERAL.RATE_LIMITED)
  }

  const validatedFields = RegisterSchema.safeParse(formData)
  if (!validatedFields.success) {
    return createErrorResult(
      ERROR_MESSAGES.VALIDATION.REQUIRED,
      validatedFields.error.flatten().fieldErrors
    )
  }

  const { email, password, name, username } = validatedFields.data

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle()

    if (checkError) {
      console.error('[USERNAME_CHECK_ERROR]', checkError)
      return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
    }

    if (existingUser) {
      return createErrorResult('Username is already taken')
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          name: name.trim(),
          username: username.trim()
        },
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }/auth/callback`
      }
    })

    if (error) {
      console.error('[REGISTER_ERROR]', {
        email: email.slice(0, 3) + '...',
        error: error.message
      })
      if (error.message.includes('already registered')) {
        return createErrorResult('Email is already registered')
      }
      return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
    }

    if (authData.user?.identities?.length === 0) {
      return createErrorResult('Email is already registered')
    }

    if (authData.user) {
      await supabase.from('users').update({ last_ip: ip }).eq('id', authData.user.id)
    }

    return createSuccessResult(undefined, 'Check your email to verify your account.')
  } catch (error) {
    console.error('[REGISTER_EXCEPTION]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function logout(): Promise<never> {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (error) {
    console.error('[LOGOUT_ERROR]', error)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(email: string): Promise<ActionResult> {
  const emailResult = EmailSchema.safeParse(email.trim())
  if (!emailResult.success) {
    return createErrorResult('Please enter a valid email address')
  }

  const validEmail = emailResult.data

  if (!checkRateLimit(validEmail, 'reset')) {
    return createErrorResult(ERROR_MESSAGES.GENERAL.RATE_LIMITED)
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(validEmail, {
      redirectTo: `${appUrl}/auth/callback?type=recovery&next=/update-password`
    })

    if (error) {
      console.error('[PASSWORD_RESET_ERROR]', {
        email: validEmail.slice(0, 3) + '...',
        error: error.message
      })
    }

    return createSuccessResult(
      undefined,
      'If an account exists with this email, you will receive a password reset link.'
    )
  } catch (error) {
    console.error('[PASSWORD_RESET_EXCEPTION]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function updatePasswordFromRecovery(password: string): Promise<ActionResult> {
  if (!password || password.length < 6) {
    return createErrorResult(ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
  }

  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult(ERROR_MESSAGES.AUTH.SESSION_EXPIRED)
    }

    const { error } = await supabase.auth.updateUser({
      password: password.trim()
    })

    if (error) {
      console.error('[PASSWORD_UPDATE_ERROR]', error)
      return createErrorResult('Failed to update password')
    }

    return createSuccessResult(
      undefined,
      'Password updated successfully. You can now log in with your new password.'
    )
  } catch (error) {
    console.error('[PASSWORD_UPDATE_EXCEPTION]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function checkUsernameAvailability(
  username: string
): Promise<UsernameAvailabilityResult> {
  if (!username || username.trim().length < 3) {
    // Return LegacySuccessResult with available property
    return {
      success: true,
      data: { available: false },
      available: false
    }
  }

  const cleanUsername = username.trim()
  const usernameRegex = /^[a-zA-Z0-9_]+$/

  if (!usernameRegex.test(cleanUsername)) {
    return {
      success: true,
      data: { available: false },
      available: false
    }
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (error) {
      console.error('[USERNAME_CHECK_ERROR]', error)
      // Return LegacyErrorResult with both error and available
      return {
        success: false,
        message: ERROR_MESSAGES.GENERAL.SERVER_ERROR,
        error: ERROR_MESSAGES.GENERAL.SERVER_ERROR,
        available: false
      }
    }

    const isAvailable = !data
    return {
      success: true,
      data: { available: isAvailable },
      available: isAvailable
    }
  } catch (error) {
    console.error('[USERNAME_CHECK_EXCEPTION]', error)
    return {
      success: false,
      message: ERROR_MESSAGES.GENERAL.SERVER_ERROR,
      error: ERROR_MESSAGES.GENERAL.SERVER_ERROR,
      available: false
    }
  }
}
