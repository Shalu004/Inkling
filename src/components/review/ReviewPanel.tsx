"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WritingSession, AIReview, WritingIssue } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Check,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
  Plus,
  CheckCircle,
  HelpCircle,
  Award,
  Layers,
  FileText,
  RotateCcw,
} from "lucide-react";

interface ReviewPanelProps {
  session: WritingSession;
  review: AIReview;
}

export function ReviewPanel({ session, review: initialReview }: ReviewPanelProps) {
  const [review, setReview] = useState<AIReview>(initialReview);
  const [activeTab, setActiveTab] = useState<"analysis" | "comparison" | "rewrites">("analysis");
  const [selectedRewrite, setSelectedRewrite] = useState<"natural" | "concise" | "expressive" | "formal">("natural");
  const [savedVocabWords, setSavedVocabWords] = useState<Record<string, boolean>>({});

  // Accept an individual suggestion
  const handleAcceptIssue = (issueId: string) => {
    hybridStore.updateIssueStatus(session.id, issueId, "accepted");
    setReview((prev) => ({
      ...prev,
      issues: prev.issues.map((i) => (i.id === issueId ? { ...i, status: "accepted" } : i)),
    }));
  };

  // Reject an individual suggestion
  const handleRejectIssue = (issueId: string) => {
    hybridStore.updateIssueStatus(session.id, issueId, "rejected");
    setReview((prev) => ({
      ...prev,
      issues: prev.issues.map((i) => (i.id === issueId ? { ...i, status: "rejected" } : i)),
    }));
  };

  // Save contextual word to Word Garden
  const handleSaveToWordGarden = (vocab: AIReview["contextualVocabulary"][0]) => {
    hybridStore.saveVocabulary({
      word: vocab.word,
      partOfSpeech: vocab.partOfSpeech,
      definition: vocab.definition,
      exampleSentence: `From reflection "${session.title}": ${vocab.context}`,
      contextualNuance: vocab.nuance,
      sourceContext: session.title,
      sourceType: "writing_coach",
      status: "learning",
    });

    setSavedVocabWords((prev) => ({ ...prev, [vocab.word]: true }));
  };

  // Build the accepted revision text without mutating original session content
  const computeRevisedText = () => {
    let revised = session.content;
    review.issues
      .filter((i) => i.status === "accepted")
      .forEach((issue) => {
        if (issue.originalExcerpt && issue.suggestedCorrection) {
          revised = revised.replace(issue.originalExcerpt, issue.suggestedCorrection);
        }
      });
    return revised;
  };

  const pendingIssues = review.issues.filter((i) => i.status === "pending");
  const acceptedIssues = review.issues.filter((i) => i.status === "accepted");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-coach-ink mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Writing Coach • Comprehensive Pedagogical Review</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-ink-primary">
            {session.title || "Untitled Reflection"}
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            {session.wordCount} words • Completed on {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/write?id=${session.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-warm-border bg-paper hover:bg-warm-muted text-ink-primary transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>

          <Link
            href="/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-ink-primary text-paper hover:bg-ink-primary/90 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Writing</span>
          </Link>
        </div>
      </div>

      {/* Top Pedagogical Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Clarity Score */}
        <div className="p-5 rounded-xl border border-coach-ink/20 bg-coach-wash flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-coach-ink">
            Clarity & Flow Score
          </span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-bold text-coach-ink">
              {review.clarityScore}
            </span>
            <span className="text-xs text-coach-ink/70">/ 100</span>
          </div>
          <p className="text-xs text-coach-ink/80">
            {review.clarityScore >= 90
              ? "Exemplary precision and transparent prose cadence."
              : "Clear expression with opportunities to refine sentence momentum."}
          </p>
        </div>

        {/* Priority Focus */}
        <div className="md:col-span-3 p-5 rounded-xl border border-warm-border bg-paper flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-creative-ink">
            <Award className="w-4 h-4" />
            <span>Priority for Next Session</span>
          </div>
          <p className="font-editorial text-lg text-ink-primary my-2 leading-relaxed">
            {review.nextSessionPriority}
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <span className="font-annotation text-sm text-coach-ink">
              "Write freely. Learn gently."
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-warm-border">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "analysis"
              ? "border-coach-ink text-coach-ink bg-coach-wash/40"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          Educational Analysis ({review.issues.length} notes)
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "comparison"
              ? "border-coach-ink text-coach-ink bg-coach-wash/40"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          Side-by-Side Comparison
        </button>
        <button
          onClick={() => setActiveTab("rewrites")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "rewrites"
              ? "border-coach-ink text-coach-ink bg-coach-wash/40"
              : "border-transparent text-ink-secondary hover:text-ink-primary"
          }`}
        >
          Alternative Expressions & Rewrites
        </button>
      </div>

      {/* TAB 1: EDUCATIONAL ANALYSIS */}
      {activeTab === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Issues & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-xl font-semibold text-ink-primary">
                Specific Suggestions & Principles
              </h2>
              <span className="text-xs text-ink-secondary">
                {acceptedIssues.length} of {review.issues.length} accepted
              </span>
            </div>

            {review.issues.length === 0 ? (
              <div className="p-8 rounded-xl border border-warm-border bg-paper text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-reading-ink mx-auto" />
                <h3 className="font-editorial text-lg font-semibold text-ink-primary">
                  No structural issues identified
                </h3>
                <p className="text-xs text-ink-secondary max-w-md mx-auto">
                  Your piece demonstrates clean mechanics and consistent grammar. Review the
                  strengths and stylistic rewrites to explore different aesthetic tones.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {review.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-5 rounded-xl border transition-all ${
                      issue.status === "accepted"
                        ? "bg-reading-wash/60 border-reading-ink/30"
                        : issue.status === "rejected"
                        ? "bg-warm-muted/40 border-warm-border opacity-60"
                        : "bg-paper border-warm-border hover:border-coach-ink/40 shadow-xs"
                    }`}
                  >
                    {/* Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-coach-wash text-coach-ink border border-coach-ink/20">
                          {issue.category.replace(/_/g, " ")}
                        </span>
                        {issue.isStylistic && (
                          <span className="text-[10px] font-medium text-ink-secondary">
                            Stylistic alternative
                          </span>
                        )}
                      </div>

                      {issue.status === "accepted" ? (
                        <span className="text-xs font-semibold text-reading-ink flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Accepted
                        </span>
                      ) : issue.status === "rejected" ? (
                        <span className="text-xs text-ink-secondary flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Rejected
                        </span>
                      ) : null}
                    </div>

                    {/* Excerpt vs Correction */}
                    <div className="space-y-1.5 my-3">
                      <div className="text-xs text-ink-secondary">Original excerpt:</div>
                      <div className="p-2.5 rounded bg-spark-wash/40 border border-spark-ink/20 font-editorial text-sm text-spark-ink line-through decoration-spark-ink/60">
                        "{issue.originalExcerpt}"
                      </div>

                      <div className="text-xs text-ink-secondary pt-1">Suggested correction:</div>
                      <div className="p-2.5 rounded bg-reading-wash/50 border border-reading-ink/20 font-editorial text-sm text-reading-ink font-medium">
                        "{issue.suggestedCorrection}"
                      </div>
                    </div>

                    {/* Educational Explanation & Rule */}
                    <div className="mt-3 pt-3 border-t border-warm-border/60 text-xs text-ink-primary space-y-1">
                      <p className="leading-relaxed">
                        <strong>Why:</strong> {issue.explanation}
                      </p>
                      <p className="text-ink-secondary leading-relaxed">
                        <strong className="text-ink-primary">Principle:</strong> {issue.ruleOrPrinciple}
                      </p>
                    </div>

                    {/* Accept / Reject actions */}
                    {issue.status === "pending" && (
                      <div className="mt-4 pt-3 border-t border-warm-border/60 flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleRejectIssue(issue.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-warm-muted transition-colors"
                        >
                          Keep original
                        </button>
                        <button
                          onClick={() => handleAcceptIssue(issue.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-reading-ink text-paper hover:bg-reading-ink/90 transition-all shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept suggestion</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Strengths, Targeted Exercise, and Vocabulary */}
          <div className="space-y-6">
            {/* Strengths */}
            <div className="p-5 rounded-xl border border-warm-border bg-paper space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-reading-ink flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Specific Strengths
              </h3>
              <ul className="space-y-2 text-xs text-ink-secondary">
                {review.overallStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-reading-ink font-bold">•</span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Targeted Recommended Exercise */}
            {review.recommendedExercise && (
              <div className="p-5 rounded-xl border border-creative-ink/30 bg-creative-wash space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-creative-ink">
                  <Award className="w-4 h-4" /> Recommended Practice Exercise
                </div>
                <h4 className="font-editorial text-base font-semibold text-ink-primary">
                  {review.recommendedExercise.title}
                </h4>
                <p className="text-xs text-ink-primary/90 leading-relaxed">
                  {review.recommendedExercise.instructions}
                </p>
                <div className="p-2.5 rounded bg-paper/80 border border-creative-ink/20 text-xs italic text-creative-ink">
                  "{review.recommendedExercise.sampleTask}"
                </div>
              </div>
            )}

            {/* Contextual Vocabulary */}
            {review.contextualVocabulary && review.contextualVocabulary.length > 0 && (
              <div className="p-5 rounded-xl border border-vocab-ink/20 bg-vocab-wash space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-vocab-ink flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Word Garden Discovery
                  </h3>
                  <Link href="/vocabulary" className="text-[11px] text-vocab-ink underline">
                    View garden
                  </Link>
                </div>
                <p className="text-xs text-ink-secondary">
                  Words that elevate the nuance of your reflection:
                </p>

                <div className="space-y-2.5">
                  {review.contextualVocabulary.map((vocab, idx) => {
                    const isSaved = savedVocabWords[vocab.word];
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-paper border border-vocab-ink/20 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-editorial text-base font-semibold text-vocab-ink">
                            {vocab.word}
                          </span>
                          <span className="text-[10px] text-ink-secondary italic">
                            {vocab.partOfSpeech}
                          </span>
                        </div>
                        <p className="text-xs text-ink-primary/90">{vocab.definition}</p>
                        <p className="text-[11px] text-ink-secondary italic">
                          Nuance: {vocab.nuance}
                        </p>
                        <button
                          onClick={() => handleSaveToWordGarden(vocab)}
                          disabled={isSaved}
                          className={`w-full mt-1.5 inline-flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
                            isSaved
                              ? "bg-vocab-wash text-vocab-ink cursor-default"
                              : "bg-vocab-ink text-paper hover:bg-vocab-ink/90 cursor-pointer shadow-2xs"
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3 h-3" /> In Word Garden
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" /> Save to Word Garden
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE COMPARISON */}
      {activeTab === "comparison" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-warm-border bg-paper text-xs text-ink-secondary flex items-center justify-between">
            <span>
              Left: Your original writing (preserved intact). Right: Revised text incorporating your accepted suggestions.
            </span>
            <span className="font-semibold text-coach-ink">
              {acceptedIssues.length} revisions applied
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Text */}
            <div className="p-6 rounded-xl border border-warm-border bg-paper space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary border-b border-warm-border pb-2">
                Original Draft ({session.wordCount} words)
              </h3>
              <div className="font-editorial text-base sm:text-lg leading-[1.8] text-ink-primary whitespace-pre-wrap">
                {session.content}
              </div>
            </div>

            {/* Revised Text */}
            <div className="p-6 rounded-xl border border-reading-ink/30 bg-paper space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-reading-ink border-b border-warm-border pb-2 flex items-center justify-between">
                <span>Revised Version</span>
                <span className="text-[11px] font-normal lowercase opacity-80">(live preview)</span>
              </h3>
              <div className="font-editorial text-base sm:text-lg leading-[1.8] text-ink-primary whitespace-pre-wrap">
                {computeRevisedText()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALTERNATIVE EXPRESSIONS & REWRITES */}
      {activeTab === "rewrites" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-warm-border bg-paper">
            <h3 className="font-editorial text-lg font-semibold text-ink-primary mb-1">
              Explore Alternative Stylistic Tones
            </h3>
            <p className="text-xs text-ink-secondary">
              Study how different tonal calibrations alter the pacing and emotional resonance of your thought without altering your core meaning.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {(["natural", "concise", "expressive", "formal"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedRewrite(key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedRewrite === key
                      ? "bg-coach-ink text-paper shadow-xs"
                      : "bg-warm-muted text-ink-secondary hover:text-ink-primary border border-warm-border"
                  }`}
                >
                  {key === "natural" && "Clear & Natural"}
                  {key === "concise" && "Concise & Direct"}
                  {key === "expressive" && "Expressive & Sensory"}
                  {key === "formal" && "Academic / Formal"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-xl border border-coach-ink/20 bg-paper shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-coach-ink">
                {selectedRewrite === "natural" && "Clear & Natural — Conversational, unpretentious flow"}
                {selectedRewrite === "concise" && "Concise & Direct — Maximum density, zero throat-clearing"}
                {selectedRewrite === "expressive" && "Expressive & Sensory — Rich sensory texture and cadence"}
                {selectedRewrite === "formal" && "Academic & Formal — Analytical rigor and precise terminology"}
              </span>
            </div>

            <div className="font-editorial text-lg sm:text-xl leading-[1.8] text-ink-primary italic">
              "{review.rewrites?.[selectedRewrite]}"
            </div>

            <p className="text-xs text-ink-secondary pt-4 border-t border-warm-border font-annotation text-sm">
              Notice how the arrangement of phrases shapes how the reader absorbs your perspective.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
