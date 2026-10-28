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
      <div className="border-b border-[#DED7C9] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#65745A] font-medium tracking-wide mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Memories & Chronological Ledger</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#332F29] tracking-tight">
            Calendar & Memories
          </h1>
          <p className="text-xs sm:text-sm text-[#777267] mt-1">
            Revisit past diary reflections, passages, and quiet thoughts marked across time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] hover:bg-[#E5E6D9] text-[#777267] transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-serif font-medium text-[#332F29] min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] hover:bg-[#E5E6D9] text-[#777267] transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[#DED7C9] bg-[#FFFCF5] shadow-xs space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wider text-[#777267] pb-2 border-b border-[#DED7C9]">
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
              <div key={`blank-${i}`} className="min-h-[76px] rounded-lg bg-[#E5E6D9]/20" />
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
                  className={`min-h-[76px] p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-[#65745A] bg-[#E5E6D9]/50 ring-1 ring-[#65745A] font-semibold"
                      : "border-[#DED7C9]/60 hover:bg-[#E5E6D9]/30 bg-[#FFFCF5]"
                  }`}
                >
                  <span className="text-xs font-serif text-[#332F29]">{day}</span>

                  <div className="flex items-center gap-1">
                    {hasJournal && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#65745A]"
                        title="Diary Entry"
                      />
                    )}
                    {hasSession && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#485641]"
                        title="Prose Draft"
                      />
                    )}
                    {hasSpark && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#754650]"
                        title="Spark"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#DED7C9] flex items-center gap-5 text-[11px] text-[#777267]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#65745A]" /> Diary Reflection
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#485641]" /> Prose Piece
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#754650]" /> Spark
            </span>
          </div>
        </div>

        {/* Selected Date Memories Panel */}
        <div className="p-6 rounded-2xl border border-[#DED7C9] bg-[#FFFCF5] shadow-xs space-y-6">
          <div className="border-b border-[#DED7C9] pb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#777267]">
              Memories on Record
            </span>
            <h3 className="font-serif text-2xl font-normal text-[#332F29]">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
          </div>

          {journalsOnDate.length === 0 && sessionsOnDate.length === 0 && sparksOnDate.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#777267] italic space-y-3">
              <p>No recorded thoughts or diary entries for this day.</p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1 text-[#65745A] font-medium not-italic hover:underline"
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
                  className="p-4 rounded-xl border border-[#DED7C9] bg-[#F5F0E6] space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#65745A] font-medium">
                    <span className="flex items-center gap-1">
                      <PenTool className="w-3 h-3" /> Diary • {entry.time}
                    </span>
                    {entry.isFavorite && <Heart className="w-3.5 h-3.5 fill-[#754650] text-[#754650]" />}
                  </div>
                  <h4 className="font-serif text-base font-medium text-[#332F29]">
                    {entry.title}
                  </h4>
                  <p className="font-serif text-xs text-[#332F29]/80 line-clamp-3 leading-relaxed">
                    {entry.body}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#777267]">
                      {entry.tags.join(" • ")}
                    </span>
                    <Link
                      href="/journal"
                      className="text-[#65745A] font-medium hover:underline text-[11px]"
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
                  className="p-4 rounded-xl border border-[#DED7C9] bg-[#E5E6D9]/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#485641] font-medium">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Prose • {session.wordCount} words
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-medium text-[#332F29]">
                    {session.title}
                  </h4>
                  <p className="font-serif text-xs text-[#777267] line-clamp-2">
                    "{session.content}"
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <Link
                      href={`/write?id=${session.id}`}
                      className="text-[#485641] font-medium hover:underline text-[11px]"
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
                  className="p-3.5 rounded-xl border border-[#DED7C9] bg-[#FFFCF5] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#754650] font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Two-Minute Spark
                    </span>
                    <span>{spark.durationSeconds}s</span>
                  </div>
                  <p className="font-serif text-xs text-[#332F29] italic">
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
