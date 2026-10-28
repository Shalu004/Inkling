import React from "react";
import Link from "next/link";
import { FeatherIcon } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-warm-border bg-parchment/60 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatherIcon size={20} monochrome={false} />
          <div className="flex flex-col">
            <span className="font-editorial text-sm font-semibold text-ink-primary">
              Inkling
            </span>
            <span className="font-annotation text-xs text-ink-secondary italic">
              "Write freely. Learn gently."
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-secondary text-center sm:text-left">
          Find your thoughts. Find your voice. Private, editorial writing & reading workspace.
        </p>

        <div className="flex items-center gap-4 text-xs text-ink-secondary">
          <Link href="/settings" className="hover:text-ink-primary transition-colors">
            Preferences
          </Link>
          <span className="text-warm-border">•</span>
          <Link href="/explore" className="hover:text-ink-primary transition-colors">
            Prompts
          </Link>
          <span className="text-warm-border">•</span>
          <Link href="/progress" className="hover:text-ink-primary transition-colors">
            Analytics
          </Link>
        </div>
      </div>
    </footer>
  );
}
