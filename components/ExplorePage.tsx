// components/ExplorePage.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import type { Product, ProductLink } from '@/types/database';

export default function ExplorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [linksByProduct, setLinksByProduct] = useState<Record<string, ProductLink[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedBrand]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);

      // Extract unique brands
      const uniqueBrands = Array.from(
        new Set((data || []).map((p) => p.brand).filter(Boolean))
      ) as string[];
      setBrands(uniqueBrands.sort());

      // Fetch all links for these products in one query and group by product_id
      const productIds = (data || []).map((p) => p.id);
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
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    setFilteredProducts(filtered);
  };

  return (
    <div style={{ padding: 'var(--spacing-lg)', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'center' }}>
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>✦ Explore Beauty</h1>
          <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-lg)' }}>
            Discover curated luxury beauty products
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-2xl)',
            maxWidth: '600px',
            margin: '0 auto var(--spacing-2xl)',
          }}
        >
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p style={{ color: 'var(--color-text-light)' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p style={{ color: 'var(--color-text-light)' }}>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                buyLinks={(linksByProduct[product.id] || []).filter((l) => l.link_type === 'buy')}
                reviewLinks={(linksByProduct[product.id] || []).filter(
                  (l) => l.link_type === 'review'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}