"use client";

import React from "react";
import { MoodType } from "@/types";

interface MoodSelectorProps {
  selectedMood?: MoodType | null;
  onSelectMood: (mood: MoodType | null) => void;
  className?: string;
  compact?: boolean;
}

export const MOOD_DEFINITIONS: Array<{
  id: MoodType;
  label: string;
  tagline: string;
  accent: string;
}> = [
  { id: "reflective", label: "Reflective", tagline: "Untangling thoughtful moments", accent: "border-creative-ink/40 text-creative-ink bg-creative-wash" },
  { id: "curious", label: "Curious", tagline: "Questioning assumptions", accent: "border-coach-ink/40 text-coach-ink bg-coach-wash" },
  { id: "calm", label: "Calm", tagline: "Stillness & quiet observations", accent: "border-reading-ink/40 text-reading-ink bg-reading-wash" },
  { id: "motivated", label: "Motivated", tagline: "Energy for breakthroughs", accent: "border-spark-ink/40 text-spark-ink bg-spark-wash" },
  { id: "frustrated", label: "Frustrated", tagline: "Channeling friction into clarity", accent: "border-spark-ink/50 text-spark-ink bg-spark-wash" },
  { id: "nostalgic", label: "Nostalgic", tagline: "Echoes of past places and times", accent: "border-vocab-ink/40 text-vocab-ink bg-vocab-wash" },
  { id: "creative", label: "Creative", tagline: "Metaphor and imagination", accent: "border-creative-ink/40 text-creative-ink bg-creative-wash" },
  { id: "uncertain", label: "Uncertain", tagline: "Sitting with ambiguity", accent: "border-ink-secondary/40 text-ink-secondary bg-warm-muted" },
  { id: "observant", label: "Observant", tagline: "Focusing on tangible details", accent: "border-reading-ink/40 text-reading-ink bg-reading-wash" },
  { id: "introspective", label: "Introspective", tagline: "Examining internal motives", accent: "border-vocab-ink/40 text-vocab-ink bg-vocab-wash" },
];

export function MoodSelector({
  selectedMood,
  onSelectMood,
  className = "",
  compact = false,
}: MoodSelectorProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
          How are you feeling right now? <span className="font-normal lowercase opacity-75">(optional)</span>
        </label>
        {selectedMood && (
          <button
            onClick={() => onSelectMood(null)}
            className="text-xs text-ink-secondary hover:text-ink-primary underline underline-offset-2"
          >
            Clear mood
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {MOOD_DEFINITIONS.map((m) => {
          const isSelected = selectedMood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMood(isSelected ? null : m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? `${m.accent} font-semibold ring-1 ring-offset-1 shadow-xs scale-102`
                  : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border hover:bg-warm-muted"
              } ${compact ? "px-2.5 py-1 text-[11px]" : ""}`}
              title={m.tagline}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
