"use client"

import { type FormEvent, useState } from "react"
import { useToastStore } from "@/store/useToastStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { createCourse, listCoursesWithEnrollment } from "@/lib/data/courses"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { getErrorMessage } from "@/lib/data/client"

export default function CoursesPage() {
  const { data: courses, loading, error, refresh } = useSupabaseQuery(
    listCoursesWithEnrollment,
    [],
    ["courses", "student_courses"]
  )
  const { addToast } = useToastStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const resetCourseForm = () => {
    setNewCode("")
    setNewTitle("")
    setFormError("")
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)

    if (!open) {
      resetCourseForm()
    }
  }

  const handleAddCourse = async (event: FormEvent<HTMLFormElement>) => {
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

    const isDuplicate = courses.some(course => course.code.toLowerCase() === code.toLowerCase())

    if (isDuplicate) {
      setFormError("A course with this code already exists.")
      setIsSaving(false)
      return
    }

    try {
      const course = await createCourse({ code, title })
      await refresh()

      addToast({
        title: "Course Created",
        description: `${course.code} has been added successfully.`,
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Courses</h1>
          <p className="text-zinc-500 dark:text-zinc-400">View and manage all academic courses.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[460px]">
            <form onSubmit={handleAddCourse}>
              <DialogHeader>
                <DialogTitle>Add Course</DialogTitle>
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
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Course"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Courses</CardTitle>
          <CardDescription>All currently registered curriculum courses.</CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-semibold">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell className="text-right text-zinc-600 dark:text-zinc-400">{course.enrolledStudents}</TableCell>
                  </TableRow>
                )
              })}
              {!loading && !error && courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-zinc-500">
                    No courses found.
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
