"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    const next = searchParams.get("next") || "/explore";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold text-ink">GabriellaAI</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink/50">Sign in</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-card border border-mist/70 bg-card p-6"
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-ink/60">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-mist bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-amber"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wide text-ink/60">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-mist bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-amber"
            />
          </label>

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-full bg-ink px-4 py-2 font-mono text-xs font-medium uppercase tracking-wide text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          New here?{" "}
          <Link href="/signup" className="font-medium text-amber underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
