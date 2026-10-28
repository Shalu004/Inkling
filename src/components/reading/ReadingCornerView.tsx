"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReadingResource, ReadingHistoryItem, ReaderPreferences } from "@/types";
import { CURATED_READINGS } from "@/lib/curated/data";
import { hybridStore, DEFAULT_READER_PREFERENCES } from "@/lib/store/hybridStore";
import {
  BookOpen,
  Clock,
  ExternalLink,
  CheckCircle,
  Bookmark,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Search,
  BookMarked,
  Sliders,
  Maximize2,
  Minimize2,
  Quote,
  PenTool,
  Check,
  ChevronLeft,
  X,
  RotateCcw,
} from "lucide-react";

export function ReadingCornerView() {
  const router = useRouter();
  const [readings] = useState<ReadingResource[]>(CURATED_READINGS);
  const [selectedReading, setSelectedReading] = useState<ReadingResource | null>(null);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Reader Preferences state
  const [readerPrefs, setReaderPrefs] = useState<ReaderPreferences>(DEFAULT_READER_PREFERENCES);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reader state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [readerNotes, setReaderNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const articleRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    loadHistory();
    const storedPrefs = hybridStore.getReaderPreferences();
    setReaderPrefs(storedPrefs);
  }, []);

  const loadHistory = () => {
    setReadingHistory(hybridStore.getReadingHistory());
  };

  // Open reading and restore reading position
  const handleOpenReading = (res: ReadingResource) => {
    setSelectedReading(res);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setCurrentPage(1);

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

    // Restore saved reading position
    setTimeout(() => {
      const positions = hybridStore.getReadingPositions();
      const pos = positions[res.id];
      if (pos && articleRef.current) {
        const targetScroll = (pos.scrollPercent / 100) * articleRef.current.scrollHeight;
        articleRef.current.scrollTo({ top: targetScroll, behavior: "smooth" });
        showToast("Restored your reading position");
      }
    }, 250);
  };

  // Save scroll position periodically
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!selectedReading) return;
    const el = e.currentTarget;
    const scrollPercent = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100) || 0;
    hybridStore.saveReadingPosition(selectedReading.id, { scrollPercent });
  };

  const updateReaderPref = <K extends keyof ReaderPreferences>(key: K, value: ReaderPreferences[K]) => {
    const updated = { ...readerPrefs, [key]: value };
    setReaderPrefs(updated);
    hybridStore.saveReaderPreferences({ [key]: value });
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
    showToast(nextSaved ? "Saved to your bookmarks" : "Removed bookmark");
  };

  // Save selected passage to journal
  const handleSavePassageToJournal = () => {
    if (!selectedReading) return;
    const selection = typeof window !== "undefined" ? window.getSelection()?.toString().trim() : "";
    const passage = selection || selectedReading.excerpt;

    hybridStore.savePassage({
      resourceId: selectedReading.id,
      resourceTitle: selectedReading.title,
      passage,
      note: `Saved from ${selectedReading.title} by ${selectedReading.author}`,
    });

    const entryId = "journal-" + Date.now();
    hybridStore.saveJournalEntry({
      id: entryId,
      title: `Reflection on ${selectedReading.title}`,
      body: `"${passage}"\n\n— ${selectedReading.author}\n\nMy thoughts on this passage:\n`,
      tags: ["Reading Passage", selectedReading.category],
      mood: "reflective",
      isFavorite: false,
    });

    showToast("Passage saved & opened in My Journal");
    setTimeout(() => {
      router.push("/journal");
    }, 600);
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
    showToast("Essay reading marked as completed!");
  };

  // Paginated paragraphs calculation
  const paragraphs = selectedReading ? selectedReading.fullText.split("\n\n").filter(Boolean) : [];
  const paragraphsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(paragraphs.length / paragraphsPerPage));
  const displayedParagraphs =
    readerPrefs.mode === "paginated"
      ? paragraphs.slice((currentPage - 1) * paragraphsPerPage, currentPage * paragraphsPerPage)
      : paragraphs;

  // Reader theme classes
  const getReaderThemeStyles = () => {
    switch (readerPrefs.theme) {
      case "sepia":
        return { bg: "#FAF4E8", text: "#382B1E", border: "#DACDB7" };
      case "sage":
        return { bg: "#F4F7F2", text: "#2A3628", border: "#CAD5C4" };
      case "midnight":
        return { bg: "#222521", text: "#ECEFE9", border: "#373E36" };
      case "linen":
      default:
        return { bg: "var(--bg-paper)", text: "var(--text-main)", border: "var(--border-warm)" };
    }
  };

  const readerStyles = getReaderThemeStyles();

  // Reader font family
  const getReaderFontClass = () => {
    if (readerPrefs.fontFamily === "sans") return "font-sans";
    if (readerPrefs.fontFamily === "accessible") return "font-mono tracking-wide";
    return "font-literary";
  };

  // Line height
  const getLineHeightClass = () => {
    if (readerPrefs.lineHeight === "compact") return "leading-[1.6]";
    if (readerPrefs.lineHeight === "relaxed") return "leading-[2.2]";
    return "leading-[1.9]";
  };

  // Margins
  const getMarginClass = () => {
    if (readerPrefs.marginWidth === "narrow") return "max-w-xl";
    if (readerPrefs.marginWidth === "wide") return "max-w-4xl";
    return "max-w-3xl";
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
    <div className={`transition-all duration-300 ${isFocusMode ? "fixed inset-0 z-50 bg-[var(--bg-main)] overflow-y-auto p-4 sm:p-10" : "max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10"}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#332F29] text-[#FFFCF5] px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-[#65745A]/40 animate-fade-in">
          <Check className="w-4 h-4 text-[#D9DFCF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (hidden in focus mode) */}
      {!isFocusMode && (
        <div className="border-b border-[var(--border-warm)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-sage)] flex items-center gap-1.5 mb-1">
              <BookMarked className="w-4 h-4" /> Reading Nook • Literary Sanctuary
            </span>
            <h1 className="font-literary text-3xl sm:text-4xl font-semibold text-[var(--text-main)]">
              Quiet Reading Nook
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Curated essays, philosophy, and prose with customizable paper typography and focus modes.
            </p>
          </div>

          {selectedReading ? (
            <button
              onClick={() => setSelectedReading(null)}
              className="inline-flex items-center gap-1 text-xs text-[var(--accent-sage)] font-medium hover:underline self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to reading list
            </button>
          ) : (
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
            >
              <span>View My Bookshelf</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* READING DETAIL / READER VIEW */}
      {selectedReading ? (
        <div className={`${getMarginClass()} mx-auto space-y-6`}>
          {/* Reader Sticky Toolbar */}
          <div className="sticky top-2 z-40 p-3 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)]/95 backdrop-blur-sm shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedReading(null)}
                className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-main)] pr-2 border-r border-[var(--border-warm)]"
                title="Return to library"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Essays</span>
              </button>

              <span className="font-literary text-xs font-medium text-[var(--text-main)] truncate max-w-[200px] sm:max-w-xs">
                {selectedReading.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Reading Settings Toggle */}
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  showSettingsPanel
                    ? "bg-[var(--accent-sage)] text-[#FFFCF5] border-[var(--accent-sage)]"
                    : "border-[var(--border-warm)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
                title="Reading Controls (Font, Spacing, Themes)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Controls</span>
              </button>

              {/* Distraction-free Focus Mode */}
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`p-1.5 rounded-lg border transition-all ${
                  isFocusMode
                    ? "bg-[var(--accent-sage)] text-[#FFFCF5] border-[var(--accent-sage)]"
                    : "border-[var(--border-warm)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
                title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Focus Mode"}
              >
                {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Bookmark */}
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-lg border transition-all ${
                  savedForLater
                    ? "bg-[#754650] text-[#FFFCF5] border-[#754650]"
                    : "border-[var(--border-warm)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
                title={savedForLater ? "Bookmarked" : "Bookmark this essay"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedForLater ? "fill-current" : ""}`} />
              </button>

              {/* Save Passage to Journal */}
              <button
                onClick={handleSavePassageToJournal}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] hover:bg-[var(--bg-botanical-light)] font-medium text-[11px]"
                title="Copy selection or excerpt into My Journal"
              >
                <PenTool className="w-3 h-3" />
                <span className="hidden md:inline">Reflect in Diary</span>
              </button>
            </div>
          </div>

          {/* Collapsible Reading Settings Panel */}
          {showSettingsPanel && (
            <div className="p-5 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-md space-y-4 animate-in fade-in duration-150 text-xs">
              <div className="flex items-center justify-between border-b border-[var(--border-warm)] pb-2 font-medium text-[var(--text-main)]">
                <span>Reading Atmosphere & Controls</span>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Reader Themes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    Paper Tone:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "linen", label: "Linen", bg: "#FFFCF5", text: "#332F29" },
                      { id: "sepia", label: "Sepia", bg: "#FAF4E8", text: "#382B1E" },
                      { id: "sage", label: "Sage", bg: "#F4F7F2", text: "#2A3628" },
                      { id: "midnight", label: "Night", bg: "#222521", text: "#ECEFE9" },
                    ].map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => updateReaderPref("theme", th.id as any)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          readerPrefs.theme === th.id ? "ring-2 ring-[var(--accent-sage)] font-bold" : "border-black/10"
                        }`}
                        style={{ backgroundColor: th.bg, color: th.text }}
                      >
                        {th.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Font Family */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    Typography:
                  </label>
                  <div className="flex flex-col gap-1">
                    {[
                      { id: "serif", label: "Serif (Classic Lora)" },
                      { id: "sans", label: "Sans (Modern Inter)" },
                      { id: "accessible", label: "Clean Accessible" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateReaderPref("fontFamily", f.id as any)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                          readerPrefs.fontFamily === f.id
                            ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold border-[var(--accent-sage)]"
                            : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Font Size & Line Height */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    Font Size: {readerPrefs.fontSize}px
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateReaderPref("fontSize", Math.max(14, readerPrefs.fontSize - 1))}
                      className="px-2.5 py-1 rounded border border-[var(--border-warm)] bg-[var(--bg-main)]"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min={14}
                      max={26}
                      value={readerPrefs.fontSize}
                      onChange={(e) => updateReaderPref("fontSize", parseInt(e.target.value))}
                      className="flex-1 accent-[var(--accent-sage)]"
                    />
                    <button
                      type="button"
                      onClick={() => updateReaderPref("fontSize", Math.min(26, readerPrefs.fontSize + 1))}
                      className="px-2.5 py-1 rounded border border-[var(--border-warm)] bg-[var(--bg-main)]"
                    >
                      A+
                    </button>
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Line Spacing:
                    </label>
                    <div className="flex gap-1">
                      {["compact", "normal", "relaxed"].map((lh) => (
                        <button
                          key={lh}
                          type="button"
                          onClick={() => updateReaderPref("lineHeight", lh as any)}
                          className={`flex-1 py-1 rounded text-[10px] capitalize border ${
                            readerPrefs.lineHeight === lh
                              ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
                              : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                          }`}
                        >
                          {lh}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Reading Mode & Margins */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    Reading Mode:
                  </label>
                  <div className="flex gap-1">
                    {[
                      { id: "scroll", label: "Scroll" },
                      { id: "paginated", label: "Paginated" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateReaderPref("mode", m.id as any)}
                        className={`flex-1 py-1.5 rounded text-[11px] border ${
                          readerPrefs.mode === m.id
                            ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
                            : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
                      Margins Width:
                    </label>
                    <div className="flex gap-1">
                      {["narrow", "normal", "wide"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => updateReaderPref("marginWidth", w as any)}
                          className={`flex-1 py-1 rounded text-[10px] capitalize border ${
                            readerPrefs.marginWidth === w
                              ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
                              : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reader Article Surface */}
          <div
            ref={articleRef}
            onScroll={handleScroll}
            className="p-8 sm:p-14 rounded-2xl shadow-sm border space-y-6 transition-colors duration-200"
            style={{
              backgroundColor: readerStyles.bg,
              color: readerStyles.text,
              borderColor: readerStyles.border,
            }}
          >
            <header className="space-y-3 pb-6 border-b border-black/10">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/5">
                  {selectedReading.category} • {selectedReading.difficulty}
                </span>
                <span className="flex items-center gap-1 opacity-75">
                  <Clock className="w-3.5 h-3.5" />
                  ~{selectedReading.estimatedReadMinutes} min read
                </span>
              </div>

              <h2 className={`font-literary font-medium text-3xl sm:text-4xl tracking-tight leading-snug`}>
                {selectedReading.title}
              </h2>

              <p className="text-xs font-serif italic opacity-75">
                by {selectedReading.author} • {selectedReading.sourceName}
              </p>
            </header>

            {/* Reading Content */}
            <div
              className={`${getReaderFontClass()} ${getLineHeightClass()} space-y-5`}
              style={{ fontSize: `${readerPrefs.fontSize}px` }}
            >
              {displayedParagraphs.map((para, idx) => (
                <p key={idx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Paginated Navigation Controls */}
            {readerPrefs.mode === "paginated" && totalPages > 1 && (
              <div className="pt-6 border-t border-black/10 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Section</span>
                </button>

                <span className="font-mono text-[11px] opacity-75">
                  Section {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 disabled:opacity-40"
                >
                  <span>Next Section</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Key Reflection Box */}
            <div className="p-4 rounded-xl bg-black/5 border border-black/10 text-xs space-y-1">
              <span className="font-semibold block opacity-85">Core Reflection:</span>
              <p className="italic opacity-90 leading-relaxed font-literary">
                "{selectedReading.keyTakeaway}"
              </p>
            </div>
          </div>

          {/* Reader Footer: Comprehension & Reflection Notes */}
          <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] space-y-6 text-xs">
            {/* Comprehension Quiz */}
            {selectedReading.comprehensionQuestions && selectedReading.comprehensionQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-warm)] pb-2">
                  <h3 className="font-literary text-base font-semibold text-[var(--text-main)]">
                    Reflective Inquiries
                  </h3>
                  {quizSubmitted && (
                    <span className="text-[11px] font-semibold text-[var(--accent-sage)]">
                      Responses recorded
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedReading.comprehensionQuestions.map((q, idx) => (
                    <div key={idx} className="space-y-2 p-3.5 rounded-lg bg-[var(--bg-main)]">
                      <p className="font-medium text-[var(--text-main)]">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                            className={`p-2 rounded-lg border text-left transition-all ${
                              quizAnswers[idx] === optIdx
                                ? "border-[var(--accent-sage)] bg-[var(--bg-botanical-light)] text-[var(--accent-olive)] font-medium"
                                : "border-[var(--border-warm)] bg-[var(--bg-paper)] text-[var(--text-muted)]"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Notes on the Reading */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-warm)]">
              <label className="font-semibold text-[var(--text-main)] block">
                Personal Margin Notes & Impressions:
              </label>
              <textarea
                value={readerNotes}
                onChange={(e) => setReaderNotes(e.target.value)}
                placeholder="Record what struck you in this essay, questions it provoked, or sentences to remember..."
                rows={3}
                className="w-full p-3 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] focus:outline-none resize-y"
              />
            </div>

            {/* Completion Actions */}
            <div className="pt-2 flex items-center justify-between">
              <a
                href={selectedReading.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[var(--text-muted)] hover:underline inline-flex items-center gap-1"
              >
                <span>Read at {selectedReading.sourceName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleCompleteReading}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-medium text-xs transition-all shadow-xs ${
                  isCompleted
                    ? "bg-[var(--bg-botanical-light)] text-[var(--accent-olive)]"
                    : "bg-[var(--accent-sage)] text-[#FFFCF5] hover:bg-[var(--accent-olive)]"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isCompleted ? "Completed" : "Mark as Finished"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ESSAYS DIRECTORY / NOOK BROWSING */
        <div className="space-y-6">
          {/* Search & Difficulty Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              {["all", "beginner", "intermediate", "advanced"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-3 py-1.5 rounded-full capitalize transition-all font-medium whitespace-nowrap ${
                    difficultyFilter === d
                      ? "bg-[var(--accent-sage)] text-[#FFFCF5] shadow-xs"
                      : "bg-[var(--bg-paper)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-warm)]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px] sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search essays, authors, themes..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
            </div>
          </div>

          {/* Essays Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReadings.map((reading) => {
              const historyItem = readingHistory.find((h) => h.resourceId === reading.id);
              const isDone = historyItem?.isCompleted;

              return (
                <div
                  key={reading.id}
                  onClick={() => handleOpenReading(reading)}
                  className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:border-[var(--accent-sage)] cursor-pointer transition-all flex flex-col justify-between space-y-4 hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="font-semibold uppercase tracking-wider text-[var(--accent-sage)] bg-[var(--bg-sage-surface)] px-2 py-0.5 rounded">
                        {reading.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{reading.estimatedReadMinutes} min
                      </span>
                    </div>

                    <h3 className="font-literary text-xl font-medium text-[var(--text-main)] group-hover:text-[var(--accent-sage)] transition-colors leading-snug">
                      {reading.title}
                    </h3>

                    <p className="text-xs text-[var(--text-muted)] font-serif italic">
                      by {reading.author}
                    </p>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                      {reading.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-warm)]/60 flex items-center justify-between text-xs">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[var(--accent-sage)] font-semibold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] text-[11px] capitalize">
                        {reading.difficulty} prose
                      </span>
                    )}

                    <span className="font-medium text-[var(--accent-sage)] group-hover:underline inline-flex items-center gap-1">
                      <span>Read essay</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
