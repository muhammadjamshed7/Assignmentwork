"use client";

import * as React from "react";

import { getUser } from "@/lib/auth/client";
import { getUserRole } from "@/lib/auth/roles";
import { type UserRole } from "@/lib/auth/role-utils";

export function useCurrentUserRole() {
  const [role, setRole] = React.useState<UserRole>("viewer");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadRole() {
      try {
        const user = await getUser();
        const nextRole = user ? await getUserRole(user.id) : "viewer";

        if (isMounted) {
          setRole(nextRole);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    role,
    loading,
    isAdmin: role === "admin",
  };
}
