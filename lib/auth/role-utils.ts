export type UserRole = "admin" | "student";
export type UserStatus = "pending" | "approved" | "rejected" | "disabled";

export type CurrentUserProfile = {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  studentId: string | null;
};

export const UNAUTHORIZED_MESSAGE = "Unauthorized - admin access required";

export function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "student";
}

export function isUserStatus(value: unknown): value is UserStatus {
  return value === "pending" || value === "approved" || value === "rejected" || value === "disabled";
}

export function isApprovedAdmin(profile: Pick<CurrentUserProfile, "role" | "status"> | null | undefined) {
  return profile?.role === "admin" && profile.status === "approved";
}

export function isApprovedStudent(profile: Pick<CurrentUserProfile, "role" | "status"> | null | undefined) {
  return profile?.role === "student" && profile.status === "approved";
}
