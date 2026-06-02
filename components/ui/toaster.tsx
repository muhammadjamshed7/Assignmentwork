"use client"

import { useToastStore } from "@/store/useToastStore"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export function Toaster() {
  const { toasts, removeToast } = useToastStore()
  
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto animate-[slide-in_0.3s_ease-out] rounded-xl border border-gray-300/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 p-4 shadow-2xl shadow-black/40 flex items-start gap-4 min-w-[300px] max-w-sm">
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-blue-400 shrink-0" />}
          <div className="flex-1 mt-0.5">
            <h3 className="font-semibold text-sm leading-none tracking-tight text-slate-100">{toast.title}</h3>
            {toast.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">{toast.description}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
