"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useMemo } from "react"
import { getDashboardData } from "@/lib/data/dashboard"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getStatusVariant, getPriorityVariant } from "@/lib/utils"

const IssueCategoryChart = dynamic(
  () => import("@/components/dashboard/charts").then(mod => mod.IssueCategoryChart),
  {
    ssr: false,
    loading: ChartPlaceholder,
  }
)

const ResolutionProgressChart = dynamic(
  () => import("@/components/dashboard/charts").then(mod => mod.ResolutionProgressChart),
  {
    ssr: false,
    loading: ChartPlaceholder,
  }
)

function ChartPlaceholder() {
  return <div className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
}

export default function DashboardPage() {
  const { data, loading, error, refresh } = useSupabaseQuery(
    getDashboardData,
    { students: [], issues: [], courses: [] },
    ["students", "student_courses", "courses", "issues", "comments"]
  )

  const { students, issues, courses } = data

  const resolvedIssues = useMemo(() => issues.filter(i => i.status === 'Resolved').length, [issues])
  const pendingReviews = useMemo(() => issues.filter(i => i.status === 'Pending').length, [issues])
  const openIssues = issues.length - resolvedIssues

  const stats = [
    { title: "Total Writers", value: students.length, icon: Users, color: "from-blue-600/20 to-blue-700/10 text-blue-400 shadow-blue-500/10" },
    { title: "Active Courses", value: courses.length, icon: BookOpen, color: "from-emerald-600/20 to-emerald-700/10 text-emerald-400 shadow-emerald-500/10" },
    { title: "Open Issues", value: openIssues, icon: AlertCircle, color: "from-red-600/20 to-red-700/10 text-red-400 shadow-red-500/10" },
    { title: "Resolved Issues", value: resolvedIssues, icon: CheckCircle2, color: "from-green-600/20 to-green-700/10 text-green-400 shadow-green-500/10" },
    { title: "Pending Reviews", value: pendingReviews, icon: Clock, color: "from-amber-600/20 to-amber-700/10 text-amber-400 shadow-amber-500/10" },
  ]

  const pieData = useMemo(() => {
    const issuesByCategory = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(issuesByCategory).map(([name, value]) => ({ name, value }))
  }, [issues])

  const resolutionProgress = useMemo(() => [
    { name: 'Resolved', value: resolvedIssues },
    { name: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length },
    { name: 'Pending', value: issues.filter(i => i.status === 'Pending').length },
    { name: 'Escalated', value: issues.filter(i => i.status === 'Escalated').length },
  ], [issues, resolvedIssues])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="inline-flex w-fit items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 shadow-sm">
          Open workspace overview
        </div>
        <div>
          <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-gray-500 dark:text-slate-400">Monitor writers, courses, issues, and review activity from one place.</p>
        </div>
      </div>

      {loading && <LoadingState label="Loading dashboard metrics..." />}
      {error && <ErrorState message={error} onRetry={refresh} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i} className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-body text-sm font-medium text-gray-500 dark:text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="border-b border-gray-200 dark:border-white/5">
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Issues grouped by category</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[260px] h-[260px] pt-5 sm:h-[300px] sm:pt-6">
            <IssueCategoryChart data={pieData} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="border-b border-gray-200 dark:border-white/5">
            <CardTitle>Resolution Progress</CardTitle>
            <CardDescription>Issue status distribution</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[260px] h-[260px] pt-5 sm:h-[300px] sm:pt-6">
            <ResolutionProgressChart data={resolutionProgress} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-white/5">
          <CardTitle>Recent Students Overview</CardTitle>
          <CardDescription>Recently active students</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Assigned Courses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.slice(0, 5).map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {student.assignedCourses.map(course => (
                        <Badge variant="outline" key={course} className="text-[10px]">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(student.overallStatus)}>
                      {student.overallStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(student.priority)}>
                      {student.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-[60px] rounded-full bg-gray-100 dark:bg-slate-800">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 text-xs">
                    {formatDistanceToNow(new Date(student.lastUpdate), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                    No students found. Add students to start seeing dashboard activity.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
