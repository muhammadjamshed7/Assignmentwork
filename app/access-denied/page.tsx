"use client";

import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfileFromApi } from "@/lib/auth/roles";
import { createSupabaseClient } from "@/lib/supabase";

export default function AccessDeniedPage() {
  async function signOut() {
    const profile = await getCurrentProfileFromApi().catch(() => null);
    await createSupabaseClient()?.auth.signOut();
    window.location.href = profile?.role === "admin" ? "/admin/login" : "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-deep-navy-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-300">
            <ShieldX className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Your account is not allowed to access TDS Management.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-gray-600 dark:text-slate-300">
          <p>This account may be rejected, disabled, or missing approval. Contact an administrator if this is unexpected.</p>
          <Button type="button" onClick={signOut}>Sign out</Button>
        </CardContent>
      </Card>
    </main>
  );
}
