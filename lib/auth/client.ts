import { requireSupabase } from "@/lib/data/client";

export async function getSession() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getUser() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function signOut() {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}
