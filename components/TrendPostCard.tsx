'use client';

import { createClient } from '@/lib/supabase/client';
import InstagramEmbed from './InstagramEmbed';
import type { Product, ProductLink, TrendPost } from '@/types/database';

interface TrendPostCardProps {
  post: TrendPost;
  product?: Product | null;
  buyLinks?: ProductLink[];
}

export default function TrendPostCard({ post, product, buyLinks }: TrendPostCardProps) {
  const supabase = createClient();

  const links: { label: string; url: string; price: number | null }[] =
    buyLinks && buyLinks.length > 0
      ? buyLinks.map((l, i) => ({
          label: l.label || `Buy${buyLinks.length > 1 ? ` (${i + 1})` : ''}`,
          url: l.url,
          price: l.price,
        }))
      : product
      ? [{ label: 'Buy', url: product.affiliate_url, price: product.price ?? null }]
      : [];

  const handleBuyClick = async (url: string) => {
    try {
      if (product) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('clicks').insert({
            product_id: product.id,
            click_type: 'buy',
            user_id: user.id,
          });
        }
      }
    } catch (err) {
      console.error('Error logging click:', err);
    } finally {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-mist/70 bg-card p-4">
      <InstagramEmbed url={post.instagram_url} />

      {post.caption && (
        <p className="w-full max-w-[540px] text-sm text-ink/70">{post.caption}</p>
      )}

      {product && (
        <div className="flex w-full max-w-[540px] items-center gap-2 border-t border-mist/70 pt-3">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-ink">{product.name}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
              {product.brand}
            </p>
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="flex w-full max-w-[540px] flex-wrap gap-2">
          {links.map((link, i) => (
            <button
              key={`${post.id}-buy-${i}`}
              onClick={() => handleBuyClick(link.url)}
              className="btn btn-primary btn-sm"
            >
              💳 {link.label}
              {link.price != null && (
                <span style={{ marginLeft: '4px', fontWeight: 700 }}>· ₹{link.price}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
