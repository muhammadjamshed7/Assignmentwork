import { requireSupabase, normalizeOptionalText } from "@/lib/data/client";
import { mapIssue, mapStudent } from "@/lib/data/mappers";
import { IssueStatus, PriorityLevel, Student } from "@/lib/data/types";

export async function listStudents(): Promise<Student[]> {
  const supabase = requireSupabase();
  const [studentsResult, issuesResult] = await Promise.all([
    supabase
      .from("students")
      .select(`
        id,
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

export async function createStudent(input: {
  name: string;
  email?: string;
  assignedCourseIds: string[];
  assignedTrainer?: string;
  notes?: string;
  overallStatus?: IssueStatus;
  priority?: PriorityLevel;
}) {
  const supabase = requireSupabase();
  const name = input.name.trim();
  const email = normalizeOptionalText(input.email);

  if (!name) {
    throw new Error("Student name is required.");
  }

  if (email) {
    const duplicate = await supabase
      .from("students")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (duplicate.error) throw duplicate.error;
    if (duplicate.data) {
      throw new Error("A student with this email already exists.");
    }
  }

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

  const courseRows = input.assignedCourseIds.map(courseId => ({
    student_id: student.id,
    course_id: courseId,
  }));

  if (courseRows.length > 0) {
    const { error: coursesError } = await supabase.from("student_courses").insert(courseRows);
    if (coursesError) throw coursesError;
  }

  const students = await listStudents();
  return students.find(item => item.id === student.id);
}
