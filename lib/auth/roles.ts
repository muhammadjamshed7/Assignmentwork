import {
  isApprovedAdmin,
  UNAUTHORIZED_MESSAGE,
  type CurrentUserProfile,
} from "@/lib/auth/role-utils";
import { readJsonResponse } from "@/lib/data/client";

type CurrentProfilePayload = {
  user?: CurrentUserProfile | null;
  error?: string;
};

export async function getCurrentProfileFromApi(): Promise<CurrentUserProfile | null> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });

  if (response.status === 401) return null;

  const payload = await readJsonResponse<CurrentProfilePayload>(response);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Unable to read the current user.");
  }

  return payload?.user ?? null;
}

export async function assertAdmin() {
  const profile = await getCurrentProfileFromApi();

  if (!isApprovedAdmin(profile)) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }
}
