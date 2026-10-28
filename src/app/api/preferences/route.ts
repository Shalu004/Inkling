import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
import { UserPreferences } from "@/types";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const preferences = await serverDb.getPreferences(auth.user.id);
    return NextResponse.json({ success: true, preferences });
  } catch (err) {
    console.error("Fetch preferences error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch preferences." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const body: UserPreferences = await req.json();
    const saved = await serverDb.savePreferences(auth.user.id, body);
    return NextResponse.json({ success: true, preferences: saved });
  } catch (err) {
    console.error("Save preferences error:", err);
    return NextResponse.json({ success: false, error: "Failed to save preferences." }, { status: 500 });
  }
}
