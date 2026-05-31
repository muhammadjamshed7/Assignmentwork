import { listAiTools } from "@/lib/data/ai-tools";
import { listCourses } from "@/lib/data/courses";
import { listIssues } from "@/lib/data/issues";
import { listStudents } from "@/lib/data/students";

export async function getDashboardData() {
  const [students, courses, issues, aiTools] = await Promise.all([
    listStudents(),
    listCourses(),
    listIssues(),
    listAiTools(),
  ]);

  return { students, courses, issues, aiTools };
}

export async function getReportsIndexData() {
  const [students, issues] = await Promise.all([listStudents(), listIssues()]);
  return { students, issues };
}


