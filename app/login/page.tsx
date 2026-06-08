import { LoginCard } from "@/components/auth/login-card";

export default function LoginPage() {
  return (
    <LoginCard
      mode={{
        expectedRole: "student",
        title: "Writer Expert Login",
        description: "Use your approved writer expert account to continue.",
        roleError: "This login is for writer experts. Admins must use /admin/login.",
        alternateHref: "/register",
        alternateLabel: "Register here",
        alternateText: "Writer expert account not approved yet?",
      }}
    />
  );
}
