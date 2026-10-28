import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { JournalEntry } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const entries = await serverDb.getJournalEntries(auth.user.id);
    return NextResponse.json({ success: true, entries });
  } catch (err) {
    console.error("Fetch journal error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch entries." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const body: JournalEntry = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ success: false, error: "Invalid entry payload." }, { status: 400 });
    }

    const saved = await serverDb.saveJournalEntry(auth.user.id, body);
    return NextResponse.json({ success: true, entry: saved });
  } catch (err) {
    console.error("Save journal error:", err);
    return NextResponse.json({ success: false, error: "Failed to save entry." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing entry ID." }, { status: 400 });
  }

  try {
    await serverDb.deleteJournalEntry(auth.user.id, id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Delete journal error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete entry." }, { status: 500 });
  }
}
