import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { WritingSession } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const documents = await serverDb.getDocuments(auth.user.id);
    return NextResponse.json({ success: true, documents });
  } catch (err) {
    console.error("Fetch documents error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch documents." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const body: WritingSession = await req.json();
    if (!body || !body.id) {
      return NextResponse.json({ success: false, error: "Invalid document payload." }, { status: 400 });
    }

    // Enforce user ownership
    body.userId = auth.user.id;
    const saved = await serverDb.saveDocument(auth.user.id, body);
    return NextResponse.json({ success: true, document: saved });
  } catch (err) {
    console.error("Save document error:", err);
    return NextResponse.json({ success: false, error: "Failed to save document." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing document ID." }, { status: 400 });
  }

  try {
    await serverDb.deleteDocument(auth.user.id, id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Delete document error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete document." }, { status: 500 });
  }
}
