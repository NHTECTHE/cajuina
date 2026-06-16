import type { NextConfig } from "next";

const devOrigins = process.env.NEXT_PUBLIC_DEV_ORIGINS?.split(",").map(s => s.trim()) ?? [];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        ...devOrigins,
      ],
    },
  },
};

export default nextConfig;
