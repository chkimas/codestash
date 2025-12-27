// app/admin/actions.ts (Final fix - removed unused ActionResult)
'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addHours, addDays } from 'date-fns'

export type BanDuration = 'off' | 'permanent' | '1h' | '24h' | '7d' | '30d'

export async function createAnnouncement(formData: FormData): Promise<void> {
  const supabase = await createAdminClient()
  const message = formData.get('message') as string
  const type = formData.get('type') as string

  if (!message || !type) {
    throw new Error('Message and type are required')
  }

  const { error } = await supabase.from('announcements').insert({ message, type, is_active: false })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/announcements')
}

export async function toggleAnnouncement(id: string, isActive: boolean): Promise<void> {
  const supabase = await createAdminClient()

  if (isActive) {
    await supabase.from('announcements').update({ is_active: false }).neq('id', id)
  }

  const { error } = await supabase
    .from('announcements')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/announcements')
  revalidatePath('/', 'layout')
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/announcements')
}

export async function deleteSnippetAsAdmin(snippetId: string): Promise<void> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('snippets').delete().eq('id', snippetId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/snippets')
  revalidatePath('/library')
}

export async function updateUserBan(userId: string, banType: BanDuration): Promise<void> {
  const supabase = await createAdminClient()
  let updateData: { is_banned: boolean; banned_until: string | null } = {
    is_banned: false,
    banned_until: null
  }

  switch (banType) {
    case 'off':
      updateData = { is_banned: false, banned_until: null }
      break
    case 'permanent':
      updateData = { is_banned: true, banned_until: null }
      break
    case '1h':
      updateData = { is_banned: true, banned_until: addHours(new Date(), 1).toISOString() }
      break
    case '24h':
      updateData = { is_banned: true, banned_until: addDays(new Date(), 1).toISOString() }
      break
    case '7d':
      updateData = { is_banned: true, banned_until: addDays(new Date(), 7).toISOString() }
      break
    case '30d':
      updateData = { is_banned: true, banned_until: addDays(new Date(), 30).toISOString() }
      break
  }

  const { error } = await supabase.from('users').update(updateData).eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/users')
}
