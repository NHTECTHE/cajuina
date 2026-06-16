import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // @ts-ignore - allowedDevOrigins is recognized by Next.js Dev Server
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "10.0.10.12",
    "10.0.10.12:3000"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "10.0.10.12",
        "10.0.10.12:3000",
        "*.ngrok-free.app",
        "*.ngrok.io",
        "*.loca.lt"
      ]
    }
  }
};

export default nextConfig;
