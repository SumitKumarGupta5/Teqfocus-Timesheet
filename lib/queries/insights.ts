import { createClient } from '@/lib/server'

export interface WorkLogInsight {
  id: string
  user_id: string
  month: string
  employee_insights: string
  manager_insights: string
  shared_insights: string
  productivity_score: number
  burnout_risk: 'Low' | 'Medium' | 'High'
  strengths: string[]
  improvement: string[]
  next_month_goals: string[]
  created_at: string
  updated_at: string
}

export async function getWorkLogInsight(targetUserId: string, month: string): Promise<WorkLogInsight | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('worklog_insights')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('month', month)
    .single()

  if (error || !data) return null
  return data as unknown as WorkLogInsight
}
