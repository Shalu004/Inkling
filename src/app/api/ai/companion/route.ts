import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeWithCompanion } from "@/lib/ai/companionEngine";

const companionRequestSchema = z.object({
  action: z.enum([
    "check_all",
    "fix_grammar",
    "improve_flow",
    "find_better_words",
    "explain_mistake",
    "review_entry",
  ]),
  title: z.string().default("Untitled"),
  content: z.string().min(1, "Please provide content to analyze."),
  documentType: z.string().optional(),
  hasConsent: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = companionRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Protect against huge payloads
    if (parsed.data.content.length > 50000) {
      return NextResponse.json(
        { error: "Content exceeds maximum length of 50,000 characters for analysis." },
        { status: 413 }
      );
    }

    const result = await analyzeWithCompanion({
      action: parsed.data.action,
      title: parsed.data.title,
      content: parsed.data.content,
      documentType: parsed.data.documentType,
      hasConsent: parsed.data.hasConsent,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("Writing Companion error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to analyze writing",
      },
      { status: 500 }
    );
  }
}
