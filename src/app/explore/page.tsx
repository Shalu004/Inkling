import React, { Suspense } from "react";
import { ExploreView } from "@/components/explore/ExploreView";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Gathering literary discoveries...
        </div>
      }
    >
      <ExploreView />
    </Suspense>
  );
}
