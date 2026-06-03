import { LoginCard } from "@/components/auth/login-card";

export default function AdminLoginPage() {
  return (
    <LoginCard
      mode={{
        expectedRole: "admin",
        title: "Admin Login",
        description: "Use your approved admin account to manage TDS operations.",
        roleError: "This login is for admins. Students must use /login.",
        alternateHref: "/login",
        alternateLabel: "Student login",
        alternateText: "Signing in as a student?",
      }}
    />
  );
}
