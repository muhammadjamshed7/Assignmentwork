"use client"

import { useState } from "react"
import { IssueStatus, Role } from "@/lib/data/types"
import { useToastStore } from "@/store/useToastStore"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NewIssueDialog } from "@/components/issues/new-issue-dialog"
import { createComment, deleteComment, listCommentsPage, updateComment } from "@/lib/data/comments"
import { listStudents } from "@/lib/data/students"
import { listIssues, updateIssueStatus } from "@/lib/data/issues"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getErrorMessage } from "@/lib/data/client"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { PaginationControls } from "@/components/ui/pagination-controls"

const PAGE_SIZE = 10

export default function CommentsPage() {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [commentsPageNumber, setCommentsPageNumber] = useState(1)
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

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6 lg:h-[calc(100vh-8rem)] lg:overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">Comments & Tickets</h1>
          <p className="text-slate-400">Issue threads with admin reply and status controls.</p>
        </div>
        <NewIssueDialog onIssueCreated={selectIssue} onSaved={refresh} students={students} />
      </div>

      {loading && <LoadingState label="Loading tickets..." />}
      {error && <ErrorState message={error} onRetry={refresh} />}
      {formError && <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}

      <div className="grid flex-1 gap-6 lg:min-h-0 lg:grid-cols-3">
        {/* Left column: Ticket List */}
        <Card className="flex min-h-[320px] flex-col overflow-hidden lg:col-span-1 lg:h-full">
          <CardHeader className="px-4 py-3 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-slate-900/50 shrink-0">
            <CardTitle className="font-display text-sm text-gray-900 dark:text-white">Active Issues</CardTitle>
          </CardHeader>
          <div className="max-h-[420px] flex-1 space-y-2 overflow-y-auto p-2 lg:max-h-none">
            {issues.map(issue => {
              const student = students.find(s => s.id === issue.studentId)
              const isSelected = activeIssueId === issue.id
              return (
                <button
                  key={issue.id}
                  onClick={() => selectIssue(issue.id)}
                  className={                  `w-full text-left p-3 rounded-lg border transition-all ${isSelected ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 hover:border-gray-300 dark:border-slate-700'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-700 dark:text-slate-300">{student?.name}</span>
                    <Badge variant={issue.status === 'Resolved' ? 'success' : issue.status === 'In Progress' ? 'info' : issue.status === 'Escalated' ? 'destructive' : 'pending'} className="text-[10px] px-1.5 py-0">
                      {issue.status}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">{issue.category}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 line-clamp-2">{issue.description}</div>
                </button>
              )
            })}
            {!loading && !error && issues.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400 dark:text-slate-500">No issues found. Create an issue to start a ticket thread.</div>
            )}
          </div>
        </Card>

        {/* Right column: Ticket Detail & Chat */}
        <Card className="flex min-h-[520px] flex-col overflow-hidden lg:col-span-2 lg:h-full">
          {selectedIssue ? (
            <>
              <CardHeader className="border-b border-gray-200 dark:border-white/5 shrink-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                      {selectedIssue.category}
                      <Badge variant="outline">{selectedIssue.priority}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 break-words">
                      Reported by <span className="font-semibold text-gray-700 dark:text-slate-300">{relatedStudent?.name}</span> / {formatDistanceToNow(new Date(selectedIssue.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Badge variant={selectedIssue.status === 'Resolved' ? 'success' : selectedIssue.status === 'In Progress' ? 'info' : selectedIssue.status === 'Escalated' ? 'destructive' : 'pending'}>
                    {selectedIssue.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-100 dark:bg-deep-navy-900/30">
                 {/* Initial Issue Description */}
                 <div className="flex gap-3 sm:gap-4">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-slate-800 text-xs text-gray-500 dark:text-slate-400">{getInitials(relatedStudent?.name || '?')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-slate-900/80 p-4 rounded-lg border border-gray-200 dark:border-white/5 shadow-sm text-sm text-gray-700 dark:text-slate-300">
                      <p className="mb-2 font-medium text-slate-100">Issue Description</p>
                      {selectedIssue.description}
                    </div>
                  </div>
                 </div>

                 {/* Comments */}
                 {issueComments.map(comment => (
                   <div key={comment.id} className="flex gap-3 sm:gap-4">
                     <Avatar className="h-8 w-8 mt-1 shrink-0">
                       <AvatarFallback className={comment.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}>
                         {getInitials(comment.authorName)}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                       <div className="mb-1 flex flex-wrap items-center gap-2">
                         <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{comment.authorName}</span>
                         <Badge variant={comment.role === 'Admin' ? 'success' : 'info'} className="text-[10px] uppercase px-1 py-0 h-4">
                           {comment.role}
                         </Badge>
                          <span className="text-xs text-gray-400 dark:text-slate-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                       </div>
                       
                       {isAdmin && editingCommentId === comment.id ? (
                        <div className={`p-3 rounded-lg border text-sm shadow-sm ${comment.role === 'Admin' ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/60 dark:bg-slate-900/60 border-gray-200 dark:border-white/5'}`}>
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full min-h-[80px] p-2 rounded-md border border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none text-sm mb-2"
                          />
                           <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                             <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>Save</Button>
                           </div>
                         </div>
                       ) : (
                          <div className={`p-3 rounded-lg border text-sm shadow-sm group relative pr-12 ${comment.role === 'Admin' ? 'bg-indigo-500/5 border-indigo-500/20 text-gray-700 dark:text-slate-300' : 'bg-white/60 dark:bg-slate-900/60 border-gray-200 dark:border-white/5 text-gray-700 dark:text-slate-300'}`}>
                           {isAdmin && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-gray-100 dark:bg-slate-800 shadow-sm rounded-md overflow-hidden border border-gray-200 dark:border-white/5">
                              <button
                                onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.text); }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-slate-200 transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingCommentId(comment.id)}
                                className="p-1.5 hover:bg-red-500/10 text-gray-500 dark:text-slate-400 hover:text-red-400 transition-colors border-l border-gray-200 dark:border-white/5"
                              >
                               <Trash2 className="h-3.5 w-3.5" />
                             </button>
                           </div>
                           )}
                           <p className="whitespace-pre-wrap">{comment.text}</p>
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
              {(isAdmin || isStudent) && (
              <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 shrink-0">
                <form onSubmit={handleSubmitReply} className="flex flex-col gap-3">
                  {isAdmin && (
                  <div className="flex flex-col gap-2 rounded-t-md border border-b-0 border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 p-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2 px-2 sm:gap-4">
                       <label className="text-xs font-semibold text-gray-400 dark:text-slate-500">Posting as:</label>
                       <select 
                         value={selectedRole} 
                         onChange={(e) => setSelectedRole(e.target.value as Role)}
                         className="text-xs bg-transparent border-0 font-medium text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
                       >
                         <option value="Admin">Admin</option>
                         <option value="Student">Writer</option>
                       </select>
                    </div>
                    {selectedRole === 'Admin' && (
                      <div className="flex flex-wrap items-center gap-2 px-2 sm:gap-4">
                         <label className="text-xs text-gray-400 dark:text-slate-500">Update Status:</label>
                         <select 
                           value={nextStatus} 
                           onChange={(e) => setNextStatus(e.target.value as IssueStatus)}
                           className="text-xs bg-transparent font-medium border-0 text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
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
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..." 
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 bg-gray-100/50 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving || !replyText.trim()}>{isSaving ? "Posting..." : "Reply"}</Button>
                  </div>
                </form>
              </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500">
              Select an issue to view discussion
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
