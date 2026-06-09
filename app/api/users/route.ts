import { NextResponse } from "next/server";

import { isUserRole, isUserStatus } from "@/lib/auth/role-utils";
import { AuthRequestError, requireAdminRequest } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

function statusForError(error: unknown) {
  return error instanceof AuthRequestError ? error.status : 500;
}

export async function GET() {
  try {
    const { supabase } = await requireAdminRequest();
    const [{ data: authUsers, error: usersError }, { data: roles, error: rolesError }] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from("user_roles").select("user_id, email, role, status, student_id, created_at, approved_at"),
    ]);

    if (usersError) throw usersError;
    if (rolesError) throw rolesError;

    const rolesByUserId = new Map((roles ?? []).map(row => [String(row.user_id), row]));
    const users = authUsers.users.map(user => {
      const roleRow = rolesByUserId.get(user.id);
      const role = roleRow?.role;
      const status = roleRow?.status;

      return {
        id: user.id,
        email: roleRow?.email ?? user.email ?? "",
        role: isUserRole(role) ? role : "student",
        status: isUserStatus(status) ? status : "pending",
        studentId: roleRow?.student_id ?? null,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        needsRoleSync: !roleRow,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) });
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAdminRequest();
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const role = isUserRole(body.role) ? body.role : "student";
    const status = isUserStatus(body.status) ? body.status : role === "admin" ? "approved" : "pending";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role, status },
    });

    if (error) throw error;

    if (data.user) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: data.user.id,
          email,
          role,
          status,
          approved_by: status === "approved" ? user.id : null,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        }, { onConflict: "user_id" });

      if (roleError) throw roleError;
    }

    return NextResponse.json({ user: data.user });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: statusForError(error) });
  }
}
