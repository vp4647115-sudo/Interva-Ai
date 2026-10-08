/** @type {import('next').NextConfig} */
if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL?.startsWith("https://")) {
  throw new Error("Set NEXT_PUBLIC_API_URL to the deployed HTTPS API origin in Vercel.");
}

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

  // Cross-Origin-Opener-Policy must NOT be same-origin, otherwise Firebase's
  // Google sign-in popup cannot be inspected ("policy would block the
  // window.closed call") and login silently hangs.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
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
