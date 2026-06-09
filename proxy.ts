import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isUserRole, isUserStatus, type UserRole, type UserStatus } from "@/lib/auth/role-utils";

const LOGIN_PAGE_PATHS = new Set(["/login", "/admin/login"]);
const SIGNED_IN_ONLY_PAGE_PATHS = new Set(["/pending-approval"]);
const PUBLIC_PAGE_PATHS = new Set(["/login", "/admin/login", "/register", "/pending-approval", "/access-denied"]);
const PUBLIC_API_PREFIXES = ["/api/auth"];
const ADMIN_LOGIN_PATH = "/admin/login";
const STUDENT_LOGIN_PATH = "/login";
const ADMIN_ONLY_PREFIXES = ["/students", "/reports", "/settings"];
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
  return PUBLIC_PAGE_PATHS.has(pathname) || PUBLIC_API_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPublicPagePath(pathname: string) {
  return PUBLIC_PAGE_PATHS.has(pathname);
}

function loginPathFor(pathname: string) {
  return pathname === "/" || ADMIN_ONLY_PREFIXES.some(path => pathname === path || pathname.startsWith(`${path}/`))
    ? ADMIN_LOGIN_PATH
    : STUDENT_LOGIN_PATH;
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

  try {
    let response = NextResponse.next();

    if (PUBLIC_API_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return response;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return isPublicPath(pathname) ? response : NextResponse.redirect(getRedirectUrl(request, loginPathFor(pathname)));
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
      if (SIGNED_IN_ONLY_PAGE_PATHS.has(pathname)) {
        const loginUrl = getRedirectUrl(request, STUDENT_LOGIN_PATH);
        loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
      }

      if (isPublicPath(pathname)) return response;
      const loginUrl = getRedirectUrl(request, loginPathFor(pathname));
      loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
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

    if (isPublicPagePath(pathname)) {
      if (pathname === targetHome) return response;
      if (status === "rejected" || status === "disabled") {
        return NextResponse.redirect(getRedirectUrl(request, targetHome));
      }

      if (LOGIN_PAGE_PATHS.has(pathname)) return response;
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
  } catch {
    return isPublicPath(request.nextUrl.pathname)
      ? NextResponse.next()
      : NextResponse.redirect(getRedirectUrl(request, loginPathFor(request.nextUrl.pathname)));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/.*|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
