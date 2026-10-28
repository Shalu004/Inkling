"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Logo } from "@/components/brand/Logo";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const { user, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (user) {
    return (
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-sm text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-botanical-light)] flex items-center justify-center text-[var(--accent-sage)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)]">
            You Are Signed In
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            You are currently writing as <span className="font-medium text-[var(--text-main)]">{user.displayName}</span> ({user.email}).
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
          >
            <span>Return to Sanctuary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/profile"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-warm)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-all"
          >
            Sanctuary Profile & Settings
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name or pen name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(name.trim(), email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || "Unable to create account.");
      } else {
        setSuccessMessage("Your literary sanctuary has been created.");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 400);
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
          Create Your Sanctuary
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Open a personal digital notebook with persistent cloud synchronization, private journals, and custom literary themes.
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
            Your Name or Pen Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Virginia Woolf or E. Dickinson"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)] focus:border-[var(--accent-sage)] transition-colors"
            />
          </div>
        </div>

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
          <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
            Password (minimum 8 characters)
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
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)] focus:border-[var(--accent-sage)] transition-colors"
            />
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--bg-sage-surface)] text-[11px] text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-sage)] shrink-0 mt-0.5" />
          <span>Passwords are cryptographically salted and hashed using scrypt. Your personal writing space is completely private and isolated.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-2 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating your sanctuary...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-[var(--border-warm)] text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--accent-sage)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
