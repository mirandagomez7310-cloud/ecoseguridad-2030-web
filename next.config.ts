import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ Ignora errores de TypeScript durante el build de Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Ignora errores de ESLint durante el build de Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
