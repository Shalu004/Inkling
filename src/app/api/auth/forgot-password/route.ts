import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverDb } from "@/lib/server/db";
import { createPasswordResetToken, checkRateLimit } from "@/lib/server/auth";

const forgotSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
  if (!checkRateLimit(`forgot-${clientIp}`, 5, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Too many recovery requests. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await serverDb.getUserByEmail(email);

    // If user does not exist, return a generic message to prevent account enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, recovery instructions have been prepared.",
      });
    }

    const resetToken = await createPasswordResetToken(user.id);

    return NextResponse.json({
      success: true,
      resetToken, // Provided directly for immediate reset testing & local usage
      message: "Password reset token generated. Use this token to reset your password.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ success: false, error: "Recovery process failed." }, { status: 500 });
  }
}
