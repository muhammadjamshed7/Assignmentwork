import { requireSupabase } from "@/lib/data/client";
import { mapIssue } from "@/lib/data/mappers";
import { Issue, IssueCategory, IssueStatus, PriorityLevel } from "@/lib/data/types";

export async function listIssues(): Promise<Issue[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("issues")
    .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapIssue);
}

export async function createIssue(input: {
  studentId: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  priority: PriorityLevel;
}) {
  const supabase = requireSupabase();
  const description = input.description.trim();

  if (!input.studentId || !description) {
    throw new Error("Select a student and enter an issue description.");
  }

  const { data, error } = await supabase
    .from("issues")
    .insert({
      student_id: input.studentId,
      category: input.category,
      description,
      status: input.status,
      priority: input.priority,
    })
    .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)")
    .single();

  if (error) throw error;
  // Database triggers update the student's derived issue summary after this insert.
  return mapIssue(data);
}

export async function updateIssueStatus(issueId: string, status: IssueStatus) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("issues")
    .update({ status })
    .eq("id", issueId)
    .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)")
    .single();

  if (error) throw error;
  // Database triggers update the student's derived issue summary after this status change.
  return mapIssue(data);
}
