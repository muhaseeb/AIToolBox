"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/utils";

export default function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          officialUrl: fd.get("officialUrl"),
          category: fd.get("category"),
          description: fd.get("description"),
          submitterEmail: fd.get("email"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("ok");
      setMsg("Thanks! Your submission is pending review.");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Submit a tool</h1>
        <p className="mt-2 text-zinc-400">Suggest an AI tool for the directory. We verify before publishing.</p>
      </div>
      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Tool name</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Official website</label>
          <input name="officialUrl" type="url" required className="input" placeholder="https://" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Category</label>
          <select name="category" className="input">
            <option value="">Select…</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Short description</label>
          <textarea name="description" className="input min-h-[100px]" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Your email</label>
          <input name="email" type="email" className="input" />
        </div>
        <button type="submit" className="btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Submitting…" : "Submit tool"}
        </button>
        {msg && <p className={`text-sm ${status === "ok" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}
      </form>
    </div>
  );
}
