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
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-deep-navy-900">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-deep-navy-900/80 px-3 shadow-lg shadow-black/20 backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-200"
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
            <span className="truncate text-sm font-display font-semibold text-white sm:text-base">
              TDS Management
            </span>
            <span className="truncate text-xs text-gray-400 dark:text-slate-500">
              Academic operations
            </span>
          </div>
          <div className="ml-auto flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
            <PwaInstallButton />
            <ThemeToggle />
            <button type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-200">
              <span className="sr-only">View notifications</span>
              <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="hidden h-6 w-px bg-white/10 md:block" aria-hidden="true" />
            <div className="flex items-center gap-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20">
                O
              </div>
              <div className="hidden sm:flex sm:flex-col sm:items-start sm:justify-center">
                <span className="max-w-52 truncate text-sm font-medium text-white">
                  Open workspace
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">No login required</span>
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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] transform flex-col border-r border-indigo-500/15 bg-[rgba(13,20,38,0.95)] shadow-xl shadow-black/30 backdrop-blur-xl transition-[transform,width] duration-200 ease-in-out lg:static lg:max-w-none lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}>
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-white/5 px-6 lg:hidden">
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-lg font-display font-semibold text-transparent">Academic Dashboard</span>
            <Button variant="ghost" size="icon" className="ml-auto text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-200" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo area (desktop) */}
          <div className="hidden h-16 shrink-0 items-center border-b border-gray-200 dark:border-white/5 px-6 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                T
              </div>
              <span className={cn("bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-base font-display font-semibold text-transparent", sidebarCollapsed && "lg:sr-only")}>
                TDS
              </span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-5 lg:py-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={cn(
                      pathname === item.href
                        ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white shadow-sm"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                      "group relative flex min-h-10 items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      sidebarCollapsed && "lg:justify-center lg:px-2"
                    )}
                  >
                    {pathname === item.href && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                    )}
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-indigo-400" : "text-slate-500 group-hover:text-gray-700 dark:text-slate-300",
                        "h-5 w-5 shrink-0 transition-colors duration-200"
                      )}
                      aria-hidden="true"
                    />
                    <span className={cn("truncate", sidebarCollapsed && "lg:sr-only")}>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom workspace area */}
          <div className="border-t border-gray-200 dark:border-white/5 p-4">
            <div className={cn("flex items-center gap-3 rounded-lg bg-white/[0.03] p-3", sidebarCollapsed && "lg:justify-center lg:p-2")}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white ring-2 ring-indigo-500/20">
                O
              </div>
              <div className={cn("min-w-0", sidebarCollapsed && "lg:sr-only")}>
                <p className="truncate text-sm font-medium text-white">Open Workspace</p>
                <p className="truncate text-xs text-gray-400 dark:text-slate-500">Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl animate-[fade-in_0.3s_ease-out] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
