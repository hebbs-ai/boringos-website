import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BoringOS — the open-source framework for agents that do the work",
  description: "BoringOS runs your agents as the CLI tools you already use — Claude Code, Codex, Gemini, Ollama — wired into tasks, workflows, memory, and a multi-tenant backend. Budgets, audit, and approvals built into the execution path. One command boots the whole thing locally. Built by Hebbs.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BoringOS — agents that do the work",
    description: "The open-source framework for building agentic platforms. Run your agents as the CLI tools you already use. Budgets, audit, and approvals built in. Built by Hebbs.",
    url: "https://boringos.dev",
    siteName: "BoringOS",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoringOS — agents that do the work",
    description: "The open-source framework for building agentic platforms. Built by Hebbs.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
