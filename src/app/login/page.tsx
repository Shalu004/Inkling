import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Inkling Literary Sanctuary",
  description: "Sign in to your personal literary sanctuary and journal.",
};

export default function LoginPage() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="max-w-md w-full mx-auto h-96 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
