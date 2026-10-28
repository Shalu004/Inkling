import { CompanionSuggestion, CompanionAnalysisResult, WritingCompanionAction } from "@/types";

const GEMINI_MODEL = process.env.INKLING_AI_MODEL || "gemini-1.5-flash";

interface CompanionEngineInput {
  action: WritingCompanionAction;
  title: string;
  content: string;
  documentType?: string;
  hasConsent?: boolean;
}

/**
 * Main Companion analysis dispatcher.
 * Uses Gemini API if configured & consented, or falls back to our robust linguistic engine.
 */
export async function analyzeWithCompanion({
  action,
  title,
  content,
  documentType,
  hasConsent = true,
}: CompanionEngineInput): Promise<CompanionAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && hasConsent) {
    try {
      const result = await callGeminiCompanion(action, title, content, documentType, apiKey);
      return result;
    } catch (err) {
      console.warn("Gemini companion call failed, falling back to linguistic engine:", err);
    }
  }

  // Fallback to offline pedagogical linguistic engine
  return runLinguisticAnalysis(action, title, content);
}

/**
 * Server-side Gemini API call for Writing Companion
 */
async function callGeminiCompanion(
  action: WritingCompanionAction,
  title: string,
  content: string,
  documentType: string | undefined,
  apiKey: string
): Promise<CompanionAnalysisResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const actionInstructions: Record<WritingCompanionAction, string> = {
    check_all: "Perform a thorough linguistic and editorial review. Catch genuine grammar/spelling errors, awkward phrasing, word choices, and flow without flattening personal voice.",
    fix_grammar: "Focus strictly on objective grammar, spelling, capitalization, punctuation, subject-verb agreement, and tense consistency. Ignore stylistic choices.",
    improve_flow: "Focus on rhythm, cadence, transition between thoughts, run-on sentences, and readability. Do not turn plain prose into flowery language.",
    find_better_words: "Identify vague, generic, or overly repeated words and suggest precise, evocative, or literary alternatives that fit the context.",
    explain_mistake: "Find grammatical or structural issues in the text and provide deeply clear, pedagogical explanations of the underlying linguistic rules.",
    review_entry: "Act as a thoughtful, sensitive literary editor. Summarize the piece's strengths, emotional tone, and 2-3 constructive opportunities for development.",
  };

  const systemInstruction = `You are Inkling's Writing Companion — a thoughtful, discreet literary editor sitting beside a writer in a quiet sanctuary.
Rules:
- Respect the writer's authentic voice, emotional tone, and creative intent.
- Do NOT mistake intentional sentence fragments, poetic license, dialogue, or conversational diary cadence for grammatical errors.
- Never grade or assign school-style numerical marks to personal writing.
- For every suggestion, identify the exact substring in the text ("originalText") so it can be replaced cleanly.
- Output ONLY valid JSON adhering strictly to the required schema.`;

  const prompt = `Analyze this writing piece for the action "${action}":
Action Goal: ${actionInstructions[action]}
Title: "${title}"
Document Type: ${documentType || "general_writing"}
Content:
"""
${content}
"""

Return a JSON object in this exact format:
{
  "summary": "1-2 sentence warm, encouraging editorial observation",
  "suggestions": [
    {
      "id": "sug-1",
      "originalText": "exact word or phrase from text",
      "suggestedCorrection": "replacement text",
      "category": "grammar" | "spelling" | "punctuation" | "tense" | "clarity" | "word_choice" | "redundancy" | "style",
      "explanation": "Clear, constructive explanation why this refinement elevates the piece",
      "isStylistic": boolean,
      "alternatives": ["alternative 1", "alternative 2"],
      "confidence": "high" | "moderate" | "creative_choice"
    }
  ]
}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) {
    throw new Error(`Gemini companion responded with HTTP ${res.status}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from AI companion");

  const parsed = JSON.parse(rawText);

  // Attach start and end indices by locating substrings safely
  const suggestions: CompanionSuggestion[] = (parsed.suggestions || []).map(
    (s: any, idx: number) => {
      const orig = s.originalText || "";
      const pos = orig ? content.indexOf(orig) : -1;
      return {
        id: s.id || `sug-${Date.now()}-${idx}`,
        originalText: orig,
        startIndex: pos >= 0 ? pos : undefined,
        endIndex: pos >= 0 ? pos + orig.length : undefined,
        suggestedCorrection: s.suggestedCorrection || orig,
        category: s.category || "style",
        explanation: s.explanation || "Editorial recommendation.",
        isStylistic: Boolean(s.isStylistic),
        alternatives: s.alternatives || [],
        confidence: s.confidence || "high",
        status: "pending",
      };
    }
  );

  return {
    action,
    summary: parsed.summary || "Editorial analysis complete.",
    suggestions,
    provider: "gemini",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Intelligent pedagogical offline rule engine.
 * Never invents fake errors; detects genuine spelling, grammar, redundancy, and flow opportunities.
 */
export function runLinguisticAnalysis(
  action: WritingCompanionAction,
  title: string,
  content: string
): CompanionAnalysisResult {
  const suggestions: CompanionSuggestion[] = [];
  const text = content;

  // 1. Common English Spelling Confusions & Typos
  const SPELLING_PATTERNS = [
    { regex: /\b(conceted)\b/gi, fix: "conceited", exp: "Spelling error: 'conceited' is spelled with 'ei' after 'c'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(definately|definitly)\b/gi, fix: "definitely", exp: "Common spelling mistake: spelled 'definitely'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(seperate)\b/gi, fix: "separate", exp: "Common misspelling: remember 'there is a rat in separate'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(occured)\b/gi, fix: "occurred", exp: "Double 'r' needed in past tense 'occurred'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(untill)\b/gi, fix: "until", exp: "'Until' has a single 'l'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(alot)\b/gi, fix: "a lot", exp: "'A lot' should be written as two words.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(truely)\b/gi, fix: "truly", exp: "Drop the 'e' when adding '-ly' to 'true'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(goverment)\b/gi, fix: "government", exp: "Include the 'n' in 'government'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(recieved)\b/gi, fix: "received", exp: "'i' before 'e' except after 'c': received.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(beleive)\b/gi, fix: "believe", exp: "'i' before 'e': believe.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(calender)\b/gi, fix: "calendar", exp: "'Calendar' ends with '-ar'.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(neccessary|necesary)\b/gi, fix: "necessary", exp: "One 'c', double 's': necessary.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(wierd)\b/gi, fix: "weird", exp: "'Weird' is an exception to the 'i before e' rule.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(accomodate)\b/gi, fix: "accommodate", exp: "Double 'c' and double 'm': accommodate.", cat: "spelling" as const, stylistic: false },
    { regex: /\b(embarass)\b/gi, fix: "embarrass", exp: "Double 'r' and double 's': embarrass.", cat: "spelling" as const, stylistic: false },
  ];

  // 2. Grammar & Agreement Patterns
  const GRAMMAR_PATTERNS = [
    { regex: /\b(they was)\b/gi, fix: "they were", exp: "Subject-verb agreement: plural pronoun 'they' takes 'were'.", cat: "subject_verb_agreement" as const, stylistic: false },
    { regex: /\b(we was)\b/gi, fix: "we were", exp: "Subject-verb agreement: plural pronoun 'we' takes 'were'.", cat: "subject_verb_agreement" as const, stylistic: false },
    { regex: /\b(you was)\b/gi, fix: "you were", exp: "Subject-verb agreement: 'you' always pairs with 'were'.", cat: "subject_verb_agreement" as const, stylistic: false },
    { regex: /\b(could of)\b/gi, fix: "could have", exp: "Modal verb: write 'could have' rather than 'could of'.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(should of)\b/gi, fix: "should have", exp: "Modal verb: write 'should have' rather than 'should of'.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(would of)\b/gi, fix: "would have", exp: "Modal verb: write 'would have' rather than 'would of'.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(more better)\b/gi, fix: "better", exp: "Double comparative: 'better' is already comparative.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(most best)\b/gi, fix: "best", exp: "Double superlative: 'best' is already superlative.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(irregardless)\b/gi, fix: "regardless", exp: "Standard usage prefers 'regardless'.", cat: "word_choice" as const, stylistic: false },
    { regex: /\b(their is)\b/gi, fix: "there is", exp: "Homophone confusion: 'there' indicates existence.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(there book|there house)\b/gi, fix: "their $1", exp: "Possessive 'their' indicates ownership.", cat: "grammar" as const, stylistic: false },
    { regex: /\b(your welcome)\b/gi, fix: "you're welcome", exp: "Contraction 'you're' stands for 'you are welcome'.", cat: "grammar" as const, stylistic: false },
  ];

  // 3. Flow & Redundancy Patterns
  const FLOW_PATTERNS = [
    { regex: /\b(at this point in time)\b/gi, fix: "currently", exp: "Wordy phrasing: 'currently' or 'now' tightens prose without losing meaning.", cat: "redundancy" as const, stylistic: true },
    { regex: /\b(in order to)\b/gi, fix: "to", exp: "Streamlined syntax: 'to' accomplishes the same purpose with greater elegance.", cat: "clarity" as const, stylistic: true },
    { regex: /\b(due to the fact that)\b/gi, fix: "because", exp: "Simpler connective: 'because' creates a cleaner and more direct clause.", cat: "clarity" as const, stylistic: true },
    { regex: /\b(very unique)\b/gi, fix: "unique", exp: "'Unique' is an absolute state; it does not take degree modifiers like 'very'.", cat: "word_choice" as const, stylistic: true },
    { regex: /\b(first and foremost)\b/gi, fix: "first", exp: "Tautology: 'first' carries the complete intent cleanly.", cat: "redundancy" as const, stylistic: true },
    { regex: /\b(past history)\b/gi, fix: "history", exp: "Redundant modifier: all history is past.", cat: "redundancy" as const, stylistic: true },
    { regex: /\b(future plans)\b/gi, fix: "plans", exp: "Redundant modifier: plans are inherently future-oriented.", cat: "redundancy" as const, stylistic: true },
    { regex: /\b(completely full)\b/gi, fix: "full", exp: "Redundant modifier: 'full' already conveys completeness.", cat: "redundancy" as const, stylistic: true },
    { regex: /\b(end result)\b/gi, fix: "result", exp: "Redundant modifier: a result is by definition at the end.", cat: "redundancy" as const, stylistic: true },
  ];

  // 4. Literary Vocabulary Elevation Patterns
  const VOCAB_PATTERNS = [
    { regex: /\b(very good)\b/gi, fix: "exceptional", alternatives: ["superb", "exquisite", "admirable"], exp: "Elevated diction: replace 'very good' with a more evocative adjective.", cat: "word_choice" as const, stylistic: true },
    { regex: /\b(very bad)\b/gi, fix: "grievous", alternatives: ["adverse", "dire", "regrettable"], exp: "Evocative diction: choose a word that paints the specific shade of adversity.", cat: "word_choice" as const, stylistic: true },
    { regex: /\b(very beautiful)\b/gi, fix: "luminous", alternatives: ["breathtaking", "resplendent", "arresting"], exp: "Visual precision: 'luminous' or 'resplendent' carries stronger sensory resonance.", cat: "word_choice" as const, stylistic: true },
    { regex: /\b(very quiet)\b/gi, fix: "hushed", alternatives: ["serene", "tranquil", "still"], exp: "Atmospheric texture: 'hushed' evokes a physical sense of quietness.", cat: "word_choice" as const, stylistic: true },
    { regex: /\b(a lot of thoughts)\b/gi, fix: "a flurry of thoughts", alternatives: ["a myriad of thoughts", "swirling reflections"], exp: "Imagery: give abstract thoughts texture and motion.", cat: "style" as const, stylistic: true },
    { regex: /\b(nice weather)\b/gi, fix: "balmy weather", alternatives: ["clement weather", "radiant sky"], exp: "Sensory specificity: describe the warmth or light directly.", cat: "word_choice" as const, stylistic: true },
  ];

  let idCounter = 1;

  // Filter pattern sets based on action
  if (action === "fix_grammar" || action === "check_all") {
    SPELLING_PATTERNS.forEach(({ regex, fix, exp, cat, stylistic }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          id: `sug-${idCounter++}`,
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          suggestedCorrection: fix,
          category: cat,
          explanation: exp,
          isStylistic: stylistic,
          alternatives: [fix],
          confidence: "high",
          status: "pending",
        });
      }
    });

    GRAMMAR_PATTERNS.forEach(({ regex, fix, exp, cat, stylistic }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          id: `sug-${idCounter++}`,
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          suggestedCorrection: fix,
          category: cat,
          explanation: exp,
          isStylistic: stylistic,
          alternatives: [fix],
          confidence: "high",
          status: "pending",
        });
      }
    });
  }

  if (action === "improve_flow" || action === "check_all") {
    FLOW_PATTERNS.forEach(({ regex, fix, exp, cat, stylistic }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          id: `sug-${idCounter++}`,
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          suggestedCorrection: fix,
          category: cat,
          explanation: exp,
          isStylistic: stylistic,
          alternatives: [fix],
          confidence: "moderate",
          status: "pending",
        });
      }
    });

    // Check long run-on sentences (> 45 words without punctuation)
    const sentences = text.split(/(?<=[.!?])\s+/);
    sentences.forEach((sentence) => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 45 && !sentence.includes(";") && !sentence.includes("—")) {
        const idx = text.indexOf(sentence);
        suggestions.push({
          id: `sug-${idCounter++}`,
          originalText: sentence.slice(0, 50) + "...",
          startIndex: idx >= 0 ? idx : undefined,
          endIndex: idx >= 0 ? idx + sentence.length : undefined,
          suggestedCorrection: "Consider dividing this into two graceful sentences.",
          category: "style",
          explanation: `This passage runs for ${words.length} words. Introducing an em-dash, semicolon, or period gives the reader space to breathe.`,
          isStylistic: true,
          confidence: "creative_choice",
          status: "pending",
        });
      }
    });
  }

  if (action === "find_better_words" || action === "check_all") {
    VOCAB_PATTERNS.forEach(({ regex, fix, alternatives, exp, cat, stylistic }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          id: `sug-${idCounter++}`,
          originalText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          suggestedCorrection: fix,
          category: cat,
          explanation: exp,
          isStylistic: stylistic,
          alternatives: alternatives || [fix],
          confidence: "creative_choice",
          status: "pending",
        });
      }
    });
  }

  // Summary generation based on findings
  let summary = "";
  if (suggestions.length === 0) {
    if (action === "fix_grammar") {
      summary = "No grammatical, spelling, or punctuation errors detected. Your syntax is clear and disciplined.";
    } else if (action === "improve_flow") {
      summary = "Your sentence transitions and rhythm flow smoothly with natural literary cadence.";
    } else if (action === "find_better_words") {
      summary = "Your vocabulary choices are well-calibrated and evocative for this piece.";
    } else {
      summary = "Your writing reads cleanly and holds a quiet, confident voice. No immediate corrections required.";
    }
  } else {
    const errorCount = suggestions.filter((s) => !s.isStylistic).length;
    const styleCount = suggestions.filter((s) => s.isStylistic).length;
    summary = `Identified ${suggestions.length} observation${suggestions.length > 1 ? "s" : ""}${
      errorCount > 0 ? ` (${errorCount} correction${errorCount > 1 ? "s" : ""})` : ""
    }${styleCount > 0 ? ` (${styleCount} stylistic suggestion${styleCount > 1 ? "s" : ""})` : ""}. Review individually or preview together.`;
  }

  return {
    action,
    summary,
    suggestions,
    provider: "heuristic_engine",
    timestamp: new Date().toISOString(),
  };
}
