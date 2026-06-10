import { readJsonResponse } from "@/lib/data/client"
import { PaginatedResult, PaginationOptions, Prompt } from "@/lib/data/types"

type PromptListPayload = {
  promptsPage?: PaginatedResult<Prompt>
  error?: string
}

type PromptPayload = {
  prompt?: Prompt | null
  error?: string
}

function promptRequestInit(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  }
}

async function readPromptResponse<T extends { error?: string }>(response: Response): Promise<T> {
  const payload = await readJsonResponse<T>(response)

  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to save prompt.")
  }

  if (!payload) {
    throw new Error("Prompt request returned an invalid response.")
  }

  return payload
}

export async function listPromptsPage(options: PaginationOptions = {}): Promise<PaginatedResult<Prompt>> {
  const searchParams = new URLSearchParams()

  if (options.page) searchParams.set("page", String(options.page))
  if (options.pageSize) searchParams.set("pageSize", String(options.pageSize))

  const response = await fetch(`/api/prompts?${searchParams.toString()}`, promptRequestInit())
  const payload = await readPromptResponse<PromptListPayload>(response)

  if (!payload.promptsPage) {
    throw new Error("Prompt list response was missing data.")
  }

  return payload.promptsPage
}

export async function listPromptById(promptId: string): Promise<Prompt | null> {
  const response = await fetch(`/api/prompts/${encodeURIComponent(promptId)}`, promptRequestInit())
  const payload = await readPromptResponse<PromptPayload>(response)

  return payload.prompt ?? null
}

export async function createPrompt(input: {
  title: string
  category: string
  content: string
  relatedCourseId?: string
  tags: string[]
}) {
  const response = await fetch("/api/prompts", promptRequestInit({
    method: "POST",
    body: JSON.stringify(input),
  }))
  const payload = await readPromptResponse<PromptPayload>(response)

  if (!payload.prompt) {
    throw new Error("Prompt was not returned after creation.")
  }

  return payload.prompt
}

export async function updatePrompt(promptId: string, input: {
  title: string
  category: string
  content: string
  relatedCourseId?: string
  tags: string[]
}) {
  const response = await fetch(`/api/prompts/${encodeURIComponent(promptId)}`, promptRequestInit({
    method: "PATCH",
    body: JSON.stringify(input),
  }))
  const payload = await readPromptResponse<PromptPayload>(response)

  if (!payload.prompt) {
    throw new Error("Prompt was not returned after update.")
  }

  return payload.prompt
}

export async function deletePrompt(promptId: string) {
  const response = await fetch(`/api/prompts/${encodeURIComponent(promptId)}`, promptRequestInit({
    method: "DELETE",
  }))

  await readPromptResponse<{ ok?: boolean; error?: string }>(response)
}
