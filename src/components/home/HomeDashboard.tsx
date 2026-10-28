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
} from "lucide-react";

export function HomeDashboard() {
  const [greeting, setGreeting] = useState("Welcome to your sanctuary");
  const [subGreeting, setSubGreeting] = useState("A quiet space for thoughts becoming words.");
  const [formattedDate, setFormattedDate] = useState("");

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
    libraryBooks.find((b) => b.status === "currently_reading") || libraryBooks[0];
  const pendingPlans = plans.filter((p) => !p.completed).slice(0, 3);
  const recentVocab = vocabulary.slice(0, 3);
  const sparkPrompt = CURATED_PROMPTS[0];

  const handleTogglePlan = (id: string) => {
    hybridStore.togglePlan(id);
    setPlans(hybridStore.getPlans());
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-paper)] text-[var(--text-main)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-14 flex-1 w-full">
        {/* 1. GENTLE EDITORIAL GREETING & WRITING SHORTCUTS */}
        <section className="relative pb-8 border-b border-[var(--border-warm)] space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[var(--accent-sage)] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" />
            <span>Inkling Sanctuary</span>
            <span>•</span>
            <span className="text-[var(--text-muted)] font-normal lowercase">
              {formattedDate || "today"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-literary text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-main)] tracking-tight leading-tight">
                {greeting}.
              </h1>
              <p className="font-literary text-lg sm:text-xl text-[var(--text-muted)] italic leading-relaxed">
                "{subGreeting}"
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs"
              >
                <BookHeart className="w-4 h-4" />
                <span>Open Journal</span>
              </Link>

              <Link
                href="/write"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[var(--text-main)] text-xs font-medium hover:bg-[var(--bg-sage-surface)] transition-colors"
                title="Start a new longform essay or reflection"
              >
                <PenTool className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                <span>Free Write</span>
              </Link>

              <Link
                href="/plans"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[var(--text-main)] text-xs font-medium hover:bg-[var(--bg-sage-surface)] transition-colors"
                title="View your daily intentions and tasks"
              >
                <ListTodo className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                <span className="hidden sm:inline">Little Plans</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2 & 6. RECENT JOURNAL ENTRY + CONTINUE READING */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Recent Journal Entry (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <span>Pick up where I left off</span>
              </h2>
              <Link
                href="/journal"
                className="text-xs text-[var(--accent-sage)] hover:text-[var(--accent-olive)] font-medium flex items-center gap-1 group"
              >
                <span>View all entries</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {latestEntry ? (
              <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs relative overflow-hidden group space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--accent-sage)]">Latest diary reflection</span>
                  <span>•</span>
                  <span>
                    {new Date(latestEntry.date + "T00:00:00").toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {latestEntry.mood && (
                    <>
                      <span>•</span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)]">
                        {latestEntry.mood}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="font-literary text-xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent-sage)] transition-colors">
                  {latestEntry.title || "Untitled Reflection"}
                </h3>

                <p className="font-literary text-sm text-[var(--text-body)] leading-relaxed line-clamp-3">
                  {latestEntry.body}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <Link
                    href={`/journal?id=${latestEntry.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)] hover:underline"
                  >
                    <span>Continue writing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {latestEntry.tags && latestEntry.tags.length > 0 && (
                    <div className="flex gap-1.5">
                      {latestEntry.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] text-[var(--text-muted)]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-[var(--border-warm)] text-center space-y-2">
                <p className="font-literary text-sm text-[var(--text-muted)] italic">
                  No diary entries recorded yet.
                </p>
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-1 text-xs text-[var(--accent-sage)] font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write your first entry</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Continue Reading Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)]">
                Continue Reading
              </h2>
              <Link
                href="/library"
                className="text-xs text-[var(--accent-sage)] hover:text-[var(--accent-olive)] font-medium flex items-center gap-1 group"
              >
                <span>My Library</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {currentlyReading ? (
              <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-20 rounded-md bg-[var(--bg-sage-surface)] border border-[var(--border-warm)] flex items-center justify-center text-[var(--accent-sage)] shrink-0 shadow-xs">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-[var(--accent-sage)] tracking-wider">
                      Currently Reading
                    </span>
                    <h3 className="font-literary text-lg font-bold text-[var(--text-main)] leading-snug truncate">
                      {currentlyReading.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {currentlyReading.author}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span>Reading Progress</span>
                    <span className="font-semibold text-[var(--text-main)]">
                      {currentlyReading.currentPage || 1} of {currentlyReading.estimatedPages || 100} pages
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-sage-surface)] overflow-hidden">
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

                <div className="pt-2">
                  <Link
                    href={`/read?bookId=${currentlyReading.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)] hover:underline"
                  >
                    <span>Open in Reading Nook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-[var(--border-warm)] text-center space-y-2">
                <p className="font-literary text-sm text-[var(--text-muted)] italic">
                  No book currently active.
                </p>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-1 text-xs text-[var(--accent-sage)] font-semibold hover:underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Discover a book to read</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 3 & 4. RECENT DRAFTS & FAVORITE JOURNAL ENTRIES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-4 border-t border-[var(--border-warm)]">
          {/* Recent Drafts & Manuscripts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-literary text-xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Recent Manuscripts &amp; Drafts</span>
              </h2>
              <Link
                href="/write"
                className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-0.5"
              >
                <span>Write Studio</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {recentDrafts.length > 0 ? (
              <div className="space-y-2.5">
                {recentDrafts.map((draft) => (
                  <Link
                    key={draft.id}
                    href={`/write?id=${draft.id}`}
                    className="p-3.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:border-[var(--accent-sage)] hover:bg-[var(--bg-sage-surface)]/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-literary text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-sage)] transition-colors truncate">
                          {draft.title || "Untitled Document"}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] capitalize shrink-0">
                          {(draft.documentType || "essay").replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {draft.content ? draft.content.slice(0, 70) + "..." : "Empty draft"}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                      {draft.wordCount || 0} words
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-[var(--border-warm)] text-center text-xs text-[var(--text-muted)] italic">
                No longform drafts yet. Click "Free Write" to start an essay or story.
              </div>
            )}
          </div>

          {/* Favorite Journal Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-literary text-xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#754650] fill-[#754650]" />
                <span>Cherished Memories</span>
              </h2>
              <Link
                href="/journal"
                className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-0.5"
              >
                <span>All Journal</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {favoriteEntries.length > 0 ? (
              <div className="space-y-2.5">
                {favoriteEntries.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal?id=${entry.id}`}
                    className="p-3.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:border-[#754650]/40 transition-all space-y-1 block group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>
                        {new Date(entry.date + "T00:00:00").toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Heart className="w-3 h-3 fill-[#754650] text-[#754650]" />
                    </div>
                    <h4 className="font-literary text-sm font-semibold text-[var(--text-main)] group-hover:text-[#754650] transition-colors truncate">
                      {entry.title || "Untitled Entry"}
                    </h4>
                    <p className="font-literary text-xs text-[var(--text-body)] line-clamp-1 italic">
                      "{entry.body.slice(0, 90)}..."
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-[var(--border-warm)] text-center text-xs text-[var(--text-muted)] italic">
                Star special journal entries with the heart button to keep them close here.
              </div>
            )}
          </div>
        </section>

        {/* 5. LITTLE PLANS & UPCOMING TASKS */}
        <section className="space-y-4 pt-4 border-t border-[var(--border-warm)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-[var(--accent-sage)]" />
                <span>Little Plans for Today</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Gentle intentions for writing, reading, and daily reflection.
              </p>
            </div>
            <Link
              href="/plans"
              className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Notebook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingPlans.length > 0 ? (
              pendingPlans.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-2.5">
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
                        <p className="text-[11px] text-[var(--text-body)] line-clamp-2">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-warm)]/40">
                    <span className="capitalize">{task.priority} Priority</span>
                    {task.linkedItem && (
                      <span className="text-[var(--accent-sage)] truncate max-w-[120px]">
                        {task.linkedItem.title}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 p-6 rounded-xl border border-dashed border-[var(--border-warm)] text-center text-xs text-[var(--text-muted)] italic">
                All daily intentions completed. Ready to set a quiet new goal.
              </div>
            )}
          </div>
        </section>

        {/* 7 & 8. PERSONAL READING LIST + DISCOVER LITERATURE */}
        <section className="space-y-4 pt-4 border-t border-[var(--border-warm)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--accent-sage)]" />
                <span>Reading Sanctuary &amp; Classic Literature</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Explore essays, public-domain masterpieces, and your personal reading shelf.
              </p>
            </div>
            <Link
              href="/library"
              className="text-xs text-[var(--accent-sage)] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Explore Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CURATED_BOOKS.slice(0, 4).map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3 flex flex-col justify-between group hover:border-[var(--accent-sage)] transition-colors"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent-sage)]">
                    {book.genre || "Classic"}
                  </span>
                  <h4 className="font-literary text-base font-bold text-[var(--text-main)] leading-snug group-hover:text-[var(--accent-sage)] transition-colors line-clamp-1">
                    {book.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] italic">
                    By {book.author}
                  </p>
                  <p className="text-xs text-[var(--text-body)] line-clamp-2 leading-relaxed">
                    {book.coverSubtitle || `A masterwork of ${book.genre.toLowerCase()}.`}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-warm)]/50 flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {book.estimatedPages || 100} pages
                  </span>
                  <Link
                    href={`/read?bookId=${book.id}`}
                    className="text-xs font-semibold text-[var(--accent-sage)] hover:underline"
                  >
                    Read Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9 & 10. WORD GARDEN + TWO-MINUTE SPARK */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-warm)]">
          {/* Word Garden Sanctuary Card */}
          <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-sage)]">
                <Sprout className="w-4 h-4" />
                <span>Word Garden • Literary Lexicon</span>
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
                <div key={w.id} className="p-2.5 rounded-lg bg-[var(--bg-sage-surface)]/50 border border-[var(--border-warm)]/60 text-xs space-y-0.5">
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
                  <p className="text-xs text-[var(--text-body)] line-clamp-1">
                    {w.definition}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
              Cultivate words from your reading and refine nuances of meaning for precise, evocative writing.
            </p>
          </div>

          {/* Two-Minute Spark Quiet Card */}
          <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#754650]">
                  <Sparkles className="w-4 h-4" />
                  <span>Two-Minute Spark</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Micro-Writing
                </span>
              </div>

              <h3 className="font-literary text-lg font-bold text-[var(--text-main)]">
                {sparkPrompt.title}
              </h3>
              <p className="font-literary text-xs text-[var(--text-body)] italic leading-relaxed bg-[var(--bg-sage-surface)]/40 p-3 rounded-lg border border-[var(--border-warm)]">
                "{sparkPrompt.promptText}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                120 seconds of quiet attention
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

        {/* 11 & 12. CALENDAR SNAPSHOT & SANCTUARY MILESTONES */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4 border-t border-[var(--border-warm)]">
          {/* Sanctuary Writing Milestones (6 cols) */}
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
                Detailed Progress →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--bg-sage-surface)]/50 border border-[var(--border-warm)]">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {progressSummary.totalWords}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Words Composed
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-sage-surface)]/50 border border-[var(--border-warm)]">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {progressSummary.streak}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Day Quiet Streak
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-sage-surface)]/50 border border-[var(--border-warm)]">
                <span className="font-literary text-2xl font-bold text-[var(--text-main)]">
                  {journalEntries.length}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Diary Reflections
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-sage-surface)]/50 border border-[var(--border-warm)]">
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
          <div className="md:col-span-6 p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-literary text-lg font-semibold text-[var(--text-main)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Calendar &amp; Memories</span>
              </h3>
              <Link
                href="/calendar"
                className="text-xs text-[var(--accent-sage)] hover:underline font-semibold"
              >
                View Full Calendar →
              </Link>
            </div>

            <p className="text-xs text-[var(--text-body)] leading-relaxed">
              Every journal entry, writing session, and micro-spark is cataloged chronologically, providing a tapestry of your thoughts across the seasons.
            </p>

            <div className="p-3 rounded-xl bg-[var(--bg-sage-surface)]/40 border border-[var(--border-warm)] text-xs flex items-center justify-between">
              <span className="text-[var(--text-main)] font-medium">
                {journalEntries.length + writingSessions.length} total entries and drafts in memory
              </span>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-[var(--accent-sage)] hover:underline"
              >
                Browse Memories →
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* GLOBAL SANCTUARY FOOTER */}
      <Footer />
    </div>
  );
}
