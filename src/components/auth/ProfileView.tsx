"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  User,
  Mail,
  Calendar,
  Shield,
  UploadCloud,
  Download,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  Save,
  ArrowRight,
  BookHeart,
  ListTodo,
  Sprout,
  Library,
  PenTool,
} from "lucide-react";

export function ProfileView() {
  const router = useRouter();
  const {
    user,
    loading,
    logout,
    updateProfile,
    deleteAccount,
    importLocalData,
    syncWithCloud,
    syncStatus,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<Record<string, number> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with user when loaded
  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-6 animate-pulse">
        <div className="h-24 bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-warm)]" />
        <div className="h-64 bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-warm)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--bg-paper)] border border-[var(--border-warm)] flex items-center justify-center text-[var(--text-muted)]">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-literary text-2xl font-semibold text-[var(--text-main)]">
            Account Sanctuary
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
            You are currently browsing Inkling as a guest. Sign in to synchronize your reflections across devices and safeguard your words in private cloud storage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-warm)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const res = await updateProfile({ displayName, bio });
    if (!res.success) {
      setStatusMsg({ type: "error", text: res.error || "Failed to update profile." });
    } else {
      setStatusMsg({ type: "success", text: "Profile details saved." });
      setIsEditing(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleImportLocal = async () => {
    setIsImporting(true);
    setStatusMsg(null);
    setImportReport(null);
    try {
      const res = await importLocalData();
      if (!res.success) {
        setStatusMsg({ type: "error", text: res.error || "Import failed." });
      } else {
        setStatusMsg({
          type: "success",
          text: "Local browser entries and sanctuary records imported into your account.",
        });
        setImportReport(res.counts || null);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [journal, docs, plans, vocab, lib] = await Promise.all([
        fetch("/api/journal").then((r) => r.json()),
        fetch("/api/documents").then((r) => r.json()),
        fetch("/api/plans").then((r) => r.json()),
        fetch("/api/vocabulary").then((r) => r.json()),
        fetch("/api/library").then((r) => r.json()),
      ]);

      const bundle = {
        exportDate: new Date().toISOString(),
        user: { id: user.id, email: user.email, displayName: user.displayName },
        data: {
          journal: journal.entries || [],
          documents: docs.documents || [],
          plans: plans.plans || [],
          vocabulary: vocab.vocabulary || [],
          library: lib.library || [],
        },
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inkling-sanctuary-${user.displayName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setStatusMsg({ type: "error", text: "Failed to compile export." });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    const res = await deleteAccount();
    if (!res.success) {
      setStatusMsg({ type: "error", text: res.error || "Failed to delete account." });
      setIsDeleting(false);
    } else {
      router.push("/");
    }
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="border-b border-[var(--border-warm)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-sage)] flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5" /> Sanctuary Citizen
          </span>
          <h1 className="font-literary text-3xl font-semibold text-[var(--text-main)]">
            Account & Profile
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Personal identity, cloud synchronization, and data sovereignty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => syncWithCloud()}
            disabled={syncStatus === "syncing"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-warm)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            <span>{syncStatus === "syncing" ? "Syncing..." : "Sync Now"}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-burgundy)]/10 text-[var(--accent-burgundy)] text-xs font-medium hover:bg-[var(--accent-burgundy)]/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMsg && (
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs animate-fade-in ${
            statusMsg.type === "success"
              ? "bg-[var(--bg-botanical-light)] border border-[var(--accent-sage)]/30 text-[var(--accent-olive)]"
              : "bg-[var(--accent-burgundy)]/10 border border-[var(--accent-burgundy)]/25 text-[var(--accent-burgundy)]"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{statusMsg.text}</div>
        </div>
      )}

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-warm)]/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--bg-botanical-light)] text-[var(--accent-sage)] font-literary text-2xl font-bold flex items-center justify-center border border-[var(--accent-sage)]/20">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-literary text-xl font-semibold text-[var(--text-main)]">
                {user.displayName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-warm)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                Display Name / Pen Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                Author Reflection / Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A quiet note on your writing journey or reading interests..."
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] text-xs text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-sage)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Member Since
              </span>
              <p className="text-[var(--text-main)] font-medium">{formattedDate}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3" /> Space Isolation
              </span>
              <p className="text-[var(--accent-olive)] font-medium">Server Row-Level Isolated</p>
            </div>

            {user.bio && (
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
                  Author Bio
                </span>
                <p className="text-[var(--text-main)] italic leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Sovereignty & Synchronization Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-warm)] shadow-xs space-y-5">
        <div>
          <h3 className="font-literary text-lg font-semibold text-[var(--text-main)]">
            Data Sovereignty & Local Migration
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            You maintain full ownership of all words written within Inkling.
          </p>
        </div>

        {importReport && (
          <div className="p-4 rounded-xl bg-[var(--bg-botanical-light)] border border-[var(--accent-sage)]/30 text-xs text-[var(--text-main)] space-y-2 animate-fade-in">
            <div className="font-semibold text-[var(--accent-olive)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Migration Completed Successfully</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1">
              <div className="p-2 rounded bg-[var(--bg-paper)] border border-[var(--border-warm)]">
                <div className="font-bold text-[var(--accent-sage)]">{importReport.journal || 0}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Journal</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-paper)] border border-[var(--border-warm)]">
                <div className="font-bold text-[var(--accent-sage)]">{importReport.documents || 0}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Drafts</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-paper)] border border-[var(--border-warm)]">
                <div className="font-bold text-[var(--accent-sage)]">{importReport.plans || 0}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Plans</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-paper)] border border-[var(--border-warm)]">
                <div className="font-bold text-[var(--accent-sage)]">{importReport.vocabulary || 0}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Words</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-paper)] border border-[var(--border-warm)]">
                <div className="font-bold text-[var(--accent-sage)]">{importReport.library || 0}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Books</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Import Local Data */}
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-semibold text-xs text-[var(--text-main)]">
                <UploadCloud className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Import Local Data to Cloud</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                If you previously wrote offline or as a guest in this browser, copy those records safely into your authenticated cloud sanctuary.
              </p>
            </div>
            <button
              type="button"
              onClick={handleImportLocal}
              disabled={isImporting}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-sage)] text-[#FFFCF5] text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-all shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isImporting ? "Importing..." : "Import Browser Data"}</span>
            </button>
          </div>

          {/* Export Sanctuary Data */}
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-warm)] flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-semibold text-xs text-[var(--text-main)]">
                <Download className="w-4 h-4 text-[var(--accent-sage)]" />
                <span>Export Sanctuary Archive</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                Download a complete, uncompressed JSON archive of your journal, writings, vocabulary, reading list, and plans at any time.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-warm)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="p-6 rounded-2xl bg-[var(--bg-paper)] border border-[var(--accent-burgundy)]/30 space-y-4">
        <div>
          <h3 className="font-literary text-lg font-semibold text-[var(--accent-burgundy)] flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Danger Zone: Account Deletion</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
            Permanently erase your account, session tokens, and all private records from the sanctuary server. This action cannot be undone.
          </p>
        </div>

        {deleteConfirm ? (
          <div className="p-4 rounded-xl bg-[var(--accent-burgundy)]/10 border border-[var(--accent-burgundy)]/25 space-y-3">
            <p className="text-xs font-semibold text-[var(--accent-burgundy)]">
              Are you absolutely certain? All your journals, drafts, and records will be deleted immediately.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-[var(--accent-burgundy)] text-[#FFFCF5] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, permanently delete my account"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-warm)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-sage-surface)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--accent-burgundy)]/40 text-[var(--accent-burgundy)] text-xs font-semibold hover:bg-[var(--accent-burgundy)]/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account & Erase Cloud Records</span>
          </button>
        )}
      </div>
    </div>
  );
}
