import { normalizeOptionalText, requireSupabase } from "@/lib/data/client";
import { mapPrompt } from "@/lib/data/mappers";
import { Prompt } from "@/lib/data/types";

export async function listPrompts(): Promise<Prompt[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("prompts")
    .select("id, title, category, content, related_course_id, tags, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPrompt);
}

export async function createPrompt(input: {
  title: string;
  category: string;
  content: string;
  relatedCourseId?: string;
  tags: string[];
}) {
  const supabase = requireSupabase();
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error("Title and prompt content are required.");
  }

  const { data, error } = await supabase
    .from("prompts")
    .insert({
      title,
      category: input.category || "General",
      content,
      related_course_id: normalizeOptionalText(input.relatedCourseId),
      tags: input.tags,
    })
    .select("id, title, category, content, related_course_id, tags, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapPrompt(data);
}

export async function updatePrompt(promptId: string, input: {
  title: string;
  category: string;
  content: string;
  relatedCourseId?: string;
  tags: string[];
}) {
  const supabase = requireSupabase();
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error("Title and prompt content are required.");
  }

  const { data, error } = await supabase
    .from("prompts")
    .update({
      title,
      category: input.category || "General",
      content,
      related_course_id: normalizeOptionalText(input.relatedCourseId),
      tags: input.tags,
    })
    .eq("id", promptId)
    .select("id, title, category, content, related_course_id, tags, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapPrompt(data);
}

export async function deletePrompt(promptId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("prompts").delete().eq("id", promptId);
  if (error) throw error;
}
