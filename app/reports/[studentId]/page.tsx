"use client"

import { use, useMemo } from "react"
import { Issue, Comment, Student } from "@/lib/data/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import { listStudentById } from "@/lib/data/students"
import { listIssuesByStudentId } from "@/lib/data/issues"
import { listCommentsByStudentId } from "@/lib/data/comments"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getStatusVariant, getPriorityVariant } from "@/lib/utils"

export default function StudentReportPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params)
  const { data, loading, error, refresh } = useSupabaseQuery(
    async () => {
      const [student, studentIssues, studentComments] = await Promise.all([
        listStudentById(studentId),
        listIssuesByStudentId(studentId),
        listCommentsByStudentId(studentId),
      ])
      return { student, studentIssues, studentComments }
    },
    { student: null as Student | null, studentIssues: [] as Issue[], studentComments: [] as Comment[] },
    ["students", "student_courses", "courses", "issues", "comments"]
  )
  const { student, studentIssues, studentComments } = data

  const totalIssues = studentIssues.length
  const issuesByCategory = useMemo(() =>
    studentIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    [studentIssues]
  )

  const issuesByStatus = useMemo(() =>
    studentIssues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    [studentIssues]
  )

  if (loading) {
    return <LoadingState label="Loading student report..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />
  }

  if (!student) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-700 p-8 text-center text-sm text-gray-400 dark:text-slate-500">
        Student report not found.
      </div>
    )
  }

  const handleExportPDF = () => {
    window.open(`/api/report/${studentId}/pdf`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-gray-900 dark:text-white font-display text-2xl font-bold tracking-tight sm:text-3xl">Student Report</h1>
            <p className="text-slate-400">Detailed overview for {student.name}</p>
          </div>
        </div>
        <Button onClick={handleExportPDF} className="w-full gap-2 sm:w-auto">
          <Download className="h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-4 sm:p-6">
        <div className="print-header mb-8 pb-8 border-b border-gray-200 dark:border-white/5">
           <h2 className="text-2xl font-bold">{student.name}</h2>
           <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
             <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Student ID</p>
               <p className="text-sm font-semibold">{student.id}</p>
             </div>
             <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Assigned Trainer</p>
               <p className="text-sm font-semibold">{student.assignedTrainer}</p>
             </div>
             <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Overall Status</p>
               <Badge variant={getStatusVariant(student.overallStatus)} className="mt-1">{student.overallStatus}</Badge>
             </div>
             <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Last Update</p>
               <p className="text-sm font-semibold">{format(new Date(student.lastUpdate), 'MMM d, yyyy')}</p>
             </div>
           </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="mb-6 overflow-x-auto">
          <TabsList className="grid h-auto min-w-[560px] grid-cols-4 sm:min-w-0 sm:w-full">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="issues" className="py-2">Issues</TabsTrigger>
            <TabsTrigger value="comments" className="py-2">Comments History</TabsTrigger>
            <TabsTrigger value="progress" className="py-2">Progress</TabsTrigger>
          </TabsList>
          </div>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Issues</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">{totalIssues}</div>
                 </CardContent>
               </Card>
               <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-slate-400">Open Issues</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">{(issuesByStatus['Pending'] || 0) + (issuesByStatus['In Progress'] || 0) + (issuesByStatus['Escalated'] || 0)}</div>
                 </CardContent>
               </Card>
               <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-slate-400">Resolved Issues</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold text-emerald-500">{issuesByStatus['Resolved'] || 0}</div>
                 </CardContent>
               </Card>
               <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 dark:text-slate-400">Course Progress</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">{student.progress}%</div>
                 </CardContent>
               </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Issues by Category</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {Object.entries(issuesByCategory).map(([category, count]) => (
                       <div key={category} className="flex items-center justify-between">
                         <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm text-gray-400 dark:text-slate-500">{count}</span>
                       </div>
                     ))}
                     {Object.keys(issuesByCategory).length === 0 && (
                        <div className="text-sm text-gray-400 dark:text-slate-500">No issues reported.</div>
                     )}
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle className="text-base">Assigned Courses</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="flex flex-wrap gap-2">
                     {student.assignedCourses.map(course => (
                       <Badge key={course} variant="secondary">{course}</Badge>
                     ))}
                   </div>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Issue Log</CardTitle>
                <CardDescription>All issues reported by this student.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Reported</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentIssues.map(issue => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium whitespace-nowrap text-xs">{issue.category}</TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-700 dark:text-slate-300 block max-w-sm truncate" title={issue.description}>
                            {issue.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(issue.priority)} className="text-[10px]">{issue.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(issue.status)} className="text-[10px]">{issue.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-400 dark:text-slate-500">
                          {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {studentIssues.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-gray-400 dark:text-slate-500">No issues reported.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
             <Card>
               <CardHeader>
                 <CardTitle>Comments History</CardTitle>
                 <CardDescription>Full threaded conversation tied to this student&apos;s issues.</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-6">
                    {studentComments.map(comment => {
                      const relatedIssue = studentIssues.find(i => i.id === comment.issueId)
                      return (
                        <div key={comment.id} className="border-b border-gray-200 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{comment.authorName}</span>
                            <Badge variant={comment.role === 'Admin' ? 'success' : 'info'} className="text-[10px] uppercase px-1 py-0">{comment.role}</Badge>
                            <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          {relatedIssue && (
                            <div className="mb-2">
                              <span className="inline-block bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs px-2 py-1 rounded-md text-gray-500 dark:text-slate-400">
                                Related Issue: <span className="font-medium text-slate-200">{relatedIssue.category}</span>
                              </span>
                            </div>
                          )}
                          <div className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap bg-gray-50 dark:bg-slate-900/50 p-3 rounded-md border border-gray-200 dark:border-white/5">
                            {comment.text}
                          </div>
                        </div>
                      )
                    })}
                    {studentComments.length === 0 && (
                      <div className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">
                         No comments have been recorded.
                      </div>
                    )}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Progress & Activity</CardTitle>
                <CardDescription>Overall progress and recent activity.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Overall Course Completion</span>
                    <span>{student.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-300 dark:border-slate-700">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-slate-100">Recent Activity</h3>
                  <div className="space-y-4">
                      {
                        [...studentIssues.map(i => ({ type: 'issue' as const, data: i, time: i.createdAt })), 
                         ...studentComments.map(c => ({ type: 'comment' as const, data: c, time: c.createdAt }))]
                        .sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                        .map((activity) => (
                          <div key={`${activity.type}-${activity.data.id}`} className="flex gap-4">
                           <div className="flex flex-col items-center shrink-0">
                             <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5" />
                           </div>
                           <div className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                             <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-sm text-slate-100">
                                 {activity.type === 'issue' ? `Issue Created: ${(activity.data as Issue).category}` : `Comment by ${(activity.data as Comment).authorName}`}
                               </div>
                                <time className="text-xs text-gray-400 dark:text-slate-500">
                                 {format(new Date(activity.time), 'MMM d, p')}
                               </time>
                             </div>
                              <div className="text-xs text-gray-400 dark:text-slate-500 line-clamp-2">
                               {activity.type === 'issue' ? (activity.data as Issue).description : (activity.data as Comment).text}
                             </div>
                           </div>
                         </div>
                       ))
                     }
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
