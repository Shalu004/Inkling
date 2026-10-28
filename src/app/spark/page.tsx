import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TwoMinuteSparkView } from "@/components/spark/TwoMinuteSparkView";

export default function SparkPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <TwoMinuteSparkView />
      </main>
      <Footer />
    </div>
  );
}
