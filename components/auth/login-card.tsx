"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/data/client";
import { isUserRole, isUserStatus, type CurrentUserProfile, type UserRole } from "@/lib/auth/role-utils";

type LoginMode = {
  expectedRole: UserRole;
  title: string;
  description: string;
  roleError: string;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
};

function redirectPathFor(profile: CurrentUserProfile) {
  if (profile.status === "pending") return "/pending-approval";
  if (profile.status === "rejected" || profile.status === "disabled") return "/access-denied";
  return profile.role === "admin" ? "/" : "/workflow";
}

const AUTH_PAGE_PATHS = new Set(["/login", "/admin/login", "/register", "/pending-approval", "/access-denied"]);
const ADMIN_ONLY_PATH_PREFIXES = ["/students", "/reports", "/settings"];
const STUDENT_ALLOWED_PATH_PREFIXES = ["/workflow", "/prompts", "/tools", "/courses", "/issues", "/comments"];

function isAdminOnlyPath(pathname: string) {
  return pathname === "/" || ADMIN_ONLY_PATH_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isStudentAllowedPath(pathname: string) {
  return STUDENT_ALLOWED_PATH_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function parseCurrentProfile(value: unknown): CurrentUserProfile | null {
  if (!value || typeof value !== "object") return null;

  const profile = value as Partial<CurrentUserProfile>;

  if (
    typeof profile.userId !== "string" ||
    typeof profile.email !== "string" ||
    !isUserRole(profile.role) ||
    !isUserStatus(profile.status) ||
    !(typeof profile.studentId === "string" || profile.studentId === null)
  ) {
    return null;
  }

  return {
    userId: profile.userId,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    studentId: profile.studentId,
  };
}

function getSafeNextPath(value: string | null, profile: CurrentUserProfile) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  const pathname = value.split(/[?#]/, 1)[0] || "/";

  if (AUTH_PAGE_PATHS.has(pathname)) return null;
  if (profile.status !== "approved") return null;
  if (profile.role === "admin") return value;
  if (isAdminOnlyPath(pathname)) return null;

  return isStudentAllowedPath(pathname) ? value : null;
}

function LoginContent({ mode }: { mode: LoginMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseClient();

    try {
      if (!supabase) throw new Error("Supabase is not configured.");

      await supabase.auth.signOut();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;

      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json") ? await response.json() : null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to verify this account.");
      }

      const profile = parseCurrentProfile(payload?.user);

      if (!profile) {
        await supabase.auth.signOut();
        throw new Error("Unable to verify this account profile.");
      }

      if (profile.role !== mode.expectedRole) {
        await supabase.auth.signOut();
        throw new Error(mode.roleError);
      }

      const destination = redirectPathFor(profile);
      const safeNext = getSafeNextPath(next, profile);
      router.replace(safeNext ?? destination);
      router.refresh();
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
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <CardTitle>{mode.title}</CardTitle>
          <CardDescription>{mode.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500 dark:text-red-300">
                {error}
              </div>
            )}
            <Button type="submit" className="gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-gray-500 dark:text-slate-400">
            {mode.alternateText}{" "}
            <Link href={mode.alternateHref} className="font-medium text-cyan-600 hover:underline dark:text-cyan-300">
              {mode.alternateLabel}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export function LoginCard({ mode }: { mode: LoginMode }) {
  return (
    <Suspense fallback={null}>
      <LoginContent mode={mode} />
    </Suspense>
  );
}
