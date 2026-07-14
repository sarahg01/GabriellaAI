'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

const SCRIPT_ID = 'instagram-embed-script';

export default function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    function process() {
      window.instgrm?.Embeds.process();
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      // Script already loaded (or loading) from a previous embed on the page.
      if (window.instgrm) {
        process();
      } else {
        existing.addEventListener('load', process);
      }
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = process;
      document.body.appendChild(script);
    }
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: '#FFF',
        border: 0,
        borderRadius: '8px',
        margin: '0 auto',
        maxWidth: '540px',
        minWidth: '260px',
        width: '100%',
      }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        View this post on Instagram
      </a>
    </blockquote>
  );
}
