export type IssueCategory =
  | "Prompt Issues"
  | "Stealth Writer Issues"
  | "Instructions Issues"
  | "Data Extraction Issues"
  | "Reference Memory Issues"
  | "Thesis Issues"
  | "Remake Required"
  | "Other";

export type IssueStatus = "Pending" | "In Progress" | "Resolved" | "Escalated";
export type PriorityLevel = "Low" | "Medium" | "High" | "Critical";
export type Role = "Student" | "Admin";

export interface Course {
  id: string;
  code: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  assignedCourses: string[];
  assignedCourseIds: string[];
  issues: IssueCategory[];
  overallStatus: IssueStatus;
  priority: PriorityLevel;
  lastUpdate: string;
  assignedTrainer: string;
  progress: number;
  notes?: string;
}

export interface Issue {
  id: string;
  studentId: string;
  studentName?: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  studentId: string;
  issueId?: string;
  authorName: string;
  role: Role;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AiToolUsage {
  id: string;
  toolName: string;
  usageCount: number;
  activeStudents: number;
  relatedProblems: number;
  successRate: number;
}

export interface Prompt {
  id: string;
  title: string;
  category: string;
  content: string;
  relatedCourseId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithEnrollment extends Course {
  enrolledStudents: number;
}
