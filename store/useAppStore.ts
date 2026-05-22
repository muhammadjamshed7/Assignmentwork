import { create } from "zustand";

export type {
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

interface AppUiState {
  selectedIssueId: string | null;
  setSelectedIssueId: (issueId: string | null) => void;
}

export const useAppStore = create<AppUiState>((set) => ({
  selectedIssueId: null,
  setSelectedIssueId: (issueId) => set({ selectedIssueId: issueId }),
}));
