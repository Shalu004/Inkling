import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { SESSION_COOKIE_NAME, removeSessionCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      await serverDb.deleteSession(token);
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "You have peacefully left your sanctuary.",
  });

  removeSessionCookie(response);
  return response;
}
