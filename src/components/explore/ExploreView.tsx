"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WritingPrompt } from "@/types";
import { CURATED_PROMPTS } from "@/lib/curated/data";
import {
  Compass,
  ArrowRight,
  Filter,
  PenTool,
  Bookmark,
  Sparkles,
  BookOpen,
} from "lucide-react";

export function ExploreView() {
  const [prompts] = useState<WritingPrompt[]>(CURATED_PROMPTS);
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [savedPromptIds, setSavedPromptIds] = useState<Record<string, boolean>>({});

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPromptIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPrompts = prompts.filter((p) => {
    if (selectedMood === "all") return true;
    return p.mood === selectedMood;
  });

  const moods = ["all", "reflective", "introspective", "observant", "motivated", "nostalgic", "curious", "creative", "calm", "frustrated", "uncertain"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-creative-ink flex items-center gap-1.5 mb-1">
            <Compass className="w-4 h-4" /> Explore Portal • Prompts & Categories
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Find Your Next Thought
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Curated writing questions categorized by emotional posture, difficulty, and format.
          </p>
        </div>

        <Link
          href="/write"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-ink-primary text-paper hover:bg-ink-primary/90 transition-all shadow-xs self-start sm:self-auto"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Free Write Without Prompt</span>
        </Link>
      </div>

      {/* Mood filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMood(m)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all whitespace-nowrap ${
              selectedMood === m
                ? "bg-creative-ink text-paper font-semibold shadow-2xs"
                : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => {
          const isSaved = savedPromptIds[prompt.id];

          return (
            <div
              key={prompt.id}
              className="p-6 rounded-xl border border-warm-border bg-paper hover:border-creative-ink/40 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-creative-ink bg-creative-wash px-2 py-0.5 rounded-full border border-creative-ink/20">
                    {prompt.mood} • {prompt.category}
                  </span>

                  <button
                    onClick={(e) => handleToggleSave(prompt.id, e)}
                    className="p-1 text-ink-secondary hover:text-creative-ink"
                    title={isSaved ? "Saved" : "Save prompt"}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-creative-ink text-creative-ink" : ""}`} />
                  </button>
                </div>

                <h3 className="font-editorial text-2xl font-semibold text-ink-primary group-hover:text-creative-ink transition-colors">
                  {prompt.title}
                </h3>

                <p className="font-editorial text-sm text-ink-primary/80 line-clamp-3 leading-relaxed">
                  "{prompt.promptText}"
                </p>

                {prompt.reasonForRecommendation && (
                  <p className="text-[11px] text-ink-secondary italic bg-parchment p-2 rounded">
                    {prompt.reasonForRecommendation}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs">
                <span className="text-ink-secondary">
                  {prompt.suggestedWordsMin}–{prompt.suggestedWordsMax} words
                </span>

                <Link
                  href={`/write?promptId=${prompt.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-creative-ink group-hover:translate-x-1 transition-transform"
                >
                  Write on this <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
