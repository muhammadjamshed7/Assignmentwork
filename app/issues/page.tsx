"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { NewIssueDialog } from "@/components/issues/new-issue-dialog"
import { listIssuesPage } from "@/lib/data/issues"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { useSearchStore } from "@/store/useSearchStore"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { getStatusVariant, getPriorityVariant } from "@/lib/utils"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"

const PAGE_SIZE = 10

export default function IssuesPage() {
  const [page, setPage] = useState(1)
  const { data: issuesPage, loading, error, refresh } = useSupabaseQuery(
    () => listIssuesPage({ page, pageSize: PAGE_SIZE }),
    { items: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    ["issues", "students", "comments"],
    String(page)
  )
  const issues = issuesPage.items
  const { isAdmin } = useCurrentUserRole()
  const searchQuery = useSearchStore(state => state.searchQuery)
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredIssues = issues.filter(issue => {
    if (!normalizedSearchQuery) return true

    return [
      issue.studentName ?? "",
      issue.category,
      issue.description,
      issue.status,
      issue.priority,
    ].join(" ").toLowerCase().includes(normalizedSearchQuery)
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">{isAdmin ? "Global Issues" : "My Issues"}</h1>
          <p className="text-slate-400">{isAdmin ? "Track and manage student-reported issues." : "Track your own issue tickets and status updates."}</p>
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
              {filteredIssues.map((issue) => {
                return (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium whitespace-nowrap">{issue.studentName ?? "Unknown student"}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-xs text-gray-700 dark:text-slate-300">{issue.category}</span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="truncate block text-gray-400 dark:text-slate-500" title={issue.description}>
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
                    <TableCell className="text-right text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                )
              })}
              {!loading && !error && filteredIssues.length === 0 && (
                <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-400 dark:text-slate-500">
                    No issues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={issuesPage.page}
            pageSize={issuesPage.pageSize}
            total={issuesPage.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
