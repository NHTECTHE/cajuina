import type { NextConfig } from "next";

const devOrigins = process.env.NEXT_PUBLIC_DEV_ORIGINS?.split(",").map(s => s.trim()) ?? [];

const nextConfig: NextConfig = {
  // Gera um build autocontido em .next/standalone para uma imagem Docker enxuta.
  output: "standalone",
  images: {
    qualities: [25, 50, 75, 100],
  },
  // Allows Next.js to serve dev resources over the local network
  allowedDevOrigins: ["10.0.10.16", "localhost", "127.0.0.1", ...devOrigins.map(o => o.split(':')[0])],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "10.0.10.16:3000",
        ...devOrigins,
      ],
    },
  },
};

export default nextConfig;
