import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import TrendPostCard from "@/components/TrendPostCard";
import type { Product, ProductLink, TrendPost } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data } = await supabase.from("products").select("*");
  const products = ((data as Product[]) ?? [])
    .map((p) => ({ ...p, total: p.buy_clicks + p.review_clicks }))
    .sort((a, b) => b.total - a.total)
    .filter((p) => p.total > 0)
    .slice(0, 30);

  const { data: trendPostsData } = await supabase
    .from("trend_posts")
    .select("*, product:products(*, links:product_links(*))")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const trendPosts =
    (trendPostsData as (TrendPost & {
      product: (Product & { links: ProductLink[] }) | null;
    })[]) ?? [];

  return (
    <div className="min-h-screen bg-paper">
      <NavBar isAdmin={profile?.role === "admin"} email={profile?.email ?? ""} />

      <main className="mx-auto max-w-3xl px-5 py-8">
        {trendPosts.length > 0 && (
          <div className="mb-10">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-ink">Trending Reels</h1>
              <p className="mt-1 text-sm text-ink/60">
                Tap a reel to watch on Instagram, then shop the look below.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {trendPosts.map((post) => (
                <TrendPostCard
                  key={post.id}
                  post={post}
                  product={post.product}
                  buyLinks={(post.product?.links ?? []).filter((l) => l.link_type === "buy")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">Trends</h2>
          <p className="mt-1 text-sm text-ink/60">
            Ranked by combined buy and review clicks across everyone on the board.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-card border border-dashed border-mist py-16 text-center">
            <p className="font-display text-lg font-bold text-ink">No clicks yet</p>
            <p className="mt-1 text-sm text-ink/60">
              Trends fill in once people start clicking Buy or Watch review on the Explore page.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {products.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-card border border-mist/70 bg-card p-3"
              >
                <span className="w-7 shrink-0 text-center font-mono text-sm font-medium text-ink/50">
                  {i + 1}
                </span>
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-14 w-14 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">{p.name}</p>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
                    {p.brand}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 font-mono text-xs text-ink/70">
                  <span title="Buy clicks">🛒 {p.buy_clicks}</span>
                  <span title="Review clicks">▶ {p.review_clicks}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
