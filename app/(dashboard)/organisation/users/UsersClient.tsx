'use client'

import { useState, useTransition, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Users,
  Shield,
  Award,
  Briefcase,
  Search,
  Plus,
  Loader2,
  Eye,
  EyeOff,
  UserCheck,
  UserMinus,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, Department, UserRole } from '@/lib/types'
import { createUserAdmin, updateUserAdmin } from '@/lib/actions/organisation'
import { cn } from '@/lib/utils'

interface UsersClientProps {
  initialProfiles: Profile[]
  departments: Department[]
}

const roleColors: Record<UserRole, { bg: string; text: string; border: string; glow: string }> = {
  admin: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20 dark:border-rose-500/30',
    glow: 'shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)]'
  },
  manager: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20 dark:border-violet-500/30',
    glow: 'shadow-[0_0_15px_-3px_rgba(139,92,246,0.15)]'
  },
  employee: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]'
  }
}

export function UsersClient({ initialProfiles, departments }: UsersClientProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('all')

  // Form states for creating a new user
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>('employee')
  const [weeklyGoal, setWeeklyGoal] = useState('40')
  const [deptId, setDeptId] = useState<string>('none')
  const [isActive, setIsActive] = useState(true)

  // Derived metrics
  const stats = useMemo(() => {
    const total = profiles.length
    const admins = profiles.filter((p) => p.role === 'admin').length
    const managers = profiles.filter((p) => p.role === 'manager').length
    const employees = profiles.filter((p) => p.role === 'employee').length
    return { total, admins, managers, employees }
  }, [profiles])

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const nameMatch = (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      let deptMatch = true
      if (selectedDept === 'none') {
        deptMatch = !p.department_id
      } else if (selectedDept !== 'all') {
        deptMatch = p.department_id === selectedDept
      }

      return nameMatch && deptMatch
    })
  }, [profiles, searchQuery, selectedDept])

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Handle role change directly inside the table row
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // Optimistic update
    const previousProfiles = [...profiles]
    setProfiles(prev =>
      prev.map(p => (p.id === userId ? { ...p, role: newRole } : p))
    )

    startTransition(async () => {
      const result = await updateUserAdmin(userId, { role: newRole })
      if (result.error) {
        toast.error(`Failed to update role: ${result.error}`)
        setProfiles(previousProfiles) // rollback
      } else {
        toast.success('User role updated successfully')
      }
    })
  }

  // Handle active status toggle inside the table row
  const handleStatusToggle = (userId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    const previousProfiles = [...profiles]
    setProfiles(prev =>
      prev.map(p => (p.id === userId ? { ...p, is_active: nextStatus } : p))
    )

    startTransition(async () => {
      const result = await updateUserAdmin(userId, { isActive: nextStatus })
      if (result.error) {
        toast.error(`Failed to update status: ${result.error}`)
        setProfiles(previousProfiles) // rollback
      } else {
        toast.success(`User is now ${nextStatus ? 'active' : 'inactive'}`)
      }
    })
  }

  // Handle department change in table row
  const handleDeptChange = (userId: string, newDeptId: string) => {
    const formattedDeptId = newDeptId === 'none' ? null : newDeptId
    const targetDept = departments.find(d => d.id === formattedDeptId)
    
    const previousProfiles = [...profiles]
    setProfiles(prev =>
      prev.map(p => (p.id === userId ? { 
        ...p, 
        department_id: formattedDeptId,
        department: targetDept ? { id: targetDept.id, name: targetDept.name, code: targetDept.code, color: targetDept.color } : null
      } : p))
    )

    startTransition(async () => {
      const result = await updateUserAdmin(userId, { departmentId: formattedDeptId })
      if (result.error) {
        toast.error(`Failed to update department: ${result.error}`)
        setProfiles(previousProfiles)
      } else {
        toast.success('Department updated successfully')
      }
    })
  }

  // Form Reset
  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setRole('employee')
    setWeeklyGoal('40')
    setDeptId('none')
    setIsActive(true)
  }

  // Create User Handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) {
      toast.error('Name and Email are required')
      return
    }

    if (!password.trim()) {
      toast.error('Temporary password is required')
      return
    }

    const goal = parseInt(weeklyGoal, 10)
    if (isNaN(goal) || goal < 1 || goal > 168) {
      toast.error('Weekly goal must be between 1 and 168 hours')
      return
    }

    startTransition(async () => {
      const result = await createUserAdmin({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        weeklyGoal: goal,
        departmentId: deptId === 'none' ? null : deptId,
        isActive
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('User account and profile created successfully!')
        setIsCreateOpen(false)
        resetForm()
        
        // Reload profiles from server or update page
        // (Next.js server action revalidatePath will handle refresh, but let's refresh page component)
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
            User Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage organization members, control system roles, and assign departments.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95 duration-200 py-5 rounded-xl border-0"
        >
          <Plus className="w-5 h-5" />
          Create New User
        </Button>
      </div>

      {/* Stats Grid - Premium cards with side icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Users */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.total}</h3>
            </div>
          </div>
        </Card>

        {/* Admins */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-rose-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300 border border-rose-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admins</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.admins}</h3>
            </div>
          </div>
        </Card>

        {/* Managers */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Managers</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.managers}</h3>
            </div>
          </div>
        </Card>

        {/* Employees */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employees</p>
              <h3 className="text-3xl font-bold tracking-tight text-foreground mt-1">{stats.employees}</h3>
            </div>
          </div>
        </Card>

      </div>

      {/* Filter and Table Container */}
      <Card className="border border-border/80 bg-card/65 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        
        {/* Filters bar */}
        <div className="p-5 border-b border-border/80 bg-card/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-10 h-10 bg-background/50 border-border/60 hover:border-border transition-colors rounded-xl text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Label htmlFor="dept-filter" className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0 hidden sm:inline">
              Department
            </Label>
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger id="dept-filter" className="h-10 w-full sm:w-[220px] bg-background/50 border-border/60 rounded-xl text-sm">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="none">No Department</SelectItem>
                {departments
                  .filter((d) => d.is_active)
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {filteredProfiles.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <Users className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-semibold text-foreground/80">No registered users found</p>
              <p className="text-xs max-w-xs">Try adjusting your filters or create a new user to populate the table.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-accent/25 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Weekly Goal</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProfiles.map((p) => {
                  const initials = p.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() ?? 'U'

                  const roleStyle = roleColors[p.role]
                  
                  return (
                    <tr key={p.id} className="group hover:bg-accent/30 transition-colors duration-200">
                      {/* Name & ID Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border transition-all duration-300",
                            roleStyle.bg, roleStyle.text, roleStyle.border, roleStyle.glow
                          )}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {p.full_name ?? 'Unnamed User'}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[150px]">
                              ID: {p.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Department Select Column */}
                      <td className="py-4 px-6">
                        <Select 
                          value={p.department_id || 'none'} 
                          onValueChange={(val) => handleDeptChange(p.id, val)}
                          disabled={isPending}
                        >
                          <SelectTrigger className="h-8 border-border/50 bg-background/40 hover:bg-background/80 transition-all rounded-lg text-xs w-[160px]">
                            <SelectValue placeholder="No Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Department</SelectItem>
                            {departments
                              .filter((d) => d.is_active || d.id === p.department_id)
                              .map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                    <span>
                                      {d.name} {!d.is_active && '(Inactive)'}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Role Dropdown Select Column with Shades */}
                      <td className="py-4 px-6">
                        <Select
                          value={p.role}
                          onValueChange={(val) => handleRoleChange(p.id, val as UserRole)}
                          disabled={isPending}
                        >
                          <SelectTrigger className={cn(
                            "h-8 w-[120px] rounded-lg text-xs font-bold border capitalize transition-all duration-300",
                            roleStyle.bg,
                            roleStyle.text,
                            roleStyle.border
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee" className="text-emerald-600 dark:text-emerald-400 font-medium">Employee</SelectItem>
                            <SelectItem value="manager" className="text-violet-600 dark:text-violet-400 font-medium">Manager</SelectItem>
                            <SelectItem value="admin" className="text-rose-600 dark:text-rose-400 font-medium">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Weekly Goal Hours */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-accent text-xs font-semibold text-foreground border border-border/80">
                          {p.weekly_goal} hrs
                        </div>
                      </td>

                      {/* Status Active Toggle with Micro Animation */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(p.id, p.is_active)}
                          disabled={isPending}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                            p.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            p.is_active ? "bg-emerald-500" : "bg-muted-foreground/60"
                          )} />
                          {p.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-right text-xs text-muted-foreground font-semibold">
                        {formatDate(p.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modern Create User Modal */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-xl w-[95vw] overflow-hidden border border-white/10 dark:border-white/5 bg-card/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] p-6">
          {/* Ambient Lighting Gradients inside the dialog */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleCreateUser} className="space-y-5 relative z-10">
            <DialogHeader className="relative pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Create New User
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Register an authentication account and profile database record.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="create-fullname" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Full Name
                </Label>
                <Input
                  id="create-fullname"
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="create-email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Email Address
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="e.g. name@organisation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="create-password" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Temporary Password
                </Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/75 hover:text-indigo-500 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role & Department Row */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Role Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="create-role" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Access Role
                  </Label>
                  <Select value={role} onValueChange={(val) => setRole(val as UserRole)}>
                    <SelectTrigger id="create-role" className="w-full h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-sm transition-all duration-300 text-sm">
                      <SelectValue placeholder="Employee" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="create-dept" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Department
                  </Label>
                  <Select value={deptId} onValueChange={setDeptId}>
                    <SelectTrigger id="create-dept" className="w-full h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 shadow-sm transition-all duration-300 text-sm">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                      <SelectItem value="none">None</SelectItem>
                      {departments
                        .filter((d) => d.is_active)
                        .map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Weekly Goal & Active Status Row */}
              <div className="grid grid-cols-2 gap-4 items-end">
                
                {/* Weekly Goal Hours */}
                <div className="space-y-1.5">
                  <Label htmlFor="create-goal" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Weekly Goal (Hours)
                  </Label>
                  <Input
                    id="create-goal"
                    type="number"
                    min="1"
                    max="168"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    className="h-11 rounded-xl bg-background/35 backdrop-blur-md border border-border/50 hover:border-indigo-500/50 focus:border-indigo-500 focus-visible:ring-indigo-500/15 focus-visible:ring-offset-0 focus-visible:ring-2 shadow-sm transition-all duration-300 text-sm"
                    required
                  />
                </div>

                {/* Active Toggle Checkbox/Button */}
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
                    {isActive ? 'Account Active' : 'Account Inactive'}
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
                    Registering...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
