'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteLog } from '@/lib/actions/logs'
import { LogForm } from '@/components/logs/LogForm'
import type { WorkLog, Project } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'

interface LogCardProps {
  log: WorkLog
  projects: Project[]
  canDelete?: boolean
}

export function LogCard({ log, projects, canDelete = true }: LogCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const categoryColor = CATEGORY_COLORS[log.category] ?? '#94a3b8'
  const categoryLabel = CATEGORY_LABELS[log.category] ?? log.category

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteLog(log.id)
    setDeleting(false)
    setDeleteOpen(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Log entry deleted')
    }
  }

  return (
    <>
      <Card
        id={`log-card-${log.id}`}
        className="group flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl relative overflow-hidden"
      >
        {/* Project Accent Strip */}
        {log.project && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5 opacity-60" 
            style={{ backgroundColor: log.project.color }} 
          />
        )}

        {/* Hours Column */}
        <div className="flex sm:flex-col items-center justify-center gap-1 sm:w-20 shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-primary/10"
            style={{ backgroundColor: categoryColor }}
          >
            {log.hours}
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">
            hrs
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 py-1">
          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            {log.project && (
              <div className="flex items-center gap-2 text-sm font-black text-foreground/90 uppercase tracking-tight">
                <span
                  className="w-2.5 h-2.5 rounded-full ring-4 ring-background shadow-sm"
                  style={{ backgroundColor: log.project.color }}
                />
                {log.project.name}
              </div>
            )}
            <div className="h-4 w-[1px] bg-border/60 mx-1 hidden sm:block" />
            <Badge
              variant="secondary"
              className="text-[10px] px-3 py-1 font-black uppercase tracking-widest rounded-lg border-none"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              {categoryLabel}
            </Badge>
          </div>

          {log.description ? (
            <p className="text-[15px] font-medium text-foreground/80 leading-relaxed mb-3 pr-4 italic">
              &ldquo;{log.description}&rdquo;
            </p>
          ) : (
            <p className="text-[15px] font-medium text-muted-foreground/50 leading-relaxed mb-3 italic">
              No description recorded
            </p>
          )}

          <div className="flex items-center gap-5 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              Logged {log.hours} hours
            </span>
            {log.profile && (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] text-primary font-black">
                  {log.profile.full_name?.charAt(0) || 'U'}
                </div>
                {log.profile.full_name}
              </span>
            )}
          </div>
        </div>

        {/* Refined Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-4 sm:group-hover:translate-x-0">
          <button
            id={`edit-log-${log.id}`}
            onClick={() => setEditOpen(true)}
            className="w-10 h-10 rounded-xl bg-accent/50 hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer"
            aria-label="Edit log"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              id={`delete-log-${log.id}`}
              onClick={() => setDeleteOpen(true)}
              className="w-10 h-10 rounded-xl bg-accent/50 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer"
              aria-label="Delete log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] shadow-2xl border-border/50 rounded-[2rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-accent/50 to-background border-b border-border/40">
            <DialogTitle className="text-2xl font-black tracking-tight">Edit Work Entry</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Update your activity record for precision resource tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 pt-6">
            <LogForm
              projects={projects}
              initialData={log}
              onSuccess={() => setEditOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>
              This will permanently remove the{' '}
              <span className="font-semibold">{log.hours}h</span> log from{' '}
              <span className="font-semibold">{log.project?.name ?? 'No project'}</span>. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              id={`confirm-delete-${log.id}`}
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
