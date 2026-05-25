'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Users,
  Building,
  Mail,
  Clock,
  Briefcase,
  ChevronRight,
  UserCheck,
  Award,
  Copy,
  Check,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TeamMemberDetails, Department } from '@/lib/types'

interface ManagerUsersClientProps {
  initialTeam: TeamMemberDetails[]
  departments: Department[]
}

export function ManagerUsersClient({ initialTeam, departments }: ManagerUsersClientProps) {
  const [team] = useState<TeamMemberDetails[]>(initialTeam)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<TeamMemberDetails | null>(null)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // Filter team members based on search queries and department
  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const matchSearch =
        (member.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchDept = selectedDeptId === 'all' || member.department_id === selectedDeptId

      return matchSearch && matchDept
    })
  }, [team, searchQuery, selectedDeptId])

  // Derive page statistics
  const stats = useMemo(() => {
    const total = team.length
    const active = team.filter((m) => m.is_active).length
    const totalHours = team.reduce((sum, m) => sum + (m.weekly_hours || 0), 0)
    const avgHours = total > 0 ? (totalHours / total).toFixed(1) : '0'

    return { total, active, avgHours }
  }, [team])

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(true)
    toast.success('Email address copied to clipboard!')
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  // Format creation date (Member Since)
  const formatMemberSince = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Standard Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border/80 shadow-sm rounded-2xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Team Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor workloads, projects, and goals for employees in departments you manage.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-border/60 hover:border-border transition-colors rounded-xl text-sm"
            />
          </div>

          {/* Department Filter (Only if manages multiple departments) */}
          {departments.length > 0 && (
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
              <SelectTrigger className="h-10 w-full sm:w-56 rounded-xl bg-background/50 border-border/60 hover:border-border transition-all text-xs text-left">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border border-border/80 rounded-xl">
                <SelectItem value="all" className="text-xs">
                  All Managed Departments
                </SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id} className="text-xs">
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="group relative overflow-hidden p-5 border border-border bg-card/60 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Team</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.total} members</h3>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden p-5 border border-border bg-card/60 backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300 border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Status</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.active} active</h3>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden p-5 border border-border bg-card/60 backdrop-blur-md hover:border-amber-500/30 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. Hours Logged</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.avgHours}h / week</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Directory Grid */}
      {filteredTeam.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card/40 backdrop-blur-md border border-border/80 rounded-2xl text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No employees found</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            {searchQuery || selectedDeptId !== 'all'
              ? "We couldn't find any team members matching your filter or search criteria."
              : 'There are no active employees under your managed departments.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => {
            const goal = member.weekly_goal || 40
            const hours = member.weekly_hours || 0
            const progressVal = Math.min(Math.round((hours / goal) * 100), 100)

            return (
              <Card
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="group relative cursor-pointer overflow-hidden bg-card/65 backdrop-blur-xl border border-border/85 hover:border-indigo-500/35 hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col justify-between"
              >
                {/* Visual Accent Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
                  style={{ backgroundColor: member.department?.color || 'var(--primary)' }}
                />

                <CardContent className="p-6 pt-7 space-y-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0 border-2 border-background shadow-sm">
                        <AvatarImage
                          src={member.avatar_url || undefined}
                          alt={member.full_name || 'Employee'}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                          {member.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                          {member.full_name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>

                    {/* Status Dot / Active Indicator */}
                    <div className="flex shrink-0">
                      {member.is_active ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Department & Projects Info */}
                  <div className="flex items-center justify-between border-y border-border/40 py-3.5 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Department
                      </span>
                      {member.department ? (
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: member.department.color || '#ccc' }}
                          />
                          {member.department.name} ({member.department.code})
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic">Unassigned</span>
                      )}
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Projects
                      </span>
                      <span className="font-bold text-foreground">
                        {member.projects?.length || 0} assigned
                      </span>
                    </div>
                  </div>

                  {/* Weekly Goal Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                        Weekly Progress
                      </span>
                      <span className="text-foreground font-extrabold">
                        {hours}h <span className="text-muted-foreground/50">/ {goal}h</span>
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={progressVal} className="h-2 rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium pt-0.5">
                      <span>{progressVal}% completed</span>
                      {progressVal >= 100 ? (
                        <span className="text-emerald-500 font-bold">Goal Met! 🎉</span>
                      ) : (
                        <span>{Math.max(0, goal - hours)}h remaining</span>
                      )}
                    </div>
                  </div>

                  {/* View Details Action Link */}
                  <div className="flex items-center justify-end text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200">
                    <span className="flex items-center gap-1">
                      View Profile Details
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Slide-over Profile Detail Sheet */}
      <Sheet open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent className="sm:max-w-md w-full p-0 flex flex-col h-full bg-card overflow-hidden border-l border-border/80 shadow-2xl">
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/30 shrink-0">
            <div className="flex items-start justify-between gap-4 mt-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                  <AvatarImage
                    src={selectedMember?.avatar_url || undefined}
                    alt={selectedMember?.full_name || 'Employee'}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                    {selectedMember?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl font-extrabold text-foreground tracking-tight">
                    {selectedMember?.full_name}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground capitalize font-semibold flex items-center gap-1.5 mt-0.5">
                    <Badge variant="secondary" className="px-2 py-0 h-4.5 rounded-md font-bold uppercase text-[9px]">
                      {selectedMember?.role}
                    </Badge>
                    {selectedMember?.is_active ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0 h-4.5 font-bold rounded-md">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[9px] px-1.5 py-0 h-4.5 font-bold rounded-md">
                        Inactive
                      </Badge>
                    )}
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Scrollable details view */}
          {selectedMember && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Contact Info Widget */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Contact Details
                </span>
                <div className="flex items-center justify-between p-3.5 bg-background/50 border border-border/60 rounded-xl group/email">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate select-all">
                      {selectedMember.email}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 active:scale-95 shrink-0"
                    onClick={() => handleCopyEmail(selectedMember.email || '')}
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Department Placement */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Department Placement
                </span>
                <div className="flex items-center justify-between p-3.5 bg-background/50 border border-border/60 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {selectedMember.department?.name || 'Unassigned'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Department Code: {selectedMember.department?.code || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {selectedMember.department && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 border-background shadow-sm shrink-0"
                      style={{ backgroundColor: selectedMember.department.color }}
                    />
                  )}
                </div>
              </div>

              {/* Weekly Activity Goal */}
              <div className="p-4 bg-background/50 border border-border/60 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Weekly Work Activity
                  </span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Goal: {selectedMember.weekly_goal || 40} hrs
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-2xl font-black text-foreground">
                      {selectedMember.weekly_hours || 0}h
                      <span className="text-xs font-bold text-muted-foreground/60 ml-1">logged this week</span>
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      {Math.min(Math.round(((selectedMember.weekly_hours || 0) / (selectedMember.weekly_goal || 40)) * 100), 100)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(Math.round(((selectedMember.weekly_hours || 0) / (selectedMember.weekly_goal || 40)) * 100), 100)}
                    className="h-2 rounded-full"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-1">
                    <Award className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {(selectedMember.weekly_hours || 0) >= (selectedMember.weekly_goal || 40)
                        ? 'Employee has accomplished their weekly goal!'
                        : `${(selectedMember.weekly_goal || 40) - (selectedMember.weekly_hours || 0)}h remaining to achieve goal.`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Projects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Project Assignments
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedMember.projects?.length || 0} Projects
                  </Badge>
                </div>

                {selectedMember.projects && selectedMember.projects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedMember.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between p-3 bg-background/50 border border-border/50 hover:border-border transition-colors rounded-xl"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-xs font-bold text-foreground truncate">
                            {proj.name}
                          </span>
                        </div>
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-background shadow-sm shrink-0"
                          style={{ backgroundColor: proj.color }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-border rounded-xl text-center">
                    <Briefcase className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2 stroke-1" />
                    <p className="text-xs text-muted-foreground font-semibold">No projects assigned</p>
                    <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto mt-0.5">
                      Go to Project Allocations to map this employee to projects.
                    </p>
                  </div>
                )}
              </div>

              {/* Date Joined metadata */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/40 border border-border/50 rounded-xl p-3.5">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  Member since <strong className="text-foreground/80">{formatMemberSince(selectedMember.created_at)}</strong>
                </span>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
