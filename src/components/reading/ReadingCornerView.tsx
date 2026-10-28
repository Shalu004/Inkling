"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Award,
  ChevronRight,
  ArrowLeft,
  Search,
  BookMarked,
  Feather,
} from "lucide-react";

export function ReadingCornerView() {
  const [readings] = useState<ReadingResource[]>(CURATED_READINGS);
  const [selectedReading, setSelectedReading] = useState<ReadingResource | null>(null);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Reader state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [readerNotes, setReaderNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);
  const [largeText, setLargeText] = useState(false);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#DED7C9] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#65745A] flex items-center gap-1.5 mb-1">
            <BookMarked className="w-4 h-4" /> Reading Nook • Literary Sanctuary
          </span>
          <h1 className="font-literary text-3xl sm:text-4xl font-semibold text-[#332F29]">
            Quiet Reading Nook
          </h1>
          <p className="text-xs text-[#777267] mt-1">
            Curated essays, philosophy, and prose to read slowly and savor.
          </p>
        </div>

        {selectedReading ? (
          <button
            onClick={() => setSelectedReading(null)}
            className="inline-flex items-center gap-1 text-xs text-[#65745A] font-medium hover:underline self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to reading list
          </button>
        ) : (
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] text-xs font-medium text-[#332F29] hover:bg-[#E5E6D9]"
          >
            <span>View My Library Books</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* READING DETAIL / READER VIEW */}
      {selectedReading ? (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Reader Top Controls */}
          <div className="flex items-center justify-between border-b border-[#DED7C9] pb-4 text-xs">
            <button
              onClick={() => setSelectedReading(null)}
              className="inline-flex items-center gap-1.5 text-[#65745A] hover:text-[#485641] font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> All essays
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLargeText(!largeText)}
                className={`px-2.5 py-1 rounded border border-[#DED7C9] text-xs transition-colors ${
                  largeText ? "bg-[#65745A] text-[#FFFCF5]" : "bg-[#FFFCF5] text-[#777267]"
                }`}
                title="Toggle larger reading font"
              >
                A+ Text
              </button>

              <button
                onClick={handleToggleBookmark}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
                  savedForLater
                    ? "bg-[#754650] text-[#FFFCF5] border-[#754650]"
                    : "bg-[#FFFCF5] text-[#777267] border-[#DED7C9] hover:bg-[#E5E6D9]"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedForLater ? "fill-[#FFFCF5]" : ""}`} />
                <span>{savedForLater ? "Saved" : "Save for later"}</span>
              </button>

              <a
                href={selectedReading.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] text-[#777267] hover:text-[#332F29]"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Reader Article Surface */}
          <article className="p-8 sm:p-12 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] shadow-sm space-y-6">
            <header className="space-y-3 border-b border-[#DED7C9] pb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65745A] bg-[#E5E6D9] px-2 py-0.5 rounded">
                {selectedReading.category} • {selectedReading.difficulty}
              </span>
              <h2 className="font-literary text-3xl sm:text-4xl font-bold text-[#332F29]">
                {selectedReading.title}
              </h2>
              <div className="flex items-center justify-between text-xs text-[#777267] pt-1">
                <span>By {selectedReading.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedReading.estimatedReadMinutes} min read
                </span>
              </div>
            </header>

            {/* Main Text with Cozy Line Height */}
            <div
              className={`font-literary leading-[1.85] text-[#332F29] whitespace-pre-wrap space-y-4 ${
                largeText ? "text-xl" : "text-lg sm:text-[19px]"
              }`}
            >
              {selectedReading.fullText}
            </div>

            {/* Key Reflection Box */}
            <div className="p-4 rounded-lg bg-[#E5E6D9]/50 border border-[#DED7C9] text-xs text-[#485641] space-y-1">
              <strong>Key Reflection:</strong>
              <p className="font-literary text-sm text-[#332F29] italic">
                "{selectedReading.keyTakeaway}"
              </p>
            </div>
          </article>

          {/* Reader Personal Notes */}
          <div className="p-6 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#65745A]">
              Personal Reading Notes
            </h3>
            <textarea
              value={readerNotes}
              onChange={(e) => setReaderNotes(e.target.value)}
              placeholder="Underline a thought, capture an arresting phrase, or note what questions this essay raised..."
              className="w-full p-3.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs font-literary text-base text-[#332F29] placeholder:text-[#777267]/60 focus:outline-none focus:border-[#65745A] resize-y min-h-[100px]"
            />
          </div>

          {/* Comprehension Quiz */}
          {selectedReading.comprehensionQuestions && selectedReading.comprehensionQuestions.length > 0 && (
            <div className="p-6 sm:p-8 rounded-xl border border-[#DED7C9] bg-[#E5E6D9]/40 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#485641] flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Reading Comprehension Check
                </h3>
                {isCompleted && (
                  <span className="text-xs font-semibold text-[#65745A] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Finished
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {selectedReading.comprehensionQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-literary text-base font-semibold text-[#332F29]">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = quizAnswers[qIdx] === optIdx;
                        const isCorrect = q.answerIndex === optIdx;

                        let style = "bg-[#FFFCF5] border-[#DED7C9] text-[#332F29] hover:bg-[#E5E6D9]/60";
                        if (quizSubmitted) {
                          if (isCorrect) {
                            style = "bg-[#D9DFCF] border-[#65745A] text-[#485641] font-semibold";
                          } else if (isChosen && !isCorrect) {
                            style = "bg-[#754650]/20 border-[#754650] text-[#754650] line-through";
                          }
                        } else if (isChosen) {
                          style = "bg-[#E5E6D9] border-[#65745A] text-[#485641] font-semibold";
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
                      <p className="text-xs text-[#777267] bg-[#FFFCF5] p-3 rounded border border-[#DED7C9]">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#DED7C9] flex items-center justify-end">
                <button
                  onClick={handleCompleteReading}
                  className="px-6 py-2.5 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641] transition-all shadow-xs"
                >
                  {quizSubmitted ? "Update Notes & Save" : "Submit & Mark Finished"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* READING NOOK ESSAY LIST */
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777267]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search essays by title or author..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] text-xs text-[#332F29] placeholder:text-[#777267]/60 focus:outline-none focus:border-[#65745A]"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    difficultyFilter === diff
                      ? "bg-[#65745A] text-[#FFFCF5] font-semibold shadow-2xs"
                      : "bg-[#FFFCF5] text-[#777267] hover:text-[#332F29] border border-[#DED7C9]"
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
                  className="cursor-pointer p-6 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] hover:border-[#65745A] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#65745A] bg-[#E5E6D9] px-2 py-0.5 rounded">
                        {res.category}
                      </span>
                      {isDone && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#65745A]">
                          <CheckCircle className="w-3.5 h-3.5" /> Read
                        </span>
                      )}
                    </div>

                    <h3 className="font-literary text-2xl font-bold text-[#332F29] group-hover:text-[#65745A] transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-[#777267]">By {res.author}</p>

                    <p className="font-literary text-sm text-[#332F29]/80 line-clamp-3 leading-relaxed pt-1">
                      "{res.excerpt}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DED7C9]/60 flex items-center justify-between text-xs text-[#777267]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {res.estimatedReadMinutes} min read
                    </span>

                    <span className="inline-flex items-center gap-1 text-[#65745A] font-semibold group-hover:translate-x-1 transition-transform">
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
