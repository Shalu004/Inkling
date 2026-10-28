"use client";

import React, { useState, Suspense } from "react";
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
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

function SidebarContent({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/journal", label: "My Journal", icon: BookHeart, badge: "Diary" },
    { href: "/write", label: "Write", icon: PenTool },
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
    <div className="flex flex-col h-full justify-between p-5 bg-[#FFFCF5] border-r border-[#DED7C9]">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="pt-1 pb-4 border-b border-[#DED7C9]/70">
          <Logo size="md" href="/" />
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-[#777267] uppercase">
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
                      ? "bg-[#65745A] text-[#FFFCF5] shadow-xs font-semibold"
                      : "text-[#332F29] hover:bg-[#E5E6D9]/60 hover:text-[#485641]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        active ? "text-[#FFFCF5]" : "text-[#777267] group-hover:text-[#485641]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && !active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5E6D9] text-[#485641] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 pt-2">
          <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-[#777267] uppercase">
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
                      ? "bg-[#65745A] text-[#FFFCF5] shadow-xs font-semibold"
                      : "text-[#777267] hover:bg-[#E5E6D9]/60 hover:text-[#332F29]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? "text-[#FFFCF5]" : "text-[#777267] group-hover:text-[#332F29]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area: Quote & Settings */}
      <div className="pt-6 border-t border-[#DED7C9]/80 space-y-4">
        {/* Subtle literary motto */}
        <div className="px-3 py-2.5 rounded-lg bg-[#F5F0E6] border border-[#DED7C9]/60 text-center">
          <p className="font-handwritten text-sm text-[#485641] italic">
            "Read deeply. Write honestly."
          </p>
          <span className="text-[9px] text-[#777267] uppercase tracking-wider block mt-0.5">
            Inkling Sanctuary
          </span>
        </div>

        {/* Settings link */}
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            pathname === "/settings"
              ? "bg-[#65745A] text-[#FFFCF5] font-semibold"
              : "text-[#777267] hover:bg-[#E5E6D9]/60 hover:text-[#332F29]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4" />
            <span>Settings & Sanctuary</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-50" />
        </Link>
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
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FFFCF5] border-b border-[#DED7C9]">
        <Logo size="sm" href="/" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md text-[#332F29] hover:bg-[#E5E6D9] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#332F29]/40 backdrop-blur-xs transition-opacity"
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
        <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 bg-[#FFFCF5] border-r border-[#DED7C9]" />
      }
    >
      <SidebarContent {...props} />
    </Suspense>
  );
}
