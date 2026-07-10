'use client';

import Link from 'next/link';
import ProductForm from '@/components/ProductForm';
import Footer from '@/components/Footer';

export default function NewProductPage() {
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
            <ProductForm mode="create" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
