import { NextResponse } from "next/server";

import { isUserRole } from "@/lib/auth/role-utils";
import { requireAdminRequest } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

type UserRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: UserRouteContext) {
  try {
    const { userId } = await context.params;
    const { supabase } = await requireAdminRequest();
    const body = await request.json();
    const role = isUserRole(body.role) ? body.role : null;

    if (!role) {
      return NextResponse.json({ error: "Role must be admin or viewer." }, { status: 400 });
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id" });

    if (roleError) throw roleError;

    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });

    if (metadataError) throw metadataError;

    return NextResponse.json({ role });
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
