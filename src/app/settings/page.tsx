import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SettingsView } from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <SettingsView />
      </main>
      <Footer />
    </div>
  );
}
