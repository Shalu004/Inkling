import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { serverDb } from "@/lib/server/db";
import {
  hashPassword,
  createSession,
  attachSessionCookie,
  sanitizeUser,
  checkRateLimit,
} from "@/lib/server/auth";

const registerSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(100, "Password is too long."),
  displayName: z
    .string()
    .trim()
    .min(1, "Please provide your name or pen name.")
    .max(60, "Name is too long."),
});

export async function POST(req: NextRequest) {
  // Rate limiting by client IP
  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(`register-${clientIp}`, 10, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Too many registration attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, displayName } = parsed.data;

    // Check if user already exists
    const existing = await serverDb.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Create user
    const now = new Date().toISOString();
    const userId = `usr_${crypto.randomBytes(12).toString("hex")}`;
    const passwordHash = hashPassword(password);

    const newUser = await serverDb.createUser({
      id: userId,
      email: email.toLowerCase(),
      displayName,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    // Create session and set cookie
    const userAgent = req.headers.get("user-agent") || undefined;
    const sessionToken = await createSession(newUser.id, userAgent);

    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(newUser),
      message: "Welcome to your Inkling sanctuary.",
    });

    attachSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}
