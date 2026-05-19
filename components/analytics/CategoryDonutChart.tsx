'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { CategorySplit } from '@/lib/types'

interface CategoryDonutChartProps {
  data: CategorySplit[]
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  const totalHours = data.reduce((s, d) => s + d.hours, 0)

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="hours"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '12px',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              const num = Number(value ?? 0)
              const label = String(name ?? '')
              return [
                `${num}h (${totalHours > 0 ? Math.round((num / totalHours) * 100) : 0}%)`,
                label,
              ] as [string, string]
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
