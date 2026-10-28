import React, { Suspense } from "react";
import { JournalView } from "@/components/journal/JournalView";

export default function JournalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-literary">
          Opening your journal...
        </div>
      }
    >
      <JournalView />
    </Suspense>
  );
}
