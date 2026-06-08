"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, AlertCircle, CheckCircle2, Clock, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useMemo } from "react"
import { getDashboardData } from "@/lib/data/dashboard"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getPriorityVariant } from "@/lib/utils"
import { writerStatusBadgeVariant, writerStatusFromOverallStatus } from "@/lib/data/writer-status"

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
  const inProgressIssues = useMemo(() => issues.filter(i => i.status === 'In Progress').length, [issues])
  const escalatedIssues = useMemo(() => issues.filter(i => i.status === 'Escalated').length, [issues])
  const resolutionRate = issues.length > 0 ? Math.round((resolvedIssues / issues.length) * 100) : 0
  const activeWriterRate = students.length > 0
    ? Math.round((students.filter(student => writerStatusFromOverallStatus(student.overallStatus) === "Active").length / students.length) * 100)
    : 0

  const stats = [
    { title: "Writers Tracked", value: students.length, detail: `${activeWriterRate}% currently active`, icon: Users, color: "from-cyan-500/20 to-blue-600/10 text-cyan-400 shadow-cyan-500/10" },
    { title: "Courses Covered", value: courses.length, detail: "Assignment streams in scope", icon: BookOpen, color: "from-emerald-500/20 to-teal-600/10 text-emerald-400 shadow-emerald-500/10" },
    { title: "Issues Still Open", value: openIssues, detail: `${inProgressIssues} in progress, ${escalatedIssues} escalated`, icon: AlertCircle, color: "from-rose-500/20 to-red-600/10 text-rose-400 shadow-rose-500/10" },
    { title: "Issues Resolved", value: resolvedIssues, detail: `${resolutionRate}% of all logged issues`, icon: CheckCircle2, color: "from-lime-500/20 to-green-600/10 text-lime-400 shadow-lime-500/10" },
    { title: "Reviews Pending", value: pendingReviews, detail: "Awaiting academic check", icon: Clock, color: "from-amber-500/20 to-orange-600/10 text-amber-400 shadow-amber-500/10" },
  ]

  const pieData = useMemo(() => {
    const issuesByCategory = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    return Object.entries(issuesByCategory).map(([name, value]) => ({ name, value }))
  }, [issues])

  const topIssueCategory = pieData.length > 0
    ? pieData.reduce((top, item) => item.value > top.value ? item : top, pieData[0])
    : null

  const resolutionProgress = useMemo(() => [
    { name: 'Resolved', value: resolvedIssues },
    { name: 'In Progress', value: inProgressIssues },
    { name: 'Pending Review', value: pendingReviews },
    { name: 'Escalated', value: escalatedIssues },
  ], [resolvedIssues, inProgressIssues, pendingReviews, escalatedIssues])

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(20,28,46,0.98),rgba(13,20,38,0.96))] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-16 -translate-y-16 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 shadow-sm dark:text-cyan-300">
              <Activity className="h-3.5 w-3.5" />
              Live academic operations overview
            </div>
            <h1 className="mt-4 text-gray-950 dark:text-white font-display text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-slate-300 sm:text-base">
              Track writer workload, course coverage, issue resolution, and pending review work from one command view.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm dark:bg-white/[0.04]">
              <p className="text-xl font-bold text-gray-950 dark:text-white">{resolutionRate}%</p>
              <p className="text-[11px] font-medium uppercase text-gray-500 dark:text-slate-400">Resolved</p>
            </div>
            <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm dark:bg-white/[0.04]">
              <p className="text-xl font-bold text-gray-950 dark:text-white">{openIssues}</p>
              <p className="text-[11px] font-medium uppercase text-gray-500 dark:text-slate-400">Open</p>
            </div>
            <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm dark:bg-white/[0.04]">
              <p className="text-xl font-bold text-gray-950 dark:text-white">{pendingReviews}</p>
              <p className="text-[11px] font-medium uppercase text-gray-500 dark:text-slate-400">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadingState label="Loading dashboard metrics..." />}
      {error && <ErrorState message={error} onRetry={refresh} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i} className="group overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-[0_8px_32px_rgba(8,13,26,0.18)] dark:hover:border-white/20 dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
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
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="border-b border-gray-200 dark:border-white/5">
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>
              {topIssueCategory ? `${topIssueCategory.name} is the largest issue category.` : "No issue categories logged yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[260px] h-[260px] pt-5 sm:h-[300px] sm:pt-6">
            <IssueCategoryChart data={pieData} />
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="border-b border-gray-200 dark:border-white/5">
            <CardTitle>Resolution Progress</CardTitle>
            <CardDescription>{resolutionRate}% resolved across all logged issues.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[260px] h-[260px] pt-5 sm:h-[300px] sm:pt-6">
            <ResolutionProgressChart data={resolutionProgress} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-white/5">
          <CardTitle>Recent Writer Records</CardTitle>
          <CardDescription>Latest writer records with course coverage, status, priority, and progress.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Writer Name</TableHead>
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
                    {(() => {
                      const writerStatus = writerStatusFromOverallStatus(student.overallStatus)

                      return <Badge variant={writerStatusBadgeVariant(writerStatus)}>{writerStatus}</Badge>
                    })()}
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
                    No writer records found. Add writers to start seeing dashboard activity.
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
