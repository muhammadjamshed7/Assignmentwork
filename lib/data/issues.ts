import { requireSupabase } from "@/lib/data/client";
import { mapIssue } from "@/lib/data/mappers";
import { getPaginationRange, toPaginatedResult } from "@/lib/data/pagination";
import { Issue, IssueCategory, IssueStatus, PaginatedResult, PaginationOptions, PriorityLevel } from "@/lib/data/types";
import { assertAdmin, getCurrentProfileFromApi } from "@/lib/auth/roles";
import { isApprovedAdmin, isApprovedStudent } from "@/lib/auth/role-utils";

export async function listIssues(): Promise<Issue[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("issues")
    .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapIssue);
}

export async function listIssuesByStudentId(studentId: string): Promise<Issue[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("issues")
    .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapIssue);
}

export async function listIssuesPage(options: PaginationOptions = {}): Promise<PaginatedResult<Issue>> {
  const supabase = requireSupabase();
  const pagination = getPaginationRange(options);
  const { data, error, count } = await supabase
    .from("issues")
    .select("id, student_id, category, description, status, priority, created_at, updated_at, student:students(id, name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to);

  if (error) throw error;
  return toPaginatedResult((data ?? []).map(mapIssue), count, pagination);
}

export async function createIssue(input: {
  studentId: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  priority: PriorityLevel;
}) {
  const profile = await getCurrentProfileFromApi();
  const canCreateAsAdmin = isApprovedAdmin(profile);
  const canCreateAsStudent = Boolean(profile && isApprovedStudent(profile) && profile.studentId === input.studentId);

  if (!canCreateAsAdmin && !canCreateAsStudent) {
    throw new Error("You can only create issues for your own approved account.");
  }

  const supabase = requireSupabase();
  const description = input.description.trim();

  if (!input.studentId || !description) {
    throw new Error("Select a writer and enter an issue description.");
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
  await assertAdmin();

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
