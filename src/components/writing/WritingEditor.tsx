"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoodType, WritingFormat, WritingPrompt, WritingSession } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import { MoodSelector } from "./MoodSelector";
import {
  Sparkles,
  Save,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  HelpCircle,
  Check,
  RotateCcw,
} from "lucide-react";

interface WritingEditorProps {
  initialSession?: WritingSession | null;
  initialPrompt?: WritingPrompt | null;
}

export function WritingEditor({ initialSession, initialPrompt }: WritingEditorProps) {
  const router = useRouter();

  // State
  const [sessionId, setSessionId] = useState<string>(
    initialSession?.id || `session-${Date.now()}`
  );
  const [title, setTitle] = useState(initialSession?.title || "");
  const [content, setContent] = useState(initialSession?.content || "");
  const [mood, setMood] = useState<MoodType | null>(initialSession?.mood || initialPrompt?.mood || null);
  const [format, setFormat] = useState<WritingFormat>(
    initialSession?.format || initialPrompt?.format || "reflective_essay"
  );
  const [prompt, setPrompt] = useState<WritingPrompt | null>(initialPrompt || null);
  const [showPromptDrawer, setShowPromptDrawer] = useState<boolean>(Boolean(initialPrompt));

  // Metrics
  const [wordCount, setWordCount] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(
    initialSession?.durationSeconds || 0
  );
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate word count
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
  }, [content]);

  // Duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autosave mechanism (debounced 1.5s)
  useEffect(() => {
    if (!content && !title) return;

    setSaveStatus("unsaved");
    const handler = setTimeout(() => {
      setSaveStatus("saving");
      hybridStore.saveWritingSession({
        id: sessionId,
        title: title || "Untitled Reflection",
        content,
        mood: mood || undefined,
        format,
        durationSeconds,
        promptId: prompt?.id,
        promptTitle: prompt?.title,
        status: "draft",
      });
      setTimeout(() => setSaveStatus("saved"), 400);
    }, 1500);

    return () => clearTimeout(handler);
  }, [content, title, mood, format, durationSeconds, sessionId, prompt]);

  // Format writing duration into mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remainingM = m % 60;
      return `${h}h ${remainingM}m`;
    }
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // Formatting helpers
  const applyFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Submit writing for AI feedback
  const handleRequestReview = async () => {
    if (wordCount < 15) {
      alert("Please write at least 15 words before requesting feedback.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // 1. Ensure current draft is saved
      const session = hybridStore.saveWritingSession({
        id: sessionId,
        title: title || "Untitled Reflection",
        content,
        mood: mood || undefined,
        format,
        durationSeconds,
        promptId: prompt?.id,
        promptTitle: prompt?.title,
        status: "published",
      });

      // 2. Call AI Review API
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: session.title,
          content: session.content,
          format: session.format,
          mood: session.mood,
          promptText: prompt?.promptText,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Review service unavailable");
      }

      // 3. Save AI Review to store
      const aiReviewData = {
        id: `review-${sessionId}`,
        sessionId: session.id,
        overallStrengths: data.review.overallStrengths,
        areasForImprovement: data.review.areasForImprovement,
        clarityScore: data.review.clarityScore,
        coherenceObservations: data.review.coherenceObservations,
        vocabularyObservations: data.review.vocabularyObservations,
        sentenceStructureObservations: data.review.sentenceStructureObservations,
        nextSessionPriority: data.review.nextSessionPriority,
        recommendedExercise: data.review.recommendedExercise,
        rewrites: data.review.rewrites,
        contextualVocabulary: data.review.contextualVocabulary,
        issues: data.review.issues.map((issue: any, idx: number) => ({
          ...issue,
          id: `issue-${sessionId}-${idx}`,
          status: "pending",
        })),
        modelVersion: data.provider || "inkling_pedagogical_engine",
        createdAt: new Date().toISOString(),
      };

      hybridStore.saveAIReview(aiReviewData as any);

      // 4. Navigate to review page
      router.push(`/review/${session.id}`);
    } catch (err: any) {
      alert(`Could not generate review: ${err.message}`);
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col transition-all duration-300 ${
        isFocusMode ? "bg-paper fixed inset-0 z-50 p-6 sm:p-12 overflow-y-auto" : "py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full"
      }`}
    >
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-warm-border">
        {/* Autosave status & metrics */}
        <div className="flex items-center gap-4 text-xs text-ink-secondary">
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === "saved"
                  ? "bg-reading-ink"
                  : saveStatus === "saving"
                  ? "bg-creative-ink animate-pulse"
                  : "bg-spark-ink"
              }`}
            />
            {saveStatus === "saved" ? "Saved to drafts" : saveStatus === "saving" ? "Saving..." : "Unsaved changes"}
          </span>

          <span className="text-warm-border">•</span>

          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <strong className="text-ink-primary font-semibold">{wordCount}</strong> words
          </span>

          <span className="text-warm-border">•</span>

          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(durationSeconds)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-1.5 rounded-lg border border-warm-border hover:bg-warm-muted text-ink-secondary transition-colors"
            title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Focus Mode"}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleRequestReview}
            disabled={isSubmittingReview || wordCount < 15}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all ${
              wordCount >= 15
                ? "bg-coach-ink text-paper hover:bg-coach-ink/90 cursor-pointer"
                : "bg-warm-muted text-ink-secondary/60 cursor-not-allowed"
            }`}
          >
            {isSubmittingReview ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting AI Coach...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get AI Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Writing Prompt Drawer (Collapsible) */}
      {prompt && (
        <div className="mt-4 rounded-xl border border-creative-ink/30 bg-creative-wash p-4 sm:p-5 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-creative-ink mb-1">
                Writing Prompt • {prompt.mood}
              </span>
              <h2 className="font-editorial text-lg sm:text-xl font-semibold text-ink-primary">
                {prompt.title}
              </h2>
            </div>
            <button
              onClick={() => setShowPromptDrawer(!showPromptDrawer)}
              className="p-1 text-creative-ink hover:bg-creative-ink/10 rounded"
              title="Toggle Prompt Details"
            >
              {showPromptDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showPromptDrawer && (
            <div className="mt-3 pt-3 border-t border-creative-ink/20 space-y-2 text-sm text-ink-primary/90">
              <p className="font-editorial text-base leading-relaxed">{prompt.promptText}</p>
              {prompt.guidingQuestions && prompt.guidingQuestions.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-creative-ink block mb-1">
                    Guiding questions:
                  </span>
                  <ul className="list-disc list-inside text-xs text-ink-secondary space-y-1">
                    {prompt.guidingQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mood Selector (Optional) */}
      {!isFocusMode && (
        <div className="mt-4 pt-2">
          <MoodSelector
            selectedMood={mood}
            onSelectMood={(m) => setMood(m)}
            compact
          />
        </div>
      )}

      {/* Formatting Toolbar */}
      <div className="mt-4 flex items-center gap-1 py-1.5 px-2 bg-paper border border-warm-border rounded-lg text-xs text-ink-secondary w-fit shadow-2xs">
        <button
          onClick={() => applyFormat("**", "**")}
          className="px-2 py-1 hover:bg-warm-muted rounded font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => applyFormat("*", "*")}
          className="px-2 py-1 hover:bg-warm-muted rounded italic font-serif"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => applyFormat('> "', '"')}
          className="px-2 py-1 hover:bg-warm-muted rounded font-serif"
          title="Blockquote"
        >
          “”
        </button>
        <button
          onClick={() => applyFormat("- ")}
          className="px-2 py-1 hover:bg-warm-muted rounded"
          title="Bullet Point"
        >
          • List
        </button>
        <div className="w-[1px] h-4 bg-warm-border mx-1" />
        <span className="font-annotation text-ink-secondary text-xs px-1">
          Write freely. Do not edit until you finish.
        </span>
      </div>

      {/* Spacious Writing Surface */}
      <div className="mt-4 flex-1 flex flex-col bg-paper rounded-xl border border-warm-border p-6 sm:p-10 shadow-xs focus-within:border-coach-ink/40 transition-colors">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your reflection..."
          className="w-full font-editorial font-semibold text-2xl sm:text-3xl text-ink-primary placeholder:text-ink-secondary/40 border-none outline-none bg-transparent mb-4 focus:ring-0"
        />

        {/* Body Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin writing your thoughts here. Let sentences flow naturally without self-censoring..."
          className="w-full flex-1 min-h-[420px] font-editorial text-lg sm:text-[19px] leading-[1.75] text-ink-primary placeholder:text-ink-secondary/40 border-none outline-none bg-transparent resize-y focus:ring-0"
        />
      </div>

      {/* Bottom status note */}
      <div className="mt-3 flex items-center justify-between text-xs text-ink-secondary px-1">
        <span className="font-annotation italic text-sm">
          "The first draft is just you telling yourself the story."
        </span>
        <button
          onClick={() => {
            hybridStore.saveWritingSession({
              id: sessionId,
              title: title || "Untitled Reflection",
              content,
              mood: mood || undefined,
              format,
              durationSeconds,
              promptId: prompt?.id,
              promptTitle: prompt?.title,
              status: "draft",
            });
            setSaveStatus("saved");
          }}
          className="flex items-center gap-1 hover:text-ink-primary font-medium"
        >
          <Save className="w-3 h-3" /> Save manually
        </button>
      </div>
    </div>
  );
}
