"use client"

import { useToastStore } from "@/store/useToastStore"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export function Toaster() {
  const { toasts, removeToast } = useToastStore()
  
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto bg-white border border-zinc-200 text-zinc-950 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 p-4 rounded-md shadow-lg flex items-start gap-4 min-w-[300px] max-w-sm animate-in slide-in-from-bottom-5">
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0" />}
          <div className="flex-1 mt-0.5">
            <h3 className="font-semibold text-sm leading-none tracking-tight">{toast.title}</h3>
            {toast.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">{toast.description}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
