"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MoodType,
  WritingFormat,
  WritingPrompt,
  WritingSession,
  DocumentType,
} from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import { MoodSelector } from "./MoodSelector";
import { WritingCompanionPanel } from "./WritingCompanionPanel";
import { DOCUMENT_TEMPLATES } from "@/lib/curated/documentTemplates";
import {
  exportToTxt,
  exportToDocx,
  exportToPrintOrPdf,
} from "@/lib/export/documentExport";
import {
  Sparkles,
  Save,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  HelpCircle,
  Check,
  RotateCcw,
  Plus,
  Download,
  FolderOpen,
  List,
  Type,
  Sliders,
  Moon,
  Sun,
  Star,
  Trash2,
  Search,
  BookOpen,
  ExternalLink,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  ListOrdered,
  Quote,
  Link2,
} from "lucide-react";

interface WritingEditorProps {
  initialSession?: WritingSession | null;
  initialPrompt?: WritingPrompt | null;
}

export function WritingEditor({ initialSession, initialPrompt }: WritingEditorProps) {
  const router = useRouter();

  // Active Session State
  const [sessionId, setSessionId] = useState<string>(
    initialSession?.id || `session-${Date.now()}`
  );
  const [title, setTitle] = useState(initialSession?.title || "");
  const [content, setContent] = useState(initialSession?.content || "");
  const [mood, setMood] = useState<MoodType | null>(
    initialSession?.mood || initialPrompt?.mood || null
  );
  const [format, setFormat] = useState<WritingFormat>(
    initialSession?.format || initialPrompt?.format || "reflective_essay"
  );
  const [docType, setDocType] = useState<DocumentType>(
    initialSession?.documentType || "article_essay"
  );
  const [isFavorite, setIsFavorite] = useState(initialSession?.isFavorite || false);
  const [prompt, setPrompt] = useState<WritingPrompt | null>(initialPrompt || null);
  const [showPromptDrawer, setShowPromptDrawer] = useState<boolean>(Boolean(initialPrompt));

  // Studio Display Settings
  const [displayMode, setDisplayMode] = useState<"paper" | "black_canvas">("paper");
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(1.85);
  const [maxWidth, setMaxWidth] = useState<number>(760);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Panels & Drawers
  const [showCompanion, setShowCompanion] = useState(false);
  const [showDocManager, setShowDocManager] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showStyleSettings, setShowStyleSettings] = useState(false);

  // Document Management list
  const [allSessions, setAllSessions] = useState<WritingSession[]>([]);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Metrics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(1);
  const [estimatedPages, setEstimatedPages] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(
    initialSession?.durationSeconds || 0
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const styleMenuRef = useRef<HTMLDivElement>(null);

  // Refresh saved documents list
  const refreshDocumentsList = () => {
    setAllSessions(hybridStore.getWritingSessions());
  };

  useEffect(() => {
    refreshDocumentsList();
  }, []);

  // Calculate live word metrics
  useEffect(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    setCharCount(content.length);
    setReadingTimeMinutes(Math.max(1, Math.ceil(words / 200)));
    setEstimatedPages(Math.max(1, Math.ceil(words / 250)));
  }, [content]);

  // Session duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Debounced Autosave (1.5s)
  useEffect(() => {
    if (!content && !title) return;

    setSaveStatus("unsaved");
    const handler = setTimeout(() => {
      setSaveStatus("saving");
      const saved = hybridStore.saveWritingSession({
        id: sessionId,
        title: title || "Untitled Document",
        content,
        mood: mood || undefined,
        format,
        documentType: docType,
        isFavorite,
        durationSeconds,
        promptId: prompt?.id,
        promptTitle: prompt?.title,
        status: "draft",
      });
      refreshDocumentsList();
      setTimeout(() => {
        setSaveStatus("saved");
        const now = new Date();
        setLastSavedAt(
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }, 400);
    }, 1500);

    return () => clearTimeout(handler);
  }, [content, title, mood, format, docType, isFavorite, durationSeconds, sessionId, prompt]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setShowStyleSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format time mm:ss / hh:mm
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      return `${h}h ${m % 60}m`;
    }
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // Text formatting helpers (supports selection wrap)
  const applyFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // Switch to another saved document
  const handleSelectDocument = (doc: WritingSession) => {
    setSessionId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setMood(doc.mood || null);
    setFormat(doc.format || "reflective_essay");
    setDocType(doc.documentType || "article_essay");
    setIsFavorite(doc.isFavorite || false);
    setDurationSeconds(doc.durationSeconds || 0);
    setShowDocManager(false);
  };

  // Create new document from template
  const handleCreateDocument = (type: DocumentType) => {
    const template = DOCUMENT_TEMPLATES.find((t) => t.type === type) || DOCUMENT_TEMPLATES[0];
    const newId = `session-${Date.now()}`;
    const newTitle = template.defaultTitle;
    const newContent = template.starterOutline;

    hybridStore.saveWritingSession({
      id: newId,
      title: newTitle,
      content: newContent,
      documentType: type,
      format: "reflective_essay",
      status: "draft",
    });

    setSessionId(newId);
    setTitle(newTitle);
    setContent(newContent);
    setDocType(type);
    setIsFavorite(false);
    setDurationSeconds(0);
    setShowNewDocModal(false);
    refreshDocumentsList();
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    hybridStore.deleteWritingSession(id);
    setDeletingDocId(null);
    refreshDocumentsList();
    if (id === sessionId) {
      // If current document deleted, create fresh one
      handleCreateDocument("blank_document");
    }
  };

  // Toggle favorite
  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    hybridStore.toggleFavoriteDocument(sessionId);
    refreshDocumentsList();
  };

  // Extract headings for outline
  const outlineItems = content
    .split("\n")
    .map((line, idx) => {
      if (line.startsWith("# ")) {
        return { level: 1, text: line.replace("# ", "").trim(), line: idx };
      }
      if (line.startsWith("## ")) {
        return { level: 2, text: line.replace("## ", "").trim(), line: idx };
      }
      if (line.startsWith("### ")) {
        return { level: 3, text: line.replace("### ", "").trim(), line: idx };
      }
      return null;
    })
    .filter(Boolean) as Array<{ level: number; text: string; line: number }>;

  // Handle Export
  const handleExport = (type: "txt" | "docx" | "pdf") => {
    setShowExportMenu(false);
    const exportData = {
      title: title || "Untitled Document",
      content,
      documentType: docType,
      date: new Date().toLocaleDateString(),
    };

    if (type === "txt") {
      exportToTxt(exportData);
    } else if (type === "docx") {
      exportToDocx(exportData);
    } else if (type === "pdf") {
      exportToPrintOrPdf(exportData);
    }
  };

  // Filtered documents in manager
  const filteredSessions = allSessions.filter((s) => {
    const q = docSearchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.content && s.content.toLowerCase().includes(q)) ||
      (s.documentType && s.documentType.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex flex-col transition-colors duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : "relative"
      } ${
        displayMode === "black_canvas"
          ? "bg-[#141614] text-[#E8E2DC]"
          : "bg-[var(--bg-paper)] text-[var(--text-main)]"
      }`}
    >
      {/* 1. TOP STUDIO BAR */}
      <header
        className={`sticky top-0 z-20 px-4 sm:px-6 py-2.5 border-b backdrop-blur-md transition-colors ${
          displayMode === "black_canvas"
            ? "bg-[#181B18]/95 border-[#2A3029]"
            : "bg-[var(--bg-paper)]/95 border-[var(--border-warm)]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Left: Document Manager & New Doc */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDocManager(!showDocManager)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-warm)] text-xs font-medium hover:bg-[var(--bg-sage-surface)] transition-colors"
              title="Browse all drafts and documents"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
              <span className="hidden sm:inline">Drafts</span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                ({allSessions.length})
              </span>
            </button>

            <button
              onClick={() => setShowNewDocModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs"
              title="Create a new document from template"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Document</span>
            </button>

            {/* Document Type Badge */}
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] capitalize border border-[var(--border-warm)]">
              {docType.replace(/_/g, " ")}
            </span>
          </div>

          {/* Center: Live Save Status */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === "saved"
                  ? "bg-emerald-500"
                  : saveStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="text-[11px] hidden sm:inline">
              {saveStatus === "saved"
                ? lastSavedAt
                  ? `Saved at ${lastSavedAt}`
                  : "Saved to drafts"
                : saveStatus === "saving"
                ? "Saving..."
                : "Unsaved edits"}
            </span>
          </div>

          {/* Right: Studio Controls (Mode, Outline, Font, Export, Companion) */}
          <div className="flex items-center gap-1.5">
            {/* Favorite Star */}
            <button
              onClick={handleToggleFavorite}
              className={`p-1.5 rounded-lg border border-[var(--border-warm)] transition-colors ${
                isFavorite
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)]"
              }`}
              title={isFavorite ? "Remove favorite" : "Star as favorite"}
            >
              <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>

            {/* Document Outline Toggle */}
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`p-1.5 rounded-lg border border-[var(--border-warm)] transition-colors ${
                showOutline
                  ? "bg-[var(--accent-sage)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)]"
              }`}
              title="Table of Contents / Headings Outline"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Display Mode Toggle: Paper vs Black Canvas */}
            <button
              onClick={() =>
                setDisplayMode(displayMode === "paper" ? "black_canvas" : "paper")
              }
              className="p-1.5 rounded-lg border border-[var(--border-warm)] text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)] transition-colors"
              title={
                displayMode === "paper"
                  ? "Switch to Black Canvas (Dark Distraction-Free)"
                  : "Switch to Paper Mode (Print-Ready Layout)"
              }
            >
              {displayMode === "paper" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Typography / Style Settings Dropdown */}
            <div className="relative" ref={styleMenuRef}>
              <button
                onClick={() => setShowStyleSettings(!showStyleSettings)}
                className="p-1.5 rounded-lg border border-[var(--border-warm)] text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)] transition-colors"
                title="Page width, font size, and line height"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showStyleSettings && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-xl p-4 text-xs space-y-3.5 z-40 text-[var(--text-main)]">
                  <div className="font-semibold text-xs border-b border-[var(--border-warm)] pb-1.5">
                    Studio Reading & Page Setup
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Font Size</span>
                      <span>{fontSize}px</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[15, 17, 19, 22].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setFontSize(sz)}
                          className={`flex-1 py-1 rounded text-[11px] font-medium border ${
                            fontSize === sz
                              ? "bg-[var(--accent-sage)] text-white border-transparent"
                              : "border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Spacing */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Line Height</span>
                      <span>{lineHeight}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[
                        { label: "Relaxed", val: 1.6 },
                        { label: "Loose", val: 1.85 },
                        { label: "Spacious", val: 2.1 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setLineHeight(item.val)}
                          className={`flex-1 py-1 rounded text-[10px] font-medium border ${
                            lineHeight === item.val
                              ? "bg-[var(--accent-sage)] text-white border-transparent"
                              : "border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Page Width */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Page Width</span>
                      <span>{maxWidth}px</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[
                        { label: "Narrow", val: 640 },
                        { label: "Standard", val: 760 },
                        { label: "Wide", val: 920 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setMaxWidth(item.val)}
                          className={`flex-1 py-1 rounded text-[10px] font-medium border ${
                            maxWidth === item.val
                              ? "bg-[var(--accent-sage)] text-white border-transparent"
                              : "border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-warm)] text-xs font-medium hover:bg-[var(--bg-sage-surface)] transition-colors"
                title="Export document"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent-sage)]" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-xl py-1 text-xs z-40 text-[var(--text-main)]">
                  <button
                    onClick={() => handleExport("docx")}
                    className="w-full text-left px-3.5 py-2 hover:bg-[var(--bg-sage-surface)] flex items-center justify-between transition-colors"
                  >
                    <span>Microsoft Word (.docx)</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">DOCX</span>
                  </button>
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full text-left px-3.5 py-2 hover:bg-[var(--bg-sage-surface)] flex items-center justify-between transition-colors"
                  >
                    <span>Print-Ready / PDF</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport("txt")}
                    className="w-full text-left px-3.5 py-2 hover:bg-[var(--bg-sage-surface)] flex items-center justify-between transition-colors"
                  >
                    <span>Plain Text (.txt)</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">TXT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Writing Companion Toggle */}
            <button
              onClick={() => setShowCompanion(!showCompanion)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                showCompanion
                  ? "bg-[var(--accent-sage)] text-white"
                  : "bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] border border-[var(--accent-sage)]/30 hover:bg-[var(--accent-sage)] hover:text-white"
              }`}
              title="Open Writing Companion"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Companion</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg border border-[var(--border-warm)] text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)] transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. FORMATTING TOOLBAR */}
      <div
        className={`px-4 sm:px-6 py-1.5 border-b flex items-center gap-1 overflow-x-auto transition-colors text-xs ${
          displayMode === "black_canvas"
            ? "bg-[#161816] border-[#2A3029] text-[#B5BFB1]"
            : "bg-[var(--bg-sage-surface)]/40 border-[var(--border-warm)] text-[var(--text-muted)]"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center gap-1">
          <button
            onClick={() => applyFormatting("# ", "")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors font-semibold"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting("## ", "")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors font-semibold"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-[var(--border-warm)] px-1">|</span>
          <button
            onClick={() => applyFormatting("**", "**")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting("*", "*")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting("<u>", "</u>")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <span className="text-[var(--border-warm)] px-1">|</span>
          <button
            onClick={() => applyFormatting("- ", "")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Bulleted List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting("1. ", "")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting("> ", "")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting("[", "](https://)")}
            className="p-1.5 rounded hover:bg-[var(--bg-paper)] hover:text-[var(--text-main)] transition-colors"
            title="Link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. STUDIO BODY: OUTLINE + WRITING CANVAS + COMPANION */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Outline Drawer (Collapsible) */}
        {showOutline && (
          <aside className="w-64 border-r border-[var(--border-warm)] bg-[var(--bg-paper)] p-4 overflow-y-auto space-y-3 shrink-0 hidden md:block">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-warm)]">
              <span className="text-xs font-semibold text-[var(--text-main)]">
                Document Outline
              </span>
              <button
                onClick={() => setShowOutline(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {outlineItems.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
                Add markdown headings (# Heading) to structure your document outline.
              </p>
            ) : (
              <nav className="space-y-1 text-xs">
                {outlineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-1.5 rounded hover:bg-[var(--bg-sage-surface)] cursor-pointer truncate transition-colors text-[var(--text-main)] ${
                      item.level === 1
                        ? "font-semibold text-xs"
                        : item.level === 2
                        ? "pl-3 text-[11px] text-[var(--text-body)]"
                        : "pl-5 text-[10px] text-[var(--text-muted)]"
                    }`}
                  >
                    {item.text}
                  </div>
                ))}
              </nav>
            )}
          </aside>
        )}

        {/* Main Writing Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          <div
            className={`w-full transition-all duration-300 ${
              displayMode === "paper"
                ? "bg-[var(--bg-paper)] rounded-2xl p-8 sm:p-14 shadow-lg border border-[var(--border-warm)] my-4 min-h-[850px]"
                : "p-4 sm:p-8 min-h-[850px]"
            }`}
            style={{ maxWidth: `${maxWidth}px` }}
          >
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of your piece..."
              className={`w-full font-literary text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight pb-3 mb-6 border-b focus:outline-none transition-colors ${
                displayMode === "black_canvas"
                  ? "bg-transparent text-[#F5EFEB] placeholder-[#737C70] border-[#2A3029]"
                  : "bg-transparent text-[var(--text-main)] placeholder-[var(--text-muted)]/50 border-[var(--border-warm)]"
              }`}
            />

            {/* Writing Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin composing your thoughts here... Let words arrive at their own pace."
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
              className={`w-full flex-1 min-h-[600px] resize-none font-literary focus:outline-none transition-colors ${
                displayMode === "black_canvas"
                  ? "bg-transparent text-[#E8E2DC] placeholder-[#737C70]"
                  : "bg-transparent text-[var(--text-body)] placeholder-[var(--text-muted)]/50"
              }`}
            />
          </div>
        </main>

        {/* Writing Companion Panel (Right Sidebar) */}
        <WritingCompanionPanel
          currentText={content}
          documentTitle={title}
          documentType={docType}
          isOpen={showCompanion}
          onClose={() => setShowCompanion(false)}
          onApplyChange={(newContent) => setContent(newContent)}
        />
      </div>

      {/* 4. BOTTOM METRICS STATUS BAR */}
      <footer
        className={`px-4 sm:px-6 py-2 border-t text-xs flex flex-wrap items-center justify-between gap-3 ${
          displayMode === "black_canvas"
            ? "bg-[#181B18] border-[#2A3029] text-[#B5BFB1]"
            : "bg-[var(--bg-paper)] border-[var(--border-warm)] text-[var(--text-muted)]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span>
            <strong className="text-[var(--text-main)] font-semibold">{wordCount}</strong> words
          </span>
          <span>•</span>
          <span>
            <strong className="text-[var(--text-main)] font-semibold">{charCount}</strong> chars
          </span>
          <span>•</span>
          <span>
            ~<strong className="text-[var(--text-main)] font-semibold">{readingTimeMinutes}</strong> min read
          </span>
          <span>•</span>
          <span>
            ~<strong className="text-[var(--text-main)] font-semibold">{estimatedPages}</strong> page{estimatedPages > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-[var(--accent-sage)]" />
            {formatTime(durationSeconds)}
          </span>
        </div>
      </footer>

      {/* MODAL 1: NEW DOCUMENT FROM TEMPLATE */}
      {showNewDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] max-w-2xl w-full rounded-2xl border border-[var(--border-warm)] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col text-[var(--text-main)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-warm)]">
              <div>
                <h3 className="font-literary text-xl font-semibold">
                  Create a New Document
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Choose a literary format and optional starter template
                </p>
              </div>
              <button
                onClick={() => setShowNewDocModal(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 py-1">
              {DOCUMENT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => handleCreateDocument(tmpl.type)}
                  className="p-3.5 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-sage-surface)]/20 hover:bg-[var(--bg-sage-surface)]/70 hover:border-[var(--accent-sage)] text-left transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-literary font-semibold text-sm group-hover:text-[var(--accent-sage)] transition-colors">
                      {tmpl.label}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                      Template
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border-warm)] flex justify-end">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-warm)] text-xs font-medium hover:bg-[var(--bg-sage-surface)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCUMENT MANAGER / DRAFTS BROWSER */}
      {showDocManager && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] max-w-2xl w-full rounded-2xl border border-[var(--border-warm)] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col text-[var(--text-main)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-warm)]">
              <div>
                <h3 className="font-literary text-xl font-semibold">
                  Saved Drafts & Manuscripts
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {allSessions.length} document{allSessions.length !== 1 ? "s" : ""} in sanctuary storage
                </p>
              </div>
              <button
                onClick={() => setShowDocManager(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Search manuscripts by title, content, or type..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-sage-surface)]/30 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-sage)]"
              />
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredSessions.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] italic">
                  No documents found matching "{docSearchQuery}".
                </div>
              ) : (
                filteredSessions.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      doc.id === sessionId
                        ? "bg-[var(--accent-sage)]/10 border-[var(--accent-sage)]"
                        : "bg-[var(--bg-paper)] border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]/50"
                    }`}
                  >
                    <div
                      onClick={() => handleSelectDocument(doc)}
                      className="flex-1 cursor-pointer space-y-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-literary font-semibold text-sm truncate">
                          {doc.title || "Untitled Document"}
                        </span>
                        {doc.isFavorite && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-sage-surface)] text-[var(--accent-olive)] capitalize shrink-0">
                          {(doc.documentType || "essay").replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {doc.content
                          ? doc.content.slice(0, 80) + "..."
                          : "Empty document"}
                      </p>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {doc.wordCount || 0} words • Updated{" "}
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {deletingDocId === doc.id ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                          <span className="text-[10px] text-red-800 font-medium px-1">
                            Delete?
                          </span>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-semibold hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingDocId(null)}
                            className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingDocId(doc.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[var(--text-muted)] hover:text-red-600 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-warm)] flex justify-end">
              <button
                onClick={() => setShowDocManager(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-warm)] text-xs font-medium hover:bg-[var(--bg-sage-surface)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
