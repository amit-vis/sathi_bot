import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  redirects: async () => [
    {
      source: "/",
      destination: "/signin",
      permanent: false,
    },
  ],
  allowedDevOrigins: [
    "rewrite-skeleton-petri.ngrok-free.dev",
    "http://localhost:5000",
    "http://localhost:3000",
    "https://sathi-bot.vercel.app/",
    "https://stability-bracelets-better-understand.trycloudflare.com",
    "https://sathi-bot.onrender.com",
  ],
};

export default nextConfig;