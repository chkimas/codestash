'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ProfileSchema } from '@/lib/definitions'
import { checkCooldown } from '@/lib/utils'
import QRCode from 'qrcode'

export type SettingsState =
  | {
      message?: string
      error?: string
      success?: boolean
    }
  | undefined

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

  const bio = formData.get('bio') as string | null

  if (!parsed.success) {
    return { error: 'Invalid input format.' }
  }

  const { name, avatar } = parsed.data
  const successes: string[] = []
  const errors: string[] = []

  let newAvatarUrl: string | undefined
  let nameUpdated = false
  let bioUpdated = false

  // Handle avatar upload
  if (avatar && avatar.size > 0) {
    if (avatar.size > 2 * 1024 * 1024) {
      errors.push('Image too large (Max 2MB)')
    } else {
      try {
        // Get current avatar
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('image')
          .eq('id', user.id)
          .single()

        if (fetchError) throw fetchError

        const oldUrl = currentUser?.image

        // Delete old avatar if exists
        if (oldUrl && oldUrl.includes('avatars/')) {
          const oldPath = oldUrl.split('/avatars/').pop()
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath])
          }
        }

        // Upload new avatar
        const filePath = `${user.id}/${Date.now()}-${avatar.name}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, { upsert: true })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
        newAvatarUrl = urlData.publicUrl

        // Update user record
        const { error: updateError } = await supabase
          .from('users')
          .update({ image: newAvatarUrl })
          .eq('id', user.id)

        if (updateError) throw updateError

        successes.push('Avatar updated')
      } catch (e) {
        console.error('Avatar Update Error:', e)
        errors.push('Image upload failed')
      }
    }
  }

  // Handle bio update
  if (bio !== null) {
    try {
      const truncatedBio = bio.slice(0, 160)
      const { error: updateError } = await supabase
        .from('users')
        .update({ bio: truncatedBio })
        .eq('id', user.id)

      if (updateError) throw updateError

      bioUpdated = true
    } catch (e) {
      console.error('Bio Update Error:', e)
      errors.push('Bio update failed')
    }
  }

  // Handle name update
  if (name) {
    try {
      // Get last name change date
      const { data: dbUser, error: fetchError } = await supabase
        .from('users')
        .select('last_name_change')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      const lastChange = dbUser?.last_name_change

      // Check cooldown
      if (!checkCooldown(lastChange)) {
        errors.push('Name blocked (30-day cooldown)')
      } else {
        // Update name
        const { error: updateError } = await supabase
          .from('users')
          .update({ name: name, last_name_change: new Date().toISOString() })
          .eq('id', user.id)

        if (updateError) throw updateError

        nameUpdated = true
        successes.push('Name updated')
      }
    } catch (e) {
      console.error('Name Update Error:', e)
      errors.push('Name update failed')
    }
  }

  // Update auth metadata if name or avatar changed
  if (nameUpdated || newAvatarUrl) {
    const updateData: { full_name?: string; avatar_url?: string } = {}

    if (nameUpdated) updateData.full_name = name
    if (newAvatarUrl) updateData.avatar_url = newAvatarUrl

    await supabase.auth.updateUser({ data: updateData })
  }

  // Revalidate if any updates
  if (nameUpdated || newAvatarUrl || bioUpdated) {
    revalidatePath('/', 'layout')
  }

  // Return appropriate response
  if (errors.length > 0 && successes.length > 0) {
    return {
      error: `${successes.join(', but ')}. ${errors.join(', ')}.`,
      success: false
    }
  } else if (errors.length > 0) {
    return { error: errors.join('. ') }
  } else if (successes.length > 0 || bioUpdated) {
    return { success: true, message: 'Profile updated successfully.' }
  }

  return { message: 'No changes made.' }
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
    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (verifyError) {
      return { error: 'Incorrect current password.' }
    }

    // Check cooldown
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('last_email_change')
      .eq('id', user.id)
      .single()

    if (fetchError) throw fetchError

    if (!checkCooldown(dbUser?.last_email_change)) {
      return { error: 'Email can only be changed once every 30 days.' }
    }

    // Update email
    const { error: updateError } = await supabase.auth.updateUser({ email })
    if (updateError) {
      return { error: updateError.message }
    }

    // Update last change timestamp
    await supabase
      .from('users')
      .update({ last_email_change: new Date().toISOString() })
      .eq('id', user.id)

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
    // Verify current password
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (verifyError) {
      return { error: 'Incorrect current password.' }
    }

    // Check cooldown
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('last_password_change')
      .eq('id', user.id)
      .single()

    if (fetchError) throw fetchError

    if (!checkCooldown(dbUser?.last_password_change)) {
      return { error: 'Password can only be changed once every 30 days.' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      return { error: updateError.message }
    }

    // Update last change timestamp
    await supabase
      .from('users')
      .update({ last_password_change: new Date().toISOString() })
      .eq('id', user.id)

    return { success: true, message: 'Password updated successfully.' }
  } catch (error) {
    console.error('[UPDATE_PASSWORD_ERROR]', { userId: user.id, error })
    return { error: 'Failed to update password.' }
  }
}

export async function deleteAccount(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  void prevState
  void formData

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    // Use Supabase admin API for account deletion
    // Note: This requires SUPABASE_SERVICE_ROLE_KEY
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Service role key not configured')
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) throw error

    // Sign out current session
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Delete Account Error:', error)
    return { error: 'Failed to delete account. Please try again.' }
  }

  redirect('/login')
}

// MFA Functions
export async function startMFAEnrollment() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: user.email || 'CodeStash'
    })

    if (error) throw error

    const qrCode = await QRCode.toDataURL(data.totp.uri)

    return {
      success: true,
      factorId: data.id,
      qrCode,
      secret: data.totp.secret
    }
  } catch (error) {
    console.error('MFA Start Error:', error)
    return { error: 'Failed to start MFA enrollment.' }
  }
}

export async function verifyAndEnableMFA(factorId: string, code: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })

    if (error) throw error

    return { success: true, message: 'MFA enabled successfully.' }
  } catch (error) {
    console.error('MFA Verify Error:', error)
    return { error: 'Invalid code. Please try again.' }
  }
}

export async function disableMFA() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const totpFactor = factors?.totp?.find((f) => f.status === 'verified')

  if (!totpFactor) return { error: 'No active MFA found.' }

  await supabase.auth.mfa.unenroll({ factorId: totpFactor.id })
  revalidatePath('/settings')
  return { success: true, message: 'MFA disabled.' }
}
