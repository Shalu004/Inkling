"use client";

import React, { useState, useEffect } from "react";
import { BookItem } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Library as LibraryIcon,
  BookOpen,
  Plus,
  Search,
  Star,
  CheckCircle,
  Clock,
  Quote,
  Bookmark,
  ExternalLink,
  Trash2,
  X,
  Edit3,
} from "lucide-react";

export function LibraryView() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<
    "all" | "currently_reading" | "want_to_read" | "finished" | "favorite"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add book form state
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newGenre, setNewGenre] = useState("Literature");
  const [newPages, setNewPages] = useState(250);
  const [newStatus, setNewStatus] = useState<BookItem["status"]>("want_to_read");
  const [newColor, setNewColor] = useState("#65745A");

  // Book detail editing state
  const [noteEdit, setNoteEdit] = useState("");
  const [newQuoteInput, setNewQuoteInput] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const list = hybridStore.getLibraryBooks();
    setBooks(list);
  };

  const handleOpenBook = (book: BookItem) => {
    setActiveBook(book);
    setNoteEdit(book.personalNotes || "");
    setNewQuoteInput("");
  };

  const handleUpdateStatus = (bookId: string, status: BookItem["status"]) => {
    hybridStore.updateBookStatus(bookId, status);
    loadBooks();
    if (activeBook && activeBook.id === bookId) {
      setActiveBook({ ...activeBook, status });
    }
  };

  const handleSaveNotes = () => {
    if (!activeBook) return;
    hybridStore.updateBookNotes(activeBook.id, noteEdit, activeBook.favoriteQuotes);
    loadBooks();
    setActiveBook({ ...activeBook, personalNotes: noteEdit });
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook || !newQuoteInput.trim()) return;
    const updatedQuotes = [...(activeBook.favoriteQuotes || []), newQuoteInput.trim()];
    hybridStore.updateBookNotes(activeBook.id, activeBook.personalNotes || "", updatedQuotes);
    loadBooks();
    setActiveBook({ ...activeBook, favoriteQuotes: updatedQuotes });
    setNewQuoteInput("");
  };

  const handleDeleteBook = (id: string) => {
    if (confirm("Remove this volume from your library?")) {
      hybridStore.deleteBook(id);
      loadBooks();
      setActiveBook(null);
    }
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    hybridStore.saveBook({
      id: `book-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim(),
      genre: newGenre,
      estimatedPages: newPages,
      currentPage: newStatus === "finished" ? newPages : 0,
      progressPercent: newStatus === "finished" ? 100 : 0,
      status: newStatus,
      coverColor: newColor,
    });

    loadBooks();
    setShowAddModal(false);
    setNewTitle("");
    setNewAuthor("");
  };

  const filteredBooks = books.filter((b) => {
    const matchesShelf = selectedShelf === "all" || b.status === selectedShelf;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShelf && matchesSearch;
  });

  const shelfTabs = [
    { id: "all", label: "All Volumes", count: books.length },
    { id: "currently_reading", label: "Currently Reading", count: books.filter((b) => b.status === "currently_reading").length },
    { id: "want_to_read", label: "Want to Read", count: books.filter((b) => b.status === "want_to_read").length },
    { id: "finished", label: "Finished", count: books.filter((b) => b.status === "finished").length },
    { id: "favorite", label: "Favorite Books", count: books.filter((b) => b.status === "favorite").length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#DED7C9] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#65745A] flex items-center gap-1.5 mb-1">
            <LibraryIcon className="w-4 h-4" /> Personal Bookshelf
          </span>
          <h1 className="font-literary text-3xl sm:text-4xl font-semibold text-[#332F29]">
            My Library
          </h1>
          <p className="text-xs text-[#777267] mt-1">
            A sanctuary for the books you have loved, those you are reading, and the ones waiting on your shelf.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641] transition-all shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catalog a Book</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Shelf Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {shelfTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedShelf(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedShelf === tab.id
                  ? "bg-[#65745A] text-[#FFFCF5] font-semibold shadow-2xs"
                  : "bg-[#FFFCF5] text-[#777267] hover:text-[#332F29] border border-[#DED7C9]"
              }`}
            >
              {tab.label} <span className="opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777267]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, author, genre..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#DED7C9] bg-[#FFFCF5] text-xs text-[#332F29] placeholder:text-[#777267]/60 focus:outline-none focus:border-[#65745A]"
          />
        </div>
      </div>

      {/* Bookshelf Visual Grid */}
      {filteredBooks.length === 0 ? (
        <div className="sanctuary-card p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#65745A]/50 mx-auto" />
          <h3 className="font-literary text-xl font-medium text-[#332F29]">
            This shelf is quiet
          </h3>
          <p className="text-xs text-[#777267] max-w-sm mx-auto">
            No books found matching this filter. Add a book from your physical shelf to catalog it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleOpenBook(book)}
              className="cursor-pointer group flex flex-col space-y-2.5"
            >
              {/* Hardcover Book Spine & Cover */}
              <div
                className="book-cover h-56 p-4 flex flex-col justify-between text-[#FFFCF5] relative overflow-hidden"
                style={{ backgroundColor: book.coverColor || "#65745A" }}
              >
                {/* Book Header lines */}
                <div className="space-y-1">
                  <div className="w-6 h-0.5 bg-[#FFFCF5]/50 mb-2" />
                  <span className="text-[9px] uppercase tracking-wider text-[#FFFCF5]/80 font-bold block">
                    {book.genre}
                  </span>
                  <h3 className="font-literary text-sm sm:text-base font-bold leading-tight line-clamp-3">
                    {book.title}
                  </h3>
                </div>

                {/* Author & Status bottom */}
                <div>
                  <span className="font-literary text-xs italic text-[#FFFCF5]/90 block truncate">
                    {book.author}
                  </span>

                  {book.status === "currently_reading" && (
                    <div className="mt-2 w-full h-1 bg-[#FFFCF5]/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFFCF5] rounded-full"
                        style={{ width: `${book.progressPercent}%` }}
                      />
                    </div>
                  )}

                  {book.status === "finished" && (
                    <span className="inline-block mt-2 text-[10px] text-[#FFFCF5]/80 font-medium">
                      ✓ Finished
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Author Below */}
              <div className="px-0.5">
                <h4 className="font-literary text-sm font-semibold text-[#332F29] group-hover:text-[#65745A] transition-colors line-clamp-1">
                  {book.title}
                </h4>
                <p className="text-xs text-[#777267] truncate">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOK DETAIL MODAL */}
      {activeBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#332F29]/50 backdrop-blur-xs"
            onClick={() => setActiveBook(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#FFFCF5] rounded-xl border border-[#DED7C9] shadow-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#DED7C9] pb-4">
              <div className="flex gap-4 items-start">
                {/* Book Cover Thumbnail */}
                <div
                  className="book-cover w-20 h-28 shrink-0 p-2.5 flex flex-col justify-between text-[#FFFCF5]"
                  style={{ backgroundColor: activeBook.coverColor || "#65745A" }}
                >
                  <span className="font-literary text-[10px] font-bold line-clamp-2">
                    {activeBook.title}
                  </span>
                  <span className="text-[8px] text-[#FFFCF5]/80 truncate">
                    {activeBook.author}
                  </span>
                </div>

                <div>
                  <h3 className="font-literary text-2xl font-bold text-[#332F29]">
                    {activeBook.title}
                  </h3>
                  <p className="text-xs text-[#777267] mt-0.5">By {activeBook.author}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#E5E6D9] text-[#485641] text-[11px] font-semibold">
                      {activeBook.genre}
                    </span>
                    <span>•</span>
                    <span className="text-[#777267]">{activeBook.estimatedPages} pages</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveBook(null)}
                className="p-1 rounded text-[#777267] hover:bg-[#E5E6D9] hover:text-[#332F29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector & Reading Progress */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F5F0E6] border border-[#DED7C9]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#777267]">Reading status:</span>
                <select
                  value={activeBook.status}
                  onChange={(e) => handleUpdateStatus(activeBook.id, e.target.value as any)}
                  className="px-2.5 py-1 rounded border border-[#DED7C9] bg-[#FFFCF5] text-xs font-semibold text-[#332F29] focus:outline-none focus:border-[#65745A]"
                >
                  <option value="currently_reading">Currently Reading</option>
                  <option value="want_to_read">Want to Read</option>
                  <option value="finished">Finished</option>
                  <option value="favorite">Favorite Book</option>
                </select>
              </div>

              {activeBook.sourceLink && (
                <a
                  href={activeBook.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#65745A] font-semibold hover:underline"
                >
                  <span>Read on Project Gutenberg</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Personal Reflections / Reading Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#65745A] flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Personal Notes & Reflections
                </label>
                <button
                  onClick={handleSaveNotes}
                  className="text-xs text-[#65745A] font-semibold hover:underline"
                >
                  Save Notes
                </button>
              </div>

              <textarea
                value={noteEdit}
                onChange={(e) => setNoteEdit(e.target.value)}
                placeholder="Write your personal reflections on this book, what it made you think about, or how it shifted your perspective..."
                className="w-full p-3.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs font-literary text-base text-[#332F29] placeholder:text-[#777267]/60 focus:outline-none focus:border-[#65745A] min-h-[110px]"
              />
            </div>

            {/* Favorite Passages & Quotes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#754650] flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" /> Favorite Passages & Underlined Quotes
              </label>

              {activeBook.favoriteQuotes && activeBook.favoriteQuotes.length > 0 ? (
                <div className="space-y-2">
                  {activeBook.favoriteQuotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#E5E6D9]/40 border border-[#DED7C9] text-xs font-literary italic text-[#332F29] leading-relaxed"
                    >
                      "{q}"
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777267] italic">No quotes saved yet for this volume.</p>
              )}

              {/* Add Quote form */}
              <form onSubmit={handleAddQuote} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newQuoteInput}
                  onChange={(e) => setNewQuoteInput(e.target.value)}
                  placeholder="Type an underlined line or quote..."
                  className="flex-1 p-2 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs text-[#332F29] focus:outline-none focus:border-[#65745A]"
                />
                <button
                  type="submit"
                  disabled={!newQuoteInput.trim()}
                  className="px-3 py-2 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641] disabled:opacity-50"
                >
                  + Add Quote
                </button>
              </form>
            </div>

            {/* Modal Bottom: Delete button */}
            <div className="pt-4 border-t border-[#DED7C9] flex justify-between items-center text-xs text-[#777267]">
              <span>Saved in your Inkling Sanctuary</span>
              <button
                onClick={() => handleDeleteBook(activeBook.id)}
                className="text-[#754650] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove volume</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATALOG NEW BOOK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#332F29]/50 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />

          <form
            onSubmit={handleAddBookSubmit}
            className="relative w-full max-w-md bg-[#FFFCF5] rounded-xl border border-[#DED7C9] shadow-xl p-6 sm:p-8 space-y-5 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#DED7C9] pb-3">
              <h3 className="font-literary text-2xl font-bold text-[#332F29]">Catalog a Book</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#777267] hover:text-[#332F29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#332F29]">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. The Picture of Dorian Gray"
                className="w-full p-2.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs text-[#332F29] focus:outline-none focus:border-[#65745A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#332F29]">Author</label>
              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="e.g. Oscar Wilde"
                className="w-full p-2.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs text-[#332F29] focus:outline-none focus:border-[#65745A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#332F29]">Genre</label>
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs text-[#332F29] focus:outline-none focus:border-[#65745A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#332F29]">Pages</label>
                <input
                  type="number"
                  value={newPages}
                  onChange={(e) => setNewPages(parseInt(e.target.value) || 200)}
                  className="w-full p-2.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs text-[#332F29] focus:outline-none focus:border-[#65745A]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#332F29]">Initial Shelf</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-[#DED7C9] bg-[#F5F0E6] text-xs text-[#332F29] focus:outline-none"
              >
                <option value="want_to_read">Want to Read</option>
                <option value="currently_reading">Currently Reading</option>
                <option value="finished">Finished</option>
                <option value="favorite">Favorite</option>
              </select>
            </div>

            {/* Cover Color Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#332F29]">Spine & Cover Shade</label>
              <div className="flex items-center gap-3">
                {["#65745A", "#485641", "#754650", "#332F29", "#8C6D53", "#3D724D"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-md transition-transform ${
                      newColor === c ? "ring-2 ring-offset-2 ring-[#65745A] scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DED7C9]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#777267] hover:bg-[#E5E6D9]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#65745A] text-[#FFFCF5] text-xs font-semibold hover:bg-[#485641]"
              >
                Add to Shelf
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
