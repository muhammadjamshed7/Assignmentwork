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
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FileText,
  ClipboardList,
  Bell,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"


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
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  function handleSidebarToggle() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarCollapsed(current => !current)
      return
    }

    setSidebarOpen(current => !current)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f9] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-3 border-b border-zinc-200/80 bg-white/90 px-3 shadow-sm shadow-zinc-200/60 backdrop-blur sm:gap-x-6 sm:px-6 lg:px-8 dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-black/20">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
          onClick={handleSidebarToggle}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 lg:hidden" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5 lg:hidden" aria-hidden="true" />
          )}
          {sidebarCollapsed ? (
            <PanelLeftOpen className="hidden h-5 w-5 lg:block" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="hidden h-5 w-5 lg:block" aria-hidden="true" />
          )}
        </Button>
        <div className="flex min-w-0 flex-1 gap-x-3 self-stretch lg:gap-x-6">
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="truncate text-sm font-semibold text-zinc-950 sm:text-base dark:text-zinc-50">
              TDS Management
            </span>
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Academic operations
            </span>
          </div>
          <div className="ml-auto flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
            <PwaInstallButton />
            <ThemeToggle />
            <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50">
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="hidden md:block md:h-6 md:w-px md:bg-zinc-200 dark:md:bg-zinc-800" aria-hidden="true" />
            <div className="flex items-center gap-x-4">
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:justify-center">
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
            className="fixed inset-0 z-40 bg-zinc-950/45 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col border-r border-zinc-200/80 bg-white/95 shadow-xl shadow-zinc-900/10 backdrop-blur transition-[transform,width] duration-200 ease-in-out lg:static lg:max-w-none lg:translate-x-0 lg:shadow-none dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:shadow-black/30",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}>
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-zinc-200 dark:border-zinc-800 lg:hidden">
            <span className="text-lg font-semibold dark:text-zinc-50">Academic Dashboard</span>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-5 lg:py-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      pathname === item.href
                        ? "bg-zinc-950 text-white shadow-sm dark:bg-zinc-50 dark:text-zinc-950"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
                      "group relative flex min-h-10 items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      sidebarCollapsed && "lg:justify-center lg:px-2"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-white dark:text-zinc-950" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    <span className={cn("truncate", sidebarCollapsed && "lg:sr-only")}>{item.name}</span>
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
