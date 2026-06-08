import { LoginCard } from "@/components/auth/login-card";

export default function AdminLoginPage() {
  return (
    <LoginCard
      mode={{
        expectedRole: "admin",
        title: "Admin Login",
        description: "Use your approved admin account to manage TDS operations.",
        roleError: "This login is for admins. Writer experts must use /login.",
        alternateHref: "/login",
        alternateLabel: "Writer expert login",
        alternateText: "Signing in as a writer expert?",
      }}
    />
  );
}
