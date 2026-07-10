'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#991b1b', marginBottom: '12px' }}>Something broke</h2>
      <p style={{ marginBottom: '16px', whiteSpace: 'pre-wrap' }}>{error.message}</p>
      {error.digest && (
        <p style={{ marginBottom: '16px', color: '#888' }}>Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        style={{
          padding: '10px 20px',
          background: '#c8b4a0',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
