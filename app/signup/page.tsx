"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-bold text-ink">GabriellaAI</p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink/50">
            Create an account
          </p>
        </div>

        {done ? (
          <div className="rounded-card border border-mist/70 bg-card p-6 text-center">
            <p className="font-display text-base font-bold text-ink">Check your email</p>
            <p className="mt-2 text-sm text-ink/70">
              We sent a confirmation link to <span className="font-medium">{email}</span>.
              Confirm it, then sign in.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full bg-ink px-4 py-2 font-mono text-xs font-medium uppercase tracking-wide text-paper"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-card border border-mist/70 bg-card p-6"
            >
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-wide text-ink/60">
                  Email
                </span>
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
                  minLength={6}
                  autoComplete="new-password"
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
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-ink/60">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-amber underline-offset-2 hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-ink/40">
              The very first account created on a fresh board automatically becomes an admin.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
