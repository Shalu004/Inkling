import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverDb } from "@/lib/server/db";
import { hashPassword, checkRateLimit } from "@/lib/server/auth";

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(`reset-${clientIp}`, 10, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { token, newPassword } = parsed.data;

    const userId = await serverDb.verifyAndConsumeResetToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      );
    }

    // Update password
    const newHash = hashPassword(newPassword);
    await serverDb.updateUser(userId, { passwordHash: newHash });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. You may now sign in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ success: false, error: "Failed to reset password." }, { status: 500 });
  }
}
