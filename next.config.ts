import type { NextConfig } from "next";

function r2PublicHostnamePattern():
  | { protocol: "https"; hostname: string; pathname: string }
  | null {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!base) return null;
  try {
    const u = new URL(base);
    if (u.protocol !== "https:" || !u.hostname) return null;
    return {
      protocol: "https",
      hostname: u.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const r2FromEnv = r2PublicHostnamePattern();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      ...(r2FromEnv ? [r2FromEnv] : []),
    ],
  },
};

export default nextConfig;
