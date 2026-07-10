'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ProductForm from '@/components/ProductForm';
import Footer from '@/components/Footer';
import type { Product, ProductLink } from '@/types/database';

export default function EditProductPage() {
  const supabase = createClient();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [buyLinks, setBuyLinks] = useState<ProductLink[]>([]);
  const [reviewLinks, setReviewLinks] = useState<ProductLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    const [{ data: productData, error: productError }, { data: linksData }] = await Promise.all([
      supabase.from('products').select('*').eq('id', productId).single(),
      supabase
        .from('product_links')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true }),
    ]);

    if (productError || !productData) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setProduct(productData);
    setBuyLinks((linksData ?? []).filter((l) => l.link_type === 'buy'));
    setReviewLinks((linksData ?? []).filter((l) => l.link_type === 'review'));
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
        <p style={{ color: 'var(--color-text-light)' }}>Loading...</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
        <div className="container">
          <p>Product not found.</p>
          <Link href="/admin/products">← Back to products</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
        <div className="container">
          <Link
            href="/admin/products"
            style={{ fontSize: '13px', color: 'var(--color-text-light)' }}
          >
            ← Back to products
          </Link>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <ProductForm
              mode="edit"
              initialProduct={product}
              initialBuyLinks={buyLinks}
              initialReviewLinks={reviewLinks}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
