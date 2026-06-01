import { isUserRole, UNAUTHORIZED_MESSAGE, type UserRole } from "@/lib/auth/role-utils";

export async function getUserRole(userId?: string): Promise<UserRole> {
  void userId;
  return "admin";
}

export async function assertAdmin() {
  return null;
}

export { isUserRole, UNAUTHORIZED_MESSAGE };
export type { UserRole };
