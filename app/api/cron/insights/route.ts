import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateWorkLogInsightsCore } from '@/lib/actions/insights'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized. Invalid or missing cron secret.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return new NextResponse(
        JSON.stringify({ error: 'Supabase credentials or service role key not configured.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client using Service Role to bypass RLS policies
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')

    if (profilesError || !profiles) {
      return new NextResponse(
        JSON.stringify({ error: `Failed to fetch profiles: ${profilesError?.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate current month in local/server time (format: YYYY-MM)
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const results = []
    for (const profile of profiles) {
      const res = await generateWorkLogInsightsCore(supabase, {
        targetUserId: profile.id,
        month: currentMonth,
      })
      results.push({
        userId: profile.id,
        name: profile.full_name,
        success: !res.error,
        error: res.error || null,
      })
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Monthly AI insights generation completed.',
        month: currentMonth,
        processedCount: profiles.length,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const error = err as Error
    return new NextResponse(
      JSON.stringify({ error: `Unexpected error: ${error.message || String(err)}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
