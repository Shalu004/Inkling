import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, verifyPassword, generateSecureToken } from "./auth";
import { serverDb } from "./db";
import { JournalEntry, LittlePlanTask, VocabularyEntry, BookItem } from "@/types";

describe("Inkling Sanctuary Authentication & Cryptographic Integrity", () => {
  it("securely hashes passwords with random salts and verifies correctly", () => {
    const plain = "VirginiaWoolf1925!";
    const hash = hashPassword(plain);

    expect(hash).toContain(":");
    const [salt, key] = hash.split(":");
    expect(salt).toHaveLength(32); // 16 bytes hex
    expect(key).toHaveLength(128); // 64 bytes hex

    // Correct password matches
    expect(verifyPassword(plain, hash)).toBe(true);

    // Incorrect password fails
    expect(verifyPassword("WrongPassword123", hash)).toBe(false);
    expect(verifyPassword("", hash)).toBe(false);

    // Two hashes of the same password produce distinct salts and ciphertexts
    const hash2 = hashPassword(plain);
    expect(hash).not.toEqual(hash2);
    expect(verifyPassword(plain, hash2)).toBe(true);
  });

  it("generates high-entropy cryptographic tokens", () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toEqual(token2);
  });
});

describe("Inkling Sanctuary Database & User Space Isolation", () => {
  const userAEmail = `user_a_${Date.now()}@inkling.sanctuary`;
  const userBEmail = `user_b_${Date.now()}@inkling.sanctuary`;
  let userAId = "";
  let userBId = "";

  beforeEach(async () => {
    // Setup two unique users
    if (!userAId) {
      const userA = await serverDb.createUser({
        displayName: "Virginia",
        email: userAEmail,
        passwordHash: hashPassword("ToTheLighthouse1927!"),
      });
      userAId = userA.id;
    }

    if (!userBId) {
      const userB = await serverDb.createUser({
        displayName: "Rainer",
        email: userBEmail,
        passwordHash: hashPassword("LettersToAYoungPoet1929!"),
      });
      userBId = userB.id;
    }
  });

  it("prevents duplicate registration for the same email address", async () => {
    await expect(
      serverDb.createUser({
        displayName: "Duplicate Attempt",
        email: userAEmail,
        passwordHash: hashPassword("SomePassword123!"),
      })
    ).rejects.toThrow("An account with this email address already exists");
  });

  it("creates, validates, and terminates secure sessions", async () => {
    const sessionToken = generateSecureToken(32);
    const session = await serverDb.createSession(userAId, sessionToken);

    expect(session.userId).toBe(userAId);

    // Validate session
    const validated = await serverDb.getSession(sessionToken);
    expect(validated).not.toBeNull();
    expect(validated?.userId).toBe(userAId);
    const user = await serverDb.getUserById(validated!.userId);
    expect(user?.email).toBe(userAEmail);

    // Invalidate session on logout
    await serverDb.deleteSession(sessionToken);
    const terminated = await serverDb.getSession(sessionToken);
    expect(terminated).toBeNull();
  });

  it("handles password reset tokens with single-use invalidation", async () => {
    const resetToken = generateSecureToken(32);
    await serverDb.createResetToken(userAId, resetToken);

    // Retrieve token
    const tokenRecord = await serverDb.getPasswordResetToken(resetToken);
    expect(tokenRecord).not.toBeNull();
    expect(tokenRecord?.userId).toBe(userAId);

    // Consume token
    await serverDb.deletePasswordResetToken(resetToken);
    const consumed = await serverDb.getPasswordResetToken(resetToken);
    expect(consumed).toBeNull();
  });

  it("strictly isolates journal entries between user accounts", async () => {
    const entryA: JournalEntry = {
      id: `journal-a-${Date.now()}`,
      title: "Virginia's Lighthouse Reflection",
      body: "The lighthouse stood in the distance, bathed in evening mist.",
      date: "2026-10-28",
      time: "21:00",
      tags: ["solitude", "lighthouse"],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const entryB: JournalEntry = {
      id: `journal-b-${Date.now()}`,
      title: "Rainer's Poetic Contemplation",
      body: "Live the questions now. Perhaps then, someday, you will live into the answer.",
      date: "2026-10-28",
      time: "21:30",
      tags: ["letters", "poetics"],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // User A saves entry A; User B saves entry B
    await serverDb.saveJournalEntry(userAId, entryA);
    await serverDb.saveJournalEntry(userBId, entryB);

    // User A fetches entries
    const listA = await serverDb.getJournalEntries(userAId);
    expect(listA.some((e) => e.id === entryA.id)).toBe(true);
    expect(listA.some((e) => e.id === entryB.id)).toBe(false);

    // User B fetches entries
    const listB = await serverDb.getJournalEntries(userBId);
    expect(listB.some((e) => e.id === entryB.id)).toBe(true);
    expect(listB.some((e) => e.id === entryA.id)).toBe(false);

    // User A attempts to delete User B's entry: User B's entry must remain untouched
    await serverDb.deleteJournalEntry(userAId, entryB.id);
    const listBAfter = await serverDb.getJournalEntries(userBId);
    expect(listBAfter.some((e) => e.id === entryB.id)).toBe(true);
  });

  it("strictly isolates Little Plans tasks between user accounts", async () => {
    const planA: LittlePlanTask = {
      id: `plan-a-${Date.now()}`,
      title: "Read 20 pages of Mrs. Dalloway",
      dueDate: "2026-10-29",
      completed: false,
      priority: "high",
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const planB: LittlePlanTask = {
      id: `plan-b-${Date.now()}`,
      title: "Write response to Franz Xaver Kappus",
      dueDate: "2026-10-30",
      completed: false,
      priority: "medium",
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await serverDb.savePlan(userAId, planA);
    await serverDb.savePlan(userBId, planB);

    const plansA = await serverDb.getPlans(userAId);
    expect(plansA.some((p) => p.id === planA.id)).toBe(true);
    expect(plansA.some((p) => p.id === planB.id)).toBe(false);

    const plansB = await serverDb.getPlans(userBId);
    expect(plansB.some((p) => p.id === planB.id)).toBe(true);
    expect(plansB.some((p) => p.id === planA.id)).toBe(false);
  });

  it("strictly isolates vocabulary word garden between user accounts", async () => {
    const vocabA: VocabularyEntry = {
      id: `vocab-a-${Date.now()}`,
      word: "susurrus",
      partOfSpeech: "noun",
      definition: "A whispering or rustling sound.",
      exampleSentence: "A quiet susurrus rose from the pines.",
      sourceType: "reading_corner",
      synonyms: ["whisper", "murmur"],
      tags: ["nature"],
      isFavorite: false,
      status: "learning",
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    const vocabB: VocabularyEntry = {
      id: `vocab-b-${Date.now()}`,
      word: "weltschmerz",
      partOfSpeech: "noun",
      definition: "A feeling of melancholy and world-weariness.",
      exampleSentence: "He surrendered to a gentle weltschmerz.",
      sourceType: "manual_search",
      synonyms: ["world-weariness"],
      tags: ["philosophy"],
      isFavorite: true,
      status: "mastered",
      reviewCount: 3,
      createdAt: new Date().toISOString(),
    };

    await serverDb.saveVocabulary(userAId, vocabA);
    await serverDb.saveVocabulary(userBId, vocabB);

    const wordsA = await serverDb.getVocabulary(userAId);
    expect(wordsA.some((w) => w.word === "susurrus")).toBe(true);
    expect(wordsA.some((w) => w.word === "weltschmerz")).toBe(false);

    const wordsB = await serverDb.getVocabulary(userBId);
    expect(wordsB.some((w) => w.word === "weltschmerz")).toBe(true);
    expect(wordsB.some((w) => w.word === "susurrus")).toBe(false);
  });

  it("safely cleans up all user files and sessions upon account deletion", async () => {
    // Create temporary user C
    const userC = await serverDb.createUser({
      displayName: "Ephemeral Poet",
      email: `temp_${Date.now()}@inkling.sanctuary`,
      passwordHash: hashPassword("Ephemeral123!"),
    });

    const token = generateSecureToken(32);
    await serverDb.createSession(userC.id, token);

    await serverDb.saveJournalEntry(userC.id, {
      id: "ephemeral-entry",
      title: "Transient Thought",
      body: "Here today, gone tomorrow.",
      date: "2026-10-28",
      time: "22:00",
      tags: ["transient"],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Delete account
    await serverDb.deleteUser(userC.id);

    // User lookup must return null
    const lookedUp = await serverDb.getUserById(userC.id);
    expect(lookedUp).toBeNull();

    // Session must be terminated
    const sessionRecord = await serverDb.getSession(token);
    expect(sessionRecord).toBeNull();

    // User data must be cleared
    const entries = await serverDb.getJournalEntries(userC.id);
    expect(entries).toEqual([]);
  });
});
