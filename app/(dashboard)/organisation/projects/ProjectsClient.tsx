'use client'

import { useState, useTransition, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Briefcase, 
  Plus, 
  Users, 
  Trash2, 
  Edit2, 
  Loader2, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Department, ProjectWithDetails } from '@/lib/types'
import { createProject, updateProject, deleteProject } from '@/lib/actions/projects'
import { cn } from '@/lib/utils'

interface ProjectsClientProps {
  initialProjects: ProjectWithDetails[]
  departments: Department[]
}

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#4f46e5', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
]

export function ProjectsClient({ initialProjects, departments }: ProjectsClientProps) {
  const projects = initialProjects
  const [isPending, startTransition] = useTransition()

  // Modal and Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [activeProj, setActiveProj] = useState<ProjectWithDetails | null>(null)

  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState<string>('none')
  const [color, setColor] = useState('#4f46e5')
  const [isActive, setIsActive] = useState(true)

  // Derived metrics
  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter((p) => p.is_active).length
    const totalMembers = projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)
    return { total, active, totalMembers }
  }, [projects])

  // Format Date Helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Reset form inputs
  const resetForm = () => {
    setName('')
    setDepartmentId('none')
    setColor('#4f46e5')
    setIsActive(true)
    setActiveProj(null)
  }

  // Open Create Dialog
  const openCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  // Open Edit Dialog
  const openEdit = (proj: ProjectWithDetails) => {
    setActiveProj(proj)
    setName(proj.name)
    setDepartmentId(proj.department_id || 'none')
    setColor(proj.color)
    setIsActive(proj.is_active)
    setIsEditOpen(true)
  }

  // Open Delete Confirmation
  const openDelete = (proj: ProjectWithDetails) => {
    setActiveProj(proj)
    setIsDeleteOpen(true)
  }

  // Create Project Handler
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Project Name is required')
      return
    }

    startTransition(async () => {
      const result = await createProject(
        name.trim(),
        color,
        departmentId === 'none' ? null : departmentId
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Project "${name}" created successfully`)
        setIsCreateOpen(false)
        resetForm()
        window.location.reload()
      }
    })
  }

  // Edit Project Handler
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProj) return

    if (!name.trim()) {
      toast.error('Project Name is required')
      return
    }

    startTransition(async () => {
      const result = await updateProject(
        activeProj.id,
        name.trim(),
        color,
        isActive,
        departmentId === 'none' ? null : departmentId
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Project updated successfully`)
        setIsEditOpen(false)
        resetForm()
        window.location.reload()
      }
    })
  }

  // Delete Project Handler
  const handleDelete = () => {
    if (!activeProj) return

    startTransition(async () => {
      const result = await deleteProject(activeProj.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Project "${activeProj.name}" deleted successfully`)
        setIsDeleteOpen(false)
        resetForm()
        window.location.reload()
      }
    })
  }

  // Active status quick toggle
  const handleStatusToggle = (proj: ProjectWithDetails) => {
    startTransition(async () => {
      const result = await updateProject(
        proj.id,
        proj.name,
        proj.color,
        !proj.is_active,
        proj.department_id
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Project is now ${!proj.is_active ? 'active' : 'inactive'}`)
        window.location.reload()
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header section with modern glass card look */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border/80 shadow-md rounded-2xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage company projects, assign them to departments, and track workspace contributions.
          </p>
        </div>
        <Button 
          onClick={openCreate}
          className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95 duration-200 py-5 rounded-xl border-0"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </Button>
      </div>

      {/* Stats Cards - Premium boxes with side icons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Projects */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projects</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.total}</h3>
            </div>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Projects</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.active}</h3>
            </div>
          </div>
        </Card>

        {/* Total Project Memberships */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Members</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.totalMembers}</h3>
            </div>
          </div>
        </Card>

      </div>

      {/* Projects Table */}
      <Card className="border border-border/80 bg-card/65 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <Briefcase className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-semibold text-foreground/80">No projects configured</p>
              <p className="text-xs max-w-xs">Create your first company-wide project to track work logs.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-accent/25 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">Headcount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projects.map((p) => {
                  const headcount = p.members?.length || 0
                  
                  return (
                    <tr key={p.id} className="group hover:bg-accent/30 transition-colors duration-200">
                      {/* Name & Color */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-8 rounded-md shrink-0 animate-pulse" 
                            style={{ backgroundColor: p.color }} 
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {p.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department Badge */}
                      <td className="py-4 px-6">
                        {p.department ? (
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: p.department.color || '#ccc' }} 
                            />
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              {p.department.name}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] font-medium border-border/80">
                            No Department
                          </Badge>
                        )}
                      </td>

                      {/* Headcount Number */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-accent text-xs font-bold text-foreground border border-border/80">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{headcount} members</span>
                        </div>
                      </td>

                      {/* Status Checkbox Button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(p)}
                          disabled={isPending}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                            p.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", p.is_active ? "bg-emerald-500" : "bg-muted-foreground/60")} />
                          {p.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-xs text-muted-foreground font-semibold">
                        {formatDate(p.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={() => openEdit(p)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openDelete(p)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Add Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden border border-white/10 dark:border-white/5 bg-card/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-6">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleCreate} className="space-y-5 relative z-10">
            <DialogHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Add New Project
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Create a project tracking container and assign it to a functional department.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Project Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Project Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Redesign, Mobile API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Department Section
                </Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department" className="w-full h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-sm transition-all duration-300 text-sm">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                    <SelectItem value="none">None (Company-wide)</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preset Color Circles and Active State */}
              <div className="grid grid-cols-2 gap-4 items-end">
                
                {/* Accent Color Circle List */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Accent Color
                  </Label>
                  <div className="flex gap-2.5 py-1.5 pl-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setColor(c.hex)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center shrink-0 hover:scale-110 active:scale-95",
                          color === c.hex 
                            ? "border-foreground scale-105" 
                            : "border-transparent"
                        )}
                        style={{
                          backgroundColor: c.hex,
                          boxShadow: color === c.hex ? `0 0 12px ${c.hex}80` : 'none'
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Status Check */}
                <div className="h-11 flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold w-full justify-center transition-all duration-300 shadow-sm active:scale-95",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                        : "bg-muted/40 text-muted-foreground/80 border-border/50 hover:bg-muted/60"
                    )}
                  >
                    {isActive ? 'Active Project' : 'Inactive Project'}
                  </button>
                </div>

              </div>
            </div>

            <DialogFooter className="gap-3 pt-4 border-t border-border/40 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-11 px-5 rounded-xl border-border/60 hover:bg-accent/50 text-sm font-semibold active:scale-95 transition-all duration-200"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white font-semibold text-sm border-0 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_-2px_rgba(99,102,241,0.5)] active:scale-95 transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden border border-white/10 dark:border-white/5 bg-card/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-6">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleEdit} className="space-y-5 relative z-10">
            <DialogHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Edit Project
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Modify project details, update color accent, and change department mappings.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Project Name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Project Name
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Acme Redesign, Mobile API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-department" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Department Section
                </Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="edit-department" className="w-full h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-sm transition-all duration-300 text-sm">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                    <SelectItem value="none">None (Company-wide)</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preset Color Circles and Active State */}
              <div className="grid grid-cols-2 gap-4 items-end">
                
                {/* Accent Color Circle List */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Accent Color
                  </Label>
                  <div className="flex gap-2.5 py-1.5 pl-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setColor(c.hex)}
                        className={cn(
                          "w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center shrink-0 hover:scale-110 active:scale-95",
                          color === c.hex 
                            ? "border-foreground scale-105" 
                            : "border-transparent"
                        )}
                        style={{
                          backgroundColor: c.hex,
                          boxShadow: color === c.hex ? `0 0 12px ${c.hex}80` : 'none'
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Status Check */}
                <div className="h-11 flex items-center justify-start">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold w-full justify-center transition-all duration-300 shadow-sm active:scale-95",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                        : "bg-muted/40 text-muted-foreground/80 border-border/50 hover:bg-muted/60"
                    )}
                  >
                    {isActive ? 'Active Project' : 'Inactive Project'}
                  </button>
                </div>

              </div>
            </div>

            <DialogFooter className="gap-3 pt-4 border-t border-border/40 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="h-11 px-5 rounded-xl border-border/60 hover:bg-accent/50 text-sm font-semibold active:scale-95 transition-all duration-200"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-400 text-white font-semibold text-sm border-0 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_25px_-2px_rgba(245,158,11,0.5)] active:scale-95 transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => {
        setIsDeleteOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-md w-[95vw] overflow-hidden border border-white/10 dark:border-white/5 bg-card/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-6">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.25)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Delete Project?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm permanent deletion of this project.
                </p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed pl-1">
              Are you sure you want to delete the project <strong>{activeProj?.name}</strong>? 
              This will permanently delete the project and disassociate all members. Existing work logs referencing this project will be kept but the project reference will become null.
            </p>

            <div className="flex gap-3 pt-4 border-t border-border/40 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                className="h-10 px-4 rounded-xl border-border/60 hover:bg-accent/50 text-xs font-semibold active:scale-95 transition-all duration-200"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs border-0 shadow-[0_4px_15px_-4px_rgba(244,63,94,0.4)] active:scale-95 transition-all duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  'Delete Project'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
