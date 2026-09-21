"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/discover?q=${encodeURIComponent(q.trim())}`);
      }}
      className="mx-auto flex max-w-xl gap-2"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          className="input py-3 pl-11 text-base"
          placeholder="What do you want to do?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search AI tools"
        />
      </div>
      <button type="submit" className="btn-primary px-6">Search</button>
    </form>
  );
}
