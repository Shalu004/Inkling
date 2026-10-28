import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    return NextResponse.json({
      success: true,
      authenticated: Boolean(user),
      user: user || null,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null,
    });
  }
}
