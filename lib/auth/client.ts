export async function getSession() {
  return null;
}

export async function getUser() {
  return {
    id: "open-access",
    email: "open-access@local.dev",
  };
}

export async function signOut() {
  if (typeof window !== "undefined") {
    window.location.assign("/");
  }
}
