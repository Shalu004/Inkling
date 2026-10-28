import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateWritingReview } from "@/lib/ai/provider";

const reviewRequestSchema = z.object({
  title: z.string().default("Untitled Reflection"),
  content: z.string().min(10, "Writing must be at least 10 characters long to review."),
  format: z.string().optional(),
  mood: z.string().optional(),
  promptText: z.string().optional(),
  tone: z.enum(["gentle", "supportive_rigorous", "academic"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = reviewRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { review, provider } = await generateWritingReview({
      title: parsed.data.title,
      content: parsed.data.content,
      format: parsed.data.format as any,
      mood: parsed.data.mood as any,
      promptText: parsed.data.promptText,
      tone: parsed.data.tone,
    });

    return NextResponse.json({
      success: true,
      provider,
      review,
    });
  } catch (error: any) {
    console.error("AI review route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate writing review",
      },
      { status: 500 }
    );
  }
}
