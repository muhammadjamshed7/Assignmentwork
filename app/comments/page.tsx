"use client"

import { useState } from "react"
import { IssueStatus, Role } from "@/lib/data/types"
import { useToastStore } from "@/store/useToastStore"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { AlertCircle, CheckCircle2, Clock3, MessageSquareText, Pencil, Search, Send, ShieldCheck, Sparkles, Trash2, UserRound } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewIssueDialog } from "@/components/issues/new-issue-dialog"
import { createComment, deleteComment, listCommentsPage, updateComment } from "@/lib/data/comments"
import { listStudents } from "@/lib/data/students"
import { listIssues, updateIssueStatus } from "@/lib/data/issues"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getErrorMessage } from "@/lib/data/client"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Textarea } from "@/components/ui/textarea"
import { cn, getPriorityVariant, getStatusVariant } from "@/lib/utils"

const PAGE_SIZE = 10
const STATUS_FILTERS: Array<IssueStatus | "All"> = ["All", "Pending", "In Progress", "Resolved", "Escalated"]

export default function CommentsPage() {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [commentsPageNumber, setCommentsPageNumber] = useState(1)
  const [issueSearch, setIssueSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "All">("All")
  const { data: baseData, loading: baseLoading, error: baseError, refresh: baseRefresh } = useSupabaseQuery(
    async () => {
      const [students, issues] = await Promise.all([listStudents(), listIssues()])
      return { students, issues }
    },
    { students: [], issues: [] },
    ["students", "issues", "comments"]
  )
  const activeIssueId = selectedIssueId ?? baseData.issues[0]?.id ?? null
  const { data: commentsPage, loading: commentsLoading, error: commentsError, refresh: commentsRefresh } = useSupabaseQuery(
    () => listCommentsPage({ page: commentsPageNumber, pageSize: PAGE_SIZE, issueId: activeIssueId }),
    { items: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    ["comments"],
    `${activeIssueId}:${commentsPageNumber}`
  )
  const { issues, students } = baseData
  const comments = commentsPage.items
  const loading = baseLoading || commentsLoading
  const error = baseError || commentsError
  const refresh = () => Promise.all([baseRefresh(), commentsRefresh()]).then(() => {})
  const { addToast } = useToastStore()
  const { isAdmin, isStudent } = useCurrentUserRole()
  
  // New reply state
  const [replyText, setReplyText] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role>("Admin")
  const [nextStatus, setNextStatus] = useState<IssueStatus | "">("")

  // Edit / Delete State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  const selectedIssue = issues.find(i => i.id === activeIssueId)
  const relatedStudent = students.find(s => s.id === selectedIssue?.studentId)
  const issueComments = [...comments].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const normalizedIssueSearch = issueSearch.trim().toLowerCase()
  const visibleIssues = issues.filter(issue => {
    const student = students.find(s => s.id === issue.studentId)
    const matchesStatus = statusFilter === "All" || issue.status === statusFilter
    const matchesSearch = !normalizedIssueSearch || [
      student?.name ?? "",
      issue.category,
      issue.description,
      issue.priority,
      issue.status,
    ].join(" ").toLowerCase().includes(normalizedIssueSearch)

    return matchesStatus && matchesSearch
  })
  const unresolvedCount = issues.filter(issue => issue.status !== "Resolved").length
  const resolvedCount = issues.filter(issue => issue.status === "Resolved").length
  const escalatedCount = issues.filter(issue => issue.status === "Escalated").length
  const canReply = (isAdmin || isStudent) && !!selectedIssue

  const selectIssue = (issueId: string) => {
    setSelectedIssueId(issueId)
    setCommentsPageNumber(1)
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !activeIssueId) return
    setIsSaving(true)
    setFormError("")

    try {
      const commentRole: Role = isAdmin ? selectedRole : "Student"

      await createComment({
        studentId: relatedStudent?.id || '',
        issueId: activeIssueId,
        authorName: commentRole === 'Admin' ? 'Admin User' : (relatedStudent?.name || 'Writer'),
        role: commentRole,
        text: replyText
      })

      if (commentRole === 'Admin' && nextStatus) {
        await updateIssueStatus(activeIssueId, nextStatus)
      }

      await refresh()
      setReplyText("")
      setNextStatus("")
      
      addToast({
        title: "Comment Added",
        description: "Your comment has been successfully posted.",
        type: "success"
      })
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateComment = async (id: string) => {
    if (!editingText.trim()) return
    try {
      await updateComment(id, editingText.trim())
      await refresh()
      setEditingCommentId(null)
      setEditingText("")
      addToast({
        title: "Comment Updated",
        description: "The comment was successfully modified.",
        type: "success"
      })
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCommentId) return
    try {
      await deleteComment(deletingCommentId)
      await refresh()
      setDeletingCommentId(null)
      addToast({
        title: "Comment Deleted",
        description: "The comment was removed from the thread.",
        type: "success"
      })
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  const statusIcon = selectedIssue?.status === "Resolved" ? CheckCircle2 : selectedIssue?.status === "Escalated" ? AlertCircle : Clock3
  const StatusIcon = statusIcon

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-5 lg:h-[calc(100vh-8rem)] lg:overflow-hidden">
      <div className="flex flex-col gap-4 rounded-lg border border-indigo-500/15 bg-white p-4 shadow-sm dark:bg-[linear-gradient(135deg,rgba(20,28,46,0.96),rgba(8,13,26,0.96))] dark:shadow-[0_18px_44px_rgba(0,0,0,0.22)] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Support desk
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">Comments & Tickets</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Open a ticket, follow the full conversation, and update status from one focused workspace.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            <MessageSquareText className="h-4 w-4 text-indigo-400" aria-hidden="true" />
            <span className="font-semibold">{issues.length}</span>
            <span>tickets</span>
          </div>
          <NewIssueDialog onIssueCreated={selectIssue} onSaved={refresh} students={students} />
        </div>
      </div>

      {loading && <LoadingState label="Loading tickets..." />}
      {error && <ErrorState message={error} onRetry={refresh} />}
      {formError && <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}

      <div className="grid flex-1 gap-5 lg:min-h-0 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        {/* Left column: Ticket List */}
        <Card className="flex min-h-[360px] flex-col overflow-hidden lg:h-full">
          <CardHeader className="shrink-0 border-b border-gray-200 bg-gray-50/80 px-4 py-4 dark:border-white/5 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-sm text-gray-900 dark:text-white">Ticket Queue</CardTitle>
                <CardDescription className="text-xs">{unresolvedCount} active, {resolvedCount} resolved</CardDescription>
              </div>
              {escalatedCount > 0 && (
                <Badge variant="destructive" className="shrink-0">
                  {escalatedCount} escalated
                </Badge>
              )}
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" aria-hidden="true" />
              <input
                value={issueSearch}
                onChange={(event) => setIssueSearch(event.target.value)}
                placeholder="Search tickets..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {STATUS_FILTERS.map(status => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition",
                    statusFilter === status
                      ? "border-indigo-400 bg-indigo-500/15 text-indigo-300"
                      : "border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:text-gray-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </CardHeader>
          <div className="max-h-[430px] flex-1 space-y-2 overflow-y-auto p-3 lg:max-h-none">
            {visibleIssues.map(issue => {
              const student = students.find(s => s.id === issue.studentId)
              const isSelected = activeIssueId === issue.id
              return (
                <button
                  key={issue.id}
                  onClick={() => selectIssue(issue.id)}
                  className={cn(
                    "group w-full rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg",
                    isSelected
                      ? "border-indigo-400/50 bg-indigo-500/15 shadow-lg shadow-indigo-950/10 ring-1 ring-indigo-400/20"
                      : "border-gray-200 bg-white/90 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/45 dark:hover:border-slate-600"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="min-w-0 truncate text-sm font-semibold text-gray-800 dark:text-slate-100">{student?.name ?? "Unknown writer"}</span>
                    <Badge variant={getStatusVariant(issue.status)} className="shrink-0 text-[10px]">
                      {issue.status}
                    </Badge>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={getPriorityVariant(issue.priority)} className="text-[10px]">
                      {issue.priority}
                    </Badge>
                    <span className="truncate text-xs font-semibold text-gray-500 dark:text-slate-400">{issue.category}</span>
                  </div>
                  <div className="line-clamp-2 text-xs leading-5 text-gray-500 dark:text-slate-500">{issue.description}</div>
                </button>
              )
            })}
            {!loading && !error && visibleIssues.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400 dark:text-slate-500">No issues found. Create an issue to start a ticket thread.</div>
            )}
          </div>
        </Card>

        {/* Right column: Ticket Detail & Chat */}
        <Card className="flex min-h-[560px] flex-col overflow-hidden lg:h-full">
          {selectedIssue ? (
            <>
              <CardHeader className="shrink-0 border-b border-gray-200 bg-white/80 dark:border-white/5 dark:bg-slate-950/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                      <StatusIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg text-gray-950 dark:text-white">
                      <span className="break-words">{selectedIssue.category}</span>
                      <Badge variant={getPriorityVariant(selectedIssue.priority)}>{selectedIssue.priority}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 break-words">
                      Reported by <span className="font-semibold text-gray-700 dark:text-slate-300">{relatedStudent?.name}</span> / {formatDistanceToNow(new Date(selectedIssue.createdAt), { addSuffix: true })}
                    </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(selectedIssue.status)} className="w-fit">
                    {selectedIssue.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <div className="flex-1 space-y-5 overflow-y-auto bg-gray-100 p-4 dark:bg-deep-navy-900/30 sm:p-5">
                 {/* Initial Issue Description */}
                 <div className="flex gap-3 sm:gap-4">
                  <Avatar className="mt-1 h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-cyan-500/15 text-xs font-bold text-cyan-300">{getInitials(relatedStudent?.name || '?')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-lg border border-cyan-500/15 bg-white p-4 text-sm text-gray-700 shadow-sm dark:bg-slate-950/70 dark:text-slate-300">
                      <div className="mb-2 flex items-center gap-2 font-semibold text-gray-950 dark:text-slate-100">
                        <UserRound className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                        Issue Description
                      </div>
                      <p className="whitespace-pre-wrap break-words leading-6">{selectedIssue.description}</p>
                    </div>
                  </div>
                 </div>

                 {/* Comments */}
                 {issueComments.map(comment => (
                   <div key={comment.id} className="flex gap-3 sm:gap-4">
                     <Avatar className="mt-1 h-9 w-9 shrink-0">
                       <AvatarFallback className={comment.role === 'Admin' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-cyan-500/15 text-cyan-300'}>
                         {getInitials(comment.authorName)}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                       <div className="mb-2 flex flex-wrap items-center gap-2">
                         <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{comment.authorName}</span>
                         <Badge variant={comment.role === 'Admin' ? 'success' : 'info'} className="h-5 px-2 text-[10px] uppercase">
                           {comment.role === "Admin" && <ShieldCheck className="h-3 w-3" aria-hidden="true" />}
                           {comment.role}
                         </Badge>
                          <span className="text-xs text-gray-400 dark:text-slate-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                       </div>
                       
                       {isAdmin && editingCommentId === comment.id ? (
                        <div className={cn("rounded-lg border p-3 text-sm shadow-sm", comment.role === 'Admin' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-gray-200 bg-white/80 dark:border-white/5 dark:bg-slate-900/70')}>
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="mb-2 min-h-[88px] resize-none"
                          />
                           <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                             <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>Save</Button>
                           </div>
                         </div>
                       ) : (
                          <div className={cn(
                            "group relative rounded-lg border p-4 pr-12 text-sm shadow-sm",
                            comment.role === 'Admin'
                              ? 'border-emerald-500/20 bg-emerald-500/[0.07] text-gray-700 dark:text-slate-200'
                              : 'border-gray-200 bg-white/90 text-gray-700 dark:border-white/5 dark:bg-slate-900/70 dark:text-slate-300'
                          )}>
                           {isAdmin && (
                            <div className="absolute right-2 top-2 flex overflow-hidden rounded-md border border-gray-200 bg-gray-100 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:border-white/5 dark:bg-slate-800">
                              <button
                                onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.text); }}
                                className="p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                                aria-label="Edit comment"
                                title="Edit comment"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingCommentId(comment.id)}
                                className="border-l border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 dark:border-white/5 dark:text-slate-400"
                                aria-label="Delete comment"
                                title="Delete comment"
                              >
                               <Trash2 className="h-3.5 w-3.5" />
                             </button>
                           </div>
                           )}
                           <p className="whitespace-pre-wrap break-words leading-6">{comment.text}</p>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
                 <PaginationControls
                   page={commentsPage.page}
                   pageSize={commentsPage.pageSize}
                   total={commentsPage.total}
                   onPageChange={setCommentsPageNumber}
                 />
              </div>

              {/* Reply Box */}
              {canReply && (
              <div className="shrink-0 border-t border-gray-200 bg-white/90 p-4 dark:border-white/5 dark:bg-slate-950/80">
                <form onSubmit={handleSubmitReply} className="flex flex-col gap-3">
                  {isAdmin && (
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/70">
                    <div className="flex flex-wrap items-center gap-2 px-2 sm:gap-4">
                       <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Posting as</label>
                       <select 
                         value={selectedRole} 
                         onChange={(e) => setSelectedRole(e.target.value as Role)}
                         className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-gray-900 focus:ring-0 dark:text-white"
                       >
                         <option value="Admin">Admin</option>
                         <option value="Student">Writer</option>
                       </select>
                    </div>
                    {selectedRole === 'Admin' && (
                      <div className="flex flex-wrap items-center gap-2 px-2 sm:gap-4">
                         <label className="text-xs font-semibold text-gray-500 dark:text-slate-400">Update status</label>
                         <select 
                           value={nextStatus} 
                           onChange={(e) => setNextStatus(e.target.value as IssueStatus)}
                           className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-gray-900 focus:ring-0 dark:text-white"
                         >
                           <option value="">Don&apos;t Change</option>
                           <option value="Pending">Pending</option>
                           <option value="In Progress">In Progress</option>
                           <option value="Resolved">Resolved</option>
                           <option value="Escalated">Escalated</option>
                         </select>
                      </div>
                    )}
                  </div>
                  )}
                  <Textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..." 
                    className="min-h-[104px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" className="gap-2" disabled={isSaving || !replyText.trim()}>
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {isSaving ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                </form>
              </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-gray-400 dark:text-slate-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                <MessageSquareText className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-slate-200">Select a ticket</p>
                <p className="text-sm">Pick an issue from the queue to view its discussion.</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {isAdmin && (
      <Dialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCommentId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}
