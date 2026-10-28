"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { MistakePattern, DailyActivity } from "@/types";
import {
  Feather,
  BookOpen,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  PenTool,
  Compass,
  CheckCircle,
} from "lucide-react";

export function ProgressView() {
  const [summary, setSummary] = useState<any>(null);
  const [mistakes, setMistakes] = useState<MistakePattern[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);

  useEffect(() => {
    setSummary(hybridStore.getProgressSummary());
    setMistakes(hybridStore.getMistakeProfile());
    setActivities(hybridStore.getDailyActivities());
  }, []);

  if (!summary) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Editorial Sanctuary Header */}
      {/* Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-primary-sage font-medium tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>Reflections on Practice • Quiet Accounting</span>
          </div>
          <h1 className="font-literary text-3xl sm:text-4xl font-semibold text-ink-primary tracking-tight">
            The Shape of Your Days
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Not a scoreboard, but a quiet record of words gathered in stillness, passages pondered, and habits gently tended.
          </p>
        </div>

        <Link
          href="/journal"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-sage text-paper hover:bg-deep-olive transition-all shadow-xs self-start sm:self-auto"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Write in Diary</span>
        </Link>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-warm-border bg-paper space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary-sage" /> Words Set Down
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-literary text-3xl font-semibold text-ink-primary">
              {summary.totalWords.toLocaleString()}
            </span>
            <span className="text-xs text-ink-secondary">words</span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            Across {summary.totalSessions} journal entries & {summary.totalSparks} sparks.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-warm-border bg-paper space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-burgundy" /> Active Days
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-literary text-3xl font-semibold text-ink-primary">
              {summary.activeDaysCount || 1}
            </span>
            <span className="text-xs text-ink-secondary">days</span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            Quiet moments carved out for contemplation.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-warm-border bg-paper space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-deep-olive" /> Vocabulary Placed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-literary text-3xl font-semibold text-ink-primary">
              {summary.vocabTotal}
            </span>
            <span className="text-xs text-ink-secondary">words</span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            {summary.vocabMastered} internalized • {summary.vocabLearning} in contemplation.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-warm-border bg-paper space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary-sage" /> Essays Explored
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-literary text-3xl font-semibold text-ink-primary">
              {summary.completedReadings}
            </span>
            <span className="text-xs text-ink-secondary">readings</span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            Reflective texts read in the Reading Nook.
          </p>
        </div>
      </div>

      {/* SECTION 2: Craft Insights & Stylistic Tendencies */}
      <div className="space-y-4">
        <div className="border-b border-warm-border pb-2 flex items-center justify-between">
          <h2 className="font-literary text-xl font-semibold text-ink-primary">
            Stylistic Tendencies & Craft Observations
          </h2>
          <span className="text-xs text-ink-secondary">Observations from AI Coach</span>
        </div>

        {mistakes.length === 0 ? (
          <div className="p-8 rounded-2xl border border-warm-border bg-paper text-center space-y-3">
            <Sparkles className="w-6 h-6 text-primary-sage mx-auto opacity-70" />
            <h3 className="font-literary text-lg font-semibold text-ink-primary">
              No stylistic friction recorded yet
            </h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed">
              When you submit essays for thoughtful critique in the Write workspace, recurring tendencies—such as throat-clearing openings or passive constructions—will be respectfully noted here.
            </p>
            <div className="pt-2">
              <Link
                href="/write"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-surface text-deep-olive text-xs font-semibold hover:bg-botanical-light transition-colors"
              >
                <span>Draft a piece for critique</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mistakes.map((m) => (
              <div
                key={m.category}
                className="p-5 rounded-2xl border border-warm-border bg-paper space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-literary font-semibold text-burgundy">
                    {m.categoryLabel}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-sage-surface text-deep-olive font-medium capitalize">
                    {m.frequency}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  {m.explanation}
                </p>
                <div className="p-3 rounded-xl bg-sanctuary border border-warm-border text-[11px] text-ink-primary space-y-1">
                  <span className="font-medium text-deep-olive">Guiding principle:</span>
                  <p className="italic font-literary">{m.typicalRule}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Recent Activity Log */}
      <div className="space-y-4">
        <div className="border-b border-warm-border pb-2 flex items-center justify-between">
          <h2 className="font-literary text-xl font-semibold text-ink-primary">
            Recent Sanctuary Days
          </h2>
          <span className="text-xs text-ink-secondary">Your chronological rhythm</span>
        </div>

        {activities.length === 0 ? (
          <div className="p-6 rounded-2xl border border-warm-border bg-paper text-xs text-ink-secondary text-center italic">
            Today is the first entry in your sanctuary journal.
          </div>
        ) : (
          <div className="rounded-2xl border border-warm-border bg-paper divide-y divide-warm-border">
            {activities.slice(0, 7).map((act) => (
              <div
                key={act.date}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sage-surface text-deep-olive flex items-center justify-center font-literary text-xs font-semibold shrink-0">
                    {act.date.split("-")[2]}
                  </div>
                  <div>
                    <span className="font-semibold text-ink-primary">{act.date}</span>
                    <p className="text-[11px] text-ink-secondary">
                      {act.wordsWritten} words set down
                      {act.sparksCompleted > 0 ? ` • ${act.sparksCompleted} sparks` : ""}
                      {act.readingsCompleted > 0 ? ` • ${act.readingsCompleted} readings` : ""}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] text-primary-sage font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Devoted day</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
