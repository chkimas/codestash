'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import sql from '@/db/client' // Ensure this points to your client
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { RegisterSchema } from '@/lib/definitions'

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

export async function registerUser(formData: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(formData)

  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `
  } catch (error) {
    console.error('Registration Error:', error)
    return {
      message: 'Database Error: Failed to Register User.'
    }
  }

  redirect('/login')
}
