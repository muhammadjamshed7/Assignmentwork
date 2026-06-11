import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";
import { isUserStatus } from "@/lib/auth/role-utils";
import {
  ensureWriterStudent,
  findAuthUserByEmail,
  isGmailAddress,
  WRITER_DEFAULT_PASSWORD,
} from "@/lib/auth/writers";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let supabase: ReturnType<typeof createServiceRoleClient> | null = null;
  let createdUserId: string | null = null;
  let insertedStudentId: string | null = null;

  try {
    const body = await request.json();
    const name = asString(body.name);
    const email = asString(body.email).toLowerCase();

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (!isGmailAddress(email)) {
      return NextResponse.json({ error: "Writer accounts must use a Gmail address." }, { status: 400 });
    }

    if (WRITER_DEFAULT_PASSWORD.length < 6) {
      return NextResponse.json({ error: "Writer default password must be at least 6 characters." }, { status: 500 });
    }

    supabase = createServiceRoleClient();

    const existingAuthUser = await findAuthUserByEmail(supabase, email);
    if (existingAuthUser) {
      return NextResponse.json({
        error: "This writer login already exists. Please sign in from /login or ask an admin to approve it.",
      }, { status: 409 });
    }

    const authResult = await supabase.auth.admin.createUser({
      email,
      password: WRITER_DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "student", status: "pending", name },
    });

    const { data: authData, error: authError } = authResult;

    if (authError) throw authError;
    if (!authData.user) throw new Error("Unable to create writer expert account.");
    createdUserId = authData.user.id;

    const { studentId, created } = await ensureWriterStudent(supabase, {
      userId: authData.user.id,
      email,
      name,
    });

    if (created) insertedStudentId = studentId;

    const { data: existingRole, error: existingRoleError } = await supabase
      .from("user_roles")
      .select("status")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (existingRoleError) throw existingRoleError;

    const status = isUserStatus(existingRole?.status) ? existingRole.status : "pending";

    const { error: roleError } = await supabase.from("user_roles").upsert({
      user_id: authData.user.id,
      email,
      role: "student",
      status,
      student_id: studentId,
    }, { onConflict: "user_id" });

    if (roleError) throw roleError;

    const { error: metadataError } = await supabase.auth.admin.updateUserById(authData.user.id, {
      user_metadata: {
        ...(authData.user.user_metadata ?? {}),
        role: "student",
        status,
        name,
      },
    });

    if (metadataError) throw metadataError;

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    if (supabase && insertedStudentId) {
      try {
        await supabase.from("students").delete().eq("id", insertedStudentId).throwOnError();
      } catch {
        // Best-effort rollback; keep the original registration error.
      }
    }

    if (supabase && createdUserId) {
      await supabase.auth.admin.deleteUser(createdUserId).catch(() => undefined);
    }

    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
