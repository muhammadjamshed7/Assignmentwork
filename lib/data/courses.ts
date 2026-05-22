import { requireSupabase } from "@/lib/data/client";
import { mapCourse } from "@/lib/data/mappers";
import { Course, CourseWithEnrollment } from "@/lib/data/types";

export async function listCourses(): Promise<Course[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("id, code, title, created_at, updated_at")
    .order("code", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCourse);
}

export async function listCoursesWithEnrollment(): Promise<CourseWithEnrollment[]> {
  const supabase = requireSupabase();
  const [coursesResult, enrollmentsResult] = await Promise.all([
    supabase.from("courses").select("id, code, title, created_at, updated_at").order("code", { ascending: true }),
    supabase.from("student_courses").select("course_id"),
  ]);

  if (coursesResult.error) throw coursesResult.error;
  if (enrollmentsResult.error) throw enrollmentsResult.error;

  const enrollmentCounts = new Map<string, number>();
  for (const enrollment of enrollmentsResult.data ?? []) {
    enrollmentCounts.set(enrollment.course_id, (enrollmentCounts.get(enrollment.course_id) ?? 0) + 1);
  }

  return (coursesResult.data ?? []).map(row => ({
    ...mapCourse(row),
    enrolledStudents: enrollmentCounts.get(row.id) ?? 0,
  }));
}

export async function createCourse(input: { code: string; title: string }) {
  const supabase = requireSupabase();
  const code = input.code.trim().toUpperCase();
  const title = input.title.trim();

  if (!code || !title) {
    throw new Error("Course code and course title are required.");
  }

  const duplicate = await supabase
    .from("courses")
    .select("id")
    .ilike("code", code)
    .maybeSingle();

  if (duplicate.error) throw duplicate.error;
  if (duplicate.data) {
    throw new Error("A course with this code already exists.");
  }

  const { data, error } = await supabase
    .from("courses")
    .insert({ code, title })
    .select("id, code, title, created_at, updated_at")
    .single();

  if (error) throw error;
  return mapCourse(data);
}
