"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const Icon = isVisible ? EyeOff : Eye

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          disabled={disabled}
          className={cn("pr-11", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          title={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          disabled={disabled}
          onClick={() => setIsVisible(current => !current)}
          className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-200/70 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
