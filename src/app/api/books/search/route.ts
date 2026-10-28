import { NextRequest, NextResponse } from "next/server";
import { UnifiedBook, BookSource, BookAvailability } from "@/types";

// In-memory cache with 5-minute TTL to respect rate limits and maximize responsiveness
interface CacheEntry {
  timestamp: number;
  data: {
    books: UnifiedBook[];
    total: number;
    providers: Record<string, "ok" | "rate_limited" | "error" | "skipped">;
  };
}

const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";
  const source = (searchParams.get("source") || "all") as "all" | BookSource;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(24, Math.max(4, parseInt(searchParams.get("limit") || "12", 10)));
  const genre = searchParams.get("genre")?.trim();
  const availability = searchParams.get("availability") || "all";
  const language = searchParams.get("language")?.trim();

  if (!query && !genre) {
    return NextResponse.json({
      success: true,
      books: [],
      total: 0,
      page,
      providers: {},
      message: "Please enter a search query or select a genre.",
    });
  }

  const effectiveQuery = [query, genre].filter(Boolean).join(" ");
  const cacheKey = `${effectiveQuery}|${source}|${page}|${limit}|${availability}|${language || ""}`;

  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      books: cached.data.books,
      total: cached.data.total,
      page,
      providers: cached.data.providers,
      fromCache: true,
    });
  }

  const providers: Record<string, "ok" | "rate_limited" | "error" | "skipped"> = {};
  const allBooks: UnifiedBook[] = [];

  // Provider 1: Open Library
  if (source === "all" || source === "open_library") {
    try {
      const olParams = new URLSearchParams({
        q: effectiveQuery,
        page: String(page),
        limit: String(limit),
      });
      if (language) olParams.set("lang", language);

      const olRes = await fetch(`https://openlibrary.org/search.json?${olParams.toString()}`, {
        headers: { "User-Agent": "InklingSanctuary/1.0 (contact: inkling@library.sanctuary)" },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(6000),
      });

      if (olRes.ok) {
        const olData = await olRes.json();
        const docs = olData.docs || [];
        providers.open_library = "ok";

        docs.forEach((doc: any) => {
          const authorList = doc.author_name || (doc.author_key ? ["Unknown Author"] : ["Unknown"]);
          const coverId = doc.cover_i;
          const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined;
          const hasEbook = doc.has_fulltext || doc.ebook_access === "borrowable" || doc.ebook_access === "public";
          
          let availType: BookAvailability["type"] = "details_only";
          let availLabel = "Library Record";
          let readUrl = doc.key ? `https://openlibrary.org${doc.key}` : undefined;

          if (doc.ebook_access === "public" || doc.has_fulltext) {
            availType = "public_domain";
            availLabel = "Read on Open Library";
          } else if (doc.ebook_access === "borrowable") {
            availType = "borrow";
            availLabel = "Borrow via Archive.org";
          }

          allBooks.push({
            id: `ol:${doc.key?.replace("/works/", "") || Math.random().toString(36).slice(2)}`,
            title: doc.title,
            authors: authorList,
            author: authorList.slice(0, 2).join(", ") + (authorList.length > 2 ? " et al." : ""),
            description: doc.first_sentence?.[0] || doc.subtitle || undefined,
            coverUrl,
            firstPublishYear: doc.first_publish_year,
            publisher: doc.publisher?.[0],
            isbn: doc.isbn?.[0],
            pageCount: doc.number_of_pages_median,
            subjects: (doc.subject || []).slice(0, 5),
            language: doc.language?.[0],
            source: "open_library",
            sourceLabel: "Open Library",
            sourceAttribution: "Open Library / Internet Archive",
            availability: {
              type: availType,
              label: availLabel,
              url: readUrl,
            },
            editionCount: doc.edition_count,
            externalUrl: doc.key ? `https://openlibrary.org${doc.key}` : undefined,
          });
        });
      } else {
        providers.open_library = "error";
      }
    } catch (err: any) {
      providers.open_library = "error";
    }
  } else {
    providers.open_library = "skipped";
  }

  // Provider 2: Project Gutenberg (Gutendex API)
  if (source === "all" || source === "project_gutenberg") {
    try {
      const pgUrl = `https://gutendex.com/books?search=${encodeURIComponent(effectiveQuery)}&page=${page}`;
      const pgRes = await fetch(pgUrl, {
        headers: { "User-Agent": "InklingSanctuary/1.0 (contact: inkling@library.sanctuary)" },
        signal: AbortSignal.timeout(10000),
      });

      if (pgRes.ok) {
        const pgData = await pgRes.json();
        providers.project_gutenberg = "ok";
        const results = pgData.results || [];

        results.forEach((item: any) => {
          const authors = (item.authors || []).map((a: any) => a.name);
          const authorFormatted = authors.length > 0 ? authors[0] : "Project Gutenberg";
          const formats = item.formats || {};
          
          // Determine best readable link
          const htmlUrl = formats["text/html"] || formats["text/html; charset=utf-8"] || formats["text/html; charset=iso-8859-1"];
          const epubUrl = formats["application/epub+zip"];
          const textUrl = formats["text/plain; charset=utf-8"] || formats["text/plain"];
          const coverUrl = formats["image/jpeg"];

          allBooks.push({
            id: `pg:${item.id}`,
            title: item.title,
            authors: authors.length > 0 ? authors : ["Project Gutenberg"],
            author: authorFormatted,
            description: item.bookshelves?.slice(0, 3).join(", ") || undefined,
            coverUrl,
            subjects: (item.subjects || []).slice(0, 4),
            language: item.languages?.[0] || "en",
            source: "project_gutenberg",
            sourceLabel: "Project Gutenberg",
            sourceAttribution: "Project Gutenberg (Public Domain)",
            availability: {
              type: "read_online",
              label: "Read Online (Full Text)",
              url: htmlUrl || textUrl || `https://www.gutenberg.org/ebooks/${item.id}`,
              format: htmlUrl ? "html" : textUrl ? "text" : "epub",
            },
            downloadUrl: epubUrl || textUrl,
            externalUrl: `https://www.gutenberg.org/ebooks/${item.id}`,
          });
        });
      } else {
        providers.project_gutenberg = "error";
      }
    } catch {
      providers.project_gutenberg = "error";
    }
  } else {
    providers.project_gutenberg = "skipped";
  }

  // Provider 3: Google Books API (Graceful with API Key or Public Fallback)
  if (source === "all" || source === "google_books") {
    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : "";
      const startIndex = (page - 1) * limit;
      const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(effectiveQuery)}&startIndex=${startIndex}&maxResults=${limit}${apiKey}`;
      
      const gbRes = await fetch(gbUrl, {
        headers: { "User-Agent": "InklingSanctuary/1.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (gbRes.status === 429) {
        providers.google_books = "rate_limited";
      } else if (gbRes.ok) {
        const gbData = await gbRes.json();
        providers.google_books = "ok";
        const items = gbData.items || [];

        items.forEach((item: any) => {
          const info = item.volumeInfo || {};
          const access = item.accessInfo || {};
          const authors = info.authors || ["Unknown Author"];
          const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
          const secureThumb = thumb ? thumb.replace("http://", "https://") : undefined;

          let availType: BookAvailability["type"] = "details_only";
          let availLabel = "Catalog Metadata";
          let availUrl = info.previewLink || info.infoLink;

          if (access.viewability === "ALL_PAGES") {
            availType = "read_online";
            availLabel = "Read Full Book";
          } else if (access.viewability === "PARTIAL") {
            availType = "preview";
            availLabel = "Preview Pages";
          } else if (access.pdf?.isAvailable && access.pdf.downloadLink) {
            availType = "public_domain";
            availLabel = "Download PDF";
            availUrl = access.pdf.downloadLink;
          }

          allBooks.push({
            id: `gb:${item.id}`,
            title: info.title || "Untitled",
            authors,
            author: authors.join(", "),
            description: info.description ? info.description.slice(0, 300) : undefined,
            coverUrl: secureThumb,
            firstPublishYear: info.publishedDate ? info.publishedDate.slice(0, 4) : undefined,
            publisher: info.publisher,
            isbn: info.industryIdentifiers?.[0]?.identifier,
            pageCount: info.pageCount,
            subjects: info.categories || [],
            language: info.language,
            source: "google_books",
            sourceLabel: "Google Books",
            sourceAttribution: "Google Books API",
            availability: {
              type: availType,
              label: availLabel,
              url: availUrl,
            },
            externalUrl: info.infoLink || info.previewLink,
          });
        });
      } else {
        providers.google_books = "error";
      }
    } catch {
      providers.google_books = "error";
    }
  } else {
    providers.google_books = "skipped";
  }

  // Deduplication by normalized Title and primary author
  const seen = new Set<string>();
  const dedupedBooks: UnifiedBook[] = [];

  for (const b of allBooks) {
    const normTitle = b.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
    const normAuthor = (b.authors[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14);
    const key = `${normTitle}|${normAuthor}`;

    if (!seen.has(key)) {
      seen.add(key);
      dedupedBooks.push(b);
    }
  }

  // Apply client availability filter if requested
  let finalBooks = dedupedBooks;
  if (availability && availability !== "all") {
    finalBooks = finalBooks.filter((b) => {
      if (availability === "read_online") {
        return b.availability.type === "read_online" || b.availability.type === "public_domain";
      }
      if (availability === "preview") {
        return b.availability.type === "preview";
      }
      if (availability === "borrow") {
        return b.availability.type === "borrow";
      }
      return b.availability.type === availability;
    });
  }

  // Store in cache
  CACHE.set(cacheKey, {
    timestamp: Date.now(),
    data: {
      books: finalBooks,
      total: finalBooks.length,
      providers,
    },
  });

  return NextResponse.json({
    success: true,
    books: finalBooks,
    total: finalBooks.length,
    page,
    providers,
  });
}
