import {
  AiToolUsage,
  Comment,
  Course,
  Issue,
  IssueCategory,
  IssueStatus,
  PriorityLevel,
  Prompt,
  Role,
  Student,
} from "@/lib/data/types";

type Row = Record<string, unknown>;

type StudentCourseJoin = {
  course?: {
    id: string;
    code: string;
    title: string;
  } | null;
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

export function mapCourse(row: Row): Course {
  return {
    id: asString(row.id),
    code: asString(row.code),
    title: asString(row.title),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export function mapStudent(row: Row, issues: Issue[] = []): Student {
  const joinedCourses = (Array.isArray(row.student_courses) ? row.student_courses : []) as StudentCourseJoin[];
  const studentId = asString(row.id);
  const studentIssues = issues.filter(issue => issue.studentId === studentId);

  return {
    id: studentId,
    name: asString(row.name),
    email: row.email ? asString(row.email) : undefined,
    assignedCourses: joinedCourses.map(item => item.course?.code).filter(Boolean) as string[],
    assignedCourseIds: joinedCourses.map(item => item.course?.id).filter(Boolean) as string[],
    issues: Array.from(new Set(studentIssues.map(issue => issue.category))),
    overallStatus: asString(row.overall_status) as IssueStatus,
    priority: asString(row.priority) as PriorityLevel,
    lastUpdate: asString(row.last_update),
    assignedTrainer: asString(row.assigned_trainer),
    progress: asNumber(row.progress),
    notes: row.notes ? asString(row.notes) : undefined,
  };
}

export function mapIssue(row: Row): Issue {
  const student = row.student && typeof row.student === "object" ? row.student as Row : undefined;

  return {
    id: asString(row.id),
    studentId: asString(row.student_id),
    studentName: student ? asString(student.name) : undefined,
    category: asString(row.category) as IssueCategory,
    description: asString(row.description),
    status: asString(row.status) as IssueStatus,
    priority: asString(row.priority) as PriorityLevel,
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export function mapComment(row: Row): Comment {
  return {
    id: asString(row.id),
    studentId: asString(row.student_id),
    issueId: row.issue_id ? asString(row.issue_id) : undefined,
    authorName: asString(row.author_name),
    role: asString(row.role) as Role,
    text: asString(row.text),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export function mapPrompt(row: Row): Prompt {
  return {
    id: asString(row.id),
    title: asString(row.title),
    category: asString(row.category),
    content: asString(row.content),
    relatedCourseId: row.related_course_id ? asString(row.related_course_id) : undefined,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export function mapAiTool(row: Row): AiToolUsage {
  return {
    id: asString(row.id),
    toolName: asString(row.tool_name),
    description: row.description ? asString(row.description) : undefined,
    usageCount: asNumber(row.usage_count),
    activeStudents: asNumber(row.active_students),
    relatedProblems: asNumber(row.related_problems),
    successRate: asNumber(row.success_rate),
  };
}
