"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { NewIssueDialog } from "@/components/issues/new-issue-dialog"
import { listIssues } from "@/lib/data/issues"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"

export default function IssuesPage() {
  const { data: issues, loading, error, refresh } = useSupabaseQuery(
    listIssues,
    [],
    ["issues", "students", "comments"]
  )

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Global Issues</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Complete log of all tracked problems and their current statuses.</p>
        </div>
        <NewIssueDialog onSaved={refresh} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && <div className="p-6"><LoadingState label="Loading issues..." /></div>}
          {error && <div className="p-6"><ErrorState message={error} onRetry={refresh} /></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Issue Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...issues].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((issue) => {
                return (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium whitespace-nowrap">{issue.studentName ?? "Unknown student"}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">{issue.category}</span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="truncate block text-zinc-500" title={issue.description}>
                        {issue.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(issue.priority)}>
                        {issue.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(issue.status)}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-zinc-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                )
              })}
              {!loading && !error && issues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                    No issues found.
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
