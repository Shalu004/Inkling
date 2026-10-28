"use client";

import React, { Suspense } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-[var(--bg-botanical-light)] transition-colors duration-200">
      <Suspense fallback={<aside className="w-64 bg-[var(--bg-paper)] border-r border-[var(--border-warm)] hidden md:block shrink-0 min-h-screen" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
