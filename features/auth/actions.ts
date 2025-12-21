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

async function getSupabaseClient() {
  return await createClient()
}

function failure(message: string, errors?: Record<string, string[]>): ActionResult {
  return { success: false, message, errors }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await getSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
  const validated = LoginSchema.safeParse({ email, password })

  if (!validated.success) {
    return {
      errorMessage: 'Invalid email or password format',
      errors: validated.error.flatten().fieldErrors
    }
  }

  let shouldRedirectMFA = false

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('[LOGIN_ERROR]', error.message)
      return { errorMessage: error.message }
    }

    const { data: mfaStatus } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (mfaStatus && mfaStatus.nextLevel === 'aal2' && mfaStatus.currentLevel === 'aal1') {
      shouldRedirectMFA = true
    }
  } catch (error) {
    console.error('[LOGIN_UNEXPECTED_ERROR]', error)
    return { errorMessage: 'Login failed. Please try again.' }
  }

  if (shouldRedirectMFA) {
    redirect('/verify-mfa')
  }

  revalidatePath('/', 'layout')
  redirect('/library')
}

export async function registerUser(
  formData: z.infer<typeof RegisterSchema>
): Promise<ActionResult> {
  const supabase = await getSupabaseClient()

  const validatedFields = RegisterSchema.safeParse(formData)
  if (!validatedFields.success) {
    return failure('Validation failed', validatedFields.error.flatten().fieldErrors)
  }

  const { email, password, name } = validatedFields.data

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })

    if (error) {
      console.error('[REGISTER_ERROR]', error.message)
      return failure(error.message)
    }
  } catch (error) {
    console.error('[REGISTER_UNEXPECTED_ERROR]', error)
    return failure('Registration failed. Please try again.')
  }

  redirect('/login?success=Check your email to verify your account.')
}

export async function logout(): Promise<void> {
  const supabase = await getSupabaseClient()
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
