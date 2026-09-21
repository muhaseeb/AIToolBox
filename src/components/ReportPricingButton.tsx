"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

export function ReportPricingButton({ toolId, toolName }: { toolId: string; toolName: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, message, email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("ok");
      setMessage("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="btn-ghost text-xs text-amber-300">
        <Flag className="h-3.5 w-3.5" /> Report outdated pricing for {toolName}
      </button>
      {open && (
        <form onSubmit={submit} className="mt-3 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
          <textarea
            className="input min-h-[80px]"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What looks outdated?"
          />
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
          />
          <button type="submit" className="btn-primary text-xs" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Submit report"}
          </button>
          {status === "ok" && <p className="text-xs text-emerald-400">Thanks — report received.</p>}
          {status === "err" && <p className="text-xs text-red-400">Could not send. Try again.</p>}
        </form>
      )}
    </div>
  );
}
