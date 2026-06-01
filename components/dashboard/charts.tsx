"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ChartDatum = {
  name: string
  value: number
}

type AIToolChartDatum = {
  name: string
  usage: number
  problems: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#ffc658", "#ef4444"]

export function IssueCategoryChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-400">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.2} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        />
        <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} className="dark:fill-zinc-50" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ResolutionProgressChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-400">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function AIToolsUsageChart({ data }: { data: AIToolChartDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-zinc-400">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.2} />
        <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
        />
        <Bar dataKey="usage" name="Total Usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="problems" name="Reported Problems" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
