"use client"

import { useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Copy, Pencil, PlusCircle, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToastStore } from "@/store/useToastStore"
import { Prompt, useAppStore } from "@/store/useAppStore"

const PROMPT_CATEGORIES = [
  "Instructions",
  "Thesis",
  "Data Extraction",
  "Reference Memory",
  "Remake",
  "Feedback",
  "General",
]

const EMPTY_PROMPT_FORM = {
  title: "",
  category: "General",
  relatedCourseId: "",
  tags: "",
  content: "",
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"

type PromptFormState = typeof EMPTY_PROMPT_FORM

function toPromptForm(prompt: Prompt): PromptFormState {
  return {
    title: prompt.title,
    category: prompt.category,
    relatedCourseId: prompt.relatedCourseId ?? "",
    tags: prompt.tags.join(", "),
    content: prompt.content,
  }
}

function parseTags(value: string) {
  return value
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
}

export default function PromptsPage() {
  const { courses, prompts, addPrompt, updatePrompt, removePrompt } = useAppStore()
  const { addToast } = useToastStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null)
  const [form, setForm] = useState<PromptFormState>(EMPTY_PROMPT_FORM)
  const [formError, setFormError] = useState("")

  const filteredPrompts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return prompts
      .filter(prompt => categoryFilter === "All" || prompt.category === categoryFilter)
      .filter(prompt => {
        if (!query) return true

        return (
          prompt.title.toLowerCase().includes(query) ||
          prompt.content.toLowerCase().includes(query) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(query))
        )
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [categoryFilter, prompts, searchTerm])

  const selectedPrompt = filteredPrompts[0] ?? prompts[0]
  const deletingPrompt = prompts.find(prompt => prompt.id === deletingPromptId)

  function updateFormField(field: keyof PromptFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm(EMPTY_PROMPT_FORM)
    setEditingPromptId(null)
    setFormError("")
  }

  function openCreateDialog() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(prompt: Prompt) {
    setForm(toPromptForm(prompt))
    setEditingPromptId(prompt.id)
    setFormError("")
    setIsDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open)

    if (!open) {
      resetForm()
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")

    const title = form.title.trim()
    const content = form.content.trim()

    if (!title || !content) {
      setFormError("Title and prompt content are required.")
      return
    }

    const promptData = {
      title,
      category: form.category,
      content,
      relatedCourseId: form.relatedCourseId || undefined,
      tags: parseTags(form.tags),
    }

    if (editingPromptId) {
      updatePrompt(editingPromptId, promptData)
      addToast({
        title: "Prompt Updated",
        description: `${title} was saved.`,
        type: "success",
      })
    } else {
      addPrompt(promptData)
      addToast({
        title: "Prompt Created",
        description: `${title} was added to the prompt library.`,
        type: "success",
      })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  async function handleCopy(prompt: Prompt) {
    try {
      await navigator.clipboard.writeText(prompt.content)
      addToast({
        title: "Prompt Copied",
        description: `${prompt.title} is ready to paste.`,
        type: "success",
      })
    } catch {
      addToast({
        title: "Copy Failed",
        description: "The browser blocked clipboard access.",
        type: "error",
      })
    }
  }

  function handleDeletePrompt() {
    if (!deletingPromptId) return

    removePrompt(deletingPromptId)
    setDeletingPromptId(null)
    addToast({
      title: "Prompt Deleted",
      description: "The prompt was removed from the library.",
      type: "success",
    })
  }

  function getCourseLabel(courseId?: string) {
    if (!courseId) return "Any course"

    const course = courses.find(item => item.id === courseId)
    return course ? `${course.code} - ${course.title}` : "Any course"
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Prompts</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Create and manage reusable academic support prompts.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <DialogHeader>
                <DialogTitle>{editingPromptId ? "Edit Prompt" : "Create Prompt"}</DialogTitle>
                <DialogDescription>Save reusable prompt text for admin workflows.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="prompt-title">Title</Label>
                  <Input
                    id="prompt-title"
                    value={form.title}
                    onChange={(event) => updateFormField("title", event.target.value)}
                    placeholder="e.g. Source Summary Prompt"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prompt-category">Category</Label>
                  <select
                    id="prompt-category"
                    value={form.category}
                    onChange={(event) => updateFormField("category", event.target.value)}
                    className={selectClassName}
                  >
                    {PROMPT_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prompt-course">Course</Label>
                  <select
                    id="prompt-course"
                    value={form.relatedCourseId}
                    onChange={(event) => updateFormField("relatedCourseId", event.target.value)}
                    className={selectClassName}
                  >
                    <option value="">Any course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt-tags">Tags</Label>
                <Input
                  id="prompt-tags"
                  value={form.tags}
                  onChange={(event) => updateFormField("tags", event.target.value)}
                  placeholder="brief, sources, citation"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt-content">Prompt</Label>
                <Textarea
                  id="prompt-content"
                  value={form.content}
                  onChange={(event) => updateFormField("content", event.target.value)}
                  placeholder="Write the reusable prompt here..."
                  className="min-h-[180px]"
                  required
                />
              </div>

              {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingPromptId ? "Save" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search prompts..."
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:focus:ring-zinc-300"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={`${selectClassName} sm:w-[180px]`}
            >
              <option value="All">All categories</option>
              {PROMPT_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map(prompt => (
                  <TableRow key={prompt.id}>
                    <TableCell className="max-w-sm">
                      <div className="font-medium text-zinc-950 dark:text-zinc-50">{prompt.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-zinc-500">{prompt.content}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {prompt.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{prompt.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[190px] truncate text-zinc-600 dark:text-zinc-400">
                      {getCourseLabel(prompt.relatedCourseId)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(prompt.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" title="Copy prompt" onClick={() => handleCopy(prompt)}>
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Copy prompt</span>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title="Edit prompt" onClick={() => openEditDialog(prompt)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Edit prompt</span>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title="Delete prompt" onClick={() => setDeletingPromptId(prompt.id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Delete prompt</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPrompts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                      No prompts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>{selectedPrompt ? selectedPrompt.title : "No prompt selected"}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPrompt ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selectedPrompt.category}</Badge>
                  <Badge variant="outline">{getCourseLabel(selectedPrompt.relatedCourseId)}</Badge>
                </div>
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                  {selectedPrompt.content}
                </pre>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={() => handleCopy(selectedPrompt)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
                Create a prompt to preview it here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!deletingPromptId} onOpenChange={(open) => !open && setDeletingPromptId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              {deletingPrompt ? `Remove "${deletingPrompt.title}" from the prompt library?` : "Remove this prompt?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingPromptId(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeletePrompt}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
