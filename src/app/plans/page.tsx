import React from "react";
import { LittlePlansView } from "@/components/plans/LittlePlansView";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Little Plans • Inkling Sanctuary",
  description: "Personal planning notebook for gentle writing, reading, and sanctuary intentions.",
};

export default function PlansPage() {
  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen">
      <LittlePlansView />
      <Footer />
    </div>
  );
}

