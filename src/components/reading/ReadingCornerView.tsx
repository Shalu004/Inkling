"use client";

import React, { useState, useEffect } from "react";
import { ReadingResource, ReadingHistoryItem } from "@/types";
import { CURATED_READINGS } from "@/lib/curated/data";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  BookOpen,
  Clock,
  ExternalLink,
  CheckCircle,
  Bookmark,
  Sparkles,
  HelpCircle,
  Award,
  ChevronRight,
  ArrowLeft,
  Search,
} from "lucide-react";

export function ReadingCornerView() {
  const [readings] = useState<ReadingResource[]>(CURATED_READINGS);
  const [selectedReading, setSelectedReading] = useState<ReadingResource | null>(null);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Reading reader state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [readerNotes, setReaderNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setReadingHistory(hybridStore.getReadingHistory());
  };

  const handleOpenReading = (res: ReadingResource) => {
    setSelectedReading(res);
    setQuizAnswers({});
    setQuizSubmitted(false);

    const existing = hybridStore.getReadingItem(res.id);
    if (existing) {
      setReaderNotes(existing.notes || "");
      setIsCompleted(existing.isCompleted);
      setSavedForLater(existing.savedForLater);
    } else {
      setReaderNotes("");
      setIsCompleted(false);
      setSavedForLater(false);
    }
  };

  const handleCompleteReading = () => {
    if (!selectedReading) return;

    // Calculate quiz score if questions answered
    let score = undefined;
    if (selectedReading.comprehensionQuestions && selectedReading.comprehensionQuestions.length > 0) {
      let correct = 0;
      selectedReading.comprehensionQuestions.forEach((q, idx) => {
        if (quizAnswers[idx] === q.answerIndex) correct++;
      });
      score = Math.round((correct / selectedReading.comprehensionQuestions.length) * 100);
    }

    hybridStore.saveReadingProgress({
      resourceId: selectedReading.id,
      isCompleted: true,
      readDurationSeconds: selectedReading.estimatedReadMinutes * 60,
      comprehensionScore: score,
      notes: readerNotes,
      savedForLater,
    });

    setIsCompleted(true);
    setQuizSubmitted(true);
    loadHistory();
  };

  const handleToggleBookmark = () => {
    if (!selectedReading) return;
    const nextSaved = !savedForLater;
    setSavedForLater(nextSaved);
    hybridStore.saveReadingProgress({
      resourceId: selectedReading.id,
      savedForLater: nextSaved,
      notes: readerNotes,
      isCompleted,
    });
    loadHistory();
  };

  const filteredReadings = readings.filter((r) => {
    const matchesDiff = difficultyFilter === "all" || r.difficulty === difficultyFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.author.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-reading-ink flex items-center gap-1.5 mb-1">
            <BookOpen className="w-4 h-4" /> Reading Corner • Curated Literary Mind
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Read Worthwhile Prose
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Carefully curated essays from history's most perceptive essayists.
          </p>
        </div>

        {selectedReading && (
          <button
            onClick={() => setSelectedReading(null)}
            className="inline-flex items-center gap-1 text-xs text-ink-secondary hover:text-ink-primary font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to library
          </button>
        )}
      </div>

      {/* READING DETAIL / READER VIEW */}
      {selectedReading ? (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Reader Top Controls */}
          <div className="flex items-center justify-between border-b border-warm-border pb-4">
            <button
              onClick={() => setSelectedReading(null)}
              className="inline-flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary"
            >
              <ArrowLeft className="w-4 h-4" /> All essays
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleBookmark}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  savedForLater
                    ? "bg-creative-wash text-creative-ink border-creative-ink/30"
                    : "bg-paper text-ink-secondary border-warm-border hover:bg-warm-muted"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedForLater ? "fill-creative-ink" : ""}`} />
                <span>{savedForLater ? "Saved" : "Save for later"}</span>
              </button>

              <a
                href={selectedReading.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-warm-border bg-paper text-ink-secondary hover:text-ink-primary"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Reader Editorial Article Container */}
          <article className="p-8 sm:p-12 rounded-2xl border border-warm-border bg-paper shadow-xs space-y-6">
            <header className="space-y-3 border-b border-warm-border pb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-reading-ink">
                {selectedReading.category} • {selectedReading.difficulty}
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-ink-primary">
                {selectedReading.title}
              </h2>
              <div className="flex items-center justify-between text-xs text-ink-secondary pt-1">
                <span>By {selectedReading.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedReading.estimatedReadMinutes} min read
                </span>
              </div>
            </header>

            {/* Main Text */}
            <div className="font-editorial text-lg sm:text-[19px] leading-[1.8] text-ink-primary whitespace-pre-wrap space-y-4">
              {selectedReading.fullText}
            </div>

            {/* Key Takeaway */}
            <div className="p-4 rounded-xl bg-reading-wash/60 border border-reading-ink/20 text-xs text-reading-ink space-y-1">
              <strong>Key Reflection:</strong>
              <p className="font-editorial text-sm text-ink-primary/90 italic">
                "{selectedReading.keyTakeaway}"
              </p>
            </div>
          </article>

          {/* Reader Notes */}
          <div className="p-6 rounded-xl border border-warm-border bg-paper space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
              Personal Reading Notes
            </h3>
            <textarea
              value={readerNotes}
              onChange={(e) => setReaderNotes(e.target.value)}
              placeholder="Jot down a sentence that arrested your attention, or a question you want to ponder..."
              className="w-full p-3 rounded-lg border border-warm-border bg-parchment text-xs font-editorial text-base text-ink-primary focus:outline-none focus:border-reading-ink resize-y min-h-[100px]"
            />
          </div>

          {/* Comprehension Quiz */}
          {selectedReading.comprehensionQuestions && selectedReading.comprehensionQuestions.length > 0 && (
            <div className="p-6 sm:p-8 rounded-xl border border-reading-ink/20 bg-reading-wash/40 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-reading-ink flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Reading Comprehension Check
                </h3>
                {isCompleted && (
                  <span className="text-xs font-semibold text-reading-ink flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {selectedReading.comprehensionQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-editorial text-base font-semibold text-ink-primary">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = quizAnswers[qIdx] === optIdx;
                        const isCorrect = q.answerIndex === optIdx;

                        let style = "bg-paper border-warm-border text-ink-primary hover:bg-warm-muted";
                        if (quizSubmitted) {
                          if (isCorrect) {
                            style = "bg-reading-wash border-reading-ink text-reading-ink font-semibold";
                          } else if (isChosen && !isCorrect) {
                            style = "bg-spark-wash border-spark-ink text-spark-ink line-through";
                          }
                        } else if (isChosen) {
                          style = "bg-reading-wash/80 border-reading-ink text-reading-ink font-semibold";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() =>
                              setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                            }
                            className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <p className="text-xs text-ink-secondary bg-paper p-3 rounded border border-warm-border">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-reading-ink/20 flex items-center justify-end">
                <button
                  onClick={handleCompleteReading}
                  className="px-6 py-2.5 rounded-lg bg-reading-ink text-paper text-xs font-semibold hover:bg-reading-ink/90 transition-all shadow-xs"
                >
                  {quizSubmitted ? "Update Notes & Progress" : "Submit & Mark Finished"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIBRARY / ESSAY GRID VIEW */
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search essays by title or author..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-warm-border bg-paper text-xs text-ink-primary placeholder:text-ink-secondary/50 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    difficultyFilter === diff
                      ? "bg-reading-ink text-paper font-semibold shadow-2xs"
                      : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReadings.map((res) => {
              const hist = readingHistory.find((h) => h.resourceId === res.id);
              const isDone = hist?.isCompleted;

              return (
                <div
                  key={res.id}
                  onClick={() => handleOpenReading(res)}
                  className="cursor-pointer p-6 rounded-xl border border-warm-border bg-paper hover:border-reading-ink/40 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-reading-ink bg-reading-wash px-2 py-0.5 rounded-full border border-reading-ink/20">
                        {res.category}
                      </span>
                      {isDone && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-reading-ink">
                          <CheckCircle className="w-3.5 h-3.5" /> Read
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-2xl font-semibold text-ink-primary group-hover:text-reading-ink transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-ink-secondary">By {res.author}</p>

                    <p className="font-editorial text-sm text-ink-primary/80 line-clamp-3 leading-relaxed pt-1">
                      "{res.excerpt}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs text-ink-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {res.estimatedReadMinutes} min read
                    </span>

                    <span className="inline-flex items-center gap-1 text-reading-ink font-semibold group-hover:translate-x-1 transition-transform">
                      Read piece <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
