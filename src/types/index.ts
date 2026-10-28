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

export interface UserPreferences {
  preferredGenres: string[];
  interests: string[];
  dailyWordGoal: number;
  dailyWritingMinutes: number;
  readingDifficulty: "beginner" | "intermediate" | "advanced";
  aiFeedbackTone: "gentle" | "supportive_rigorous" | "academic";
  focusModeDefault: boolean;
  emailReminders: boolean;
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

export interface WritingSession {
  id: string;
  userId?: string;
  promptId?: string;
  promptTitle?: string;
  title: string;
  content: string;
  mood?: MoodType;
  format: WritingFormat;
  wordCount: number;
  durationSeconds: number;
  status: "draft" | "published" | "archived";
  hasAiReview: boolean;
  createdAt: string;
  updatedAt: string;
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
  contextualNuance?: string;
  sourceContext?: string;
  sourceType: "writing_coach" | "reading_corner" | "manual_search";
  status: VocabStatus;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  createdAt: string;
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

