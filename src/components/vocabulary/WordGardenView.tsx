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
  Sparkles,
  ArrowRight,
  Filter,
  Trash2,
  RotateCw,
  Star,
  Tag,
  PenTool,
  X,
  Feather,
  Flower2,
  ExternalLink,
  ChevronDown,
  Layers,
} from "lucide-react";

export function WordGardenView() {
  const [words, setWords] = useState<VocabularyEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VocabStatus | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [activeMode, setActiveMode] = useState<"garden" | "flashcards" | "nuances">("garden");

  // Dictionary lookup state
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // New Word / Plant Modal
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    partOfSpeech: "adjective",
    phonetic: "",
    definition: "",
    exampleSentence: "",
    personalExample: "",
    contextualNuance: "",
    synonyms: "",
    nuancedDistinction: "",
    tags: "",
  });

  // Editing personal example state
  const [editingPersonalId, setEditingPersonalId] = useState<string | null>(null);
  const [editingPersonalText, setEditingPersonalText] = useState("");

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Interactive Nuance Comparator state
  const [compareWordAId, setCompareWordAId] = useState<string>("");
  const [compareWordBId, setCompareWordBId] = useState<string>("");

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    const list = hybridStore.getVocabulary();
    setWords(list);
    if (list.length >= 2 && !compareWordAId) {
      setCompareWordAId(list[0].id);
      setCompareWordBId(list[1].id);
    }
  };

  const handleLookup = async (overrideWord?: string) => {
    const wordToSearch = (overrideWord || lookupQuery).trim();
    if (!wordToSearch) return;

    if (overrideWord) {
      setLookupQuery(overrideWord);
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(wordToSearch)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Word not found in dictionary");
      }
      setLookupResult(data.entry);
    } catch (err: any) {
      setLookupError(err.message || "Failed to search word");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAddLookupToGarden = () => {
    if (!lookupResult || !lookupResult.found) return;

    const firstMeaning = lookupResult.meanings?.[0];
    const firstDef = firstMeaning?.definitions?.[0];

    hybridStore.saveVocabulary({
      word: lookupResult.word,
      partOfSpeech: firstMeaning?.partOfSpeech || lookupResult.partOfSpeech || "noun",
      phonetic: lookupResult.phonetic,
      definition:
        firstDef?.definition || lookupResult.definition || "Definition from literary lexicon.",
      exampleSentence:
        firstDef?.example ||
        lookupResult.exampleSentence ||
        `An evocative sentence using "${lookupResult.word}".`,
      contextualNuance: lookupResult.nuancedDistinction || lookupResult.nuances,
      synonyms: lookupResult.synonyms || [],
      sourceType: "manual_search",
      status: "learning",
    });
    loadWords();
    setLookupResult(null);
    setLookupQuery("");
  };

  const handleCreateNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word.trim() || !newWord.definition.trim()) return;

    const synList = newWord.synonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tagList = newWord.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    hybridStore.saveVocabulary({
      word: newWord.word.trim(),
      partOfSpeech: newWord.partOfSpeech.trim() || "noun",
      phonetic: newWord.phonetic.trim() || undefined,
      definition: newWord.definition.trim(),
      exampleSentence: newWord.exampleSentence.trim(),
      personalExample: newWord.personalExample.trim() || undefined,
      contextualNuance: newWord.contextualNuance.trim() || undefined,
      synonyms: synList,
      nuancedDistinction: newWord.nuancedDistinction.trim() || undefined,
      tags: tagList.length > 0 ? tagList : ["Custom"],
      sourceType: "manual_search",
      status: "learning",
    });

    loadWords();
    setIsPlantModalOpen(false);
    setNewWord({
      word: "",
      partOfSpeech: "adjective",
      phonetic: "",
      definition: "",
      exampleSentence: "",
      personalExample: "",
      contextualNuance: "",
      synonyms: "",
      nuancedDistinction: "",
      tags: "",
    });
  };

  const handleStatusChange = (id: string, newStatus: VocabStatus) => {
    hybridStore.updateVocabularyStatus(id, newStatus);
    loadWords();
  };

  const handleToggleFavorite = (id: string) => {
    hybridStore.toggleFavoriteWord(id);
    loadWords();
  };

  const handleSavePersonalExample = (id: string) => {
    hybridStore.savePersonalExample(id, editingPersonalText);
    setEditingPersonalId(null);
    loadWords();
  };

  const handleDeleteWord = (id: string) => {
    hybridStore.deleteVocabulary(id);
    loadWords();
  };

  const speakWord = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Collect all unique tags
  const allTags = [
    "all",
    ...Array.from(new Set(words.flatMap((w) => w.tags || []).filter(Boolean))),
  ];

  const filteredWords = words.filter((w) => {
    if (onlyFavorites && !w.isFavorite) return false;
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    if (selectedTag !== "all" && !(w.tags || []).includes(selectedTag)) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchWord = w.word.toLowerCase().includes(q);
      const matchDef = w.definition.toLowerCase().includes(q);
      const matchPersonal = (w.personalExample || "").toLowerCase().includes(q);
      const matchTags = (w.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchSynonyms = (w.synonyms || []).some((s) => s.toLowerCase().includes(q));
      return matchWord || matchDef || matchPersonal || matchTags || matchSynonyms;
    }
    return true;
  });

  const wordA = words.find((w) => w.id === compareWordAId) || words[0];
  const wordB = words.find((w) => w.id === compareWordBId) || words[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* EDITORIAL HEADER */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-sage flex items-center gap-1.5 mb-1">
            <BookOpen className="w-4 h-4" /> Word Garden • Personal Lexicon
          </span>
          <h1 className="font-literary text-3xl font-bold text-ink-primary">
            Cultivate Nuance & Voice
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            {words.length} literary words planted •{" "}
            {words.filter((w) => w.status === "mastered").length} mastered •{" "}
            {words.filter((w) => w.isFavorite).length} starred
          </p>
        </div>

        {/* View Mode Switcher & Add Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-paper p-1 rounded-xl border border-warm-border text-xs">
            <button
              onClick={() => setActiveMode("garden")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === "garden"
                  ? "bg-sage-surface text-deep-olive font-semibold shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Garden Grid ({words.length})
            </button>
            <button
              onClick={() => {
                setActiveMode("flashcards");
                setIsFlipped(false);
                setFlashcardIndex(0);
              }}
              disabled={words.length === 0}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === "flashcards"
                  ? "bg-sage-surface text-deep-olive font-semibold shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary disabled:opacity-40"
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveMode("nuances")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeMode === "nuances"
                  ? "bg-sage-surface text-deep-olive font-semibold shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              Nuance Comparator
            </button>
          </div>

          <button
            onClick={() => setIsPlantModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary-sage text-paper hover:bg-deep-olive transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Plant New Word</span>
          </button>
        </div>
      </div>

      {/* DICTIONARY LOOKUP & EXPLORATION BAR */}
      <div className="p-6 rounded-2xl border border-warm-border bg-sage-surface/40 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-secondary" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Search dictionary for meaning and literary nuance (e.g. luminescent, conceited, evocative)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-border bg-paper text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:border-primary-sage"
            />
          </div>
          <button
            type="submit"
            disabled={isLookingUp || !lookupQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-primary-sage text-paper text-xs font-semibold hover:bg-deep-olive transition-all shadow-xs disabled:opacity-50"
          >
            {isLookingUp ? "Consulting Lexicon..." : "Explore Word"}
          </button>
        </form>

        {lookupError && <p className="text-xs text-burgundy">{lookupError}</p>}

        {/* Live Lookup Result Card */}
        {lookupResult && (
          <div className="p-5 rounded-xl bg-paper border border-warm-border space-y-3 shadow-xs">
            {!lookupResult.found ? (
              /* Spelling Suggestion Banner */
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-medium text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>
                    Word "<strong>{lookupResult.word}</strong>" was not found in the dictionary.
                  </span>
                </div>

                {lookupResult.suggestions && lookupResult.suggestions.length > 0 ? (
                  <div className="space-y-1.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80">
                    <span className="text-[11px] font-semibold text-amber-950 uppercase tracking-wider">
                      Did you mean:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {lookupResult.suggestions.map((suggestion: string) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleLookup(suggestion)}
                          className="px-3 py-1 rounded-full bg-paper border border-amber-300 text-xs font-semibold text-amber-950 hover:bg-amber-100 hover:border-amber-400 transition-colors shadow-2xs"
                        >
                          {suggestion} →
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink-secondary italic">
                    No verified dictionary definition or spelling suggestion available.
                  </p>
                )}
              </div>
            ) : (
              /* Authentic Found Definition */
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-literary text-2xl font-bold text-ink-primary">
                        {lookupResult.word}
                      </h3>
                      {lookupResult.phonetic && (
                        <span className="text-xs font-mono text-ink-secondary">
                          {lookupResult.phonetic}
                        </span>
                      )}
                      {lookupResult.meanings?.[0]?.partOfSpeech && (
                        <span className="text-xs italic text-ink-secondary">
                          ({lookupResult.meanings[0].partOfSpeech})
                        </span>
                      )}
                    </div>

                    {/* Definitions */}
                    <div className="mt-2 space-y-1.5">
                      {(lookupResult.meanings || []).slice(0, 2).map((m: any, mIdx: number) => (
                        <div key={mIdx} className="space-y-1">
                          {lookupResult.meanings.length > 1 && (
                            <span className="text-[10px] uppercase font-bold text-primary-sage">
                              {m.partOfSpeech}
                            </span>
                          )}
                          {(m.definitions || []).slice(0, 2).map((d: any, dIdx: number) => (
                            <div key={dIdx} className="space-y-0.5">
                              <p className="font-literary text-sm text-ink-primary">
                                • {d.definition}
                              </p>
                              {d.example && (
                                <p className="text-xs text-ink-secondary italic font-literary pl-3">
                                  "{d.example}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddLookupToGarden}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary-sage text-paper hover:bg-deep-olive transition-all shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Plant in Garden
                  </button>
                </div>

                {/* Synonyms */}
                {lookupResult.synonyms && lookupResult.synonyms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-[11px] text-ink-secondary font-medium">Synonyms:</span>
                    {lookupResult.synonyms.slice(0, 6).map((syn: string) => (
                      <span
                        key={syn}
                        className="px-2 py-0.5 rounded-full bg-sanctuary border border-warm-border text-[11px] text-ink-primary"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                )}

                {/* Nuance distinction */}
                {lookupResult.nuancedDistinction && (
                  <div className="p-3 rounded-lg bg-sage-surface text-xs text-deep-olive border border-warm-border">
                    <strong>Nuance:</strong> {lookupResult.nuancedDistinction}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* MODE 1: GARDEN GRID */}
      {activeMode === "garden" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search words, definitions, notes..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-warm-border bg-paper text-xs text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:border-primary-sage"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Starred / Favorites button */}
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  onlyFavorites
                    ? "bg-primary-sage text-paper border-primary-sage"
                    : "bg-paper text-ink-secondary hover:text-ink-primary border-warm-border"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-current" : ""}`} />
                <span>Starred</span>
              </button>

              {/* Status filter pills */}
              <div className="flex items-center gap-1 text-xs">
                {(["all", "learning", "familiar", "mastered"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-all font-medium ${
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
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-ink-secondary text-[11px] font-medium mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Filter by:
              </span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-all capitalize ${
                    selectedTag === tag
                      ? "bg-primary-sage text-paper font-medium"
                      : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Cards Grid */}
          {filteredWords.length === 0 ? (
            <div className="p-12 rounded-2xl border border-warm-border bg-paper text-center space-y-3">
              <BookOpen className="w-8 h-8 text-primary-sage/60 mx-auto" />
              <h3 className="font-literary text-xl font-semibold text-ink-primary">
                No words match your filters
              </h3>
              <p className="text-xs text-ink-secondary max-w-md mx-auto">
                Explore words in the dictionary above, or plant a new word directly in your garden.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWords.map((entry) => (
                <div
                  key={entry.id}
                  className="p-6 rounded-2xl border border-warm-border bg-paper hover:border-primary-sage/40 transition-all shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: word, phonetic, part of speech, status, star */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-literary text-2xl font-bold text-ink-primary">
                            {entry.word}
                          </h4>
                          <button
                            onClick={() => speakWord(entry.word)}
                            className="p-1 rounded text-ink-secondary hover:text-primary-sage transition-colors"
                            title="Pronounce word"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                          {entry.phonetic && <span className="font-mono">{entry.phonetic}</span>}
                          <span>•</span>
                          <span className="italic">{entry.partOfSpeech}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFavorite(entry.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            entry.isFavorite
                              ? "text-primary-sage"
                              : "text-ink-secondary hover:text-ink-primary"
                          }`}
                          title="Star word"
                        >
                          <Star className={`w-3.5 h-3.5 ${entry.isFavorite ? "fill-current" : ""}`} />
                        </button>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            entry.status === "mastered"
                              ? "bg-botanical-light text-deep-olive border-warm-border"
                              : entry.status === "familiar"
                              ? "bg-sage-surface text-primary-sage border-warm-border"
                              : "bg-sanctuary text-ink-secondary border-warm-border"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>
                    </div>

                    {/* Definition */}
                    <p className="font-literary text-sm text-ink-primary leading-relaxed">
                      {entry.definition}
                    </p>

                    {/* Literary Example Sentence */}
                    {entry.exampleSentence && (
                      <div className="p-2.5 rounded-xl bg-sanctuary/60 border border-warm-border/60">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-ink-secondary mb-0.5">
                          Literary Example
                        </span>
                        <p className="font-literary text-xs italic text-ink-primary leading-relaxed">
                          "{entry.exampleSentence}"
                        </p>
                      </div>
                    )}

                    {/* Nuanced Distinction */}
                    {entry.nuancedDistinction && (
                      <div className="p-2.5 rounded-xl bg-sage-surface/60 border border-warm-border/60 text-xs text-deep-olive">
                        <strong className="block text-[10px] uppercase tracking-wider text-primary-sage mb-0.5 font-sans">
                          Nuance & Distinction:
                        </strong>
                        <p className="leading-relaxed">{entry.nuancedDistinction}</p>
                      </div>
                    )}

                    {/* Synonyms Chips */}
                    {entry.synonyms && entry.synonyms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary mr-1">
                          Synonyms:
                        </span>
                        {entry.synonyms.map((syn, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-sanctuary text-[11px] text-ink-secondary border border-warm-border"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Personal Example Sentence */}
                    <div className="pt-2 border-t border-warm-border/60">
                      <div className="flex items-center justify-between text-[11px] text-ink-secondary mb-1">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-primary-sage">
                          Personal Example
                        </span>
                        {editingPersonalId !== entry.id && (
                          <button
                            onClick={() => {
                              setEditingPersonalId(entry.id);
                              setEditingPersonalText(entry.personalExample || "");
                            }}
                            className="hover:text-ink-primary inline-flex items-center gap-1 text-[11px]"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>{entry.personalExample ? "Edit" : "Pen Sentence"}</span>
                          </button>
                        )}
                      </div>

                      {editingPersonalId === entry.id ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={editingPersonalText}
                            onChange={(e) => setEditingPersonalText(e.target.value)}
                            placeholder="Write your own sentence using this word..."
                            rows={2}
                            className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none focus:border-primary-sage"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingPersonalId(null)}
                              className="px-2.5 py-1 text-xs text-ink-secondary hover:text-ink-primary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSavePersonalExample(entry.id)}
                              className="px-3 py-1 bg-primary-sage text-paper text-xs font-semibold rounded-lg hover:bg-deep-olive"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : entry.personalExample ? (
                        <p className="font-literary text-xs italic text-ink-primary leading-relaxed bg-paper p-2 rounded-lg border border-warm-border/50">
                          "{entry.personalExample}"
                        </p>
                      ) : (
                        <p className="text-[11px] text-ink-secondary/70 italic">
                          No personal sentence yet. Pen one to deepen your memory.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="pt-3 border-t border-warm-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`status-select-${entry.id}`} className="sr-only">
                        Mastery status for {entry.word}
                      </label>
                      <select
                        id={`status-select-${entry.id}`}
                        value={entry.status}
                        onChange={(e) => handleStatusChange(entry.id, e.target.value as VocabStatus)}
                        className="px-2.5 py-1 rounded-lg border border-warm-border bg-paper text-xs text-ink-primary focus:outline-none"
                      >
                        <option value="learning">Learning</option>
                        <option value="familiar">Familiar</option>
                        <option value="mastered">Mastered</option>
                      </select>
                      {entry.tags && entry.tags.length > 0 && (
                        <span className="text-[11px] text-ink-secondary">
                          #{entry.tags[0]}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteWord(entry.id)}
                      className="text-ink-secondary hover:text-burgundy transition-colors p-1 rounded"
                      title="Remove word from garden"
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
            <span className="text-primary-sage font-medium">
              Click or press card to reveal meaning & distinction
            </span>
          </div>

          {/* Flashcard with Flip Animation */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[340px] p-8 rounded-2xl border-2 border-warm-border bg-paper shadow-md flex flex-col items-center justify-center text-center space-y-4 transition-transform duration-300 hover:scale-[1.01]"
          >
            {!isFlipped ? (
              <>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-sage">
                  Prompt • Front
                </span>
                <h3 className="font-literary text-4xl font-bold text-ink-primary">
                  {words[flashcardIndex].word}
                </h3>
                <div className="flex items-center gap-2 text-xs text-ink-secondary">
                  {words[flashcardIndex].phonetic && (
                    <span className="font-mono">{words[flashcardIndex].phonetic}</span>
                  )}
                  <span>•</span>
                  <span className="italic">{words[flashcardIndex].partOfSpeech}</span>
                </div>
                <p className="text-xs text-ink-secondary pt-4 italic">
                  (Tap to flip for definition, nuance & examples)
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-deep-olive">
                  Definition & Nuance
                </span>
                <p className="font-literary text-xl font-medium text-ink-primary leading-relaxed">
                  {words[flashcardIndex].definition}
                </p>
                {words[flashcardIndex].nuancedDistinction && (
                  <p className="text-xs text-deep-olive bg-sage-surface p-3 rounded-xl border border-warm-border text-left leading-relaxed">
                    <strong>Distinction:</strong> {words[flashcardIndex].nuancedDistinction}
                  </p>
                )}
                {words[flashcardIndex].exampleSentence && (
                  <p className="text-xs text-ink-secondary italic font-literary">
                    "{words[flashcardIndex].exampleSentence}"
                  </p>
                )}
                {words[flashcardIndex].personalExample && (
                  <p className="text-xs text-primary-sage italic font-literary bg-sanctuary p-2 rounded-lg">
                    Personal: "{words[flashcardIndex].personalExample}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Flashcard Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl border border-warm-border bg-paper text-xs font-medium text-ink-primary hover:bg-sage-surface"
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
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary-sage text-paper text-xs font-semibold hover:bg-deep-olive"
            >
              <Check className="w-3.5 h-3.5" /> Mark as Mastered
            </button>

            <button
              onClick={() => {
                setFlashcardIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0));
                setIsFlipped(false);
              }}
              className="px-4 py-2 rounded-xl border border-warm-border bg-paper text-xs font-medium text-ink-primary hover:bg-sage-surface"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: NUANCE COMPARATOR */}
      {activeMode === "nuances" && (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl border border-warm-border bg-paper space-y-2">
            <h3 className="font-literary text-2xl font-bold text-ink-primary">
              Distinguishing Close Synonyms
            </h3>
            <p className="text-xs text-ink-secondary max-w-2xl leading-relaxed">
              Elevating literary vocabulary is rarely about memorizing obscure terms; it is about choosing the exact word whose emotional temperature fits the sentence.
            </p>
          </div>

          {/* Interactive Side-by-Side Word Comparator */}
          {words.length >= 2 && (
            <div className="p-6 rounded-2xl border border-warm-border bg-paper space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-border pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-sage">
                  Compare Words from Your Garden
                </span>
                <span className="text-xs text-ink-secondary">
                  Choose two words to inspect their subtle contrasts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Word A */}
                <div className="p-5 rounded-xl border border-warm-border bg-sanctuary space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-secondary">Word A</span>
                    <label htmlFor="compare-select-word-a" className="sr-only">Select first word to compare</label>
                    <select
                      id="compare-select-word-a"
                      value={compareWordAId}
                      onChange={(e) => setCompareWordAId(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-warm-border bg-paper text-xs text-ink-primary"
                    >
                      {words.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.word}
                        </option>
                      ))}
                    </select>
                  </div>

                  {wordA && (
                    <div className="space-y-2">
                      <h4 className="font-literary text-2xl font-bold text-ink-primary">
                        {wordA.word}
                      </h4>
                      <p className="font-literary text-sm text-ink-primary">
                        {wordA.definition}
                      </p>
                      {wordA.nuancedDistinction && (
                        <p className="text-xs text-deep-olive bg-sage-surface p-2.5 rounded-lg border border-warm-border">
                          {wordA.nuancedDistinction}
                        </p>
                      )}
                      {wordA.exampleSentence && (
                        <p className="text-xs text-ink-secondary italic font-literary">
                          "{wordA.exampleSentence}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Word B */}
                <div className="p-5 rounded-xl border border-warm-border bg-sanctuary space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-secondary">Word B</span>
                    <label htmlFor="compare-select-word-b" className="sr-only">Select second word to compare</label>
                    <select
                      id="compare-select-word-b"
                      value={compareWordBId}
                      onChange={(e) => setCompareWordBId(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-warm-border bg-paper text-xs text-ink-primary"
                    >
                      {words.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.word}
                        </option>
                      ))}
                    </select>
                  </div>

                  {wordB && (
                    <div className="space-y-2">
                      <h4 className="font-literary text-2xl font-bold text-ink-primary">
                        {wordB.word}
                      </h4>
                      <p className="font-literary text-sm text-ink-primary">
                        {wordB.definition}
                      </p>
                      {wordB.nuancedDistinction && (
                        <p className="text-xs text-deep-olive bg-sage-surface p-2.5 rounded-lg border border-warm-border">
                          {wordB.nuancedDistinction}
                        </p>
                      )}
                      {wordB.exampleSentence && (
                        <p className="text-xs text-ink-secondary italic font-literary">
                          "{wordB.exampleSentence}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Curated Literary Clusters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cluster 1: Time & Transience */}
            <div className="p-6 rounded-2xl border border-warm-border bg-paper space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-sage">
                Cluster 1: Time & Transience
              </span>
              <div className="space-y-3">
                <div className="p-3 bg-sanctuary rounded-xl border border-warm-border">
                  <strong className="text-sm font-literary text-ink-primary">Ephemeral:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Fragile and poignant; heightened by its awareness of fleeting beauty (e.g. dawn mist, cherry blossoms).
                  </p>
                </div>
                <div className="p-3 bg-sanctuary rounded-xl border border-warm-border">
                  <strong className="text-sm font-literary text-primary-sage">Transient:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Passing through without staying permanently; often applied to travelers, moods, or practical conditions.
                  </p>
                </div>
                <div className="p-3 bg-sanctuary rounded-xl border border-warm-border">
                  <strong className="text-sm font-literary text-deep-olive">Evanescent:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Vanishing like vapor; emphasizes the physical act of dissolving gently into nothingness.
                  </p>
                </div>
              </div>
            </div>

            {/* Cluster 2: Interior Solitude */}
            <div className="p-6 rounded-2xl border border-warm-border bg-paper space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-deep-olive">
                Cluster 2: Aloneness & Interiority
              </span>
              <div className="space-y-3">
                <div className="p-3 bg-sanctuary rounded-xl border border-warm-border">
                  <strong className="text-sm font-literary text-deep-olive">Solitude:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Restorative and joyous companionship with one's mind; a fertile ground for thought.
                  </p>
                </div>
                <div className="p-3 bg-sanctuary rounded-xl border border-warm-border">
                  <strong className="text-sm font-literary text-ink-primary">Loneliness:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    The painful ache of emotional isolation and felt absence of connection.
                  </p>
                </div>
                <div className="p-3 bg-sanctuary rounded-xl border border-warm-border">
                  <strong className="text-sm font-literary text-primary-sage">Seclusion:</strong>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Physical sheltering away from the crowd, noise, or public gaze.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLANT NEW WORD MODAL */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-paper border border-warm-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-warm-border pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-sage">
                  Personal Lexicon
                </span>
                <h3 className="font-literary text-xl font-bold text-ink-primary">
                  Plant a New Word
                </h3>
              </div>
              <button
                onClick={() => setIsPlantModalOpen(false)}
                className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewWord} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Word *</label>
                  <input
                    type="text"
                    required
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="e.g. susurrus"
                    className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none focus:border-primary-sage"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Part of Speech</label>
                  <select
                    value={newWord.partOfSpeech}
                    onChange={(e) => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                  >
                    <option value="noun">Noun</option>
                    <option value="adjective">Adjective</option>
                    <option value="verb">Verb</option>
                    <option value="adverb">Adverb</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-secondary">Pronunciation Guide</label>
                <input
                  type="text"
                  value={newWord.phonetic}
                  onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                  placeholder="e.g. /suːˈsʌr.əs/"
                  className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-secondary">Definition *</label>
                <textarea
                  required
                  rows={2}
                  value={newWord.definition}
                  onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                  placeholder="Precise meaning..."
                  className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none focus:border-primary-sage"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-secondary">Usage Example</label>
                <input
                  type="text"
                  value={newWord.exampleSentence}
                  onChange={(e) => setNewWord({ ...newWord, exampleSentence: e.target.value })}
                  placeholder="Sentence from reading or classic prose..."
                  className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-secondary">Personal Example Sentence</label>
                <input
                  type="text"
                  value={newWord.personalExample}
                  onChange={(e) => setNewWord({ ...newWord, personalExample: e.target.value })}
                  placeholder="Your own crafted sentence..."
                  className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-secondary">Nuanced Distinction</label>
                <textarea
                  rows={2}
                  value={newWord.nuancedDistinction}
                  onChange={(e) => setNewWord({ ...newWord, nuancedDistinction: e.target.value })}
                  placeholder="Why this word over its close synonyms? (e.g. softer than whisper)..."
                  className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Synonyms (comma-separated)</label>
                  <input
                    type="text"
                    value={newWord.synonyms}
                    onChange={(e) => setNewWord({ ...newWord, synonyms: e.target.value })}
                    placeholder="murmur, rustle, sigh"
                    className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-ink-secondary">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newWord.tags}
                    onChange={(e) => setNewWord({ ...newWord, tags: e.target.value })}
                    placeholder="Nature, Sound, Poetic"
                    className="w-full p-2.5 rounded-xl border border-warm-border bg-sanctuary text-xs text-ink-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-warm-border">
                <button
                  type="button"
                  onClick={() => setIsPlantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary-sage text-paper hover:bg-deep-olive transition-colors"
                >
                  Plant in Garden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
