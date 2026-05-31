"use client"

import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"

const STORAGE_KEY = "tds-management-theme"

function applyTheme(theme: Theme) {
  const root = document.documentElement

  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

export function ThemeToggle() {
  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark"

    applyTheme(nextTheme)

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {}
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle dark theme"
      title="Toggle dark theme"
      className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      <Sun className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <Moon className="hidden h-5 w-5 dark:block" aria-hidden="true" />
    </Button>
  )
}
