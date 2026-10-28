"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Feather,
  Wand2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Layers,
  Eye,
  CheckCheck,
} from "lucide-react";
import {
  WritingCompanionAction,
  CompanionSuggestion,
  CompanionAnalysisResult,
} from "@/types";

interface WritingCompanionPanelProps {
  currentText: string;
  documentTitle: string;
  documentType?: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyChange: (newContent: string, note?: string) => void;
}

export function WritingCompanionPanel({
  currentText,
  documentTitle,
  documentType = "reflective_essay",
  isOpen,
  onClose,
  onApplyChange,
}: WritingCompanionPanelProps) {
  const [activeAction, setActiveAction] = useState<WritingCompanionAction>("check_all");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompanionAnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<CompanionSuggestion[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hasConsent, setHasConsent] = useState(true);
  const [undoHistory, setUndoHistory] = useState<string[]>([]);

  // Trigger analysis for selected action
  const handleRunAnalysis = async (action: WritingCompanionAction) => {
    setActiveAction(action);
    setErrorMessage(null);

    if (!currentText.trim() || currentText.trim().length < 5) {
      setErrorMessage("Please write a few thoughts first before requesting analysis.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          title: documentTitle || "Untitled Sanctuary Draft",
          content: currentText,
          documentType,
          hasConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "The companion is temporarily unavailable.");
      }

      setResult(data);
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze writing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply a single suggestion
  const handleApplySingle = (suggestion: CompanionSuggestion, customReplacement?: string) => {
    const replacement = customReplacement || suggestion.suggestedCorrection;
    let newContent = currentText;

    if (
      suggestion.startIndex !== undefined &&
      suggestion.endIndex !== undefined &&
      currentText.slice(suggestion.startIndex, suggestion.endIndex) === suggestion.originalText
    ) {
      // Precise slice replacement
      newContent =
        currentText.slice(0, suggestion.startIndex) +
        replacement +
        currentText.slice(suggestion.endIndex);
    } else {
      // Fallback substring replace of first occurrence
      const idx = currentText.indexOf(suggestion.originalText);
      if (idx >= 0) {
        newContent =
          currentText.slice(0, idx) +
          replacement +
          currentText.slice(idx + suggestion.originalText.length);
      }
    }

    // Save previous text to undo buffer
    setUndoHistory((prev) => [currentText, ...prev.slice(0, 4)]);
    onApplyChange(newContent, `Applied: "${suggestion.originalText}" → "${replacement}"`);

    // Mark as applied
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestion.id ? { ...s, status: "applied" } : s))
    );
  };

  // Ignore single suggestion
  const handleIgnoreSingle = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "ignored" } : s))
    );
  };

  // Apply all pending non-stylistic corrections
  const handleApplyAllPending = () => {
    const pending = suggestions.filter((s) => s.status === "pending");
    if (pending.length === 0) return;

    let updated = currentText;
    // Apply from back to front if indices exist to avoid index drift
    const sorted = [...pending].sort((a, b) => (b.startIndex ?? 0) - (a.startIndex ?? 0));

    sorted.forEach((s) => {
      if (
        s.startIndex !== undefined &&
        s.endIndex !== undefined &&
        updated.slice(s.startIndex, s.endIndex) === s.originalText
      ) {
        updated =
          updated.slice(0, s.startIndex) +
          s.suggestedCorrection +
          updated.slice(s.endIndex);
      } else {
        const idx = updated.indexOf(s.originalText);
        if (idx >= 0) {
          updated =
            updated.slice(0, idx) +
            s.suggestedCorrection +
            updated.slice(idx + s.originalText.length);
        }
      }
    });

    setUndoHistory((prev) => [currentText, ...prev.slice(0, 4)]);
    onApplyChange(updated, `Applied ${pending.length} companion refinements`);
    setSuggestions((prev) => prev.map((s) => ({ ...s, status: "applied" })));
    setShowPreviewModal(false);
  };

  // Revert last applied change
  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const previous = undoHistory[0];
    setUndoHistory((prev) => prev.slice(1));
    onApplyChange(previous, "Reverted previous companion refinement");
  };

  if (!isOpen) return null;

  const pendingCount = suggestions.filter((s) => s.status === "pending").length;
  const appliedCount = suggestions.filter((s) => s.status === "applied").length;

  return (
    <div className="w-full lg:w-96 shrink-0 bg-[var(--bg-paper)] border-l border-[var(--border-warm)] flex flex-col h-full shadow-lg transition-all duration-300 z-30">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-warm)] flex items-center justify-between bg-[var(--bg-paper)] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] flex items-center justify-center">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-literary font-semibold text-sm text-[var(--text-main)]">
              Writing Companion
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Discreet literary editor & mentor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {undoHistory.length > 0 && (
            <button
              onClick={handleUndo}
              className="p-1.5 rounded-md hover:bg-[var(--bg-sage-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-xs flex items-center gap-1"
              title="Undo last companion correction"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px]">Undo</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--bg-sage-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title="Dismiss companion panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Selector Bar */}
      <div className="p-3 bg-[var(--bg-sage-surface)]/40 border-b border-[var(--border-warm)] space-y-2">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">
          Editorial Focus
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleRunAnalysis("check_all")}
            disabled={isLoading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center gap-1.5 transition-all ${
              activeAction === "check_all"
                ? "bg-[var(--accent-sage)] text-white shadow-xs"
                : "bg-[var(--bg-paper)] text-[var(--text-main)] border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Check My Writing</span>
          </button>

          <button
            onClick={() => handleRunAnalysis("fix_grammar")}
            disabled={isLoading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center gap-1.5 transition-all ${
              activeAction === "fix_grammar"
                ? "bg-[var(--accent-sage)] text-white shadow-xs"
                : "bg-[var(--bg-paper)] text-[var(--text-main)] border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Fix Grammar</span>
          </button>

          <button
            onClick={() => handleRunAnalysis("improve_flow")}
            disabled={isLoading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center gap-1.5 transition-all ${
              activeAction === "improve_flow"
                ? "bg-[var(--accent-sage)] text-white shadow-xs"
                : "bg-[var(--bg-paper)] text-[var(--text-main)] border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Improve Flow</span>
          </button>

          <button
            onClick={() => handleRunAnalysis("find_better_words")}
            disabled={isLoading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center gap-1.5 transition-all ${
              activeAction === "find_better_words"
                ? "bg-[var(--accent-sage)] text-white shadow-xs"
                : "bg-[var(--bg-paper)] text-[var(--text-main)] border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 shrink-0" />
            <span>Find Better Words</span>
          </button>

          <button
            onClick={() => handleRunAnalysis("explain_mistake")}
            disabled={isLoading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center gap-1.5 transition-all ${
              activeAction === "explain_mistake"
                ? "bg-[var(--accent-sage)] text-white shadow-xs"
                : "bg-[var(--bg-paper)] text-[var(--text-main)] border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Explain a Mistake</span>
          </button>

          <button
            onClick={() => handleRunAnalysis("review_entry")}
            disabled={isLoading}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center gap-1.5 transition-all ${
              activeAction === "review_entry"
                ? "bg-[var(--accent-sage)] text-white shadow-xs"
                : "bg-[var(--bg-paper)] text-[var(--text-main)] border border-[var(--border-warm)] hover:bg-[var(--bg-sage-surface)]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Review This Entry</span>
          </button>
        </div>

        {/* Privacy & Provider Notice */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[var(--accent-sage)]" />
            Private & confidential
          </span>
          {result && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-paper)] border border-[var(--border-warm)]">
              {result.provider === "gemini" ? "Gemini AI" : "Inkling Linguistic Engine"}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-[var(--accent-sage)] border-t-transparent animate-spin" />
              <Feather className="w-4 h-4 text-[var(--accent-sage)] absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="font-literary text-sm text-[var(--text-main)] font-medium">
                Reading your prose attentively...
              </p>
              <p className="text-xs text-[var(--text-muted)] italic">
                Checking syntax, cadence, and diction with literary sensitivity
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-50/70 border border-red-200/80 text-red-900 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Could not complete analysis</span>
            </div>
            <p className="text-red-700 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => handleRunAnalysis(activeAction)}
              className="text-[11px] underline font-medium hover:text-red-950"
            >
              Try again
            </button>
          </div>
        )}

        {/* Initial Empty State before first run */}
        {!isLoading && !result && !errorMessage && (
          <div className="py-10 flex flex-col items-center text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-sage-surface)] flex items-center justify-center text-[var(--accent-sage)]">
              <Feather className="w-6 h-6" />
            </div>
            <h4 className="font-literary text-base font-semibold text-[var(--text-main)]">
              Your Sanctuary Writing Companion
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xs">
              Select an action above to analyze grammar, elevate sentence flow, or discover precise literary vocabulary.
            </p>
            <button
              onClick={() => handleRunAnalysis("check_all")}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check My Writing Now</span>
            </button>
          </div>
        )}

        {/* Result Header & Summary */}
        {!isLoading && result && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[var(--bg-sage-surface)]/60 border border-[var(--border-warm)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-literary text-xs font-semibold text-[var(--text-main)]">
                  Editorial Summary
                </span>
                {pendingCount > 1 && (
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="text-[11px] font-semibold text-[var(--accent-sage)] hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview All ({pendingCount})</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--text-body)] leading-relaxed italic">
                "{result.summary}"
              </p>
              <div className="flex items-center gap-3 pt-1 text-[10px] text-[var(--text-muted)]">
                <span>{pendingCount} pending</span>
                <span>•</span>
                <span>{appliedCount} applied</span>
              </div>
            </div>

            {/* Zero Suggestions State */}
            {suggestions.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-sage)]/20 text-[var(--accent-sage)] mx-auto flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <h5 className="font-literary text-sm font-semibold text-[var(--text-main)]">
                  Prose is Disciplined
                </h5>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  No issues or awkward constructions found for this criteria.
                </p>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.map((suggestion) => {
              const isApplied = suggestion.status === "applied";
              const isIgnored = suggestion.status === "ignored";
              const isExpanded = expandedExplanationId === suggestion.id;

              if (isIgnored) return null;

              return (
                <div
                  key={suggestion.id}
                  className={`p-3.5 rounded-lg border transition-all text-xs space-y-2.5 ${
                    isApplied
                      ? "bg-[var(--bg-sage-surface)]/30 border-[var(--accent-sage)]/40 opacity-70"
                      : "bg-[var(--bg-paper)] border-[var(--border-warm)] shadow-xs"
                  }`}
                >
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-sage)]">
                      {suggestion.category.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        suggestion.isStylistic
                          ? "bg-amber-100/70 text-amber-900 border border-amber-200"
                          : "bg-emerald-100/70 text-emerald-900 border border-emerald-200"
                      }`}
                    >
                      {suggestion.isStylistic ? "Stylistic Suggestion" : "Correction"}
                    </span>
                  </div>

                  {/* Original vs Replacement */}
                  <div className="space-y-1">
                    <div className="text-[var(--text-muted)] line-through">
                      "{suggestion.originalText}"
                    </div>
                    <div className="text-[var(--text-main)] font-semibold flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-[var(--accent-sage)] shrink-0" />
                      <span>"{suggestion.suggestedCorrection}"</span>
                    </div>
                  </div>

                  {/* Alternatives Pills if provided */}
                  {suggestion.alternatives && suggestion.alternatives.length > 1 && !isApplied && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      <span className="text-[10px] text-[var(--text-muted)] self-center mr-1">
                        Alternatives:
                      </span>
                      {suggestion.alternatives.map((alt, altIdx) => (
                        <button
                          key={altIdx}
                          onClick={() => handleApplySingle(suggestion, alt)}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-warm)] hover:bg-[var(--accent-sage)] hover:text-white transition-colors"
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border-warm)]/50">
                    <button
                      onClick={() =>
                        setExpandedExplanationId(isExpanded ? null : suggestion.id)
                      }
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{isExpanded ? "Hide rationale" : "Explain why"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {!isApplied ? (
                        <>
                          <button
                            onClick={() => handleIgnoreSingle(suggestion.id)}
                            className="px-2 py-1 rounded text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-sage-surface)] transition-colors"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => handleApplySingle(suggestion)}
                            className="px-2.5 py-1 rounded bg-[var(--accent-sage)] text-white text-[11px] font-semibold hover:bg-[var(--accent-olive)] transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-[var(--accent-sage)] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Applied</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable Explanation */}
                  {isExpanded && (
                    <div className="p-2.5 rounded bg-[var(--bg-sage-surface)]/60 text-[11px] text-[var(--text-body)] leading-relaxed mt-2 border border-[var(--border-warm)]">
                      {suggestion.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview All Changes Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] max-w-lg w-full rounded-xl border border-[var(--border-warm)] shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-warm)]">
              <div>
                <h4 className="font-literary text-lg font-semibold text-[var(--text-main)]">
                  Preview Proposed Changes
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {pendingCount} refinement{pendingCount > 1 ? "s" : ""} ready to apply
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {suggestions
                .filter((s) => s.status === "pending")
                .map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-sage-surface)]/30 text-xs space-y-1"
                  >
                    <div className="text-[10px] font-semibold uppercase text-[var(--accent-sage)]">
                      {s.category}
                    </div>
                    <div className="line-through text-[var(--text-muted)]">
                      "{s.originalText}"
                    </div>
                    <div className="font-semibold text-[var(--text-main)]">
                      "{s.suggestedCorrection}"
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-warm)]">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-warm)] text-xs font-medium hover:bg-[var(--bg-sage-surface)]"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyAllPending}
                className="px-5 py-2 rounded-lg bg-[var(--accent-sage)] text-white text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply All Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
