import React, { Suspense } from "react";
import { TwoMinuteSparkView } from "@/components/spark/TwoMinuteSparkView";

export default function SparkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Kindling your daily spark...
        </div>
      }
    >
      <TwoMinuteSparkView />
    </Suspense>
  );
}
