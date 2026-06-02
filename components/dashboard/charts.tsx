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

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f97316", "#8b5cf6", "#ec4899", "#ef4444"]

export function IssueCategoryChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2d4a" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid rgba(99,102,241,0.2)",
            backgroundColor: "rgba(30,41,59,0.95)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            color: "#f1f5f9",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ResolutionProgressChart({ data }: { data: ChartDatum[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid rgba(99,102,241,0.2)",
            backgroundColor: "rgba(30,41,59,0.95)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            color: "#f1f5f9",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}


