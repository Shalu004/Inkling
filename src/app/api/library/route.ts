import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { BookItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const books = await serverDb.getBooks(auth.user.id);
    return NextResponse.json({ success: true, books });
  } catch (err) {
    console.error("Fetch books error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch library." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const body: BookItem = await req.json();
    if (!body || !body.id || !body.title) {
      return NextResponse.json({ success: false, error: "Invalid book payload." }, { status: 400 });
    }

    const saved = await serverDb.saveBook(auth.user.id, body);
    return NextResponse.json({ success: true, book: saved });
  } catch (err) {
    console.error("Save book error:", err);
    return NextResponse.json({ success: false, error: "Failed to save book." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing book ID." }, { status: 400 });
  }

  try {
    await serverDb.deleteBook(auth.user.id, id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Delete book error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete book." }, { status: 500 });
  }
}
