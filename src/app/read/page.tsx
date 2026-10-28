import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReadingCornerView } from "@/components/reading/ReadingCornerView";

export default function ReadPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ReadingCornerView />
      </main>
      <Footer />
    </div>
  );
}
