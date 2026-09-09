import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the project root so a stray lockfile in a parent folder is ignored
  turbopack: { root: __dirname },
  images: {
    formats: ["image/avif", "image/webp"],
    // Add external image hosts you load with next/image here
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
