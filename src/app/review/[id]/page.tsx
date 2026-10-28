"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Loading reflection review...
        </div>
      ) : !session || !review ? (
        <div className="max-w-md mx-auto my-16 p-8 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] text-center space-y-4">
          <Sparkles className="w-8 h-8 text-[#65745A] mx-auto" />
          <h2 className="font-serif text-2xl font-normal text-[#332F29]">
            Review Not Found
          </h2>
          <p className="text-xs text-[#777267] leading-relaxed">
            We couldn't locate a completed AI review for this session. You can request a review directly from the writing workspace.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/write"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641] transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Go to Editor</span>
            </Link>
          </div>
        </div>
      ) : (
        <ReviewPanel session={session} review={review} />
      )}
    </div>
  );
}

export default function ReviewDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Loading Inkling review...
        </div>
      }
    >
      <ReviewDetailPageInner />
    </Suspense>
  );
}
