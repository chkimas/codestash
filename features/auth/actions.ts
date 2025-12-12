'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { RegisterSchema } from '@/lib/definitions'

export type AuthState =
  | {
      errorMessage?: string
      message?: string
      errors?: Record<string, string[]> | null
    }
  | undefined

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { errorMessage: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/library')
}

export async function registerUser(formData: z.infer<typeof RegisterSchema>) {
  const supabase = await createClient()

  // Validation
  const validatedFields = RegisterSchema.safeParse(formData)
  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { email, password, name } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  })

  if (error) {
    return { message: error.message }
  }

  redirect('/login?success=Check your email to verify your account.')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
