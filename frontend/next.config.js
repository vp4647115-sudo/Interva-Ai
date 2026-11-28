/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",

  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Keep the direct API rewrite for local development and route production
  // browser requests through the frontend origin to avoid cross-origin issues.
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
    const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "https://nextapi.vpnpro.in").origin;
    const rewrites = [
      { source: "/backend-api/:path*", destination: `${apiUrl}/:path*` },
    ];
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    if (
      firebaseProjectId &&
      firebaseAuthDomain &&
      firebaseAuthDomain !== `${firebaseProjectId}.firebaseapp.com`
    ) {
      const firebaseOrigin = `https://${firebaseProjectId}.firebaseapp.com`;
      rewrites.push(
        { source: "/__/auth/:path*", destination: `${firebaseOrigin}/__/auth/:path*` },
        { source: "/__/firebase/:path*", destination: `${firebaseOrigin}/__/firebase/:path*` },
      );
    }
    if (!process.env.VERCEL) {
      rewrites.push(
        { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
        { source: "/docs", destination: `${backendUrl}/docs` },
        { source: "/openapi.json", destination: `${backendUrl}/openapi.json` },
      );
    }
    return rewrites;
  },

  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "geolocation=(), browsing-topics=()" },
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.gstatic.com https://apis.google.com",
          "connect-src 'self' https://nextapi.vpnpro.in https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://*.google-analytics.com https://generativelanguage.googleapis.com wss:",
          "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com",
          "media-src 'self' blob:",
          "form-action 'self' https://accounts.google.com",
        ].join("; "),
      },
    ];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }
    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Strict mode catches common React pitfalls early.
  reactStrictMode: true,

  // Forward NEXT_PUBLIC_* env vars are available by default;
  // list any non-public server-side env keys you need at build-time here.
  // env: {},
};

module.exports = nextConfig;
