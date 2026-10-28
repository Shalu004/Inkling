"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  BookOpen,
  Library,
  Bookmark,
  ExternalLink,
  Plus,
  Check,
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Star,
  Download,
  Eye,
} from "lucide-react";
import { UnifiedBook, BookSource, BookAvailability, BookItem } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";

interface BookCatalogSearchProps {
  onBookAdded?: (book: BookItem) => void;
}

const GENRE_CHIPS = [
  "All",
  "Classic Literature",
  "Poetry",
  "Short Stories",
  "Essays",
  "Plays",
  "Novels",
  "Philosophy",
  "Memoir",
  "Nature",
  "History",
];

export function BookCatalogSearch({ onBookAdded }: BookCatalogSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<"all" | BookSource>("all");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [books, setBooks] = useState<UnifiedBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, string>>({});
  const [hasSearched, setHasSearched] = useState(false);

  // Selected book for details & cataloging modal
  const [selectedBook, setSelectedBook] = useState<UnifiedBook | null>(null);
  const [targetShelf, setTargetShelf] = useState<BookItem["status"]>("want_to_read");
  const [personalNotes, setPersonalNotes] = useState("");
  const [customCollection, setCustomCollection] = useState("");
  const [personalRating, setPersonalRating] = useState<number>(0);
  const [favoriteQuote, setFavoriteQuote] = useState("");
  const [addedBookIds, setAddedBookIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Perform search
  const performSearch = async (targetPage = 1) => {
    const q = query.trim();
    if (!q && selectedGenre === "All") return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setPage(targetPage);

    try {
      const params = new URLSearchParams({
        q,
        source: selectedSource,
        page: String(targetPage),
        limit: "12",
      });

      if (selectedGenre !== "All") {
        params.set("genre", selectedGenre);
      }
      if (selectedAvailability !== "all") {
        params.set("availability", selectedAvailability);
      }

      const res = await fetch(`/api/books/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to search books.");
      }

      setBooks(data.books || []);
      setProviders(data.providers || {});
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while querying catalogs.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial recommended books query if empty
  useEffect(() => {
    if (!hasSearched) {
      setQuery("Virginia Woolf");
      // Execute initial search
      const timer = setTimeout(() => {
        performSearch(1);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  // Open catalog modal
  const openCatalogModal = (book: UnifiedBook) => {
    setSelectedBook(book);
    setTargetShelf("want_to_read");
    setPersonalNotes("");
    setCustomCollection(book.subjects[0] || "");
    setPersonalRating(0);
    setFavoriteQuote("");
  };

  // Add book to personal library
  const handleSaveToLibrary = () => {
    if (!selectedBook) return;

    const newBook: BookItem = {
      id: "book-" + Date.now(),
      title: selectedBook.title,
      author: selectedBook.author,
      genre: customCollection || selectedBook.subjects[0] || "Literature",
      status: targetShelf,
      progressPercent: targetShelf === "finished" ? 100 : 0,
      rating: personalRating > 0 ? personalRating : undefined,
      personalNotes: personalNotes.trim() || undefined,
      favoriteQuotes: favoriteQuote.trim() ? [favoriteQuote.trim()] : [],
      coverColor: selectedBook.coverColor || "#65745A",
      coverSubtitle: selectedBook.publisher || selectedBook.firstPublishYear ? String(selectedBook.firstPublishYear) : undefined,
      estimatedPages: selectedBook.pageCount || 240,
      currentPage: 0,
      sourceLink: selectedBook.availability?.url || selectedBook.externalUrl,
    };

    hybridStore.saveBook(newBook);
    setAddedBookIds((prev) => ({ ...prev, [selectedBook.id]: true }));
    showToast(`Added "${selectedBook.title}" to your ${targetShelf.replace("_", " ")} shelf`);
    setSelectedBook(null);

    if (onBookAdded) {
      onBookAdded(newBook);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#332F29] text-[#FFFCF5] px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 border border-[#65745A]/40 animate-fade-in">
          <Check className="w-4 h-4 text-[#D9DFCF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar & Controls */}
      <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, ISBN, or subject (e.g. Jane Austen, Walden, 9780141439518)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-sage)] transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-medium hover:bg-[var(--accent-olive)] transition-all shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Searching Catalogs...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search Catalogs</span>
              </>
            )}
          </button>
        </form>

        {/* Multi-provider Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-warm)]/60 text-xs">
          {/* Provider selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0 flex items-center gap-1">
              <Library className="w-3 h-3" /> Provider:
            </span>
            {[
              { id: "all", label: "All Providers" },
              { id: "project_gutenberg", label: "Project Gutenberg" },
              { id: "open_library", label: "Open Library" },
              { id: "google_books", label: "Google Books" },
            ].map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => {
                  setSelectedSource(src.id as any);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                  selectedSource === src.id
                    ? "bg-[var(--accent-sage)] text-[#FFFCF5]"
                    : "bg-[var(--bg-sage-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>

          {/* Availability filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0">
              Availability:
            </span>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-[11px] text-[var(--text-main)] focus:outline-none"
            >
              <option value="all">Any Availability</option>
              <option value="read_online">Read Online (Full Text)</option>
              <option value="borrow">Borrow via Archive</option>
              <option value="preview">Preview Pages</option>
            </select>
          </div>
        </div>

        {/* Genre pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-[var(--text-muted)] font-medium shrink-0">Genre:</span>
          {GENRE_CHIPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                selectedGenre === g
                  ? "bg-[var(--bg-botanical-light)] text-[var(--accent-olive)] font-semibold border border-[var(--accent-sage)]/40"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Status Indicators */}
      {hasSearched && Object.keys(providers).length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)] px-1">
          <span className="font-medium">Sources queried:</span>
          {providers.open_library === "ok" && (
            <span className="inline-flex items-center gap-1 text-[var(--accent-sage)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" /> Open Library (Active)
            </span>
          )}
          {providers.project_gutenberg === "ok" && (
            <span className="inline-flex items-center gap-1 text-[var(--accent-sage)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" /> Project Gutenberg (Active)
            </span>
          )}
          {providers.google_books === "ok" && (
            <span className="inline-flex items-center gap-1 text-[var(--accent-sage)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage)]" /> Google Books (Active)
            </span>
          )}
          {providers.google_books === "rate_limited" && (
            <span className="inline-flex items-center gap-1 text-[#754650] italic">
              Google Books (Rate limit / Quota exceeded — Open Library & Gutenberg active)
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => performSearch(page)}
            className="font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results Grid */}
      {books.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {books.map((book) => {
              const isAdded = addedBookIds[book.id];

              return (
                <div
                  key={book.id}
                  className="p-5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:border-[var(--accent-sage)]/50 transition-all flex flex-col justify-between space-y-4 hover:shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex gap-3.5">
                      {/* Book Cover Image or Hardcover Spine Representation */}
                      {book.coverUrl ? (
                        <div className="w-16 h-24 rounded shadow-sm shrink-0 overflow-hidden bg-[var(--bg-sage-surface)] relative">
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-24 rounded shadow-sm shrink-0 bg-[var(--accent-sage)] flex flex-col justify-between p-2 text-[#FFFCF5] relative overflow-hidden">
                          <div className="w-1 absolute left-1 inset-y-0 bg-black/20" />
                          <span className="text-[8px] font-bold tracking-widest uppercase opacity-75">
                            {book.source === "project_gutenberg" ? "Gutenberg" : "Book"}
                          </span>
                          <p className="font-serif text-[10px] font-bold leading-tight line-clamp-3 pl-1">
                            {book.title}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Source Tag */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="font-medium text-[var(--accent-burgundy)] bg-[var(--bg-sage-surface)] px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {book.sourceLabel}
                          </span>
                          {book.firstPublishYear && (
                            <span className="text-[var(--text-muted)]">
                              {book.firstPublishYear}
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-sm font-medium text-[var(--text-main)] leading-snug line-clamp-2 group-hover:text-[var(--accent-sage)] transition-colors">
                          {book.title}
                        </h3>

                        <p className="text-xs text-[var(--text-muted)] font-serif italic truncate">
                          {book.author}
                        </p>

                        {/* Availability Pill */}
                        <div className="pt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              book.availability.type === "read_online" || book.availability.type === "public_domain"
                                ? "bg-[var(--bg-botanical-light)] text-[var(--accent-olive)]"
                                : book.availability.type === "borrow"
                                ? "bg-[var(--bg-sage-surface)] text-[var(--accent-sage)]"
                                : "bg-[var(--bg-main)] text-[var(--text-muted)]"
                            }`}
                          >
                            {book.availability.type === "read_online" ? (
                              <BookOpen className="w-3 h-3" />
                            ) : book.availability.type === "borrow" ? (
                              <Bookmark className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                            <span>{book.availability.label}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {book.description && (
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[var(--border-warm)]/60 flex items-center justify-between text-xs">
                    {book.availability.url ? (
                      <a
                        href={book.availability.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        title="View provider resource"
                      >
                        <span>Access</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {book.pageCount ? `${book.pageCount} pgs` : "Metadata"}
                      </span>
                    )}

                    <button
                      onClick={() => openCatalogModal(book)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isAdded
                          ? "bg-[var(--bg-botanical-light)] text-[var(--accent-olive)]"
                          : "bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] hover:bg-[var(--bg-botanical-light)]"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>On Shelf</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Library</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="pt-4 flex items-center justify-between border-t border-[var(--border-warm)] text-xs text-[var(--text-muted)]">
            <button
              onClick={() => performSearch(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:bg-[var(--bg-sage-surface)] disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Page</span>
            </button>

            <span>Page {page}</span>

            <button
              onClick={() => performSearch(page + 1)}
              disabled={isLoading || books.length < 10}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-paper)] hover:bg-[var(--bg-sage-surface)] disabled:opacity-40"
            >
              <span>Next Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : hasSearched && !isLoading ? (
        <div className="p-12 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[var(--accent-sage)] mx-auto opacity-60" />
          <h3 className="font-serif text-lg text-[var(--text-main)]">
            No books found matching "{query}"
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
            Try adjusting your search terms, choosing "All Providers", or browsing by a broad genre such as Classic Literature or Philosophy.
          </p>
        </div>
      ) : null}

      {/* DETAIL & ADD TO SHELF MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] border border-[var(--border-warm)] max-w-lg w-full rounded-2xl shadow-xl p-6 sm:p-7 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Book Header */}
            <div className="flex gap-4">
              {selectedBook.coverUrl ? (
                <img
                  src={selectedBook.coverUrl}
                  alt={selectedBook.title}
                  className="w-20 h-28 object-cover rounded shadow-sm shrink-0"
                />
              ) : (
                <div className="w-20 h-28 rounded bg-[var(--accent-sage)] flex flex-col justify-between p-2 text-[#FFFCF5] shrink-0">
                  <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">
                    {selectedBook.sourceLabel}
                  </span>
                  <p className="font-serif text-xs font-bold leading-tight">
                    {selectedBook.title}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-burgundy)]">
                  {selectedBook.sourceLabel} • {selectedBook.firstPublishYear || "Anthology"}
                </span>
                <h2 className="font-serif text-xl font-medium text-[var(--text-main)] leading-snug">
                  {selectedBook.title}
                </h2>
                <p className="text-xs font-serif italic text-[var(--text-muted)]">
                  by {selectedBook.author}
                </p>
                {selectedBook.pageCount && (
                  <p className="text-[11px] text-[var(--text-muted)]">
                    ~{selectedBook.pageCount} estimated pages
                  </p>
                )}
                <p className="text-[11px] text-[var(--text-muted)] italic pt-0.5">
                  Source: {selectedBook.sourceAttribution}
                </p>
              </div>
            </div>

            {/* Description / Subjects */}
            {selectedBook.description && (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-warm)]">
                {selectedBook.description}
              </p>
            )}

            {/* Availability link */}
            {selectedBook.availability?.url && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-sage-surface)] text-xs text-[var(--accent-olive)]">
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{selectedBook.availability.label}</span>
                </span>
                <a
                  href={selectedBook.availability.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline inline-flex items-center gap-0.5"
                >
                  <span>Open Provider Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Add to Shelf Options */}
            <div className="space-y-3 pt-2 border-t border-[var(--border-warm)] text-xs">
              <span className="font-medium text-[var(--text-main)] block">
                Catalog onto your Sanctuary Bookshelf:
              </span>

              {/* Shelf Selection */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "want_to_read", label: "Want to Read" },
                  { id: "currently_reading", label: "Currently Reading" },
                  { id: "finished", label: "Finished" },
                  { id: "favorite", label: "Favorite Books" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTargetShelf(s.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      targetShelf === s.id
                        ? "border-[var(--accent-sage)] bg-[var(--bg-botanical-light)] text-[var(--accent-olive)] font-semibold"
                        : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Custom Collection Tag */}
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--text-muted)]">
                  Collection Tag (e.g. Victorian Classics, Bedside Shelf):
                </label>
                <input
                  type="text"
                  value={customCollection}
                  onChange={(e) => setCustomCollection(e.target.value)}
                  placeholder="Collection name..."
                  className="w-full p-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] focus:outline-none"
                />
              </div>

              {/* Personal Rating */}
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--text-muted)]">
                  Personal Rating (optional):
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPersonalRating(star)}
                      className="p-1 text-[var(--border-warm)] hover:text-amber-500"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= personalRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-[var(--border-warm)]"
                        }`}
                      />
                    </button>
                  ))}
                  {personalRating > 0 && (
                    <button
                      type="button"
                      onClick={() => setPersonalRating(0)}
                      className="text-[10px] text-[var(--text-muted)] ml-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--text-muted)]">
                  Personal Reading Note:
                </label>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Why you're reading this, where you first heard of it..."
                  rows={2}
                  className="w-full p-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] focus:outline-none resize-none"
                />
              </div>

              {/* Favorite Passage */}
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--text-muted)]">
                  Memorable Passage / Quote:
                </label>
                <textarea
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  placeholder="A line from the book worth holding onto..."
                  rows={2}
                  className="w-full p-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] font-serif italic focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-warm)]">
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveToLibrary}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-medium hover:bg-[var(--accent-olive)] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to My Bookshelf</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
