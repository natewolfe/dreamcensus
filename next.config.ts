import type { NextConfig } from 'next'

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

const config: NextConfig = {
  /* Core */
  reactStrictMode: true,
  poweredByHeader: false,
  
  /* Webpack: Prevent traversing Windows junctions during build */
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    }
    return config
  },

  /* Performance */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /* Security Headers */
  async headers() {
    // CSP configuration based on environment
    // Development: Allow unsafe-eval for hot reload and dev tools
    // Production: Strict CSP without unsafe directives
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline'" // TODO: Migrate to nonce-based inline scripts
    
    // Note: 'unsafe-inline' for styles is required by Tailwind CSS
    // Consider migrating to nonce-based approach if this becomes a concern
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default config

