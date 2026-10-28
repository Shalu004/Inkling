"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { hybridStore } from "@/lib/store/hybridStore";
import { WritingSession, TwoMinuteSpark, DailyActivity, JournalEntry } from "@/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  PenTool,
  ArrowRight,
  BookOpen,
  Heart,
} from "lucide-react";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 9, 1));
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [sparks, setSparks] = useState<TwoMinuteSpark[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-27");

  useEffect(() => {
    const now = new Date();
    setCurrentMonth(now);
    setSelectedDate(now.toISOString().split("T")[0]);
    setJournals(hybridStore.getJournalEntries());
    setSessions(hybridStore.getWritingSessions());
    setSparks(hybridStore.getSparks());
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
  const journalsOnDate = journals.filter((j) => j.date === selectedDate);
  const sessionsOnDate = sessions.filter(
    (s) => s.createdAt.split("T")[0] === selectedDate
  );
  const sparksOnDate = sparks.filter(
    (sp) => sp.createdAt.split("T")[0] === selectedDate
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary-sage font-medium tracking-wide mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Memories & Chronological Ledger</span>
          </div>
          <h1 className="font-literary text-3xl sm:text-4xl font-semibold text-ink-primary tracking-tight">
            Calendar & Memories
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Revisit past diary reflections, passages, and quiet thoughts marked across time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-warm-border bg-paper hover:bg-sage-surface text-ink-secondary hover:text-ink-primary transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-literary font-semibold text-ink-primary min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-warm-border bg-paper hover:bg-sage-surface text-ink-secondary hover:text-ink-primary transition-colors"
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
              <div key={`blank-${i}`} className="min-h-[76px] rounded-xl bg-sage-surface/20" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
                day
              ).padStart(2, "0")}`;

              const isSelected = selectedDate === dateStr;
              const hasJournal = journals.some((j) => j.date === dateStr);
              const hasSession = sessions.some((s) => s.createdAt.split("T")[0] === dateStr);
              const hasSpark = sparks.some((sp) => sp.createdAt.split("T")[0] === dateStr);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[76px] p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-primary-sage bg-sage-surface/70 ring-2 ring-primary-sage/40 font-semibold"
                      : "border-warm-border/60 hover:bg-sage-surface/40 bg-paper"
                  }`}
                >
                  <span className="text-xs font-literary text-ink-primary font-medium">{day}</span>

                  <div className="flex items-center gap-1">
                    {hasJournal && (
                      <span
                        className="w-2 h-2 rounded-full bg-primary-sage"
                        title="Diary Entry"
                      />
                    )}
                    {hasSession && (
                      <span
                        className="w-2 h-2 rounded-full bg-deep-olive"
                        title="Prose Draft"
                      />
                    )}
                    {hasSpark && (
                      <span
                        className="w-2 h-2 rounded-full bg-burgundy"
                        title="Spark"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-warm-border flex items-center gap-5 text-[11px] text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-sage" /> Diary Reflection
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-deep-olive" /> Prose Piece
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-burgundy" /> Spark
            </span>
          </div>
        </div>

        {/* Selected Date Memories Panel */}
        <div className="p-6 rounded-2xl border border-warm-border bg-paper shadow-xs space-y-6">
          <div className="border-b border-warm-border pb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Memories on Record
            </span>
            <h3 className="font-literary text-2xl font-semibold text-ink-primary">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
          </div>

          {journalsOnDate.length === 0 && sessionsOnDate.length === 0 && sparksOnDate.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink-secondary italic space-y-3">
              <p>No recorded thoughts or diary entries for this day.</p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 text-primary-sage font-medium not-italic hover:underline"
              >
                Pen an entry for this day <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Journal Entries */}
              {journalsOnDate.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border border-warm-border bg-sanctuary space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-[11px] text-primary-sage font-medium">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3 h-3" /> Diary • {entry.time}
                    </span>
                    {entry.isFavorite && <Heart className="w-3.5 h-3.5 fill-burgundy text-burgundy" />}
                  </div>
                  <h4 className="font-literary text-base font-semibold text-ink-primary">
                    {entry.title}
                  </h4>
                  <p className="font-literary text-xs text-ink-primary/90 line-clamp-3 leading-relaxed">
                    {entry.body}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-ink-secondary">
                      {entry.tags.join(" • ")}
                    </span>
                    <Link
                      href="/journal"
                      className="text-primary-sage font-semibold hover:underline text-[11px]"
                    >
                      Open in Diary
                    </Link>
                  </div>
                </div>
              ))}

              {/* Writing Sessions */}
              {sessionsOnDate.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-warm-border bg-sage-surface/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-deep-olive font-medium">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Prose • {session.wordCount} words
                    </span>
                  </div>
                  <h4 className="font-literary text-base font-semibold text-ink-primary">
                    {session.title}
                  </h4>
                  <p className="font-literary text-xs text-ink-secondary line-clamp-2">
                    "{session.content}"
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <Link
                      href={`/write?id=${session.id}`}
                      className="text-deep-olive font-semibold hover:underline text-[11px]"
                    >
                      View in Editor
                    </Link>
                  </div>
                </div>
              ))}

              {/* Sparks */}
              {sparksOnDate.map((spark) => (
                <div
                  key={spark.id}
                  className="p-3.5 rounded-xl border border-warm-border bg-paper space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-burgundy font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Two-Minute Spark
                    </span>
                    <span>{spark.durationSeconds}s</span>
                  </div>
                  <p className="font-literary text-xs text-ink-primary italic">
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
