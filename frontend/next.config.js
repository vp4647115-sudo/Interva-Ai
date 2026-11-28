/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingRoot: __dirname,
  },
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

  // Rewrites for proxying API calls to FastAPI in local/custom domain setups
  async rewrites() {
    if (process.env.VERCEL) {
      return [];
    }
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/docs",
        destination: `${backendUrl}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${backendUrl}/openapi.json`,
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
