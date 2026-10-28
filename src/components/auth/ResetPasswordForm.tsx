"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const { resetPassword } = useAuth();

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token.trim()) {
      setErrorMessage("Reset token is missing. Please request a new recovery link.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(password, token.trim());
      if (!res.success) {
        setErrorMessage(res.error || "Failed to reset password. The token may be expired or invalid.");
      } else {
        setIsDone(true);
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
          Set New Password
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Choose a secure password for your Inkling sanctuary.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--accent-burgundy)]/10 border border-[var(--accent-burgundy)]/25 text-[var(--accent-burgundy)] text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {isDone ? (
        <div className="space-y-5 text-center animate-fade-in py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--bg-botanical-light)] flex items-center justify-center text-[var(--accent-sage)]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-literary text-xl font-semibold text-[var(--text-main)]">
              Password Successfully Updated
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Your password has been changed. You can now sign in with your new credentials.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenFromUrl && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                Recovery Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)] focus:border-[var(--accent-sage)] transition-colors font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              New Password (minimum 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)] focus:border-[var(--accent-sage)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
                required
                minLength={8}
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
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
