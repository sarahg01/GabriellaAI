import '@/lib/styles/luxury-design.css';
import type { Metadata } from "next";
import { Cormorant_Garamond, Raleway, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Raleway({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "GabriellaAI — Curated finds, reviewed",
  description:
    "A curated board of products with buying links and video reviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}