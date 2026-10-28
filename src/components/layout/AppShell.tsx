"use client";

import React, { Suspense } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F0E6] text-[#332F29] selection:bg-[#D9DFCF]">
      <Suspense fallback={<aside className="w-64 bg-[#FFFCF5] border-r border-[#DED7C9] hidden md:block shrink-0 min-h-screen" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
