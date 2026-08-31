import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['rewrite-skeleton-petri.ngrok-free.dev',
    "http://localhost:5000","http://localhost:3000",
    "https://stability-bracelets-better-understand.trycloudflare.com"]
};

export default nextConfig;
