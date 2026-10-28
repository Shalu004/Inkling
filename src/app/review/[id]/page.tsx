"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { hybridStore } from "@/lib/store/hybridStore";
import { WritingSession, AIReview } from "@/types";
import { Sparkles, ArrowLeft, PenTool } from "lucide-react";

function ReviewDetailPageInner() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<WritingSession | null>(null);
  const [review, setReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      const s = hybridStore.getWritingSessionById(sessionId);
      const r = hybridStore.getAIReviewBySessionId(sessionId);
      setSession(s);
      setReview(r);
    }
    setLoading(false);
  }, [sessionId]);

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-ink-secondary text-xs">
            Loading review...
          </div>
        ) : !session || !review ? (
          <div className="max-w-md mx-auto my-16 p-8 rounded-xl border border-warm-border bg-paper text-center space-y-4">
            <Sparkles className="w-8 h-8 text-coach-ink mx-auto" />
            <h2 className="font-editorial text-2xl font-bold text-ink-primary">
              Review Not Found
            </h2>
            <p className="text-xs text-ink-secondary leading-relaxed">
              We couldn't locate a completed AI review for this session. You can request a review directly from the writing workspace.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/write"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ink-primary text-paper text-xs font-semibold"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Go to Editor</span>
              </Link>
            </div>
          </div>
        ) : (
          <ReviewPanel session={session} review={review} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ReviewDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-parchment flex items-center justify-center text-xs text-ink-secondary">
          Loading Inkling review...
        </div>
      }
    >
      <ReviewDetailPageInner />
    </Suspense>
  );
}
