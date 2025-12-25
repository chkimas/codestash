import { createClient } from '@supabase/supabase-js'

/**
 * Admin client for migrations and emergencies ONLY.
 * NEVER use in regular application flows.
 * Service role key bypasses ALL RLS policies.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  console.warn('⚠️ Using admin client - bypasses all RLS policies. Use only for migrations.')

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
