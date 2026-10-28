import type { Metadata, Viewport } from "next";
import { lora, inter, caveat } from "./fonts";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Inkling — Personal Literary Sanctuary & Journal",
  description:
    "A cozy home library combined with a personal diary, reading nook, and thought garden.",
  keywords: [
    "journal",
    "reading journal",
    "diary",
    "literary sanctuary",
    "bookshelf",
    "reading nook",
    "writing",
    "vocabulary",
  ],
  authors: [{ name: "Inkling Sanctuary" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${inter.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F0E6] text-[#332F29] font-sans antialiased selection:bg-[#D9DFCF]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
