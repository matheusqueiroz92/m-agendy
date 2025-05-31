import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"], // Para desenvolvimento local
    // Para produção, adicione seu domínio aqui
    // domains: ['localhost', 'yourdomain.com'],
  },
  // Se você quiser usar imagens externas também:
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: '**',
  //     },
  //   ],
  // },
};

export default nextConfig;
