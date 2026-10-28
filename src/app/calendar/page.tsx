import React, { Suspense } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Loading your calendar & memories...
        </div>
      }
    >
      <CalendarView />
    </Suspense>
  );
}
