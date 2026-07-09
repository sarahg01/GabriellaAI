'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import type { Product } from '@/types/database';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'sarahgabriel0001@gmail.com') {
      router.push('/');
      return;
    }

    await fetchProducts();
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setProducts(data ?? []);
    setIsLoading(false);
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This can't be undone — it'll also remove all its buy/review links.`
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    setDeletingId(null);

    if (error) {
      alert(`Couldn't delete: ${error.message}`);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  return (
    <>
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-lg)',
              flexWrap: 'wrap',
              gap: 'var(--spacing-sm)',
            }}
          >
            <div>
              <h1 style={{ marginBottom: '4px' }}>Manage Products</h1>
              <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
                {products.length} product{products.length === 1 ? '' : 's'} on Explore
              </p>
            </div>
            <Link href="/admin/products/new" className="btn btn-primary">
              + Add product
            </Link>
          </div>

          {isLoading ? (
            <p style={{ color: 'var(--color-text-light)' }}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ color: 'var(--color-text-light)' }}>
              No products yet — add the first one.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.map((product) => (
                <div
                  key={product.id}
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
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, marginBottom: '2px' }}>{product.name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-light)' }}>
                      {product.brand} · ₹{product.price}
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    className="btn btn-sm"
                    style={{ color: '#991b1b', borderColor: '#fecaca' }}
                  >
                    {deletingId === product.id ? 'Deleting…' : 'Delete'}
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
