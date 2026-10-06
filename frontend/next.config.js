/** @type {import('next').NextConfig} */
if (process.env.VERCEL && !process.env.NEXT_PUBLIC_API_URL?.startsWith("https://")) {
  throw new Error("Set NEXT_PUBLIC_API_URL to the deployed HTTPS API origin in Vercel.");
}

const nextConfig = {
  outputFileTracingRoot: __dirname,

  // Vercel handles image optimization automatically.
  // If you later use next/image with external hosts, add them here.
  images: {
    unoptimized: false,
  },

  // Cross-Origin-Opener-Policy must NOT be same-origin, otherwise Firebase's
  // Google sign-in popup cannot be inspected ("policy would block the
  // window.closed call") and login silently hangs.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },

  // Strict mode catches common React pitfalls early.
  reactStrictMode: true,

  // Forward NEXT_PUBLIC_* env vars are available by default;
  // list any non-public server-side env keys you need at build-time here.
  // env: {},

};

module.exports = nextConfig;
