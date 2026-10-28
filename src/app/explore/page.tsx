import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExploreView } from "@/components/explore/ExploreView";

export default function ExplorePage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ExploreView />
      </main>
      <Footer />
    </div>
  );
}
