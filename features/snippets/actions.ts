'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { CreateSnippetSchema } from '@/lib/definitions'

// Centralized error types
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; message: string; errors?: Record<string, string[]> }

// Auth helper - avoids repetition
async function getCurrentUserId() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user?.id
}

// Generic result helpers
function success<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

function failure(message: string, errors?: Record<string, string[]>): ActionResult {
  return { success: false, message, errors }
}

// Snippet operations
export async function createSnippet(
  values: z.infer<typeof CreateSnippetSchema>
): Promise<ActionResult> {
  const userId = await getCurrentUserId()
  if (!userId) return failure('User not authenticated')

  const validatedFields = CreateSnippetSchema.safeParse(values)
  if (!validatedFields.success) {
    return failure('Validation failed', validatedFields.error.flatten().fieldErrors)
  }

  const { title, code, language, description, is_public } = validatedFields.data

  try {
    await sql`
      INSERT INTO snippets (user_id, title, code, language, description, is_public)
      VALUES (${userId}, ${title}, ${code}, ${language}, ${description ?? null}, ${is_public})
    `
    revalidatePath('/dashboard')
    redirect('/dashboard')
    return success(undefined)
  } catch (error) {
    console.error('[CREATE_SNIPPET_ERROR]', { userId, title: title.slice(0, 50), error })
    return failure('Failed to create snippet')
  }
}

export async function deleteSnippet(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId()
  if (!userId) return failure('Unauthorized')

  try {
    const result = await sql`
      DELETE FROM snippets 
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return failure('Snippet not found or unauthorized')
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
    return success(undefined)
  } catch (error) {
    console.error('[DELETE_SNIPPET_ERROR]', { userId, snippetId: id, error })
    return failure('Failed to delete snippet')
  }
}

export async function updateSnippet(
  id: string,
  values: z.infer<typeof CreateSnippetSchema>
): Promise<ActionResult> {
  const userId = await getCurrentUserId()
  if (!userId) return failure('Unauthorized')

  const validatedFields = CreateSnippetSchema.safeParse(values)
  if (!validatedFields.success) {
    return failure('Validation failed', validatedFields.error.flatten().fieldErrors)
  }

  const { title, code, language, description, is_public } = validatedFields.data

  try {
    const result = await sql`
      UPDATE snippets
      SET 
        title = ${title},
        code = ${code},
        language = ${language},
        description = ${description ?? null},
        is_public = ${is_public},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `

    if (result.length === 0) {
      return failure('Snippet not found or unauthorized')
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/${id}`)
    redirect(`/dashboard/${id}`)
    return success(undefined)
  } catch (error) {
    console.error('[UPDATE_SNIPPET_ERROR]', {
      userId,
      snippetId: id,
      title: title.slice(0, 50),
      error
    })
    return failure('Failed to update snippet')
  }
}

export async function toggleFavorite(snippetId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId()
  if (!userId) return failure('Unauthorized')

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
    return success(undefined)
  } catch (error) {
    console.error('[TOGGLE_FAVORITE_ERROR]', { userId, snippetId, error })
    return failure('Failed to toggle favorite')
  }
}
