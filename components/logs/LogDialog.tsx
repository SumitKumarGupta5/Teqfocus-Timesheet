'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LogForm } from '@/components/logs/LogForm'
import type { Project } from '@/lib/types'

interface LogDialogProps {
  projects: Project[]
}

export function LogDialog({ projects }: LogDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="add-log-btn" className="gap-2 shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1020px] w-[96vw] max-h-[90vh] flex flex-col shadow-2xl border-border/50 p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 md:px-8 pt-5 md:pt-6 pb-3.5 border-b border-border/30 shrink-0">
          <DialogTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            New Work Entry
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-0.5">
            Record your daily activity with ±15 min precision for accurate resource tracking.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8 pt-3">
          <LogForm projects={projects} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
