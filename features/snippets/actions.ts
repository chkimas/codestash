'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { auth } from '@/auth'
import { z } from 'zod'
import { CreateSnippetSchema } from '@/lib/definitions'

// Helper type for inputs
type SnippetInput = z.infer<typeof CreateSnippetSchema>

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

export async function deleteSnippet(id: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { message: 'Unauthorized' }
  }

  try {
    await sql`
      DELETE FROM snippets 
      WHERE id = ${id} AND user_id = ${userId}
    `
  } catch (error) {
    console.error('Delete Error:', error)
    return { message: 'Database Error: Failed to Delete Snippet.' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateSnippet(id: string, formData: SnippetInput) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { message: 'Unauthorized' }
  }

  const validatedFields = CreateSnippetSchema.safeParse(formData)

  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { title, code, language, description, is_public } = validatedFields.data

  try {
    await sql`
      UPDATE snippets
      SET 
        title = ${title},
        code = ${code},
        language = ${language},
        description = ${description ?? null},
        is_public = ${is_public}
      WHERE id = ${id} AND user_id = ${userId}
    `
  } catch (error) {
    console.error('Update Error:', error)
    return { message: 'Database Error: Failed to Update Snippet.' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/${id}`)
  redirect(`/dashboard/${id}`)
}

export async function toggleFavorite(snippetId: string) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { message: 'Unauthorized' }

  try {
    const existing = await sql`
      SELECT 1 FROM favorites WHERE user_id = ${userId} AND snippet_id = ${snippetId}
    `

    if (existing.length > 0) {
      await sql`DELETE FROM favorites WHERE user_id = ${userId} AND snippet_id = ${snippetId}`
    } else {
      await sql`INSERT INTO favorites (user_id, snippet_id) VALUES (${userId}, ${snippetId})`
    }

    revalidatePath('/')
    revalidatePath('/dashboard')
  } catch (error) {
    console.error('Update Error:', error)
    return { message: 'Database Error: Failed to Update Snippet.' }
  }
}
