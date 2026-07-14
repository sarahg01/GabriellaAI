'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Product, ProductLink, ProductImage } from '@/types/database';

interface LinkRow {
  // undefined id = not yet saved to product_links
  id?: string;
  label: string;
  url: string;
  price: string;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialProduct?: Product;
  initialBuyLinks?: ProductLink[];
  initialReviewLinks?: ProductLink[];
  initialImages?: ProductImage[];
}

const emptyRow = (): LinkRow => ({ label: '', url: '', price: '' });
const MAX_IMAGES = 10;

export default function ProductForm({
  mode,
  initialProduct,
  initialBuyLinks,
  initialReviewLinks,
  initialImages,
}: ProductFormProps) {
const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(initialProduct?.name ?? '');
  const [brand, setBrand] = useState(initialProduct?.brand ?? '');
  const [category, setCategory] = useState(initialProduct?.category ?? '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? '');
  const [images, setImages] = useState<string[]>(
    initialImages && initialImages.length > 0
      ? initialImages.map((img) => img.image_url)
      : [initialProduct?.image_url ?? '']
  );
  const [description, setDescription] = useState(initialProduct?.description ?? '');

  const [buyLinks, setBuyLinks] = useState<LinkRow[]>(
    initialBuyLinks && initialBuyLinks.length > 0
      ? initialBuyLinks.map((l) => ({
          id: l.id,
          label: l.label ?? '',
          url: l.url,
          price: l.price != null ? String(l.price) : '',
        }))
      : [emptyRow()]
  );
  const [reviewLinks, setReviewLinks] = useState<LinkRow[]>(
    initialReviewLinks && initialReviewLinks.length > 0
      ? initialReviewLinks.map((l) => ({ id: l.id, label: l.label ?? '', url: l.url, price: '' }))
      : [emptyRow()]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Draft autosave — survives accidental refresh/navigation while filling out the form.
  const draftKey = `gabriellaai:product-draft:${mode}:${initialProduct?.id ?? 'new'}`;
  const hasRestoredDraft = useRef(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore any saved draft once, on mount.
  useEffect(() => {
    if (hasRestoredDraft.current) return;
    hasRestoredDraft.current = true;

    try {
      const saved = window.localStorage.getItem(draftKey);
      if (!saved) return;
      const draft = JSON.parse(saved);

      setName(draft.name ?? '');
      setBrand(draft.brand ?? '');
      setCategory(draft.category ?? '');
      setPrice(draft.price ?? '');
      setDescription(draft.description ?? '');
      if (Array.isArray(draft.images) && draft.images.length > 0) setImages(draft.images);
      if (Array.isArray(draft.buyLinks) && draft.buyLinks.length > 0) setBuyLinks(draft.buyLinks);
      if (Array.isArray(draft.reviewLinks) && draft.reviewLinks.length > 0)
        setReviewLinks(draft.reviewLinks);

      setDraftRestored(true);
      // eslint-disable-next-line no-empty
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage on every change, once the initial restore attempt is done.
  useEffect(() => {
    if (!hasRestoredDraft.current) return;
    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({ name, brand, category, price, description, images, buyLinks, reviewLinks })
      );
    } catch {
      // localStorage unavailable (private browsing, quota, etc.) — fail silently.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, brand, category, price, description, images, buyLinks, reviewLinks]);

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
  }

  function updateLink(
    which: 'buy' | 'review',
    index: number,
    field: 'label' | 'url' | 'price',
    value: string
  ) {
    const setter = which === 'buy' ? setBuyLinks : setReviewLinks;
    setter((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addLink(which: 'buy' | 'review') {
    const setter = which === 'buy' ? setBuyLinks : setReviewLinks;
    setter((rows) => [...rows, emptyRow()]);
  }

  function removeLink(which: 'buy' | 'review', index: number) {
    const setter = which === 'buy' ? setBuyLinks : setReviewLinks;
    setter((rows) => (rows.length === 1 ? [emptyRow()] : rows.filter((_, i) => i !== index)));
  }

  function updateImage(index: number, value: string) {
    setImages((urls) => urls.map((u, i) => (i === index ? value : u)));
  }

  function addImage() {
    setImages((urls) => (urls.length >= MAX_IMAGES ? urls : [...urls, '']));
  }

  function removeImage(index: number) {
    setImages((urls) => (urls.length === 1 ? [''] : urls.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const cleanBuyLinks = buyLinks.map((r) => ({ ...r, url: r.url.trim() })).filter((r) => r.url);
    const cleanReviewLinks = reviewLinks
      .map((r) => ({ ...r, url: r.url.trim() }))
      .filter((r) => r.url);
    const cleanImages = images
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, MAX_IMAGES);

    if (cleanImages.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one product image.' });
      return;
    }

    if (cleanBuyLinks.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one buy link.' });
      return;
    }

    setIsLoading(true);

    try {
      const productPayload = {
        name,
        brand,
        category,
        price: parseFloat(price) || 0,
        image_url: cleanImages[0],
        description: description || null,
        // Kept in sync as the "primary" link for backward compatibility with
        // any code that still reads a single affiliate_url / youtube_review_url.
        affiliate_url: cleanBuyLinks[0].url,
        youtube_review_url: cleanReviewLinks[0]?.url ?? null,
      };

      let productId: string;

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single();
        if (error) throw error;
        productId = data.id;
      } else {
        productId = initialProduct!.id;
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId);
        if (error) throw error;

        // Simplest correct approach: replace all existing links/images with
        // the current list rather than trying to diff row-by-row.
        const { error: deleteError } = await supabase
          .from('product_links')
          .delete()
          .eq('product_id', productId);
        if (deleteError) throw deleteError;

        const { error: deleteImagesError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);
        if (deleteImagesError) throw deleteImagesError;
      }

      const imageRows = cleanImages.map((url, i) => ({
        product_id: productId,
        image_url: url,
        sort_order: i,
      }));

      if (imageRows.length > 0) {
        const { error: imagesError } = await supabase.from('product_images').insert(imageRows);
        if (imagesError) throw imagesError;
      }

      const linkRows = [
        ...cleanBuyLinks.map((r, i) => ({
          product_id: productId,
          link_type: 'buy' as const,
          label: r.label || null,
          url: r.url,
          price: r.price.trim() ? parseFloat(r.price) : null,
          sort_order: i,
        })),
        ...cleanReviewLinks.map((r, i) => ({
          product_id: productId,
          link_type: 'review' as const,
          label: r.label || null,
          url: r.url,
          price: null,
          sort_order: i,
        })),
      ];

      if (linkRows.length > 0) {
        const { error: linksError } = await supabase.from('product_links').insert(linkRows);
        if (linksError) throw linksError;
      }

      setMessage({
        type: 'success',
        text: mode === 'create' ? `✨ "${name}" added to Explore.` : `Saved changes to "${name}".`,
      });

      clearDraft();

      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 600);
    } catch (err) {
      const supabaseError = err as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      const parts = [
        supabaseError?.message,
        supabaseError?.details,
        supabaseError?.hint,
        supabaseError?.code ? `(code: ${supabaseError.code})` : null,
      ].filter(Boolean);

      setMessage({
        type: 'error',
        text: parts.length > 0 ? parts.join(' — ') : 'Unknown error (no message on the error object)',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-container">
        <h2 className="form-title">
          {mode === 'create' ? 'Add Product to Explore' : 'Edit Product'}
        </h2>
        <p className="form-subtitle">Products sync to Explore instantly</p>

        {message && (
          <div className={`form-message form-message--${message.type}`}>{message.text}</div>
        )}

        {draftRestored && !message && (
          <div className="form-message form-message--draft">
            Restored your unsaved changes from before the refresh.{' '}
            <button
              type="button"
              className="draft-discard"
              onClick={() => {
                clearDraft();
                window.location.reload();
              }}
            >
              Discard draft
            </button>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dot & Key Sunscreen SPF 50"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="brand">Brand *</label>
            <input
              id="brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g., Dot & Key"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 599"
              step="0.01"
              min="0"
              required
              className="form-input"
            />
          </div>

          <div className="form-group form-group--full">
            <label>
              Product Images * <span className="field-hint">({images.length}/{MAX_IMAGES})</span>
            </label>
            {images.map((url, i) => (
              <div key={i} className="link-row link-row--image">
                <input
                  value={url}
                  onChange={(e) => updateImage(i, e.target.value)}
                  placeholder={
                    i === 0 ? 'https://example.com/product.jpg (cover image)' : 'https://…'
                  }
                  type="url"
                  className="form-input link-url"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="link-remove"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button type="button" onClick={addImage} className="link-add">
                + Add another image
              </button>
            )}
          </div>

          <div className="form-group form-group--full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Product description, benefits, key ingredients... (optional)"
              rows={4}
              className="form-input form-textarea"
            />
          </div>

          {/* Buy links */}
          <div className="form-group form-group--full">
            <label>Buy Links *</label>
            {buyLinks.map((row, i) => (
              <div key={i} className="link-row link-row--price">
                <input
                  value={row.label}
                  onChange={(e) => updateLink('buy', i, 'label', e.target.value)}
                  placeholder="Store name (e.g. Nykaa, Amazon)"
                  className="form-input link-label"
                />
                <input
                  value={row.url}
                  onChange={(e) => updateLink('buy', i, 'url', e.target.value)}
                  placeholder="https://…"
                  type="url"
                  className="form-input link-url"
                />
                <input
                  value={row.price}
                  onChange={(e) => updateLink('buy', i, 'price', e.target.value)}
                  placeholder="₹ Price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input link-price"
                />
                <button
                  type="button"
                  onClick={() => removeLink('buy', i)}
                  className="link-remove"
                  aria-label="Remove buy link"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addLink('buy')} className="link-add">
              + Add another buy link
            </button>
          </div>

          {/* Review links */}
          <div className="form-group form-group--full">
            <label>Review Links (Optional)</label>
            {reviewLinks.map((row, i) => (
              <div key={i} className="link-row">
                <input
                  value={row.label}
                  onChange={(e) => updateLink('review', i, 'label', e.target.value)}
                  placeholder="Platform (e.g. YouTube, Instagram)"
                  className="form-input link-label"
                />
                <input
                  value={row.url}
                  onChange={(e) => updateLink('review', i, 'url', e.target.value)}
                  placeholder="https://…"
                  type="url"
                  className="form-input link-url"
                />
                <button
                  type="button"
                  onClick={() => removeLink('review', i)}
                  className="link-remove"
                  aria-label="Remove review link"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addLink('review')} className="link-add">
              + Add another review link
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="form-submit">
          {isLoading
            ? mode === 'create'
              ? 'Adding Product...'
              : 'Saving...'
            : mode === 'create'
            ? 'Add to Explore'
            : 'Save Changes'}
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

        .form-message--draft {
          background-color: #fffaf0;
          color: #9a6b1f;
          border: 1px solid #f0dca0;
        }

        .draft-discard {
          background: none;
          border: none;
          padding: 0;
          margin-left: 4px;
          color: #9a6b1f;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
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

        .link-row {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 8px;
          margin-bottom: 8px;
        }

        .link-row--price {
          grid-template-columns: 1fr 1.6fr 0.8fr auto;
        }

        .link-row--image {
          grid-template-columns: 1fr auto;
        }

        .field-hint {
          font-weight: 400;
          color: var(--color-text-light, #8c6470);
          font-size: 12px;
        }

        .link-label,
        .link-url,
        .link-price {
          margin: 0;
        }

        .link-remove {
          width: 36px;
          border: 1px solid rgba(200, 180, 160, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.6);
          color: #991b1b;
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
        }

        .link-remove:hover {
          background: #fef2f2;
        }

        .link-add {
          margin-top: 4px;
          background: none;
          border: none;
          color: #b39f8e;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 0;
          text-align: left;
        }

        .link-add:hover {
          color: #9d8a7a;
          text-decoration: underline;
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

          .link-row {
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
