import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build "standalone": empacota só o necessário para rodar (server.js +
  // node_modules mínimos) em `.next/standalone`. Reduz drasticamente o
  