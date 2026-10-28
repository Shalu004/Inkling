import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WordGardenView } from "@/components/vocabulary/WordGardenView";

export default function VocabularyPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <WordGardenView />
      </main>
      <Footer />
    </div>
  );
}
