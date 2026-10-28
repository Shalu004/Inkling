import { Suspense } from "react";
import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Inkling Literary Sanctuary",
  description: "Recover access to your Inkling sanctuary account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="max-w-md w-full mx-auto h-80 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] animate-pulse" />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
