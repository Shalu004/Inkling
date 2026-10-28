"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { JournalEntry, MoodType } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import { CURATED_PROMPTS } from "@/lib/curated/data";
import {
  BookHeart,
  Plus,
  Search,
  Star,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Check,
  Tag,
  Save,
  Feather,
} from "lucide-react";

export function JournalView() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Editor states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mood, setMood] = useState<MoodType | null>(null);
  const [weather, setWeather] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showInspiration, setShowInspiration] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const list = hybridStore.getJournalEntries();
    setEntries(list);

    if (initialId) {
      const match = list.find((e) => e.id === initialId);
      if (match) {
        selectEntry(match);
        return;
      }
    }

    if (list.length > 0 && !selectedEntry) {
      selectEntry(list[0]);
    } else if (list.length === 0) {
      handleCreateNewEntry();
    }
  };

  const selectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setBody(entry.body);
    setDate(entry.date);
    setTime(entry.time || "");
    setMood(entry.mood || null);
    setWeather(entry.weather || "");
    setTags(entry.tags || []);
    setIsFavorite(entry.isFavorite || false);
    setSaveStatus("saved");
  };

  const handleCreateNewEntry = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: "",
      body: "",
      date: today,
      time: timeStr,
      mood: "calm",
      tags: ["Reflection"],
      isFavorite: false,
      weather: "Quiet room",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    selectEntry(newEntry);
  };

  // Debounced Autosave (1200ms)
  useEffect(() => {
    if (!selectedEntry) return;

    // Only save if content changed
    if (
      title === selectedEntry.title &&
      body === selectedEntry.body &&
      mood === selectedEntry.mood &&
      weather === selectedEntry.weather &&
      isFavorite === selectedEntry.isFavorite &&
      JSON.stringify(tags) === JSON.stringify(selectedEntry.tags)
    ) {
      return;
    }

    setSaveStatus("unsaved");
    const timer = setTimeout(() => {
      setSaveStatus("saving");
      const updated = hybridStore.saveJournalEntry({
        id: selectedEntry.id,
        title: title || "Untitled Entry",
        body,
        date,
        time,
        mood: mood || undefined,
        weather,
        tags,
        isFavorite,
      });

      setSelectedEntry(updated);
      setEntries(hybridStore.getJournalEntries());
      setTimeout(() => setSaveStatus("saved"), 400);
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, body, mood, weather, tags, isFavorite, date, time, selectedEntry]);

  const handleDeleteCurrent = () => {
    if (!selectedEntry) return;
    if (confirm("Are you sure you wish to delete this diary entry?")) {
      hybridStore.deleteJournalEntry(selectedEntry.id);
      const remaining = hybridStore.getJournalEntries();
      setEntries(remaining);
      if (remaining.length > 0) {
        selectEntry(remaining[0]);
      } else {
        handleCreateNewEntry();
      }
    }
  };

  const handleToggleFavorite = () => {
    if (!selectedEntry) return;
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    hybridStore.toggleFavoriteJournalEntry(selectedEntry.id);
    setEntries(hybridStore.getJournalEntries());
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().replace(/^#/, "");
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFav = !filterFavorites || e.isFavorite;
    const matchesTag = !selectedTag || e.tags.includes(selectedTag);

    return matchesSearch && matchesFav && matchesTag;
  });

  // Group entries by Month Year
  const groupedEntries: Record<string, JournalEntry[]> = {};
  filteredEntries.forEach((entry) => {
    const d = new Date(entry.date + "T00:00:00");
    const groupKey = isNaN(d.getTime())
      ? "Recent Entries"
      : d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (!groupedEntries[groupKey]) groupedEntries[groupKey] = [];
    groupedEntries[groupKey].push(entry);
  });

  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));

  return (
    <div
      className={`flex-1 flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] md:min-h-screen ${
        isFocusMode ? "fixed inset-0 z-50 bg-[#FFFCF5] p-6 sm:p-12 overflow-y-auto" : ""
      }`}
    >
      {/* LEFT ARCHIVE DRAWER / SIDEBAR (Hidden in focus mode) */}
      {!isFocusMode && (
        <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[#DED7C9] bg-[#FFFCF5]/70 flex flex-col h-auto md:h-screen md:sticky md:top-0">
          {/* Top Archive Header */}
          <div className="p-4 border-b border-[#DED7C9] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookHeart className="w-4 h-4 text-[#65745A]" />
                <h2 className="font-literary text-lg font-bold text-[#332F29]">My Journal</h2>
              </div>
              <button
                onClick={handleCreateNewEntry}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641] transition-colors"
                title="Write a new diary entry"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Search memories */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777267]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search diary memories..."
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#DED7C9] bg-[#FFFCF5] text-xs text-[#332F29] placeholder:text-[#777267]/60 focus:outline-none focus:border-[#65745A]"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => setFilterFavorites(!filterFavorites)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all ${
                  filterFavorites
                    ? "bg-[#754650] text-[#FFFCF5] border-[#754650]"
                    : "border-[#DED7C9] text-[#777267] hover:bg-[#E5E6D9]"
                }`}
              >
                <Star className={`w-3 h-3 ${filterFavorites ? "fill-[#FFFCF5]" : ""}`} />
                <span>Favorites</span>
              </button>

              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-2 py-0.5 rounded-full bg-[#E5E6D9] text-[#485641] border border-[#DED7C9] flex items-center gap-1"
                >
                  <span>#{selectedTag}</span>
                  <span className="font-bold">×</span>
                </button>
              )}
            </div>
          </div>

          {/* Chronological List Grouped by Month */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {Object.keys(groupedEntries).length === 0 ? (
              <p className="p-4 text-center text-xs text-[#777267] italic">
                No entries match your search.
              </p>
            ) : (
              Object.entries(groupedEntries).map(([groupTitle, items]) => (
                <div key={groupTitle} className="space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#777267] px-2 block mb-1">
                    {groupTitle}
                  </span>

                  <div className="space-y-1">
                    {items.map((entry) => {
                      const isSelected = selectedEntry?.id === entry.id;
                      return (
                        <div
                          key={entry.id}
                          onClick={() => selectEntry(entry)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#FFFCF5] border-[#65745A] shadow-xs"
                              : "border-transparent hover:bg-[#E5E6D9]/50"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#777267] mb-1">
                            <span>{new Date(entry.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                            {entry.isFavorite && (
                              <Star className="w-3 h-3 fill-[#754650] text-[#754650]" />
                            )}
                          </div>

                          <h4 className="font-literary text-sm font-semibold text-[#332F29] line-clamp-1">
                            {entry.title || "Untitled Entry"}
                          </h4>

                          <p className="font-literary text-xs text-[#777267] line-clamp-2 mt-0.5 leading-relaxed">
                            {entry.body || "(Empty entry)"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RIGHT MAIN NOTEBOOK SURFACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFCF5] p-6 sm:p-10 md:p-14 overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#DED7C9] text-xs text-[#777267]">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[#332F29]">
              <Calendar className="w-3.5 h-3.5 text-[#65745A]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-xs text-[#332F29] focus:outline-none cursor-pointer"
              />
            </span>

            <span className="text-[#DED7C9]">•</span>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#777267]" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time"
                className="w-16 bg-transparent border-none text-xs text-[#777267] focus:outline-none"
              />
            </span>
          </div>

          {/* Actions: Save status, Favorite, Focus Mode, Delete */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === "saved"
                    ? "bg-[#65745A]"
                    : saveStatus === "saving"
                    ? "bg-[#B88219] animate-pulse"
                    : "bg-[#754650]"
                }`}
              />
              <span>{saveStatus === "saved" ? "Saved to diary" : saveStatus === "saving" ? "Saving..." : "Unsaved"}</span>
            </span>

            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded hover:bg-[#E5E6D9] transition-colors ${
                isFavorite ? "text-[#754650]" : "text-[#777267]"
              }`}
              title={isFavorite ? "Favorited" : "Mark as favorite"}
            >
              <Star className={`w-4 h-4 ${isFavorite ? "fill-[#754650]" : ""}`} />
            </button>

            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-1.5 rounded text-[#777267] hover:bg-[#E5E6D9] hover:text-[#332F29] transition-colors"
              title={isFocusMode ? "Exit focus mode" : "Distraction-free focus mode"}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDeleteCurrent}
              className="p-1.5 rounded text-[#777267] hover:bg-[#E5E6D9] hover:text-[#754650] transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Discreet "Need Inspiration?" control */}
        <div className="py-2">
          <button
            onClick={() => setShowInspiration(!showInspiration)}
            className="text-xs text-[#777267] hover:text-[#65745A] inline-flex items-center gap-1 transition-colors font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Need inspiration?</span>
            {showInspiration ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showInspiration && (
            <div className="mt-2 p-4 rounded-lg bg-[#E5E6D9]/50 border border-[#DED7C9] space-y-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-semibold text-[#485641] uppercase tracking-wider block">
                Reflective Questions:
              </span>
              <ul className="text-xs text-[#332F29] space-y-1 font-literary italic">
                <li>• What was one quiet sensation you noticed today before the world grew loud?</li>
                <li>• What thought or question have you been carrying this week without resolving?</li>
                <li>• Describe the physical place you felt most peaceful in recently.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of this memory or thought..."
          className="w-full font-literary text-2xl sm:text-3xl lg:text-4xl font-bold text-[#332F29] placeholder:text-[#777267]/40 border-none outline-none bg-transparent pt-4 pb-2 focus:ring-0"
        />

        {/* Weather & Tags Toolbar */}
        <div className="flex flex-wrap items-center gap-2 py-2 text-xs">
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="Weather or setting (e.g. Pale morning sun, rain on window)..."
            className="text-xs font-handwritten text-[#777267] italic placeholder:text-[#777267]/50 bg-transparent border-none focus:outline-none w-72"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded bg-[#E5E6D9] text-[#485641] flex items-center gap-1"
              >
                #{t}
                <button
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-[#754650] font-bold"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="+ add tag (Enter)"
              className="text-[11px] px-2 py-0.5 rounded border border-[#DED7C9] bg-transparent text-[#332F29] placeholder:text-[#777267]/60 w-24 focus:outline-none focus:w-32 transition-all"
            />
          </div>
        </div>

        {/* Main Journal Body */}
        <div className="flex-1 mt-4">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write freely. This page is yours alone—no judgment, no performance, no rush..."
            className="w-full h-full min-h-[460px] font-literary text-lg sm:text-[19px] leading-[1.85] text-[#332F29] placeholder:text-[#777267]/40 border-none outline-none bg-transparent resize-y focus:ring-0"
          />
        </div>

        {/* Bottom subtle note */}
        <div className="pt-6 border-t border-[#DED7C9]/60 flex items-center justify-between text-xs text-[#777267]">
          <span className="font-handwritten text-sm text-[#65745A]">
            "We write to taste life twice, in the moment and in retrospect." — Anaïs Nin
          </span>
          <span>{body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0} words</span>
        </div>
      </div>
    </div>
  );
}
