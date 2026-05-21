'use client'

import React from 'react'
import Link from 'next/link'
import {
  Bell,
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Users,
  Wrench,
  FileText
} from 'lucide-react'

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Issues", href: "/issues", icon: Wrench },
  { name: "Comments/Tickets", href: "/comments", icon: MessageSquare },
  { name: "Prompts", href: "/prompts", icon: BookOpen },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 w-64 flex-col border-r bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hidden md:flex">
        <div className="flex h-14 items-center border-b px-6 border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-zinc-950 dark:text-zinc-50">
            <LayoutDashboard className="h-5 w-5" />
            <span>EduDash</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:pl-64 flex-1">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4 sm:px-6 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center lg:hidden">
            <span className="font-semibold text-zinc-950 dark:text-zinc-50">EduDash</span>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-600"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-semibold text-sm text-zinc-700 dark:text-zinc-300">
              AD
            </div>
          </div>
        </header>
        
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
