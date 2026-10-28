import React, { Suspense } from "react";
import { ProgressView } from "@/components/progress/ProgressView";

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Reflecting on your journey...
        </div>
      }
    >
      <ProgressView />
    </Suspense>
  );
}
