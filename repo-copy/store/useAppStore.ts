import { create } from 'zustand';

export type IssueCategory = 'Prompt Issues' | 'Stealth Writer Issues' | 'Instructions Issues' | 'Data Extraction Issues' | 'Reference Memory Issues' | 'Thesis Issues' | 'Remake Required';
export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Role = 'Student' | 'Admin';

export interface Course {
  id: string;
  code: string;
  title: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  assignedCourses: string[]; // List of course codes for simplicity
  issues: IssueCategory[];
  overallStatus: IssueStatus;
  priority: PriorityLevel;
  lastUpdate: string; // ISO date string
  assignedTrainer: string;
  progress: number; // 0-100
  notes?: string;
}

export interface Issue {
  id: string;
  studentId: string;
  category: IssueCategory;
  description: string;
  status: IssueStatus;
  priority: PriorityLevel;
  createdAt: string;
}

export interface Comment {
  id: string;
  studentId: string;
  issueId?: string;
  authorName: string;
  role: Role;
  text: string;
  createdAt: string;
}

export interface AiToolUsage {
  id: string;
  toolName: string;
  usageCount: number;
  activeStudents: number;
  relatedProblems: number;
  successRate: number; // percentage
}

interface AppState {
  students: Student[];
  issues: Issue[];
  comments: Comment[];
  courses: Course[];
  aiTools: AiToolUsage[];
  
  // Actions
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  updateComment: (commentId: string, text: string) => void;
  removeComment: (commentId: string) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus) => void;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt'>) => void;
  addStudent: (student: Omit<Student, 'id' | 'issues' | 'lastUpdate' | 'progress'>) => void;
}

// Initial Hardcoded Data
const initialStudents: Student[] = [
  { id: '1', name: 'Tayab Abbas', assignedCourses: ['CS101', 'ENG201'], issues: ['Prompt Issues', 'Stealth Writer Issues'], overallStatus: 'In Progress', priority: 'High', lastUpdate: new Date(Date.now() - 3600000 * 2).toISOString(), assignedTrainer: 'Sarah Jenkins', progress: 45 },
  { id: '2', name: 'Shehzad Ali', assignedCourses: ['PHY101'], issues: ['Instructions Issues', 'Stealth Writer Issues'], overallStatus: 'Pending', priority: 'Medium', lastUpdate: new Date(Date.now() - 3600000 * 5).toISOString(), assignedTrainer: 'Mark Ruffalo', progress: 20 },
  { id: '3', name: 'Atiq', assignedCourses: ['MTH101', 'CS101'], issues: ['Instructions Issues'], overallStatus: 'Resolved', priority: 'Low', lastUpdate: new Date(Date.now() - 3600000 * 24).toISOString(), assignedTrainer: 'Sarah Jenkins', progress: 95 },
  { id: '4', name: 'Ahmad Shehzad', assignedCourses: ['CS201'], issues: ['Instructions Issues', 'Stealth Writer Issues'], overallStatus: 'Pending', priority: 'Medium', lastUpdate: new Date(Date.now() - 3600000 * 48).toISOString(), assignedTrainer: 'John Doe', progress: 30 },
  { id: '5', name: 'Sakhi Abbas', assignedCourses: ['ENG101'], issues: ['Prompt Issues'], overallStatus: 'In Progress', priority: 'Low', lastUpdate: new Date(Date.now() - 3600000 * 12).toISOString(), assignedTrainer: 'Sarah Jenkins', progress: 60 },
  { id: '6', name: 'Fayaz', assignedCourses: ['BIO101', 'CHM101'], issues: ['Prompt Issues', 'Stealth Writer Issues', 'Data Extraction Issues'], overallStatus: 'Escalated', priority: 'Critical', lastUpdate: new Date(Date.now() - 3600000 * 1).toISOString(), assignedTrainer: 'John Doe', progress: 10 },
  { id: '7', name: 'Makhdom Raza', assignedCourses: ['HIS101'], issues: ['Reference Memory Issues', 'Thesis Issues', 'Remake Required'], overallStatus: 'Escalated', priority: 'Critical', lastUpdate: new Date(Date.now() - 3600000 * 0.5).toISOString(), assignedTrainer: 'Mark Ruffalo', progress: 5 },
];

const initialCourses: Course[] = [
  { id: 'c1', code: 'CS101', title: 'Introduction to Computer Science' },
  { id: 'c2', code: 'ENG201', title: 'Advanced Literature and Thesis Writing' },
  { id: 'c3', code: 'PHY101', title: 'Physics Fundamentals' },
  { id: 'c4', code: 'MTH101', title: 'Calculus I' },
  { id: 'c5', code: 'CS201', title: 'Data Structures via AI' },
];

const initialIssues: Issue[] = initialStudents.flatMap((student) => 
  student.issues.map((cat, i) => ({
    id: `iss_${student.id}_${i}`,
    studentId: student.id,
    category: cat,
    description: `Student is struggling with ${cat}. Needs guidance.`,
    status: student.overallStatus,
    priority: student.priority,
    createdAt: new Date(Date.now() - 3600000 * (10 + i * 2)).toISOString()
  }))
);

const initialAiTools: AiToolUsage[] = [
  { id: 't1', toolName: 'ChatGPT', usageCount: 450, activeStudents: 120, relatedProblems: 15, successRate: 85 },
  { id: 't2', toolName: 'Claude', usageCount: 320, activeStudents: 85, relatedProblems: 8, successRate: 92 },
  { id: 't3', toolName: 'Stealth Writer', usageCount: 200, activeStudents: 60, relatedProblems: 45, successRate: 40 },
  { id: 't4', toolName: 'WriteHuman', usageCount: 150, activeStudents: 40, relatedProblems: 25, successRate: 55 },
  { id: 't5', toolName: 'Gemini', usageCount: 280, activeStudents: 90, relatedProblems: 12, successRate: 88 },
  { id: 't6', toolName: 'QuillBot', usageCount: 500, activeStudents: 150, relatedProblems: 10, successRate: 95 },
  { id: 't7', toolName: 'Grammarly', usageCount: 800, activeStudents: 200, relatedProblems: 5, successRate: 98 },
];

const initialComments: Comment[] = [
  { id: 'c1', studentId: '1', issueId: 'iss_1_1', authorName: 'Tayab Abbas', role: 'Student', text: 'I am not sure how to bypass the AI detectors with the new formatting.', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'c2', studentId: '1', issueId: 'iss_1_1', authorName: 'Sarah Jenkins', role: 'Admin', text: 'You should avoid relying purely on stealth writers. Focus on original drafting.', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
];

export const useAppStore = create<AppState>((set) => ({
  students: initialStudents,
  issues: initialIssues,
  comments: initialComments,
  courses: initialCourses,
  aiTools: initialAiTools,

  addComment: (commentData) => set((state) => {
    const newComment: Comment = {
      ...commentData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    
    // Side effect: if Student role comments, mark issue as "Pending" (Needs Resolution equivalent)
    if (newComment.role === 'Student') {
       const updatedIssues = state.issues.map(iss => 
         iss.id === newComment.issueId ? { ...iss, status: 'Pending' as IssueStatus } : iss
       );
       return { comments: [...state.comments, newComment], issues: updatedIssues };
    }
    
    return { comments: [...state.comments, newComment] };
  }),

  updateComment: (commentId, text) => set((state) => ({
    comments: state.comments.map(c => c.id === commentId ? { ...c, text, createdAt: new Date().toISOString() } : c)
  })),

  removeComment: (commentId) => set((state) => ({
    comments: state.comments.filter(c => c.id !== commentId)
  })),

  updateIssueStatus: (issueId, status) => set((state) => ({
    issues: state.issues.map((i) => i.id === issueId ? { ...i, status } : i)
  })),

  addIssue: (issueData) => set((state) => ({
    issues: [...state.issues, { ...issueData, id: Math.random().toString(36).substring(7), createdAt: new Date().toISOString() }]
  })),

  addStudent: (studentData) => set((state) => ({
    students: [
      {
        ...studentData,
        id: Math.random().toString(36).substring(7),
        issues: [],
        lastUpdate: new Date().toISOString(),
        progress: 0,
      },
      ...state.students,
    ]
  }))
}));
