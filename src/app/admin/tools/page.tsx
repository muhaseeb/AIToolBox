"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tool } from "@prisma/client";

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [authed, setAuthed] = useState(false);
  const [editing, setEditing] = useState<Partial<Tool> | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("aitoolbox:admin") !== "1") return;
    setAuthed(true);
    fetch("/api/admin/tools").then((r) => r.json()).then((d) => setTools(d.tools || []));
  }, []);

  if (!authed) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-400">Admin session required.</p>
        <Link href="/admin" className="btn-primary">Go to admin login</Link>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const method = editing.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/tools", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Save failed");
      return;
    }
    setMsg("Saved");
    setEditing(null);
    const refreshed = await fetch("/api/admin/tools").then((r) => r.json());
    setTools(refreshed.tools || []);
  }

  async function remove(id: string) {
    if (!confirm("Delete this tool?")) return;
    await fetch(`/api/admin/tools?id=${id}`, { method: "DELETE" });
    setTools((prev) => prev.filter((t) => t.id !== id));
  }

  function markVerified(tool: Tool) {
    const now = new Date().toISOString() as unknown as Date;
    setEditing({
      ...tool,
      lastVerified: now,
      verifiedAt: now,
      verifiedBy: "admin",
      verificationStatus: "verified",
      needsReview: false,
      reviewReason: null,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">Tools CRUD</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="btn-ghost text-xs">Dashboard</Link>
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() =>
              setEditing({
                name: "",
                slug: "",
                company: "",
                shortDescription: "",
                description: "",
                category: "chat",
                officialUrl: "https://",
                pricingType: "FREEMIUM",
                freePlan: true,
                web: true,
              })
            }
          >
            Add tool
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      {editing && (
        <form onSubmit={save} className="card grid gap-3 p-6 md:grid-cols-2">
          {(["name", "slug", "company", "category", "officialUrl", "pricingUrl", "pricingType", "license"] as const).map((k) => (
            <div key={k}>
              <label className="mb-1 block text-xs text-zinc-500">{k}</label>
              <input
                className="input"
                value={(editing as Record<string, unknown>)[k] as string || ""}
                onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}
                required={k === "name" || k === "slug" || k === "officialUrl"}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs text-zinc-500">startingPrice</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={editing.startingPrice ?? ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  startingPrice: e.target.value === "" ? null : parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-zinc-500">shortDescription</label>
            <input
              className="input"
              value={editing.shortDescription || ""}
              onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-zinc-500">description</label>
            <textarea
              className="input min-h-[80px]"
              value={editing.description || ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            {(["freePlan", "openSource", "openWeights", "sourceAvailable", "selfHostable", "commercialUse", "apiAvailable", "featured", "trending", "editorialPick", "web"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={!!(editing as Record<string, unknown>)[k]}
                  onChange={(e) => setEditing({ ...editing, [k]: e.target.checked })}
                />
                {k}
              </label>
            ))}
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Pricing</th>
              <th className="p-3">Verified</th>
              <th className="p-3">URL</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.id} className="border-b border-zinc-800/70">
                <td className="p-3 text-white">{t.name}</td>
                <td className="p-3 text-zinc-400">{t.category}</td>
                <td className="p-3 text-zinc-400">{t.pricingType}{t.startingPrice != null ? ` $${t.startingPrice}` : ""}</td>
                <td className="p-3 text-xs text-zinc-500">
                  {t.verificationStatus}
                  {t.needsReview ? (
                    <span className="ml-1 text-amber-400" title={t.reviewReason || "needs review"}>
                      · review
                    </span>
                  ) : null}
                </td>
                <td className="p-3 text-xs text-zinc-500">{t.urlStatus}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="text-violet-300 hover:underline" onClick={() => setEditing(t)}>Edit</button>
                    <button type="button" className="text-emerald-300 hover:underline" onClick={() => markVerified(t)}>Mark verified</button>
                    <button type="button" className="text-red-300 hover:underline" onClick={() => remove(t.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
