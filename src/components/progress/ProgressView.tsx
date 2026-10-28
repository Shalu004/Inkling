"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { MistakePattern, DailyActivity } from "@/types";
import {
  BarChart2,
  Flame,
  FileText,
  BookOpen,
  Sprout,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-coach-ink flex items-center gap-1.5 mb-1">
            <BarChart2 className="w-4 h-4" /> Personal Progress & Rhythm
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Authentic Learning Arc
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Genuine metrics derived from your actual writing, reading, and vocabulary reviews.
          </p>
        </div>

        <Link
          href="/write"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-ink-primary text-paper hover:bg-ink-primary/90 transition-all shadow-xs self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Write Today</span>
        </Link>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-xl border border-spark-ink/20 bg-spark-wash flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-spark-ink flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-spark-ink" /> Daily Streak
          </span>
          <div className="my-2">
            <span className="font-editorial text-4xl font-bold text-spark-ink">
              {summary.streak}
            </span>
            <span className="text-xs text-spark-ink/80 ml-1">days active</span>
          </div>
          <p className="text-[11px] text-spark-ink/80">
            {summary.streak > 0
              ? "Your habit is humming. Keep the rhythm going."
              : "Complete a Two-Minute Spark or write to begin."}
          </p>
        </div>

        {/* Total Words */}
        <div className="p-5 rounded-xl border border-warm-border bg-paper flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Total Words Written
          </span>
          <div className="my-2">
            <span className="font-editorial text-4xl font-bold text-ink-primary">
              {summary.totalWords.toLocaleString()}
            </span>
            <span className="text-xs text-ink-secondary ml-1">words</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            Across {summary.totalSessions} writing entries & {summary.totalSparks} sparks.
          </p>
        </div>

        {/* Word Garden */}
        <div className="p-5 rounded-xl border border-vocab-ink/20 bg-vocab-wash flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-vocab-ink flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5" /> Word Garden
          </span>
          <div className="my-2">
            <span className="font-editorial text-4xl font-bold text-vocab-ink">
              {summary.vocabTotal}
            </span>
            <span className="text-xs text-vocab-ink/80 ml-1">words planted</span>
          </div>
          <p className="text-[11px] text-vocab-ink/80">
            {summary.vocabMastered} mastered • {summary.vocabLearning} learning.
          </p>
        </div>

        {/* Reading */}
        <div className="p-5 rounded-xl border border-reading-ink/20 bg-reading-wash flex flex-col justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-reading-ink flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Reading Corner
          </span>
          <div className="my-2">
            <span className="font-editorial text-4xl font-bold text-reading-ink">
              {summary.completedReadings}
            </span>
            <span className="text-xs text-reading-ink/80 ml-1">essays read</span>
          </div>
          <p className="text-[11px] text-reading-ink/80">
            Comprehension exercises completed.
          </p>
        </div>
      </div>

      {/* SECTION 2: PERSONAL MISTAKE PROFILE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-ink-primary">
              Personal Mistake Profile
            </h2>
            <p className="text-xs text-ink-secondary">
              Patterns identified across your completed AI Writing Coach reviews.
            </p>
          </div>
        </div>

        {mistakes.length === 0 ? (
          <div className="p-8 rounded-xl border border-warm-border bg-paper text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-reading-ink/70 mx-auto" />
            <h3 className="font-editorial text-lg font-semibold text-ink-primary">
              No recurring issues recorded yet
            </h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto">
              As you write essays and request AI reviews, Inkling analyzes recurring grammatical or
              stylistic habits so you can conquer them through targeted exercises.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mistakes.map((m) => (
              <div
                key={m.category}
                className="p-5 rounded-xl border border-warm-border bg-paper space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-editorial text-lg font-bold text-ink-primary">
                    {m.categoryLabel}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      m.frequency === "recurring"
                        ? "bg-spark-wash text-spark-ink border-spark-ink/30"
                        : "bg-creative-wash text-creative-ink border-creative-ink/30"
                    }`}
                  >
                    {m.count} {m.count === 1 ? "instance" : "instances"} • {m.frequency}
                  </span>
                </div>

                <p className="text-xs text-ink-primary/90 leading-relaxed">{m.explanation}</p>

                <div className="p-2.5 rounded bg-warm-muted/60 text-xs text-ink-secondary">
                  <strong className="text-ink-primary">Guiding Rule:</strong> {m.typicalRule}
                </div>

                {m.recentExamples.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-ink-secondary">
                      From your drafts:
                    </span>
                    <div className="space-y-1">
                      {m.recentExamples.map((ex, i) => (
                        <div
                          key={i}
                          className="font-editorial text-xs italic text-spark-ink/90 bg-spark-wash/40 p-1.5 rounded border border-spark-ink/10"
                        >
                          "{ex}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT ACTIVITY LOG */}
      <div className="space-y-4">
        <h2 className="font-editorial text-2xl font-semibold text-ink-primary">
          Activity Rhythm
        </h2>

        {activities.length === 0 ? (
          <div className="p-8 rounded-xl border border-warm-border bg-paper text-center space-y-2">
            <p className="text-xs text-ink-secondary">
              No daily activities logged yet. Take your first step today!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-warm-border rounded-xl bg-paper">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment border-b border-warm-border text-ink-secondary uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Words Written</th>
                  <th className="py-3 px-4">Writing Sessions</th>
                  <th className="py-3 px-4">Sparks Completed</th>
                  <th className="py-3 px-4">Readings Finished</th>
                  <th className="py-3 px-4">Streak Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border/60 text-ink-primary">
                {activities.map((a) => (
                  <tr key={a.date} className="hover:bg-warm-muted/30">
                    <td className="py-3 px-4 font-mono font-medium">{a.date}</td>
                    <td className="py-3 px-4 font-semibold">{a.wordsWritten} words</td>
                    <td className="py-3 px-4">{a.writingSessionsCount}</td>
                    <td className="py-3 px-4">{a.sparksCompleted}</td>
                    <td className="py-3 px-4">{a.readingsCompleted}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-spark-ink">🔥 {a.streakCount}d</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
