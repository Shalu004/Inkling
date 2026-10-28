import React from "react";
import { LittlePlansView } from "@/components/plans/LittlePlansView";

export const metadata = {
  title: "Little Plans • Inkling Sanctuary",
  description: "Personal planning notebook for gentle writing, reading, and sanctuary intentions.",
};

export default function PlansPage() {
  return (
    <div className="flex-1 flex flex-col">
      <LittlePlansView />
    </div>
  );
}
