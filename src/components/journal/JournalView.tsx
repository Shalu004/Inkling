"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  JournalEntry,
  MoodType,
  JournalSearchScope,
  JournalSortOption,
  JournalSearchFilters,
  JournalSearchResult,
} from "@/types";
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
  Filter,
  X,
  RotateCcw,
  Sliders,
  Heart,
} from "lucide-react";
import { WritingCompanionPanel } from "@/components/writing/WritingCompanionPanel";

export function JournalView() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<JournalSearchScope>("all");
  const [sortOption, setSortOption] = useState<JournalSortOption>("newest");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
  const [showCompanion, setShowCompanion] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showInspiration, setShowInspiration] = useState(false);
  const [mounted, setMounted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load entries on mount
  useEffect(() => {
    setMounted(true);
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
  }, [title, body, date, time, mood, weather, tags, isFavorite, selectedEntry]);

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchScope("all");
    setSortOption("newest");
    setSelectedMood("all");
    setSelectedTag(null);
    setFilterFavorites(false);
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    searchScope !== "all" ||
    sortOption !== "newest" ||
    selectedMood !== "all" ||
    selectedTag ||
    filterFavorites ||
    startDate ||
    endDate
  );

  // Execute Universal Journal Search through hybridStore
  const searchResults: JournalSearchResult[] = useMemo(() => {
    return hybridStore.searchJournalEntries({
      query: searchQuery,
      scope: searchScope,
      mood: selectedMood,
      tag: selectedTag || undefined,
      isFavoriteOnly: filterFavorites,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sort: sortOption,
    });
  }, [
    entries,
    searchQuery,
    searchScope,
    selectedMood,
    selectedTag,
    filterFavorites,
    startDate,
    endDate,
    sortOption,
  ]);

  // Group entries by Month Year if no specific search query is typed
  const isPlainBrowse = !searchQuery.trim();
  const groupedEntries: Record<string, JournalSearchResult[]> = {};
  if (isPlainBrowse) {
    searchResults.forEach((res) => {
      const d = new Date(res.entry.date + "T00:00:00");
      const groupKey = isNaN(d.getTime())
        ? "Recent Entries"
        : d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      if (!groupedEntries[groupKey]) groupedEntries[groupKey] = [];
      groupedEntries[groupKey].push(res);
    });
  }

  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));

  return (
    <div
      className={`flex-1 flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] md:min-h-screen ${
        isFocusMode ? "fixed inset-0 z-50 bg-[var(--bg-paper)] p-6 sm:p-12 overflow-y-auto" : ""
      }`}
    >
      {/* LEFT ARCHIVE DRAWER / SIDEBAR (Hidden in focus mode) */}
      {!isFocusMode && (
        <div className="w-full md:w-88 shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-warm)] bg-[var(--bg-paper)]/80 flex flex-col h-auto md:h-screen md:sticky md:top-0 transition-colors">
          {/* Top Archive Header */}
          <div className="p-4 border-b border-[var(--border-warm)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookHeart className="w-4 h-4 text-[var(--accent-sage)]" />
                <h2 className="font-literary text-lg font-bold text-[var(--text-main)]">My Journal</h2>
              </div>
              <button
                type="button"
                onClick={handleCreateNewEntry}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:bg-[var(--accent-olive)] transition-colors shadow-xs"
                title="Write a new diary entry"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Entry</span>
              </button>
            </div>

            {/* Universal Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories, thoughts, tags..."
                className="w-full pl-8 pr-14 py-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors ${
                    showAdvancedFilters || hasActiveFilters ? "text-[var(--accent-sage)] bg-[var(--bg-sage-surface)]" : ""
                  }`}
                  title="Advanced search filters"
                >
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Search Filters Drawer */}
            {showAdvancedFilters && (
              <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] space-y-2.5 text-[11px] animate-in fade-in duration-150">
                {/* Search Scope */}
                <div className="space-y-1">
                  <label className="text-[var(--text-muted)] font-medium block">
                    Search Scope:
                  </label>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {[
                      { id: "all", label: "Everything" },
                      { id: "title", label: "Title" },
                      { id: "body", label: "Text Body" },
                      { id: "tags", label: "Tags" },
                    ].map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setSearchScope(sc.id as any)}
                        className={`py-1 rounded text-center border transition-all ${
                          searchScope === sc.id
                            ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold border-[var(--accent-sage)]"
                            : "border-[var(--border-warm)] bg-[var(--bg-paper)] text-[var(--text-muted)]"
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood & Sort */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[var(--text-muted)] font-medium block">
                      Mood:
                    </label>
                    <select
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value)}
                      className="w-full p-1 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-main)] focus:outline-none"
                    >
                      <option value="all">Any Mood</option>
                      <option value="calm">Calm</option>
                      <option value="reflective">Reflective</option>
                      <option value="creative">Creative</option>
                      <option value="introspective">Introspective</option>
                      <option value="observant">Observant</option>
                      <option value="nostalgic">Nostalgic</option>
                      <option value="curious">Curious</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[var(--text-muted)] font-medium block">
                      Sort by:
                    </label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                      className="w-full p-1 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-main)] focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="relevance">Relevance</option>
                    </select>
                  </div>
                </div>

                {/* Date Range: From / To */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[var(--text-muted)] font-medium block">
                      From Date:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-1 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-main)] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[var(--text-muted)] font-medium block">
                      To Date:
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-1 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-main)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Date Range Presets */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-[var(--text-muted)]">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const weekAgo = new Date();
                      weekAgo.setDate(now.getDate() - 7);
                      setStartDate(weekAgo.toISOString().split("T")[0]);
                      setEndDate(now.toISOString().split("T")[0]);
                    }}
                    className="px-2 py-0.5 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const monthAgo = new Date();
                      monthAgo.setMonth(now.getMonth() - 1);
                      setStartDate(monthAgo.toISOString().split("T")[0]);
                      setEndDate(now.toISOString().split("T")[0]);
                    }}
                    className="px-2 py-0.5 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const thirtyAgo = new Date();
                      thirtyAgo.setDate(now.getDate() - 30);
                      setStartDate(thirtyAgo.toISOString().split("T")[0]);
                      setEndDate(now.toISOString().split("T")[0]);
                    }}
                    className="px-2 py-0.5 rounded border border-[var(--border-warm)] bg-[var(--bg-paper)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    Last 30 Days
                  </button>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="w-full py-1 text-center text-[10px] text-[var(--accent-burgundy)] hover:underline font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}

            {/* Quick Pills Bar */}
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all ${
                    filterFavorites
                      ? "bg-[#754650] text-[#FFFCF5] border-[#754650] font-semibold"
                      : "border-[var(--border-warm)] text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)]"
                  }`}
                >
                  <Heart className={`w-3 h-3 ${filterFavorites ? "fill-current" : ""}`} />
                  <span>Favorites</span>
                </button>

                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="px-2 py-0.5 rounded-full bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] border border-[var(--border-warm)] flex items-center gap-1"
                  >
                    <span>#{selectedTag}</span>
                    <span className="font-bold">×</span>
                  </button>
                )}
              </div>

              {/* Result Count Indicator */}
              <span
                suppressHydrationWarning
                className="text-[10px] text-[var(--text-muted)] shrink-0 font-medium"
              >
                {mounted ? `${searchResults.length} ${searchResults.length === 1 ? "entry" : "entries"}` : ""}
              </span>
            </div>
          </div>

          {/* Chronological List / Search Results */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-2">
                <p className="font-literary italic">No diary memories found.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] text-[var(--accent-sage)] underline font-medium"
                  >
                    Clear search filters
                  </button>
                )}
              </div>
            ) : isPlainBrowse ? (
              /* Grouped by Month View */
              Object.entries(groupedEntries).map(([groupTitle, items]) => (
                <div key={groupTitle} className="space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)] px-2 block mb-1">
                    {groupTitle}
                  </span>

                  <div className="space-y-1">
                    {items.map((res) => {
                      const entry = res.entry;
                      const isSelected = selectedEntry?.id === entry.id;
                      return (
                        <div
                          key={entry.id}
                          onClick={() => selectEntry(entry)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[var(--bg-paper)] border-[var(--accent-sage)] ring-1 ring-[var(--accent-sage)] shadow-xs"
                              : "border-transparent hover:bg-[var(--bg-sage-surface)]/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
                            <span className="font-serif">
                              {new Date(entry.date + "T00:00:00").toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {entry.isFavorite && (
                              <Heart className="w-3 h-3 fill-[#754650] text-[#754650]" />
                            )}
                          </div>

                          <h4 className="font-literary text-sm font-semibold text-[var(--text-main)] line-clamp-1">
                            {entry.title || "Untitled Entry"}
                          </h4>

                          <p className="font-literary text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                            {entry.body || "(Empty entry)"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              /* Search Results with Matched Snippets */
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] px-1">
                  Matched Entries ({searchResults.length})
                </div>

                {searchResults.map((res) => {
                  const entry = res.entry;
                  const isSelected = selectedEntry?.id === entry.id;

                  return (
                    <div
                      key={entry.id}
                      onClick={() => selectEntry(entry)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1 ${
                        isSelected
                          ? "bg-[var(--bg-paper)] border-[var(--accent-sage)] ring-1 ring-[var(--accent-sage)] shadow-xs"
                          : "border-[var(--border-warm)] bg-[var(--bg-main)]/60 hover:bg-[var(--bg-sage-surface)]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span className="font-medium text-[var(--accent-sage)] font-serif">
                          {entry.date} {entry.time ? `• ${entry.time}` : ""}
                        </span>
                        {entry.mood && (
                          <span className="capitalize px-1.5 py-0.2 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)]">
                            {entry.mood}
                          </span>
                        )}
                      </div>

                      <h4 className="font-literary text-sm font-semibold text-[var(--text-main)] line-clamp-1">
                        {entry.title || "Untitled Entry"}
                      </h4>

                      {/* Matching text snippet */}
                      <p className="font-literary text-xs text-[var(--text-muted)] leading-relaxed italic bg-[var(--bg-paper)] p-1.5 rounded border border-[var(--border-warm)]/60 line-clamp-2">
                        "{res.matchedSnippets[0]}"
                      </p>

                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 pt-0.5">
                          {entry.tags.slice(0, 3).map((t) => (
                            <span key={t} className="text-[9px] text-[var(--text-muted)]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT MAIN NOTEBOOK EDITOR SURFACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-paper)] p-6 sm:p-10 md:p-14 overflow-y-auto transition-colors duration-200">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[var(--border-warm)] text-xs text-[var(--text-muted)]">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-main)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-xs text-[var(--text-main)] focus:outline-none cursor-pointer"
              />
            </span>

            <span className="text-[var(--border-warm)]">•</span>

            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time"
                className="w-16 bg-transparent border-none text-xs text-[var(--text-muted)] focus:outline-none"
              />
            </span>
          </div>

          {/* Autosave Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <span className="flex items-center gap-1.5 text-[11px] font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === "saved"
                    ? "bg-[var(--accent-sage)]"
                    : saveStatus === "saving"
                    ? "bg-amber-600 animate-pulse"
                    : "bg-[#754650]"
                }`}
              />
              {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"}
            </span>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? "bg-[#754650] text-[#FFFCF5] border-[#754650]"
                  : "border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)] text-[var(--text-muted)]"
              }`}
              title={isFavorite ? "Favorited entry" : "Mark as favorite entry"}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
            </button>

            {/* Writing Companion Toggle */}
            <button
              type="button"
              onClick={() => setShowCompanion(!showCompanion)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                showCompanion
                  ? "bg-[var(--accent-sage)] text-white"
                  : "bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] border border-[var(--accent-sage)]/30 hover:bg-[var(--accent-sage)] hover:text-white"
              }`}
              title="Open Writing Companion for this diary entry"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Companion</span>
            </button>

            {/* Full-screen focus mode */}
            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-1.5 rounded-lg border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)] text-[var(--text-muted)] transition-colors"
              title={isFocusMode ? "Exit full-screen focus" : "Distraction-free focus mode"}
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Delete entry */}
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="p-1.5 rounded-lg border border-[var(--border-warm)] hover:bg-red-50 text-[var(--text-muted)] hover:text-red-700 transition-colors"
              title="Delete this entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Discreet Inspiration Drawer Toggle */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setShowInspiration(!showInspiration)}
            className="text-[11px] text-[var(--accent-sage)] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showInspiration ? "Hide gentle prompts" : "Need inspiration?"}</span>
            {showInspiration ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showInspiration && (
            <div className="mt-2 p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] space-y-3 text-xs animate-in fade-in duration-150">
              <span className="font-semibold text-[var(--text-main)] block">
                Quiet inquiries for your entry:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CURATED_PROMPTS.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!title) setTitle(p.title);
                      setBody((prev) => (prev ? prev + "\n\n" : "") + `"${p.promptText}"\n\n`);
                      setShowInspiration(false);
                    }}
                    className="p-3 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:border-[var(--accent-sage)] cursor-pointer transition-all space-y-1"
                  >
                    <span className="font-literary font-medium text-[var(--text-main)] block">
                      {p.title}
                    </span>
                    <p className="font-literary text-[11px] text-[var(--text-muted)] italic line-clamp-2">
                      "{p.promptText}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Paper Editor Body */}
        <div className="flex-1 flex flex-col space-y-6 pt-6">
          {/* Entry Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of this day's reflection..."
            className="w-full font-literary text-3xl sm:text-4xl font-semibold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 bg-transparent border-none focus:outline-none tracking-tight"
          />

          {/* Mood & Weather Subtitle */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-warm)]/60">
            {/* Mood picker */}
            <div className="flex items-center gap-1.5">
              <span>Mood:</span>
              <select
                value={mood || "calm"}
                onChange={(e) => setMood(e.target.value as MoodType)}
                className="bg-transparent text-[var(--text-main)] font-medium focus:outline-none capitalize cursor-pointer border border-[var(--border-warm)] rounded px-1.5 py-0.5"
              >
                <option value="calm">Calm</option>
                <option value="reflective">Reflective</option>
                <option value="introspective">Introspective</option>
                <option value="observant">Observant</option>
                <option value="creative">Creative</option>
                <option value="curious">Curious</option>
                <option value="nostalgic">Nostalgic</option>
                <option value="uncertain">Uncertain</option>
              </select>
            </div>

            <span className="text-[var(--border-warm)]">•</span>

            {/* Atmosphere / Weather Note */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
              <span>Atmosphere:</span>
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="e.g. Crisp autumn sun, rain tapping on glass..."
                className="bg-transparent border-none text-[var(--text-main)] text-xs focus:outline-none flex-1 placeholder:italic"
              />
            </div>
          </div>

          {/* Prose Editor with Generous Leading */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Let your thoughts flow freely. No prompts, no timers, no scores—only honest words set down on paper..."
            className="w-full flex-1 min-h-[380px] sm:min-h-[480px] bg-transparent border-none font-literary text-lg sm:text-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 focus:outline-none resize-none leading-[1.85]"
          />

          {/* Tags Drawer */}
          <div className="pt-4 border-t border-[var(--border-warm)] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Tags:</span>
            </span>

            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] text-[11px] font-medium"
              >
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-[var(--accent-burgundy)] font-bold ml-0.5"
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
              className="bg-transparent border border-dashed border-[var(--border-warm)] px-2 py-0.5 rounded-full text-[11px] text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--accent-sage)]"
            />
          </div>
        </div>
      </div>

      {/* Writing Companion Side Panel */}
      <WritingCompanionPanel
        currentText={body}
        documentTitle={title || "Journal Entry"}
        documentType="diary_entry"
        isOpen={showCompanion}
        onClose={() => setShowCompanion(false)}
        onApplyChange={(newContent) => setBody(newContent)}
      />
    </div>
  );
}
