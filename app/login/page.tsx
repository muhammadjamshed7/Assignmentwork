"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, requireSupabase } from "@/lib/data/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = requireSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const nextPath = searchParams.get("next");
      router.replace(nextPath?.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in to TDS Management</CardTitle>
          <CardDescription>Use the admin account created in Supabase Auth.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Sign in to TDS Management</CardTitle>
              <CardDescription>Loading sign in...</CardDescription>
            </CardHeader>
          </Card>
        </main>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
