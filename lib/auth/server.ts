import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import {
  CurrentUserProfile,
  isApprovedAdmin,
  isUserRole,
  isUserStatus,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/auth/role-utils";

type AuthUser = {
  id: string;
  email?: string | null;
};

export class AuthRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthRequestError";
    this.status = status;
  }
}

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return supabaseUrl;
}

function getAnonKey() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.");
  }

  return anonKey;
}

function getServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for user management.");
  }

  return serviceRoleKey;
}

async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; route handlers and actions can.
        }
      },
    },
  });
}

export function createServiceRoleClient() {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getProfileForAuthUser(user: AuthUser): Promise<CurrentUserProfile> {
  const supabase = createServiceRoleClient();
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id, email, role, status, student_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    throw roleError;
  }

  const role = isUserRole(roleRow?.role) ? roleRow.role : "student";
  const status = isUserStatus(roleRow?.status) ? roleRow.status : "pending";

  return {
    userId: user.id,
    email: roleRow?.email || user.email || "",
    role,
    status,
    studentId: typeof roleRow?.student_id === "string" ? roleRow.student_id : null,
  };
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const supabase = await createServerSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  return getProfileForAuthUser(userData.user);
}

export async function getCurrentUserProfileFromAccessToken(accessToken: string): Promise<CurrentUserProfile | null> {
  const token = accessToken.trim();

  if (!token) return null;

  const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return null;
  }

  return getProfileForAuthUser(userData.user);
}

export async function requireApprovedUser() {
  const profile = await getCurrentUserProfile();

  if (!profile || profile.status !== "approved") {
    throw new Error("Approved login is required.");
  }

  return profile;
}

export async function requireAdminRequest() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new AuthRequestError("Authentication is required.", 401);
  }

  if (!isApprovedAdmin(profile)) {
    throw new AuthRequestError(UNAUTHORIZED_MESSAGE, 403);
  }

  return {
    user: { id: profile.userId, email: profile.email },
    profile,
    supabase: createServiceRoleClient(),
  };
}
