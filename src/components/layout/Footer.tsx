import React from "react";
import Link from "next/link";
import { FeatherIcon } from "@/components/brand/Logo";
import { BookHeart, PenTool, BookOpen, Sprout, ListTodo, Settings, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border-warm)] bg-[var(--bg-paper)]/80 text-xs text-[var(--text-muted)] transition-colors mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Motto */}
          <div className="space-y-1.5 max-w-sm">
            <div className="flex items-center gap-2">
              <FeatherIcon size={20} />
              <span className="font-literary font-semibold text-sm text-[var(--text-main)]">
                Inkling
              </span>
            </div>
            <p className="font-literary text-xs italic text-[var(--text-body)]">
              "For the thoughts that deserve a place to stay."
            </p>
          </div>

          {/* Sanctuary Navigation Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <Link
              href="/journal"
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
            >
              <BookHeart className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>My Journal</span>
            </Link>
            <Link
              href="/write"
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Write Studio</span>
            </Link>
            <Link
              href="/plans"
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
            >
              <ListTodo className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Little Plans</span>
            </Link>
            <Link
              href="/read"
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Reading Nook</span>
            </Link>
            <Link
              href="/vocabulary"
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Word Garden</span>
            </Link>
            <Link
              href="/settings"
              className="hover:text-[var(--text-main)] transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Sanctuary Settings</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Attribution Line */}
        <div className="pt-6 border-t border-[var(--border-warm)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
          <p>
            Inkling Sanctuary &bull; Private, reflective writing &amp; reading environment
          </p>
          <p className="flex items-center gap-1 font-medium text-[var(--text-main)]">
            Made with <span className="text-red-600" aria-label="love">❤️</span> by <span className="font-literary font-semibold">Saptyy</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
