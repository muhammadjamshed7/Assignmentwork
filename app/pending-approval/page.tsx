"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseClient } from "@/lib/supabase";

export default function PendingApprovalPage() {
  async function signOut() {
    await createSupabaseClient()?.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-deep-navy-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Approval Pending</CardTitle>
          <CardDescription>Your student account was created and is waiting for admin approval.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-gray-600 dark:text-slate-300">
          <p>An admin must approve your account before you can open TDS Management pages.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={signOut}>Back to login</Button>
            <Button asChild type="button" variant="outline">
              <Link href="/register">Register another account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
