'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductForm from '@/components/ProductForm';
import Footer from '@/components/Footer';

export default function NewProductPage() {
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== 'sarahgabriel0001@gmail.com') {
      router.push('/');
    }
  };

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
