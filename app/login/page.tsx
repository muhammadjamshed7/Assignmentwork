import { LoginCard } from "@/components/auth/login-card";

export default function LoginPage() {
  return (
    <LoginCard
      mode={{
        expectedRole: "student",
        title: "Student Login",
        description: "Use your approved student account to continue.",
        roleError: "This login is for students. Admins must use /admin/login.",
        alternateHref: "/register",
        alternateLabel: "Register here",
        alternateText: "Student account not approved yet?",
      }}
    />
  );
}
