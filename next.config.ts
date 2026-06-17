import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um build autocontido em .next/standalone para uma imagem Docker enxuta.
  output: "standalone",
};

export default nextConfig;
