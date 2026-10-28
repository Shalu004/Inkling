import { describe, it, expect } from "vitest";
import { analyzeWritingHeuristically } from "./provider";
import { aiReviewResponseSchema } from "./schemas";

describe("AI Writing Coach Provider", () => {
  it("produces schema-compliant pedagogical analysis for writing", () => {
    const sampleText =
      "In order to understand solitude, we must look closely. Due to the fact that people are always busy, there is a very interesting sensation when quiet arrives.";

    const review = analyzeWritingHeuristically({
      title: "Thoughts on Solitude",
      content: sampleText,
      format: "reflective_essay",
      mood: "reflective",
    });

    // Verify schema validation passes with Zod
    const parsed = aiReviewResponseSchema.safeParse(review);
    expect(parsed.success).toBe(true);

    // Verify issues identified
    expect(review.issues.length).toBeGreaterThan(0);
    const hasClarityIssue = review.issues.some((i) => i.category === "clarity");
    expect(hasClarityIssue).toBe(true);

    // Verify 4 rewrite variations exist
    expect(review.rewrites.natural).toBeDefined();
    expect(review.rewrites.concise).toBeDefined();
    expect(review.rewrites.expressive).toBeDefined();
    expect(review.rewrites.formal).toBeDefined();

    // Verify educational strengths & exercise
    expect(review.overallStrengths.length).toBeGreaterThanOrEqual(1);
    expect(review.recommendedExercise.title).toBeDefined();
    expect(review.contextualVocabulary.length).toBeGreaterThanOrEqual(1);
  });
});
