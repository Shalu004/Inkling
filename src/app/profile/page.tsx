import { Suspense } from "react";
import { Metadata } from "next";
import { ProfileView } from "@/components/auth/ProfileView";

export const metadata: Metadata = {
  title: "Sanctuary Profile & Account — Inkling",
  description: "Manage your Inkling account profile, cloud synchronization, and data sovereignty.",
};

export default function ProfilePage() {
  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 animate-pulse" />}>
        <ProfileView />
      </Suspense>
    </div>
  );
}
