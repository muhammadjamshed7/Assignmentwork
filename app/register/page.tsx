"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, readJsonResponse } from "@/lib/data/client";
import { createSupabaseClient } from "@/lib/supabase";

type RegisterPayload = {
  error?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await readJsonResponse<RegisterPayload>(response);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to create account.");
      }

      const supabase = createSupabaseClient();
      if (!supabase) throw new Error("Account created, but Supabase is not configured for sign in.");

      await supabase.auth.signOut();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw new Error("Account created, but automatic sign-in failed. Please sign in from the login page.");
      }

      router.replace("/pending-approval");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-deep-navy-900">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="border-b border-gray-200 dark:border-white/10">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>Writer Expert Registration</CardTitle>
          <CardDescription>Create a writer expert account. Access starts after admin approval.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
            </div>
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-300">
                {error}
              </div>
            )}
            <Button type="submit" className="gap-2" disabled={loading}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-slate-400">
            Already approved?{" "}
            <Link href="/login" className="font-medium text-cyan-600 hover:underline dark:text-cyan-300">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
