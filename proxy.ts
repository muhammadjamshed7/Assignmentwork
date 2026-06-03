import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isUserRole, isUserStatus, type UserRole, type UserStatus } from "@/lib/auth/role-utils";

const PUBLIC_PATHS = new Set(["/login", "/register", "/pending-approval", "/access-denied"]);
const STUDENT_ALLOWED_PREFIXES = [
  "/workflow",
  "/prompts",
  "/tools",
  "/courses",
  "/issues",
  "/comments",
  "/api/auth",
];

function getRedirectUrl(request: NextRequest, pathname: string) {
  return new URL(pathname, request.url);
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

function isStudentAllowedPath(pathname: string) {
  return STUDENT_ALLOWED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function homeFor(role: UserRole, status: UserStatus) {
  if (status === "pending") return "/pending-approval";
  if (status === "rejected" || status === "disabled") return "/access-denied";
  return role === "admin" ? "/" : "/workflow";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return isPublicPath(pathname) ? response : NextResponse.redirect(getRedirectUrl(request, "/login"));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    if (isPublicPath(pathname)) return response;
    const loginUrl = getRedirectUrl(request, "/login");
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = isUserRole(roleRow?.role) ? roleRow.role : "student";
  const status = isUserStatus(roleRow?.status) ? roleRow.status : "pending";
  const targetHome = homeFor(role, status);

  if (isPublicPath(pathname)) {
    if (pathname === targetHome) return response;
    return NextResponse.redirect(getRedirectUrl(request, targetHome));
  }

  if (status !== "approved") {
    if (pathname === targetHome) return response;
    return NextResponse.redirect(getRedirectUrl(request, targetHome));
  }

  if (role === "student" && !isStudentAllowedPath(pathname)) {
    return NextResponse.redirect(getRedirectUrl(request, "/workflow"));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)",
  ],
};
