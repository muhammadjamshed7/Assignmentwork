export type UserRole = "admin" | "viewer";

export const UNAUTHORIZED_MESSAGE = "Unauthorized — admin access required";

export function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "viewer";
}
