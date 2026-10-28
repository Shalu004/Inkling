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
});
