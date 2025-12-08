'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { CreateSnippetSchema } from './definitions'
import { revalidatePath } from 'next/cache'
import sql from './db'
import { auth } from '@/auth'
import { z } from 'zod'

type SnippetInput = z.infer<typeof CreateSnippetSchema>

// Define the shape of our Form State
export type State = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string | null
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. Please check your email and password.'
        default:
          return 'Something went wrong. Please try again.'
      }
    }
    throw error
  }
}

export async function createSnippet(values: SnippetInput) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { message: 'User not authenticated' }
  }

  const validatedFields = CreateSnippetSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      message: 'Database Error: Failed to Create Snippet.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { title, code, language, description, is_public } = validatedFields.data

  try {
    await sql`
      INSERT INTO snippets (user_id, title, code, language, description, is_public)
      VALUES (${userId}, ${title}, ${code}, ${language}, ${description ?? null}, ${is_public})
    `
  } catch {
    return {
      message: 'Database Error: Failed to Create Snippet.'
    }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
