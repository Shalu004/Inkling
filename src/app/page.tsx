import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HomeDashboard />
      </main>
      <Footer />
    </div>
  );
}
