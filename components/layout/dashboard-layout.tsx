"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BarChart3, 
  BookOpen, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Users, 
  Workflow,
  Wrench,
  Bell,
  Search,
  Menu,
  X,
  FileText,
  ClipboardList
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { listIssues } from "@/lib/data/issues"
import { useSupabaseQuery } from "@/lib/data/hooks"
import { useSearchStore } from "@/store/useSearchStore"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Writers", href: "/students", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Prompts", href: "/prompts", icon: ClipboardList },
  { name: "Workflow", href: "/workflow", icon: Workflow },
  { name: "Issues", href: "/issues", icon: Wrench },
  { name: "Comments/Tickets", href: "/comments", icon: MessageSquare },
  { name: "AI Tools", href: "/tools", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return <DashboardShell pathname={pathname}>{children}</DashboardShell>
}

function DashboardShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { data: issues } = useSupabaseQuery(listIssues, [], ["issues", "comments"])
  const { searchQuery, setSearchQuery } = useSearchStore()
  const openIssuesCount = issues.filter(i => i.status !== 'Resolved').length

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-3 border-b border-zinc-200 bg-white px-3 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950">
        <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 flex-1 gap-x-3 self-stretch lg:gap-x-6">
          <div className="relative hidden min-w-0 flex-1 sm:flex">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-zinc-400" aria-hidden="true" />
            <input
              id="search-field"
              className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm dark:text-zinc-50"
              placeholder="Search..."
              type="search"
              name="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
            <PwaInstallButton />
            <ThemeToggle />
            <button type="button" className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-500 relative">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {openIssuesCount > 0 && (
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200 dark:lg:bg-zinc-800" aria-hidden="true" />
            <div className="flex items-center gap-x-4">
              <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center">
                <span className="max-w-52 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Open workspace
                </span>
                <span className="text-xs text-zinc-500">No login required</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col bg-white border-r border-zinc-200 transition-transform duration-200 ease-in-out lg:static lg:w-64 lg:max-w-none lg:translate-x-0 dark:bg-zinc-950 dark:border-zinc-800",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
            <span className="text-lg font-semibold dark:text-zinc-50">Academic Dashboard</span>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6 lg:py-8">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              <li className="mb-4 hidden lg:block px-2 list-none">
                <span className="text-lg font-bold tracking-tight dark:text-white">TDS Management</span>
              </li>
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      pathname === item.href
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/50 dark:text-white"
                        : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-zinc-900 dark:text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.name === 'Issues' && openIssuesCount > 0 && (
                      <Badge variant="destructive" className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                        {openIssuesCount}
                      </Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
