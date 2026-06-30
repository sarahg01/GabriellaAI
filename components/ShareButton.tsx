// components/ShareButton.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface ShareButtonProps {
  productTitle: string;
  productUrl: string;
}

export default function ShareButton({ productTitle, productUrl }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareText = `Check out this amazing product: ${productTitle}`;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`;
        window.open(url, '_blank');
        setShowMenu(false);
      },
    },
    {
      name: 'Twitter',
      icon: '𝕏',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
        window.open(url, '_blank');
        setShowMenu(false);
      },
    },
    {
      name: 'Instagram',
      icon: '📷',
      action: () => {
        alert('Share on Instagram: Copy the link and paste it in your Instagram story or bio!');
        handleCopyLink();
        setShowMenu(false);
      },
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      action: () => {
        handleCopyLink();
        setShowMenu(false);
      },
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
        flex: 1,
      }}
    >
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn btn-secondary btn-sm"
        style={{
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {copied ? '✓ Copied!' : '📤 Share'}
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 'var(--spacing-sm)',
            backgroundColor: 'white',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 10,
            minWidth: '160px',
            overflow: 'hidden',
          }}
        >
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                width: '100%',
                padding: 'var(--spacing-md)',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text)',
                transition: 'background-color var(--transition-fast)',
                borderBottom: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-blush-light)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px' }}>{option.icon}</span>
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
