import React, { Suspense } from "react";
import { WordGardenView } from "@/components/vocabulary/WordGardenView";

export default function VocabularyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Cultivating your word garden...
        </div>
      }
    >
      <WordGardenView />
    </Suspense>
  );
}
