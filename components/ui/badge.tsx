import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-5 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-deep-navy-900",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
        secondary:
          "border-slate-600/30 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300",
        destructive:
          "border-red-500/20 bg-red-500/15 text-red-400",
        outline: "border-gray-300 dark:border-slate-700 bg-transparent text-gray-500 dark:text-slate-400",
        pending: "border-amber-500/20 bg-amber-500/15 text-amber-400",
        success: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
        info: "border-blue-500/20 bg-blue-500/15 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
