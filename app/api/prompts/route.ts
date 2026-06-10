import { NextResponse } from "next/server"

import { AuthRequestError, createServiceRoleClient, getCurrentUserProfile, requireAdminRequest } from "@/lib/auth/server"
import { getErrorMessage, normalizeOptionalText } from "@/lib/data/client"
import { mapPrompt } from "@/lib/data/mappers"
import { getPaginationRange, toPaginatedResult } from "@/lib/data/pagination"

function statusForError(error: unknown) {
  return error instanceof AuthRequestError ? error.status : 500
}

async function requirePromptReadRequest() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    throw new AuthRequestError("Authentication is required.", 401)
  }

  if (profile.status !== "approved") {
    throw new AuthRequestError("Approved login is required.", 403)
  }

  return {
    profile,
    supabase: createServiceRoleClient(),
  }
}

function parsePromptBody(body: unknown) {
  const value = body && typeof body === "object" ? body as Record<string, unknown> : {}
  const title = typeof value.title === "string" ? value.title.trim() : ""
  const category = typeof value.category === "string" && value.category.trim() ? value.category.trim() : "General"
  const content = typeof value.content === "string" ? value.content.trim() : ""
  const relatedCourseId = typeof value.relatedCourseId === "string" ? normalizeOptionalText(value.relatedCourseId) : null
  const tags = Array.isArray(value.tags) ? value.tags.map(String).map(tag => tag.trim()).filter(Boolean) : []

  if (!title || !content) {
    throw new AuthRequestError("Title and prompt content are required.", 400)
  }

  return { title, category, content, relatedCourseId, tags }
}

export async function GET(request: Request) {
  try {
    const { supabase } = await requirePromptReadRequest()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") ?? "1")
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10")
    const pagination = getPaginationRange({ page, pageSize })

    const { data, error, count } = await supabase
      .from("prompts")
      .select("id, title, category, content, related_course_id, tags, created_at, updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(pagination.from, pagination.to)

    if (error) throw error

    return NextResponse.json({
      promptsPage: toPaginatedResult((data ?? []).map(mapPrompt), count, pagination),
    })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) })
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdminRequest()
    const prompt = parsePromptBody(await request.json())

    const { data, error } = await supabase
      .from("prompts")
      .insert({
        title: prompt.title,
        category: prompt.category,
        content: prompt.content,
        related_course_id: prompt.relatedCourseId,
        tags: prompt.tags,
      })
      .select("id, title, category, content, related_course_id, tags, created_at, updated_at")
      .single()

    if (error) throw error

    return NextResponse.json({ prompt: mapPrompt(data) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) })
  }
}
