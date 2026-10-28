import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import { LittlePlanTask } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const plans = await serverDb.getPlans(auth.user.id);
    return NextResponse.json({ success: true, plans });
  } catch (err) {
    console.error("Fetch plans error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch plans." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  try {
    const body: LittlePlanTask = await req.json();
    if (!body || !body.id || !body.title) {
      return NextResponse.json({ success: false, error: "Invalid task payload." }, { status: 400 });
    }

    const saved = await serverDb.savePlan(auth.user.id, body);
    return NextResponse.json({ success: true, plan: saved });
  } catch (err) {
    console.error("Save plan error:", err);
    return NextResponse.json({ success: false, error: "Failed to save plan." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing plan ID." }, { status: 400 });
  }

  try {
    await serverDb.deletePlan(auth.user.id, id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Delete plan error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete plan." }, { status: 500 });
  }
}
