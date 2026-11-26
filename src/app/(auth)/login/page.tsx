import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="rounded-[20px] px-6 py-8 sm:px-10 sm:py-10 short:py-7">
      <div className="mb-7 short:mb-5">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-fg sm:text-[2rem]">Welcome Back</h1>
        <p className="mt-1.5 text-[0.9375rem] text-fg-muted">Sign in to your Inland administration account.</p>
      </div>
      <LoginForm />
    </Card>
  );
}
