import { NextRequest, NextResponse } from "next/server";
import { serverDb } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth";
import {
  JournalEntry,
  WritingSession,
  LittlePlanTask,
  VocabularyEntry,
  BookItem,
  UserPreferences,
} from "@/types";

interface ImportPayload {
  journalEntries?: JournalEntry[];
  documents?: WritingSession[];
  plans?: LittlePlanTask[];
  vocabulary?: VocabularyEntry[];
  books?: BookItem[];
  preferences?: UserPreferences;
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ("response" in auth) return auth.response;
  const userId = auth.user.id;

  try {
    const payload: ImportPayload = await req.json();
    const stats = {
      journalsImported: 0,
      documentsImported: 0,
      plansImported: 0,
      vocabularyImported: 0,
      booksImported: 0,
    };

    // 1. Import Journal Entries safely
    if (Array.isArray(payload.journalEntries) && payload.journalEntries.length > 0) {
      const existing = await serverDb.getJournalEntries(userId);
      const existingIds = new Set(existing.map((e) => e.id));
      for (const entry of payload.journalEntries) {
        if (!existingIds.has(entry.id)) {
          await serverDb.saveJournalEntry(userId, entry);
          existingIds.add(entry.id);
          stats.journalsImported++;
        }
      }
    }

    // 2. Import Writing Documents safely
    if (Array.isArray(payload.documents) && payload.documents.length > 0) {
      const existing = await serverDb.getDocuments(userId);
      const existingIds = new Set(existing.map((d) => d.id));
      for (const doc of payload.documents) {
        if (!existingIds.has(doc.id)) {
          doc.userId = userId;
          await serverDb.saveDocument(userId, doc);
          existingIds.add(doc.id);
          stats.documentsImported++;
        }
      }
    }

    // 3. Import Little Plans safely
    if (Array.isArray(payload.plans) && payload.plans.length > 0) {
      const existing = await serverDb.getPlans(userId);
      const existingIds = new Set(existing.map((p) => p.id));
      for (const plan of payload.plans) {
        if (!existingIds.has(plan.id)) {
          await serverDb.savePlan(userId, plan);
          existingIds.add(plan.id);
          stats.plansImported++;
        }
      }
    }

    // 4. Import Vocabulary safely
    if (Array.isArray(payload.vocabulary) && payload.vocabulary.length > 0) {
      const existing = await serverDb.getVocabulary(userId);
      const existingWords = new Set(existing.map((v) => v.word.toLowerCase()));
      for (const v of payload.vocabulary) {
        if (!existingWords.has(v.word.toLowerCase())) {
          await serverDb.saveVocabulary(userId, v);
          existingWords.add(v.word.toLowerCase());
          stats.vocabularyImported++;
        }
      }
    }

    // 5. Import Books safely
    if (Array.isArray(payload.books) && payload.books.length > 0) {
      const existing = await serverDb.getBooks(userId);
      const existingIds = new Set(existing.map((b) => b.id));
      for (const book of payload.books) {
        if (!existingIds.has(book.id)) {
          await serverDb.saveBook(userId, book);
          existingIds.add(book.id);
          stats.booksImported++;
        }
      }
    }

    // 6. Import preferences if present
    if (payload.preferences) {
      await serverDb.savePreferences(userId, payload.preferences);
    }

    return NextResponse.json({
      success: true,
      message: "Your local writing memories have been safely preserved in your personal sanctuary account.",
      stats,
    });
  } catch (err) {
    console.error("Local data import error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to import local memories. Please try again." },
      { status: 500 }
    );
  }
}
