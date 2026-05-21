"use client"

import * as React from "react"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToastStore } from "@/store/useToastStore"
import {
  IssueCategory,
  IssueStatus,
  PriorityLevel,
  useAppStore,
} from "@/store/useAppStore"

const ISSUE_CATEGORIES: IssueCategory[] = [
  "Prompt Issues",
  "Stealth Writer Issues",
  "Instructions Issues",
  "Data Extraction Issues",
  "Reference Memory Issues",
  "Thesis Issues",
  "Remake Required",
  "Other",
]

const ISSUE_STATUSES: IssueStatus[] = ["Pending", "In Progress", "Resolved", "Escalated"]
const PRIORITIES: PriorityLevel[] = ["Low", "Medium", "High", "Critical"]

type NewIssueDialogProps = {
  onIssueCreated?: (issueId: string) => void
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"

export function NewIssueDialog({ onIssueCreated }: NewIssueDialogProps) {
  const { students, addIssue, addComment } = useAppStore()
  const { addToast } = useToastStore()
  const [open, setOpen] = React.useState(false)
  const [studentId, setStudentId] = React.useState(students[0]?.id ?? "")
  const [category, setCategory] = React.useState<IssueCategory>("Prompt Issues")
  const [priority, setPriority] = React.useState<PriorityLevel>("Medium")
  const [status, setStatus] = React.useState<IssueStatus>("Pending")
  const [description, setDescription] = React.useState("")
  const [adminComment, setAdminComment] = React.useState("")
  const [formError, setFormError] = React.useState("")

  function resetForm() {
    setStudentId(students[0]?.id ?? "")
    setCategory("Prompt Issues")
    setPriority("Medium")
    setStatus("Pending")
    setDescription("")
    setAdminComment("")
    setFormError("")
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const selectedStudentId = studentId || students[0]?.id || ""
    const cleanDescription = description.trim()
    const cleanComment = adminComment.trim()

    if (!selectedStudentId || !cleanDescription) {
      setFormError("Select a student and enter an issue description.")
      return
    }

    const issue = addIssue({
      studentId: selectedStudentId,
      category,
      description: cleanDescription,
      priority,
      status,
    })

    if (cleanComment) {
      addComment({
        studentId: selectedStudentId,
        issueId: issue.id,
        authorName: "Admin User",
        role: "Admin",
        text: cleanComment,
      })
    }

    addToast({
      title: "Issue Created",
      description: cleanComment ? "The issue and admin comment were added." : "The issue was added.",
      type: "success",
    })

    onIssueCreated?.(issue.id)
    setOpen(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          New Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Create Issue</DialogTitle>
            <DialogDescription>Add a student issue and optionally start the admin thread.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-issue-student">Student</Label>
              <select
                id="new-issue-student"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className={selectClassName}
                disabled={students.length === 0}
                required
              >
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-issue-category">Category</Label>
              <select
                id="new-issue-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as IssueCategory)}
                className={selectClassName}
              >
                {ISSUE_CATEGORIES.map(issueCategory => (
                  <option key={issueCategory} value={issueCategory}>
                    {issueCategory}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-issue-priority">Priority</Label>
              <select
                id="new-issue-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as PriorityLevel)}
                className={selectClassName}
              >
                {PRIORITIES.map(priorityLevel => (
                  <option key={priorityLevel} value={priorityLevel}>
                    {priorityLevel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-issue-status">Status</Label>
              <select
                id="new-issue-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as IssueStatus)}
                className={selectClassName}
              >
                {ISSUE_STATUSES.map(issueStatus => (
                  <option key={issueStatus} value={issueStatus}>
                    {issueStatus}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-issue-description">Description</Label>
            <Textarea
              id="new-issue-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What happened?"
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-issue-admin-comment">Admin Comment</Label>
            <Textarea
              id="new-issue-admin-comment"
              value={adminComment}
              onChange={(event) => setAdminComment(event.target.value)}
              placeholder="Optional first response"
              className="min-h-[90px]"
            />
          </div>

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={students.length === 0 || !description.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
