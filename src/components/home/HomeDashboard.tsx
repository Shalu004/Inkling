"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { CURATED_BOOKS, CURATED_DISCOVERIES, CURATED_PROMPTS } from "@/lib/curated/data";
import {
  JournalEntry,
  BookItem,
  LiteraryDiscovery,
  WritingSession,
  LittlePlanTask,
  VocabularyEntry,
} from "@/types";
import { Footer } from "@/components/layout/Footer";
import { FeatherIcon } from "@/components/brand/Logo";
import {
  BookHeart,
  BookOpen,
  PenTool,
  Compass,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  ChevronRight,
  Feather,
  ListTodo,
  CheckCircle2,
  Circle,
  Calendar,
  BarChart2,
  Heart,
  Layers,
  Sprout,
  Plus,
  Quote,
  Library,
  BookMarked,
  ScrollText,
} from "lucide-react";

export function HomeDashboard() {
  const [greeting, setGreeting] = useState("Welcome to your sanctuary");
  const [subGreeting, setSubGreeting] = useState("A quiet space for thoughts becoming words.");
  const [formattedDate, setFormattedDate] = useState("");
  const [mounted, setMounted] = useState(false);

  // Store data
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [writingSessions, setWritingSessions] = useState<WritingSession[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<BookItem[]>([]);
  const [plans, setPlans] = useState<LittlePlanTask[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [todayQuote, setTodayQuote] = useState<LiteraryDiscovery | null>(null);
  const [progressSummary, setProgressSummary] = useState({
    totalWords: 0,
    totalSessions: 0,
    totalSparks: 0,
    streak: 0,
    vocabTotal: 0,
  });

  useEffect(() => {
    setMounted(true);

    // 1. Time-of-day greeting & localized date
    const now = new Date();
    const hour = now.getHours();
    setFormattedDate(
      now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );

    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning, writer");
      setSubGreeting("The dawn hours are yours. The kettle is warm, and the pages are quiet.");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("A quiet afternoon in the library");
      setSubGreeting("Pause the rush outside. Let your thoughts settle and breathe.");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Gentle evening");
      setSubGreeting("Close the door on the day's clamor. Settle in with a book and your notebook.");
    } else {
      setGreeting("Late night in the sanctuary");
      setSubGreeting("The world is asleep. What thoughts only arrive in midnight stillness?");
    }

    // 2. Load data from persistent hybrid store
    setJournalEntries(hybridStore.getJournalEntries());
    setWritingSessions(hybridStore.getWritingSessions());
    setLibraryBooks(hybridStore.getLibraryBooks());
    setPlans(hybridStore.getPlans());
    setVocabulary(hybridStore.getVocabulary());
    setProgressSummary(hybridStore.getProgressSummary());

    // 3. Verified daily quote
    const daily = hybridStore.getDailyQuote();
    setTodayQuote({
      id: daily.id,
      title: daily.work,
      author: daily.author,
      type: "quote",
      excerpt: `“${daily.quote}”`,
      source: `${daily.work}${daily.year ? ` (${daily.year})` : ""}`,
      tags: ["Daily Quote", daily.theme],
    });
  }, []);

  const latestEntry = journalEntries[0] || null;
  const favoriteEntries = journalEntries.filter((e) => e.isFavorite).slice(0, 3);
  const recentDrafts = writingSessions.slice(0, 3);
  const currentlyReading =
    libraryBooks.find((b) => b.status === "currently_reading") || libraryBooks[0] || null;
  const pendingPlans = plans.filter((p) => !p.completed).slice(0, 3);
  const recentVocab = vocabulary.slice(0, 3);
  const sparkPrompt = CURATED_PROMPTS[0];
  const featuredDiscovery = CURATED_DISCOVERIES[0];

  const handleTogglePlan = (id: string) => {
    hybridStore.togglePlan(id);
    setPlans(hybridStore.getPlans());
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* 1. EDITORIAL HERO WELCOME */}
      <section className="relative w-full border-b border-[var(--border-warm)] bg-[var(--bg-paper)]/70 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top metadata pill */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-sage-surface)]/70 border border-[var(--border-warm)]/80 text-xs text-[var(--accent-olive)] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" />
              <span className="tracking-wide uppercase text-[10px] font-semibold">Inkling Sanctuary</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span suppressHydrationWarning className="text-[var(--text-main)] font-serif italic">
                {mounted ? formattedDate : "Today"}
              </span>
            </div>

            {/* Daily streak indicator */}
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span>Quiet writing cadence: <strong className="text-[var(--text-main)]">{progressSummary.streak} {progressSummary.streak === 1 ? "day" : "days"}</strong></span>
            </div>
          </div>

          {/* Headline & literary subhead */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="font-literary text-3xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-main)] tracking-tight leading-[1.12]">
                {greeting}.
              </h1>
              <p className="font-literary text-lg sm:text-2xl text-[var(--text-muted)] italic leading-relaxed max-w-2xl">
                "{subGreeting}"
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="lg:col-span-4 flex flex-wrap lg:flex-col items-stretch justify-end gap-2.5">
              <Link
                href="/journal"
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-sm group"
              >
                <BookHeart className="w-4 h-4" />
                <span>Open Journal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="flex items-center gap-2 w-full">
                <Link
                  href="/write"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[var(--text-main)] text-xs font-semibold hover:bg-[var(--bg-sage-surface)] hover:border-[var(--accent-sage)]/50 transition-all shadow-2xs"
                >
                  <PenTool className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                  <span>Free Write</span>
                </Link>

                <Link
                  href="/plans"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[var(--text-main)] text-xs font-semibold hover:bg-[var(--bg-sage-surface)] hover:border-[var(--accent-sage)]/50 transition-all shadow-2xs"
                >
                  <ListTodo className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                  <span>Little Plans</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Daily Quote Inscription */}
          {todayQuote && (
            <div className="pt-4 border-t border-[var(--border-warm)]/60 flex items-start gap-3">
              <Quote className="w-4 h-4 text-[var(--accent-sage)] shrink-0 mt-0.5 opacity-60" />
              <div className="space-y-0.5 text-xs">
                <span className="font-literary italic text-[var(--text-body)]">
                  {todayQuote.excerpt}
                </span>
                <span className="text-[var(--text-muted)] text-[11px] block">
                  — {todayQuote.author}, <span className="italic">{todayQuote.source}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MAIN SANCTUARY BODY */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-16 sm:space-y-20 flex-1 w-full">

        {/* 2. PICK UP WHERE I LEFT OFF & CONTINUE READING */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[var(--border-warm)]/80 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-sage)]">
                Recent Sanctuary Activity
              </span>
              <h2 className="font-literary text-2xl sm:text-3xl font-semibold text-[var(--text-main)]">
                Pick up where you left off
              </h2>
            </div>
            <Link
              href="/journal"
              className="text-xs text-[var(--accent-sage)] hover:text-[var(--accent-olive)] font-medium flex items-center gap-1 group"
            >
              <span>View all entries</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Recent Journal Entry: Open Notebook Page Aesthetic (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-[var(--accent-sage)]/60 transition-all">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-sage)]" />
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-[var(--accent-sage)]">
                      Latest Diary Reflection
                    </span>
                    {latestEntry?.mood && (
                      <span className="capitalize px-2 py-0.5 rounded-full bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] text-[11px] font-medium">
                        {latestEntry.mood}
                      </span>
                    )}
                  </div>

                  {latestEntry && (
                    <span suppressHydrationWarning className="font-serif italic text-xs">
                      {mounted
                        ? new Date(latestEntry.date + "T00:00:00").toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                          })
                        : latestEntry.date}
                    </span>
                  )}
                </div>

                {latestEntry ? (
                  <>
                    <h3 className="font-literary text-xl sm:text-2xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent-sage)] transition-colors leading-snug">
                      {latestEntry.title || "Untitled Reflection"}
                    </h3>

                    <p className="font-literary text-sm sm:text-base text-[var(--text-body)] leading-relaxed line-clamp-4 italic">
                      "{latestEntry.body}"
                    </p>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <p className="font-literary text-sm text-[var(--text-muted)] italic">
                      No diary memories recorded yet. Your sanctuary notebook is waiting.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-warm)]/60 flex items-center justify-between gap-2">
                {latestEntry ? (
                  <Link
                    href={`/journal?id=${latestEntry.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-sage)] hover:text-[var(--accent-olive)] group"
                  >
                    <span>Continue writing this reflection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    href="/journal"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Begin your first entry</span>
                  </Link>
                )}

                {latestEntry?.tags && latestEntry.tags.length > 0 && (
                  <div className="hidden sm:flex gap-1.5">
                    {latestEntry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-main)] text-[var(--text-muted)]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Continue Reading Card (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 hover:border-[var(--accent-sage)]/60 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-sage)]">
                    Reading Nook
                  </span>
                  <Link href="/library" className="text-xs hover:text-[var(--text-main)] font-medium">
                    My Shelf ({libraryBooks.length}) →
                  </Link>
                </div>

                {currentlyReading ? (
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-24 rounded-lg bg-[var(--bg-sage-surface)] border border-[var(--border-warm)] flex items-center justify-center text-[var(--accent-sage)] shrink-0 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] font-semibold uppercase">
                        {currentlyReading.genre || "Classic"}
                      </span>
                      <h3 className="font-literary text-lg font-bold text-[var(--text-main)] leading-snug truncate">
                        {currentlyReading.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] italic truncate">
                        By {currentlyReading.author}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-1">
                    <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)]/50" />
                    <p className="font-literary text-sm text-[var(--text-muted)] italic">
                      No active book currently on your stand.
                    </p>
                  </div>
                )}

                {currentlyReading && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Reading Progress</span>
                      <span className="font-semibold text-[var(--text-main)] font-mono text-[11px]">
                        {currentlyReading.currentPage || 1} / {currentlyReading.estimatedPages || 100} pages
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-sage-surface)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-sage)] rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((currentlyReading.currentPage || 1) /
                                (currentlyReading.estimatedPages || 100)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-warm)]/60">
                {currentlyReading ? (
                  <Link
                    href={`/read?bookId=${currentlyReading.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)] hover:text-[var(--accent-olive)]"
                  >
                    <span>Resume reading in nook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/library"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select a book from library</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. RECENT MANUSCRIPTS & DRAFTS (WRITING STUDIO) */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[var(--border-warm)]/80 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-sage)]">
                Writing Studio
              </span>
              <h2 className="font-literary text-2xl sm:text-3xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <span>Recent Manuscripts &amp; Drafts</span>
              </h2>
            </div>
            <Link
              href="/write"
              className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>New Document</span>
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDrafts.length > 0 ? (
              recentDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/write?id=${draft.id}`}
                  className="p-5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:border-[var(--accent-sage)] hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] font-semibold uppercase tracking-wider">
                        {(draft.documentType || "essay").replace(/_/g, " ")}
                      </span>
                      <span className="font-mono">{draft.wordCount || 0} words</span>
                    </div>

                    <h4 className="font-literary text-base font-bold text-[var(--text-main)] group-hover:text-[var(--accent-sage)] transition-colors line-clamp-1">
                      {draft.title || "Untitled Document"}
                    </h4>

                    <p className="font-literary text-xs text-[var(--text-body)] line-clamp-3 leading-relaxed">
                      {draft.content ? draft.content.replace(/<[^>]*>?/gm, "").slice(0, 120) + "..." : "Empty document canvas..."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-warm)]/50 flex items-center justify-between text-xs font-semibold text-[var(--accent-sage)]">
                    <span>Open in Studio →</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-normal">
                      {draft.status === "published" ? "Published" : "Draft in progress"}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 p-8 rounded-xl border border-dashed border-[var(--border-warm)] text-center text-xs text-[var(--text-muted)] space-y-2">
                <ScrollText className="w-8 h-8 mx-auto text-[var(--accent-sage)] opacity-50" />
                <p className="font-literary text-sm italic">
                  No manuscripts in the studio yet. Craft your next essay, chapter, poem, or reflection.
                </p>
                <Link
                  href="/write"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-colors shadow-2xs"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open Write Studio</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 4. CHERISHED MEMORIES & SOMETHING TO DISCOVER */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cherished Memories (Dusty Rose Accent Wash) - 6 cols */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-baseline justify-between border-b border-[var(--border-warm)]/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#754650]">
                  Sanctuary Vault
                </span>
                <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#754650] fill-[#754650]" />
                  <span>Cherished Memories</span>
                </h2>
              </div>
              <Link
                href="/journal"
                className="text-xs text-[#754650] hover:underline font-semibold"
              >
                All Favorites ({favoriteEntries.length}) →
              </Link>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3">
              {favoriteEntries.length > 0 ? (
                favoriteEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal?id=${entry.id}`}
                    className="p-3.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-main)]/50 hover:border-[#754650]/50 transition-all space-y-1 block group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span suppressHydrationWarning className="font-serif italic">
                        {mounted
                          ? new Date(entry.date + "T00:00:00").toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : entry.date}
                      </span>
                      <Heart className="w-3 h-3 fill-[#754650] text-[#754650]" />
                    </div>
                    <h4 className="font-literary text-sm font-semibold text-[var(--text-main)] group-hover:text-[#754650] transition-colors truncate">
                      {entry.title || "Untitled Memory"}
                    </h4>
                    <p className="font-literary text-xs text-[var(--text-body)] line-clamp-2 italic leading-relaxed">
                      "{entry.body}"
                    </p>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="font-literary text-xs text-[var(--text-muted)] italic">
                    Tap the heart icon on any diary entry to preserve it here as a cherished memory.
                  </p>
                  <Link
                    href="/journal"
                    className="text-xs text-[#754650] font-semibold hover:underline"
                  >
                    Browse Journal →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Something to Discover (Gold / Literature Accent) - 6 cols */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-baseline justify-between border-b border-[var(--border-warm)]/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-sage)]">
                  World Literature
                </span>
                <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span>Something to Discover</span>
                </h2>
              </div>
              <Link
                href="/explore"
                className="text-xs text-[var(--accent-sage)] hover:underline font-semibold"
              >
                Explore Archives →
              </Link>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-sage)] tracking-wider">
                  {featuredDiscovery.type.toUpperCase()} OF THE DAY
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] font-medium">
                  {featuredDiscovery.tags[0] || featuredDiscovery.type}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-literary text-lg font-bold text-[var(--text-main)]">
                  {featuredDiscovery.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] italic">
                  By {featuredDiscovery.author} ({featuredDiscovery.year})
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/80 text-xs">
                <p className="font-literary italic text-[var(--text-body)] leading-relaxed line-clamp-4">
                  "{featuredDiscovery.excerpt}"
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--text-muted)]">
                  {featuredDiscovery.source}
                </span>
                <Link
                  href="/explore"
                  className="font-semibold text-[var(--accent-sage)] hover:underline"
                >
                  Read in Sanctuary →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LITTLE PLANS (GENTLE INTENTIONS) */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[var(--border-warm)]/80 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-sage)]">
                Calm Planning Notebook
              </span>
              <h2 className="font-literary text-2xl sm:text-3xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[var(--accent-sage)]" />
                <span>Little Plans for Today</span>
              </h2>
            </div>
            <Link
              href="/plans"
              className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Notebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pendingPlans.length > 0 ? (
              pendingPlans.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3 flex flex-col justify-between hover:border-[var(--accent-sage)]/60 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleTogglePlan(task.id)}
                      className="mt-0.5 text-[var(--accent-sage)] hover:opacity-80 transition-opacity"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 fill-[var(--accent-sage)] text-white" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--border-warm)]" />
                      )}
                    </button>
                    <div className="space-y-1 min-w-0">
                      <span className="font-literary text-sm font-semibold text-[var(--text-main)] block leading-snug">
                        {task.title}
                      </span>
                      {task.notes && (
                        <p className="text-xs text-[var(--text-body)] line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-warm)]/50">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-[var(--bg-main)]">
                      {task.priority} Priority
                    </span>
                    {task.linkedItem && (
                      <span className="text-[var(--accent-sage)] truncate max-w-[120px] font-medium">
                        {task.linkedItem.title}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-8 rounded-xl border border-dashed border-[var(--border-warm)] text-center text-xs text-[var(--text-muted)] italic">
                All daily intentions completed. Ready to set a quiet new goal in Little Plans.
              </div>
            )}
          </div>
        </section>

        {/* 6. WORD GARDEN & TWO-MINUTE SPARK */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Word Garden Lexicon */}
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)]">
                  <Sprout className="w-4 h-4" />
                  <span>Word Garden • Living Lexicon</span>
                </div>
                <Link
                  href="/vocabulary"
                  className="text-xs text-[var(--accent-sage)] hover:underline font-semibold"
                >
                  Browse All ({vocabulary.length}) →
                </Link>
              </div>

              <div className="space-y-2">
                {recentVocab.slice(0, 2).map((w) => (
                  <div key={w.id} className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70 text-xs space-y-1">
                    <div className="flex items-baseline gap-2">
                      <strong className="font-literary text-sm text-[var(--text-main)]">
                        {w.word}
                      </strong>
                      {w.phonetic && (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {w.phonetic}
                        </span>
                      )}
                      <span className="text-[10px] italic text-[var(--text-muted)]">
                        ({w.partOfSpeech})
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-body)] line-clamp-1 leading-relaxed">
                      {w.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-warm)]/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--text-muted)]">
                Cultivate words to sharpen your literary voice.
              </span>
              <Link
                href="/vocabulary"
                className="font-semibold text-[var(--accent-sage)] hover:underline"
              >
                Grow Lexicon →
              </Link>
            </div>
          </div>

          {/* Two-Minute Spark Vignette */}
          <div className="p-6 sm:p-7 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#754650]">
                  <Sparkles className="w-4 h-4" />
                  <span>Two-Minute Spark</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  Micro-Writing
                </span>
              </div>

              <h3 className="font-literary text-lg font-bold text-[var(--text-main)]">
                {sparkPrompt.title}
              </h3>

              <div className="p-4 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70">
                <p className="font-literary text-xs text-[var(--text-body)] italic leading-relaxed">
                  "{sparkPrompt.promptText}"
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-warm)]/60 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                120 seconds of undivided focus
              </span>
              <Link
                href="/spark"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#754650] text-white text-xs font-semibold hover:bg-[#5a343c] transition-all shadow-xs"
              >
                <span>Write 2-Min Spark</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. SANCTUARY TAPESTRY: MILESTONES & CALENDAR MEMORIES */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pt-2">
          {/* Milestones Card (6 cols) */}
          <div className="md:col-span-6 p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-literary text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Sanctuary Milestones</span>
              </h3>
              <Link
                href="/progress"
                className="text-xs text-[var(--accent-sage)] hover:underline font-semibold"
              >
                Progress Dashboard →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {progressSummary.totalWords}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Words Composed
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {progressSummary.streak}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Day Quiet Streak
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {journalEntries.length}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Diary Reflections
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {vocabulary.length}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Words Cultivated
                </p>
              </div>
            </div>
          </div>

          {/* Calendar & Memories Snapshot (6 cols) */}
          <div className="md:col-span-6 p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-literary text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-sage)]" />
                  <span>Calendar &amp; Memories</span>
                </h3>
                <Link
                  href="/calendar"
                  className="text-xs text-[var(--accent-sage)] hover:underline font-semibold"
                >
                  View Calendar →
                </Link>
              </div>

              <p className="text-xs text-[var(--text-body)] leading-relaxed">
                Every journal entry, longform manuscript draft, and two-minute spark is cataloged chronologically, preserving your creative journey across the seasons.
              </p>

              <div className="p-3 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-warm)]/70 text-xs flex items-center justify-between">
                <span className="text-[var(--text-main)] font-medium">
                  {journalEntries.length + writingSessions.length} memories &amp; drafts preserved
                </span>
                <span className="text-[11px] text-[var(--accent-sage)] font-semibold">
                  Safe &amp; Private
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-warm)]/60">
              <Link
                href="/calendar"
                className="text-xs font-semibold text-[var(--accent-sage)] hover:underline flex items-center gap-1"
              >
                <span>Browse memories by date</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* 8. SHARED THEME-AWARE SANCTUARY FOOTER */}
      <Footer />
    </div>
  );
}
