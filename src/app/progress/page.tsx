import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProgressView } from "@/components/progress/ProgressView";

export default function ProgressPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ProgressView />
      </main>
      <Footer />
    </div>
  );
}
