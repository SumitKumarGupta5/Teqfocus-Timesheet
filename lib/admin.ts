import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a server-side administrative Supabase client using the service role key.
 * This client bypasses RLS and can perform administrative actions like creating/deleting
 * users in auth.users.
 * 
 * CRITICAL: NEVER import this file in client-side code ('use client').
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient cannot be called from the browser')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
