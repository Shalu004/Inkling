"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserAccount, AuthResponse } from "@/types";
import { hybridStore } from "@/lib/store/hybridStore";

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; bio?: string }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; resetToken?: string; message?: string; error?: string }>;
  resetPassword: (password: string, token: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  importLocalData: () => Promise<{ success: boolean; counts?: Record<string, number>; error?: string }>;
  refreshUser: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  const syncWithCloud = useCallback(async () => {
    if (!user) return;
    try {
      setSyncStatus("syncing");
      
      // Fetch user data from server API in parallel
      const [journalRes, docsRes, plansRes, vocabRes, libRes, prefsRes] = await Promise.all([
        fetch("/api/journal").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/documents").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/plans").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/vocabulary").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/library").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/preferences").then((r) => (r.ok ? r.json() : null)),
      ]);

      // If user has cloud records, hydrate the local client storage safely
      if (journalRes && Array.isArray(journalRes.entries)) {
        hybridStore.hydrateJournalEntries(journalRes.entries);
      }
      if (plansRes && Array.isArray(plansRes.plans)) {
        hybridStore.hydratePlans(plansRes.plans);
      }
      if (vocabRes && Array.isArray(vocabRes.vocabulary)) {
        hybridStore.hydrateVocabulary(vocabRes.vocabulary);
      }
      if (libRes && Array.isArray(libRes.library)) {
        hybridStore.hydrateLibrary(libRes.library);
      }
      if (prefsRes && prefsRes.preferences) {
        hybridStore.savePreferences(prefsRes.preferences);
      }

      setSyncStatus("synced");
    } catch (err) {
      console.error("Cloud sync error:", err);
      setSyncStatus("error");
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      syncWithCloud();
    }
  }, [user, syncWithCloud]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = data.error || "Failed to sign in. Please verify your credentials.";
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      if (data.user) {
        setUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || "An unexpected error occurred during login.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data: AuthResponse = await res.json();
      if (!res.ok || !data.success) {
        const errMsg = data.error || "Failed to create account.";
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      if (data.user) {
        setUser(data.user);
      }
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || "An unexpected error occurred during registration.";
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setUser(null);
      setSyncStatus("idle");
    }
  };

  const updateProfile = async (data: { displayName?: string; bio?: string }) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Failed to update profile" };
      }
      if (result.user) {
        setUser(result.user);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Profile update error" };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || "Could not process request." };
      }
      return {
        success: true,
        resetToken: result.resetToken,
        message: result.message,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "Forgot password error" };
    }
  };

  const resetPassword = async (password: string, token: string) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Failed to reset password." };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Reset password error" };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch("/api/auth/profile", { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Failed to delete account." };
      }
      setUser(null);
      hybridStore.clearAllUserData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Account deletion error" };
    }
  };

  const importLocalData = async () => {
    if (!user) {
      return { success: false, error: "Must be signed in to import data into your account." };
    }
    try {
      const payload = hybridStore.exportAllLocalData();
      const res = await fetch("/api/sync/import-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Import failed" };
      }
      await syncWithCloud();
      return { success: true, counts: result.importedCounts };
    } catch (err: any) {
      return { success: false, error: err?.message || "Import error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        deleteAccount,
        importLocalData,
        refreshUser,
        syncWithCloud,
        syncStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
