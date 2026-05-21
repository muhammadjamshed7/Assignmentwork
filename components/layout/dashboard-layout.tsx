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
  Wrench,
  Bell,
  Search,
  Menu,
  FileText,
  ClipboardList
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/store/useAppStore"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Prompts", href: "/prompts", icon: ClipboardList },
  { name: "Issues", href: "/issues", icon: Wrench },
  { name: "Comments/Tickets", href: "/comments", icon: MessageSquare },
  { name: "AI Tools Usage", href: "/tools", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const issues = useAppStore(state => state.issues)
  const openIssuesCount = issues.filter(i => i.status !== 'Resolved').length

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1">
            <label htmlFor="search-field" className="sr-only">Search</label>
            <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-zinc-400" aria-hidden="true" />
            <input
              id="search-field"
              className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm dark:text-zinc-50"
              placeholder="Search..."
              type="search"
              name="search"
            />
          </div>
          <div className="flex items-center gap-x-4 lg:gap-x-6">
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
              <Avatar>
                <AvatarImage src="https://ui.shadcn.com/avatars/01.png" alt="@shadcn" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Admin User</span>
                <span className="text-xs text-zinc-500">Academic Services</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-zinc-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 dark:bg-zinc-950 dark:border-zinc-800",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
            <span className="text-lg font-semibold dark:text-zinc-50">Academic Dashboard</span>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col px-4 py-8">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              <li className="mb-4 hidden lg:block px-2 list-none">
                <span className="text-lg font-bold tracking-tight dark:text-white">EduMetrics</span>
              </li>
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
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
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
