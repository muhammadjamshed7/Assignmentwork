"use client"

import dynamic from "next/dynamic"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, AlertCircle, CheckCircle2, Clock, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

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
  return <div className="h-full w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
}

export default function DashboardPage() {
  const { students, issues, courses, aiTools } = useAppStore()

  // Stats calculations
  const totalStudents = students.length
  const totalCourses = courses.length
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length
  const openIssues = issues.length - resolvedIssues
  const pendingReviews = issues.filter(i => i.status === 'Pending').length
  const aiToolsUsage = aiTools.reduce((acc, tool) => acc + tool.usageCount, 0)

  const stats = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-500" },
    { title: "Active Courses", value: totalCourses, icon: BookOpen, color: "text-emerald-500" },
    { title: "Open Issues", value: openIssues, icon: AlertCircle, color: "text-red-500" },
    { title: "Resolved Issues", value: resolvedIssues, icon: CheckCircle2, color: "text-green-500" },
    { title: "Pending Reviews", value: pendingReviews, icon: Clock, color: "text-yellow-500" },
    { title: "AI Tools Usage", value: aiToolsUsage, icon: Wrench, color: "text-indigo-500" },
  ]

  // Chart data
  const issuesByCategory = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(issuesByCategory).map(([name, value]) => ({ name, value }))

  const resolutionProgress = [
    { name: 'Resolved', value: resolvedIssues },
    { name: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length },
    { name: 'Pending', value: issues.filter(i => i.status === 'Pending').length },
    { name: 'Escalated', value: issues.filter(i => i.status === 'Escalated').length },
  ]

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Resolved': return 'success'
      case 'In Progress': return 'info'
      case 'Escalated': return 'destructive'
      default: return 'pending'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'default'
      case 'Medium': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Welcome to the Academic Services platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Breakdown of all reported student issues</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <IssueCategoryChart data={pieData} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Resolution Progress</CardTitle>
            <CardDescription>Current status of all tracked issues</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResolutionProgressChart data={resolutionProgress} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Students Overview</CardTitle>
          <CardDescription>Monitor student progress and active issues.</CardDescription>
        </CardHeader>
        <CardContent>
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
                      <div className="h-2 w-[60px] rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div 
                          className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50" 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 text-xs">
                    {formatDistanceToNow(new Date(student.lastUpdate), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
