import { NextResponse } from "next/server"

import { AuthRequestError, createServiceRoleClient, getCurrentUserProfile, requireAdminRequest } from "@/lib/auth/server"
import { getErrorMessage, normalizeOptionalText } from "@/lib/data/client"
import { mapPrompt } from "@/lib/data/mappers"

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ promptId: string }> }
) {
  try {
    const { supabase } = await requirePromptReadRequest()
    const { promptId } = await context.params

    const { data, error } = await supabase
      .from("prompts")
      .select("id, title, category, content, related_course_id, tags, created_at, updated_at")
      .eq("id", promptId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ prompt: data ? mapPrompt(data) : null })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ promptId: string }> }
) {
  try {
    const { supabase } = await requireAdminRequest()
    const { promptId } = await context.params
    const prompt = parsePromptBody(await request.json())

    const { data, error } = await supabase
      .from("prompts")
      .update({
        title: prompt.title,
        category: prompt.category,
        content: prompt.content,
        related_course_id: prompt.relatedCourseId,
        tags: prompt.tags,
      })
      .eq("id", promptId)
      .select("id, title, category, content, related_course_id, tags, created_at, updated_at")
      .single()

    if (error) throw error

    return NextResponse.json({ prompt: mapPrompt(data) })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ promptId: string }> }
) {
  try {
    const { supabase } = await requireAdminRequest()
    const { promptId } = await context.params

    const { error } = await supabase.from("prompts").delete().eq("id", promptId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) })
  }
}
