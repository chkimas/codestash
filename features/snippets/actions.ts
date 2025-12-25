'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { CreateSnippetSchema } from '@/lib/definitions'
import { APP_LIMITS, ERROR_MESSAGES } from '@/lib/constants'

// Types - Fixed to be more flexible
type SuccessResult<T = undefined> = {
  success: true
  data?: T
  message?: string
}

type ErrorResult = {
  success: false
  message: string
  errors?: Record<string, string[]>
  error?: string // For compatibility with existing code
}

type ActionResult<T = undefined> = SuccessResult<T> | ErrorResult

type SnippetFormData = z.infer<typeof CreateSnippetSchema>

// Rate limiting (in-memory for free tier)
const userActionTimestamps = new Map<string, number[]>()
function checkRateLimit(userId: string, action: 'create' | 'delete' | 'update'): boolean {
  const now = Date.now()
  const userActions = userActionTimestamps.get(userId) || []
  const recentActions = userActions.filter((timestamp) => now - timestamp < 3600000)

  const limit = action === 'create' ? APP_LIMITS.RATE_LIMIT.SNIPPET_CREATIONS_PER_HOUR : 100

  if (recentActions.length >= limit) return false

  recentActions.push(now)
  userActionTimestamps.set(userId, recentActions)
  return true
}

// Helper for consistent error responses
function createErrorResult(message: string, errors?: Record<string, string[]>): ErrorResult {
  return {
    success: false,
    message,
    errors,
    error: message // For compatibility
  }
}

// Helper for success responses
function createSuccessResult<T>(data?: T, message?: string): SuccessResult<T> {
  return {
    success: true,
    data,
    message
  }
}

export async function createSnippet(
  values: SnippetFormData
): Promise<ActionResult<{ snippetId: string }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult(ERROR_MESSAGES.AUTH.UNAUTHORIZED)
    }

    if (!checkRateLimit(user.id, 'create')) {
      return createErrorResult(ERROR_MESSAGES.GENERAL.RATE_LIMITED)
    }

    // Check snippet count
    const { count, error: countError } = await supabase
      .from('snippets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) throw countError
    if ((count || 0) >= APP_LIMITS.SNIPPET.PER_USER_MAX) {
      return createErrorResult(ERROR_MESSAGES.SNIPPET.LIMIT_REACHED)
    }

    const parsed = CreateSnippetSchema.safeParse(values)
    if (!parsed.success) {
      return createErrorResult(
        ERROR_MESSAGES.VALIDATION.REQUIRED,
        parsed.error.flatten().fieldErrors
      )
    }

    const { title, code, language, description, is_public } = parsed.data

    const { data, error } = await supabase
      .from('snippets')
      .insert({
        user_id: user.id,
        title,
        code,
        language,
        description: description || null,
        is_public
      })
      .select('id')
      .single()

    if (error) throw error

    revalidatePath('/library')
    revalidatePath('/')

    return createSuccessResult({ snippetId: data.id }, 'Snippet created successfully')
  } catch (error) {
    console.error('[CREATE_SNIPPET_ERROR]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function deleteSnippet(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult(ERROR_MESSAGES.AUTH.UNAUTHORIZED)
    }

    const { error } = await supabase.from('snippets').delete().eq('id', id).eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/library')
    revalidatePath('/')
    revalidatePath(`/library/${id}`)

    return createSuccessResult(undefined, 'Snippet deleted successfully')
  } catch (error) {
    console.error('[DELETE_SNIPPET_ERROR]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function updateSnippet(id: string, values: SnippetFormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult(ERROR_MESSAGES.AUTH.UNAUTHORIZED)
    }

    const parsed = CreateSnippetSchema.safeParse(values)
    if (!parsed.success) {
      return createErrorResult(
        ERROR_MESSAGES.VALIDATION.REQUIRED,
        parsed.error.flatten().fieldErrors
      )
    }

    const { title, code, language, description, is_public } = parsed.data

    const { error } = await supabase
      .from('snippets')
      .update({
        title,
        code,
        language,
        description: description || null,
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/library')
    revalidatePath(`/library/${id}`)

    return createSuccessResult(undefined, 'Snippet updated successfully')
  } catch (error) {
    console.error('[UPDATE_SNIPPET_ERROR]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function toggleFavorite(
  snippetId: string
): Promise<ActionResult<{ isFavorited: boolean }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult(ERROR_MESSAGES.AUTH.UNAUTHORIZED)
    }

    // Check snippet access
    const { data: snippet, error: snippetError } = await supabase
      .from('snippets')
      .select('is_public, user_id')
      .eq('id', snippetId)
      .single()

    if (snippetError) throw snippetError
    if (!snippet.is_public && snippet.user_id !== user.id) {
      return createErrorResult(ERROR_MESSAGES.SNIPPET.ACCESS_DENIED)
    }

    // Check existing favorite
    const { data: existing } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', user.id)
      .eq('snippet_id', snippetId)
      .maybeSingle()

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('snippet_id', snippetId)

      if (error) throw error
    } else {
      // Add favorite
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        snippet_id: snippetId
      })

      if (error) throw error
    }

    revalidatePath('/')
    revalidatePath('/library')
    revalidatePath(`/library/${snippetId}`)

    return createSuccessResult(
      { isFavorited: !existing },
      existing ? 'Removed from favorites' : 'Added to favorites'
    )
  } catch (error) {
    console.error('[TOGGLE_FAVORITE_ERROR]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}

export async function deleteSnippets(
  ids: string[]
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return createErrorResult(ERROR_MESSAGES.AUTH.UNAUTHORIZED)
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return createErrorResult('No snippets selected')
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const validIds = ids.filter((id) => uuidRegex.test(id))

    if (validIds.length !== ids.length) {
      return createErrorResult('Invalid snippet IDs')
    }

    // Delete in batches for free-tier efficiency
    const BATCH_SIZE = 10
    let deletedCount = 0

    for (let i = 0; i < validIds.length; i += BATCH_SIZE) {
      const batch = validIds.slice(i, i + BATCH_SIZE)

      const { error } = await supabase
        .from('snippets')
        .delete()
        .in('id', batch)
        .eq('user_id', user.id)

      if (error) throw error
      deletedCount += batch.length
    }

    revalidatePath('/library')
    revalidatePath('/')

    return createSuccessResult(
      { deletedCount },
      `Deleted ${deletedCount} snippet${deletedCount === 1 ? '' : 's'}`
    )
  } catch (error) {
    console.error('[BULK_DELETE_SNIPPETS_ERROR]', error)
    return createErrorResult(ERROR_MESSAGES.GENERAL.SERVER_ERROR)
  }
}
