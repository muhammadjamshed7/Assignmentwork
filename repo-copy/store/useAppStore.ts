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

const initialStudents: Student[] = [];
const initialCourses: Course[] = [];
const initialIssues: Issue[] = [];
const initialAiTools: AiToolUsage[] = [];
const initialComments: Comment[] = [];

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
