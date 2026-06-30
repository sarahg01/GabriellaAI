'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_url: string;
  category: string;
  youtube_review_url?: string;
  brand: string;
  price_links?: any[];  // Add this
  review_links?: any[];  // Add this
}
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_url: string;
  category: string;
  youtube_review_url?: string;
  brand: string;
}

export function AdminProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    affiliate_url: '',
    category: '',
    youtube_review_url: '',
    brand: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Insert product into Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: formData.image_url,
            affiliate_url: formData.affiliate_url,
            category: formData.category,
            youtube_review_url: formData.youtube_review_url || null,
            brand: formData.brand,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `✨ "${formData.name}" added successfully! It'll appear in Explore shortly.`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        affiliate_url: '',
        category: '',
        youtube_review_url: '',
        brand: '',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Error adding product: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-container">
        <h2 className="form-title">Add Product to Explore</h2>
        <p className="form-subtitle">Products sync to Explore instantly</p>

        {message && (
          <div className={`form-message form-message--${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-grid">
          {/* Product Name */}
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Dot & Key Sunscreen SPF 50"
              required
              className="form-input"
            />
          </div>

          {/* Brand */}
          <div className="form-group">
            <label htmlFor="brand">Brand *</label>
            <input
              id="brand"
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Dot & Key"
              required
              className="form-input"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select category</option>
              <option value="skincare">Skincare</option>
              <option value="makeup">Makeup</option>
              <option value="haircare">Haircare</option>
              <option value="fragrance">Fragrance</option>
              <option value="wellness">Wellness</option>
              <option value="tools">Beauty Tools</option>
            </select>
          </div>

          {/* Price */}
          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 599"
              step="0.01"
              min="0"
              required
              className="form-input"
            />
          </div>

          {/* Image URL */}
          <div className="form-group form-group--full">
            <label htmlFor="image_url">Image URL *</label>
            <input
              id="image_url"
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
              required
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group form-group--full">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description, benefits, key ingredients..."
              rows={4}
              required
              className="form-input form-textarea"
            />
          </div>

          {/* Affiliate URL */}
          <div className="form-group form-group--full">
            <label htmlFor="affiliate_url">Affiliate Buy Link *</label>
            <input
              id="affiliate_url"
              type="url"
              name="affiliate_url"
              value={formData.affiliate_url}
              onChange={handleChange}
              placeholder="https://tira.io/product/..."
              required
              className="form-input"
            />
          </div>

          {/* YouTube Review URL */}
          <div className="form-group form-group--full">
            <label htmlFor="youtube_review_url">YouTube Review URL (Optional)</label>
            <input
              id="youtube_review_url"
              type="url"
              name="youtube_review_url"
              value={formData.youtube_review_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
              className="form-input"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="form-submit"
        >
          {isLoading ? 'Adding Product...' : 'Add to Explore'}
        </button>
      </div>

      <style jsx>{`
        .admin-form {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .form-container {
          background: linear-gradient(135deg, rgba(248, 245, 242, 0.95) 0%, rgba(245, 240, 235, 0.95) 100%);
          border: 1px solid rgba(200, 180, 160, 0.2);
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }

        .form-title {
          font-size: 28px;
          font-weight: 600;
          color: #2a2a2a;
          margin: 0 0 8px 0;
          font-family: var(--font-display, 'Space Grotesk');
        }

        .form-subtitle {
          font-size: 14px;
          color: #888;
          margin: 0 0 24px 0;
          font-family: var(--font-body, 'Inter');
        }

        .form-message {
          margin: 0 0 20px 0;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-family: var(--font-body, 'Inter');
        }

        .form-message--success {
          background-color: #f0fdf4;
          color: #15803d;
          border: 1px solid #86efac;
        }

        .form-message--error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group--full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #2a2a2a;
          margin-bottom: 8px;
          font-family: var(--font-body, 'Inter');
        }

        .form-input,
        .form-textarea {
          padding: 12px 14px;
          border: 1px solid rgba(200, 180, 160, 0.3);
          border-radius: 8px;
          font-size: 14px;
          font-family: var(--font-body, 'Inter');
          transition: all 0.2s ease;
          background-color: rgba(255, 255, 255, 0.8);
          color: #2a2a2a;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #c8b4a0;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(200, 180, 160, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: var(--font-body, 'Inter');
        }

        .form-submit {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #c8b4a0 0%, #b39f8e 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          font-family: var(--font-display, 'Space Grotesk');
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #b39f8e 0%, #9d8a7a 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(200, 180, 160, 0.3);
        }

        .form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-container {
            padding: 24px;
          }

          .form-title {
            font-size: 22px;
          }
        }
      `}</style>
    </form>
  );
}