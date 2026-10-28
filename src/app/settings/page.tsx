import React, { Suspense } from "react";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Loading sanctuary settings...
        </div>
      }
    >
      <SettingsView />
    </Suspense>
  );
}
