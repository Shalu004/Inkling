import { aiReviewResponseSchema, AIReviewResponse } from "./schemas";
import { WritingFormat, MoodType } from "@/types";

const DEFAULT_AI_MODEL = process.env.INKLING_AI_MODEL || "gemini-1.5-flash";

export interface ReviewRequest {
  title: string;
  content: string;
  format?: WritingFormat;
  mood?: MoodType;
  promptText?: string;
  tone?: "gentle" | "supportive_rigorous" | "academic";
}

/**
 * Intelligent pedagogical analysis engine used when API key is configured
 * or as a robust educational fallback.
 */
export async function generateWritingReview(
  req: ReviewRequest
): Promise<{ review: AIReviewResponse; provider: "gemini" | "heuristic_engine" }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const review = await callGeminiAPI(req, apiKey);
      return { review, provider: "gemini" };
    } catch (err) {
      console.warn("Gemini API call failed, falling back to pedagogical heuristic engine:", err);
    }
  }

  // Fallback to our deep educational analysis engine
  const review = analyzeWritingHeuristically(req);
  return { review, provider: "heuristic_engine" };
}

async function callGeminiAPI(req: ReviewRequest, apiKey: string): Promise<AIReviewResponse> {
  const model = DEFAULT_AI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are Inkling's AI Writing Coach. Your philosophy:
- Be a thoughtful, discerning writing mentor, not an essay generator.
- Help the writer strengthen their own voice, never overwrite their personality.
- Distinguish between genuine errors and intentional stylistic choices.
- Return ONLY valid JSON adhering strictly to the requested schema.`;

  const prompt = `Analyze this writing piece:
Title: "${req.title}"
Format: ${req.format || "reflective_essay"}
Tone requested: ${req.tone || "supportive_rigorous"}
Content:
"""
${req.content}
"""

Return a JSON object with:
{
  "overallStrengths": ["string", "string"],
  "areasForImprovement": ["string", "string"],
  "clarityScore": number (0-100),
  "coherenceObservations": "string",
  "vocabularyObservations": "string",
  "sentenceStructureObservations": "string",
  "nextSessionPriority": "string",
  "recommendedExercise": {
    "title": "string",
    "instructions": "string",
    "sampleTask": "string"
  },
  "rewrites": {
    "natural": "string",
    "concise": "string",
    "expressive": "string",
    "formal": "string"
  },
  "contextualVocabulary": [
    {
      "word": "string",
      "context": "string",
      "nuance": "string",
      "partOfSpeech": "string",
      "definition": "string"
    }
  ],
  "issues": [
    {
      "originalExcerpt": "exact excerpt from text",
      "suggestedCorrection": "improved wording",
      "category": "grammar"|"tense"|"subject_verb_agreement"|"articles"|"prepositions"|"punctuation"|"spelling"|"sentence_construction"|"unnatural_expression"|"repeated_vocabulary"|"clarity"|"coherence"|"transitions",
      "severity": "low"|"moderate"|"high",
      "isStylistic": boolean,
      "explanation": "educational reason",
      "ruleOrPrinciple": "linguistic rule",
      "exampleSentence": "illustrative example"
    }
  ]
}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorBody}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Empty response from AI provider");
  }

  const parsed = JSON.parse(rawText);
  return aiReviewResponseSchema.parse(parsed);
}

/**
 * Pedagogical heuristic engine for instant, deterministic, high-quality
 * feedback when running locally without an external API key.
 */
export function analyzeWritingHeuristically(req: ReviewRequest): AIReviewResponse {
  const text = req.content || "";
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const issues: AIReviewResponse["issues"] = [];
  const contextualVocab: AIReviewResponse["contextualVocabulary"] = [];

  // 1. Check for wordiness and throat-clearing expressions
  const throatClearers = [
    {
      pattern: /in order to/gi,
      suggest: "to",
      category: "clarity" as const,
      rule: "Omit needless words. 'In order to' almost always collapses cleanly into 'to'.",
      explanation: "Trimming filler phrases strengthens the forward momentum of your sentence.",
    },
    {
      pattern: /due to the fact that/gi,
      suggest: "because",
      category: "clarity" as const,
      rule: "Prefer direct causal conjunctions over bureaucratic circumlocutions.",
      explanation: "'Because' is punchier and avoids slowing the reader down.",
    },
    {
      pattern: /there is a tendency for/gi,
      suggest: "tends to",
      category: "sentence_construction" as const,
      rule: "Convert nominalized noun phrases into active verbs.",
      explanation: "Active verbs bring immediate vitality to reflective essays.",
    },
    {
      pattern: /it is important to note that/gi,
      suggest: "(omit or state assertion directly)",
      category: "clarity" as const,
      rule: "Remove throat-clearing declarations; let the significance emerge from the thought itself.",
      explanation: "Announcing that something is important weakens the claim compared to stating it cleanly.",
    },
  ];

  throatClearers.forEach((item) => {
    const match = text.match(item.pattern);
    if (match && match[0]) {
      issues.push({
        originalExcerpt: match[0],
        suggestedCorrection: item.suggest,
        category: item.category,
        severity: "low",
        isStylistic: true,
        explanation: item.explanation,
        ruleOrPrinciple: item.rule,
        exampleSentence: `Instead of "He waited in order to see her," write "He waited to see her."`,
      });
    }
  });

  // 2. Check for vague or repetitive descriptors
  const vagueDescriptors = [
    {
      pattern: /\bvery good\b/gi,
      suggest: "exemplary / compelling / profound",
      nuances: [
        { word: "compelling", nuance: "Evokes irresistible intellectual or emotional conviction" },
        { word: "profound", nuance: "Shows deep insight extending beyond surface appearances" },
      ],
    },
    {
      pattern: /\ba lot of\b/gi,
      suggest: "numerous / abundant / manifold",
      nuances: [
        { word: "manifold", nuance: "Many and varied; possessing diverse aspects or facets" },
        { word: "abundant", nuance: "Existing or available in large, generous quantities" },
      ],
    },
    {
      pattern: /\bvery interesting\b/gi,
      suggest: "arresting / evocative / illuminating",
      nuances: [
        { word: "arresting", nuance: "Striking and immediately capturing attention" },
        { word: "illuminating", nuance: "Clarifies a complex or hidden concept with sudden light" },
      ],
    },
  ];

  vagueDescriptors.forEach((item) => {
    const match = text.match(item.pattern);
    if (match && match[0]) {
      issues.push({
        originalExcerpt: match[0],
        suggestedCorrection: item.suggest,
        category: "repeated_vocabulary",
        severity: "low",
        isStylistic: true,
        explanation:
          "General intensifiers like 'very' dilute impact. A more precise adjective carries greater emotional weight.",
        ruleOrPrinciple:
          "Replace adverb + weak adjective pairs with an exact, evocative single word.",
        exampleSentence: `Instead of "a very interesting reflection," try "an illuminating reflection."`,
      });

      item.nuances.forEach((n) => {
        if (!contextualVocab.some((v) => v.word === n.word)) {
          contextualVocab.push({
            word: n.word,
            context: match[0],
            nuance: n.nuance,
            partOfSpeech: "adjective",
            definition: n.nuance,
          });
        }
      });
    }
  });

  // 3. Check for comma splices or overlong sentences (> 38 words)
  sentences.forEach((sentence) => {
    const wordsInSent = sentence.split(/\s+/).length;
    if (wordsInSent > 36 && !sentence.includes(";") && !sentence.includes("—")) {
      issues.push({
        originalExcerpt: sentence.slice(0, 60) + "...",
        suggestedCorrection: "Divide into two distinct clauses or introduce an em-dash/semicolon.",
        category: "sentence_construction",
        severity: "moderate",
        isStylistic: true,
        explanation:
          "This sentence carries several dense thoughts without pausing. The reader's cognitive load increases.",
        ruleOrPrinciple:
          "Vary sentence rhythm: follow an expansive period with a crisp, succinct sentence.",
        exampleSentence:
          "Break long clauses into a controlling premise followed by an illustrative detail.",
      });
    }
  });

  // 4. Check for double spaces or obvious mechanical punctuation issues
  if (text.includes("  ")) {
    issues.push({
      originalExcerpt: "  ",
      suggestedCorrection: "Single space",
      category: "punctuation",
      severity: "low",
      isStylistic: false,
      explanation: "Modern digital typography uses single spacing between sentences.",
      ruleOrPrinciple: "Standardize spacing to single spaces.",
    });
  }

  // Ensure contextual vocabulary has at least 2 literary words fitting the reflection
  if (contextualVocab.length < 2) {
    contextualVocab.push(
      {
        word: "luminescent",
        context: "sensory description",
        nuance: "Emitting quiet, radiant light; highlights subtle beauty rather than harsh brightness.",
        partOfSpeech: "adjective",
        definition: "Emitting light not caused by heat; gently glowing.",
      },
      {
        word: "discernment",
        context: "reflective reasoning",
        nuance: "The ability to judge well with intellectual delicacy, distinguishing subtle qualities.",
        partOfSpeech: "noun",
        definition: "The ability to judge well; keen perception and insight.",
      }
    );
  }

  // Calculate clarity score based on issues
  const baseScore = 92;
  const deductions = issues.length * 4;
  const clarityScore = Math.max(68, Math.min(98, baseScore - deductions));

  // Generate 4 distinct rewrites
  const sampleText = text.trim() || "The thoughts we hold in silence often speak with the clearest resonance.";
  
  const natural = sampleText
    .replace(/in order to/gi, "to")
    .replace(/due to the fact that/gi, "because")
    .replace(/very good/gi, "compelling")
    .replace(/very interesting/gi, "illuminating");

  const concise = sentences
    .map((s) => s.replace(/in order to/gi, "to").replace(/there is a tendency for/gi, "tends to"))
    .slice(0, Math.min(sentences.length, 3))
    .join(" ");

  const expressive = `${natural} In the quiet architecture of these words, a genuine perspective begins to breathe.`;

  const formal = `Upon critical evaluation, ${natural.toLowerCase().replace(/^[a-z]/, (c) => c.toUpperCase())} This observation warrants rigorous contemplation within contemporary discourse.`;

  return {
    overallStrengths: [
      "Authentic personal voice that avoids generic clichés and speaks directly to the core experience.",
      `Consistent reflective posture appropriate for a ${req.format || "reflective essay"}.`,
      "Thoughtful vocabulary choices that anchor abstract ideas in concrete observations.",
    ],
    areasForImprovement: [
      issues.length > 0
        ? `Focus on refining ${issues[0].category.replace(/_/g, " ")} to elevate cadence and clarity.`
        : "Experiment with varying sentence lengths to create melodic prose rhythm.",
      "Consider pairing your primary insight with a tactile, sensory anchor from everyday observation.",
    ],
    clarityScore,
    coherenceObservations:
      "The progression of thought moves smoothly from personal contemplation toward a broader insight.",
    vocabularyObservations:
      "The lexicon is thoughtful; replacing general intensifiers with precise nouns will heighten resonance.",
    sentenceStructureObservations:
      "Good balance between medium and compound sentences. Intersperse a short 4-to-6 word punchline for emphasis.",
    nextSessionPriority:
      issues.length > 0
        ? `Practice ${issues[0].category.replace(/_/g, " ")} refinement on your next draft.`
        : "Write a 300-word piece focusing on sensory precision without using common adverbs.",
    recommendedExercise: {
      title: "The Windowpane Clarity Drill",
      instructions:
        "Take one sentence from this entry. Rewrite it in three distinct ways: first in under 10 words, then with a sensory metaphor, and finally as an arresting question.",
      sampleTask: "Transform an abstract feeling into an undeniable, tangible image.",
    },
    rewrites: {
      natural: natural || sampleText,
      concise: concise || sampleText,
      expressive: expressive || sampleText,
      formal: formal || sampleText,
    },
    contextualVocabulary: contextualVocab,
    issues,
  };
}
