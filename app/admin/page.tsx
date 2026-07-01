import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data } = await supabase.from("products").select("*");
  const products = (data as Product[]) ?? [];

  const productCount = products.length;
  const brandCount = new Set(products.map((p) => p.brand.trim().toLowerCase())).size;

  const topClicked = [...products]
    .map((p) => ({ ...p, total: p.buy_clicks + p.review_clicks }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-paper">
      <NavBar isAdmin={profile?.role === "admin"} email={profile?.email ?? ""} />

      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Admin dashboard</h1>
            <p className="mt-1 text-sm text-ink/60">A quick read on what's on the board.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-full bg-amber px-4 py-2 font-mono text-xs font-medium uppercase tracking-wide text-paper hover:opacity-90"
          >
            + Add product
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-2">
          <StatCard label="Products" value={productCount} />
          <StatCard label="Brands" value={brandCount} />
        </div>

        <div>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-ink/50">
            Highest-clicked products
          </h2>

          {topClicked.length === 0 ? (
            <p className="rounded-card border border-dashed border-mist py-10 text-center text-sm text-ink/60">
              No products yet — add the first one to see it here.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {topClicked.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-4 rounded-card border border-mist/70 bg-card p-3"
                >
                  <span className="w-6 shrink-0 text-center font-mono text-sm text-ink/50">
                    {i + 1}
                  </span>
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-ink">{p.name}</p>
                    <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
                      {p.brand}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-medium text-clay">
                    {p.total} clicks
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-mist/70 bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}
