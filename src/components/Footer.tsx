import Link from "next/link";
import { Boxes } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-800/80 bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                <Boxes className="h-4 w-4" />
              </span>
              AIToolBox
            </div>
            <p className="text-sm text-zinc-400">
              Discover, compare and launch leading AI tools — free, paid and open source.
            </p>
            <p className="mt-3 text-xs text-zinc-600">
              Discovery only. We do not host third-party AI services. External links go to official websites.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Explore</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/discover" className="hover:text-white">Discover</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/open-source" className="hover:text-white">Open Source</Link></li>
              <li><Link href="/trending" className="hover:text-white">Trending</Link></li>
              <li><Link href="/platforms" className="hover:text-white">Platforms</Link></li>
              <li><Link href="/collections" className="hover:text-white">Collections</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing directory</Link></li>
              <li><Link href="/submit" className="hover:text-white">Submit a tool</Link></li>
              <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">AI Tools Weekly</h4>
            <p className="mb-3 text-sm text-zinc-400">Newest AI tools and pricing updates every week.</p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-800 pt-6 text-xs text-zinc-600 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} AIToolBox. Prices may change — always verify on official sites.</p>
          <p>Catalog verification window: September 2026</p>
        </div>
      </div>
    </footer>
  );
}
