import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function parseJsonObject<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export type PricingPlan = {
  name: string;
  price: number | null;
  period: string;
  features: string[];
  note?: string;
};

export function formatPrice(
  startingPrice: number | null | undefined,
  pricingType: string,
  currency = "USD"
): string {
  if (pricingType === "FREE") return "Free";
  if (startingPrice == null) return "Pricing unavailable — check official site";
  const symbol = currency === "USD" ? "$" : `${currency} `;
  if (pricingType === "FREEMIUM") return `Free / From ${symbol}${startingPrice}/mo`;
  if (pricingType === "ENTERPRISE" || pricingType === "CUSTOM") {
    return startingPrice === 0 ? "Custom" : `From ${symbol}${startingPrice}/mo`;
  }
  return `From ${symbol}${startingPrice}/mo`;
}

export function formatVerifiedDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export const CATEGORIES = [
  { slug: "chat", name: "AI Chatbots", icon: "MessageSquare" },
  { slug: "video", name: "AI Video Generation", icon: "Video" },
  { slug: "image", name: "AI Image Generation", icon: "Image" },
  { slug: "voice", name: "AI Voice & Audio", icon: "Mic" },
  { slug: "music", name: "AI Music", icon: "Music" },
  { slug: "coding", name: "AI Coding", icon: "Code2" },
  { slug: "search", name: "AI Search & Research", icon: "Search" },
  { slug: "agents", name: "AI Agents", icon: "Bot" },
  { slug: "productivity", name: "AI Productivity", icon: "Zap" },
  { slug: "design", name: "AI Design", icon: "Palette" },
  { slug: "presentations", name: "AI Presentations", icon: "Presentation" },
  { slug: "writing", name: "AI Writing", icon: "PenLine" },
  { slug: "developer", name: "AI Developer Tools", icon: "Terminal" },
  { slug: "3d", name: "AI 3D", icon: "Box" },
  { slug: "open-source", name: "Open Source AI", icon: "Github" },
  { slug: "local", name: "Local / Self-hosted AI", icon: "HardDrive" },
] as const;

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}

export const OS_HUB_TABS = [
  "LLMs",
  "Image",
  "Video",
  "Audio",
  "Agents",
  "Coding",
  "UI",
  "Infrastructure",
] as const;

export const PLATFORMS = [
  { key: "web", label: "Web", field: "web" as const },
  { key: "windows", label: "Windows", field: "windows" as const },
  { key: "macos", label: "macOS", field: "macos" as const },
  { key: "linux", label: "Linux", field: "linux" as const },
  { key: "chrome", label: "Chrome", field: "chromeExtension" as const },
  { key: "ios", label: "iOS", field: "ios" as const },
  { key: "android", label: "Android", field: "android" as const },
] as const;
