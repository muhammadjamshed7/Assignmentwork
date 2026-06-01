import { listCourses } from "@/lib/data/courses";
import { listIssues } from "@/lib/data/issues";
import { listStudents } from "@/lib/data/students";

export async function getDashboardData() {
  const [students, courses, issues] = await Promise.all([
    listStudents(),
    listCourses(),
    listIssues(),
  ]);

  return { students, courses, issues };
}

export async function getReportsIndexData() {
  const [students, issues] = await Promise.all([listStudents(), listIssues()]);
  return { students, issues };
}

