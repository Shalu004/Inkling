"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  PenTool,
  BookOpen,
  Sparkles,
  Sprout,
  BarChart2,
  Compass,
  Calendar,
  Settings,
  Flame,
  Menu,
  X,
  Plus,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Get real streak from store
    const summary = hybridStore.getProgressSummary();
    setStreak(summary.streak);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/write", label: "Write", icon: PenTool },
    { href: "/vocabulary", label: "Word Garden", icon: Sprout },
    { href: "/read", label: "Reading Corner", icon: BookOpen },
    { href: "/spark", label: "2-Min Spark", icon: Sparkles },
    { href: "/progress", label: "Progress", icon: BarChart2 },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/calendar", label: "Calendar", icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-warm-border bg-parchment/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" href="/" />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-paper text-ink-primary shadow-xs border border-warm-border"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-warm-muted/60"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Daily streak indicator */}
          <Link
            href="/progress"
            title={streak > 0 ? `${streak} day writing streak` : "Start your writing streak today"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-spark-wash text-spark-ink border border-spark-ink/20 hover:bg-spark-wash/80 transition-all"
          >
            <Flame className="w-3.5 h-3.5 fill-spark-ink" />
            <span>{streak > 0 ? `${streak}d` : "0d"}</span>
          </Link>

          {/* Quick Write Button */}
          <Link
            href="/write"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-ink-primary text-paper hover:bg-ink-primary/90 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write</span>
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            title="Settings and preferences"
            className={`p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-warm-muted transition-colors ${
              pathname === "/settings" ? "bg-warm-muted text-ink-primary" : ""
            }`}
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-warm-muted transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-warm-border bg-paper px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-creative-wash text-creative-ink font-semibold"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-parchment"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
