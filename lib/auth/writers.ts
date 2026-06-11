import type { User } from "@supabase/supabase-js";

import { createServiceRoleClient } from "@/lib/auth/server";

export const WRITER_DEFAULT_PASSWORD = "12345678";

const AUTH_USERS_PAGE_SIZE = 1000;

type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

export function isGmailAddress(email: string) {
  return email.toLowerCase().endsWith("@gmail.com");
}

export function writerNameFromEmail(email: string) {
  return email.split("@", 1)[0] || "Writer";
}

export function writerNameFromAuthUser(authUser: User | null | undefined, email: string) {
  const metadataName = authUser?.user_metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();

  return writerNameFromEmail(email);
}

export async function listAllAuthUsers(supabase: ServiceRoleClient) {
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

export async function findAuthUserByEmail(supabase: ServiceRoleClient, email: string) {
  const users = await listAllAuthUsers(supabase);
  return users.find(user => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function ensureWriterStudent(
  supabase: ServiceRoleClient,
  input: {
    userId: string;
    email: string;
    name?: string;
    authUser?: User | null;
    existingStudentId?: string | null;
  },
) {
  if (input.existingStudentId) {
    const { data: existingLinkedStudent, error: existingLinkedStudentError } = await supabase
      .from("students")
      .select("id, user_id")
      .eq("id", input.existingStudentId)
      .maybeSingle();

    if (existingLinkedStudentError) throw existingLinkedStudentError;
    if (existingLinkedStudent?.user_id === input.userId) {
      return { studentId: existingLinkedStudent.id, created: false };
    }
  }

  const { data: studentByUserId, error: studentByUserIdError } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (studentByUserIdError) throw studentByUserIdError;
  if (studentByUserId) return { studentId: studentByUserId.id, created: false };

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
    return { studentId: studentByEmail.id, created: false };
  }

  const { data: createdStudent, error: createStudentError } = await supabase
    .from("students")
    .insert({
      user_id: input.userId,
      name: input.name?.trim() || writerNameFromAuthUser(input.authUser, input.email),
      email: input.email,
      assigned_trainer: "Unassigned",
      overall_status: "Pending",
      priority: "Medium",
      progress: 0,
    })
    .select("id")
    .single();

  if (createStudentError) throw createStudentError;
  return { studentId: createdStudent.id, created: true };
}
