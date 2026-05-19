'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { updateWeeklyGoal } from '@/lib/actions/settings'
import type { Profile } from '@/lib/types'

interface WeeklyGoalFormProps {
  profile: Profile
  currentWeeklyHours: number
}

export function WeeklyGoalForm({ profile, currentWeeklyHours }: WeeklyGoalFormProps) {
  const [goal, setGoal] = useState(profile.weekly_goal.toString())
  const [isPending, startTransition] = useTransition()

  const goalNum = parseInt(goal) || 40
  const progress = Math.min(Math.round((currentWeeklyHours / goalNum) * 100), 100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(goal)
    if (!num || num < 1 || num > 168) {
      toast.error('Goal must be between 1 and 168 hours')
      return
    }
    startTransition(async () => {
      const result = await updateWeeklyGoal(num)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Weekly goal updated')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="bg-accent rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">This week</p>
          <span className="text-sm font-bold text-primary">
            {currentWeeklyHours}h / {goalNum}h
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {progress >= 100
            ? '🎉 Weekly goal achieved!'
            : `${Math.max(goalNum - currentWeeklyHours, 0)}h remaining`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="space-y-1.5 flex-1 max-w-xs">
          <Label htmlFor="weekly-goal">Weekly Target (hours)</Label>
          <Input
            id="weekly-goal"
            type="number"
            min="1"
            max="168"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="40"
            required
          />
        </div>
        <Button
          id="weekly-goal-save-btn"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Update Goal'}
        </Button>
      </form>
    </div>
  )
}
