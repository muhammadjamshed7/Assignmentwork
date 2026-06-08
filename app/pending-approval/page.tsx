"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfileFromApi } from "@/lib/auth/roles";
import { createSupabaseClient } from "@/lib/supabase";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  const checkStatus = useCallback(async () => {
    setChecking(true);
    setMessage("");

    try {
      const profile = await getCurrentProfileFromApi();

      if (!profile) {
        window.location.href = "/login";
        return;
      }

      if (profile.status === "approved") {
        router.replace(profile.role === "admin" ? "/" : "/workflow");
        router.refresh();
        return;
      }

      if (profile.status === "rejected" || profile.status === "disabled") {
        router.replace("/access-denied");
        router.refresh();
        return;
      }

      setMessage("Your account is still pending admin approval.");
    } catch {
      setMessage("Unable to check approval status. Try again.");
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkStatus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [checkStatus]);

  async function signOut() {
    await createSupabaseClient()?.auth.signOut();
    window.location.href = "/login";
  }

  async function registerAnotherAccount() {
    await createSupabaseClient()?.auth.signOut();
    window.location.href = "/register";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-deep-navy-900">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Approval Pending</CardTitle>
          <CardDescription>Your writer expert account was created and is waiting for admin approval.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-gray-600 dark:text-slate-300">
          <p>An admin must approve your account before you can open TDS Management pages.</p>
          {message && <p className="text-amber-600 dark:text-amber-300">{message}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => void checkStatus()} disabled={checking}>
              {checking ? "Checking..." : "Check status"}
            </Button>
            <Button type="button" onClick={signOut}>Back to login</Button>
            <Button type="button" variant="outline" onClick={registerAnotherAccount}>
              Register another account
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
