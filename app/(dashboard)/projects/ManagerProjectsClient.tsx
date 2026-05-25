'use client'

import { useState, useTransition, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Briefcase,
  Users,
  UserMinus,
  UserPlus,
  Loader2,
  Search,
  Building,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Profile, ProjectWithDetails } from '@/lib/types'
import { addProjectMember, removeProjectMember } from '@/lib/actions/projects'

interface ManagerProjectsClientProps {
  initialProjects: ProjectWithDetails[]
  eligibleEmployees: Profile[]
}

export function ManagerProjectsClient({
  initialProjects,
  eligibleEmployees,
}: ManagerProjectsClientProps) {
  const [projects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [addMemberProjectId, setAddMemberProjectId] = useState<string | null>(null)
  const [modalSearchQuery, setModalSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [loadingAction, setLoadingAction] = useState<{
    type: 'add' | 'remove'
    projectId: string
    userId: string
  } | null>(null)

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchName = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDept = p.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
      return matchName || matchDept
    })
  }, [projects, searchQuery])

  // Derive global metrics
  const stats = useMemo(() => {
    const total = projects.length
    const totalMembers = projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)
    const avgTeamSize = total > 0 ? (totalMembers / total).toFixed(1) : '0'
    return { total, totalMembers, avgTeamSize }
  }, [projects])

  // Find active project for adding a member
  const currentAddMemberProject = useMemo(() => {
    return projects.find((p) => p.id === addMemberProjectId)
  }, [projects, addMemberProjectId])

  // Get eligible employees not already assigned to the active project
  const assignableEmployeesForProject = useMemo(() => {
    if (!currentAddMemberProject) return []
    const currentMembers = currentAddMemberProject.members || []
    return eligibleEmployees.filter(
      (emp) => !currentMembers.some((m) => m.id === emp.id)
    )
  }, [currentAddMemberProject, eligibleEmployees])

  // Filter assignable employees by modal search query
  const filteredAssignableEmployees = useMemo(() => {
    return assignableEmployeesForProject.filter((emp) => {
      const matchName = (emp.full_name || '').toLowerCase().includes(modalSearchQuery.toLowerCase())
      const matchEmail = (emp.email || '').toLowerCase().includes(modalSearchQuery.toLowerCase())
      return matchName || matchEmail
    })
  }, [assignableEmployeesForProject, modalSearchQuery])

  // Handle adding a member
  const handleAddMember = (projectId: string, userId: string) => {
    setLoadingAction({ type: 'add', projectId, userId })
    startTransition(async () => {
      const result = await addProjectMember(projectId, userId)
      if (result.error) {
        toast.error(result.error)
      } else {
        const employee = eligibleEmployees.find(e => e.id === userId)
        toast.success(`Assigned ${employee?.full_name ?? 'employee'} to project`)
        
        // Reload to refresh the SSR server components data
        window.location.reload()
      }
      setLoadingAction(null)
    })
  }

  // Handle removing a member
  const handleRemoveMember = (projectId: string, userId: string, fullName: string) => {
    setLoadingAction({ type: 'remove', projectId, userId })
    startTransition(async () => {
      const result = await removeProjectMember(projectId, userId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Removed ${fullName} from project`)
        window.location.reload()
      }
      setLoadingAction(null)
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Standardized Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border/80 shadow-md rounded-2xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Project Allocations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign and manage employee mappings for projects in departments you oversee.
          </p>
        </div>
        
        {/* Glass Search bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search project or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background/50 border-border/60 hover:border-border transition-colors rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Managed Projects Count */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card/60 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300 border border-indigo-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Managed Projects</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.total}</h3>
            </div>
          </div>
        </Card>

        {/* Assigned Headcount */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card/60 backdrop-blur-md hover:border-violet-500/30 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300 border border-violet-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Memberships</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.totalMembers}</h3>
            </div>
          </div>
        </Card>

        {/* Avg Team Size */}
        <Card className="group relative overflow-hidden p-5 border border-border bg-card/60 backdrop-blur-md hover:border-emerald-500/30 transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-300" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. Team Size</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{stats.avgTeamSize} members</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid containing projects */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card/45 backdrop-blur-md border border-border/80 rounded-2xl text-center">
          <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4 stroke-1 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No projects matched your criteria</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
            {searchQuery
              ? `We couldn't find any projects matching "${searchQuery}". Try editing your query.`
              : 'There are no active projects associated with the departments you manage.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const currentMembers = project.members || []
            


            return (
              <Card 
                key={project.id} 
                className="group relative overflow-hidden bg-card/65 backdrop-blur-xl border border-border/85 hover:border-indigo-500/35 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col rounded-2xl"
              >
                {/* Project Color Accent Stripe */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
                  style={{ backgroundColor: project.color }}
                />

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col space-y-5">
                  
                  {/* Project Details */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                        {project.name}
                      </h3>
                      {project.department ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-muted-foreground/80" />
                          <span className="text-xs font-semibold text-muted-foreground">
                            {project.department.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground/60 italic">
                          No Department Assigned
                        </span>
                      )}
                    </div>

                    {/* Department badge with accent color dot */}
                    {project.department && (
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0.5 px-2 bg-background/50 border-border font-bold shrink-0 flex items-center gap-1"
                      >
                        <span 
                          className="w-1.5 h-1.5 rounded-full shrink-0" 
                          style={{ backgroundColor: project.department.color || '#ccc' }} 
                        />
                        {project.department.code}
                      </Badge>
                    )}
                  </div>

                  {/* Team Members List */}
                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
                        Team Members ({currentMembers.length})
                      </span>
                    </div>

                    <div className="bg-background/25 border border-border/50 rounded-2xl p-3 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2.5 custom-scrollbar">
                      {currentMembers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <Users className="w-8 h-8 text-muted-foreground/30 mb-2 stroke-1" />
                          <p className="text-[11px] text-muted-foreground/80 font-medium">No team members assigned</p>
                          <p className="text-[9px] text-muted-foreground/50 max-w-[160px] mt-0.5">
                            Add employees from the department dropdown below.
                          </p>
                        </div>
                      ) : (
                        currentMembers.map((member) => {
                          const isRemoving =
                            loadingAction?.type === 'remove' &&
                            loadingAction?.projectId === project.id &&
                            loadingAction?.userId === member.id

                          return (
                            <div
                              key={member.id}
                              className="group/item flex items-center justify-between p-2 rounded-xl bg-background/35 hover:bg-background/85 border border-transparent hover:border-border/60 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage
                                    src={member.avatar_url || undefined}
                                    alt={member.full_name || 'User'}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {member.full_name?.[0]?.toUpperCase() ?? 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-foreground truncate max-w-[140px]">
                                    {member.full_name}
                                  </p>
                                  <span className="text-[9px] text-muted-foreground capitalize font-medium">
                                    {member.role}
                                  </span>
                                </div>
                              </div>

                              {/* Remove Action Button */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all opacity-80 group-hover/item:opacity-100"
                                onClick={() =>
                                  handleRemoveMember(
                                    project.id,
                                    member.id,
                                    member.full_name || 'Employee'
                                  )
                                }
                                disabled={isPending}
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-destructive" />
                                ) : (
                                  <UserMinus className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Add Member Button */}
                  <div className="pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs bg-background/35 border-border/50 hover:bg-accent/80 hover:text-accent-foreground text-muted-foreground hover:border-indigo-500/35 transition-all"
                      onClick={() => {
                        setAddMemberProjectId(project.id)
                        setModalSearchQuery('')
                      }}
                      disabled={isPending}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Team Member
                    </Button>
                  </div>

                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Member Dialog Modal */}
      <Dialog open={!!addMemberProjectId} onOpenChange={(open) => !open && setAddMemberProjectId(null)}>
        <DialogContent className="sm:max-w-md w-full p-0 flex flex-col h-[500px] overflow-hidden bg-card border border-border/80 shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/30 shrink-0">
            <DialogTitle className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              Add Project Member
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Select an eligible employee from the project&apos;s department to assign them to {currentAddMemberProject?.name}.
            </DialogDescription>
          </DialogHeader>

          {/* Search bar inside dialog */}
          <div className="px-6 py-3 border-b border-border/40 bg-background/20 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="pl-9 h-9.5 bg-background/50 border-border/60 hover:border-border transition-colors rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Scrollable list of employees */}
          <div className="flex-1 overflow-y-auto p-6 space-y-2.5 custom-scrollbar">
            {filteredAssignableEmployees.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Users className="w-10 h-10 text-muted-foreground/30 mb-2 stroke-1" />
                <p className="text-xs text-muted-foreground font-semibold">
                  {modalSearchQuery ? 'No matching employees found' : 'All eligible employees assigned'}
                </p>
                <p className="text-[10px] text-muted-foreground/50 max-w-[200px] mt-0.5">
                  {modalSearchQuery 
                    ? 'Try checking the spelling or entering another name.' 
                    : 'All employees in this department are already mapped to this project.'}
                </p>
              </div>
            ) : (
              filteredAssignableEmployees.map((emp) => {
                const isAddingThisEmp =
                  loadingAction?.type === 'add' &&
                  loadingAction?.projectId === addMemberProjectId &&
                  loadingAction?.userId === emp.id

                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-background/35 hover:bg-background/85 border border-border/50 hover:border-indigo-500/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8.5 w-8.5 shrink-0 border border-background shadow-xs">
                        <AvatarImage src={emp.avatar_url || undefined} alt={emp.full_name || 'Employee'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {emp.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate max-w-[170px]">
                          {emp.full_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                          {emp.email}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1 px-3"
                      onClick={() => handleAddMember(addMemberProjectId!, emp.id)}
                      disabled={isPending || !!loadingAction}
                    >
                      {isAddingThisEmp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </>
                      )}
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
