"use client";

import { useEffect, useState } from "react";

import { getCurrentProfileFromApi } from "@/lib/auth/roles";
import { isApprovedAdmin, isApprovedStudent, type CurrentUserProfile } from "@/lib/auth/role-utils";

export function useCurrentUserRole() {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const userProfile = await getCurrentProfileFromApi();
        if (mounted) setProfile(userProfile);
      } catch {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    profile,
    role: profile?.role ?? null,
    status: profile?.status ?? null,
    loading,
    isAdmin: isApprovedAdmin(profile),
    isStudent: isApprovedStudent(profile),
  };
}
