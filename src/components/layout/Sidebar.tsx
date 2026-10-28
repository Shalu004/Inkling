"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  Home,
  BookHeart,
  PenTool,
  BookMarked,
  Library,
  Compass,
  Sprout,
  Sparkles,
  Calendar,
  BarChart2,
  Settings,
  Menu,
  X,
  ChevronRight,
  Palette,
  Check,
  ListTodo,
} from "lucide-react";
import { ThemeType } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";

interface SidebarProps {
  className?: string;
}

const THEME_SWATCHES: Array<{ id: ThemeType; name: string; bg: string; dot: string }> = [
  { id: "linen", name: "Linen", bg: "#F5F0E6", dot: "#58694E" },
  { id: "sage", name: "Sage", bg: "#E7ECE3", dot: "#445A3E" },
  { id: "midnight", name: "Midnight", bg: "#151715", dot: "#98B48C" },
  { id: "sepia", name: "Sepia", bg: "#EFE5D3", dot: "#6E4F32" },
  { id: "rose", name: "Rose", bg: "#F4EAEB", dot: "#6E3E49" },
  { id: "pure_light", name: "Pure Light", bg: "#F7F7F8", dot: "#445942" },
];

function SidebarContent({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("linen");
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);

  useEffect(() => {
    setCurrentTheme(hybridStore.getTheme());
  }, []);

  const handleSelectTheme = (themeId: ThemeType) => {
    setCurrentTheme(themeId);
    hybridStore.setTheme(themeId);
    setThemePopoverOpen(false);
  };

  const mainNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/journal", label: "My Journal", icon: BookHeart, badge: "Diary" },
    { href: "/write", label: "Write", icon: PenTool },
    { href: "/plans", label: "Little Plans", icon: ListTodo },
    { href: "/read", label: "Reading Nook", icon: BookMarked },
    { href: "/library", label: "My Library", icon: Library },
    { href: "/explore", label: "Explore & Discover", icon: Compass },
    { href: "/vocabulary", label: "Word Garden", icon: Sprout },
    { href: "/spark", label: "Two-Minute Spark", icon: Sparkles },
    { href: "/calendar", label: "Calendar & Memories", icon: Calendar },
  ];

  const secondaryNavItems = [
    { href: "/progress", label: "Progress", icon: BarChart2 },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 bg-[var(--bg-paper)] border-r border-[var(--border-warm)] transition-colors duration-200 overflow-hidden">
      {/* Brand Header & Navigation (scrollable on compact screens) */}
      <div className="space-y-5 overflow-y-auto pr-1 flex-1 min-h-0 custom-scrollbar">
        <div className="pt-1 pb-3 border-b border-[var(--border-warm)]/70">
          <Logo size="md" href="/" />
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Sanctuary
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-[var(--accent-sage)] text-[#FFFCF5] shadow-xs font-semibold"
                      : "text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] hover:text-[var(--accent-olive)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? "text-[#FFFCF5]" : "text-[var(--text-muted)] group-hover:text-[var(--accent-olive)]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && !active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 pt-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Reflections
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-[var(--accent-sage)] text-[#FFFCF5] shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-[#FFFCF5]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area: Settings & Theme Shortcut */}
      <div className="pt-3 mt-2 border-t border-[var(--border-warm)]/80 relative shrink-0">

        {/* Theme Shortcut Popover */}
        {themePopoverOpen && (
          <div className="absolute bottom-16 left-2 right-2 p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-xl z-50 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-main)]">
              <span>Sanctuary Theme</span>
              <button
                type="button"
                onClick={() => setThemePopoverOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {THEME_SWATCHES.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => handleSelectTheme(sw.id)}
                  title={sw.name}
                  className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                    currentTheme === sw.id
                      ? "border-[var(--accent-sage)] bg-[var(--bg-botanical-light)] ring-1 ring-[var(--accent-sage)]"
                      : "border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
                  }`}
                  style={{ backgroundColor: sw.bg }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: sw.dot }}
                  />
                  <span className="text-[9px] font-medium text-[var(--text-main)] truncate max-w-full">
                    {sw.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions row */}
        <div className="flex items-center justify-between gap-1 text-xs">
          {/* Settings link */}
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              pathname === "/settings"
                ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)] hover:text-[var(--text-main)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </Link>

          {/* Discreet Theme Palette Button */}
          <button
            type="button"
            onClick={() => setThemePopoverOpen(!themePopoverOpen)}
            title={`Current theme: ${currentTheme}. Click to switch theme`}
            className={`p-2 rounded-lg border transition-all ${
              themePopoverOpen
                ? "bg-[var(--accent-sage)] text-[#FFFCF5] border-[var(--accent-sage)]"
                : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30 ${className}`}>
        {navContent}
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--bg-paper)] border-b border-[var(--border-warm)] transition-colors">
        <Logo size="sm" href="/" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThemePopoverOpen(!themePopoverOpen)}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-warm)]"
            aria-label="Toggle theme"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-md text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense
      fallback={
        <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 bg-[var(--bg-paper)] border-r border-[var(--border-warm)]" />
      }
    >
      <SidebarContent {...props} />
    </Suspense>
  );
}
