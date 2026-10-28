import { describe, it, expect, beforeEach } from "vitest";
import { hybridStore } from "./hybridStore";

describe("hybridStore", () => {
  beforeEach(() => {
    hybridStore.clearAllUserData();
  });

  it("calculates initial empty progress summary correctly", () => {
    const summary = hybridStore.getProgressSummary();
    expect(summary.totalWords).toBe(0);
    expect(summary.totalSessions).toBe(0);
    expect(summary.totalSparks).toBe(0);
    expect(summary.streak).toBe(0);
    expect(summary.vocabTotal).toBe(0);
  });

  it("saves a writing session and updates word count", () => {
    const session = hybridStore.saveWritingSession({
      id: "test-session-1",
      title: "Reflections on Stillness",
      content: "The morning light arrived with unusual quiet across the desk.",
      format: "reflective_essay",
      mood: "reflective",
      durationSeconds: 120,
    });

    expect(session.id).toBe("test-session-1");
    expect(session.wordCount).toBe(10);
    expect(session.title).toBe("Reflections on Stillness");

    const retrieved = hybridStore.getWritingSessionById("test-session-1");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.wordCount).toBe(10);
  });

  it("manages vocabulary lifecycle (learning -> familiar -> mastered)", () => {
    const entry = hybridStore.saveVocabulary({
      word: "luminescent",
      partOfSpeech: "adjective",
      definition: "Emitting light not caused by heat.",
      exampleSentence: "A luminescent moon illuminated the path.",
      status: "learning",
      sourceType: "manual_search",
    });

    expect(entry.word).toBe("luminescent");
    expect(entry.status).toBe("learning");

    // Upgrade to familiar
    hybridStore.updateVocabularyStatus(entry.id, "familiar");
    let updated = hybridStore.getVocabularyById(entry.id);
    expect(updated?.status).toBe("familiar");
    expect(updated?.reviewCount).toBe(1);

    // Upgrade to mastered
    hybridStore.updateVocabularyStatus(entry.id, "mastered");
    updated = hybridStore.getVocabularyById(entry.id);
    expect(updated?.status).toBe("mastered");
    expect(updated?.reviewCount).toBe(2);
  });

  it("saves a Two-Minute Spark and records activity", () => {
    const spark = hybridStore.saveSpark({
      promptText: "Write about one thing you noticed today.",
      responseText: "The leaves were trembling slightly in the late autumn draft.",
      durationSeconds: 95,
      wordCount: 10,
      taskCategory: "noticed_today",
      savedToJournal: false,
    });

    expect(spark.id).toBeDefined();
    expect(spark.wordCount).toBe(10);

    const sparks = hybridStore.getSparks();
    expect(sparks.length).toBe(1);

    const summary = hybridStore.getProgressSummary();
    expect(summary.totalSparks).toBe(1);
    expect(summary.streak).toBeGreaterThanOrEqual(1);
  });

  it("manages sanctuary themes and persists theme changes", () => {
    expect(hybridStore.getTheme()).toBe("linen");
    hybridStore.setTheme("midnight");
    expect(hybridStore.getTheme()).toBe("midnight");
    hybridStore.setTheme("sage");
    expect(hybridStore.getTheme()).toBe("sage");
  });

  it("persists reader preferences and reading positions", () => {
    const prefs = hybridStore.getReaderPreferences();
    expect(prefs.theme).toBe("linen");
    expect(prefs.fontSize).toBe(18);

    hybridStore.saveReaderPreferences({
      fontSize: 22,
      fontFamily: "sans",
      theme: "sepia",
      focusMode: true,
    });

    const updated = hybridStore.getReaderPreferences();
    expect(updated.fontSize).toBe(22);
    expect(updated.fontFamily).toBe("sans");
    expect(updated.theme).toBe("sepia");
    expect(updated.focusMode).toBe(true);

    // Reading position
    hybridStore.saveReadingPosition("essay-123", 450, 0.65);
    const pos = hybridStore.getReadingPositions();
    expect(pos["essay-123"]).toBeDefined();
    expect(pos["essay-123"].scrollOffset).toBe(450);
    expect(pos["essay-123"].progressPercent).toBe(0.65);
  });

  it("saves and removes favorite book passages", () => {
    const passage = hybridStore.savePassage({
      bookId: "gutenberg-105",
      bookTitle: "Persuasion",
      text: "You pierce my soul. I am half agony, half hope.",
      author: "Jane Austen",
      location: "Chapter 23",
      notes: "Captain Wentworth letter",
    });

    expect(passage.id).toBeDefined();
    expect(hybridStore.getSavedPassages().length).toBe(1);

    hybridStore.removeSavedPassage(passage.id);
    expect(hybridStore.getSavedPassages().length).toBe(0);
  });

  it("performs multi-scope universal journal search with snippet generation", () => {
    // Seed journal entries
    hybridStore.saveJournalEntry({
      title: "Morning Solitude in the Woods",
      content: "Walking beneath the damp pines, watching the frost dissolve under the pale November sunrise.",
      mood: "calm",
      tags: ["nature", "morning", "quiet"],
      isFavorite: true,
    });

    hybridStore.saveJournalEntry({
      title: "Literary Discoveries",
      content: "Re-reading Virginia Woolf's To the Lighthouse. The rhythm of prose mimics the ocean tide perfectly.",
      mood: "creative",
      tags: ["books", "reading", "woolf"],
      isFavorite: false,
    });

    hybridStore.saveJournalEntry({
      title: "Anxious Evening Thoughts",
      content: "Struggling with deadlines and unfinished drafts under the lamplight.",
      mood: "uncertain",
      tags: ["writing", "drafts"],
      isFavorite: false,
    });

    // 1. Search by keyword across all
    const frostResults = hybridStore.searchJournalEntries({ query: "frost" });
    expect(frostResults.length).toBe(1);
    expect(frostResults[0].entry.title).toBe("Morning Solitude in the Woods");
    expect(frostResults[0].matchedSnippets[0]).toContain("dissolve");

    // 2. Search scoped to tags
    const bookTagResults = hybridStore.searchJournalEntries({ query: "books", scope: "tags" });
    expect(bookTagResults.length).toBe(1);
    expect(bookTagResults[0].entry.title).toBe("Literary Discoveries");

    // 3. Search scoped to title
    const titleResults = hybridStore.searchJournalEntries({ query: "Solitude", scope: "title" });
    expect(titleResults.length).toBe(1);

    // 4. Filter by mood
    const inspiredResults = hybridStore.searchJournalEntries({ mood: "creative" });
    expect(inspiredResults.length).toBe(1);
    expect(inspiredResults[0].entry.title).toBe("Literary Discoveries");

    // 5. Filter by favorites
    const favResults = hybridStore.searchJournalEntries({ isFavoriteOnly: true });
    expect(favResults.length).toBeGreaterThanOrEqual(1);
    expect(favResults.every((r) => r.entry.isFavorite)).toBe(true);
    expect(favResults.some((r) => r.entry.title === "Morning Solitude in the Woods")).toBe(true);
  });
});

