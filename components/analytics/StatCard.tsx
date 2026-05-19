import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: string
    positive: boolean
  }
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = '#4f46e5', trend }: StatCardProps) {
  return (
    <Card className="p-5 bg-card border border-border rounded-xl hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${iconColor}18` }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground leading-none mb-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <p
          className={cn(
            'text-xs font-medium mt-2',
            trend.positive ? 'text-emerald-600' : 'text-destructive'
          )}
        >
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </Card>
  )
}
