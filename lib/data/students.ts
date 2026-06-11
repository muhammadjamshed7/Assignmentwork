import { requireSupabase, normalizeOptionalText, readJsonResponse } from "@/lib/data/client";
import { mapIssue, mapStudent } from "@/lib/data/mappers";
import { getPaginationRange, toPaginatedResult } from "@/lib/data/pagination";
import { IssueStatus, PaginatedResult, PaginationOptions, PriorityLevel, Student } from "@/lib/data/types";
import { assertAdmin } from "@/lib/auth/roles";

function normalizeCourseIds(courseIds: string[]) {
  return Array.from(new Set(courseIds.map(courseId => courseId.trim()).filter(Boolean)));
}

function isGmailAddress(email: string) {
  return email.toLowerCase().endsWith("@gmail.com");
}

async function ensureWriterLogin(input: { name: string; email: string }) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await readJsonResponse<{ error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to create the writer login.");
  }
}

async function validateAssignedCourseIds(courseIds: string[]) {
  if (courseIds.length === 0) return;

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .in("id", courseIds);

  if (error) throw error;

  const existingCourseIds = new Set((data ?? []).map(course => course.id));
  const missingCourseIds = courseIds.filter(courseId => !existingCourseIds.has(courseId));

  if (missingCourseIds.length > 0) {
    throw new Error("One or more selected courses no longer exist.");
  }
}

async function approveLinkedUserIfActive(studentId: string, overallStatus?: IssueStatus) {
  if (overallStatus !== "In Progress") return;

  const supabase = requireSupabase();
  const { data: student, error } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw error;
  if (typeof student?.user_id !== "string") return;

  const response = await fetch(`/api/users/${student.user_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "approved" }),
  });
  const payload = await readJsonResponse<{ error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to approve the linked writer login.");
  }
}

async function syncLinkedWriterLogin(userId: string, input: { email: string; overallStatus?: IssueStatus }) {
  const body: { email: string; status?: "approved" } = { email: input.email };
  if (input.overallStatus === "In Progress") body.status = "approved";

  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonResponse<{ error?: string }>(response);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to update the linked writer login.");
  }
}

export async function listStudents(): Promise<Student[]> {
  const supabase = requireSupabase();
  const [studentsResult, issuesResult] = await Promise.all([
    supabase
      .from("students")
      .select(`
        id,
        user_id,
        name,
        email,
        assigned_trainer,
        notes,
        overall_status,
        priority,
        progress,
        last_update,
        student_courses(course:courses(id, code, title))
      `)
      .order("last_update", { ascending: false }),
    supabase
      .from("issues")
      .select("id, student_id, category, description, status, priority, created_at, updated_at"),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (issuesResult.error) throw issuesResult.error;

  const issues = (issuesResult.data ?? []).map(mapIssue);
  return (studentsResult.data ?? []).map(row => mapStudent(row, issues));
}

export async function listStudentsPage(options: PaginationOptions = {}): Promise<PaginatedResult<Student>> {
  const supabase = requireSupabase();
  const pagination = getPaginationRange(options);
  const [studentsResult, issuesResult] = await Promise.all([
    supabase
      .from("students")
      .select(`
        id,
        user_id,
        name,
        email,
        assigned_trainer,
        notes,
        overall_status,
        priority,
        progress,
        last_update,
        student_courses(course:courses(id, code, title))
      `, { count: "exact" })
      .order("last_update", { ascending: false })
      .range(pagination.from, pagination.to),
    supabase
      .from("issues")
      .select("id, student_id, category, description, status, priority, created_at, updated_at"),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (issuesResult.error) throw issuesResult.error;

  const issues = (issuesResult.data ?? []).map(mapIssue);
  return toPaginatedResult((studentsResult.data ?? []).map(row => mapStudent(row, issues)), studentsResult.count, pagination);
}

export async function listStudentById(studentId: string): Promise<Student | null> {
  const supabase = requireSupabase();
  const [studentResult, issuesResult] = await Promise.all([
    supabase
      .from("students")
      .select(`
        id,
        user_id,
        name,
        email,
        assigned_trainer,
        notes,
        overall_status,
        priority,
        progress,
        last_update,
        student_courses(course:courses(id, code, title))
      `)
      .eq("id", studentId)
      .single(),
    supabase
      .from("issues")
      .select("id, student_id, category, description, status, priority, created_at, updated_at")
      .eq("student_id", studentId),
  ]);

  if (studentResult.error) throw studentResult.error;
  if (issuesResult.error) throw issuesResult.error;

  const issues = (issuesResult.data ?? []).map(mapIssue);
  return studentResult.data ? mapStudent(studentResult.data, issues) : null;
}

export async function createStudent(input: {
  name: string;
  email?: string;
  assignedCourseIds: string[];
  assignedTrainer?: string;
  notes?: string;
  overallStatus?: IssueStatus;
  priority?: PriorityLevel;
}) {
  await assertAdmin();

  const supabase = requireSupabase();
  const name = input.name.trim();
  const email = normalizeOptionalText(input.email);
  const assignedCourseIds = normalizeCourseIds(input.assignedCourseIds);

  if (!name) {
    throw new Error("Writer name is required.");
  }

  if (!email) {
    throw new Error("Writer Gmail address is required.");
  }

  if (!isGmailAddress(email)) {
    throw new Error("Writer email must be a Gmail address.");
  }

  if (email) {
    const duplicate = await supabase
      .from("students")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (duplicate.error) throw duplicate.error;
    if (duplicate.data) {
      throw new Error("A writer with this email already exists.");
    }
  }

  await validateAssignedCourseIds(assignedCourseIds);

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      name,
      email,
      assigned_trainer: input.assignedTrainer?.trim() || "Unassigned",
      notes: normalizeOptionalText(input.notes),
      overall_status: input.overallStatus ?? "Pending",
      priority: input.priority ?? "Medium",
      progress: 0,
    })
    .select("id")
    .single();

  if (studentError) throw studentError;

  const courseRows = assignedCourseIds.map(courseId => ({
    student_id: student.id,
    course_id: courseId,
  }));

  if (courseRows.length > 0) {
    const { error: coursesError } = await supabase.from("student_courses").insert(courseRows);
    if (coursesError) {
      await supabase.from("students").delete().eq("id", student.id);
      throw coursesError;
    }
  }

  try {
    await ensureWriterLogin({ name, email });
    await approveLinkedUserIfActive(student.id, input.overallStatus);
  } catch (error) {
    await supabase.from("students").delete().eq("id", student.id);
    throw error;
  }

  return listStudentById(student.id);
}

export async function updateStudent(studentId: string, input: {
  name: string;
  email?: string;
  assignedCourseIds: string[];
  assignedTrainer?: string;
  notes?: string;
  overallStatus?: IssueStatus;
  priority?: PriorityLevel;
}) {
  await assertAdmin();

  const supabase = requireSupabase();
  const name = input.name.trim();
  const email = normalizeOptionalText(input.email);
  const assignedCourseIds = normalizeCourseIds(input.assignedCourseIds);

  if (!name) {
    throw new Error("Writer name is required.");
  }

  if (!email) {
    throw new Error("Writer Gmail address is required.");
  }

  if (!isGmailAddress(email)) {
    throw new Error("Writer email must be a Gmail address.");
  }

  if (email) {
    const duplicate = await supabase
      .from("students")
      .select("id")
      .ilike("email", email)
      .neq("id", studentId)
      .maybeSingle();

    if (duplicate.error) throw duplicate.error;
    if (duplicate.data) {
      throw new Error("A writer with this email already exists.");
    }
  }

  const { data: currentStudent, error: currentStudentError } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .maybeSingle();

  if (currentStudentError) throw currentStudentError;

  await validateAssignedCourseIds(assignedCourseIds);

  const updateFields: Record<string, unknown> = {
    name,
    email,
    assigned_trainer: input.assignedTrainer?.trim() || "Unassigned",
    notes: normalizeOptionalText(input.notes),
    priority: input.priority ?? "Medium",
  }

  if (input.overallStatus !== undefined) {
    updateFields.overall_status = input.overallStatus
  }

  const { error: studentError } = await supabase
    .from("students")
    .update(updateFields)
    .eq("id", studentId);

  if (studentError) throw studentError;

  const { error: deleteCoursesError } = await supabase
    .from("student_courses")
    .delete()
    .eq("student_id", studentId);

  if (deleteCoursesError) throw deleteCoursesError;

  const courseRows = assignedCourseIds.map(courseId => ({
    student_id: studentId,
    course_id: courseId,
  }));

  if (courseRows.length > 0) {
    const { error: coursesError } = await supabase.from("student_courses").insert(courseRows);
    if (coursesError) throw coursesError;
  }

  if (typeof currentStudent?.user_id === "string") {
    await syncLinkedWriterLogin(currentStudent.user_id, { email, overallStatus: input.overallStatus });
  } else {
    await ensureWriterLogin({ name, email });
    await approveLinkedUserIfActive(studentId, input.overallStatus);
  }

  return listStudentById(studentId);
}

export async function deleteStudent(studentId: string) {
  await assertAdmin();

  const supabase = requireSupabase();
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) throw studentError;

  if (typeof student?.user_id === "string") {
    const response = await fetch(`/api/users/${student.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "disabled" }),
    });
    const payload = await readJsonResponse<{ error?: string }>(response);

    if (!response.ok) {
      throw new Error(payload?.error ?? "Unable to disable the linked writer login.");
    }
  }

  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) throw error;
}
