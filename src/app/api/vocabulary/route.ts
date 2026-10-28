import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { VocabularyEntry } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const vocabulary = await serverDb.getVocabulary(auth.user.id);
    return NextResponse.json({ success: true, vocabulary });
  } catch (err) {
    console.error("Fetch vocabulary error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch vocabulary." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const body: VocabularyEntry = await req.json();
    if (!body || !body.id || !body.word) {
      return NextResponse.json({ success: false, error: "Invalid vocabulary payload." }, { status: 400 });
    }

    const saved = await serverDb.saveVocabulary(auth.user.id, body);
    return NextResponse.json({ success: true, entry: saved });
  } catch (err) {
    console.error("Save vocabulary error:", err);
    return NextResponse.json({ success: false, error: "Failed to save vocabulary." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing vocabulary ID." }, { status: 400 });
  }

  try {
    await serverDb.deleteVocabulary(auth.user.id, id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Delete vocabulary error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete vocabulary." }, { status: 500 });
  }
}
