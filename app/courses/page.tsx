"use client"

import { type FormEvent, useState } from "react"
import { useToastStore } from "@/store/useToastStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"
import { createCourse, deleteCourse, listCoursesWithEnrollmentPage, updateCourse } from "@/lib/data/courses"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getErrorMessage } from "@/lib/data/client"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { CourseWithEnrollment } from "@/lib/data/types"

const PAGE_SIZE = 10

export default function CoursesPage() {
  const [page, setPage] = useState(1)
  const { data: coursesPage, loading, error, refresh } = useSupabaseQuery(
    () => listCoursesWithEnrollmentPage({ page, pageSize: PAGE_SIZE }),
    { items: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    ["courses", "student_courses"],
    String(page)
  )
  const courses = coursesPage.items
  const { addToast } = useToastStore()
  const { isAdmin } = useCurrentUserRole()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const deletingCourse = courses.find(course => course.id === deletingCourseId)

  const resetCourseForm = () => {
    setEditingCourseId(null)
    setNewCode("")
    setNewTitle("")
    setFormError("")
  }

  const openCreateDialog = () => {
    resetCourseForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (course: CourseWithEnrollment) => {
    setEditingCourseId(course.id)
    setNewCode(course.code)
    setNewTitle(course.title)
    setFormError("")
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)

    if (!open) {
      resetCourseForm()
    }
  }

  const handleSubmitCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    setIsSaving(true)

    const code = newCode.trim().toUpperCase()
    const title = newTitle.trim()

    if (!code || !title) {
      setFormError("Course code and course title are required.")
      setIsSaving(false)
      return
    }

    const isDuplicate = courses.some(course => course.id !== editingCourseId && course.code.toLowerCase() === code.toLowerCase())

    if (isDuplicate) {
      setFormError("A course with this code already exists.")
      setIsSaving(false)
      return
    }

    try {
      const course = editingCourseId
        ? await updateCourse(editingCourseId, { code, title })
        : await createCourse({ code, title })
      await refresh()

      addToast({
        title: editingCourseId ? "Course Updated" : "Course Created",
        description: editingCourseId ? `${course.code} was saved.` : `${course.code} has been added successfully.`,
        type: "success",
      })

      setIsDialogOpen(false)
      resetCourseForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return
    setIsDeleting(true)

    try {
      await deleteCourse(deletingCourseId)
      await refresh()
      setDeletingCourseId(null)
      addToast({
        title: "Course Deleted",
        description: "The course was removed.",
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Courses</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage the academic course catalog.</p>
        </div>

        {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[460px]">
            <form onSubmit={handleSubmitCourse}>
              <DialogHeader>
                <DialogTitle>{editingCourseId ? "Edit Course" : "Add Course"}</DialogTitle>
                <DialogDescription>
                  Create a course code and title for student assignments.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-6">
                {formError && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-500">
                    {formError}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="course-code">Course Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="course-code"
                    placeholder="e.g. CS301"
                    value={newCode}
                    onChange={(event) => setNewCode(event.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="course-title">Course Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="course-title"
                    placeholder="e.g. Advanced AI Writing"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingCourseId ? "Save" : "Save Course"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>All registered courses with enrollment counts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <div className="p-6"><LoadingState label="Loading courses..." /></div>}
          {error && <div className="p-6"><ErrorState message={error} onRetry={refresh} /></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-right">Enrolled Students</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-semibold">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell className="text-right text-zinc-600 dark:text-zinc-400">{course.enrolledStudents}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon" title="Edit course" onClick={() => openEditDialog(course)}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Edit course</span>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Delete course" onClick={() => setDeletingCourseId(course.id)}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Delete course</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
              {!loading && !error && courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="h-24 text-center text-zinc-500">
                    No courses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={coursesPage.page}
            pageSize={coursesPage.pageSize}
            total={coursesPage.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {isAdmin && (
      <Dialog open={!!deletingCourseId} onOpenChange={(open) => !open && setDeletingCourseId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              {deletingCourse ? `Remove "${deletingCourse.code}"? Student assignments will be removed and related prompts will become course-agnostic.` : "Remove this course?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingCourseId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCourse} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}
