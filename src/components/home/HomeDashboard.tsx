"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { CURATED_BOOKS, CURATED_DISCOVERIES } from "@/lib/curated/data";
import { JournalEntry, BookItem, LiteraryDiscovery } from "@/types";
import {
  BookHeart,
  BookOpen,
  PenTool,
  Compass,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  Quote,
  Star,
  ChevronRight,
  Feather,
} from "lucide-react";

export function HomeDashboard() {
  const [greeting, setGreeting] = useState("Welcome to your sanctuary");
  const [subGreeting, setSubGreeting] = useState("A quiet space for thoughts becoming words.");
  const [formattedDate, setFormattedDate] = useState("");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<BookItem[]>([]);
  const [discoveries] = useState<LiteraryDiscovery[]>(CURATED_DISCOVERIES);
  const [todayQuote, setTodayQuote] = useState<LiteraryDiscovery | null>(null);

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

    // 2. Load journal entries and books from store
    const entries = hybridStore.getJournalEntries();
    setJournalEntries(entries);

    const books = hybridStore.getLibraryBooks();
    setLibraryBooks(books);

    // 3. Pick verified daily literary quote
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
  const currentlyReading = libraryBooks.find((b) => b.status === "currently_reading") || libraryBooks[0];
  const featuredBook = CURATED_BOOKS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* 1. GENTLE EDITORIAL GREETING */}
      <section className="relative pb-8 border-b border-[#DED7C9] space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[#65745A] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#65745A]" />
          <span>Inkling Sanctuary</span>
          <span>•</span>
          <span className="text-[#777267] font-normal lowercase">
            {formattedDate || "today"}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-literary text-3xl sm:text-4xl lg:text-5xl font-medium text-[#332F29] tracking-tight leading-tight">
              {greeting}.
            </h1>
            <p className="font-literary text-lg sm:text-xl text-[#777267] italic leading-relaxed">
              "{subGreeting}"
            </p>
          </div>

          {/* Primary Action: Open My Journal */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641] transition-all shadow-sm hover:shadow"
            >
              <BookHeart className="w-4 h-4 text-[#D9DFCF]" />
              <span>Open My Journal</span>
            </Link>

            <Link
              href="/write"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] text-[#332F29] text-xs font-medium hover:bg-[#E5E6D9]/50 transition-colors"
              title="Start a new longform essay or reflection"
            >
              <PenTool className="w-3.5 h-3.5 text-[#65745A]" />
              <span>Free Write</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PICK UP WHERE I LEFT OFF & CURRENTLY READING */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Recent Journal Entry / Pick Up Where I Left Off (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-literary text-2xl font-semibold text-[#332F29] flex items-center gap-2">
              <span>Pick up where I left off</span>
            </h2>
            <Link
              href="/journal"
              className="text-xs text-[#65745A] hover:text-[#485641] font-medium flex items-center gap-1 group"
            >
              <span>View all entries</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {latestEntry ? (
            <div className="sanctuary-card p-6 sm:p-7 relative overflow-hidden group">
              {/* Subtle top ribbon accent */}
              <div className="ribbon-bookmark" />

              <div className="space-y-3 pr-6">
                <div className="flex items-center gap-2 text-xs text-[#777267]">
                  <span className="font-medium text-[#65745A]">Latest diary reflection</span>
                  <span>•</span>
                  <span>{new Date(latestEntry.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  {latestEntry.time && <span>at {latestEntry.time}</span>}
                </div>

                <h3 className="font-literary text-2xl font-bold text-[#332F29] group-hover:text-[#65745A] transition-colors">
                  {latestEntry.title}
                </h3>

                <p className="font-literary text-base text-[#332F29]/85 line-clamp-3 leading-relaxed">
                  {latestEntry.body}
                </p>

                {latestEntry.tags && latestEntry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {latestEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#E5E6D9] text-[#485641] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[#DED7C9]/60 flex items-center justify-between">
                  <span className="text-xs text-[#777267] font-handwritten text-sm">
                    {latestEntry.weather || "Saved quietly in your journal"}
                  </span>

                  <Link
                    href={`/journal?id=${latestEntry.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#65745A] hover:underline"
                  >
                    <span>Continue entry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="sanctuary-card p-8 text-center space-y-3">
              <BookHeart className="w-8 h-8 text-[#65745A]/50 mx-auto" />
              <h3 className="font-literary text-xl font-medium text-[#332F29]">
                Your diary is waiting for its first thought
              </h3>
              <p className="text-xs text-[#777267] max-w-sm mx-auto">
                No compulsory topics or performance scores. Just an open page for whatever is on
                your mind today.
              </p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-medium"
              >
                Write in journal
              </Link>
            </div>
          )}
        </div>

        {/* Right: Currently Reading on the Bedside Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-literary text-2xl font-semibold text-[#332F29]">
              On the bedside table
            </h2>
            <Link
              href="/library"
              className="text-xs text-[#65745A] hover:text-[#485641] font-medium flex items-center gap-1 group"
            >
              <span>My Library</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {currentlyReading ? (
            <div className="sanctuary-card p-6 flex gap-5 items-start">
              {/* Visual Book Cover */}
              <div
                className="book-cover w-24 sm:w-28 h-36 sm:h-40 shrink-0 p-3 flex flex-col justify-between text-[#FFFCF5]"
                style={{ backgroundColor: currentlyReading.coverColor || "#65745A" }}
              >
                <div>
                  <div className="w-4 h-0.5 bg-[#FFFCF5]/40 mb-1" />
                  <span className="font-literary text-[11px] sm:text-xs font-bold leading-tight block line-clamp-3">
                    {currentlyReading.title}
                  </span>
                </div>
                <span className="text-[9px] text-[#FFFCF5]/70 block truncate">
                  {currentlyReading.author}
                </span>
              </div>

              {/* Book Details & Reading Progress */}
              <div className="space-y-3 min-w-0 flex-1">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#65745A] bg-[#E5E6D9] px-2 py-0.5 rounded">
                    Currently Reading
                  </span>
                  <h3 className="font-literary text-xl font-bold text-[#332F29] mt-1.5 line-clamp-1">
                    {currentlyReading.title}
                  </h3>
                  <p className="text-xs text-[#777267] truncate">By {currentlyReading.author}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#777267]">
                    <span>Page {currentlyReading.currentPage || 142} of {currentlyReading.estimatedPages}</span>
                    <span className="font-semibold text-[#332F29]">{currentlyReading.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E6D9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#65745A] rounded-full transition-all duration-500"
                      style={{ width: `${currentlyReading.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/read`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#65745A] hover:text-[#485641]"
                  >
                    <span>Read or take notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* 3. SOMETHING TO DISCOVER (POETRY, ESSAYS, QUOTATIONS) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#DED7C9] pb-3">
          <div>
            <h2 className="font-literary text-2xl font-semibold text-[#332F29]">
              Something to discover
            </h2>
            <p className="text-xs text-[#777267]">
              Poetry, memorable passages, and essays to kindle contemplation.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs text-[#65745A] hover:text-[#485641] font-medium flex items-center gap-1"
          >
            <span>Explore all discoveries</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Featured Poem */}
          {discoveries[0] && (
            <div className="sanctuary-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#754650] bg-[#FFFCF5] border border-[#754650]/20 px-2 py-0.5 rounded">
                  Poem of the Day
                </span>
                <h3 className="font-literary text-xl font-bold text-[#332F29]">
                  {discoveries[0].title}
                </h3>
                <p className="text-xs text-[#777267]">By {discoveries[0].author}</p>
                <div className="font-literary text-sm text-[#332F29]/80 italic whitespace-pre-line leading-relaxed pt-2 border-t border-[#DED7C9]/60">
                  {discoveries[0].excerpt}
                </div>
              </div>

              <Link
                href="/explore"
                className="text-xs font-semibold text-[#65745A] hover:underline flex items-center gap-1 pt-2"
              >
                <span>Read full poem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Card 2: Thought-Provoking Quotation */}
          {todayQuote && (
            <div className="sanctuary-card p-6 bg-sage-surface/40 border-warm-border flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-paper border border-warm-border flex items-center justify-center text-primary-sage">
                    <Quote className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-deep-olive bg-botanical-light px-2 py-0.5 rounded">
                    Quote of the Day
                  </span>
                </div>
                <blockquote className="font-literary text-lg font-medium text-ink-primary italic leading-relaxed">
                  {todayQuote.excerpt}
                </blockquote>
                <div className="text-xs text-ink-secondary pt-2">
                  <span className="font-semibold text-ink-primary">— {todayQuote.author}</span>
                  {todayQuote.source && <span className="block text-[11px] opacity-80">{todayQuote.source}</span>}
                </div>
              </div>

              <Link
                href="/explore"
                className="text-xs font-semibold text-primary-sage hover:underline flex items-center gap-1 pt-2 font-ui"
              >
                <span>Browse All Quotes & Share Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Card 3: Featured Essay */}
          <div className="sanctuary-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#485641] bg-[#D9DFCF] px-2 py-0.5 rounded">
                Featured Essay
              </span>
              <h3 className="font-literary text-xl font-bold text-[#332F29]">
                Why I Write
              </h3>
              <p className="text-xs text-[#777267]">By George Orwell • 4 min read</p>
              <p className="font-literary text-sm text-[#332F29]/80 italic line-clamp-3 leading-relaxed pt-2 border-t border-[#DED7C9]/60">
                "Putting aside the need to earn a living, I think there are four great motives for writing prose... Good prose is like a windowpane."
              </p>
            </div>

            <Link
              href="/read"
              className="text-xs font-semibold text-[#65745A] hover:underline flex items-center gap-1 pt-2"
            >
              <span>Read essay & notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PERSONAL SANCTUARY CORNERS (WORD GARDEN & TWO-MINUTE SPARK) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#DED7C9]">
        {/* Word Garden Sanctuary Card */}
        <div className="sanctuary-card p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#65745A]">
              <Sparkles className="w-3.5 h-3.5 text-[#65745A]" />
              <span>Word Garden</span>
            </div>
            <h3 className="font-literary text-xl font-bold text-[#332F29]">
              Luminescent & Discernment
            </h3>
            <p className="text-xs text-[#777267] leading-relaxed max-w-sm">
              Discover contextual nuances, explore word roots, and cultivate subtle literary diction.
            </p>
            <div className="pt-2">
              <Link
                href="/vocabulary"
                className="text-xs font-semibold text-[#65745A] hover:underline flex items-center gap-1"
              >
                <span>Browse Word Garden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#E5E6D9] border border-[#DED7C9] flex items-center justify-center text-[#65745A] shrink-0">
            <Feather className="w-5 h-5" />
          </div>
        </div>

        {/* Two-Minute Spark Quiet Card */}
        <div className="sanctuary-card p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#754650]">
              <Clock className="w-3.5 h-3.5 text-[#754650]" />
              <span>Two-Minute Spark</span>
            </div>
            <h3 className="font-literary text-xl font-bold text-[#332F29]">
              Gentle Daily Micro-Writing
            </h3>
            <p className="text-xs text-[#777267] leading-relaxed max-w-sm">
              No pressure for a complete essay. Just two minutes to describe one thing you noticed today.
            </p>
            <div className="pt-2">
              <Link
                href="/spark"
                className="text-xs font-semibold text-[#754650] hover:underline flex items-center gap-1"
              >
                <span>Write a 2-minute spark</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#FFFCF5] border border-[#754650]/20 flex items-center justify-center text-[#754650] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </section>
    </div>
  );
}
