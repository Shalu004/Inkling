export type MoodType =
  | "reflective"
  | "curious"
  | "calm"
  | "motivated"
  | "frustrated"
  | "nostalgic"
  | "creative"
  | "uncertain"
  | "observant"
  | "introspective";

export type WritingFormat =
  | "reflective_essay"
  | "personal_journal"
  | "paragraph"
  | "opinion_piece"
  | "creative_prose"
  | "short_story";

export type VocabStatus = "learning" | "familiar" | "mastered";

export type IssueCategory =
  | "grammar"
  | "tense"
  | "subject_verb_agreement"
  | "articles"
  | "prepositions"
  | "punctuation"
  | "spelling"
  | "sentence_construction"
  | "unnatural_expression"
  | "repeated_vocabulary"
  | "clarity"
  | "coherence"
  | "transitions";

export type ThemeType =
  | "linen"
  | "sage"
  | "midnight"
  | "sepia"
  | "rose"
  | "pure_light";

export interface ReaderPreferences {
  fontSize: number; // 14 - 24
  fontFamily: "serif" | "sans" | "accessible";
  lineHeight: "compact" | "normal" | "relaxed";
  marginWidth: "narrow" | "normal" | "wide";
  theme: "linen" | "sepia" | "sage" | "midnight";
  mode: "scroll" | "paginated";
  focusMode: boolean;
}

export interface UserPreferences {
  preferredGenres: string[];
  interests: string[];
  dailyWordGoal: number;
  dailyWritingMinutes: number;
  readingDifficulty: "beginner" | "intermediate" | "advanced";
  aiFeedbackTone: "gentle" | "supportive_rigorous" | "academic";
  focusModeDefault: boolean;
  emailReminders: boolean;
  theme?: ThemeType;
  colorScheme?: "system" | "light" | "dark";
  readerPreferences?: ReaderPreferences;
}

export interface WritingPrompt {
  id: string;
  title: string;
  promptText: string;
  mood: MoodType;
  category: string;
  format: WritingFormat;
  difficulty: "beginner" | "intermediate" | "advanced";
  suggestedWordsMin: number;
  suggestedWordsMax: number;
  guidingQuestions: string[];
  isCurated: boolean;
  reasonForRecommendation?: string;
}

export type DocumentType =
  | "article_essay"
  | "short_story"
  | "novel_chapter"
  | "poetry"
  | "personal_reflection"
  | "diary_entry"
  | "letter"
  | "book_review"
  | "script_dialogue"
  | "blank_document";

export interface WritingSession {
  id: string;
  userId?: string;
  promptId?: string;
  promptTitle?: string;
  title: string;
  content: string;
  mood?: MoodType;
  format: WritingFormat;
  documentType?: DocumentType;
  isFavorite?: boolean;
  tags?: string[];
  authorNote?: string;
  wordCount: number;
  durationSeconds: number;
  status: "draft" | "published" | "archived";
  hasAiReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WritingCompanionAction =
  | "check_all"
  | "fix_grammar"
  | "improve_flow"
  | "find_better_words"
  | "explain_mistake"
  | "review_entry";

export interface CompanionSuggestion {
  id: string;
  originalText: string;
  startIndex?: number;
  endIndex?: number;
  suggestedCorrection: string;
  category: IssueCategory | "style" | "redundancy" | "word_choice";
  explanation: string;
  isStylistic: boolean;
  alternatives?: string[];
  confidence?: "high" | "moderate" | "creative_choice";
  status: "pending" | "applied" | "ignored";
}

export interface CompanionAnalysisResult {
  action: WritingCompanionAction;
  summary: string;
  suggestions: CompanionSuggestion[];
  provider: "gemini" | "heuristic_engine";
  timestamp: string;
}

export interface LittlePlanSubtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface LittlePlanTask {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
  priority: "low" | "medium" | "high";
  subtasks: LittlePlanSubtask[];
  reminder?: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  linkedItem?: {
    type: "journal" | "reading" | "document";
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: Array<{
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }>;
}

export interface DictionaryLookupResult {
  found: boolean;
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: DictionaryMeaning[];
  synonyms: string[];
  antonyms: string[];
  nuancedDistinction?: string;
  etymology?: string;
  suggestions?: string[]; // Spelling suggestions if not found
  source: "free_dictionary_api" | "curated_lexicon" | "spelling_service";
  isAiGenerated?: boolean;
}

export interface WritingIssue {
  id: string;
  reviewId?: string;
  originalExcerpt: string;
  suggestedCorrection: string;
  category: IssueCategory;
  severity: "low" | "moderate" | "high";
  isStylistic: boolean;
  explanation: string;
  ruleOrPrinciple: string;
  exampleSentence?: string;
  status: "pending" | "accepted" | "rejected";
}

export interface AIReview {
  id: string;
  sessionId: string;
  overallStrengths: string[];
  areasForImprovement: string[];
  clarityScore: number;
  coherenceObservations?: string;
  vocabularyObservations?: string;
  sentenceStructureObservations?: string;
  nextSessionPriority: string;
  recommendedExercise: {
    title: string;
    instructions: string;
    sampleTask: string;
  };
  rewrites: {
    natural: string;
    concise: string;
    expressive: string;
    formal: string;
  };
  contextualVocabulary: Array<{
    word: string;
    context: string;
    nuance: string;
    partOfSpeech: string;
    definition: string;
  }>;
  issues: WritingIssue[];
  modelVersion: string;
  createdAt: string;
}

export interface VocabularyEntry {
  id: string;
  userId?: string;
  word: string;
  partOfSpeech: string;
  phonetic?: string;
  definition: string;
  exampleSentence: string;
  personalExample?: string;
  contextualNuance?: string;
  synonyms?: string[];
  nuancedDistinction?: string;
  etymology?: string;
  tags?: string[];
  isFavorite?: boolean;
  sourceContext?: string;
  sourceType: "writing_coach" | "reading_corner" | "manual_search" | "curated_lexicon";
  status: VocabStatus;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  createdAt: string;
}

export interface LiteraryQuote {
  id: string;
  quote: string;
  author: string;
  work: string;
  year?: string;
  theme: string; // e.g. "Solitude & Quiet", "Art of Writing", "Nature & Wonder", "Patience & Growth"
  emotion: string; // e.g. "reflective", "observant", "calm", "creative", "introspective"
  sourceUrl?: string;
  botanicalMotif?: "laurel" | "fern" | "ivy" | "ginkgo" | "olive" | "rose";
  contextNote?: string;
}

export interface SavedQuoteReflection {
  quoteId: string;
  savedAt: string;
  reflection?: string;
  isFavorite: boolean;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ReadingResource {
  id: string;
  title: string;
  author: string;
  sourceName: string;
  sourceUrl: string;
  excerpt: string;
  fullText: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedReadMinutes: number;
  keyTakeaway: string;
  comprehensionQuestions: ComprehensionQuestion[];
  isCurated: boolean;
}

export interface ReadingHistoryItem {
  id: string;
  resourceId: string;
  isCompleted: boolean;
  readDurationSeconds: number;
  comprehensionScore?: number;
  notes?: string;
  savedForLater: boolean;
  lastReadAt: string;
}

export interface TwoMinuteSpark {
  id: string;
  promptText: string;
  responseText: string;
  durationSeconds: number;
  wordCount: number;
  taskCategory: string;
  savedToJournal: boolean;
  createdAt: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  wordsWritten: number;
  writingSessionsCount: number;
  sparksCompleted: number;
  readingsCompleted: number;
  vocabReviewed: number;
  streakCount: number;
}

export interface MistakePattern {
  category: IssueCategory;
  categoryLabel: string;
  count: number;
  frequency: "recurring" | "occasional" | "rare";
  explanation: string;
  typicalRule: string;
  recentExamples: string[];
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  date: string; // YYYY-MM-DD
  time?: string;
  mood?: MoodType;
  tags: string[];
  isFavorite: boolean;
  weather?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: "currently_reading" | "want_to_read" | "finished" | "favorite";
  progressPercent: number; // 0-100
  rating?: number; // 1-5
  personalNotes?: string;
  favoriteQuotes?: string[];
  coverColor: string;
  coverSubtitle?: string;
  estimatedPages: number;
  currentPage?: number;
  startedDate?: string;
  finishedDate?: string;
  sourceLink?: string;
}

export interface LiteraryDiscovery {
  id: string;
  title: string;
  author: string;
  type: "book" | "poem" | "essay" | "quote" | "author";
  content?: string;
  excerpt: string;
  source?: string;
  year?: string;
  mood?: MoodType;
  tags: string[];
  coverColor?: string;
}

// --- MULTI-PROVIDER BOOK CATALOG TYPES ---
export type BookSource = "open_library" | "google_books" | "project_gutenberg";

export interface BookAvailability {
  type: "read_online" | "preview" | "borrow" | "public_domain" | "details_only";
  label: string;
  url?: string;
  format?: string; // "html" | "epub" | "pdf" | "text"
}

export interface UnifiedBook {
  id: string; // e.g. "ol:OL123", "gb:abc", "pg:105"
  title: string;
  authors: string[];
  author: string;
  description?: string;
  coverUrl?: string;
  coverColor?: string;
  firstPublishYear?: number | string;
  publisher?: string;
  isbn?: string;
  pageCount?: number;
  subjects: string[];
  language?: string;
  source: BookSource;
  sourceLabel: string;
  sourceAttribution: string;
  availability: BookAvailability;
  downloadUrl?: string;
  externalUrl?: string;
  editionCount?: number;
}

export interface BookSearchParams {
  query: string;
  source?: "all" | BookSource;
  genre?: string;
  language?: string;
  year?: string;
  availability?: "all" | "read_online" | "preview" | "borrow" | "public_domain";
  page?: number;
  limit?: number;
}

// --- UNIVERSAL JOURNAL SEARCH TYPES ---
export type JournalSearchScope = "all" | "title" | "body" | "tags";
export type JournalSortOption = "newest" | "oldest" | "relevance";

export interface JournalSearchFilters {
  query: string;
  scope: JournalSearchScope;
  mood?: string; // "all" or specific mood
  tag?: string;
  isFavoriteOnly?: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  year?: string;
  month?: string; // "01" - "12"
  sort: JournalSortOption;
}

export interface JournalSearchResult {
  entry: JournalEntry;
  matchScore: number;
  matchedSnippets: string[];
  matchedField: "title" | "body" | "tags" | "all";
}

// --- AUTHENTICATION & USER SPACE TYPES ---
export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  user: UserAccount;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserAccount;
  error?: string;
}


