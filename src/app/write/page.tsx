"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WritingEditor } from "@/components/writing/WritingEditor";
import { hybridStore } from "@/lib/store/hybridStore";
import { CURATED_PROMPTS } from "@/lib/curated/data";
import { WritingPrompt, WritingSession } from "@/types";

function WritePageInner() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const promptIdParam = searchParams.get("promptId");

  const [initialSession, setInitialSession] = useState<WritingSession | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<WritingPrompt | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (idParam) {
      const existing = hybridStore.getWritingSessionById(idParam);
      if (existing) {
        setInitialSession(existing);
      }
    }

    if (promptIdParam) {
      const p = CURATED_PROMPTS.find((item) => item.id === promptIdParam);
      if (p) {
        setInitialPrompt(p);
      }
    }

    setLoaded(true);
  }, [idParam, promptIdParam]);

  return (
    <div className="flex-1 flex flex-col">
      {!loaded ? (
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Opening writing workspace...
        </div>
      ) : (
        <WritingEditor
          initialSession={initialSession}
          initialPrompt={initialPrompt}
        />
      )}
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#777267] text-xs font-serif italic">
          Loading editor...
        </div>
      }
    >
      <WritePageInner />
    </Suspense>
  );
}
