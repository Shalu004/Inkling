"use client";

import React, { useState, useEffect } from "react";
import { UserPreferences, ThemeType } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Settings as SettingsIcon,
  Palette,
  Save,
  Trash2,
  ShieldCheck,
  Check,
  RotateCcw,
  BookOpen,
  Sparkles,
  Sliders,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

interface ThemeOption {
  id: ThemeType;
  name: string;
  subtitle: string;
  description: string;
  swatches: {
    bg: string;
    paper: string;
    accent: string;
    text: string;
  };
}

const THEMES: ThemeOption[] = [
  {
    id: "linen",
    name: "Linen",
    subtitle: "Default Sanctuary",
    description: "Classic warm cream paper with soft sage botanicals and burgundy accents. Homely, quiet, and timeless.",
    swatches: {
      bg: "#F5F0E6",
      paper: "#FFFCF5",
      accent: "#58694E",
      text: "#302B25",
    },
  },
  {
    id: "sage",
    name: "Sage",
    subtitle: "Botanical Calm",
    description: "Soft eucalyptus greens and morning mist. Gentle on tired eyes during prolonged reading sessions.",
    swatches: {
      bg: "#E7ECE3",
      paper: "#F5F8F3",
      accent: "#445A3E",
      text: "#222E20",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    subtitle: "Dark Sanctuary",
    description: "Deep forest twilight and subdued paper tones for midnight contemplation and candlelit writing.",
    swatches: {
      bg: "#151715",
      paper: "#1F221E",
      accent: "#98B48C",
      text: "#F5EFEB",
    },
  },
  {
    id: "sepia",
    name: "Warm Sepia",
    subtitle: "Antique Leather & Parchment",
    description: "Aged bookstore paper, warm oak, and dark chestnut leather. Reminiscent of a quiet vintage library.",
    swatches: {
      bg: "#EFE5D3",
      paper: "#F9F3E8",
      accent: "#6E4F32",
      text: "#2E2215",
    },
  },
  {
    id: "rose",
    name: "Rose Paper",
    subtitle: "Dried Petals & Burgundy",
    description: "Dusty rose stationery with deep wine-red details. An intimate, poetic atmosphere for diaries.",
    swatches: {
      bg: "#F4EAEB",
      paper: "#FDF7F7",
      accent: "#6E3E49",
      text: "#321D24",
    },
  },
  {
    id: "pure_light",
    name: "Pure Light",
    subtitle: "Crisp Serene Daylight",
    description: "Clean, high-clarity minimalist white with restrained deep olive typography for daytime clarity.",
    swatches: {
      bg: "#F7F7F8",
      paper: "#FFFFFF",
      accent: "#445942",
      text: "#16191D",
    },
  },
];

export function SettingsView() {
  const [preferences, setPreferences] = useState<UserPreferences>(hybridStore.getPreferences());
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("linen");
  const [colorScheme, setColorScheme] = useState<"system" | "light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"appearance" | "atmosphere" | "system">("appearance");
  const [isSaved, setIsSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    const prefs = hybridStore.getPreferences();
    setPreferences(prefs);
    setCurrentTheme(prefs.theme || "linen");
    setColorScheme(prefs.colorScheme || "light");
  }, []);

  const handleSelectTheme = (themeId: ThemeType) => {
    setCurrentTheme(themeId);
    hybridStore.setTheme(themeId);
    setPreferences((prev) => ({ ...prev, theme: themeId }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetThemeDefault = () => {
    handleSelectTheme("linen");
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    hybridStore.savePreferences({
      ...preferences,
      theme: currentTheme,
      colorScheme,
    });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[var(--border-warm)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-sage)] flex items-center gap-1.5 mb-1">
            <SettingsIcon className="w-4 h-4" /> Atmosphere & Settings
          </span>
          <h1 className="font-literary text-3xl font-semibold text-[var(--text-main)]">
            Sanctuary Preferences
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Customize visual themes, feedback tone, writing cadence, and reading comfort.
          </p>
        </div>

        {isSaved && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-olive)] bg-[var(--bg-botanical-light)] px-3 py-1.5 rounded-lg border border-[var(--accent-sage)]/30 animate-fade-in self-start sm:self-auto">
            <Check className="w-3.5 h-3.5" /> Preference saved
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-warm)] pb-3 text-xs">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "appearance"
              ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Appearance & Themes</span>
        </button>

        <button
          onClick={() => setActiveTab("atmosphere")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "atmosphere"
              ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Writing Atmosphere</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "system"
              ? "bg-[var(--accent-sage)] text-[#FFFCF5] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System & Data</span>
        </button>
      </div>

      {/* TAB 1: APPEARANCE & THEMES */}
      {activeTab === "appearance" && (
        <div className="space-y-8 animate-fade-in">
          {/* Theme Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-literary text-xl font-medium text-[var(--text-main)]">
                  Sanctuary Color Palette
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Carefully tuned palettes that transform the paper surfaces, sidebar, and typography.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetThemeDefault}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Linen</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEMES.map((theme) => {
                const isActive = currentTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-5 rounded-xl border text-left transition-all space-y-3 relative group ${
                      isActive
                        ? "border-[var(--accent-sage)] ring-2 ring-[var(--accent-sage)]/40 shadow-xs"
                        : "border-[var(--border-warm)] hover:border-[var(--accent-sage)]/40 hover:shadow-2xs"
                    }`}
                    style={{ backgroundColor: theme.swatches.paper }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="font-literary text-base font-semibold block"
                          style={{ color: theme.swatches.text }}
                        >
                          {theme.name}
                        </span>
                        <span
                          className="text-[11px] block opacity-75"
                          style={{ color: theme.swatches.text }}
                        >
                          {theme.subtitle}
                        </span>
                      </div>

                      {isActive && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-[#FFFCF5]"
                          style={{ backgroundColor: theme.swatches.accent }}
                        >
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    {/* Palette Swatches Bar */}
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: theme.swatches.bg }}>
                      <div className="flex-1 h-5 rounded border border-black/10" style={{ backgroundColor: theme.swatches.paper }} title="Paper surface" />
                      <div className="flex-1 h-5 rounded" style={{ backgroundColor: theme.swatches.accent }} title="Sage / Accent" />
                      <div className="flex-1 h-5 rounded" style={{ backgroundColor: theme.swatches.text }} title="Primary text" />
                    </div>

                    <p
                      className="text-[11px] leading-relaxed line-clamp-2"
                      style={{ color: theme.swatches.text, opacity: 0.8 }}
                    >
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Scheme Preference */}
          <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] space-y-4">
            <h3 className="font-literary text-lg font-medium text-[var(--text-main)]">
              Light & Dark Posture
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Select how Inkling responds to your operating system's dark mode settings.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-md text-xs">
              {[
                { id: "light", label: "Always Light", icon: Sun },
                { id: "dark", label: "Always Dark", icon: Moon },
                { id: "system", label: "System Sync", icon: Monitor },
              ].map((scheme) => (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => {
                    setColorScheme(scheme.id as any);
                    if (scheme.id === "dark") {
                      handleSelectTheme("midnight");
                    } else if (scheme.id === "light" && currentTheme === "midnight") {
                      handleSelectTheme("linen");
                    }
                    hybridStore.savePreferences({ colorScheme: scheme.id as any });
                  }}
                  className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                    colorScheme === scheme.id
                      ? "border-[var(--accent-sage)] bg-[var(--bg-botanical-light)] text-[var(--accent-olive)] font-semibold"
                      : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <scheme.icon className="w-4 h-4" />
                  <span>{scheme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WRITING ATMOSPHERE */}
      {activeTab === "atmosphere" && (
        <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
          {/* Daily Goals */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-6">
            <h2 className="font-literary text-xl font-semibold text-[var(--text-main)] border-b border-[var(--border-warm)] pb-3">
              Daily Rhythm
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-main)]">
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
                  className="w-full p-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] focus:outline-none font-mono"
                />
                <span className="text-[11px] text-[var(--text-muted)]">
                  A standard reflective essay is 250–350 words.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-main)]">
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
                  className="w-full p-2.5 rounded-lg border border-[var(--border-warm)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] focus:outline-none font-mono"
                />
                <span className="text-[11px] text-[var(--text-muted)]">
                  Recommended: 15 minutes of quiet, uninterrupted reflection.
                </span>
              </div>
            </div>
          </div>

          {/* AI Feedback Tone */}
          <div className="p-6 sm:p-8 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-6">
            <h2 className="font-literary text-xl font-semibold text-[var(--text-main)] border-b border-[var(--border-warm)] pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent-sage)]" />
              <span>AI Writing Coach Calibration</span>
            </h2>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-[var(--text-main)] block">
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
                    title: "Academic & Exhaustive",
                    desc: "Rigorous editorial critique on rhetoric, syntax, and phrasing cadence.",
                  },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        aiFeedbackTone: tone.id as any,
                      })
                    }
                    className={`p-4 rounded-xl border text-left transition-all ${
                      preferences.aiFeedbackTone === tone.id
                        ? "border-[var(--accent-sage)] bg-[var(--bg-botanical-light)] text-[var(--accent-olive)] font-medium"
                        : "border-[var(--border-warm)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">{tone.title}</span>
                    <span className="text-[11px] leading-relaxed block">{tone.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:bg-[var(--accent-olive)] transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Atmosphere</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SYSTEM & DATA */}
      {activeTab === "system" && (
        <div className="space-y-6 animate-fade-in">
          {/* Privacy & Storage */}
          <div className="p-6 rounded-2xl border border-[var(--border-warm)] bg-[var(--bg-paper)] shadow-xs space-y-3">
            <h3 className="font-literary text-lg font-medium text-[var(--text-main)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--accent-sage)]" />
              <span>Data Sovereignty & Local Vault</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Inkling stores your personal diary entries, bookshelf catalog, reading notes, and vocabulary securely inside your browser's private vault. Your words remain yours alone.
            </p>
          </div>

          {/* Reset All Data */}
          <div className="p-6 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
            <h3 className="font-literary text-lg font-medium text-[#754650] flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Reset Sanctuary Data</span>
            </h3>
            <p className="text-xs text-[#777267] leading-relaxed">
              Clear all locally stored writing sessions, diary entries, custom books, and vocabulary history. This action cannot be undone.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                resetConfirm
                  ? "bg-red-700 text-white font-bold"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              {resetConfirm ? "Click again to permanently erase" : "Erase All Sanctuary Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
