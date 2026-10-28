import { Suspense } from "react";
import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Inkling Literary Sanctuary",
  description: "Reset your Inkling password.",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
      <Suspense fallback={<div className="max-w-md w-full mx-auto h-80 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
