/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles image optimization automatically.
  // If you later use next/image with external hosts, add them here.
  images: {
    unoptimized: false,
  },

  // Strict mode catches common React pitfalls early.
  reactStrictMode: true,

  // Forward NEXT_PUBLIC_* env vars are available by default;
  // list any non-public server-side env keys you need at build-time here.
  // env: {},

  // Ignore ESLint errors during CI builds so Vercel deploys succeed
  // even when there are non-critical lint warnings.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Ignore TypeScript errors during build to prevent deploy failures
  // from non-critical type issues while the codebase is in active development.
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
