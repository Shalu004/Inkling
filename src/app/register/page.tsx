import { Suspense } from "react";
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — Inkling Literary Sanctuary",
  description: "Create an account for your private literary sanctuary and journal.",
};

export default function RegisterPage() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="max-w-md w-full mx-auto h-96 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] animate-pulse" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
