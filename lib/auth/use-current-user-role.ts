"use client";

import { type UserRole } from "@/lib/auth/role-utils";

export function useCurrentUserRole() {
  const role: UserRole = "admin";

  return {
    role,
    loading: false,
    isAdmin: true,
  };
}
