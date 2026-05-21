"use client"

import { use, useRef } from "react"
import { useAppStore } from "@/store/useAppStore"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useToastStore } from "@/store/useToastStore"

export default function StudentReportPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params)
  const { students, issues, comments, aiTools } = useAppStore()
  const { addToast } = useToastStore()
  
  const student = students.find(s => s.id === studentId)
  const reportRef = useRef<HTMLDivElement>(null)

  if (!student) {
    notFound()
  }

  const studentIssues = issues.filter(i => i.studentId === student.id)
  const studentComments = comments.filter(c => c.studentId === student.id).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  
  // Issue Stats
  const totalIssues = studentIssues.length
  const issuesByCategory = studentIssues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const issuesByStatus = studentIssues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
  
  const handleExportPDF = async () => {
    if (!reportRef.current) return
    
    addToast({
      title: "Generating PDF",
      description: "Please wait while the report is being generated...",
      type: "info"
    })

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`Report-${student.name.replace(/\s+/g, '-')}.pdf`)

      addToast({
        title: "Export Successful",
        description: "The PDF report has been downloaded.",
        type: "success"
      })
    } catch (error) {
      console.error(error)
      addToast({
        title: "Export Failed",
        description: "There was an error generating the PDF.",
        type: "error"
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Student Report</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Detailed overview for {student.name}</p>
          </div>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="print-header mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
           <h2 className="text-2xl font-bold">{student.name}</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
             <div>
               <p className="text-sm text-zinc-500 font-medium">Student ID</p>
               <p className="text-sm font-semibold">{student.id}</p>
             </div>
             <div>
               <p className="text-sm text-zinc-500 font-medium">Assigned Trainer</p>
               <p className="text-sm font-semibold">{student.assignedTrainer}</p>
             </div>
             <div>
               <p className="text-sm text-zinc-500 font-medium">Overall Status</p>
               <Badge variant={getStatusVariant(student.overallStatus)} className="mt-1">{student.overallStatus}</Badge>
             </div>
             <div>
               <p className="text-sm text-zinc-500 font-medium">Last Update</p>
               <p className="text-sm font-semibold">{format(new Date(student.lastUpdate), 'MMM d, yyyy')}</p>
             </div>
           </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
            <TabsTrigger value="issues" className="py-2">Issues</TabsTrigger>
            <TabsTrigger value="comments" className="py-2">Comments History</TabsTrigger>
            <TabsTrigger value="progress" className="py-2">Progress</TabsTrigger>
            <TabsTrigger value="tools" className="py-2">AI Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <Card>
                 <CardHeader className="pb-2 text-zinc-500">
                   <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">{totalIssues}</div>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="pb-2 text-zinc-500">
                   <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">{(issuesByStatus['Pending'] || 0) + (issuesByStatus['In Progress'] || 0) + (issuesByStatus['Escalated'] || 0)}</div>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="pb-2 text-zinc-500">
                   <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold text-emerald-500">{issuesByStatus['Resolved'] || 0}</div>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="pb-2 text-zinc-500">
                   <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
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
                         <span className="text-sm text-zinc-500">{count}</span>
                       </div>
                     ))}
                     {Object.keys(issuesByCategory).length === 0 && (
                       <div className="text-sm text-zinc-500">No issues reported.</div>
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
                <CardDescription>All tracked issues for this student.</CardDescription>
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
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 block max-w-sm truncate" title={issue.description}>
                            {issue.description}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(issue.priority)} className="text-[10px]">{issue.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(issue.status)} className="text-[10px]">{issue.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {studentIssues.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-zinc-500">No issues reported.</TableCell>
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
                        <div key={comment.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">{comment.authorName}</span>
                            <Badge variant={comment.role === 'Admin' ? 'success' : 'info'} className="text-[10px] uppercase px-1 py-0">{comment.role}</Badge>
                            <span className="text-xs text-zinc-400 ml-auto">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          {relatedIssue && (
                            <div className="mb-2">
                              <span className="inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400">
                                Related Issue: <span className="font-medium text-zinc-900 dark:text-zinc-100">{relatedIssue.category}</span>
                              </span>
                            </div>
                          )}
                          <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-md border border-zinc-100 dark:border-zinc-800">
                            {comment.text}
                          </div>
                        </div>
                      )
                    })}
                    {studentComments.length === 0 && (
                      <div className="text-center text-sm text-zinc-500 py-8">
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
                <CardDescription>Course completion timeline and status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Overall Course Completion</span>
                    <span>{student.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <div 
                      className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">Recent Activity</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                     {/* Currently we don't have a distinct activity log array, so we will weave issues and comments together by timestamp */}
                     {
                       [...studentIssues.map(i => ({ type: 'issue', data: i, time: i.createdAt })), 
                        ...studentComments.map(c => ({ type: 'comment', data: c, time: c.createdAt }))]
                       .sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                       .map((activity, idx) => (
                         <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                           <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                           <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                             <div className="flex items-center justify-between mb-1">
                               <div className="font-medium text-sm text-zinc-900 dark:text-zinc-50">
                                 {activity.type === 'issue' ? `Issue Created: ${(activity.data as any).category}` : `Comment by ${(activity.data as any).authorName}`}
                               </div>
                               <time className="text-xs text-zinc-500">
                                 {format(new Date(activity.time), 'MMM d, p')}
                               </time>
                             </div>
                             <div className="text-xs text-zinc-500 line-clamp-2">
                               {activity.type === 'issue' ? (activity.data as any).description : (activity.data as any).text}
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

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>AI Tools Summary</CardTitle>
                <CardDescription>Tools most frequently associated with issues for this student.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Note: In our current data schema we don't explicitly track tools per student. We will display a generic message or extrapolate based on issues. */}
                <div className="p-12 text-center text-zinc-500 border border-dashed rounded-lg">
                  <p>Individual AI Tool tracking data is not fully correlated yet. Please refer to global Analytics for overall tool performance.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
