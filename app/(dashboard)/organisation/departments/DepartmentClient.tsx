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
  Building2, 
  Plus, 
  Users, 
  Trash2, 
  Edit2, 
  Loader2, 
  AlertTriangle,
  UserCheck,
  UserMinus,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, Department } from '@/lib/types'
import { createDepartment, updateDepartment, deleteDepartment } from '@/lib/actions/organisation'
import { cn } from '@/lib/utils'

interface DepartmentClientProps {
  initialDepartments: Department[]
  profiles: Profile[]
}

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#4f46e5', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
]

export function DepartmentClient({ initialDepartments, profiles }: DepartmentClientProps) {
  const departments = initialDepartments
  const [isPending, startTransition] = useTransition()

  // Modal and Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [activeDep, setActiveDep] = useState<Department | null>(null)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [managerId, setManagerId] = useState<string>('none')
  const [color, setColor] = useState('#4f46e5')
  const [isActive, setIsActive] = useState(true)

  // Derived metrics
  const stats = useMemo(() => {
    const total = departments.length
    const active = departments.filter((d) => d.is_active).length
    const assigned = profiles.filter((p) => p.department_id).length
    const unassigned = profiles.filter((p) => !p.department_id).length
    return { total, active, assigned, unassigned }
  }, [departments, profiles])

  // Get headcount for a department
  const getHeadcount = (deptId: string) => {
    return profiles.filter((p) => p.department_id === deptId).length
  }

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
    setCode('')
    setManagerId('none')
    setColor('#4f46e5')
    setIsActive(true)
    setActiveDep(null)
  }

  // Open Create Dialog
  const openCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  // Open Edit Dialog
  const openEdit = (dep: Department) => {
    setActiveDep(dep)
    setName(dep.name)
    setCode(dep.code)
    setManagerId(dep.manager_id || 'none')
    setColor(dep.color)
    setIsActive(dep.is_active)
    setIsEditOpen(true)
  }

  // Open Delete Confirmation
  const openDelete = (dep: Department) => {
    setActiveDep(dep)
    setIsDeleteOpen(true)
  }

  // Create Department Handler
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      toast.error('Department Name and Code are required')
      return
    }

    startTransition(async () => {
      const result = await createDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        manager_id: managerId === 'none' ? null : managerId,
        color,
        is_active: isActive
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Department "${name}" created successfully`)
        setIsCreateOpen(false)
        resetForm()
        window.location.reload()
      }
    })
  }

  // Edit Department Handler
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeDep) return

    if (!name.trim() || !code.trim()) {
      toast.error('Department Name and Code are required')
      return
    }

    startTransition(async () => {
      const result = await updateDepartment(activeDep.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        manager_id: managerId === 'none' ? null : managerId,
        color,
        is_active: isActive
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Department updated successfully`)
        setIsEditOpen(false)
        resetForm()
        window.location.reload()
      }
    })
  }

  // Delete Department Handler
  const handleDelete = () => {
    if (!activeDep) return

    startTransition(async () => {
      const result = await deleteDepartment(activeDep.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Department "${activeDep.name}" deleted successfully`)
        setIsDeleteOpen(false)
        resetForm()
        window.location.reload()
      }
    })
  }

  // Active status quick toggle
  const handleStatusToggle = (dep: Department) => {
    startTransition(async () => {
      const result = await updateDepartment(dep.id, {
        name: dep.name,
        code: dep.code,
        manager_id: dep.manager_id,
        color: dep.color,
        is_active: !dep.is_active
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Department is now ${!dep.is_active ? 'active' : 'inactive'}`)
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
            Departments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organise organization members into functional units and delegate managers.
          </p>
        </div>
        <Button 
          onClick={openCreate}
          className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95 duration-200 py-5 rounded-xl border-0"
        >
          <Plus className="w-5 h-5" />
          Add Department
        </Button>
      </div>

      {/* Stats Cards - Premium boxes with side icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Departments */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departments</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.total}</h3>
            </div>
          </div>
        </Card>

        {/* Active Departments */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Units</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.active}</h3>
            </div>
          </div>
        </Card>

        {/* Assigned Members */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Members</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.assigned}</h3>
            </div>
          </div>
        </Card>

        {/* Unassigned Members */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
              <UserMinus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unassigned</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.unassigned}</h3>
            </div>
          </div>
        </Card>

      </div>

      {/* Departments Table */}
      <Card className="border border-border/80 bg-card/65 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {departments.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <Building2 className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-semibold text-foreground/80">No departments configured</p>
              <p className="text-xs max-w-xs">Create your first department unit to organize your workspace employees.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-accent/25 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Manager / Head</th>
                  <th className="py-4 px-6 text-center">Headcount</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {departments.map((d) => {
                  const headcount = getHeadcount(d.id)
                  const colorPreset = PRESET_COLORS.find((c) => c.hex === d.color) || PRESET_COLORS[0]
                  
                  return (
                    <tr key={d.id} className="group hover:bg-accent/30 transition-colors duration-200">
                      {/* Name & Code */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-8 rounded-md shrink-0" 
                            style={{ backgroundColor: d.color }} 
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {d.name}
                            </p>
                            <Badge variant="outline" className={cn("uppercase tracking-wide text-[9px] font-bold mt-1 px-1.5 py-0.2", colorPreset.bg)}>
                              {d.code}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Manager Profile Info */}
                      <td className="py-4 px-6">
                        {d.manager ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-bold flex items-center justify-center">
                              {d.manager.full_name?.charAt(0).toUpperCase() || 'M'}
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {d.manager.full_name}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] font-medium border-border/80">
                            Unassigned
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
                          onClick={() => handleStatusToggle(d)}
                          disabled={isPending}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                            d.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", d.is_active ? "bg-emerald-500" : "bg-muted-foreground/60")} />
                          {d.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-xs text-muted-foreground font-semibold">
                        {formatDate(d.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={() => openEdit(d)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => openDelete(d)}
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

      {/* Add Department Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden border border-white/10 dark:border-white/5 bg-card/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-6">
          {/* Ambient Lighting Gradients inside the dialog */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleCreate} className="space-y-5 relative z-10">
            <DialogHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Add New Department
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Create an operational team unit for membership sorting and aggregate reports.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Department Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Department Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Sales, Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Department Code */}
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Department Code
                </Label>
                <Input
                  id="code"
                  placeholder="e.g. ENG, SL, MKT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Manager Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="manager" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Manager / Head of Unit
                </Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger id="manager" className="w-full h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-sm transition-all duration-300 text-sm">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                    <SelectItem value="none">None Assigned</SelectItem>
                    {profiles
                      .filter((p) => p.role === 'admin' || p.role === 'manager')
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name} ({p.role})
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
                    {isActive ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                    {isActive ? 'Active Unit' : 'Inactive Unit'}
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
                  'Create Department'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden border border-white/10 dark:border-white/5 bg-card/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-6">
          {/* Ambient Lighting Gradients inside the dialog */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleEdit} className="space-y-5 relative z-10">
            <DialogHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Edit Department
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Modify operational variables and manager allocation for this team unit.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Department Name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Department Name
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Sales, Marketing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Department Code */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-code" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Department Code
                </Label>
                <Input
                  id="edit-code"
                  placeholder="e.g. ENG, SL, MKT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Manager Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-manager" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Manager / Head of Unit
                </Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger id="edit-manager" className="w-full h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-sm transition-all duration-300 text-sm">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                    <SelectItem value="none">None Assigned</SelectItem>
                    {profiles
                      .filter((p) => p.role === 'admin' || p.role === 'manager')
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name} ({p.role})
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
                    {isActive ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                    {isActive ? 'Active Unit' : 'Inactive Unit'}
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
          {/* Ambient Lighting Gradients inside the dialog */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.25)]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Delete Department?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm permanent deletion of this operational unit.
                </p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed pl-1">
              Are you sure you want to delete the department <strong>{activeDep?.name}</strong>? 
              This will permanently delete the operational unit. All currently assigned members will be set to having <strong>No Department</strong>.
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
                  'Delete Unit'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
