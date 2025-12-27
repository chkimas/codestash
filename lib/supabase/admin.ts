// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

function getAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return { url, serviceRoleKey }
}

/**
 * Admin client for migrations and emergencies ONLY.
 * NEVER use in regular application flows.
 * Service role key bypasses ALL RLS policies.
 */
export function createAdminClient(): SupabaseClient<Database> {
  const { url, serviceRoleKey } = getAdminEnv()

  console.warn('⚠️ Using admin client - bypasses all RLS policies. Use only for migrations.')

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
