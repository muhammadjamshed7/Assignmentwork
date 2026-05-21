"use client"

import { useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, FileText } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function ReportsIndexPage() {
  const { students, issues } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.assignedCourses.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Resolved': return 'success'
      case 'In Progress': return 'info'
      case 'Escalated': return 'destructive'
      default: return 'pending'
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Reports Generator</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Generate comprehensive PDF reports for individual students.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search students to generate report..." 
              className="h-9 w-full rounded-md border border-zinc-200 bg-transparent pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:focus:ring-zinc-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
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
                    <TableCell className="text-zinc-500">{student.assignedTrainer}</TableCell>
                    <TableCell>
                      {openIssues > 0 ? (
                        <Badge variant="destructive">{openIssues} Open</Badge>
                      ) : (
                        <span className="text-xs text-zinc-500">No open issues</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(student.overallStatus)}>
                        {student.overallStatus}
                      </Badge>
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
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                    No students found matching your search.
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
