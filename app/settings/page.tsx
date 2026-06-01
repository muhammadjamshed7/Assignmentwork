"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { type UserRole } from "@/lib/auth/role-utils"
import { getErrorMessage, requireSupabase } from "@/lib/data/client"

type SupabaseStatus =
  | { state: "loading"; message: string }
  | { state: "connected"; message: string }
  | { state: "disconnected"; message: string }

type ManagedUser = {
  id: string
  email: string
  role: UserRole
  createdAt?: string
  lastSignInAt?: string
}

export default function SettingsPage() {
  const { isAdmin } = useCurrentUserRole()
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    state: "loading",
    message: "Checking connection...",
  })
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [usersError, setUsersError] = useState("")
  const [usersLoading, setUsersLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer")
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkSupabaseConnection() {
      setSupabaseStatus({
        state: "loading",
        message: "Checking connection...",
      })

      try {
        const supabase = requireSupabase()
        const { error } = await supabase.from("courses").select("id").limit(1)

        if (error) {
          throw error
        }

        if (isMounted) {
          setSupabaseStatus({
            state: "connected",
            message: "Connected",
          })
        }
      } catch (error) {
        if (isMounted) {
          setSupabaseStatus({
            state: "disconnected",
            message: getErrorMessage(error),
          })
        }
      }
    }

    void checkSupabaseConnection()

    return () => {
      isMounted = false
    }
  }, [])

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return

    setUsersLoading(true)
    setUsersError("")

    try {
      const response = await fetch("/api/users")
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load users.")
      }

      setUsers(payload.users ?? [])
    } catch (error) {
      setUsersError(getErrorMessage(error))
    } finally {
      setUsersLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadUsers])

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsInviting(true)
    setUsersError("")

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to invite user.")
      }

      setInviteEmail("")
      setInviteRole("viewer")
      await loadUsers()
    } catch (error) {
      setUsersError(getErrorMessage(error))
    } finally {
      setIsInviting(false)
    }
  }

  async function updateUserRole(userId: string, role: UserRole) {
    setUsersError("")

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update role.")
      }

      setUsers(prev => prev.map(user => user.id === userId ? { ...user, role } : user))
    } catch (error) {
      setUsersError(getErrorMessage(error))
    }
  }

  async function removeUser(userId: string) {
    if (!window.confirm("Remove this user?")) return
    setUsersError("")

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to remove user.")
      }

      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      setUsersError(getErrorMessage(error))
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Connection status and user access management.</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Integration</CardTitle>
            <CardDescription>Database connection status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid gap-2">
               <label className="text-sm font-medium">Status</label>
               {supabaseStatus.state === "loading" && (
                 <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                   <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
                   {supabaseStatus.message}
                 </div>
               )}
               {supabaseStatus.state === "connected" && (
                 <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                   <div className="h-2 w-2 rounded-full bg-green-500" />
                   {supabaseStatus.message}
                 </div>
               )}
               {supabaseStatus.state === "disconnected" && (
                 <div className="space-y-1 text-sm text-red-600 dark:text-red-400">
                   <div className="flex items-center gap-2 font-medium">
                     <div className="h-2 w-2 rounded-full bg-red-500" />
                     Disconnected
                   </div>
                   <p>{supabaseStatus.message}</p>
                 </div>
               )}
             </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage admin and viewer accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={inviteUser} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px_auto] lg:items-end">
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as UserRole)}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? "Inviting..." : "Invite User"}
                </Button>
              </form>

              {usersError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                  {usersError}
                </div>
              )}

              <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email || user.id}</TableCell>
                        <TableCell>
                          <select
                            value={user.role}
                            onChange={(event) => updateUserRole(user.id, event.target.value as UserRole)}
                            className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button type="button" variant="ghost" size="icon" title="Remove user" onClick={() => void removeUser(user.id)}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Remove user</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!usersLoading && users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-sm text-zinc-500">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                    {usersLoading && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-20 text-center text-sm text-zinc-500">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
