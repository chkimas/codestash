'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { RegisterSchema } from '@/lib/definitions'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; errors?: Record<string, string[]> }

export type RegisterResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> }

export type AuthState =
  | { errorMessage?: string; message?: string; errors?: Record<string, string[]> | null }
  | undefined

function failure(message: string, errors?: Record<string, string[]>): ActionResult {
  return { success: false, message, errors }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const identifier = formData.get('email') as string
  const password = formData.get('password') as string

  let emailToLogin = identifier

  const isEmail = z.string().email().safeParse(identifier).success

  if (!isEmail) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('email')
      .ilike('username', identifier)
      .single()

    if (!userProfile?.email) {
      return { errorMessage: 'Invalid username or password' }
    }

    emailToLogin = userProfile.email
  }

  let shouldRedirectMFA = false

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password
    })

    if (error) {
      return { errorMessage: error.message }
    }

    const { data: mfaStatus } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (mfaStatus && mfaStatus.nextLevel === 'aal2' && mfaStatus.currentLevel === 'aal1') {
      shouldRedirectMFA = true
    }
  } catch {
    return { errorMessage: 'Login failed. Please try again.' }
  }

  if (shouldRedirectMFA) {
    redirect('/verify-mfa')
  }

  revalidatePath('/', 'layout')
  redirect('/library')
}

export async function loginWithSocial(provider: 'github' | 'google') {
  const supabase = await createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/library`
    }
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function registerUser(
  formData: z.infer<typeof RegisterSchema>
): Promise<ActionResult> {
  const supabase = await createClient()

  const validatedFields = RegisterSchema.safeParse(formData)
  if (!validatedFields.success) {
    return failure('Validation failed', validatedFields.error.flatten().fieldErrors)
  }

  const { email, password, name, username } = validatedFields.data

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, username }
      }
    })

    if (error) {
      return failure(error.message)
    }
  } catch {
    return failure('Registration failed. Please try again.')
  }

  redirect('/login?success=Check your email to verify your account.')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/')
}

export async function forgotPassword(email: string): Promise<ActionResult> {
  const supabase = await createClient()

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/update-password`
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, data: undefined }
}

export async function updatePasswordFromRecovery(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { errorMessage: 'Password must be at least 6 characters' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { errorMessage: error.message }
  }

  redirect('/')
}
