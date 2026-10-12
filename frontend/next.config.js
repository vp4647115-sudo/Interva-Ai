/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",

  // Vercel handles image optimization automatically.
  // If you later use next/image with external hosts, add them here.
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Do not set Cross-Origin-Opener-Policy here. The default `unsafe-none`
  // policy lets Firebase's cross-origin Google sign-in popup call
  // `window.closed` without browser warnings or a blocked sign-in flow.
  //
  // API calls intentionally go straight to NEXT_PUBLIC_API_URL. A rewrite to
  // 127.0.0.1 works only on a developer's machine; in Vercel it becomes an
  // unreachable private host and turns every /api request into a 404.

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
