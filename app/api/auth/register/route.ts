import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";
import { isUserStatus } from "@/lib/auth/role-utils";

const WRITER_DEFAULT_PASSWORD = process.env.WRITER_DEFAULT_PASSWORD ?? "12345678";
const AUTH_USERS_PAGE_SIZE = 1000;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isGmailAddress(email: string) {
  return email.endsWith("@gmail.com");
}

async function findAuthUserByEmail(
  supabase: ReturnType<typeof createServiceRoleClient>,
  email: string,
) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) throw error;

    const existingUser = data.users.find(user => user.email?.toLowerCase() === email);
    if (existingUser) return existingUser;
    if (data.users.length < AUTH_USERS_PAGE_SIZE) return null;

    page += 1;
  }
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
    const authResult = existingAuthUser
      ? await supabase.auth.admin.updateUserById(existingAuthUser.id, {
          password: WRITER_DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            ...(existingAuthUser.user_metadata ?? {}),
            role: "student",
            name,
          },
        })
      : await supabase.auth.admin.createUser({
          email,
          password: WRITER_DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: { role: "student", status: "pending", name },
        });

    const { data: authData, error: authError } = authResult;

    if (authError) throw authError;
    if (!authData.user) throw new Error("Unable to create writer expert account.");
    if (!existingAuthUser) createdUserId = authData.user.id;

    const { data: existingStudent, error: existingStudentError } = await supabase
      .from("students")
      .select("id, user_id")
      .ilike("email", email)
      .maybeSingle();

    if (existingStudentError) throw existingStudentError;

    if (existingStudent?.user_id && existingStudent.user_id !== authData.user.id) {
      throw new Error("This Gmail address is already linked to another writer login.");
    }

    let studentId: string;

    if (existingStudent) {
      const { error: linkStudentError } = await supabase
        .from("students")
        .update({ user_id: authData.user.id, name, email })
        .eq("id", existingStudent.id);

      if (linkStudentError) throw linkStudentError;
      studentId = existingStudent.id;
    } else {
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
      insertedStudentId = student.id;
      studentId = student.id;
    }

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
