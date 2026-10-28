import { describe, it, expect } from "vitest";
import { CURATED_PROMPTS, CURATED_READINGS, MISTAKE_RULES_CATALOG } from "./data";

describe("Curated Literary Data & Resources", () => {
  it("contains curated writing prompts across diverse moods", () => {
    expect(CURATED_PROMPTS.length).toBeGreaterThanOrEqual(6);
    
    // Validate each prompt has required fields
    CURATED_PROMPTS.forEach((p) => {
      expect(p.id).toBeDefined();
      expect(p.title).toBeTruthy();
      expect(p.promptText).toBeTruthy();
      expect(p.mood).toBeDefined();
      expect(p.suggestedWordsMin).toBeGreaterThan(0);
      expect(p.suggestedWordsMax).toBeGreaterThan(p.suggestedWordsMin);
    });
  });

  it("contains curated reading resources with verified URLs and comprehension checks", () => {
    expect(CURATED_READINGS.length).toBeGreaterThanOrEqual(3);

    CURATED_READINGS.forEach((r) => {
      expect(r.id).toBeDefined();
      expect(r.title).toBeTruthy();
      expect(r.author).toBeTruthy();
      expect(r.sourceUrl).toMatch(/^https?:\/\//);
      expect(r.excerpt).toBeTruthy();
      expect(r.fullText).toBeTruthy();
      expect(r.comprehensionQuestions.length).toBeGreaterThan(0);

      r.comprehensionQuestions.forEach((q) => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(q.options.length);
        expect(q.explanation).toBeTruthy();
      });
    });
  });

  it("provides comprehensive linguistic rules in MISTAKE_RULES_CATALOG", () => {
    const categories = Object.keys(MISTAKE_RULES_CATALOG);
    expect(categories).toContain("grammar");
    expect(categories).toContain("tense");
    expect(categories).toContain("subject_verb_agreement");
    expect(categories).toContain("clarity");
    expect(categories).toContain("punctuation");

    (categories as (keyof typeof MISTAKE_RULES_CATALOG)[]).forEach((cat) => {
      const entry = MISTAKE_RULES_CATALOG[cat];
      expect(entry.label).toBeTruthy();
      expect(entry.explanation).toBeTruthy();
      expect(entry.rule).toBeTruthy();
    });
  });
});
