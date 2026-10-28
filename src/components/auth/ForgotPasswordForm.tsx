"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessData(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email.trim());
      if (!res.success) {
        setErrorMessage(res.error || "Could not generate recovery instructions.");
      } else {
        setSuccessData({
          message: res.message || "Password recovery instructions generated.",
          resetToken: res.resetToken,
        });
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center pb-1">
          <Logo size="md" href="/" />
        </div>
        <h1 className="font-literary text-2xl sm:text-3xl font-semibold text-[var(--text-main)]">
          Recover Sanctuary Access
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Enter the email address registered with your account to reset your password.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--accent-burgundy)]/10 border border-[var(--accent-burgundy)]/25 text-[var(--accent-burgundy)] text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {successData ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[var(--bg-botanical-light)] border border-[var(--accent-sage)]/30 text-[var(--accent-olive)] text-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-sm">Recovery Link Ready</div>
              <div>{successData.message}</div>
            </div>
          </div>

          {successData.resetToken && (
            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] space-y-2">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Local Sanctuary Direct Recovery
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Because Inkling is running in local privacy mode, you can immediately continue to set a new password:
              </p>
              <Link
                href={`/reset-password?token=${encodeURIComponent(successData.resetToken)}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password Now</span>
              </Link>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-medium text-[var(--accent-sage)] hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="poet@inkling.sanctuary"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)] focus:border-[var(--accent-sage)] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-2 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing request...</span>
              </>
            ) : (
              <>
                <span>Generate Recovery Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-3 border-t border-[var(--border-warm)] text-center">
            <Link
              href="/login"
              className="text-xs font-medium text-[var(--accent-sage)] hover:underline"
            >
              Remembered your password? Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
