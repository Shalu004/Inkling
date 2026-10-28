import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { serverDb, StoredUser } from "./db";
import { UserAccount } from "@/types";

export const SESSION_COOKIE_NAME = "inkling_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ================= PASSWORD HASHING =================
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    const keyBuf = Buffer.from(key, "hex");
    const derivedBuf = Buffer.from(derived, "hex");
    if (keyBuf.length !== derivedBuf.length) return false;
    return crypto.timingSafeEqual(keyBuf, derivedBuf);
  } catch {
    return false;
  }
}

// Strip passwordHash before sending to client
export function sanitizeUser(user: StoredUser): UserAccount {
  const { passwordHash, ...safe } = user;
  return safe;
}

// ================= RATE LIMITING =================
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // Allowed
  }

  if (entry.count >= maxAttempts) {
    return false; // Rate limited
  }

  entry.count += 1;
  return true; // Allowed
}

// ================= SESSIONS & COOKIES =================
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function createSession(userId: string, userAgent?: string): Promise<string> {
  const token = generateSecureToken(32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();

  await serverDb.createSession({
    id: token,
    userId,
    createdAt: now.toISOString(),
    expiresAt,
    userAgent,
  });

  return token;
}

export function attachSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

export function removeSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Extract authenticated user from request cookie
export async function getSessionUser(req: NextRequest): Promise<UserAccount | null> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;

  const session = await serverDb.getSession(cookie.value);
  if (!session) return null;

  const user = await serverDb.getUserById(session.userId);
  if (!user) return null;

  return sanitizeUser(user);
}

// Enforce authentication on protected API endpoints
export async function requireAuth(req: NextRequest): Promise<{ user: UserAccount } | { response: NextResponse }> {
  const user = await getSessionUser(req);
  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to access your sanctuary." },
        { status: 401 }
      ),
    };
  }
  return { user };
}

// ================= PASSWORD RESET TOKENS =================
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await serverDb.createResetToken({
    token,
    userId,
    expiresAt,
    used: false,
    createdAt: new Date().toISOString(),
  });

  return token;
}
