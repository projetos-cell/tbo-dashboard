import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
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
