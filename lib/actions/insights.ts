'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'

interface GenerateInsightsInput {
  targetUserId: string
  month: string
}

export async function generateWorkLogInsights({ targetUserId, month }: GenerateInsightsInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Authorize: user can generate their own insights; managers/admins can generate for anyone
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManagerOrAdmin = callerProfile?.role === 'manager' || callerProfile?.role === 'admin'
  if (!isManagerOrAdmin && user.id !== targetUserId) {
    return { error: 'Not authorized to generate insights for this user' }
  }

  return generateWorkLogInsightsCore(supabase, { targetUserId, month })
}

export async function generateWorkLogInsightsCore(
  supabase: SupabaseClient,
  { targetUserId, month }: { targetUserId: string; month: string }
) {
  // 2. Fetch target user's details
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', targetUserId)
    .single()

  if (!targetProfile) {
    return { error: 'Target employee profile not found.' }
  }

  // 3. Fetch logs for the selected month
  const [year, monthNum] = month.split('-').map(Number)
  const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0]
  const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0]

  const { data: logs, error: logsError } = await supabase
    .from('work_logs')
    .select('*, project:projects(name)')
    .eq('user_id', targetUserId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (logsError) {
    return { error: `Failed to query work logs: ${logsError.message}` }
  }

  if (!logs || logs.length === 0) {
    return { error: 'No work logs found for this employee in this month.' }
  }

  // 4. Format logs for the Grok AI prompt
  const formattedLogs = logs.map((log) => {
    const l = log as { date: string; project?: { name: string } | null; hours: number; category: string; description?: string | null }
    return {
      date: l.date,
      project: l.project?.name || 'No Project',
      hours: Number(l.hours),
      category: l.category,
      description: l.description || 'No description provided',
    }
  })

  const apiKey = process.env.TRACKER_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  const modelName = process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free'

  if (!apiKey) {
    return { error: 'OpenRouter API Key (TRACKER_OPENROUTER_API_KEY) is not configured.' }
  }

  const systemPrompt = `You are an expert HR coach, strategic project manager, and workplace mediator.
Your task is to analyze the monthly worklog entries of an employee and generate three distinct summaries along with specific productivity metrics.

The employee is: ${targetProfile.full_name || 'Unknown'} (Role: ${targetProfile.role || 'employee'})
The analysis is for the month of: ${month}

You MUST return a JSON object with exactly the following structure (do not include any backticks, markdown code blocks, or text outside of the raw JSON):
{
  "employee_insights": "string",
  "manager_insights": "string",
  "shared_insights": "string",
  "productivity_score": number,
  "burnout_risk": "Low" | "Medium" | "High",
  "strengths": ["string", "string"],
  "improvement": ["string", "string"],
  "next_month_goals": ["string", "string"]
}

Guidelines for each field:

1. "employee_insights":
   - Act as an empathetic, supportive, and growth-oriented HR coach.
   - Write a monthly work summary directed to the employee. Use a tone that is encouraging, collaborative, and appreciative.
   - Celebrate wins using positive, validating language.
   - Frame constructive feedback as "growth opportunities" or "learning curves," not failures.
   - Focus on how their individual work contributes to the larger team.
   - Use inclusive language (e.g., "your dedication," "together we can focus on").
   - Keep it motivating so the employee feels valued and inspired for the next month.
   - Write a single concise paragraph of 100-120 words.

2. "manager_insights":
   - Act as an objective, data-driven, and strategic executive assistant.
   - Write a monthly performance summary directed to the manager. Use a tone that is analytical, direct, concise, and professional.
   - Put the most critical data, metrics, and bottom-line impact at the very top.
   - Be completely transparent about bottlenecks, missed deadlines, or performance dips without sugarcoating.
   - Frame issues as actionable coaching points or resource gaps that the manager needs to address.
   - Focus on high-level outcomes and operational efficiency.
   - Use plain text. Write a single concise paragraph of 100-120 words.

3. "shared_insights":
   - Act as a neutral, constructive, and professional workplace mediator.
   - Write a monthly work summary accessible to both the employee and the manager. Use a tone that is objective, balanced, transparent, and forward-looking.
   - State achievements and data points factually without over-praising or over-criticizing.
   - Frame challenges neutrally as "operational bottlenecks" or "workflow blockers" to keep the conversation blame-free.
   - Ensure the language fosters a collaborative, coaching dynamic between the manager and employee.
   - Focus heavily on alignment and shared next steps for the upcoming month.
   - Write a single concise paragraph of 100-120 words.

4. "productivity_score":
   - Rate the employee's monthly productivity from 0 to 100 based on hours logged (e.g., logging ~160 hours per month or meeting targets consistently is closer to 100), quality/depth of log descriptions, and project work. Return a number.

5. "burnout_risk":
   - Rate the burnout risk as "Low", "Medium", or "High" based on hours logged (excessive hours logged in a week or over weekends/holidays indicates High/Medium risk) and work description intensity.

6. "strengths":
   - Provide a list of 2-3 specific accomplishments or strengths demonstrated in the logs.

7. "improvement":
   - Provide a list of 2-3 specific growth areas or learning curves for improvement.

8. "next_month_goals":
   - Provide a list of 2-3 actionable goals suggested for next month based on their logs.

Ensure the response contains ONLY the raw JSON object. Do not wrap the JSON in markdown formatting (like \`\`\`json ... \`\`\`).`

  const userPrompt = `Here is the worklog data for the month of ${month}:\n${JSON.stringify(formattedLogs, null, 2)}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Employee Worklog Tracker',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: `OpenRouter API error: ${response.statusText}. ${JSON.stringify(errorData)}` }
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return { error: 'Received empty response from OpenRouter.' }
    }

    // Safely parse JSON from the response
    let jsonText = content;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(json)?/, '');
      jsonText = jsonText.replace(/```$/, '');
      jsonText = jsonText.trim();
    }

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(jsonText)
    } catch (e) {
      const err = e as Error
      return { error: `Failed to parse OpenRouter JSON response: ${err.message}. Content was: ${content}` }
    }

    // Save/update insights in Database
    const { error: upsertError } = await supabase
      .from('worklog_insights')
      .upsert({
        user_id: targetUserId,
        month,
        employee_insights: parsedInsights.employee_insights,
        manager_insights: parsedInsights.manager_insights,
        shared_insights: parsedInsights.shared_insights,
        productivity_score: parsedInsights.productivity_score,
        burnout_risk: parsedInsights.burnout_risk,
        strengths: parsedInsights.strengths,
        improvement: parsedInsights.improvement,
        next_month_goals: parsedInsights.next_month_goals,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,month'
      })

    if (upsertError) {
      return { error: `Failed to save insights to database: ${upsertError.message}` }
    }

    revalidatePath('/logs')
    return { success: true, insights: parsedInsights }
  } catch (err) {
    const error = err as Error
    return { error: `Network error while calling OpenRouter: ${error.message || String(err)}` }
  }
}
