"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Search,
  Filter,
  Bookmark,
  BookOpen,
  Feather,
  Quote,
  PenTool,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  Library,
  BookMarked,
  X,
  ExternalLink,
} from "lucide-react";
import {
  CURATED_DISCOVERIES,
  CURATED_BOOKS,
  CURATED_READINGS,
  CURATED_PROMPTS,
} from "@/lib/curated/data";
import { LiteraryDiscovery, BookItem, ReadingResource, WritingPrompt } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";

type TabType = "all" | "poem" | "essay" | "quote" | "books" | "prompts";

export function ExploreView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [readingModalItem, setReadingModalItem] = useState<LiteraryDiscovery | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedDiscoveries, setSavedDiscoveries] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard`);
    }
  };

  const handleSaveToJournal = (title: string, excerpt: string, author?: string) => {
    const entryId = "journal-" + Date.now();
    const entryTitle = `Reflection on: ${title}${author ? ` by ${author}` : ""}`;
    const initialBody = `"${excerpt}"\n\n— ${author || "Passage"}\n\nMy thoughts on this passage:\n`;
    
    hybridStore.saveJournalEntry({
      id: entryId,
      title: entryTitle,
      body: initialBody,
      tags: ["Passage", "Reflection"],
      mood: "reflective",
      isFavorite: false,
    });

    showToast("Added as a new reflection draft in My Journal");
    setTimeout(() => {
      router.push("/journal");
    }, 600);
  };

  const handleAddToLibrary = (book: BookItem) => {
    hybridStore.saveBook({
      ...book,
      status: "want_to_read",
    });
    showToast(`"${book.title}" added to your Want to Read shelf`);
  };

  const moods = [
    "all",
    "reflective",
    "calm",
    "creative",
    "introspective",
    "observant",
    "curious",
    "nostalgic",
  ];

  // Filtered discoveries
  const filteredDiscoveries = useMemo(() => {
    return CURATED_DISCOVERIES.filter((d) => {
      if (activeTab !== "all" && d.type !== activeTab) return false;
      if (selectedMood !== "all" && d.mood !== selectedMood) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(q);
        const matchesAuthor = d.author.toLowerCase().includes(q);
        const matchesExcerpt = d.excerpt.toLowerCase().includes(q);
        const matchesTags = d.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthor && !matchesExcerpt && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [activeTab, selectedMood, searchQuery]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "books") return [];
    return CURATED_BOOKS.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  // Filtered essays
  const filteredEssays = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "essay") return [];
    return CURATED_READINGS.filter((e) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.author.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.excerpt.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "prompts") return [];
    return CURATED_PROMPTS.filter((p) => {
      if (selectedMood !== "all" && p.mood !== selectedMood) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.promptText.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, selectedMood, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#332F29] text-[#FFFCF5] px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 animate-fade-in border border-[#65745A]/40">
          <Check className="w-4 h-4 text-[#D9DFCF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Editorial Header */}
      <div className="border-b border-[#DED7C9] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E5E6D9] text-[#485641] text-[11px] font-medium tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>The Literary Commonplace • Anthology & Discoveries</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#332F29] tracking-tight">
            Explore & Discover
          </h1>
          <p className="text-xs sm:text-sm text-[#777267] leading-relaxed">
            A quiet treasury of timeless poetry, reflective essays, memorable passages, and book recommendations. Save words that move you into your personal library or diary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#65745A] text-[#FFFCF5] hover:bg-[#485641] transition-all shadow-xs"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Open Diary</span>
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-[#FFFCF5] text-[#332F29] border border-[#DED7C9] hover:bg-[#E5E6D9] transition-all"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#65745A]" />
            <span>My Bookshelf</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "All Discoveries" },
              { id: "quote", label: "Quotations" },
              { id: "poem", label: "Poetry" },
              { id: "essay", label: "Essays & Stories" },
              { id: "books", label: "Curated Books" },
              { id: "prompts", label: "Writing Sparks" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap font-medium ${
                  activeTab === tab.id
                    ? "bg-[#65745A] text-[#FFFCF5] shadow-xs"
                    : "bg-[#FFFCF5] text-[#777267] hover:text-[#332F29] border border-[#DED7C9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777267]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search passage, author, topic..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FFFCF5] border border-[#DED7C9] text-xs text-[#332F29] placeholder:text-[#777267] focus:outline-none focus:border-[#65745A] transition-colors"
            />
          </div>
        </div>

        {/* Mood filter pills */}
        {(activeTab === "all" || activeTab === "poem" || activeTab === "quote" || activeTab === "prompts") && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-[11px] text-[#777267]">
            <span className="shrink-0 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> Emotional tone:
            </span>
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`px-2.5 py-0.5 rounded-full capitalize transition-all whitespace-nowrap ${
                  selectedMood === m
                    ? "bg-[#D9DFCF] text-[#485641] font-semibold border border-[#65745A]/40"
                    : "hover:text-[#332F29]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Editorial Content Stream */}
      <div className="space-y-12">
        {/* SECTION 1: Quotations & Memorable Passages */}
        {(activeTab === "all" || activeTab === "quote") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DED7C9] pb-2">
              <h2 className="font-serif text-xl text-[#332F29] flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#754650]" />
                <span>Memorable Quotations & Commonplace Notes</span>
              </h2>
              <span className="text-xs text-[#777267]">Lines worth holding onto</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDiscoveries
                .filter((d) => d.type === "quote")
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-xl bg-[#FFFCF5] border border-[#DED7C9] hover:border-[#65745A]/40 transition-all flex flex-col justify-between space-y-4 relative group hover:shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-[#777267]">
                        <span className="px-2 py-0.5 rounded bg-[#E5E6D9] text-[#485641] font-medium">
                          {item.source} {item.year ? `(${item.year})` : ""}
                        </span>
                        <span className="italic capitalize">{item.mood}</span>
                      </div>

                      <blockquote className="font-serif text-base sm:text-lg text-[#332F29] leading-relaxed italic border-l-2 border-[#754650] pl-3">
                        {item.excerpt}
                      </blockquote>
                    </div>

                    <div className="pt-3 border-t border-[#DED7C9]/60 flex items-center justify-between">
                      <span className="text-xs font-serif text-[#485641] font-medium">
                        — {item.author}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyText(item.excerpt, "Quotation")}
                          title="Copy quotation"
                          className="p-1.5 rounded text-[#777267] hover:text-[#332F29] hover:bg-[#E5E6D9] transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            handleSaveToJournal(item.title, item.excerpt, item.author)
                          }
                          title="Write reflection in Journal"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#E5E6D9] text-[#485641] hover:bg-[#D9DFCF] transition-colors"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Reflect</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SECTION 2: Poetry Anthologies */}
        {(activeTab === "all" || activeTab === "poem") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DED7C9] pb-2">
              <h2 className="font-serif text-xl text-[#332F29] flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#65745A]" />
                <span>Poetry for Quiet Hours</span>
              </h2>
              <span className="text-xs text-[#777267]">Stanzas for reflection and solitude</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDiscoveries
                .filter((d) => d.type === "poem")
                .map((poem) => (
                  <div
                    key={poem.id}
                    onClick={() => setReadingModalItem(poem)}
                    className="p-6 rounded-xl bg-[#FFFCF5] border border-[#DED7C9] hover:border-[#65745A] cursor-pointer transition-all flex flex-col justify-between space-y-4 group hover:shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-[#777267]">
                        <span className="font-serif italic">{poem.author}</span>
                        <span>{poem.year}</span>
                      </div>

                      <h3 className="font-serif text-lg font-medium text-[#332F29] group-hover:text-[#65745A] transition-colors">
                        {poem.title}
                      </h3>

                      <pre className="font-serif text-xs text-[#777267] whitespace-pre-line leading-relaxed font-normal italic">
                        {poem.excerpt}
                      </pre>
                    </div>

                    <div className="pt-3 border-t border-[#DED7C9]/60 flex items-center justify-between text-[11px]">
                      <div className="flex gap-1.5">
                        {poem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-[#E5E6D9] text-[#485641]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-medium text-[#65745A] group-hover:underline flex items-center gap-0.5">
                        Read Poem <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* SECTION 3: Short Stories & Classic Essays */}
        {(activeTab === "all" || activeTab === "essay") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DED7C9] pb-2">
              <h2 className="font-serif text-xl text-[#332F29] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#485641]" />
                <span>Classic Essays & Reflective Prose</span>
              </h2>
              <span className="text-xs text-[#777267]">Montaigne, Woolf, Emerson, Didion</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEssays.map((essay) => (
                <div
                  key={essay.id}
                  className="p-6 rounded-xl bg-[#FFFCF5] border border-[#DED7C9] hover:border-[#65745A]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#777267]">
                      <span className="px-2 py-0.5 rounded bg-[#D9DFCF] text-[#485641] font-medium">
                        {essay.category}
                      </span>
                      <span>~{essay.estimatedReadMinutes} min read</span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-normal text-[#332F29]">
                        {essay.title}
                      </h3>
                      <p className="text-xs text-[#777267] font-serif italic mt-0.5">
                        by {essay.author}
                      </p>
                    </div>

                    <p className="text-xs text-[#777267] leading-relaxed">
                      {essay.excerpt}
                    </p>

                    <div className="p-3 rounded-lg bg-[#E5E6D9]/50 border border-[#DED7C9] text-xs font-serif italic text-[#332F29] leading-relaxed">
                      "{essay.fullText.slice(0, 160)}..."
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DED7C9]/60 flex items-center justify-between">
                    <button
                      onClick={() =>
                        handleSaveToJournal(
                          essay.title,
                          essay.fullText.slice(0, 220),
                          essay.author
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs text-[#777267] hover:text-[#332F29]"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Reflect in Diary</span>
                    </button>

                    <Link
                      href={`/read?essayId=${essay.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-medium hover:bg-[#485641] transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read in Nook</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: Curated Books */}
        {(activeTab === "all" || activeTab === "books") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DED7C9] pb-2">
              <h2 className="font-serif text-xl text-[#332F29] flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[#65745A]" />
                <span>Curated Books for the Sanctuary Shelf</span>
              </h2>
              <span className="text-xs text-[#777267]">Hand-selected companions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-5 rounded-xl bg-[#FFFCF5] border border-[#DED7C9] hover:border-[#65745A]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    {/* Hardcover spine cover representation */}
                    <div
                      className="w-16 h-24 rounded-md shadow-sm shrink-0 flex flex-col justify-between p-2 text-[#FFFCF5] relative overflow-hidden"
                      style={{ backgroundColor: book.coverColor || "#65745A" }}
                    >
                      <div className="w-1 absolute left-1 inset-y-0 bg-black/15" />
                      <span className="text-[8px] font-bold tracking-widest uppercase opacity-75">
                        {book.genre}
                      </span>
                      <p className="font-serif text-[10px] font-bold leading-tight line-clamp-3 pl-1.5">
                        {book.title}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#754650]">
                        {book.genre}
                      </span>
                      <h3 className="font-serif text-base font-medium text-[#332F29] leading-snug">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#777267] font-serif italic">
                        {book.author}
                      </p>
                      <p className="text-[11px] text-[#777267] pt-1 line-clamp-2">
                        {book.personalNotes || "A classic work recommended for quiet contemplation."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DED7C9]/60 flex items-center justify-between text-xs">
                    <span className="text-[#777267] text-[11px]">
                      {book.estimatedPages} pages
                    </span>
                    <button
                      onClick={() => handleAddToLibrary(book)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E5E6D9] text-[#485641] font-medium hover:bg-[#D9DFCF] transition-colors"
                    >
                      <Library className="w-3.5 h-3.5" />
                      <span>Add to Shelf</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: Writing Sparks */}
        {(activeTab === "all" || activeTab === "prompts") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DED7C9] pb-2">
              <h2 className="font-serif text-xl text-[#332F29] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#754650]" />
                <span>Contemplative Writing Inquiries</span>
              </h2>
              <span className="text-xs text-[#777267]">Gentle starting points for prose</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-6 rounded-xl bg-[#FFFCF5] border border-[#DED7C9] hover:border-[#65745A]/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#485641] bg-[#E5E6D9] px-2 py-0.5 rounded">
                        {prompt.mood} • {prompt.category}
                      </span>
                      <span className="text-[11px] text-[#777267]">
                        {prompt.suggestedWordsMin}–{prompt.suggestedWordsMax} words
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[#332F29] group-hover:text-[#65745A] transition-colors">
                      {prompt.title}
                    </h3>

                    <p className="font-serif text-xs text-[#777267] leading-relaxed italic">
                      "{prompt.promptText}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DED7C9]/60 flex items-center justify-between text-xs">
                    <button
                      onClick={() =>
                        handleSaveToJournal(prompt.title, prompt.promptText)
                      }
                      className="inline-flex items-center gap-1 text-[#777267] hover:text-[#332F29]"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Write in Journal</span>
                    </button>

                    <Link
                      href={`/write?promptId=${prompt.id}`}
                      className="inline-flex items-center gap-1 font-medium text-[#65745A] group-hover:underline"
                    >
                      Guided Prose <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* READING MODAL: Full poem or passage view */}
      {readingModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF5] border border-[#DED7C9] max-w-xl w-full rounded-2xl shadow-xl p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReadingModalItem(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-[#777267] hover:text-[#332F29] hover:bg-[#E5E6D9]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#754650] font-semibold">
                {readingModalItem.type === "poem" ? "Poem" : "Literary Passage"} • {readingModalItem.year || "Anthology"}
              </span>
              <h2 className="font-serif text-2xl font-normal text-[#332F29]">
                {readingModalItem.title}
              </h2>
              <p className="text-xs font-serif italic text-[#777267]">
                by {readingModalItem.author} • {readingModalItem.source}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F5F0E6] border border-[#DED7C9]">
              <pre className="font-serif text-sm text-[#332F29] whitespace-pre-line leading-relaxed font-normal">
                {readingModalItem.content || readingModalItem.excerpt}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleCopyText(
                    readingModalItem.content || readingModalItem.excerpt,
                    "Poem"
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DED7C9] text-xs text-[#332F29] hover:bg-[#E5E6D9] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Passage</span>
              </button>

              <button
                onClick={() => {
                  handleSaveToJournal(
                    readingModalItem.title,
                    readingModalItem.content || readingModalItem.excerpt,
                    readingModalItem.author
                  );
                  setReadingModalItem(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-medium hover:bg-[#485641] transition-colors shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Collect in My Journal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
