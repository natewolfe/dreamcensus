import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack with custom watch options to ignore database files
  // Turbopack doesn't support watchOptions yet, so we use webpack explicitly
  webpack: (config, { isServer }) => {
    // Ignore database files and other generated content from file watcher
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/prisma/dev.db*',      // SQLite database and journal files
        '**/prisma/*.db*',         // Any .db files in prisma folder
        '**/src/generated/**',     // Generated Prisma client
        '**/.cursor/**',           // Cursor debug files
        '**/debug.log',
      ],
    };
    return config;
  },
  
  // Security headers - CSP disabled in dev to allow hot reload
  async headers() {
    // No CSP in development - HMR needs eval()
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    
    // Production security headers
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://images.typeform.com data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "upgrade-insecure-requests",
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
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Note: interest-cohort is deprecated, use browsingTopics instead
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
