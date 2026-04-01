import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  async redirects() {
    return [
      // TBO Culture hub consolidation — redirect old routes
      { source: "/okrs", destination: "/cultura/okrs", permanent: true },
      { source: "/okrs/:path*", destination: "/cultura/okrs/:path*", permanent: true },
      { source: "/conhecimento", destination: "/cultura/conhecimento", permanent: true },
      { source: "/conhecimento/:path*", destination: "/cultura/conhecimento/:path*", permanent: true },
      { source: "/blog", destination: "/cultura/blog", permanent: true },
      { source: "/blog/:path*", destination: "/cultura/blog/:path*", permanent: true },
    ];
  },
  allowedDevOrigins: ["http://127.0.0.1:3001", "http://localhost:3001"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "wearetbo.com.br",
      },
    ],
  },
};

export default nextConfig;
