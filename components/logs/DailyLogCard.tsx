'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowRight, 
  Clock, 
  History, 
  ClipboardX,
  Calendar,
  Copy,
  Check,
  Pencil,
  Trash2,
  User,
  Folder,
  Briefcase
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteLog } from '@/lib/actions/logs'
import { LogForm } from '@/components/logs/LogForm'
import type { WorkLog, Project } from '@/lib/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/types'

interface DailyLogCardProps {
  date: string
  logs: WorkLog[]
  totalHours: number
  projects: Project[]
}

export function DailyLogCard({ date, logs, totalHours, projects }: DailyLogCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeLogIndex, setActiveLogIndex] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const formattedDate = new Date(date + 'T00:00:00')
  const fullDateDisplay = formattedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })

  // Determine local Today and Yesterday strings in YYYY-MM-DD format
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
  const yesterdayObj = new Date()
  yesterdayObj.setDate(yesterdayObj.getDate() - 1)
  const yesterdayStr = `${yesterdayObj.getFullYear()}-${String(yesterdayObj.getMonth() + 1).padStart(2, '0')}-${String(yesterdayObj.getDate()).padStart(2, '0')}`

  let dateDisplay = ''
  let dayName = ''

  if (date === todayStr) {
    dateDisplay = 'Today'
    dayName = formattedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } else if (date === yesterdayStr) {
    dateDisplay = 'Yesterday'
    dayName = formattedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  } else {
    dateDisplay = formattedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dayName = formattedDate.toLocaleDateString('en-US', { weekday: 'short' })
  }

  return (
    <>
      <Card 
        className="flex flex-col h-[420px] w-full bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-[2rem] overflow-hidden group"
      >
        {/* Card Header */}
        <div className="p-8 pb-4 flex items-start justify-between">
          <div className="space-y-1.5">
            <h3 className="text-3xl font-black tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
              {dateDisplay}
            </h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-70">
              {dayName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="bg-primary/10 text-primary px-4 py-1.5 text-base font-black rounded-2xl transition-all group-hover:bg-primary group-hover:text-primary-foreground">
              {totalHours.toFixed(1)}h
            </div>
            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Logged Time</span>
          </div>
        </div>

        {/* Entry Preview List */}
        <div className="flex-1 px-8 overflow-hidden relative">
          <div className="space-y-5 pt-4">
            {logs.slice(0, 3).map((log) => (
              <div key={log.id} className="relative pl-5 border-l-[3px] border-border/60 group-hover:border-primary/30 transition-all">
                <div className="flex items-center gap-2.5 mb-1.5">
                  {log.project && (
                    <span 
                      className="w-2 h-2 rounded-full ring-2 ring-background" 
                      style={{ backgroundColor: log.project.color }} 
                    />
                  )}
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate max-w-[150px]">
                    {log.project?.name ?? 'Internal Task'}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-foreground/70 line-clamp-2 leading-relaxed group-hover:text-foreground/90 transition-colors">
                  {log.description || 'Routine work maintenance'}
                </p>
              </div>
            ))}
            
            {logs.length > 3 && (
              <div className="flex items-center gap-2 pt-2 pl-5">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(logs.length - 3, 3))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      +
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-bold text-primary/70 uppercase tracking-wider">
                  {logs.length - 3} more items
                </p>
              </div>
            )}

            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center pt-12 opacity-20 group-hover:opacity-40 transition-opacity">
                <Clock className="w-10 h-10 mb-3" />
                <p className="text-sm font-black uppercase tracking-widest">Day Empty</p>
              </div>
            )}
          </div>
          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card/80 to-transparent pointer-events-none group-hover:from-card/40 transition-all" />
        </div>

        {/* Action Footer */}
        <div className="p-8 pt-4">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailOpen(true);
            }}
            className="w-full h-14 rounded-2xl bg-accent/50 hover:bg-primary text-foreground hover:text-primary-foreground border border-border/60 hover:border-primary transition-all duration-300 group/btn shadow-sm relative overflow-hidden flex items-center justify-between px-5 pr-4 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-primary group-hover/btn:text-primary-foreground transition-colors" />
              <span className="font-black text-[11px] uppercase tracking-[0.2em]">Daily Overview</span>
            </div>
            <div className="flex items-center justify-center bg-background group-hover/btn:bg-primary-foreground/20 w-8 h-8 rounded-xl transition-all duration-300 overflow-hidden">
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </div>
          </Button>
        </div>
      </Card>

      {/* Detail Slide-over */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-[640px] w-full p-0 flex flex-col border-l border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl" aria-describedby={undefined}>
          {logs.length > 0 ? (
            (() => {
              const activeLog = logs[activeLogIndex] || logs[0];
              const categoryColor = CATEGORY_COLORS[activeLog.category] ?? '#4f46e5';
              const categoryLabel = CATEGORY_LABELS[activeLog.category] ?? activeLog.category;
              
              const copyToClipboard = (text: string) => {
                navigator.clipboard.writeText(text);
                toast.success('Copied to clipboard');
              };

              return (
                <>
                  {/* Header: Project / Category title */}
                  <SheetHeader className="p-6 pb-4 border-b border-border/40 text-left relative shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: categoryColor }} 
                      />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {categoryLabel}
                      </span>
                    </div>
                    
                    {/* Date & total log time */}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Calendar className="w-5 h-5 text-primary/70" />
                        <SheetTitle className="text-base font-black tracking-tight text-foreground">{fullDateDisplay}</SheetTitle>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block opacity-60">
                          TOTAL TIME
                        </span>
                        <span className="text-2xl font-black text-primary leading-none">
                          {totalHours.toFixed(1)}h
                        </span>
                      </div>
                    </div>

                    {/* Multiple logs entry selector (tabs style) */}
                    {logs.length > 1 && (
                      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                        {logs.map((log, idx) => (
                          <button
                            key={log.id}
                            onClick={() => {
                              setActiveLogIndex(idx);
                              setDescExpanded(false);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all shrink-0 cursor-pointer ${
                              idx === activeLogIndex
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-accent/40 text-muted-foreground border-border/50 hover:bg-accent/70'
                            }`}
                          >
                            {log.project?.name.substring(0, 10) || CATEGORY_LABELS[log.category].substring(0, 10)} ({log.hours}h)
                          </button>
                        ))}
                      </div>
                    )}
                  </SheetHeader>

                  {/* Main content body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {/* Time & Details Box (grey container) */}
                    <div className="bg-accent/30 border border-border/50 rounded-2xl p-4 grid grid-cols-3 gap-4 divide-x divide-border/40">
                      <div className="flex flex-col items-center justify-center text-center p-1">
                        <Clock className="w-5 h-5 text-primary mb-1" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Time Tracked</span>
                        <span className="text-base font-black text-foreground mt-0.5">{activeLog.hours}h</span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center p-1 pl-4">
                        <Briefcase className="w-5 h-5 text-primary mb-1" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Category</span>
                        <span className="text-xs font-black text-foreground mt-0.5 truncate max-w-full">
                          {CATEGORY_LABELS[activeLog.category]}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center p-1 pl-4">
                        <Check className="w-5 h-5 text-primary mb-1" />
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type</span>
                        <span className="text-xs font-black text-foreground mt-0.5">
                          {activeLog.category === 'on_project' ? 'Billable' : 'Internal'}
                        </span>
                      </div>
                    </div>

                    {/* Project Section */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project</h4>
                      <div className="flex items-center justify-between bg-card border border-border/40 p-3.5 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          {activeLog.project && (
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: activeLog.project.color }} 
                            />
                          )}
                          <span className="text-sm font-bold text-foreground">
                            {activeLog.project?.name || 'Internal / Non-Project'}
                          </span>
                        </div>
                        {activeLog.project && (
                          <button 
                            onClick={() => copyToClipboard(activeLog.project?.name || '')}
                            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            title="Copy project name"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</h4>
                      <div className="bg-card border border-border/40 p-4 rounded-xl leading-relaxed text-sm text-foreground/80">
                        {activeLog.description ? (
                          <div>
                            <p className={!descExpanded && activeLog.description.length > 150 ? "line-clamp-3" : ""}>
                              {activeLog.description}
                            </p>
                            {activeLog.description.length > 150 && (
                              <button
                                onClick={() => setDescExpanded(!descExpanded)}
                                className="text-primary hover:underline text-[12px] font-bold mt-2 flex items-center gap-1 cursor-pointer"
                              >
                                {descExpanded ? 'Show less' : 'Show more'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="italic text-muted-foreground/60">No description recorded for this entry.</p>
                        )}
                      </div>
                    </div>

                    {/* Badges list */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[11px] font-bold border border-primary/10">
                        <Check className="w-3.5 h-3.5" />
                        Verified Entry
                      </span>
                      {activeLog.category === 'on_project' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 text-emerald-600 text-[11px] font-bold border border-emerald-500/10">
                          <Check className="w-3.5 h-3.5" />
                          Billable Hours
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 text-amber-600 text-[11px] font-bold border border-amber-500/10">
                        <Check className="w-3.5 h-3.5" />
                        Compliance Checked
                      </span>
                    </div>

                    <hr className="border-border/30" />

                    {/* Details Table */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>Logged By</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] text-primary font-black">
                            {activeLog.profile?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-foreground">{activeLog.profile?.full_name || 'System User'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span>Role</span>
                        </div>
                        <span className="font-bold text-foreground capitalize">{activeLog.profile?.role || 'Employee'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1 border-b border-border/10">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Folder className="w-4 h-4" />
                          <span>Work Type</span>
                        </div>
                        <span className="font-bold text-foreground">{categoryLabel}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Logged Date</span>
                        </div>
                        <span className="font-bold text-foreground">{activeLog.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 border-t border-border/40 grid grid-cols-2 gap-4 shrink-0 bg-background/50">
                    <Button
                      onClick={() => setEditOpen(true)}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-primary/30 hover:border-primary text-foreground font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-primary/5"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeleteOpen(true)}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-destructive/30 hover:border-destructive hover:bg-destructive/5 text-destructive font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
              <ClipboardX className="w-16 h-16 mb-4" />
              <p className="text-lg font-bold">No entries found</p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      {logs.length > 0 && (
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
                initialData={logs[activeLogIndex] || logs[0]}
                onSuccess={() => {
                  setEditOpen(false);
                  setIsDetailOpen(false); // Close details to refresh
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm Dialog */}
      {logs.length > 0 && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete entry?</DialogTitle>
              <DialogDescription>
                This will permanently remove the{' '}
                <span className="font-semibold">{(logs[activeLogIndex] || logs[0]).hours}h</span> log from{' '}
                <span className="font-semibold">{(logs[activeLogIndex] || logs[0]).project?.name ?? 'No project'}</span>. This
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
                id={`confirm-delete-${(logs[activeLogIndex] || logs[0]).id}`}
                variant="destructive"
                size="sm"
                onClick={async () => {
                  const activeLog = logs[activeLogIndex] || logs[0];
                  setDeleting(true);
                  const result = await deleteLog(activeLog.id);
                  setDeleting(false);
                  setDeleteOpen(false);
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.success('Log entry deleted');
                    setIsDetailOpen(false); // Close side-over
                    if (activeLogIndex >= logs.length - 1 && activeLogIndex > 0) {
                      setActiveLogIndex(activeLogIndex - 1);
                    }
                  }
                }}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
