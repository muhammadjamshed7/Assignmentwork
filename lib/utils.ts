import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusVariant(status: string) {
  switch(status) {
    case 'Resolved': return 'success'
    case 'In Progress': return 'info'
    case 'Escalated': return 'destructive'
    default: return 'pending'
  }
}

export function getPriorityVariant(priority: string) {
  switch(priority) {
    case 'Critical': return 'destructive'
    case 'High': return 'default'
    case 'Medium': return 'secondary'
    default: return 'outline'
  }
}
