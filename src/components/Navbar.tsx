"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Boxes, GitCompare, Heart, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompareList, useSavedTools } from "@/hooks/useLocalStore";

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/categories", label: "Categories" },
  { href: "/compare", label: "Compare" },
  { href: "/open-source", label: "Open Source" },
  { href: "/trending", label: "Trending" },
  { href: "/pricing", label: "Pricing" },
  { href: "/collections", label: "Collections" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const compare = useCompareList();
  const saved = useSavedTools();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-glow">
            <Boxes className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">AIToolBox</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800/80 hover:text-white",
                pathname.startsWith(l.href) && "bg-zinc-800 text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/discover" className="btn-ghost hidden sm:inline-flex" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/saved" className="btn-ghost relative" aria-label="Saved">
            <Heart className="h-4 w-4" />
            {saved.value.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                {saved.value.length}
              </span>
            )}
          </Link>
          <Link href="/compare" className="btn-ghost relative" aria-label="Compare">
            <GitCompare className="h-4 w-4" />
            {compare.value.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {compare.value.length}
              </span>
            )}
          </Link>
          <Link href="/submit" className="btn-secondary hidden text-xs md:inline-flex">Submit Tool</Link>
          <Link href="/login" className="btn-primary hidden text-xs md:inline-flex">Login</Link>
          <button type="button" className="btn-ghost lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-zinc-800 bg-background px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                {l.label}
              </Link>
            ))}
            <Link href="/platforms" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Platforms</Link>
            <Link href="/submit" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Submit Tool</Link>
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
