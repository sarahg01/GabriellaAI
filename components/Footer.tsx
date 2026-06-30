// components/Footer.tsx
'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-dark)',
        color: 'var(--color-blush-light)',
        padding: 'var(--spacing-2xl) var(--spacing-lg)',
        marginTop: 'var(--spacing-2xl)',
        borderTop: '2px solid var(--color-gold)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-2xl)',
            marginBottom: 'var(--spacing-2xl)',
            paddingBottom: 'var(--spacing-2xl)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          {/* Brand */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-gold)',
                marginBottom: 'var(--spacing-md)',
                fontSize: 'var(--font-size-2xl)',
              }}
            >
              ✦ GabriellaAI
            </h3>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)' }}>
              Discover curated luxury beauty products with AI-powered recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-gold)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Explore
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                <a
                  href="/explore"
                  style={{
                    color: 'var(--color-blush-light)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-blush-light)';
                  }}
                >
                  → Products
                </a>
              </li>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                <a
                  href="/saved"
                  style={{
                    color: 'var(--color-blush-light)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-blush-light)';
                  }}
                >
                  → Saved Pins
                </a>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-gold)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              Connect
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                gap: 'var(--spacing-lg)',
              }}
            >
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-gold)',
                    fontSize: 'var(--font-size-xl)',
                    transition: 'transform var(--transition-fast)',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                  }}
                >
                  📷
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-gold)',
                    fontSize: 'var(--font-size-xl)',
                    transition: 'transform var(--transition-fast)',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                  }}
                >
                  𝕏
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-gold)',
                    fontSize: 'var(--font-size-xl)',
                    transition: 'transform var(--transition-fast)',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
                  }}
                >
                  f
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-light)',
              margin: 0,
            }}
          >
            © {currentYear} GabriellaAI. All rights reserved. ✦
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-lg)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-light)',
            }}
          >
            <a
              href="#"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-light)';
              }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-light)';
              }}
            >
              Terms of Service
            </a>
            <a
              href="#"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-light)';
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
