"use client"

import { type FormEvent, useState } from "react"
import dynamic from "next/dynamic"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"

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
import { createAiTool, deleteAiTool, listAiToolsPage, updateAiTool } from "@/lib/data/ai-tools"
import { getErrorMessage } from "@/lib/data/client"
import { ErrorState, LoadingState, useSupabaseQuery } from "@/lib/data/hooks"
import { AiToolUsage } from "@/lib/data/types"
import { useToastStore } from "@/store/useToastStore"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { PaginationControls } from "@/components/ui/pagination-controls"

const PAGE_SIZE = 10

const AIToolsUsageChart = dynamic(
  () => import("@/components/dashboard/charts").then(mod => mod.AIToolsUsageChart),
  {
    ssr: false,
    loading: ChartPlaceholder,
  }
)

const EMPTY_TOOL_FORM = {
  toolName: "",
  description: "",
  usageCount: "0",
  activeStudents: "0",
  relatedProblems: "0",
  successRate: "100",
}

type ToolFormState = typeof EMPTY_TOOL_FORM

function ChartPlaceholder() {
  return <div className="h-full w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
}

function toToolForm(tool: AiToolUsage): ToolFormState {
  return {
    toolName: tool.toolName,
    description: tool.description ?? "",
    usageCount: String(tool.usageCount),
    activeStudents: String(tool.activeStudents),
    relatedProblems: String(tool.relatedProblems),
    successRate: String(tool.successRate),
  }
}

function parseNonNegativeInteger(value: string, label: string) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error(`${label} must be a non-negative whole number.`)
  }

  return numberValue
}

export default function AIToolsPage() {
  const [page, setPage] = useState(1)
  const { data: aiToolsPage, loading, error, refresh } = useSupabaseQuery(
    () => listAiToolsPage({ page, pageSize: PAGE_SIZE }),
    { items: [], total: 0, page: 1, pageSize: PAGE_SIZE },
    ["ai_tools"],
    String(page)
  )
  const aiTools = aiToolsPage.items
  const { addToast } = useToastStore()
  const { isAdmin } = useCurrentUserRole()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingToolId, setEditingToolId] = useState<string | null>(null)
  const [deletingToolId, setDeletingToolId] = useState<string | null>(null)
  const [form, setForm] = useState<ToolFormState>(EMPTY_TOOL_FORM)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const sortedTools = [...aiTools].sort((a,b) => b.usageCount - a.usageCount)
  const deletingTool = aiTools.find(tool => tool.id === deletingToolId)

  const chartData = sortedTools.map(tool => ({
    name: tool.toolName,
    usage: tool.usageCount,
    problems: tool.relatedProblems
  }))

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

    if (!open) {
      resetForm()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")
    setIsSaving(true)

    const toolName = form.toolName.trim()
    const description = form.description.trim()

    if (!toolName) {
      setFormError("Tool name is required.")
      setIsSaving(false)
      return
    }

    try {
      const usageCount = parseNonNegativeInteger(form.usageCount, "Usage count")
      const activeStudents = parseNonNegativeInteger(form.activeStudents, "Active students")
      const relatedProblems = parseNonNegativeInteger(form.relatedProblems, "Related problems")
      const successRate = parseNonNegativeInteger(form.successRate, "Success rate")

      if (successRate > 100) {
        throw new Error("Success rate must be between 0 and 100.")
      }

      const toolData = {
        toolName,
        description,
        usageCount,
        activeStudents,
        relatedProblems,
        successRate,
      }

      if (editingToolId) {
        await updateAiTool(editingToolId, toolData)
        addToast({
          title: "Tool Updated",
          description: `${toolName} was saved.`,
          type: "success",
        })
      } else {
        await createAiTool(toolData)
        addToast({
          title: "Tool Created",
          description: `${toolName} was added successfully.`,
          type: "success",
        })
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
      addToast({
        title: "Tool Deleted",
        description: "The AI tool metric was removed.",
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">AI Tools Usage Tracker</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Monitor effectiveness and problems associated with various AI generation tools.</p>
        </div>

        {isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2" onClick={openCreateDialog}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingToolId ? "Edit Tool" : "Add Tool"}</DialogTitle>
                <DialogDescription>
                  Track AI tool usage, associated problems, and success rate.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-6">
                {formError && (
                  <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-500">
                    {formError}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="tool-name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="tool-name"
                    value={form.toolName}
                    onChange={(event) => updateFormField("toolName", event.target.value)}
                    placeholder="e.g. ChatGPT"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tool-description">Description</Label>
                  <Textarea
                    id="tool-description"
                    value={form.description}
                    onChange={(event) => updateFormField("description", event.target.value)}
                    placeholder="Briefly describe where this tool is used or what it monitors."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="usage-count">Usage Count</Label>
                    <Input
                      id="usage-count"
                      type="number"
                      min={0}
                      step={1}
                      value={form.usageCount}
                      onChange={(event) => updateFormField("usageCount", event.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="active-students">Active Students</Label>
                    <Input
                      id="active-students"
                      type="number"
                      min={0}
                      step={1}
                      value={form.activeStudents}
                      onChange={(event) => updateFormField("activeStudents", event.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="related-problems">Related Problems</Label>
                    <Input
                      id="related-problems"
                      type="number"
                      min={0}
                      step={1}
                      value={form.relatedProblems}
                      onChange={(event) => updateFormField("relatedProblems", event.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="success-rate">Success Rate</Label>
                    <Input
                      id="success-rate"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={form.successRate}
                      onChange={(event) => updateFormField("successRate", event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingToolId ? "Save" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage vs Issues Correlation</CardTitle>
          <CardDescription>Visual mapping of total usage versus reported student problems</CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] sm:h-[400px]">
          {loading && <LoadingState label="Loading AI tool metrics..." />}
          {error && <ErrorState message={error} onRetry={refresh} />}
          <AIToolsUsageChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Tools Detail Directory</CardTitle>
          <CardDescription>Comprehensive metrics for all monitored AI writing tools</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <div className="p-6"><LoadingState label="Loading AI tools..." /></div>}
          {error && <div className="p-6"><ErrorState message={error} onRetry={refresh} /></div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead className="text-right">Total Usage Count</TableHead>
                <TableHead className="text-right">Active Students</TableHead>
                <TableHead className="text-right">Related Problems</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="max-w-sm">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">{tool.toolName}</div>
                    {tool.description && (
                      <div className="mt-1 line-clamp-2 text-xs text-zinc-500">{tool.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-zinc-700 dark:text-zinc-300">
                    {tool.usageCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-zinc-600 dark:text-zinc-400">
                    {tool.activeStudents}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={tool.relatedProblems > 20 ? 'destructive' : tool.relatedProblems > 10 ? 'pending' : 'secondary'}>
                      {tool.relatedProblems} issues
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <span className="text-sm font-medium">{tool.successRate}%</span>
                       <div className="h-2 w-16 bg-zinc-100 rounded-full dark:bg-zinc-800 overflow-hidden">
                         <div
                           className={`h-full ${tool.successRate > 80 ? 'bg-emerald-500' : tool.successRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                           style={{ width: `${tool.successRate}%` }}
                         />
                       </div>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" title="Edit tool" onClick={() => openEditDialog(tool)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Edit tool</span>
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title="Delete tool" onClick={() => setDeletingToolId(tool.id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Delete tool</span>
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!loading && !error && sortedTools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center text-zinc-500">
                    No AI tool metrics found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls
            page={aiToolsPage.page}
            pageSize={aiToolsPage.pageSize}
            total={aiToolsPage.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      {isAdmin && (
      <Dialog open={!!deletingToolId} onOpenChange={(open) => !open && setDeletingToolId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tool</DialogTitle>
            <DialogDescription>
              {deletingTool ? `Remove "${deletingTool.toolName}" from AI tools usage metrics?` : "Remove this AI tool metric?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingToolId(null)}>
              Cancel
            </Button>
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
