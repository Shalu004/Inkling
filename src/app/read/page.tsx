import React, { Suspense } from "react";
import { ReadingCornerView } from "@/components/reading/ReadingCornerView";

export default function ReadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Opening reading nook...
        </div>
      }
    >
      <ReadingCornerView />
    </Suspense>
  );
}
