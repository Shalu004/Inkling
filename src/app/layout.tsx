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
      data-theme="linen"
      suppressHydrationWarning
      className={`${lora.variable} ${inter.variable} ${caveat.variable} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var raw = localStorage.getItem('inkling_user_preferences_v1');
                if (raw) {
                  var p = JSON.parse(raw);
                  if (p.theme) {
                    document.documentElement.setAttribute('data-theme', p.theme);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] font-sans antialiased selection:bg-[var(--bg-botanical-light)] transition-colors duration-200">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
