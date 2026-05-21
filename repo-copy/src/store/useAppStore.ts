import { create } from 'zustand'

export enum IssueStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Escalated = 'Escalated'
}

export enum Role {
  Student = 'Student',
  Admin = 'Admin'
}

interface AppStore {
  aiTools: any[]
  setAiTools: (tools: any[]) => void
}

export const useAppStore = create<AppStore>((set) => ({
  aiTools: [],
  setAiTools: (tools) => set({ aiTools: tools }),
}))
