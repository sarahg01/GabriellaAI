"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    brand: "",
    description: "",
    image_url: "",
    buy_link: "",
    review_link: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();

    const { error } = await supabase.from("products").insert({
      title: form.title,
      brand: form.brand || "Unbranded",
      description: form.description || null,
      image_url: form.image_url,
      buy_link: form.buy_link,
      review_link: form.review_link || null,
      created_by: auth.user?.id ?? null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/explore");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/admin" className="font-mono text-xs uppercase tracking-wide text-ink/50">
          ← Back to dashboard
        </Link>

        <h1 className="mt-3 font-display text-2xl font-bold text-ink">Add a product</h1>
        <p className="mt-1 text-sm text-ink/60">
          This goes straight onto the Explore board and into Supabase.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 rounded-card border border-mist/70 bg-card p-6"
        >
          <Field label="Title" required>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="input"
              placeholder="Aeropress Go"
            />
          </Field>

          <Field label="Brand">
            <input
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className="input"
              placeholder="Aeropress"
            />
          </Field>

          <Field label="Image URL" required>
            <input
              required
              type="url"
              value={form.image_url}
              onChange={(e) => update("image_url", e.target.value)}
              className="input"
              placeholder="https://…"
            />
          </Field>

          <Field label="Buying link" required>
            <input
              required
              type="url"
              value={form.buy_link}
              onChange={(e) => update("buy_link", e.target.value)}
              className="input"
              placeholder="https://…"
            />
          </Field>

          <Field label="YouTube review link">
            <input
              type="url"
              value={form.review_link}
              onChange={(e) => update("review_link", e.target.value)}
              className="input"
              placeholder="https://youtube.com/…"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input min-h-[80px] resize-y"
              placeholder="Short, scannable — a sentence or two."
            />
          </Field>

          {error && <p className="text-sm text-clay">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-full bg-ink px-4 py-2 font-mono text-xs font-medium uppercase tracking-wide text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add to board"}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input {
          border: 1px solid #cfcabc;
          background: #e9e4d8;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #15302b;
          outline: none;
        }
        .input:focus {
          border-color: #c8862b;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-ink/60">
        {label}
        {required && <span className="text-clay"> *</span>}
      </span>
      {children}
    </label>
  );
}
