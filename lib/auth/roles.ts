import { getUser } from "@/lib/auth/client";
import { isUserRole, UNAUTHORIZED_MESSAGE, type UserRole } from "@/lib/auth/role-utils";
import { requireSupabase } from "@/lib/data/client";

export async function getUserRole(userId?: string): Promise<UserRole> {
  const supabase = requireSupabase();
  const currentUser = userId ? null : await getUser();
  const targetUserId = userId ?? currentUser?.id;

  if (!targetUserId) {
    return "viewer";
  }

  const metadataRole = isUserRole(currentUser?.user_metadata?.role)
    ? currentUser.user_metadata.role
    : undefined;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (error) {
    return metadataRole ?? "viewer";
  }

  return isUserRole(data?.role) ? data.role : metadataRole ?? "viewer";
}

export async function assertAdmin() {
  const user = await getUser();

  if (!user) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  const role = await getUserRole(user.id);

  if (role !== "admin") {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  return user;
}

export { isUserRole, UNAUTHORIZED_MESSAGE };
export type { UserRole };
