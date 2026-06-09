"use client"

import { useState } from "react"
import { useToastStore } from "@/store/useToastStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createStudent, deleteStudent, listStudentsPage, updateStudent } from "@/lib/data/students"
import { listCourses } from "@/lib/data/courses"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getErrorMessage } from "@/lib/data/client"
import { useSearchStore } from "@/store/useSearchStore"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { Student } from "@/lib/data/types"
import { getPriorityVariant } from "@/lib/utils"
import { writerStatusBadgeVariant, writerStatusFromOverallStatus, type WriterStatus } from "@/lib/data/writer-status"

const PAGE_SIZE = 10

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refresh } = useSupabaseQuery(
    async () => {
      const [studentsPage, courses] = await Promise.all([listStudentsPage({ page, pageSize: PAGE_SIZE }), listCourses()])
      return { studentsPage, courses }
    },
    { studentsPage: { items: [], total: 0, page: 1, pageSize: PAGE_SIZE }, courses: [] },
    ["students", "student_courses", "courses", "issues"],
    String(page)
  )
  const { studentsPage, courses } = data
  const students = studentsPage.items
  const { addToast } = useToastStore()
  const searchQuery = useSearchStore(state => state.searchQuery)
  const { isAdmin } = useCurrentUserRole()
  const [searchTerm, setSearchTerm] = useState("")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [newTrainer, setNewTrainer] = useState("")
  const [newStatus, setNewStatus] = useState<WriterStatus>("Active")
  const [newNotes, setNewNotes] = useState("")
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deletingStudent = students.find(student => student.id === deletingStudentId)

  const filteredStudents = students.filter(student => {
    const localQuery = searchTerm.trim().toLowerCase()
    const globalQuery = searchQuery.trim().toLowerCase()
    const searchableText = [
      student.name,
      student.email ?? "",
      student.assignedTrainer,
      student.overallStatus,
      student.priority,
      ...student.assignedCourses,
      ...student.issues,
    ].join(" ").toLowerCase()

    return (!localQuery || searchableText.includes(localQuery)) &&
      (!globalQuery || searchableText.includes(globalQuery))
  })

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(c => c !== courseId) 
        : [...prev, courseId]
    )
  }

  const addSelectedCourse = (courseId: string) => {
    if (!courseId) return
    setSelectedCourses(prev => prev.includes(courseId) ? prev : [...prev, courseId])
  }

  const selectedCourseRows = courses.filter(course => selectedCourses.includes(course.id))
  const unassignedCourseRows = courses.filter(course => !selectedCourses.includes(course.id))

  const resetForm = () => {
    setEditingStudentId(null)
    setNewName("")
    setNewEmail("")
    setSelectedCourses([])
    setNewTrainer("")
    setNewStatus("Active")
    setNewNotes("")
    setFormError("")
  }

  const openCreateDialog = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditDialog = (student: Student) => {
    setEditingStudentId(student.id)
    setNewName(student.name)
    setNewEmail(student.email ?? "")
    setSelectedCourses(student.assignedCourseIds)
    setNewTrainer(student.assignedTrainer)
    setNewStatus(writerStatusFromOverallStatus(student.overallStatus))
    setNewNotes(student.notes ?? "")
    setFormError("")
    setIsModalOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsModalOpen(open)

    if (!open) {
      resetForm()
    }
  }

  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsSaving(true)
    
    const nameTrimmed = newName.trim()
    const emailTrimmed = newEmail.trim()
    
    if (!nameTrimmed) {
      setFormError("Writer name is required.")
      setIsSaving(false)
      return
    }

    const isDuplicate = emailTrimmed && students.some(s =>
      s.id !== editingStudentId && (s.email ?? "").toLowerCase() === emailTrimmed.toLowerCase()
    )

    if (isDuplicate) {
      setFormError("A writer with this email already exists.")
      setIsSaving(false)
      return
    }

    try {
      const studentData: Parameters<typeof createStudent>[0] = {
        name: nameTrimmed,
        email: emailTrimmed,
        assignedCourseIds: selectedCourses,
        assignedTrainer: newTrainer.trim() || "Unassigned",
        notes: newNotes.trim(),
        overallStatus: newStatus === "Active" ? "In Progress" : "Pending",
        priority: "Medium",
      }

      if (editingStudentId) {
        await updateStudent(editingStudentId, studentData)
      } else {
        await createStudent(studentData)
      }
      await refresh()

      addToast({
        title: editingStudentId ? "Writer Updated" : "Writer Created",
        description: editingStudentId ? `${nameTrimmed} was saved.` : `${nameTrimmed} has been added successfully.`,
        type: "success"
      })

      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!deletingStudentId) return
    setIsDeleting(true)

    try {
      await deleteStudent(deletingStudentId)
      await refresh()
      setDeletingStudentId(null)
      addToast({
        title: "Writer Deleted",
        description: "The writer record was removed.",
        type: "success",
      })
    } catch (err) {
      addToast({
        title: "Delete Failed",
        description: getErrorMessage(err),
        type: "error",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">Writers</h1>
          <p className="text-slate-400">Manage writer details, assigned courses, status, and support issues.</p>
        </div>
        
        {isAdmin && (
        <Dialog open={isModalOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" onClick={openCreateDialog}>Add New Writer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmitStudent}>
              <DialogHeader>
                <DialogTitle>{editingStudentId ? "Edit Writer" : "Add New Writer"}</DialogTitle>
                <DialogDescription>
                  Enter the writer details. This will be saved to the database.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-6">
                {formError && (
                  <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm font-medium border border-red-500/20">
                    {formError}
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Writer Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Writer name" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address <span className="text-zinc-400 text-xs font-normal ml-1">(Optional)</span></Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="e.g. john@example.com" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Assigned Courses</Label>
                  <select
                    value=""
                    onChange={(event) => addSelectedCourse(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-100/50 px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                    disabled={courses.length === 0 || unassignedCourseRows.length === 0}
                  >
                    <option value="">
                      {courses.length === 0
                        ? "No courses available"
                        : unassignedCourseRows.length === 0
                          ? "All courses assigned"
                          : "Select a course to assign"}
                    </option>
                    {unassignedCourseRows.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                  <div className="flex min-h-8 flex-wrap gap-2 pt-1">
                    {selectedCourseRows.map(course => (
                      <button
                        type="button"
                        key={course.id}
                        onClick={() => toggleCourse(course.id)}
                        className="inline-flex items-center rounded-full border border-indigo-500/50 bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                        title="Remove assigned course"
                      >
                        {course.code} x
                      </button>
                    ))}
                    {selectedCourseRows.length === 0 && (
                      <span className="text-xs text-gray-400 dark:text-slate-500">No courses assigned.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="trainer">Assigned Trainer</Label>
                    <Input 
                      id="trainer" 
                      placeholder="e.g. Trainer name" 
                      value={newTrainer}
                      onChange={(e) => setNewTrainer(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">{editingStudentId ? "Writer Work Status" : "Initial Work Status"}</Label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as WriterStatus)}
                      className="flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes <span className="text-zinc-400 text-xs font-normal ml-1">(Optional)</span></Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Enter any initial notes or observations here..." 
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingStudentId ? "Save" : "Save Writer"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
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
          {loading && <div className="p-6"><LoadingState label="Loading writers..." /></div>}
          {error && <div className="p-6"><ErrorState message={error} onRetry={refresh} /></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-zinc-500">{student.assignedTrainer}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {student.assignedCourses.map(c => (
                         <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      {student.issues.slice(0, 2).map(issue => (
                       <span key={issue} className="text-xs truncate text-gray-400 dark:text-slate-500">• {issue}</span>
                       ))}
                       {student.issues.length > 2 && (
                         <span className="text-[10px] text-gray-400 dark:text-slate-500">+{student.issues.length - 2} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const writerStatus = writerStatusFromOverallStatus(student.overallStatus)

                      return (
                        <Badge variant={writerStatusBadgeVariant(writerStatus)}>
                          {writerStatus}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(student.priority)}>
                      {student.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isAdmin && (
                        <>
                          <Button type="button" variant="ghost" size="icon" title="Edit writer" onClick={() => openEditDialog(student)}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Edit writer</span>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Delete writer" onClick={() => setDeletingStudentId(student.id)}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Delete writer</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !error && filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-400 dark:text-slate-500">
                    No writers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={studentsPage.page}
            pageSize={studentsPage.pageSize}
            total={studentsPage.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {isAdmin && (
      <Dialog open={!!deletingStudentId} onOpenChange={(open) => !open && setDeletingStudentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Writer</DialogTitle>
            <DialogDescription>
              {deletingStudent ? `Remove "${deletingStudent.name}" and all related issues/comments?` : "Remove this writer record?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingStudentId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteStudent} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}
