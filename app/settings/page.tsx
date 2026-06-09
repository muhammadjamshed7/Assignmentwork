"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, ShieldOff, Trash2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCurrentUserRole } from "@/lib/auth/use-current-user-role"
import { type UserRole, type UserStatus } from "@/lib/auth/role-utils"
import { getErrorMessage, readJsonResponse, requireSupabase } from "@/lib/data/client"
import { useToastStore } from "@/store/useToastStore"

type SupabaseStatus =
  | { state: "loading"; message: string }
  | { state: "connected"; message: string }
  | { state: "disconnected"; message: string }

type ManagedUser = {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  studentId?: string | null
  createdAt?: string
  lastSignInAt?: string
}

type UsersPayload = {
  users?: ManagedUser[]
  error?: string
}

type MutationPayload = {
  error?: string
}

export default function SettingsPage() {
  const { profile, isAdmin } = useCurrentUserRole()
  const { addToast } = useToastStore()
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>({
    state: "loading",
    message: "Checking connection...",
  })
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [usersError, setUsersError] = useState("")
  const [usersLoading, setUsersLoading] = useState(false)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

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
      const payload = await readJsonResponse<UsersPayload>(response)

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load users.")
      }

      setUsers(payload?.users ?? [])
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

  async function updateUser(userId: string, input: { role?: UserRole; status?: UserStatus }) {
    setUsersError("")
    setSavingUserId(userId)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const payload = await readJsonResponse<MutationPayload>(response)

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update user.")
      }

      await loadUsers()
      addToast({
        title: "User updated",
        description: "The account access settings were saved.",
        type: "success",
      })
    } catch (error) {
      const message = getErrorMessage(error)
      setUsersError(message)
      addToast({
        title: "Update failed",
        description: message,
        type: "error",
      })
    } finally {
      setSavingUserId(null)
    }
  }

  async function removeUser(userId: string) {
    if (!window.confirm("Remove this user?")) return
    setUsersError("")
    setSavingUserId(userId)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })
      const payload = await readJsonResponse<MutationPayload>(response)

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to remove user.")
      }

      await loadUsers()
      addToast({
        title: "User removed",
        description: "The account was removed.",
        type: "success",
      })
    } catch (error) {
      const message = getErrorMessage(error)
      setUsersError(message)
      addToast({
        title: "Delete failed",
        description: message,
        type: "error",
      })
    } finally {
      setSavingUserId(null)
    }
  }

  function isCurrentAdminRow(user: ManagedUser) {
    return user.id === profile?.userId
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-gray-900 dark:text-white font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-400">Connection status and user access management.</p>
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
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-slate-500" />
                    {supabaseStatus.message}
                 </div>
               )}
               {supabaseStatus.state === "connected" && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                   {supabaseStatus.message}
                 </div>
               )}
               {supabaseStatus.state === "disconnected" && (
                  <div className="space-y-1 text-sm text-red-400">
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
              <CardDescription>Approve, reject, disable, and manage writer expert/admin access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usersError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {usersError}
                </div>
              )}

              <div className="rounded-md border border-gray-200 dark:border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => {
                      const isOwnRow = isCurrentAdminRow(user)
                      const isSaving = savingUserId === user.id

                      return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{user.email || user.id}</span>
                            {isOwnRow && <Badge variant="outline">Current admin</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <select
                            value={user.role}
                            onChange={(event) => void updateUser(user.id, { role: event.target.value as UserRole })}
                            disabled={isSaving || isOwnRow}
                            className="h-9 rounded-md border border-gray-300 bg-gray-100/50 px-2 text-sm text-gray-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                          >
                            <option value="student">Writer Expert</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={user.status === "approved" ? "success" : user.status === "pending" ? "pending" : "destructive"}>
                              {user.status}
                            </Badge>
                            <select
                              value={user.status}
                              onChange={(event) => void updateUser(user.id, { status: event.target.value as UserStatus })}
                              disabled={isSaving || isOwnRow}
                              className="h-9 rounded-md border border-gray-300 bg-gray-100/50 px-2 text-sm text-gray-900 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="disabled">Disabled</option>
                            </select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                          {user.status === "pending" && (
                            <Button type="button" size="sm" className="gap-2" disabled={isSaving} onClick={() => void updateUser(user.id, { status: "approved" })}>
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                              Approve
                            </Button>
                          )}
                          {user.status !== "pending" && (
                            <Button type="button" variant="ghost" size="icon" title="Approve writer expert" disabled={isSaving} onClick={() => void updateUser(user.id, { status: "approved" })}>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                              <span className="sr-only">Approve user</span>
                            </Button>
                          )}
                          <Button type="button" variant="ghost" size="icon" title="Reject writer expert" disabled={isSaving || isOwnRow} onClick={() => void updateUser(user.id, { status: "rejected" })}>
                            <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                            <span className="sr-only">Reject user</span>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title="Disable user" disabled={isSaving || isOwnRow} onClick={() => void updateUser(user.id, { status: "disabled" })}>
                            <ShieldOff className="h-4 w-4 text-amber-500" aria-hidden="true" />
                            <span className="sr-only">Disable user</span>
                          </Button>
                          <Button type="button" variant="ghost" size="icon" title={isOwnRow ? "You cannot remove your own account" : "Remove user"} disabled={isSaving || isOwnRow} onClick={() => void removeUser(user.id)}>
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Remove user</span>
                          </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )})}
                    {!usersLoading && users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-20 text-center text-sm text-gray-400 dark:text-slate-500">
                          No users found.
                        </TableCell>
                      </TableRow>
                    )}
                    {usersLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-20 text-center text-sm text-gray-400 dark:text-slate-500">
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
