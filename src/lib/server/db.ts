import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  UserAccount,
  JournalEntry,
  WritingSession,
  LittlePlanTask,
  VocabularyEntry,
  BookItem,
  UserPreferences,
} from "@/types";

const DB_ROOT = path.join(process.cwd(), ".sanctuary_db");
const DATA_DIR = path.join(DB_ROOT, "data");

export interface StoredUser extends UserAccount {
  passwordHash: string;
}

export interface StoredSession {
  id: string; // Token
  userId: string;
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
}

export interface StoredResetToken {
  token: string;
  userId: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// Ensure database root directories exist
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Ignore already exists
  }
}

// Atomic file read with fallback
async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Atomic file write using temporary swap file
async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempPath, filePath);
}

// User-specific data directory path
function getUserDataDir(userId: string): string {
  // Sanitize userId to prevent directory traversal
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(DATA_DIR, safeId);
}

export const serverDb = {
  // ================= USERS =================
  async getUsers(): Promise<StoredUser[]> {
    await ensureDir(DB_ROOT);
    return readJson<StoredUser[]>(path.join(DB_ROOT, "users.json"), []);
  },

  async getUserByEmail(email: string): Promise<StoredUser | null> {
    const users = await this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async getUserById(id: string): Promise<StoredUser | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  async createUser(
    user: Partial<StoredUser> & { email: string; displayName: string; passwordHash: string }
  ): Promise<StoredUser> {
    const existing = await this.getUserByEmail(user.email);
    if (existing) {
      throw new Error("An account with this email address already exists");
    }
    const now = new Date().toISOString();
    const fullUser: StoredUser = {
      id: user.id || `usr-${crypto.randomUUID()}`,
      email: user.email.trim().toLowerCase(),
      displayName: user.displayName.trim(),
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt || now,
      updatedAt: now,
    };
    const users = await this.getUsers();
    users.unshift(fullUser);
    await writeJson(path.join(DB_ROOT, "users.json"), users);
    // Initialize user directory
    await ensureDir(getUserDataDir(fullUser.id));
    return fullUser;
  },

  async updateUser(userId: string, updates: Partial<StoredUser>): Promise<StoredUser | null> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    users[idx] = {
      ...users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await writeJson(path.join(DB_ROOT, "users.json"), users);
    return users[idx];
  },

  async deleteUser(userId: string): Promise<boolean> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    await writeJson(path.join(DB_ROOT, "users.json"), filtered);

    // Delete active sessions
    const sessions = await this.getSessions();
    await writeJson(
      path.join(DB_ROOT, "sessions.json"),
      sessions.filter((s) => s.userId !== userId)
    );

    // Remove user data directory
    try {
      await fs.rm(getUserDataDir(userId), { recursive: true, force: true });
    } catch {}

    return true;
  },

  // ================= SESSIONS =================
  async getSessions(): Promise<StoredSession[]> {
    await ensureDir(DB_ROOT);
    return readJson<StoredSession[]>(path.join(DB_ROOT, "sessions.json"), []);
  },

  async getSession(token: string): Promise<StoredSession | null> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === token);
    if (!session) return null;
    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await this.deleteSession(token);
      return null;
    }
    return session;
  },

  async createSession(sessionOrUserId: StoredSession | string, maybeToken?: string): Promise<StoredSession> {
    let session: StoredSession;
    if (typeof sessionOrUserId === "string") {
      const token = maybeToken || crypto.randomBytes(32).toString("hex");
      const now = new Date();
      session = {
        id: token,
        userId: sessionOrUserId,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    } else {
      session = sessionOrUserId;
    }
    const sessions = await this.getSessions();
    sessions.unshift(session);
    await writeJson(path.join(DB_ROOT, "sessions.json"), sessions);
    return session;
  },

  async deleteSession(token: string): Promise<void> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter((s) => s.id !== token);
    await writeJson(path.join(DB_ROOT, "sessions.json"), filtered);
  },

  // ================= PASSWORD RESET TOKENS =================
  async getResetTokens(): Promise<StoredResetToken[]> {
    await ensureDir(DB_ROOT);
    return readJson<StoredResetToken[]>(path.join(DB_ROOT, "reset_tokens.json"), []);
  },

  async createResetToken(tokenOrUserId: StoredResetToken | string, maybeToken?: string): Promise<StoredResetToken> {
    let resetObj: StoredResetToken;
    if (typeof tokenOrUserId === "string") {
      const now = new Date();
      resetObj = {
        token: maybeToken || crypto.randomBytes(32).toString("hex"),
        userId: tokenOrUserId,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        used: false,
      };
    } else {
      resetObj = tokenOrUserId;
    }
    const tokens = await this.getResetTokens();
    tokens.unshift(resetObj);
    await writeJson(path.join(DB_ROOT, "reset_tokens.json"), tokens);
    return resetObj;
  },

  async getPasswordResetToken(token: string): Promise<StoredResetToken | null> {
    const tokens = await this.getResetTokens();
    const match = tokens.find((t) => t.token === token && !t.used);
    if (!match) return null;
    if (new Date(match.expiresAt).getTime() < Date.now()) return null;
    return match;
  },

  async deletePasswordResetToken(token: string): Promise<void> {
    const tokens = await this.getResetTokens();
    const filtered = tokens.filter((t) => t.token !== token);
    await writeJson(path.join(DB_ROOT, "reset_tokens.json"), filtered);
  },

  async verifyAndConsumeResetToken(token: string): Promise<string | null> {
    const tokens = await this.getResetTokens();
    const match = tokens.find((t) => t.token === token && !t.used);
    if (!match) return null;
    if (new Date(match.expiresAt).getTime() < Date.now()) return null;

    match.used = true;
    await writeJson(path.join(DB_ROOT, "reset_tokens.json"), tokens);
    return match.userId;
  },

  // ================= USER-ISOLATED JOURNAL =================
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    const filePath = path.join(getUserDataDir(userId), "journal.json");
    return readJson<JournalEntry[]>(filePath, []);
  },

  async saveJournalEntry(userId: string, entry: JournalEntry): Promise<JournalEntry> {
    const filePath = path.join(getUserDataDir(userId), "journal.json");
    const entries = await this.getJournalEntries(userId);
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...entry, updatedAt: new Date().toISOString() };
    } else {
      entries.unshift(entry);
    }
    await writeJson(filePath, entries);
    return entry;
  },

  async deleteJournalEntry(userId: string, entryId: string): Promise<boolean> {
    const filePath = path.join(getUserDataDir(userId), "journal.json");
    const entries = await this.getJournalEntries(userId);
    const filtered = entries.filter((e) => e.id !== entryId);
    await writeJson(filePath, filtered);
    return true;
  },

  // ================= USER-ISOLATED DOCUMENTS =================
  async getDocuments(userId: string): Promise<WritingSession[]> {
    const filePath = path.join(getUserDataDir(userId), "documents.json");
    return readJson<WritingSession[]>(filePath, []);
  },

  async saveDocument(userId: string, doc: WritingSession): Promise<WritingSession> {
    const filePath = path.join(getUserDataDir(userId), "documents.json");
    const docs = await this.getDocuments(userId);
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = { ...docs[idx], ...doc, updatedAt: new Date().toISOString() };
    } else {
      docs.unshift(doc);
    }
    await writeJson(filePath, docs);
    return doc;
  },

  async deleteDocument(userId: string, docId: string): Promise<boolean> {
    const filePath = path.join(getUserDataDir(userId), "documents.json");
    const docs = await this.getDocuments(userId);
    const filtered = docs.filter((d) => d.id !== docId);
    await writeJson(filePath, filtered);
    return true;
  },

  // ================= USER-ISOLATED LITTLE PLANS =================
  async getPlans(userId: string): Promise<LittlePlanTask[]> {
    const filePath = path.join(getUserDataDir(userId), "plans.json");
    return readJson<LittlePlanTask[]>(filePath, []);
  },

  async savePlan(userId: string, plan: LittlePlanTask): Promise<LittlePlanTask> {
    const filePath = path.join(getUserDataDir(userId), "plans.json");
    const plans = await this.getPlans(userId);
    const idx = plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      plans[idx] = { ...plans[idx], ...plan, updatedAt: new Date().toISOString() };
    } else {
      plans.unshift(plan);
    }
    await writeJson(filePath, plans);
    return plan;
  },

  async deletePlan(userId: string, planId: string): Promise<boolean> {
    const filePath = path.join(getUserDataDir(userId), "plans.json");
    const plans = await this.getPlans(userId);
    const filtered = plans.filter((p) => p.id !== planId);
    await writeJson(filePath, filtered);
    return true;
  },

  // ================= USER-ISOLATED VOCABULARY =================
  async getVocabulary(userId: string): Promise<VocabularyEntry[]> {
    const filePath = path.join(getUserDataDir(userId), "vocabulary.json");
    return readJson<VocabularyEntry[]>(filePath, []);
  },

  async saveVocabulary(userId: string, entry: VocabularyEntry): Promise<VocabularyEntry> {
    const filePath = path.join(getUserDataDir(userId), "vocabulary.json");
    const vocab = await this.getVocabulary(userId);
    const idx = vocab.findIndex((v) => v.id === entry.id || v.word.toLowerCase() === entry.word.toLowerCase());
    if (idx >= 0) {
      vocab[idx] = { ...vocab[idx], ...entry };
    } else {
      vocab.unshift(entry);
    }
    await writeJson(filePath, vocab);
    return entry;
  },

  async deleteVocabulary(userId: string, entryId: string): Promise<boolean> {
    const filePath = path.join(getUserDataDir(userId), "vocabulary.json");
    const vocab = await this.getVocabulary(userId);
    const filtered = vocab.filter((v) => v.id !== entryId);
    await writeJson(filePath, filtered);
    return true;
  },

  // ================= USER-ISOLATED LIBRARY & BOOKSHELF =================
  async getBooks(userId: string): Promise<BookItem[]> {
    const filePath = path.join(getUserDataDir(userId), "library.json");
    return readJson<BookItem[]>(filePath, []);
  },

  async saveBook(userId: string, book: BookItem): Promise<BookItem> {
    const filePath = path.join(getUserDataDir(userId), "library.json");
    const books = await this.getBooks(userId);
    const idx = books.findIndex((b) => b.id === book.id);
    if (idx >= 0) {
      books[idx] = { ...books[idx], ...book };
    } else {
      books.unshift(book);
    }
    await writeJson(filePath, books);
    return book;
  },

  async deleteBook(userId: string, bookId: string): Promise<boolean> {
    const filePath = path.join(getUserDataDir(userId), "library.json");
    const books = await this.getBooks(userId);
    const filtered = books.filter((b) => b.id !== bookId);
    await writeJson(filePath, filtered);
    return true;
  },

  // ================= USER PREFERENCES =================
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const filePath = path.join(getUserDataDir(userId), "preferences.json");
    return readJson<UserPreferences | null>(filePath, null);
  },

  async savePreferences(userId: string, prefs: UserPreferences): Promise<UserPreferences> {
    const filePath = path.join(getUserDataDir(userId), "preferences.json");
    await writeJson(filePath, prefs);
    return prefs;
  },
};
