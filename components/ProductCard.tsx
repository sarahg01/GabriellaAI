// components/ProductCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ShareButton from './ShareButton';
import type { ProductLink } from '@/types/database';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    description?: string | null;
    price: number;
    category: string;
    image_url: string;
    affiliate_url: string;
    youtube_review_url?: string | null;
    buy_clicks: number;
    review_clicks: number;
  };
  // Full set of buy/review links for this product. When omitted or empty,
  // falls back to the single affiliate_url / youtube_review_url fields for
  // backward compatibility with products added before multi-link support.
  buyLinks?: ProductLink[];
  reviewLinks?: ProductLink[];
  onSave?: (productId: string, isSaved: boolean) => void;
  isAdmin?: boolean;
}

export default function ProductCard({
  product,
  buyLinks,
  reviewLinks,
  onSave,
  isAdmin,
}: ProductCardProps) {
  const supabase = createClient();
  const effectiveBuyLinks: { label: string; url: string; price: number | null }[] =
    buyLinks && buyLinks.length > 0
      ? buyLinks.map((l, i) => ({
          label: l.label || `Buy${buyLinks.length > 1 ? ` (${i + 1})` : ''}`,
          url: l.url,
          price: l.price ?? null,
        }))
      : [{ label: 'Buy', url: product.affiliate_url, price: product.price ?? null }];

  const effectiveReviewLinks: { label: string; url: string }[] =
    reviewLinks && reviewLinks.length > 0
      ? reviewLinks.map((l, i) => ({ label: l.label || `Review${reviewLinks.length > 1 ? ` (${i + 1})` : ''}`, url: l.url }))
      : product.youtube_review_url
      ? [{ label: 'Review', url: product.youtube_review_url }]
      : [];
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [product.id]);

  const checkIfSaved = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_pins')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (!error && data) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const handleSaveToggle = async () => {
    setIsLoadingSave(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to save products');
        return;
      }

      if (isSaved) {
        await supabase
          .from('saved_pins')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsSaved(false);
        onSave?.(product.id, false);
      } else {
        await supabase.from('saved_pins').insert({
          user_id: user.id,
          product_id: product.id,
        });
        setIsSaved(true);
        onSave?.(product.id, true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      alert('Failed to save product');
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleBuyClick = async (url: string) => {
    try {
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
    } catch (err) {
      console.error('Error logging click:', err);
    } finally {
      window.open(url, '_blank');
    }
  };

  const handleReviewClick = async (url: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('clicks').insert({
          product_id: product.id,
          click_type: 'review',
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error('Error logging click:', err);
    } finally {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Image */}
      <div
        style={{
          position: 'relative',
          paddingBottom: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-md)',
          backgroundColor: 'var(--color-blush-light)',
        }}
      >
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {isAdmin && (
          <Link
            href={`/admin/products/${product.id}/edit`}
            aria-label={`Edit ${product.name}`}
            title="Edit product"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              color: 'var(--color-dark)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            ✎
          </Link>
        )}
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
        {product.name}
      </h3>

      <p style={{ color: 'var(--color-gold)', fontWeight: '500', marginBottom: 'var(--spacing-sm)' }}>
        {product.brand}
      </p>

      <p style={{ color: 'var(--color-gold)', fontWeight: '500', marginBottom: 'var(--spacing-md)' }}>
        ₹{product.price}
      </p>

      {product.description && (
        <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-light)' }}>
          {product.description}
        </p>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-light)',
          marginBottom: 'var(--spacing-md)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span>👁️ {product.buy_clicks} views</span>
        {product.review_clicks > 0 && <span>⭐ {product.review_clicks} reviews</span>}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--spacing-md)',
        }}
      >
        {effectiveBuyLinks.map((link, i) => (
          <button
            key={`buy-${i}`}
            onClick={() => handleBuyClick(link.url)}
            className="btn btn-primary btn-sm flex-1"
          >
            💳 {link.label}
            {link.price != null && (
              <span style={{ marginLeft: '4px', fontWeight: 700 }}>· ₹{link.price}</span>
            )}
          </button>
        ))}

        {effectiveReviewLinks.map((link, i) => (
          <button
            key={`review-${i}`}
            onClick={() => handleReviewClick(link.url)}
            className="btn btn-secondary btn-sm flex-1"
          >
            📸 {link.label}
          </button>
        ))}

        <button
          onClick={handleSaveToggle}
          disabled={isLoadingSave}
          className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-ghost'}`}
        >
          {isSaved ? '📌' : '📍'}
        </button>
      </div>
    </div>
  );
}
