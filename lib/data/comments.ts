import { requireSupabase } from "@/lib/data/client";
import { mapComment } from "@/lib/data/mappers";
import { getPaginationRange, toPaginatedResult } from "@/lib/data/pagination";
import { Comment, PaginatedResult, PaginationOptions, Role } from "@/lib/data/types";
import { assertAdmin, getCurrentProfileFromApi } from "@/lib/auth/roles";
import { isApprovedAdmin, isApprovedStudent } from "@/lib/auth/role-utils";

export async function listCommentsByStudentId(studentId: string): Promise<Comment[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapComment);
}

export async function listCommentsPage(options: PaginationOptions & { issueId?: string } = {}): Promise<PaginatedResult<Comment>> {
  const supabase = requireSupabase();
  const pagination = getPaginationRange(options);
  let query = supabase
    .from("comments")
    .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at", { count: "exact" });

  if (options.issueId) {
    query = query.eq("issue_id", options.issueId);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: true })
    .range(pagination.from, pagination.to);

  if (error) throw error;
  return toPaginatedResult((data ?? []).map(mapComment), count, pagination);
}

export async function createComment(input: {
  studentId: string;
  issueId?: string;
  authorName: string;
  role: Role;
  text: string;
}) {
  const profile = await getCurrentProfileFromApi();

  if (!profile) {
    throw new Error("Sign in with an approved account before commenting.");
  }

  const supabase = requireSupabase();
  const text = input.text.trim();

  if (!text) {
    throw new Error("Comment text is required.");
  }

  if (profile.status === "pending") {
    throw new Error("Your account is still pending admin approval.");
  }

  if (profile.status === "rejected" || profile.status === "disabled") {
    throw new Error("This account cannot add comments. Contact an administrator if this is unexpected.");
  }

  const canCreateAsAdmin = isApprovedAdmin(profile);
  const canCreateAsStudent = isApprovedStudent(profile);
  let studentId = input.studentId;
  let role = input.role;
  let authorName = input.authorName.trim() || input.role;

  if (canCreateAsStudent) {
    if (!profile.studentId) {
      throw new Error("Your account is not linked to a writer profile.");
    }

    if (!input.issueId) {
      throw new Error("Select one of your tickets before commenting.");
    }

    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select("id, student_id")
      .eq("id", input.issueId)
      .maybeSingle();

    if (issueError) throw issueError;

    if (!issue || issue.student_id !== profile.studentId) {
      throw new Error("You can only comment on your own approved ticket.");
    }

    studentId = profile.studentId;
    role = "Student";
    authorName = input.authorName.trim() || "Writer";
  } else if (!canCreateAsAdmin) {
    throw new Error("You can only comment with an approved account.");
  }

  if (!studentId) {
    throw new Error("A writer and comment text are required.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      student_id: studentId,
      issue_id: input.issueId ?? null,
      author_name: authorName,
      role,
      text,
    })
    .select("id, student_id, issue_id, author_name, role, text, created_at, updated_at")
    .single();

  if (error) throw error;
  // A database trigger marks the related issue Pending when role is Student.
  return mapComment(data);
}

export async function updateComment(commentId: string, text: string) {
  await assertAdmin();

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
  await assertAdmin();

  const supabase = requireSupabase();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}
