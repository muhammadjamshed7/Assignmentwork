"use client"

import { useAppStore } from "@/store/useAppStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CoursesPage() {
  const { courses, students } = useAppStore()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Courses</h1>
        <p className="text-zinc-500 dark:text-zinc-400">View and manage all academic courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Courses</CardTitle>
          <CardDescription>All currently registered curriculum courses.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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
                const enrolled = students.filter(s => s.assignedCourses.includes(course.code)).length
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-semibold">{course.code}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell className="text-right text-zinc-600 dark:text-zinc-400">{enrolled}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
