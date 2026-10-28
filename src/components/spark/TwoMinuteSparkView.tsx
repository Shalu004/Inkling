"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { TwoMinuteSpark } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";
import {
  Sparkles,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Flame,
  ArrowRight,
  Bookmark,
  Calendar,
} from "lucide-react";

const SPARK_TASKS = [
  {
    id: "noticed_today",
    title: "One Thing You Noticed Today",
    instruction: "Write about one tiny sensory detail you noticed today that most people walked past.",
    placeholder: "I noticed the way the morning sunlight slanted across the kitchen tiles...",
    targetWords: "30–60 words",
  },
  {
    id: "mood_3_sentences",
    title: "Your Current Mood in Three Sentences",
    instruction: "Describe your emotional climate right now in exactly three sentences.",
    placeholder: "Sentence 1: The current weather of my mind. Sentence 2: What caused this weather. Sentence 3: What I hope happens next...",
    targetWords: "3 sentences",
  },
  {
    id: "vocab_in_use",
    title: "Bring a Word to Life",
    instruction: "Use a word from your Word Garden (or a word like 'luminescent' or 'discernment') in an original sentence.",
    placeholder: "Draft a sentence where the word fits seamlessly...",
    targetWords: "25–50 words",
  },
  {
    id: "opinion_50_words",
    title: "50-Word Conviction",
    instruction: "Express a strong opinion on art, habits, books, or human nature in roughly 50 words.",
    placeholder: "State your conviction cleanly, without hedging or apologies...",
    targetWords: "~50 words",
  },
  {
    id: "unnamed_object",
    title: "The Unnamed Familiar Object",
    instruction: "Describe an object within arm's reach by its texture, weight, and history without naming it.",
    placeholder: "Its cylindrical rim is chipped from years of rushed mornings...",
    targetWords: "40–80 words",
  },
];

export function TwoMinuteSparkView() {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(true);
  const [sparksHistory, setSparksHistory] = useState<TwoMinuteSpark[]>([]);

  const currentTask = SPARK_TASKS[selectedTaskIndex];

  useEffect(() => {
    setSparksHistory(hybridStore.getSparks());
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  // Start timer on first keystroke
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponseText(e.target.value);
    if (!timerRunning && secondsRemaining === 120 && e.target.value.length > 0) {
      setTimerRunning(true);
    }
  };

  const handleFinish = () => {
    if (responseText.trim().split(/\s+/).filter(Boolean).length < 5) {
      alert("Please write a few thoughts before completing your spark.");
      return;
    }

    setTimerRunning(false);
    const wordCount = responseText.trim().split(/\s+/).filter(Boolean).length;
    const durationUsed = 120 - secondsRemaining;

    hybridStore.saveSpark({
      promptText: currentTask.instruction,
      responseText,
      durationSeconds: Math.max(15, durationUsed),
      wordCount,
      taskCategory: currentTask.id,
      savedToJournal,
    });

    setIsCompleted(true);
    setSparksHistory(hybridStore.getSparks());

    // Gentle celebration confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#D25D43", "#B88219", "#3D724D", "#2D5D7B"],
      });
    } catch {
      // Ignore in environments where canvas isn't supported
    }
  };

  const handleReset = () => {
    setResponseText("");
    setSecondsRemaining(120);
    setTimerRunning(false);
    setIsCompleted(false);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-warm-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-spark-ink flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4" /> Two-Minute Spark • Daily Micro-Writing
          </span>
          <h1 className="font-editorial text-3xl font-semibold text-ink-primary">
            Quick Habit. Pure Momentum.
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Two minutes of honest writing to maintain your daily rhythm without the pressure of an essay.
          </p>
        </div>

        {/* Task category switcher */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {SPARK_TASKS.map((task, idx) => (
            <button
              key={task.id}
              onClick={() => {
                setSelectedTaskIndex(idx);
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedTaskIndex === idx
                  ? "bg-spark-wash text-spark-ink font-semibold border border-spark-ink/30 shadow-2xs"
                  : "bg-paper text-ink-secondary hover:text-ink-primary border border-warm-border"
              }`}
            >
              Task {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Spark Interactive Box */}
      <div className="p-6 sm:p-10 rounded-2xl border border-spark-ink/30 bg-paper shadow-sm space-y-6">
        {/* Task prompt banner */}
        <div className="p-5 rounded-xl bg-spark-wash/60 border border-spark-ink/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-spark-ink">
              {currentTask.title}
            </span>
            <span className="text-[11px] font-medium text-spark-ink">
              Target: {currentTask.targetWords}
            </span>
          </div>
          <p className="font-editorial text-lg sm:text-xl font-medium text-ink-primary leading-relaxed">
            {currentTask.instruction}
          </p>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center justify-between py-2 border-y border-warm-border text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-spark-ink">
              {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
            <span className="text-ink-secondary">
              {timerRunning ? "Timer active" : secondsRemaining === 0 ? "Time's up!" : "Starts when you type"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="p-1.5 rounded border border-warm-border hover:bg-warm-muted text-ink-secondary transition-colors"
              title={timerRunning ? "Pause timer" : "Start timer"}
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded border border-warm-border hover:bg-warm-muted text-ink-secondary transition-colors"
              title="Reset spark"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Micro Editor */}
        {!isCompleted ? (
          <div className="space-y-4">
            <textarea
              value={responseText}
              onChange={handleTextChange}
              placeholder={currentTask.placeholder}
              className="w-full min-h-[160px] p-4 rounded-xl border border-warm-border bg-parchment font-editorial text-lg leading-relaxed text-ink-primary focus:outline-none focus:border-spark-ink focus:bg-paper transition-all resize-y"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs text-ink-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={savedToJournal}
                  onChange={(e) => setSavedToJournal(e.target.checked)}
                  className="rounded border-warm-border text-spark-ink focus:ring-spark-ink"
                />
                <span>Also save this spark into your writing journal drafts</span>
              </label>

              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-lg bg-spark-ink text-paper text-xs font-semibold hover:bg-spark-ink/90 transition-all shadow-xs"
              >
                Complete Spark & Save Streak
              </button>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="p-8 rounded-xl bg-reading-wash/60 border border-reading-ink/30 text-center space-y-4 animate-in fade-in">
            <CheckCircle className="w-10 h-10 text-reading-ink mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-ink-primary">
              Spark Complete!
            </h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto">
              You showed up for your writing habit today. Even two minutes of deliberate thought keeps your creative voice alive.
            </p>

            <div className="p-4 rounded-lg bg-paper border border-warm-border max-w-lg mx-auto text-left font-editorial text-base text-ink-primary italic">
              "{responseText}"
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-warm-border bg-paper text-xs font-medium hover:bg-warm-muted"
              >
                Write another spark
              </button>
              <a
                href="/write"
                className="px-4 py-2 rounded-lg bg-ink-primary text-paper text-xs font-semibold hover:bg-ink-primary/90"
              >
                Continue into longform write
              </a>
            </div>
          </div>
        )}
      </div>

      {/* History of Past Sparks */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Recent Sparks
        </h3>

        {sparksHistory.length === 0 ? (
          <p className="text-xs text-ink-secondary italic">
            No previous sparks recorded yet. Complete today's prompt above to begin your log.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sparksHistory.slice(0, 4).map((sp) => (
              <div
                key={sp.id}
                className="p-4 rounded-xl border border-warm-border bg-paper space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-ink-secondary">
                  <span className="font-semibold text-spark-ink capitalize">
                    {sp.taskCategory.replace(/_/g, " ")}
                  </span>
                  <span>{new Date(sp.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-editorial text-sm text-ink-primary italic line-clamp-3 leading-relaxed">
                  "{sp.responseText}"
                </p>
                <div className="text-[11px] text-ink-secondary pt-1 border-t border-warm-border/60">
                  {sp.wordCount} words • {sp.durationSeconds}s
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
