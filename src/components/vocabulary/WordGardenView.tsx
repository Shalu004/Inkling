"use client";

import React, { useState, useEffect } from "react";
import { VocabularyEntry, VocabStatus } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Search,
  Plus,
  BookOpen,
  Volume2,
  Check,
  CheckCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Trash2,
  RotateCw,
} from "lucide-react";

export function WordGardenView() {
  const [words, setWords] = useState<VocabularyEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VocabStatus | "all">("all");
  const [activeMode, setActiveMode] = useState<"garden" | "flashcards" | "nuances">("garden");

  // Dictionary lookup state
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    const list = hybridStore.getVocabulary();
    setWords(list);
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Word not found");
      }
      setLookupResult(data.entry);
    } catch (err: any) {
      setLookupError(err.message || "Failed to search word");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddLookupToGarden = () => {
    if (!lookupResult) return;
    hybridStore.saveVocabulary({
      word: lookupResult.word,
      partOfSpeech: lookupResult.partOfSpeech,
      phonetic: lookupResult.phonetic,
      definition: lookupResult.definition,
      exampleSentence: lookupResult.exampleSentence,
      contextualNuance: lookupResult.nuances,
      sourceType: "manual_search",
      status: "learning",
    });
    loadWords();
    setLookupResult(null);
    setLookupQuery("");
  };

  const handleStatusChange = (id: string, newStatus: VocabStatus) => {
    hybridStore.updateVocabularyStatus(id, newStatus);
    loadWords();
  };

  const handleDeleteWord = (id: string) => {
    hybridStore.deleteVocabulary(id);
    loadWords();
  };

  const filteredWords = words.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-vocab-ink flex items-center gap-1.5 mb-1">
            <BookOpen className="w-4 h-4" /> Word Garden • Lexical Discovery
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Cultivate Nuance & Voice
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            {words.length} words planted • {words.filter((w) => w.status === "mastered").length} mastered
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-paper p-1 rounded-lg border border-warm-border text-xs">
          <button
            onClick={() => setActiveMode("garden")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeMode === "garden"
                ? "bg-vocab-wash text-vocab-ink font-semibold shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Garden Grid
          </button>
          <button
            onClick={() => {
              setActiveMode("flashcards");
              setIsFlipped(false);
              setFlashcardIndex(0);
            }}
            disabled={words.length === 0}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeMode === "flashcards"
                ? "bg-vocab-wash text-vocab-ink font-semibold shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary disabled:opacity-40"
            }`}
          >
            Flashcards ({words.length})
          </button>
          <button
            onClick={() => setActiveMode("nuances")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeMode === "nuances"
                ? "bg-vocab-wash text-vocab-ink font-semibold shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Nuance Comparator
          </button>
        </div>
      </div>

      {/* Dictionary Search Bar */}
      <div className="p-6 rounded-xl border border-vocab-ink/20 bg-vocab-wash space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-vocab-ink opacity-70" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Search dictionary for a word (e.g. luminescent, discernment, evocative)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-vocab-ink/30 bg-paper text-sm text-ink-primary placeholder:text-ink-secondary/50 focus:outline-none focus:border-vocab-ink"
            />
          </div>
          <button
            type="submit"
            disabled={isLookingUp || !lookupQuery.trim()}
            className="px-5 py-2.5 rounded-lg bg-vocab-ink text-paper text-xs font-semibold hover:bg-vocab-ink/90 transition-all shadow-xs disabled:opacity-50"
          >
            {isLookingUp ? "Consulting Lexicon..." : "Explore Word"}
          </button>
        </form>

        {lookupError && <p className="text-xs text-spark-ink">{lookupError}</p>}

        {/* Live Lookup Result Card */}
        {lookupResult && (
          <div className="p-5 rounded-lg bg-paper border border-vocab-ink/30 space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-editorial text-2xl font-bold text-vocab-ink">
                    {lookupResult.word}
                  </h3>
                  {lookupResult.phonetic && (
                    <span className="text-xs font-mono text-ink-secondary">
                      {lookupResult.phonetic}
                    </span>
                  )}
                  <span className="text-xs italic text-ink-secondary">
                    ({lookupResult.partOfSpeech})
                  </span>
                </div>
                <p className="font-editorial text-base text-ink-primary mt-1">
                  {lookupResult.definition}
                </p>
              </div>

              <button
                onClick={handleAddLookupToGarden}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-vocab-ink text-paper hover:bg-vocab-ink/90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Plant in Garden
              </button>
            </div>

            {lookupResult.exampleSentence && (
              <p className="text-xs text-ink-secondary italic">
                "{lookupResult.exampleSentence}"
              </p>
            )}

            {lookupResult.nuances && (
              <div className="p-2.5 rounded bg-vocab-wash text-xs text-vocab-ink border border-vocab-ink/20">
                <strong>Nuance:</strong> {lookupResult.nuances}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODE 1: GARDEN GRID */}
      {activeMode === "garden" && (
        <div className="space-y-6">
          {/* Filters & Search in saved words */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter saved words..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-warm-border bg-paper text-xs text-ink-primary placeholder:text-ink-secondary/50 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(["all", "learning", "familiar", "mastered"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    statusFilter === st
                      ? "bg-ink-primary text-paper font-semibold"
                      : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Words List */}
          {filteredWords.length === 0 ? (
            <div className="p-12 rounded-xl border border-warm-border bg-paper text-center space-y-3">
              <BookOpen className="w-8 h-8 text-vocab-ink/60 mx-auto" />
              <h3 className="font-editorial text-xl font-semibold text-ink-primary">
                Your Word Garden awaits its first seed
              </h3>
              <p className="text-xs text-ink-secondary max-w-md mx-auto">
                Discover words through your writing feedback, look up terminology above, or save words
                from the Reading Corner.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((entry) => (
                <div
                  key={entry.id}
                  className="p-5 rounded-xl border border-warm-border bg-paper hover:border-vocab-ink/30 transition-all shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-editorial text-xl font-bold text-ink-primary">
                          {entry.word}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                          {entry.phonetic && <span>{entry.phonetic}</span>}
                          <span>•</span>
                          <span className="italic">{entry.partOfSpeech}</span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          entry.status === "mastered"
                            ? "bg-reading-wash text-reading-ink border-reading-ink/30"
                            : entry.status === "familiar"
                            ? "bg-creative-wash text-creative-ink border-creative-ink/30"
                            : "bg-vocab-wash text-vocab-ink border-vocab-ink/30"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <p className="text-xs text-ink-primary/90 mt-2 leading-relaxed">
                      {entry.definition}
                    </p>

                    {entry.contextualNuance && (
                      <p className="text-[11px] text-vocab-ink bg-vocab-wash/60 p-2 rounded mt-2 border border-vocab-ink/10">
                        <strong>Nuance:</strong> {entry.contextualNuance}
                      </p>
                    )}

                    {entry.exampleSentence && (
                      <p className="text-xs text-ink-secondary italic mt-2">
                        "{entry.exampleSentence}"
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs">
                    <select
                      value={entry.status}
                      onChange={(e) => handleStatusChange(entry.id, e.target.value as VocabStatus)}
                      className="px-2 py-1 rounded border border-warm-border bg-parchment text-[11px] text-ink-secondary focus:outline-none"
                    >
                      <option value="learning">Learning</option>
                      <option value="familiar">Familiar</option>
                      <option value="mastered">Mastered</option>
                    </select>

                    <button
                      onClick={() => handleDeleteWord(entry.id)}
                      className="text-ink-secondary hover:text-spark-ink transition-colors p-1"
                      title="Remove word"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FLASHCARDS */}
      {activeMode === "flashcards" && words.length > 0 && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-ink-secondary">
            <span>
              Card {flashcardIndex + 1} of {words.length}
            </span>
            <span className="font-annotation text-sm text-vocab-ink">
              Click card to reveal meaning & nuance
            </span>
          </div>

          {/* Flashcard with Flip Animation */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] p-8 rounded-2xl border-2 border-vocab-ink/30 bg-paper shadow-md flex flex-col items-center justify-center text-center space-y-4 transition-transform duration-300 hover:scale-[1.01]"
          >
            {!isFlipped ? (
              <>
                <span className="text-xs font-semibold uppercase tracking-wider text-vocab-ink">
                  Prompt
                </span>
                <h3 className="font-editorial text-4xl font-bold text-ink-primary">
                  {words[flashcardIndex].word}
                </h3>
                <span className="text-xs italic text-ink-secondary">
                  ({words[flashcardIndex].partOfSpeech})
                </span>
                <p className="text-xs text-ink-secondary pt-4 font-annotation text-base">
                  (Tap to flip)
                </p>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold uppercase tracking-wider text-reading-ink">
                  Definition & Nuance
                </span>
                <p className="font-editorial text-xl font-medium text-ink-primary leading-relaxed">
                  {words[flashcardIndex].definition}
                </p>
                {words[flashcardIndex].contextualNuance && (
                  <p className="text-xs text-vocab-ink bg-vocab-wash p-3 rounded-lg border border-vocab-ink/20">
                    {words[flashcardIndex].contextualNuance}
                  </p>
                )}
                {words[flashcardIndex].exampleSentence && (
                  <p className="text-xs text-ink-secondary italic">
                    "{words[flashcardIndex].exampleSentence}"
                  </p>
                )}
              </>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-lg border border-warm-border bg-paper text-xs font-medium hover:bg-warm-muted"
            >
              Previous Card
            </button>

            <button
              onClick={() => {
                handleStatusChange(words[flashcardIndex].id, "mastered");
                if (flashcardIndex < words.length - 1) {
                  setFlashcardIndex((prev) => prev + 1);
                  setIsFlipped(false);
                }
              }}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-reading-ink text-paper text-xs font-semibold hover:bg-reading-ink/90"
            >
              <Check className="w-3.5 h-3.5" /> Mark as Mastered
            </button>

            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-lg border border-warm-border bg-paper text-xs font-medium hover:bg-warm-muted"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: NUANCE COMPARATOR */}
      {activeMode === "nuances" && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-warm-border bg-paper">
            <h3 className="font-editorial text-xl font-semibold text-ink-primary">
              Distinguishing Close Synonyms
            </h3>
            <p className="text-xs text-ink-secondary mt-1">
              Elevating vocabulary is rarely about memorizing rare words; it is about choosing the exact word whose emotional color fits the sentence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-coach-ink/20 bg-coach-wash/40 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-coach-ink">
                Cluster 1: Impact & Conviction
              </span>
              <div className="space-y-3">
                <div className="p-3 bg-paper rounded-lg border border-warm-border">
                  <strong className="text-sm text-ink-primary">Effective:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Produces a desired result mechanically or practically.
                  </p>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-warm-border">
                  <strong className="text-sm text-coach-ink">Compelling:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Irresistibly demands intellectual attention or emotional agreement.
                  </p>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-warm-border">
                  <strong className="text-sm text-reading-ink">Meaningful:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Possesses deep personal, spiritual, or ethical significance.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-creative-ink/20 bg-creative-wash/40 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-creative-ink">
                Cluster 2: Perception & Insight
              </span>
              <div className="space-y-3">
                <div className="p-3 bg-paper rounded-lg border border-warm-border">
                  <strong className="text-sm text-ink-primary">Smart / Clever:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Quick-witted; skillful at solving puzzle-like challenges.
                  </p>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-warm-border">
                  <strong className="text-sm text-creative-ink">Perceptive:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Notice nuances in human behavior and unspoken tensions.
                  </p>
                </div>
                <div className="p-3 bg-paper rounded-lg border border-warm-border">
                  <strong className="text-sm text-vocab-ink">Discerning:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Possesses refined aesthetic or moral judgment to separate the gold from the dross.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
