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
    // Seeded with curated literary lexicon
    expect(summary.vocabTotal).toBeGreaterThanOrEqual(14);
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

  it("provides curated literary quotes and calculates quote of the day", () => {
    const quotes = hybridStore.getLiteraryQuotes();
    expect(quotes.length).toBeGreaterThanOrEqual(18);
    expect(quotes[0].author).toBeDefined();
    expect(quotes[0].work).toBeDefined();
    expect(quotes[0].quote).toBeTruthy();

    const daily = hybridStore.getDailyQuote();
    expect(daily).toBeDefined();
    expect(daily.quote).toBeTruthy();
    expect(daily.author).toBeTruthy();
  });

  it("handles saving quotes and personal reflections", () => {
    const quotes = hybridStore.getLiteraryQuotes();
    // Pick a quote that is not saved by default
    const testQuote = quotes.find((q) => !hybridStore.isQuoteSaved(q.id)) || quotes[quotes.length - 1];

    // Toggle save
    expect(hybridStore.isQuoteSaved(testQuote.id)).toBe(false);
    const saved = hybridStore.toggleSaveQuote(testQuote.id);
    expect(saved).toBe(true);
    expect(hybridStore.isQuoteSaved(testQuote.id)).toBe(true);

    // Save personal reflection
    hybridStore.saveQuoteReflection(testQuote.id, "This resonates deeply with my morning walk.");
    const reflections = hybridStore.getQuoteReflections();
    expect(reflections[testQuote.id]).toBeDefined();
    expect(reflections[testQuote.id]).toBe("This resonates deeply with my morning walk.");

    // Toggle unsave
    const unsaved = hybridStore.toggleSaveQuote(testQuote.id);
    expect(unsaved).toBe(false);
    expect(hybridStore.isQuoteSaved(testQuote.id)).toBe(false);
  });

  it("supports personal example sentences and word favoriting in vocabulary", () => {
    const vocabList = hybridStore.getVocabulary();
    expect(vocabList.length).toBeGreaterThan(0);
    const targetWord = vocabList[0];

    // Save personal example
    const updated = hybridStore.savePersonalExample(
      targetWord.id,
      "I watched the petrichor rise from the warm cobblestones after the downpour."
    );
    expect(updated?.personalExample).toBe("I watched the petrichor rise from the warm cobblestones after the downpour.");

    // Toggle favorite
    expect(targetWord.isFavorite).toBeFalsy();
    const favResult = hybridStore.toggleFavoriteWord(targetWord.id);
    expect(favResult).toBe(true);
    expect(hybridStore.getVocabularyById(targetWord.id)?.isFavorite).toBe(true);

    const unFavResult = hybridStore.toggleFavoriteWord(targetWord.id);
    expect(unFavResult).toBe(false);
    expect(hybridStore.getVocabularyById(targetWord.id)?.isFavorite).toBe(false);
  });
});


