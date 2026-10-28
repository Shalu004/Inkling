"use client";

import React, { useState, useEffect, useRef } from "react";
import { LiteraryQuote } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Quote,
  Bookmark,
  BookmarkCheck,
  Search,
  PenTool,
  Share2,
  ExternalLink,
  Sparkles,
  Download,
  Copy,
  Check,
  X,
  Feather,
  Flower2,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LiteraryQuoteCollection() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<LiteraryQuote[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [onlySaved, setOnlySaved] = useState(false);

  // Active modal states
  const [reflectingQuote, setReflectingQuote] = useState<LiteraryQuote | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [sharingQuote, setSharingQuote] = useState<LiteraryQuote | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [cardTheme, setCardTheme] = useState<"linen" | "midnight" | "sage" | "sepia">("linen");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => {
    const list = hybridStore.getLiteraryQuotes();
    setQuotes(list);
    setSavedIds(hybridStore.getSavedQuoteIds());
    setReflections(hybridStore.getQuoteReflections());
  };

  const dailyQuote = hybridStore.getDailyQuote();

  const handleToggleSave = (quoteId: string) => {
    hybridStore.toggleSaveQuote(quoteId);
    setSavedIds(hybridStore.getSavedQuoteIds());
  };

  const handleOpenReflection = (quote: LiteraryQuote) => {
    setReflectingQuote(quote);
    setReflectionText(reflections[quote.id] || "");
  };

  const handleSaveReflection = () => {
    if (!reflectingQuote) return;
    hybridStore.saveQuoteReflection(reflectingQuote.id, reflectionText);
    setReflections(hybridStore.getQuoteReflections());

    // Also offer to save as a journal entry
    if (reflectionText.trim()) {
      hybridStore.saveJournalEntry({
        title: `Reflection on ${reflectingQuote.author}`,
        body: `"${reflectingQuote.quote}"\n— ${reflectingQuote.author}, ${reflectingQuote.work}\n\n${reflectionText}`,
        tags: ["Quotation", "Reflection", reflectingQuote.theme.split(" ")[0]],
        isFavorite: true,
      });
    }

    setReflectingQuote(null);
  };

  const handleCopyQuote = (q: LiteraryQuote) => {
    const text = `"${q.quote}"\n— ${q.author}, ${q.work} (${q.year || "n.d."})`;
    navigator.clipboard.writeText(text);
    setCopiedQuoteId(q.id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  // Extract unique themes and authors for filtering
  const themes = ["all", ...Array.from(new Set(quotes.map((q) => q.theme)))];
  const authors = ["all", ...Array.from(new Set(quotes.map((q) => q.author)))];

  const filteredQuotes = quotes.filter((q) => {
    if (onlySaved && !savedIds.includes(q.id)) return false;
    if (selectedTheme !== "all" && q.theme !== selectedTheme) return false;
    if (selectedAuthor !== "all" && q.author !== selectedAuthor) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQuote = q.quote.toLowerCase().includes(query);
      const matchAuthor = q.author.toLowerCase().includes(query);
      const matchWork = q.work.toLowerCase().includes(query);
      const matchTheme = q.theme.toLowerCase().includes(query);
      return matchQuote || matchAuthor || matchWork || matchTheme;
    }
    return true;
  });

  // Render Quote Card on Canvas for PNG download
  useEffect(() => {
    if (!sharingQuote || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Card dimensions
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Colors based on card theme
    let bg = "#F5F0E6";
    let paperBg = "#FFFCF5";
    let borderColor = "#D6CEC0";
    let textPrimary = "#302B25";
    let textSecondary = "#655E53";
    let accent = "#58694E";

    if (cardTheme === "midnight") {
      bg = "#151715";
      paperBg = "#1F221E";
      borderColor = "#3A4138";
      textPrimary = "#F5EFEB";
      textSecondary = "#B5BFB1";
      accent = "#98B48C";
    } else if (cardTheme === "sage") {
      bg = "#E7ECE3";
      paperBg = "#F5F8F3";
      borderColor = "#BAC7B4";
      textPrimary = "#222E20";
      textSecondary = "#4D604A";
      accent = "#445A3E";
    } else if (cardTheme === "sepia") {
      bg = "#EFE5D3";
      paperBg = "#F9F3E8";
      borderColor = "#D0BEA2";
      textPrimary = "#2E2215";
      textSecondary = "#63513C";
      accent = "#6E4F32";
    }

    // Background fill
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Inner paper card
    const margin = 60;
    ctx.fillStyle = paperBg;
    ctx.fillRect(margin, margin, width - margin * 2, height - margin * 2);

    // Border line
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner decorative hairline border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 20, margin + 20, width - margin * 2 - 40, height - margin * 2 - 40);

    // Header colophon
    ctx.fillStyle = accent;
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("INKLING  •  LITERARY SANCTUARY", width / 2, margin + 90);

    // Theme tag
    ctx.fillStyle = textSecondary;
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillText(`— ${sharingQuote.theme} —`, width / 2, margin + 140);

    // Decorative quote mark
    ctx.fillStyle = accent;
    ctx.font = "italic 80px Georgia, serif";
    ctx.fillText("“", width / 2, margin + 240);

    // Wrap quote text
    ctx.fillStyle = textPrimary;
    ctx.font = "italic 44px Georgia, serif";
    ctx.textAlign = "center";

    const maxWidth = width - margin * 2 - 160;
    const words = sharingQuote.quote.split(" ");
    let line = "";
    const lines: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Compute vertical center for quote lines
    const lineHeight = 64;
    const quoteBlockHeight = lines.length * lineHeight;
    let startY = 320 + (360 - quoteBlockHeight) / 2;
    if (startY < 300) startY = 300;

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
    }

    // Attribution
    const authorY = startY + quoteBlockHeight + 70;
    ctx.fillStyle = textPrimary;
    ctx.font = "600 36px Georgia, serif";
    ctx.fillText(`— ${sharingQuote.author}`, width / 2, authorY);

    ctx.fillStyle = textSecondary;
    ctx.font = "italic 26px Georgia, serif";
    ctx.fillText(
      `${sharingQuote.work}${sharingQuote.year ? ` (${sharingQuote.year})` : ""}`,
      width / 2,
      authorY + 45
    );

    // Footer divider and colophon
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, height - margin - 100);
    ctx.lineTo(width / 2 + 120, height - margin - 100);
    ctx.stroke();

    ctx.fillStyle = textSecondary;
    ctx.font = "500 20px Inter, sans-serif";
    ctx.fillText("Preserved in personal reading journal", width / 2, height - margin - 60);
  }, [sharingQuote, cardTheme]);

  const handleDownloadCard = () => {
    if (!canvasRef.current || !sharingQuote) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    const safeTitle = sharingQuote.author.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.download = `inkling-quote-${safeTitle}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* QUOTE OF THE DAY BANNER */}
      {dailyQuote && (
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-paper border border-warm-border shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-sage">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quote of the Day</span>
                <span className="text-ink-secondary/60">•</span>
                <span className="text-ink-secondary lowercase italic font-normal">
                  {dailyQuote.theme}
                </span>
              </div>

              <blockquote className="font-literary text-xl sm:text-2xl text-ink-primary font-medium leading-relaxed italic border-l-2 border-primary-sage pl-4">
                "{dailyQuote.quote}"
              </blockquote>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
                <span className="font-literary font-semibold text-ink-primary">
                  — {dailyQuote.author}
                </span>
                <span className="text-ink-secondary text-xs italic">
                  in {dailyQuote.work} {dailyQuote.year ? `(${dailyQuote.year})` : ""}
                </span>
                {dailyQuote.sourceUrl && (
                  <a
                    href={dailyQuote.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary-sage hover:underline ml-2"
                  >
                    <span>Read Work</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => handleToggleSave(dailyQuote.id)}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  savedIds.includes(dailyQuote.id)
                    ? "bg-primary-sage text-paper border-primary-sage shadow-2xs"
                    : "border-warm-border text-ink-secondary hover:text-ink-primary hover:bg-sage-surface"
                }`}
                title="Save quote"
              >
                {savedIds.includes(dailyQuote.id) ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleOpenReflection(dailyQuote)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-sage-surface text-ink-primary hover:bg-botanical-light transition-all border border-warm-border"
              >
                <PenTool className="w-3.5 h-3.5 text-primary-sage" />
                <span>Reflect</span>
              </button>

              <button
                onClick={() => setSharingQuote(dailyQuote)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-paper border border-warm-border text-ink-primary hover:bg-sage-surface transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Share Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quote, author, work, or theme..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-warm-border bg-paper text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:border-primary-sage transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Author dropdown */}
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              aria-label="Filter quotations by author"
              className="px-3 py-2 rounded-xl border border-warm-border bg-paper text-xs text-ink-primary focus:outline-none"
            >
              <option value="all">All Authors ({authors.length - 1})</option>
              {authors
                .filter((a) => a !== "all")
                .map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
            </select>

            {/* Saved filter toggle */}
            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                onlySaved
                  ? "bg-primary-sage text-paper border-primary-sage"
                  : "bg-paper text-ink-secondary hover:text-ink-primary border-warm-border"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Theme Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap transition-all ${
                selectedTheme === theme
                  ? "bg-ink-primary text-paper font-semibold"
                  : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* QUOTATION CARDS GRID */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-warm-border bg-paper space-y-2">
          <Quote className="w-8 h-8 text-ink-secondary/50 mx-auto" />
          <h3 className="font-literary text-lg font-semibold text-ink-primary">
            No quotations found
          </h3>
          <p className="text-xs text-ink-secondary">
            Try adjusting your search query, theme filter, or saved bookmark filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuotes.map((q) => {
            const isSaved = savedIds.includes(q.id);
            const userReflection = reflections[q.id];

            return (
              <div
                key={q.id}
                className="p-6 rounded-2xl bg-paper border border-warm-border hover:border-primary-sage/50 transition-all flex flex-col justify-between space-y-4 group shadow-xs relative"
              >
                <div className="space-y-3">
                  {/* Top pill bar */}
                  <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                    <span className="px-2.5 py-0.5 rounded-md bg-sage-surface text-deep-olive font-medium">
                      {q.theme}
                    </span>
                    <span className="italic capitalize">{q.emotion}</span>
                  </div>

                  {/* Quote text */}
                  <blockquote className="font-literary text-base sm:text-lg text-ink-primary leading-relaxed italic border-l-2 border-primary-sage/60 pl-3">
                    "{q.quote}"
                  </blockquote>

                  {/* Contextual Note */}
                  {q.contextNote && (
                    <p className="text-[11px] text-ink-secondary leading-relaxed bg-sanctuary/50 p-2.5 rounded-lg border border-warm-border/50">
                      {q.contextNote}
                    </p>
                  )}

                  {/* Existing personal reflection */}
                  {userReflection && (
                    <div className="p-2.5 rounded-lg bg-sage-surface/60 border border-warm-border text-xs text-deep-olive">
                      <strong className="block text-[10px] uppercase tracking-wider text-primary-sage mb-0.5 font-sans">
                        Your Reflection:
                      </strong>
                      <p className="font-literary italic">{userReflection}</p>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-literary font-semibold text-ink-primary truncate">
                      — {q.author}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-secondary truncate">
                      <span className="italic truncate">{q.work}</span>
                      {q.year && <span>({q.year})</span>}
                      {q.sourceUrl && (
                        <a
                          href={q.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-sage"
                          title="Open verified source"
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyQuote(q)}
                      className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-sage-surface transition-colors"
                      title="Copy quote & attribution"
                    >
                      {copiedQuoteId === q.id ? (
                        <Check className="w-3.5 h-3.5 text-primary-sage" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenReflection(q)}
                      className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-sage-surface transition-colors"
                      title="Write personal reflection"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSharingQuote(q)}
                      className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-sage-surface transition-colors"
                      title="Export image card"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleSave(q.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? "text-primary-sage bg-sage-surface"
                          : "text-ink-secondary hover:text-ink-primary hover:bg-sage-surface"
                      }`}
                      title={isSaved ? "Remove from saved" : "Bookmark quote"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REFLECTION MODAL */}
      {reflectingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-paper border border-warm-border p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-warm-border pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-sage">
                  Personal Reflection
                </span>
                <h3 className="font-literary text-lg font-semibold text-ink-primary">
                  {reflectingQuote.author}
                </h3>
              </div>
              <button
                onClick={() => setReflectingQuote(null)}
                className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-sage-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <blockquote className="font-literary text-sm text-ink-primary italic border-l-2 border-primary-sage pl-3 bg-sanctuary/40 p-3 rounded-r-lg">
              "{reflectingQuote.quote}"
            </blockquote>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-secondary block">
                How does this passage speak to your current thinking or writing?
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Pen your personal contemplation here. Saving will also create an entry in My Journal..."
                rows={4}
                className="w-full p-3 rounded-xl border border-warm-border bg-sanctuary text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:border-primary-sage"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-warm-border">
              <button
                onClick={() => setReflectingQuote(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-sage-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReflection}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary-sage text-paper hover:bg-deep-olive transition-colors"
              >
                Save Reflection & Journal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE IMAGE CARD MODAL */}
      {sharingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-paper border border-warm-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-warm-border pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-sage">
                  Literary Card Generator
                </span>
                <h3 className="font-literary text-lg font-semibold text-ink-primary">
                  Share Quotation
                </h3>
              </div>
              <button
                onClick={() => setSharingQuote(null)}
                className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-sage-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme switcher for card */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-secondary font-medium">Card Aesthetic Tone:</span>
              <div className="flex items-center gap-1.5">
                {(["linen", "sage", "midnight", "sepia"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCardTheme(t)}
                    className={`px-2.5 py-1 rounded-lg capitalize border text-xs font-medium transition-all ${
                      cardTheme === t
                        ? "bg-primary-sage text-paper border-primary-sage"
                        : "bg-paper text-ink-secondary border-warm-border hover:text-ink-primary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Card Canvas Preview */}
            <div className="flex justify-center p-3 rounded-xl bg-sanctuary/60 border border-warm-border">
              <canvas
                ref={canvasRef}
                className="w-full max-w-sm aspect-square rounded-lg shadow-md border border-warm-border"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-warm-border">
              <button
                onClick={() => handleCopyQuote(sharingQuote)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-warm-border text-ink-primary hover:bg-sage-surface transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Citation</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSharingQuote(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-ink-secondary hover:text-ink-primary"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadCard}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-primary-sage text-paper hover:bg-deep-olive transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card (PNG)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
