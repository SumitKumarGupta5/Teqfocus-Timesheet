'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateProfile } from '@/lib/actions/settings'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [name, setName] = useState(profile.full_name ?? '')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateProfile(name)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="profile-name">Full Name</Label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Role</Label>
        <p className="text-sm text-muted-foreground capitalize bg-accent px-3 py-2 rounded-lg border border-border">
          {profile.role}
          <span className="ml-2 text-xs text-muted-foreground">(managed by Admin)</span>
        </p>
      </div>
      <Button
        id="profile-save-btn"
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? 'Saving…' : 'Save Profile'}
      </Button>
    </form>
  )
}
