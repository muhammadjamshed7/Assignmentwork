import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { isUserRole, isUserStatus } from "@/lib/auth/role-utils";
import { AuthRequestError, requireAdminRequest } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

const WRITER_DEFAULT_PASSWORD = process.env.WRITER_DEFAULT_PASSWORD ?? "12345678";
const AUTH_USERS_PAGE_SIZE = 1000;

function statusForError(error: unknown) {
  return error instanceof AuthRequestError ? error.status : 500;
}

function writerNameFromEmail(email: string) {
  return email.split("@", 1)[0] || "Writer";
}

function isGmailAddress(email: string) {
  return email.endsWith("@gmail.com");
}

async function listAllAuthUsers(supabase: Awaited<ReturnType<typeof requireAdminRequest>>["supabase"]) {
  const users: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) throw error;
    users.push(...data.users);

    if (data.users.length < AUTH_USERS_PAGE_SIZE) break;
    page += 1;
  }

  return users;
}

async function findAuthUserByEmail(
  supabase: Awaited<ReturnType<typeof requireAdminRequest>>["supabase"],
  email: string,
) {
  const users = await listAllAuthUsers(supabase);
  return users.find(user => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function ensureWriterStudent(
  supabase: Awaited<ReturnType<typeof requireAdminRequest>>["supabase"],
  input: { userId: string; email: string },
) {
  const { data: studentByUserId, error: studentByUserIdError } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (studentByUserIdError) throw studentByUserIdError;
  if (studentByUserId) return studentByUserId.id;

  const { data: studentByEmail, error: studentByEmailError } = await supabase
    .from("students")
    .select("id, user_id")
    .ilike("email", input.email)
    .maybeSingle();

  if (studentByEmailError) throw studentByEmailError;

  if (studentByEmail) {
    if (studentByEmail.user_id && studentByEmail.user_id !== input.userId) {
      throw new Error("This writer email is already linked to another login.");
    }

    const { error: linkError } = await supabase
      .from("students")
      .update({ user_id: input.userId, email: input.email })
      .eq("id", studentByEmail.id);

    if (linkError) throw linkError;
    return studentByEmail.id;
  }

  const { data: createdStudent, error: createStudentError } = await supabase
    .from("students")
    .insert({
      user_id: input.userId,
      name: writerNameFromEmail(input.email),
      email: input.email,
      assigned_trainer: "Unassigned",
      overall_status: "Pending",
      priority: "Medium",
      progress: 0,
    })
    .select("id")
    .single();

  if (createStudentError) throw createStudentError;
  return createdStudent.id;
}

export async function GET() {
  try {
    const { supabase } = await requireAdminRequest();
    const [authUsers, { data: roles, error: rolesError }] = await Promise.all([
      listAllAuthUsers(supabase),
      supabase.from("user_roles").select("user_id, email, role, status, student_id, created_at, approved_at"),
    ]);

    if (rolesError) throw rolesError;

    const rolesByUserId = new Map((roles ?? []).map(row => [String(row.user_id), row]));
    const users = authUsers.map(user => {
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
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = isUserRole(body.role) ? body.role : "student";
    const status = isUserStatus(body.status) ? body.status : role === "admin" ? "approved" : "pending";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (role === "student" && !isGmailAddress(email)) {
      return NextResponse.json({ error: "Writer email must be a Gmail address." }, { status: 400 });
    }

    const existingAuthUser = await findAuthUserByEmail(supabase, email);
    const authResult = role === "student"
      ? existingAuthUser
        ? await supabase.auth.admin.updateUserById(existingAuthUser.id, {
            password: WRITER_DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
              ...(existingAuthUser.user_metadata ?? {}),
              role,
              status,
            },
          })
        : await supabase.auth.admin.createUser({
            email,
            password: WRITER_DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { role, status },
          })
      : await supabase.auth.admin.inviteUserByEmail(email, {
          data: { role, status },
        });

    const { data, error } = authResult;

    if (error) throw error;

    if (data.user) {
      const studentId = role === "student"
        ? await ensureWriterStudent(supabase, { userId: data.user.id, email })
        : null;

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: data.user.id,
          email,
          role,
          status,
          student_id: studentId,
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
