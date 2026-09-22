"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Focos</h1>
          <p className="text-zinc-400 text-sm mt-1">Start tracking your time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
