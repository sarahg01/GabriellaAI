'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Footer from '@/components/Footer';
import type { Product, TrendPost } from '@/types/database';

export default function AdminTrendsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<(TrendPost & { product: Product | null })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [instagramUrl, setInstagramUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [productId, setProductId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setIsLoading(true);
    const [{ data: postsData }, { data: productsData }] = await Promise.all([
      supabase
        .from('trend_posts')
        .select('*, product:products(*)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('name', { ascending: true }),
    ]);

    setPosts((postsData as (TrendPost & { product: Product | null })[]) ?? []);
    setProducts((productsData as Product[]) ?? []);
    setIsLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const url = instagramUrl.trim();
    if (!url) {
      setMessage({ type: 'error', text: 'Paste an Instagram post/reel link.' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('trend_posts').insert({
      instagram_url: url,
      caption: caption.trim() || null,
      product_id: productId || null,
    });
    setIsSubmitting(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }

    setInstagramUrl('');
    setCaption('');
    setProductId('');
    setMessage({ type: 'success', text: 'Reel added to Trends.' });
    fetchAll();
  }

  async function handleDelete(post: TrendPost) {
    const confirmed = window.confirm('Remove this reel from Trends?');
    if (!confirmed) return;

    setDeletingId(post.id);
    const { error } = await supabase.from('trend_posts').delete().eq('id', post.id);
    setDeletingId(null);

    if (error) {
      alert(`Couldn't delete: ${error.message}`);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }

  return (
    <>
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
        <div className="container">
          <Link href="/admin" style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
            ← Back to admin
          </Link>

          <div style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <h1 style={{ marginBottom: '4px' }}>Trending Reels</h1>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
              Paste an Instagram reel/post link and optionally link a product so its buy links
              show underneath.
            </p>
          </div>

          <form
            onSubmit={handleAdd}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-card, #fff)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            {message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: message.type === 'success' ? '#15803d' : '#991b1b',
                  border: `1px solid ${message.type === 'success' ? '#86efac' : '#fecaca'}`,
                }}
              >
                {message.text}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
                Instagram post/reel URL *
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                required
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
                Caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Short note shown under the reel"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
                Link a product for buy links (optional)
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              >
                <option value="">— No product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start' }}
            >
              {isSubmitting ? 'Adding…' : '+ Add reel'}
            </button>
          </form>

          {isLoading ? (
            <p style={{ color: 'var(--color-text-light)' }}>Loading…</p>
          ) : posts.length === 0 ? (
            <p style={{ color: 'var(--color-text-light)' }}>No reels yet — add the first one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-card, #fff)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {post.instagram_url}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
                      {post.product ? `Linked to ${post.product.name}` : 'No product linked'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(post)}
                    disabled={deletingId === post.id}
                    className="btn btn-sm"
                    style={{ color: '#991b1b', borderColor: '#fecaca' }}
                  >
                    {deletingId === post.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
