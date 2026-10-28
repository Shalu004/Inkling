"use client";

import React, { useState, useEffect } from "react";
import { UserPreferences } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Settings as SettingsIcon,
  Save,
  Trash2,
  ShieldCheck,
  Check,
  RotateCcw,
  BookOpen,
  Sparkles,
} from "lucide-react";

export function SettingsView() {
  const [preferences, setPreferences] = useState<UserPreferences>(
    hybridStore.getPreferences()
  );
  const [isSaved, setIsSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    hybridStore.savePreferences(preferences);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    hybridStore.clearAllUserData();
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5 mb-1">
            <SettingsIcon className="w-4 h-4" /> Preferences & System
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Writing Atmosphere
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Tailor feedback rigor, daily word goals, reading difficulty, and privacy.
          </p>
        </div>

        {isSaved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-reading-ink bg-reading-wash px-3 py-1.5 rounded-lg border border-reading-ink/30 animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Changes saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Daily Goals */}
        <div className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-paper shadow-xs space-y-6">
          <h2 className="font-editorial text-xl font-semibold text-ink-primary border-b border-warm-border pb-3">
            Daily Writing Goals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-primary">
                Daily Word Target
              </label>
              <input
                type="number"
                min={50}
                max={2000}
                step={50}
                value={preferences.dailyWordGoal}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dailyWordGoal: parseInt(e.target.value) || 250,
                  })
                }
                className="w-full p-2.5 rounded-lg border border-warm-border bg-parchment text-xs text-ink-primary focus:outline-none focus:border-coach-ink font-mono"
              />
              <span className="text-[11px] text-ink-secondary">
                A standard reflective essay is 250–350 words.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-primary">
                Daily Writing Minutes
              </label>
              <input
                type="number"
                min={2}
                max={120}
                step={5}
                value={preferences.dailyWritingMinutes}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dailyWritingMinutes: parseInt(e.target.value) || 15,
                  })
                }
                className="w-full p-2.5 rounded-lg border border-warm-border bg-parchment text-xs text-ink-primary focus:outline-none focus:border-coach-ink font-mono"
              />
              <span className="text-[11px] text-ink-secondary">
                Recommended: 15 minutes of quiet, uninterrupted reflection.
              </span>
            </div>
          </div>
        </div>

        {/* AI Feedback Tone */}
        <div className="p-6 sm:p-8 rounded-2xl border border-coach-ink/20 bg-coach-wash/30 shadow-xs space-y-6">
          <h2 className="font-editorial text-xl font-semibold text-ink-primary border-b border-coach-ink/20 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coach-ink" />
            <span>AI Writing Coach Calibration</span>
          </h2>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-ink-primary block">
              Feedback Tone & Rigor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "gentle",
                  title: "Gentle & Encouraging",
                  desc: "Focuses on building confidence and celebrating voice.",
                },
                {
                  id: "supportive_rigorous",
                  title: "Supportive & Rigorous",
                  desc: "Balanced teacher: praises strengths while dissecting grammatical mechanics.",
                },
                {
                  id: "academic",
                  title: "Academic & Precise",
                  desc: "Strict scrutiny of sentence logic, syntax, and clarity.",
                },
              ].map((tone) => (
                <button
                  type="button"
                  key={tone.id}
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      aiFeedbackTone: tone.id as any,
                    })
                  }
                  className={`p-4 rounded-xl border text-left transition-all ${
                    preferences.aiFeedbackTone === tone.id
                      ? "border-coach-ink bg-paper shadow-xs ring-1 ring-coach-ink"
                      : "border-warm-border bg-paper/60 hover:bg-paper"
                  }`}
                >
                  <strong className="text-xs font-semibold text-ink-primary block mb-1">
                    {tone.title}
                  </strong>
                  <span className="text-[11px] text-ink-secondary leading-relaxed block">
                    {tone.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-primary">
              Reading Corner Difficulty
            </label>
            <select
              value={preferences.readingDifficulty}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  readingDifficulty: e.target.value as any,
                })
              }
              className="w-full sm:w-64 p-2.5 rounded-lg border border-warm-border bg-paper text-xs text-ink-primary focus:outline-none"
            >
              <option value="beginner">Beginner (Short, accessible prose)</option>
              <option value="intermediate">Intermediate (Literary essays & reflections)</option>
              <option value="advanced">Advanced (Classical philosophy & complex syntax)</option>
            </select>
          </div>
        </div>

        {/* Privacy & Ethical Disclosures */}
        <div className="p-6 sm:p-8 rounded-2xl border border-warm-border bg-paper shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-reading-ink">
            <ShieldCheck className="w-4 h-4" /> Privacy & Content Protection
          </div>
          <h2 className="font-editorial text-xl font-semibold text-ink-primary">
            Your Writing Belongs Exclusively to You
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Inkling treats user-generated writing as deeply private. Your essays, journals, and
            sparks are never used to train public machine learning models. Analysis requests are
            processed server-side and never broadcast to public logging aggregators.
          </p>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              resetConfirm
                ? "bg-spark-wash text-spark-ink border-spark-ink"
                : "border-warm-border text-ink-secondary hover:text-spark-ink hover:border-spark-ink"
            }`}
          >
            {resetConfirm ? "Click again to confirm data reset" : "Reset local data"}
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-ink-primary text-paper text-xs font-semibold hover:bg-ink-primary/90 transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
