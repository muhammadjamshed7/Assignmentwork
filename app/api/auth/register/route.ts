import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let supabase: ReturnType<typeof createServiceRoleClient> | null = null;
  let createdUserId: string | null = null;
  let createdStudentId: string | null = null;

  try {
    supabase = createServiceRoleClient();
    const body = await request.json();
    const name = asString(body.name);
    const email = asString(body.email).toLowerCase();
    const password = asString(body.password);

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "student", status: "pending", name },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Unable to create writer expert account.");
    createdUserId = authData.user.id;

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        user_id: authData.user.id,
        name,
        email,
        assigned_trainer: "Unassigned",
        overall_status: "Pending",
        priority: "Medium",
        progress: 0,
      })
      .select("id")
      .single();

    if (studentError) throw studentError;
    createdStudentId = student.id;

    const { error: roleError } = await supabase.from("user_roles").upsert({
      user_id: authData.user.id,
      email,
      role: "student",
      status: "pending",
      student_id: student.id,
    }, { onConflict: "user_id" });

    if (roleError) throw roleError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (supabase && createdStudentId) {
      try {
        await supabase.from("students").delete().eq("id", createdStudentId).throwOnError();
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
