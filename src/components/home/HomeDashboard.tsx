"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { CURATED_PROMPTS, CURATED_READINGS } from "@/lib/curated/data";
import { MoodType, WritingPrompt, WritingSession, TwoMinuteSpark } from "@/types";
import { MoodSelector } from "@/components/writing/MoodSelector";
import {
  PenTool,
  Sparkles,
  BookOpen,
  Sprout,
  Flame,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";

export function HomeDashboard() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<WritingSession[]>([]);
  const [recentSparks, setRecentSparks] = useState<TwoMinuteSpark[]>([]);
  const [todayDateString, setTodayDateString] = useState("Today");

  useEffect(() => {
    setSummary(hybridStore.getProgressSummary());
    setRecentSessions(hybridStore.getWritingSessions().slice(0, 3));
    setRecentSparks(hybridStore.getSparks().slice(0, 2));
    setTodayDateString(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Today's prompt: find a prompt matching the selected mood, or default to first
  const todayPrompt: WritingPrompt =
    (selectedMood
      ? CURATED_PROMPTS.find((p) => p.mood === selectedMood)
      : CURATED_PROMPTS[0]) || CURATED_PROMPTS[0];

  const todayReading = CURATED_READINGS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. GREETING & EDITORIAL BANNER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-warm-border pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            {todayDateString}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-ink-primary mt-1 tracking-tight">
            Find your thoughts. Find your voice.
          </h1>
          <p className="font-annotation text-lg text-ink-secondary italic mt-1">
            "A space for thoughts becoming words."
          </p>
        </div>

        {/* Quick Streak & Write Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/progress"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-spark-wash text-spark-ink border border-spark-ink/20 shadow-2xs hover:bg-spark-wash/80 transition-all"
          >
            <Flame className="w-4 h-4 fill-spark-ink" />
            <span>{summary?.streak > 0 ? `${summary.streak} Day Streak` : "Start Streak"}</span>
          </Link>

          <Link
            href="/write"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-ink-primary text-paper hover:bg-ink-primary/90 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Start Writing</span>
          </Link>
        </div>
      </div>

      {/* 2. OPTIONAL MOOD SELECTOR */}
      <div className="p-5 rounded-2xl border border-warm-border bg-paper shadow-2xs">
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={(m) => setSelectedMood(m)}
        />
      </div>

      {/* 3. HERO SECTION: WRITING PROMPT & TWO-MINUTE SPARK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Writing Recommendation (Spans 2 cols) */}
        <div className="lg:col-span-2 p-7 rounded-2xl border border-creative-ink/30 bg-creative-wash shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-creative-ink bg-paper px-2.5 py-0.5 rounded-full border border-creative-ink/20 shadow-2xs">
                Today's Writing Recommendation • {todayPrompt.mood}
              </span>
              <span className="text-xs text-creative-ink font-medium">
                {todayPrompt.suggestedWordsMin}–{todayPrompt.suggestedWordsMax} words
              </span>
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-ink-primary">
              {todayPrompt.title}
            </h2>

            <p className="font-editorial text-lg text-ink-primary/90 leading-relaxed">
              "{todayPrompt.promptText}"
            </p>

            {todayPrompt.reasonForRecommendation && (
              <p className="text-xs text-ink-secondary italic pt-1">
                {todayPrompt.reasonForRecommendation}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-creative-ink/20">
            <Link
              href="/explore"
              className="text-xs text-creative-ink font-medium hover:underline"
            >
              Browse other prompts →
            </Link>

            <Link
              href={`/write?promptId=${todayPrompt.id}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-creative-ink text-paper text-xs font-semibold hover:bg-creative-ink/90 transition-all shadow-xs"
            >
              <span>Write on this topic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Two-Minute Spark Card (1 col) */}
        <div className="p-7 rounded-2xl border border-spark-ink/30 bg-spark-wash shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-spark-ink bg-paper px-2.5 py-0.5 rounded-full border border-spark-ink/20 shadow-2xs">
                Micro-Habit
              </span>
              <span className="text-xs text-spark-ink font-mono font-bold">2:00 mins</span>
            </div>

            <h3 className="font-editorial text-2xl font-bold text-ink-primary">
              Two-Minute Spark
            </h3>

            <p className="text-xs text-ink-primary/90 leading-relaxed">
              Maintain your daily streak without writing a whole essay. Two minutes of honest
              reflection to keep thoughts flowing freely.
            </p>
          </div>

          <Link
            href="/spark"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-spark-ink text-paper text-xs font-semibold hover:bg-spark-ink/90 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Two-Minute Spark</span>
          </Link>
        </div>
      </div>

      {/* 4. SECONDARY SECTION: READING CORNER & WORD GARDEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reading Corner Highlight */}
        <div className="p-6 rounded-2xl border border-reading-ink/30 bg-reading-wash shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-reading-ink bg-paper px-2 py-0.5 rounded-full border border-reading-ink/20">
                Reading Corner
              </span>
              <span className="text-xs text-reading-ink flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {todayReading.estimatedReadMinutes} min read
              </span>
            </div>

            <h3 className="font-editorial text-xl font-bold text-ink-primary">
              {todayReading.title}
            </h3>
            <p className="text-xs text-ink-secondary">By {todayReading.author}</p>
            <p className="font-editorial text-sm text-ink-primary/80 line-clamp-2 italic pt-1">
              "{todayReading.excerpt}"
            </p>
          </div>

          <Link
            href="/read"
            className="inline-flex items-center gap-1 text-xs font-semibold text-reading-ink hover:underline self-start"
          >
            Read piece & take quiz <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Word Garden Highlight */}
        <div className="p-6 rounded-2xl border border-vocab-ink/30 bg-vocab-wash shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-vocab-ink bg-paper px-2 py-0.5 rounded-full border border-vocab-ink/20">
                Word Garden
              </span>
              <span className="text-xs text-vocab-ink">
                {summary?.vocabTotal || 0} words collected
              </span>
            </div>

            <h3 className="font-editorial text-xl font-bold text-ink-primary">
              Luminescent & Discernment
            </h3>
            <p className="text-xs text-ink-secondary">
              Discover contextual nuances and replace vague descriptors with evocative diction.
            </p>
            <p className="text-xs text-vocab-ink bg-paper/80 p-2.5 rounded border border-vocab-ink/10">
              "Good prose is like a windowpane — transparent and clear."
            </p>
          </div>

          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-1 text-xs font-semibold text-vocab-ink hover:underline self-start"
          >
            Explore Word Garden & Flashcards <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. RECENT WRITINGS LIST */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-2xl font-semibold text-ink-primary">
            Recent Writings & Drafts
          </h2>
          <Link href="/calendar" className="text-xs text-ink-secondary hover:text-ink-primary">
            View full calendar →
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-8 rounded-xl border border-warm-border bg-paper text-center space-y-3">
            <FileText className="w-8 h-8 text-ink-secondary/50 mx-auto" />
            <h3 className="font-editorial text-lg font-semibold text-ink-primary">
              No writing sessions yet
            </h3>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              Your journal is clean and waiting. Pick today's prompt or begin with an unfinished
              thought.
            </p>
            <Link
              href="/write"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-ink-primary text-paper text-xs font-semibold hover:bg-ink-primary/90"
            >
              Start First Entry
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-5 rounded-xl border border-warm-border bg-paper hover:border-coach-ink/40 transition-all flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                    <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                    <span>{session.wordCount} words</span>
                  </div>
                  <h4 className="font-editorial text-lg font-semibold text-ink-primary mt-1 line-clamp-1">
                    {session.title}
                  </h4>
                  <p className="font-editorial text-xs text-ink-secondary line-clamp-2 mt-1 leading-relaxed">
                    "{session.content || "Empty draft..."}"
                  </p>
                </div>

                <div className="pt-2 border-t border-warm-border/60 flex items-center justify-between text-xs">
                  <Link
                    href={`/write?id=${session.id}`}
                    className="text-ink-primary font-medium hover:underline"
                  >
                    Edit draft
                  </Link>
                  {session.hasAiReview && (
                    <Link
                      href={`/review/${session.id}`}
                      className="text-coach-ink font-semibold hover:underline"
                    >
                      AI Review →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
