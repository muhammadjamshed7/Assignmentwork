import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { isUserRole, UNAUTHORIZED_MESSAGE } from "@/lib/auth/role-utils";

function getSupabaseUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return supabaseUrl;
}

function getSupabaseAnonKey() {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.");
  }

  return supabaseAnonKey;
}

function getServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for user management.");
  }

  return serviceRoleKey;
}

export async function createCookieSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
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
          // Server Components cannot set cookies; Route Handlers and middleware can.
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

export async function requireAdminRequest() {
  const authClient = await createCookieSupabaseClient();
  const serviceClient = createServiceRoleClient();
  const { data, error } = await authClient.auth.getUser();

  if (error || !data.user) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  const { data: roleRow, error: roleError } = await serviceClient
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const metadataRole = isUserRole(data.user.user_metadata?.role)
    ? data.user.user_metadata.role
    : undefined;
  const role = isUserRole(roleRow?.role) ? roleRow.role : metadataRole;

  if (roleError || role !== "admin") {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  return {
    user: data.user,
    supabase: serviceClient,
  };
}
