import React, { Suspense } from "react";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Welcome to your sanctuary...
        </div>
      }
    >
      <HomeDashboard />
    </Suspense>
  );
}
