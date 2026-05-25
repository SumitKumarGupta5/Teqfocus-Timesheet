'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createProject, updateProject, deleteProject } from '@/lib/actions/projects'
import type { Project } from '@/lib/types'

const PROJECT_COLORS = [
  '#4f46e5', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#0ea5e9',
]

interface ProjectManagerProps {
  projects: Project[]
  isAdmin: boolean
}

export function ProjectManager({ projects, isAdmin }: ProjectManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    startTransition(async () => {
      const result = await createProject(newName.trim(), newColor)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project created')
        setNewName('')
      }
    })
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setEditName(project.name)
    setEditColor(project.color)
  }

  const handleSaveEdit = (id: string) => {
    startTransition(async () => {
      const result = await updateProject(id, editName, editColor, true)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project updated')
        setEditingId(null)
      }
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteProject(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project deleted')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Existing projects */}
      <div className="flex flex-col gap-2">
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No projects yet. {isAdmin ? 'Add your first project below.' : 'Ask your Admin to create projects.'}
          </p>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
          >
            {editingId === project.id ? (
              <>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                />
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(project.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg hover:bg-accent text-primary"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {project.name}
                </span>
                {!project.is_active && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-project-${project.id}`}
                      onClick={() => handleEdit(project)}
                      className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-project-${project.id}`}
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new project (admin only) */}
      {isAdmin && (
        <form onSubmit={handleCreate} className="flex items-center gap-2 pt-2">
          {/* Color swatches */}
          <div className="flex gap-1 shrink-0">
            {PROJECT_COLORS.slice(0, 4).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: newColor === c ? 'var(--foreground)' : 'transparent',
                }}
              />
            ))}
          </div>
          <Input
            id="new-project-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New project name"
            className="flex-1"
            required
          />
          <Button
            id="add-project-btn"
            type="submit"
            size="sm"
            disabled={isPending || !newName.trim()}
            className="gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </Button>
        </form>
      )}
    </div>
  )
}
