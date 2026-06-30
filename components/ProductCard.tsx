// components/ProductCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ShareButton from './ShareButton';

interface PriceLink {
  label: string;
  url: string;
}

interface ReviewLink {
  label: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  brand: string;
  description?: string;
  image_url: string;
  price_links: PriceLink[];
  review_links: ReviewLink[];
  buy_clicks: number;
  review_clicks: number;
}

interface ProductCardProps {
  product: Product;
  onSave?: (productId: string, isSaved: boolean) => void;
}

export default function ProductCard({ product, onSave }: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

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
        // Remove from saved pins
        await supabase
          .from('saved_pins')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsSaved(false);
        onSave?.(product.id, false);
      } else {
        // Add to saved pins
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

  const handlePriceClick = async (url: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Log click
      if (user) {
        await supabase.from('clicks').insert({
          product_id: product.id,
          click_type: 'buy',
          user_id: user.id,
        });
      }

      // Open link
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error logging click:', err);
      window.open(url, '_blank');
    }
  };

  const handleReviewClick = async (url: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Log click
      if (user) {
        await supabase.from('clicks').insert({
          product_id: product.id,
          click_type: 'review',
          user_id: user.id,
        });
      }

      // Open link
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error logging click:', err);
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
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
        {product.title}
      </h3>

      <p style={{ color: 'var(--color-gold)', fontWeight: '500', marginBottom: 'var(--spacing-md)' }}>
        {product.brand}
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

      {/* Links Section */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        {/* Price Links */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', marginBottom: 'var(--spacing-sm)' }}>
            💳 Price Links:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {product.price_links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handlePriceClick(link.url)}
                className="btn btn-primary btn-sm"
                style={{ justifyContent: 'flex-start' }}
              >
                {link.label || 'View Price'} →
              </button>
            ))}
          </div>
        </div>

        {/* Review Links */}
        {product.review_links.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', marginBottom: 'var(--spacing-sm)' }}>
              📸 Reviews:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {product.review_links.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReviewClick(link.url)}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  {link.label || 'View Review'} →
                </button>
              ))}
            </div>
          </div>
        )}
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
        <button
          onClick={handleSaveToggle}
          disabled={isLoadingSave}
          className={`btn btn-sm flex-1 ${isSaved ? 'btn-primary' : 'btn-ghost'}`}
        >
          {isSaved ? '📌 Saved' : '📍 Save'}
        </button>
        <ShareButton
          productTitle={product.title}
          productUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.id}`}
        />
      </div>
    </div>
  );
}
