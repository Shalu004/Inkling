import {
  WritingSession,
  AIReview,
  VocabularyEntry,
  TwoMinuteSpark,
  DailyActivity,
  ReadingHistoryItem,
  UserPreferences,
  MistakePattern,
  IssueCategory,
  JournalEntry,
  BookItem,
  ThemeType,
  ReaderPreferences,
  JournalSearchFilters,
  JournalSearchResult,
} from "@/types";
import { MISTAKE_RULES_CATALOG, INITIAL_JOURNAL_ENTRIES, CURATED_BOOKS } from "@/lib/curated/data";

const STORAGE_KEYS = {
  WRITING_SESSIONS: "inkling_writing_sessions_v1",
  AI_REVIEWS: "inkling_ai_reviews_v1",
  VOCABULARY: "inkling_vocabulary_v1",
  SPARKS: "inkling_sparks_v1",
  READING_HISTORY: "inkling_reading_history_v1",
  DAILY_ACTIVITIES: "inkling_daily_activities_v1",
  PREFERENCES: "inkling_user_preferences_v1",
  JOURNAL_ENTRIES: "inkling_journal_entries_v2",
  LIBRARY_BOOKS: "inkling_library_books_v2",
  READING_POSITIONS: "inkling_reading_positions_v1",
  SAVED_PASSAGES: "inkling_saved_passages_v1",
};

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontSize: 18,
  fontFamily: "serif",
  lineHeight: "normal",
  marginWidth: "normal",
  theme: "linen",
  mode: "scroll",
  focusMode: false,
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredGenres: ["reflective", "creative"],
  interests: ["literature", "philosophy", "psychology"],
  dailyWordGoal: 250,
  dailyWritingMinutes: 15,
  readingDifficulty: "intermediate",
  aiFeedbackTone: "supportive_rigorous",
  focusModeDefault: false,
  emailReminders: false,
  theme: "linen",
  colorScheme: "light",
  readerPreferences: DEFAULT_READER_PREFERENCES,
};

let memoryStorage: Record<string, string> = {};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : memoryStorage[key];
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, serialized);
    } else {
      memoryStorage[key] = serialized;
    }
  } catch (err) {
    console.error("Storage error:", err);
  }
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export const hybridStore = {
  // --- PREFERENCES ---
  getPreferences(): UserPreferences {
    return getStorage<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    setStorage(STORAGE_KEYS.PREFERENCES, updated);
    return updated;
  },

  getTheme(): ThemeType {
    const prefs = this.getPreferences();
    return prefs.theme || "linen";
  },

  setTheme(theme: ThemeType): void {
    this.savePreferences({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  },

  getReaderPreferences(): ReaderPreferences {
    const prefs = this.getPreferences();
    return prefs.readerPreferences || DEFAULT_READER_PREFERENCES;
  },

  saveReaderPreferences(prefs: Partial<ReaderPreferences>): ReaderPreferences {
    const current = this.getReaderPreferences();
    const updated = { ...current, ...prefs };
    this.savePreferences({ readerPreferences: updated });
    return updated;
  },

  // --- WRITING SESSIONS ---
  getWritingSessions(): WritingSession[] {
    const sessions = getStorage<WritingSession[]>(STORAGE_KEYS.WRITING_SESSIONS, []);
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getWritingSessionById(id: string): WritingSession | null {
    const sessions = this.getWritingSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  saveWritingSession(session: Partial<WritingSession> & { id: string }): WritingSession {
    const sessions = this.getWritingSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    const now = new Date().toISOString();

    const fullSession: WritingSession = {
      id: session.id,
      title: session.title || "Untitled Reflection",
      content: session.content || "",
      mood: session.mood,
      format: session.format || "reflective_essay",
      wordCount: session.content
        ? session.content.trim().split(/\s+/).filter(Boolean).length
        : 0,
      durationSeconds: session.durationSeconds || 0,
      status: session.status || "draft",
      hasAiReview: session.hasAiReview ?? false,
      promptId: session.promptId,
      promptTitle: session.promptTitle,
      createdAt: session.createdAt || now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = {
        ...sessions[existingIndex],
        ...fullSession,
        createdAt: sessions[existingIndex].createdAt,
      };
    } else {
      sessions.unshift(fullSession);
    }

    setStorage(STORAGE_KEYS.WRITING_SESSIONS, sessions);

    // Track activity
    if (fullSession.wordCount > 0) {
      this.recordActivity({
        wordsWritten: fullSession.wordCount,
        writingSessionsCount: 1,
      });
    }

    return fullSession;
  },

  deleteWritingSession(id: string): void {
    const sessions = this.getWritingSessions().filter((s) => s.id !== id);
    setStorage(STORAGE_KEYS.WRITING_SESSIONS, sessions);
  },

  // --- AI REVIEWS ---
  getAIReviews(): AIReview[] {
    return getStorage<AIReview[]>(STORAGE_KEYS.AI_REVIEWS, []);
  },

  getAIReviewBySessionId(sessionId: string): AIReview | null {
    const reviews = this.getAIReviews();
    return reviews.find((r) => r.sessionId === sessionId) || null;
  },

  saveAIReview(review: AIReview): void {
    const reviews = this.getAIReviews();
    const index = reviews.findIndex((r) => r.sessionId === review.sessionId);
    if (index >= 0) {
      reviews[index] = review;
    } else {
      reviews.unshift(review);
    }
    setStorage(STORAGE_KEYS.AI_REVIEWS, reviews);

    // Mark session as having review
    const session = this.getWritingSessionById(review.sessionId);
    if (session) {
      this.saveWritingSession({
        ...session,
        hasAiReview: true,
      });
    }
  },

  updateIssueStatus(
    sessionId: string,
    issueId: string,
    status: "accepted" | "rejected" | "pending"
  ): void {
    const review = this.getAIReviewBySessionId(sessionId);
    if (!review) return;

    const issue = review.issues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = status;
      this.saveAIReview(review);
    }
  },

  // --- VOCABULARY / WORD GARDEN ---
  getVocabulary(): VocabularyEntry[] {
    const list = getStorage<VocabularyEntry[]>(STORAGE_KEYS.VOCABULARY, []);
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getVocabularyById(id: string): VocabularyEntry | null {
    const list = this.getVocabulary();
    return list.find((v) => v.id === id) || null;
  },

  saveVocabulary(entry: Omit<VocabularyEntry, "id" | "createdAt" | "reviewCount"> & { id?: string }): VocabularyEntry {
    const list = this.getVocabulary();
    const existingIndex = entry.id ? list.findIndex((v) => v.id === entry.id) : -1;
    const now = new Date().toISOString();

    const fullEntry: VocabularyEntry = {
      id: entry.id || `vocab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: entry.word.trim().toLowerCase(),
      partOfSpeech: entry.partOfSpeech || "noun",
      phonetic: entry.phonetic,
      definition: entry.definition,
      exampleSentence: entry.exampleSentence,
      contextualNuance: entry.contextualNuance,
      sourceContext: entry.sourceContext,
      sourceType: entry.sourceType || "manual_search",
      status: entry.status || "learning",
      reviewCount: 0,
      createdAt: now,
      lastReviewedAt: entry.lastReviewedAt,
    };

    // check if word already exists by lowercased word
    const duplicateIndex = list.findIndex(
      (v) => v.word.toLowerCase() === fullEntry.word && v.id !== fullEntry.id
    );

    if (duplicateIndex >= 0) {
      list[duplicateIndex] = {
        ...list[duplicateIndex],
        ...fullEntry,
        id: list[duplicateIndex].id,
        createdAt: list[duplicateIndex].createdAt,
      };
      setStorage(STORAGE_KEYS.VOCABULARY, list);
      return list[duplicateIndex];
    }

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...fullEntry,
        createdAt: list[existingIndex].createdAt,
      };
    } else {
      list.unshift(fullEntry);
    }

    setStorage(STORAGE_KEYS.VOCABULARY, list);
    return fullEntry;
  },

  updateVocabularyStatus(id: string, status: VocabularyEntry["status"]): void {
    const list = this.getVocabulary();
    const entry = list.find((v) => v.id === id);
    if (entry) {
      entry.status = status;
      entry.lastReviewedAt = new Date().toISOString();
      entry.reviewCount += 1;
      setStorage(STORAGE_KEYS.VOCABULARY, list);

      this.recordActivity({ vocabReviewed: 1 });
    }
  },

  deleteVocabulary(id: string): void {
    const list = this.getVocabulary().filter((v) => v.id !== id);
    setStorage(STORAGE_KEYS.VOCABULARY, list);
  },

  // --- TWO-MINUTE SPARKS ---
  getSparks(): TwoMinuteSpark[] {
    const sparks = getStorage<TwoMinuteSpark[]>(STORAGE_KEYS.SPARKS, []);
    return sparks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  saveSpark(spark: Omit<TwoMinuteSpark, "id" | "createdAt">): TwoMinuteSpark {
    const sparks = this.getSparks();
    const now = new Date().toISOString();
    const fullSpark: TwoMinuteSpark = {
      ...spark,
      id: `spark-${Date.now()}`,
      createdAt: now,
    };

    sparks.unshift(fullSpark);
    setStorage(STORAGE_KEYS.SPARKS, sparks);

    // Record activity and maintain streak
    this.recordActivity({
      wordsWritten: fullSpark.wordCount,
      sparksCompleted: 1,
    });

    // Optional save to writing journal
    if (spark.savedToJournal) {
      this.saveWritingSession({
        id: `session-from-${fullSpark.id}`,
        title: `Spark: ${spark.taskCategory.replace(/_/g, " ")}`,
        content: spark.responseText,
        mood: "reflective",
        format: "paragraph",
        wordCount: spark.wordCount,
        durationSeconds: spark.durationSeconds,
        status: "published",
        hasAiReview: false,
      });
    }

    return fullSpark;
  },

  // --- READING HISTORY ---
  getReadingHistory(): ReadingHistoryItem[] {
    return getStorage<ReadingHistoryItem[]>(STORAGE_KEYS.READING_HISTORY, []);
  },

  getReadingItem(resourceId: string): ReadingHistoryItem | null {
    const items = this.getReadingHistory();
    return items.find((i) => i.resourceId === resourceId) || null;
  },

  saveReadingProgress(
    progress: Partial<ReadingHistoryItem> & { resourceId: string }
  ): ReadingHistoryItem {
    const history = this.getReadingHistory();
    const index = history.findIndex((h) => h.resourceId === progress.resourceId);
    const now = new Date().toISOString();

    const fullItem: ReadingHistoryItem = {
      id: progress.id || `read-hist-${Date.now()}`,
      resourceId: progress.resourceId,
      isCompleted: progress.isCompleted ?? false,
      readDurationSeconds: progress.readDurationSeconds || 0,
      comprehensionScore: progress.comprehensionScore,
      notes: progress.notes || "",
      savedForLater: progress.savedForLater ?? false,
      lastReadAt: now,
    };

    if (index >= 0) {
      history[index] = { ...history[index], ...fullItem };
    } else {
      history.unshift(fullItem);
    }

    setStorage(STORAGE_KEYS.READING_HISTORY, history);

    if (fullItem.isCompleted) {
      this.recordActivity({ readingsCompleted: 1 });
    }

    return fullItem;
  },

  // --- DAILY ACTIVITIES & STREAKS ---
  getDailyActivities(): DailyActivity[] {
    const acts = getStorage<DailyActivity[]>(STORAGE_KEYS.DAILY_ACTIVITIES, []);
    return acts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  recordActivity(delta: {
    wordsWritten?: number;
    writingSessionsCount?: number;
    sparksCompleted?: number;
    readingsCompleted?: number;
    vocabReviewed?: number;
  }): DailyActivity {
    const activities = this.getDailyActivities();
    const today = getTodayKey();
    const existingIndex = activities.findIndex((a) => a.date === today);

    let current = existingIndex >= 0 ? activities[existingIndex] : null;

    if (!current) {
      current = {
        date: today,
        wordsWritten: 0,
        writingSessionsCount: 0,
        sparksCompleted: 0,
        readingsCompleted: 0,
        vocabReviewed: 0,
        streakCount: 1,
      };
      activities.unshift(current);
    }

    if (delta.wordsWritten) current.wordsWritten += delta.wordsWritten;
    if (delta.writingSessionsCount)
      current.writingSessionsCount += delta.writingSessionsCount;
    if (delta.sparksCompleted) current.sparksCompleted += delta.sparksCompleted;
    if (delta.readingsCompleted) current.readingsCompleted += delta.readingsCompleted;
    if (delta.vocabReviewed) current.vocabReviewed += delta.vocabReviewed;

    // Recalculate streak
    current.streakCount = this.calculateStreak(activities);

    setStorage(STORAGE_KEYS.DAILY_ACTIVITIES, activities);
    return current;
  },

  calculateStreak(activities: DailyActivity[]): number {
    if (activities.length === 0) return 0;

    const todayStr = getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Sorted descending by date
    const sorted = [...activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const hasToday = sorted.some(
      (a) =>
        a.date === todayStr &&
        (a.sparksCompleted > 0 || a.writingSessionsCount > 0 || a.wordsWritten > 0)
    );
    const hasYesterday = sorted.some(
      (a) =>
        a.date === yesterdayStr &&
        (a.sparksCompleted > 0 || a.writingSessionsCount > 0 || a.wordsWritten > 0)
    );

    if (!hasToday && !hasYesterday) {
      return 0; // Streak broken or no activity
    }

    let streak = 0;
    let checkDate = new Date();
    if (!hasToday) {
      checkDate = yesterday;
    }

    while (true) {
      const dateKey = checkDate.toISOString().split("T")[0];
      const match = sorted.find(
        (a) =>
          a.date === dateKey &&
          (a.sparksCompleted > 0 || a.writingSessionsCount > 0 || a.wordsWritten > 0)
      );

      if (match) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  // --- MISTAKE PROFILE ANALYSIS ---
  getMistakeProfile(): MistakePattern[] {
    const reviews = this.getAIReviews();
    const issues = reviews.flatMap((r) => r.issues || []);

    if (issues.length === 0) {
      return [];
    }

    const counts: Record<IssueCategory, { count: number; examples: string[] }> = {} as any;

    issues.forEach((issue) => {
      const cat = issue.category;
      if (!counts[cat]) {
        counts[cat] = { count: 0, examples: [] };
      }
      counts[cat].count += 1;
      if (counts[cat].examples.length < 3 && issue.originalExcerpt) {
        counts[cat].examples.push(issue.originalExcerpt);
      }
    });

    const patterns: MistakePattern[] = Object.entries(counts).map(([catKey, data]) => {
      const cat = catKey as IssueCategory;
      const meta = MISTAKE_RULES_CATALOG[cat] || {
        label: cat,
        explanation: "Grammatical or stylistic habit to monitor.",
        rule: "Review and refine.",
      };

      const freq: MistakePattern["frequency"] =
        data.count >= 4 ? "recurring" : data.count >= 2 ? "occasional" : "rare";

      return {
        category: cat,
        categoryLabel: meta.label,
        count: data.count,
        frequency: freq,
        explanation: meta.explanation,
        typicalRule: meta.rule,
        recentExamples: data.examples,
      };
    });

    return patterns.sort((a, b) => b.count - a.count);
  },

  // --- OVERALL PROGRESS METRICS ---
  getProgressSummary() {
    const sessions = this.getWritingSessions();
    const sparks = this.getSparks();
    const vocab = this.getVocabulary();
    const reading = this.getReadingHistory();
    const activities = this.getDailyActivities();

    const totalWords =
      sessions.reduce((acc, s) => acc + (s.wordCount || 0), 0) +
      sparks.reduce((acc, sp) => acc + (sp.wordCount || 0), 0);

    const activeDaysCount = activities.filter(
      (a) => a.wordsWritten > 0 || a.sparksCompleted > 0 || a.readingsCompleted > 0
    ).length;

    const streak = this.calculateStreak(activities);

    const masteredVocab = vocab.filter((v) => v.status === "mastered").length;
    const learningVocab = vocab.filter((v) => v.status === "learning").length;
    const completedReadings = reading.filter((r) => r.isCompleted).length;

    return {
      totalWords,
      totalSessions: sessions.length,
      totalSparks: sparks.length,
      activeDaysCount,
      streak,
      vocabTotal: vocab.length,
      vocabMastered: masteredVocab,
      vocabLearning: learningVocab,
      completedReadings,
    };
  },

  // --- MY JOURNAL (PERSONAL DIARY) ---
  getJournalEntries(): JournalEntry[] {
    const list = getStorage<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES, []);
    if (list.length === 0) {
      // Seed with warm initial entries
      setStorage(STORAGE_KEYS.JOURNAL_ENTRIES, INITIAL_JOURNAL_ENTRIES);
      return INITIAL_JOURNAL_ENTRIES;
    }
    return list.sort(
      (a, b) => new Date(b.date + "T" + (b.time || "00:00")).getTime() - new Date(a.date + "T" + (a.time || "00:00")).getTime()
    );
  },

  getJournalEntryById(id: string): JournalEntry | null {
    const list = this.getJournalEntries();
    return list.find((e) => e.id === id) || null;
  },

  saveJournalEntry(entry: Partial<JournalEntry> & { id?: string; content?: string }): JournalEntry {
    const list = this.getJournalEntries();
    const id = entry.id || "journal-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const existingIndex = list.findIndex((e) => e.id === id);
    const now = new Date().toISOString();
    const today = now.split("T")[0];

    const fullEntry: JournalEntry = {
      id,
      title: entry.title || "Untitled Entry",
      body: entry.body || entry.content || "",
      date: entry.date || today,
      time: entry.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: entry.mood,
      tags: entry.tags || [],
      isFavorite: entry.isFavorite ?? false,
      weather: entry.weather,
      createdAt: entry.createdAt || now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...fullEntry,
        createdAt: list[existingIndex].createdAt,
      };
    } else {
      list.unshift(fullEntry);
    }

    setStorage(STORAGE_KEYS.JOURNAL_ENTRIES, list);

    // Track word activity silently
    const wordCount = fullEntry.body.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 0) {
      this.recordActivity({ wordsWritten: wordCount, writingSessionsCount: 1 });
    }

    return fullEntry;
  },

  deleteJournalEntry(id: string): void {
    const list = this.getJournalEntries().filter((e) => e.id !== id);
    setStorage(STORAGE_KEYS.JOURNAL_ENTRIES, list);
  },

  toggleFavoriteJournalEntry(id: string): boolean {
    const list = this.getJournalEntries();
    const entry = list.find((e) => e.id === id);
    if (entry) {
      entry.isFavorite = !entry.isFavorite;
      setStorage(STORAGE_KEYS.JOURNAL_ENTRIES, list);
      return entry.isFavorite;
    }
    return false;
  },

  // --- MY LIBRARY & READING NOOK ---
  getLibraryBooks(): BookItem[] {
    const list = getStorage<BookItem[]>(STORAGE_KEYS.LIBRARY_BOOKS, []);
    if (list.length === 0) {
      setStorage(STORAGE_KEYS.LIBRARY_BOOKS, CURATED_BOOKS);
      return CURATED_BOOKS;
    }
    return list;
  },

  getBookById(id: string): BookItem | null {
    const list = this.getLibraryBooks();
    return list.find((b) => b.id === id) || null;
  },

  saveBook(book: Partial<BookItem> & { id: string }): BookItem {
    const list = this.getLibraryBooks();
    const existingIndex = list.findIndex((b) => b.id === book.id);

    const fullBook: BookItem = {
      id: book.id,
      title: book.title || "Untitled Book",
      author: book.author || "Unknown Author",
      genre: book.genre || "Literature",
      status: book.status || "want_to_read",
      progressPercent: book.progressPercent ?? 0,
      rating: book.rating,
      personalNotes: book.personalNotes || "",
      favoriteQuotes: book.favoriteQuotes || [],
      coverColor: book.coverColor || "#65745A",
      coverSubtitle: book.coverSubtitle,
      estimatedPages: book.estimatedPages || 200,
      currentPage: book.currentPage || 0,
      startedDate: book.startedDate,
      finishedDate: book.finishedDate,
      sourceLink: book.sourceLink,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...fullBook };
    } else {
      list.unshift(fullBook);
    }

    setStorage(STORAGE_KEYS.LIBRARY_BOOKS, list);
    return fullBook;
  },

  updateBookStatus(id: string, status: BookItem["status"], progressPercent?: number): void {
    const list = this.getLibraryBooks();
    const book = list.find((b) => b.id === id);
    if (book) {
      book.status = status;
      if (progressPercent !== undefined) {
        book.progressPercent = progressPercent;
      }
      if (status === "finished") {
        book.progressPercent = 100;
        book.finishedDate = new Date().toISOString().split("T")[0];
        this.recordActivity({ readingsCompleted: 1 });
      }
      setStorage(STORAGE_KEYS.LIBRARY_BOOKS, list);
    }
  },

  updateBookNotes(id: string, notes: string, quotes?: string[]): void {
    const list = this.getLibraryBooks();
    const book = list.find((b) => b.id === id);
    if (book) {
      book.personalNotes = notes;
      if (quotes) book.favoriteQuotes = quotes;
      setStorage(STORAGE_KEYS.LIBRARY_BOOKS, list);
    }
  },

  deleteBook(id: string): void {
    const list = this.getLibraryBooks().filter((b) => b.id !== id);
    setStorage(STORAGE_KEYS.LIBRARY_BOOKS, list);
  },

  // --- READING POSITION RESTORATION ---
  getReadingPositions(): Record<string, { scrollPercent: number; scrollOffset?: number; progressPercent?: number; page?: number; lastReadAt: string }> {
    return getStorage<Record<string, { scrollPercent: number; scrollOffset?: number; progressPercent?: number; page?: number; lastReadAt: string }>>(
      STORAGE_KEYS.READING_POSITIONS,
      {}
    );
  },

  saveReadingPosition(
    resourceId: string,
    position: { scrollPercent?: number; scrollOffset?: number; progressPercent?: number; page?: number } | number,
    maybeProgress?: number
  ): void {
    const map = this.getReadingPositions();
    let scrollPercent = 0;
    let page: number | undefined;
    let scrollOffset: number | undefined;
    let progressPercent: number | undefined;

    if (typeof position === "number") {
      scrollOffset = position;
      progressPercent = maybeProgress ?? 0;
      scrollPercent = Math.round((maybeProgress ?? 0) * 100);
    } else {
      scrollPercent = position.scrollPercent ?? Math.round((position.progressPercent ?? 0) * 100);
      scrollOffset = position.scrollOffset;
      progressPercent = position.progressPercent ?? (position.scrollPercent !== undefined ? position.scrollPercent / 100 : undefined);
      page = position.page;
    }

    map[resourceId] = {
      scrollPercent,
      scrollOffset,
      progressPercent,
      page,
      lastReadAt: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.READING_POSITIONS, map);
  },

  // --- SAVED PASSAGES & QUOTES ---
  getSavedPassages(): Array<{ id: string; resourceId: string; resourceTitle: string; passage: string; note?: string; savedAt: string; author?: string; location?: string }> {
    return getStorage<Array<{ id: string; resourceId: string; resourceTitle: string; passage: string; note?: string; savedAt: string; author?: string; location?: string }>>(
      STORAGE_KEYS.SAVED_PASSAGES,
      []
    );
  },

  savePassage(passage: {
    resourceId?: string;
    resourceTitle?: string;
    passage?: string;
    text?: string;
    bookId?: string;
    bookTitle?: string;
    author?: string;
    location?: string;
    notes?: string;
    note?: string;
  }): { id: string; resourceId: string; resourceTitle: string; passage: string; note?: string; savedAt: string; author?: string; location?: string } {
    const list = this.getSavedPassages();
    const passageText = passage.passage || passage.text || "";
    const resId = passage.resourceId || passage.bookId || "resource";
    const resTitle = passage.resourceTitle || passage.bookTitle || "Untitled";
    const noteText = passage.note || passage.notes;

    const item = {
      id: "passage-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      resourceId: resId,
      resourceTitle: resTitle,
      passage: passageText,
      note: noteText,
      author: passage.author,
      location: passage.location,
      savedAt: new Date().toISOString(),
    };
    list.unshift(item);
    setStorage(STORAGE_KEYS.SAVED_PASSAGES, list);
    return item;
  },

  removeSavedPassage(id: string): void {
    const list = this.getSavedPassages().filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.SAVED_PASSAGES, list);
  },

  // --- UNIVERSAL JOURNAL SEARCH ---
  searchJournalEntries(filters: Partial<JournalSearchFilters>): JournalSearchResult[] {
    const entries = this.getJournalEntries();
    const q = (filters.query || "").trim().toLowerCase();
    const scope = filters.scope || "all";
    const moodFilter = filters.mood && filters.mood !== "all" ? filters.mood.toLowerCase() : null;
    const tagFilter = filters.tag && filters.tag !== "all" ? filters.tag.toLowerCase() : null;
    const isFavOnly = Boolean(filters.isFavoriteOnly || (filters as { isFavorite?: boolean }).isFavorite);
    const startDate = filters.startDate || null;
    const endDate = filters.endDate || null;
    const yearFilter = filters.year || null;
    const monthFilter = filters.month || null;

    const results: JournalSearchResult[] = [];

    for (const entry of entries) {
      // 1. Favorite filter
      if (isFavOnly && !entry.isFavorite) continue;

      // 2. Mood filter
      if (moodFilter && (!entry.mood || entry.mood.toLowerCase() !== moodFilter)) continue;

      // 3. Tag filter
      if (tagFilter) {
        const hasTag = entry.tags.some((t) => t.toLowerCase() === tagFilter);
        if (!hasTag) continue;
      }

      // 4. Date filters
      const entryDate = entry.date;
      if (startDate && entryDate < startDate) continue;
      if (endDate && entryDate > endDate) continue;
      if (yearFilter && !entryDate.startsWith(yearFilter)) continue;
      if (monthFilter) {
        const parts = entryDate.split("-");
        if (parts[1] !== monthFilter) continue;
      }

      // 5. Query matching
      let score = 0;
      const matchedSnippets: string[] = [];
      let matchedField: JournalSearchResult["matchedField"] = "all";

      if (!q) {
        // No search query: everything matches with neutral score
        results.push({
          entry,
          matchScore: 1,
          matchedSnippets: [entry.body.slice(0, 140) + "..."],
          matchedField: "all",
        });
        continue;
      }

      const titleLower = entry.title.toLowerCase();
      const bodyLower = entry.body.toLowerCase();
      const tagsString = entry.tags.join(" ").toLowerCase();

      const titleMatches = (scope === "all" || scope === "title") && titleLower.includes(q);
      const bodyMatches = (scope === "all" || scope === "body") && bodyLower.includes(q);
      const tagMatches = (scope === "all" || scope === "tags") && tagsString.includes(q);

      if (!titleMatches && !bodyMatches && !tagMatches) {
        continue;
      }

      if (titleMatches) {
        score += 15;
        matchedField = "title";
      }
      if (tagMatches) {
        score += 10;
        if (matchedField === "all") matchedField = "tags";
      }
      if (bodyMatches) {
        score += 8;
        if (matchedField === "all") matchedField = "body";

        // Extract a helpful snippet around the matching keyword
        const idx = bodyLower.indexOf(q);
        const start = Math.max(0, idx - 40);
        const end = Math.min(entry.body.length, idx + q.length + 80);
        const snippet = (start > 0 ? "..." : "") + entry.body.slice(start, end).trim() + (end < entry.body.length ? "..." : "");
        matchedSnippets.push(snippet);
      } else {
        matchedSnippets.push(entry.body.slice(0, 130) + "...");
      }

      if (entry.isFavorite) score += 2;

      results.push({
        entry,
        matchScore: score,
        matchedSnippets,
        matchedField,
      });
    }

    // Sort results
    const sort = filters.sort || "newest";
    results.sort((a, b) => {
      if (sort === "relevance" && q) {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
      }
      const timeA = new Date(a.entry.date + "T" + (a.entry.time || "00:00")).getTime();
      const timeB = new Date(b.entry.date + "T" + (b.entry.time || "00:00")).getTime();
      return sort === "oldest" ? timeA - timeB : timeB - timeA;
    });

    return results;
  },

  clearAllUserData(): void {
    memoryStorage = {};
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    }
  },
};
