"use client"

import { useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { useToastStore } from "@/store/useToastStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function StudentsPage() {
  const { students, courses, addStudent } = useAppStore()
  const { addToast } = useToastStore()
  const [searchTerm, setSearchTerm] = useState("")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [newTrainer, setNewTrainer] = useState("")
  const [newStatus, setNewStatus] = useState<"Active" | "Inactive">("Active")
  const [newNotes, setNewNotes] = useState("")
  const [formError, setFormError] = useState("")

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

  const getPriorityVariant = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'default'
      case 'Medium': return 'secondary'
      default: return 'outline'
    }
  }

  const toggleCourse = (courseCode: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseCode) 
        ? prev.filter(c => c !== courseCode) 
        : [...prev, courseCode]
    )
  }

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    
    // Validation
    const nameTrimmed = newName.trim()
    const emailTrimmed = newEmail.trim()
    
    if (!nameTrimmed) {
      setFormError("Student Name is required.")
      return
    }

    const isDuplicate = students.some(s => 
      s.name.toLowerCase() === nameTrimmed.toLowerCase() &&
      (s.email ?? '')?.toLowerCase() === (emailTrimmed ?? '')?.toLowerCase()
    )

    if (isDuplicate) {
      setFormError("A student with this name and email already exists.")
      return
    }

    addStudent({
      name: nameTrimmed,
      email: emailTrimmed,
      assignedCourses: selectedCourses,
      assignedTrainer: newTrainer.trim() || 'Unassigned',
      notes: newNotes.trim(),
      overallStatus: newStatus === "Active" ? "In Progress" : "Pending",
      priority: "Medium"
    })

    addToast({
      title: "Student Created",
      description: `${nameTrimmed} has been added successfully.`,
      type: "success"
    })

    // Reset Form
    setIsModalOpen(false)
    setNewName("")
    setNewEmail("")
    setSelectedCourses([])
    setNewTrainer("")
    setNewStatus("Active")
    setNewNotes("")
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Students</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and track student progress and issues.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Add New Student</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddStudent}>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the details of the new student. This will be saved to the database.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-6">
                {formError && (
                  <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm font-medium border border-red-500/20">
                    {formError}
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="name">Student Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. John Doe" 
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
                  <div className="flex flex-wrap gap-2 pt-1">
                    {courses.map(course => (
                      <button
                        type="button"
                        key={course.code}
                        onClick={() => toggleCourse(course.code)}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 ${
                          selectedCourses.includes(course.code)
                            ? 'border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                            : 'border-zinc-200 text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {course.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="trainer">Assigned Trainer</Label>
                    <Input 
                      id="trainer" 
                      placeholder="e.g. Sarah Jenkins" 
                      value={newTrainer}
                      onChange={(e) => setNewTrainer(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <select
                      id="status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as "Active" | "Inactive")}
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
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
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="h-9 w-full rounded-md border border-zinc-200 bg-transparent pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:focus:ring-zinc-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </CardHeader>
        <CardContent className="p-0">
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
                      {student.assignedCourses.map((c, i) => (
                         <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      {student.issues.slice(0, 2).map((issue, i) => (
                        <span key={i} className="text-xs truncate text-zinc-600 dark:text-zinc-400">• {issue}</span>
                      ))}
                      {student.issues.length > 2 && (
                        <span className="text-[10px] text-zinc-400">+{student.issues.length - 2} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(student.overallStatus)}>
                      {student.overallStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(student.priority)}>
                      {student.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                    No students found.
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
