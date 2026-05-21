"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage platform preferences and system configurations.</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Update your academic organization details and contact info.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid gap-2">
               <label className="text-sm font-medium">Organization Name</label>
               <input disabled type="text" value="Academic Services" className="h-9 w-full max-w-md rounded-md border border-zinc-200 bg-zinc-50/50 px-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50" />
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Integration</CardTitle>
            <CardDescription>Manage database connections and API keys.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid gap-2">
               <label className="text-sm font-medium">Status</label>
               <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div> Connected
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
