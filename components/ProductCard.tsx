// components/ProductCard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ShareButton from './ShareButton';
import type { ProductLink, ProductImage } from '@/types/database';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    description?: string | null;
    price: number;
    category: string;
    image_url: string;
    affiliate_url: string;
    youtube_review_url?: string | null;
    buy_clicks: number;
    review_clicks: number;
  };
  // Full set of buy/review links for this product. When omitted or empty,
  // falls back to the single affiliate_url / youtube_review_url fields for
  // backward compatibility with products added before multi-link support.
  buyLinks?: ProductLink[];
  reviewLinks?: ProductLink[];
  // Full image gallery (up to 10). Falls back to product.image_url alone
  // when omitted or empty, for products added before gallery support.
  images?: ProductImage[];
  onSave?: (productId: string, isSaved: boolean) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
}

export default function ProductCard({
  product,
  buyLinks,
  reviewLinks,
  images,
  onSave,
  onDelete,
  isAdmin,
}: ProductCardProps) {
  const supabase = createClient();
  const effectiveImages: string[] =
    images && images.length > 0 ? images.map((img) => img.image_url) : [product.image_url];
  const effectiveBuyLinks: { label: string; url: string; price: number | null }[] =
    buyLinks && buyLinks.length > 0
      ? buyLinks.map((l, i) => ({
          label: l.label || `Buy${buyLinks.length > 1 ? ` (${i + 1})` : ''}`,
          url: l.url,
          price: l.price ?? null,
        }))
      : [{ label: 'Buy', url: product.affiliate_url, price: product.price ?? null }];

  const effectiveReviewLinks: { label: string; url: string }[] =
    reviewLinks && reviewLinks.length > 0
      ? reviewLinks.map((l, i) => ({ label: l.label || `Review${reviewLinks.length > 1 ? ` (${i + 1})` : ''}`, url: l.url }))
      : product.youtube_review_url
      ? [{ label: 'Review', url: product.youtube_review_url }]
      : [];
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Swipeable image gallery — touch swipe works natively via overflow-x-auto,
  // but we add mouse wheel + click-drag too so it works on laptop/desktop.
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryDragState = useRef({ isDragging: false, startX: 0, startScrollLeft: 0, moved: false });

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, []);

  const handleGalleryMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el) return;
    galleryDragState.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleGalleryMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el || !galleryDragState.current.isDragging) return;
    const delta = e.clientX - galleryDragState.current.startX;
    if (Math.abs(delta) > 3) galleryDragState.current.moved = true;
    el.scrollLeft = galleryDragState.current.startScrollLeft - delta;
  };

  const endGalleryDrag = () => {
    galleryDragState.current.isDragging = false;
  };

  const handleGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el || el.clientWidth === 0) return;
    setCurrentImageIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Let laptop/desktop users scroll the actions row too — not just touch
  // swipe. Plain mouse wheels only scroll vertically by default, and there's
  // no drag-to-scroll without this, so we add both by hand.
  const actionsRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDragging: false, startX: 0, startScrollLeft: 0, moved: false });

  // React's onWheel is passive by default, so preventDefault() inside it is
  // silently ignored — a native listener is the only way to actually hijack
  // the wheel and turn vertical scroll into horizontal movement here.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;

    const onWheelNative = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, []);

  const handleActionsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = actionsRef.current;
    if (!el) return;
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleActionsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = actionsRef.current;
    if (!el || !dragState.current.isDragging) return;
    const delta = e.clientX - dragState.current.startX;
    if (Math.abs(delta) > 3) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScrollLeft - delta;
  };

  const endActionsDrag = () => {
    dragState.current.isDragging = false;
  };

  // After a real drag, swallow the click that would otherwise fire on the
  // button the cursor happens to land on.
  const handleActionsClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

  useEffect(() => {
    checkIfSaved();
  }, [product.id]);

  const checkIfSaved = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_pins')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (!error && data) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const handleSaveToggle = async () => {
    setIsLoadingSave(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to save products');
        return;
      }

      if (isSaved) {
        await supabase
          .from('saved_pins')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);
        setIsSaved(false);
        onSave?.(product.id, false);
      } else {
        await supabase.from('saved_pins').insert({
          user_id: user.id,
          product_id: product.id,
        });
        setIsSaved(true);
        onSave?.(product.id, true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      alert('Failed to save product');
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleBuyClick = async (url: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('clicks').insert({
          product_id: product.id,
          click_type: 'buy',
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error('Error logging click:', err);
    } finally {
      window.open(url, '_blank');
    }
  };

  const handleReviewClick = async (url: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('clicks').insert({
          product_id: product.id,
          click_type: 'review',
          user_id: user.id,
        });
      }
    } catch (err) {
      console.error('Error logging click:', err);
    } finally {
      window.open(url, '_blank');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This can't be undone — it'll also remove all its buy/review links.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      onDelete?.(product.id);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert("Couldn't delete this product. Only admins can delete products.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Image */}
      <div
        style={{
          position: 'relative',
          paddingBottom: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-md)',
          backgroundColor: 'var(--color-blush-light)',
        }}
      >
        <div
          ref={galleryRef}
          onMouseDown={handleGalleryMouseDown}
          onMouseMove={handleGalleryMouseMove}
          onMouseUp={endGalleryDrag}
          onMouseLeave={endGalleryDrag}
          onScroll={handleGalleryScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: effectiveImages.length > 1 ? 'grab' : 'default',
          }}
        >
          {effectiveImages.map((src, i) => (
            <div
              key={i}
              className="shrink-0 snap-start"
              style={{ width: '100%', height: '100%' }}
            >
              <img
                src={src}
                alt={`${product.name}${effectiveImages.length > 1 ? ` (${i + 1}/${effectiveImages.length})` : ''}`}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {effectiveImages.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '5px',
              padding: '4px 8px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
            }}
          >
            {effectiveImages.map((_, i) => (
              <span
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '9999px',
                  backgroundColor:
                    i === currentImageIndex ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                  transition: 'background-color 0.15s ease',
                }}
              />
            ))}
          </div>
        )}

        {isAdmin && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              gap: '6px',
            }}
          >
            <Link
              href={`/admin/products/${product.id}/edit`}
              aria-label={`Edit ${product.name}`}
              title="Edit product"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'var(--color-dark)',
                boxShadow: 'var(--shadow-md)',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              ✎
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`Delete ${product.name}`}
              title="Delete product"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                color: 'var(--color-error)',
                boxShadow: 'var(--shadow-md)',
                fontSize: '14px',
                cursor: isDeleting ? 'default' : 'pointer',
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              {isDeleting ? '…' : '🗑'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-sm)' }}>
        {product.name}
      </h3>

      <p style={{ color: 'var(--color-gold)', fontWeight: '500', marginBottom: 'var(--spacing-sm)' }}>
        {product.brand}
      </p>

      <p style={{ color: 'var(--color-gold)', fontWeight: '500', marginBottom: 'var(--spacing-md)' }}>
        ₹{product.price}
      </p>

      {product.description && (
        <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-light)' }}>
          {product.description}
        </p>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-lg)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-light)',
          marginBottom: 'var(--spacing-md)',
          paddingBottom: 'var(--spacing-md)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span>👁️ {product.buy_clicks} views</span>
        {product.review_clicks > 0 && <span>⭐ {product.review_clicks} reviews</span>}
      </div>

      {/* Actions — horizontally swipeable when there are more links than fit.
          Supports touch swipe, trackpad swipe, mouse wheel, and click-drag. */}
      <div
        ref={actionsRef}
        onMouseDown={handleActionsMouseDown}
        onMouseMove={handleActionsMouseMove}
        onMouseUp={endActionsDrag}
        onMouseLeave={endActionsDrag}
        onClickCapture={handleActionsClickCapture}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          gap: 'var(--spacing-sm)',
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--spacing-md)',
          cursor: 'grab',
        }}
      >
        {effectiveBuyLinks.map((link, i) => (
          <button
            key={`buy-${i}`}
            onClick={() => handleBuyClick(link.url)}
            className="btn btn-primary btn-sm shrink-0 snap-start whitespace-nowrap"
          >
            💳 {link.label}
            {link.price != null && (
              <span style={{ marginLeft: '4px', fontWeight: 700 }}>· ₹{link.price}</span>
            )}
          </button>
        ))}

        {effectiveReviewLinks.map((link, i) => (
          <button
            key={`review-${i}`}
            onClick={() => handleReviewClick(link.url)}
            className="btn btn-secondary btn-sm shrink-0 snap-start whitespace-nowrap"
          >
            📸 {link.label}
          </button>
        ))}

        <button
          onClick={handleSaveToggle}
          disabled={isLoadingSave}
          className={`btn btn-sm shrink-0 snap-start ${isSaved ? 'btn-primary' : 'btn-ghost'}`}
        >
          {isSaved ? '📌' : '📍'}
        </button>
      </div>
    </div>
  );
}
