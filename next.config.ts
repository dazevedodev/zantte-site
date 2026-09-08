import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // upload de imagem de produto no admin passa do limite padrão de 1mb
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
