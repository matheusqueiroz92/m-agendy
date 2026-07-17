import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build "standalone": empacota só o necessário para rodar (server.js +
  // node_modules mínimos) em `.next/standalone`. Reduz drasticamente o
  // tamanho da imagem Docker e é o formato recomendado pelo Next.js para
  // deploy em container (ver Dockerfile na raiz do projeto).
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
