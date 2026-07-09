// components/SavedPinsBoard.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import type { Product, ProductLink } from '@/types/database';

interface SavedPin {
  id: string;
  product_id: string;
  created_at: string;
  products: Product;
}

export default function SavedPinsBoard() {
  const [savedPins, setSavedPins] = useState<SavedPin[]>([]);
  const [linksByProduct, setLinksByProduct] = useState<Record<string, ProductLink[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedPins();
  }, []);

  const fetchSavedPins = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign in to view your saved pins');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('saved_pins')
        .select(
          `
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            brand,
            description,
            price,
            category,
            image_url,
            affiliate_url,
            youtube_review_url,
            buy_clicks,
            review_clicks
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const pins = (data as unknown as SavedPin[]) || [];
      setSavedPins(pins);

      const productIds = pins.map((pin) => pin.product_id);
      if (productIds.length > 0) {
        const { data: linksData } = await supabase
          .from('product_links')
          .select('*')
          .in('product_id', productIds)
          .order('sort_order', { ascending: true });

        const grouped: Record<string, ProductLink[]> = {};
        (linksData || []).forEach((link) => {
          if (!grouped[link.product_id]) grouped[link.product_id] = [];
          grouped[link.product_id].push(link);
        });
        setLinksByProduct(grouped);
      }
    } catch (err) {
      console.error('Error fetching saved pins:', err);
      setError('Failed to load saved pins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePin = (productId: string) => {
    setSavedPins(savedPins.filter((pin) => pin.product_id !== productId));
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>📌 Saved Pins</h1>
          <p style={{ color: 'var(--color-text-light)' }}>
            Your collection of favorite beauty products
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p style={{ color: 'var(--color-text-light)' }}>Loading your pins...</p>
          </div>
        ) : error ? (
          <div
            style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'rgba(201, 112, 112, 0.1)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        ) : savedPins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-lg)' }}>
              You haven't saved any products yet.
            </p>
            <a href="/explore" className="btn btn-primary">
              Explore Products →
            </a>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--spacing-lg)' }}>
              {savedPins.length} saved pin{savedPins.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-3">
              {savedPins.map((pin) => (
                <ProductCard
                  key={pin.product_id}
                  product={pin.products}
                  buyLinks={(linksByProduct[pin.product_id] || []).filter(
                    (l) => l.link_type === 'buy'
                  )}
                  reviewLinks={(linksByProduct[pin.product_id] || []).filter(
                    (l) => l.link_type === 'review'
                  )}
                  onSave={handleRemovePin}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
