import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareBar } from "@/components/CompareBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "AIToolBox — Discover & Compare AI Tools",
    template: "%s | AIToolBox",
  },
  description:
    "Discover, compare and launch the world's leading AI tools — free, paid and open source. Pricing from verified sources only.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <Navbar />
        <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 sm:px-6">{children}</main>
        <Footer />
        <CompareBar />
      </body>
    </html>
  );
}
