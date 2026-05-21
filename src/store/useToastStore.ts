import { create } from 'zustand'

export type ToastOptions = {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastStore {
  toasts: ToastOptions[]
  toast: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (options) => {
    // Add a simple toast logic
    console.log("Toast: ", options.title);
  },
  dismiss: (id) => {}
}))
