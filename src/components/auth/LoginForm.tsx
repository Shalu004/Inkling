"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { Feather, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, display warm welcome card
  if (user) {
    return (
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-sm text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-botanical-light)] flex items-center justify-center text-[var(--accent-sage)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)]">
            Welcome back, {user.displayName}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Your personal literary sanctuary is open and synchronized.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href={redirectUrl}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
          >
            <span>Enter Your Sanctuary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/profile"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-warm)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-all"
          >
            Manage Account & Profile
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || "Unable to sign in. Please verify your credentials.");
      } else {
        setSuccessMessage("Welcome back to Inkling.");
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center pb-1">
          <Logo size="md" href="/" />
        </div>
        <h1 className="font-literary text-2xl sm:text-3xl font-semibold text-[var(--text-main)]">
          Welcome to Your Sanctuary
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Sign in to access your persistent journal, private drafts, word garden, and reading shelf.
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--accent-burgundy)]/10 border border-[var(--accent-burgundy)]/25 text-[var(--accent-burgundy)] text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--bg-botanical-light)] border border-[var(--accent-sage)]/30 text-[var(--accent-olive)] text-xs animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[var(--text-main)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-[var(--accent-sage)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-2 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Opening your sanctuary...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="pt-4 border-t border-[var(--border-warm)] text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          Don&apos;t have an Inkling account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--accent-sage)] hover:underline"
          >
            Create your account
          </Link>
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <span>Continue as guest reader</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
