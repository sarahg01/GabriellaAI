"use client";

import Image from "next/image";
import type { Product } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

function heatLevel(totalClicks: number) {
  if (totalClicks >= 50) return 3;
  if (totalClicks >= 10) return 2;
  if (totalClicks >= 1) return 1;
  return 0;
}

export default function ProductCard({ product }: { product: Product }) {
  const totalClicks = product.buy_clicks + product.review_clicks;
  const heat = heatLevel(totalClicks);

  async function logClick(type: "buy" | "review") {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      await fetch("/api/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, click_type: type }),
        keepalive: true,
        credentials: "include",
      });
      void data;
    } catch {
      // Logging the click should never block the user from following the link.
    }
  }

  return (
    <div className="masonry-item">
      <article className="group relative overflow-hidden rounded-card border border-mist/70 bg-card shadow-[0_1px_0_rgba(21,48,43,0.06)] transition-shadow hover:shadow-md">
        {/* Signature element: a rotated index-card stamp with brand + heat. */}
        <div className="absolute left-3 top-3 z-10 -rotate-3 rounded border border-ink/15 bg-paper/95 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink shadow-sm">
          {product.brand}
          {heat > 0 && (
            <span className="ml-1.5 text-clay" aria-label={`${totalClicks} clicks`}>
              {"•".repeat(heat)}
            </span>
          )}
        </div>

        <div className="relative w-full bg-mist/30">
          <Image
            src={product.image_url}
            alt={product.title}
            width={600}
            height={750}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="h-auto w-full object-cover"
            unoptimized
          />
        </div>

        <div className="p-3.5">
          <h3 className="font-display text-base font-bold leading-snug text-ink">
            {product.title}
          </h3>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-ink/70">{product.description}</p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <a
              href={product.buy_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logClick("buy")}
              className="flex-1 rounded-full bg-amber px-3 py-1.5 text-center font-mono text-xs font-medium uppercase tracking-wide text-paper transition-opacity hover:opacity-90"
            >
              Buy
            </a>
            {product.review_link && (
              <a
                href={product.review_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logClick("review")}
                className="flex-1 rounded-full border border-ink/20 px-3 py-1.5 text-center font-mono text-xs font-medium uppercase tracking-wide text-ink transition-colors hover:border-ink/40"
              >
                Watch review
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
