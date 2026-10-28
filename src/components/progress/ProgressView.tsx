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
      <div className="border-b border-[#DED7C9] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#65745A] font-medium tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>Reflections on Practice • Quiet Accounting</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#332F29] tracking-tight">
            The Shape of Your Days
          </h1>
          <p className="text-xs sm:text-sm text-[#777267] leading-relaxed">
            Not a scoreboard, but a quiet record of words gathered in stillness, passages pondered, and habits gently tended.
          </p>
        </div>

        <Link
          href="/journal"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#65745A] text-[#FFFCF5] hover:bg-[#485641] transition-all shadow-xs self-start sm:self-auto"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Write in Diary</span>
        </Link>
      </div>

      {/* Subtle Sanctuary Overview Metrics (Warm paper surfaces, no loud gamification) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#777267] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#65745A]" /> Words Set Down
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-normal text-[#332F29]">
              {summary.totalWords.toLocaleString()}
            </span>
            <span className="text-xs text-[#777267]">words</span>
          </div>
          <p className="text-[11px] text-[#777267] leading-relaxed">
            Across {summary.totalSessions} journal entries & {summary.totalSparks} sparks.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#777267] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#754650]" /> Active Days
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-normal text-[#332F29]">
              {summary.activeDaysCount || 1}
            </span>
            <span className="text-xs text-[#777267]">days</span>
          </div>
          <p className="text-[11px] text-[#777267] leading-relaxed">
            Quiet moments carved out for contemplation.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#777267] flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-[#485641]" /> Vocabulary Placed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-normal text-[#332F29]">
              {summary.vocabTotal}
            </span>
            <span className="text-xs text-[#777267]">words</span>
          </div>
          <p className="text-[11px] text-[#777267] leading-relaxed">
            {summary.vocabMastered} internalized • {summary.vocabLearning} in contemplation.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#777267] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#65745A]" /> Essays Explored
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-normal text-[#332F29]">
              {summary.completedReadings}
            </span>
            <span className="text-xs text-[#777267]">readings</span>
          </div>
          <p className="text-[11px] text-[#777267] leading-relaxed">
            Reflective texts read in the Reading Nook.
          </p>
        </div>
      </div>

      {/* SECTION 2: Craft Insights & Stylistic Tendencies */}
      <div className="space-y-4">
        <div className="border-b border-[#DED7C9] pb-2 flex items-center justify-between">
          <h2 className="font-serif text-xl text-[#332F29]">
            Stylistic Tendencies & Craft Observations
          </h2>
          <span className="text-xs text-[#777267]">Observations from AI Coach</span>
        </div>

        {mistakes.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] text-center space-y-3">
            <Sparkles className="w-6 h-6 text-[#65745A] mx-auto opacity-70" />
            <h3 className="font-serif text-lg text-[#332F29]">
              No stylistic friction recorded yet
            </h3>
            <p className="text-xs text-[#777267] max-w-md mx-auto leading-relaxed">
              When you submit essays for thoughtful critique in the Write workspace, recurring tendencies—such as throat-clearing openings or passive constructions—will be respectfully noted here.
            </p>
            <div className="pt-2">
              <Link
                href="/write"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E5E6D9] text-[#485641] text-xs font-medium hover:bg-[#D9DFCF] transition-colors"
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
                className="p-5 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-medium text-[#754650]">
                    {m.categoryLabel}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#E5E6D9] text-[#485641] capitalize">
                    {m.frequency}
                  </span>
                </div>
                <p className="text-xs text-[#777267] leading-relaxed">
                  {m.explanation}
                </p>
                <div className="p-3 rounded-lg bg-[#F5F0E6] border border-[#DED7C9] text-[11px] text-[#332F29] space-y-1">
                  <span className="font-medium text-[#485641]">Guiding principle:</span>
                  <p className="italic">{m.typicalRule}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Recent Activity Log */}
      <div className="space-y-4">
        <div className="border-b border-[#DED7C9] pb-2 flex items-center justify-between">
          <h2 className="font-serif text-xl text-[#332F29]">
            Recent Sanctuary Days
          </h2>
          <span className="text-xs text-[#777267]">Your chronological rhythm</span>
        </div>

        {activities.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] text-xs text-[#777267] text-center italic">
            Today is the first entry in your sanctuary journal.
          </div>
        ) : (
          <div className="rounded-xl border border-[#DED7C9] bg-[#FFFCF5] divide-y divide-[#DED7C9]">
            {activities.slice(0, 7).map((act) => (
              <div
                key={act.date}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E5E6D9] text-[#485641] flex items-center justify-center font-serif text-xs font-medium shrink-0">
                    {act.date.split("-")[2]}
                  </div>
                  <div>
                    <span className="font-medium text-[#332F29]">{act.date}</span>
                    <p className="text-[11px] text-[#777267]">
                      {act.wordsWritten} words set down
                      {act.sparksCompleted > 0 ? ` • ${act.sparksCompleted} sparks` : ""}
                      {act.readingsCompleted > 0 ? ` • ${act.readingsCompleted} readings` : ""}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] text-[#65745A]">
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
