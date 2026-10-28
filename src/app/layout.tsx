import type { Metadata, Viewport } from "next";
import { newsreader, plusJakartaSans, caveat } from "./fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Inkling — Find your thoughts. Find your voice.",
  description:
    "A personal, AI-powered writing and reading workspace. Discover your voice, master vocabulary, learn from your writing, and build a sustainable habit.",
  keywords: [
    "writing",
    "reading",
    "vocabulary",
    "journal",
    "AI writing coach",
    "habit tracker",
    "daily spark",
    "editorial",
  ],
  authors: [{ name: "Inkling Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plusJakartaSans.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-ink-primary font-sans antialiased selection:bg-coach-wash">
        {children}
      </body>
    </html>
  );
}
