import { NextResponse } from "next/server";

import { isUserRole, isUserStatus } from "@/lib/auth/role-utils";
import { requireAdminRequest } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

type UserRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: UserRouteContext) {
  try {
    const { userId } = await context.params;
    const { user, supabase } = await requireAdminRequest();
    const body = await request.json();
    const role = isUserRole(body.role) ? body.role : undefined;
    const status = isUserStatus(body.status) ? body.status : undefined;

    if (!role && !status) {
      return NextResponse.json({ error: "Provide a valid role or status." }, { status: 400 });
    }

    if (user.id === userId && (role === "student" || status === "pending" || status === "rejected" || status === "disabled")) {
      return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("user_roles")
      .select("email, role, status, student_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) throw existingError;

    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId);

    if (authUserError) throw authUserError;

    const email = existing?.email ?? authUser.user?.email ?? null;

    if (!email) {
      return NextResponse.json({ error: "Unable to find an email address for this user." }, { status: 400 });
    }

    const nextRole = role ?? existing?.role ?? "student";
    const nextStatus = status ?? existing?.status ?? "pending";
    const approvalFields = status === "approved"
      ? { approved_by: user.id, approved_at: new Date().toISOString() }
      : status
        ? { approved_by: null, approved_at: null }
        : {};

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: userId,
        email,
        student_id: existing?.student_id ?? null,
        role: nextRole,
        status: nextStatus,
        ...approvalFields,
      }, { onConflict: "user_id" });

    if (roleError) throw roleError;

    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...(authUser.user?.user_metadata ?? {}),
        role: nextRole,
        status: nextStatus,
      },
    });

    if (metadataError) throw metadataError;

    return NextResponse.json({
      user: {
        id: userId,
        role: nextRole,
        status: nextStatus,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 403 });
  }
}

export async function DELETE(_request: Request, context: UserRouteContext) {
  try {
    const { userId } = await context.params;
    const { user, supabase } = await requireAdminRequest();

    if (user.id === userId) {
      return NextResponse.json({ error: "You cannot remove your own account." }, { status: 400 });
    }

    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 403 });
  }
}
