'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyTrend } from '@/lib/types'

interface DailyTrendChartProps {
  data: DailyTrend[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
    fullLabel: formatDate(d.date),
  }))

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '12px',
            }}
            labelFormatter={(label, payload) =>
              payload?.[0] ? (payload[0].payload as { fullLabel: string }).fullLabel : label
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${Number(value ?? 0)}h`, 'Hours'] as [string, string]}
          />
          <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
