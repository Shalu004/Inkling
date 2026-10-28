import { z } from "zod";

export const writingIssueSchema = z.object({
  originalExcerpt: z.string().min(1),
  suggestedCorrection: z.string().min(1),
  category: z.enum([
    "grammar",
    "tense",
    "subject_verb_agreement",
    "articles",
    "prepositions",
    "punctuation",
    "spelling",
    "sentence_construction",
    "unnatural_expression",
    "repeated_vocabulary",
    "clarity",
    "coherence",
    "transitions",
  ]),
  severity: z.enum(["low", "moderate", "high"]).default("moderate"),
  isStylistic: z.boolean().default(false),
  explanation: z.string().min(5),
  ruleOrPrinciple: z.string().min(5),
  exampleSentence: z.string().optional(),
});

export const contextualVocabSchema = z.object({
  word: z.string(),
  context: z.string(),
  nuance: z.string(),
  partOfSpeech: z.string().default("noun"),
  definition: z.string(),
});

export const aiReviewResponseSchema = z.object({
  overallStrengths: z.array(z.string()).min(1),
  areasForImprovement: z.array(z.string()).min(1),
  clarityScore: z.number().min(0).max(100),
  coherenceObservations: z.string().optional(),
  vocabularyObservations: z.string().optional(),
  sentenceStructureObservations: z.string().optional(),
  nextSessionPriority: z.string().min(5),
  recommendedExercise: z.object({
    title: z.string(),
    instructions: z.string(),
    sampleTask: z.string(),
  }),
  rewrites: z.object({
    natural: z.string().min(1),
    concise: z.string().min(1),
    expressive: z.string().min(1),
    formal: z.string().min(1),
  }),
  contextualVocabulary: z.array(contextualVocabSchema).default([]),
  issues: z.array(writingIssueSchema).default([]),
});

export type AIReviewResponse = z.infer<typeof aiReviewResponseSchema>;
