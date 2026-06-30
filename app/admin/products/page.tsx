'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminProductForm from '@/components/AdminProductForm';
import Footer from '@/components/Footer';

export default function AdminPage() {
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
          <AdminProductForm />
        </div>
      </div>
      <Footer />
    </>
  );
}