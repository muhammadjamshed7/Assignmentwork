"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, FileText } from "lucide-react"
import Link from "next/link"
import { getReportsIndexData } from "@/lib/data/dashboard"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { writerStatusBadgeVariant, writerStatusFromOverallStatus } from "@/lib/data/writer-status"

export default function ReportsIndexPage() {
  const { data, loading, error, refresh } = useSupabaseQuery(
    getReportsIndexData,
    { students: [], issues: [] },
    ["students", "student_courses", "courses", "issues"]
  )
  const { students, issues } = data
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.assignedCourses.some(c => c && c.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">Reports Generator</h1>
          <p className="text-slate-400">Generate detailed PDF reports per writer.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-white/5 pb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search writers..."
              className="h-9 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 pl-9 pr-4 text-sm text-slate-200 placeholder:text-gray-400 dark:text-slate-500 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <div className="p-6"><LoadingState label="Loading reports..." /></div>}
          {error && <div className="p-6"><ErrorState message={error} onRetry={refresh} /></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Writer Name</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Active Issues</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const studentIssues = issues.filter(i => i.studentId === student.id)
                const openIssues = studentIssues.filter(i => i.status !== 'Resolved').length

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-slate-500">{student.assignedTrainer}</TableCell>
                    <TableCell>
                      {openIssues > 0 ? (
                        <Badge variant="destructive">{openIssues} Open</Badge>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-slate-500">No open issues</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const writerStatus = writerStatusFromOverallStatus(student.overallStatus)

                        return <Badge variant={writerStatusBadgeVariant(writerStatus)}>{writerStatus}</Badge>
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/reports/${student.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="h-4 w-4" />
                          View Report
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!loading && !error && filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-400 dark:text-slate-500">
                    No writers found matching your search.
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
