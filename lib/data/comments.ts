import { requireSupabase } from "@/lib/data/client";
import { mapComment } from "@/lib/data/mappers";
import { Comment, Role } from "@/lib/data/types";

export async function listComments(): Promise<Comment[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapComment);
}

export async function createComment(input: {
  studentId: string;
  issueId?: string;
  authorName: string;
  role: Role;
  text: string;
}) {
  const supabase = requireSupabase();
  const text = input.text.trim();

  if (!input.studentId || !text) {
    throw new Error("A student and comment text are required.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      student_id: input.studentId,
      issue_id: input.issueId ?? null,
      author_name: input.authorName.trim() || input.role,
      role: input.role,
      text,
    })
    .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at")
    .single();

  if (error) throw error;
  // A database trigger marks the related issue Pending when role is Student.
  return mapComment(data);
}

export async function updateComment(commentId: string, text: string) {
  const supabase = requireSupabase();
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("Comment text is required.");
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ text: cleanText })
    .eq("id", commentId)
    .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapComment(data);
}

export async function deleteComment(commentId: string) {
  const supabase = requireSupabase();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}
