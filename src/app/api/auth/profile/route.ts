import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { serverDb } from "@/lib/server/db";
import {
  requireAuth,
  sanitizeUser,
  hashPassword,
  verifyPassword,
  removeSessionCookie,
} from "@/lib/server/auth";

const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Name cannot be empty.").max(60).optional(),
  bio: z.string().max(250).optional(),
  avatarUrl: z.string().url().or(z.literal("")).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters.").optional(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;
  const user = auth.user;

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { displayName, bio, avatarUrl, currentPassword, newPassword } = parsed.data;
    const storedUser = await serverDb.getUserById(user.id);
    if (!storedUser) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Please provide your current password to set a new one." },
          { status: 400 }
        );
      }
      const isCurrentValid = verifyPassword(currentPassword, storedUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }
      updates.passwordHash = hashPassword(newPassword);
    }

    const updated = await serverDb.updateUser(user.id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Update failed." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUser(updated),
      message: "Profile updated successfully.",
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ success: false, error: "Failed to update profile." }, { status: 500 });
  }
}

// Account Deletion
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;
  const user = auth.user;

  try {
    await serverDb.deleteUser(user.id);
    const response = NextResponse.json({
      success: true,
      message: "Your sanctuary account and records have been completely erased.",
    });
    removeSessionCookie(response);
    return response;
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete account." }, { status: 500 });
  }
}
