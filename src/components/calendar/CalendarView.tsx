"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { WritingSession, TwoMinuteSpark, DailyActivity } from "@/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 9, 1));
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [sparks, setSparks] = useState<TwoMinuteSpark[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-28");

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now.toISOString().split("T")[0]);
    setSessions(hybridStore.getWritingSessions());
    setSparks(hybridStore.getSparks());
    setActivities(hybridStore.getDailyActivities());
  }, []);

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Activities for selected date
  const sessionsOnDate = sessions.filter(
    (s) => s.createdAt.split("T")[0] === selectedDate
  );
  const sparksOnDate = sparks.filter(
    (sp) => sp.createdAt.split("T")[0] === selectedDate
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-reading-ink flex items-center gap-1.5 mb-1">
            <CalendarIcon className="w-4 h-4" /> Activity Calendar
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Writing Log & Timeline
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Revisit past thoughts, entries, and micro-writing sparks by date.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-warm-border bg-paper hover:bg-warm-muted text-ink-secondary"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-ink-primary min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-warm-border bg-paper hover:bg-warm-muted text-ink-secondary"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-warm-border bg-paper shadow-xs space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-ink-secondary pb-2 border-b border-warm-border">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[70px] rounded-lg bg-warm-muted/20" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;

              const isSelected = selectedDate === dateStr;
              const hasSession = sessions.some((s) => s.createdAt.split("T")[0] === dateStr);
              const hasSpark = sparks.some((sp) => sp.createdAt.split("T")[0] === dateStr);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[70px] p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-ink-primary bg-parchment ring-1 ring-ink-primary font-semibold"
                      : "border-warm-border/60 hover:bg-warm-muted/40 bg-paper"
                  }`}
                >
                  <span className="text-xs font-mono">{day}</span>

                  <div className="flex items-center gap-1">
                    {hasSession && (
                      <span
                        className="w-2 h-2 rounded-full bg-creative-ink"
                        title="Writing Entry"
                      />
                    )}
                    {hasSpark && (
                      <span
                        className="w-2 h-2 rounded-full bg-spark-ink"
                        title="Two-Minute Spark"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="p-6 rounded-2xl border border-warm-border bg-paper shadow-xs space-y-6">
          <div className="border-b border-warm-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Selected Date
            </span>
            <h3 className="font-editorial text-2xl font-bold text-ink-primary">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
          </div>

          {sessionsOnDate.length === 0 && sparksOnDate.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-secondary italic space-y-3">
              <p>No writing sessions or sparks on this day.</p>
              <Link
                href="/write"
                className="inline-flex items-center gap-1 text-coach-ink font-semibold not-italic hover:underline"
              >
                Create a piece for today <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sessions */}
              {sessionsOnDate.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-creative-ink/30 bg-creative-wash space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-creative-ink font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Writing Entry
                    </span>
                    <span>{session.wordCount} words</span>
                  </div>
                  <h4 className="font-editorial text-lg font-semibold text-ink-primary">
                    {session.title}
                  </h4>
                  <p className="font-editorial text-xs text-ink-primary/80 line-clamp-2">
                    "{session.content}"
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <Link
                      href={`/write?id=${session.id}`}
                      className="text-creative-ink font-semibold hover:underline"
                    >
                      Open in editor
                    </Link>
                    {session.hasAiReview && (
                      <Link
                        href={`/review/${session.id}`}
                        className="text-coach-ink font-semibold hover:underline"
                      >
                        View AI review
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {/* Sparks */}
              {sparksOnDate.map((spark) => (
                <div
                  key={spark.id}
                  className="p-4 rounded-xl border border-spark-ink/30 bg-spark-wash space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-spark-ink font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Two-Minute Spark
                    </span>
                    <span>{spark.durationSeconds}s</span>
                  </div>
                  <p className="font-editorial text-sm text-ink-primary italic">
                    "{spark.responseText}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
