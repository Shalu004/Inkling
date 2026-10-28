import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverDb } from "@/lib/server/db";
import {
  verifyPassword,
  createSession,
  attachSessionCookie,
  sanitizeUser,
  checkRateLimit,
} from "@/lib/server/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(req: NextRequest) {
  // Rate limiting by client IP
  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(`login-${clientIp}`, 10, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Too many sign-in attempts. Please try again in a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Retrieve user by email
    const user = await serverDb.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password with timingSafeEqual
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create session
    const userAgent = req.headers.get("user-agent") || undefined;
    const sessionToken = await createSession(user.id, userAgent);

    const response = NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      message: "Welcome back to your sanctuary.",
    });

    attachSessionCookie(response, sessionToken);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}
