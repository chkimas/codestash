/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { z } from 'zod'

export type SettingsState =
  | {
      message?: string
      error?: string
      success?: boolean
    }
  | undefined

function checkCooldown(lastChange: Date | string | null | undefined): boolean {
  if (!lastChange) return true
  const last = typeof lastChange === 'string' ? new Date(lastChange) : lastChange
  const daysDiff = (Date.now() - last.getTime()) / (1000 * 3600 * 24)
  return daysDiff >= 30
}

const ProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.instanceof(File).optional()
})

export async function updateProfile(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const parsed = ProfileSchema.safeParse({
    name: formData.get('name') || undefined,
    avatar: (formData.get('avatar') as File | null) || undefined
  })

  if (!parsed.success) {
    return { error: 'Invalid input' }
  }

  const { name, avatar } = parsed.data

  try {
    if (avatar && avatar.size > 0) {
      if (avatar.size > 2 * 1024 * 1024) {
        return { error: 'Image must be less than 2MB' }
      }

      const dbResult = await sql`SELECT image FROM users WHERE id = ${user.id}`
      const oldUrl: string | undefined = dbResult[0]?.image

      if (oldUrl && oldUrl.includes('avatars/')) {
        const oldPath = oldUrl.split('/avatars/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      const filePath = `${user.id}/${Date.now()}-${avatar.name}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await sql`UPDATE users SET image = ${data.publicUrl} WHERE id = ${user.id}`
    }

    if (name) {
      const dbUser = await sql`SELECT last_name_change FROM users WHERE id = ${user.id}`
      const lastChange: Date | string | null | undefined = dbUser[0]?.last_name_change

      if (!checkCooldown(lastChange)) {
        return { error: 'Name can only be changed once every 30 days.' }
      }

      await sql`
        UPDATE users 
        SET name = ${name}, last_name_change = NOW() 
        WHERE id = ${user.id}
      `

      await supabase.auth.updateUser({ data: { full_name: name } })
    }

    revalidatePath('/', 'layout')
    return { success: true, message: 'Profile updated successfully.' }
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]', { userId: user.id, error })
    return { error: 'Failed to update profile.' }
  }
}

export async function updateEmail(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: 'Unauthorized' }
  }

  const email = formData.get('email')
  const currentPassword = formData.get('currentPassword')

  if (typeof email !== 'string' || typeof currentPassword !== 'string') {
    return { error: 'All fields are required.' }
  }

  if (email === user.email) {
    return { error: 'New email must be different.' }
  }

  try {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (verifyError) {
      return { error: 'Incorrect current password.' }
    }

    const dbUser = await sql`SELECT last_email_change FROM users WHERE id = ${user.id}`
    const lastChange: Date | string | null | undefined = dbUser[0]?.last_email_change

    if (!checkCooldown(lastChange)) {
      return { error: 'Email can only be changed once every 30 days.' }
    }

    const { error: updateError } = await supabase.auth.updateUser({ email })
    if (updateError) {
      return { error: updateError.message }
    }

    await sql`UPDATE users SET last_email_change = NOW() WHERE id = ${user.id}`
    return { success: true, message: 'Confirmation links sent to both emails.' }
  } catch (error) {
    console.error('[UPDATE_EMAIL_ERROR]', { userId: user.id, error })
    return { error: 'Failed to update email.' }
  }
}

export async function updatePassword(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: 'Unauthorized' }
  }

  const newPassword = formData.get('newPassword')
  const currentPassword = formData.get('currentPassword')

  if (typeof newPassword !== 'string' || typeof currentPassword !== 'string') {
    return { error: 'All fields are required.' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be 6+ chars.' }
  }

  try {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (verifyError) {
      return { error: 'Incorrect current password.' }
    }

    const dbUser = await sql`SELECT last_password_change FROM users WHERE id = ${user.id}`
    const lastChange: Date | string | null | undefined = dbUser[0]?.last_password_change

    if (!checkCooldown(lastChange)) {
      return { error: 'Password can only be changed once every 30 days.' }
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      return { error: updateError.message }
    }

    await sql`UPDATE users SET last_password_change = NOW() WHERE id = ${user.id}`
    return { success: true, message: 'Password updated successfully.' }
  } catch (error) {
    console.error('[UPDATE_PASSWORD_ERROR]', { userId: user.id, error })
    return { error: 'Failed to update password.' }
  }
}

export async function deleteAccount(
  _prevState: SettingsState,
  _formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    await sql`DELETE FROM users WHERE id = ${user.id}`
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Delete Account Error:', error)
    return { error: 'Failed to delete account.' }
  }

  redirect('/login')
}
