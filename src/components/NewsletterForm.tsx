"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("ok");
      setMsg("You're on the list.");
      setEmail("");
    } catch (err) {
      setStatus("err");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="input" aria-label="Email" />
        <button type="submit" className="btn-primary shrink-0" disabled={status === "loading"}>
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {msg && <p className={`text-xs ${status === "ok" ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>}
    </form>
  );
}
