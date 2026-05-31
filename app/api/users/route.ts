import { NextResponse } from "next/server";

import { isUserRole } from "@/lib/auth/role-utils";
import { requireAdminRequest } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

export async function GET() {
  try {
    const { supabase } = await requireAdminRequest();
    const [{ data: authUsers, error: usersError }, { data: roles, error: rolesError }] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (usersError) throw usersError;
    if (rolesError) throw rolesError;

    const rolesByUserId = new Map((roles ?? []).map(row => [row.user_id as string, row.role as string]));
    const users = authUsers.users.map(user => {
      const role = rolesByUserId.get(user.id);
      const metadataRole = user.user_metadata?.role;

      return {
        id: user.id,
        email: user.email ?? "",
        role: isUserRole(role) ? role : isUserRole(metadataRole) ? metadataRole : "viewer",
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdminRequest();
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const role = isUserRole(body.role) ? body.role : "viewer";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });

    if (error) throw error;

    if (data.user) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: data.user.id, role }, { onConflict: "user_id" });

      if (roleError) throw roleError;
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 403 });
  }
}
