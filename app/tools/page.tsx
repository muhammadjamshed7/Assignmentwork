"use client"

import { type FormEvent, useState } from "react"
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { createAiTool, deleteAiTool, listAiTools, updateAiTool } from "@/lib/data/ai-tools"
import { getErrorMessage } from "@/lib/data/client"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { AiToolUsage } from "@/lib/data/types"
import { useToastStore } from "@/store/useToastStore"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"

const EMPTY_TOOL_FORM = {
  toolName: "",
  description: "",
}

type ToolFormState = typeof EMPTY_TOOL_FORM

function toToolForm(tool: AiToolUsage): ToolFormState {
  return {
    toolName: tool.toolName,
    description: tool.description ?? "",
  }
}

function renderDescription(description?: string) {
  if (!description) return "No description added."

  const urlPattern = /(https?:\/\/[^\s]+)/g

  return description.split(urlPattern).map((part, index) => {
    if (!part.match(urlPattern)) return part

    return (
      <a
        key={`${part}-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-zinc-950 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
      >
        {part}
      </a>
    )
  })
}

export default function AIToolsPage() {
  const { data: aiTools, loading, error, refresh } = useSupabaseQuery(
    listAiTools,
    [],
    ["ai_tools"]
  )
  const { addToast } = useToastStore()
  const { isAdmin } = useCurrentUserRole()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingToolId, setEditingToolId] = useState<string | null>(null)
  const [deletingToolId, setDeletingToolId] = useState<string | null>(null)
  const [form, setForm] = useState<ToolFormState>(EMPTY_TOOL_FORM)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const deletingTool = aiTools.find(tool => tool.id === deletingToolId)
  const filteredTools = aiTools.filter(tool => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true

    return tool.toolName.toLowerCase().includes(query) || (tool.description ?? "").toLowerCase().includes(query)
  })

  function updateFormField(field: keyof ToolFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm(EMPTY_TOOL_FORM)
    setEditingToolId(null)
    setFormError("")
  }

  function openCreateDialog() {
    resetForm()
    setIsDialogOpen(true)
  }

  function openEditDialog(tool: AiToolUsage) {
    setForm(toToolForm(tool))
    setEditingToolId(tool.id)
    setFormError("")
    setIsDialogOpen(true)
  }

  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open)
    if (!open) resetForm()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setIsSaving(true)

    const toolName = form.toolName.trim()
    if (!toolName) {
      setFormError("Tool name is required.")
      setIsSaving(false)
      return
    }

    try {
      const toolData = { toolName, description: form.description.trim() }
      if (editingToolId) {
        await updateAiTool(editingToolId, toolData)
        addToast({ title: "Tool Updated", description: `${toolName} was saved.`, type: "success" })
      } else {
        await createAiTool(toolData)
        addToast({ title: "Tool Created", description: `${toolName} was added successfully.`, type: "success" })
      }
      await refresh()
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteTool() {
    if (!deletingToolId) return
    setIsDeleting(true)
    try {
      await deleteAiTool(deletingToolId)
      await refresh()
      setDeletingToolId(null)
      addToast({ title: "Tool Deleted", description: "The AI tool was removed.", type: "success" })
    } catch (err) {
      addToast({ title: "Delete Failed", description: getErrorMessage(err), type: "error" })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">AI Tools Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Add real AI tools when you are ready to track approved resources.</p>
        </div>

        {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingToolId ? "Edit Tool" : "Add Tool"}</DialogTitle>
                <DialogDescription>Add or edit an AI tool name and description.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-6">
                {formError && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-500">
                    {formError}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="tool-name">Tool Name <span className="text-red-500">*</span></Label>
                  <Input id="tool-name" value={form.toolName} onChange={(event) => updateFormField("toolName", event.target.value)} placeholder="Tool name" required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tool-description">What is it used for?</Label>
                  <Textarea id="tool-description" value={form.description} onChange={(event) => updateFormField("description", event.target.value)} placeholder="Describe the tool's purpose and use cases..." />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingToolId ? "Save" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {loading && <LoadingState label="Loading AI tools..." />}
      {error && <ErrorState message={error} onRetry={refresh} />}

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search tools..."
          className="h-9 w-full rounded-md border border-zinc-200 bg-transparent pl-9 pr-4 text-sm shadow-sm outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:focus:ring-zinc-300"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTools.map(tool => (
          <Card key={tool.id} className="group relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base">{tool.toolName}</CardTitle>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => openEditDialog(tool)}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" title="Delete" onClick={() => setDeletingToolId(tool.id)}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {renderDescription(tool.description)}
              </p>
            </CardContent>
          </Card>
        ))}
        {!loading && !error && filteredTools.length === 0 && (
          <div className="p-12 text-center text-zinc-500 sm:col-span-2 lg:col-span-3 xl:col-span-4">
            No AI tools found. Add tools later when you have real data.
          </div>
        )}
      </div>

      {isAdmin && (
      <Dialog open={!!deletingToolId} onOpenChange={(open) => !open && setDeletingToolId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tool</DialogTitle>
            <DialogDescription>
              {deletingTool ? `Remove "${deletingTool.toolName}" from the directory?` : "Remove this AI tool?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingToolId(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteTool} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  )
}
