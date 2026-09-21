"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  function demoLogin(e: React.FormEvent) {
    e.preventDefault();
    // Demo/dev auth stub — stores a session flag locally
    localStorage.setItem(
      "aitoolbox:session",
      JSON.stringify({ email: email || "demo@aitoolbox.local", provider: "demo", at: Date.now() })
    );
    setMsg("Signed in (demo mode). Saved tools sync to this browser.");
    setTimeout(() => router.push("/saved"), 600);
  }

  function googleStub() {
    localStorage.setItem(
      "aitoolbox:session",
      JSON.stringify({ email: "google-demo@aitoolbox.local", provider: "google-demo", at: Date.now() })
    );
    setMsg("Google sign-in stubbed for demo. Set GOOGLE_CLIENT_ID to enable real OAuth.");
    setTimeout(() => router.push("/saved"), 600);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Login</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Demo mode is on — no real credentials required. To enable Google OAuth, set{" "}
          <code className="text-zinc-300">GOOGLE_CLIENT_ID</code> and{" "}
          <code className="text-zinc-300">GOOGLE_CLIENT_SECRET</code> in <code className="text-zinc-300">.env</code>.
        </p>
      </div>
      <form onSubmit={demoLogin} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="any password in demo mode" />
        </div>
        <button type="submit" className="btn-primary w-full">Continue with email (demo)</button>
        <button type="button" onClick={googleStub} className="btn-secondary w-full">Continue with Google (stub)</button>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
      </form>
    </div>
  );
}
