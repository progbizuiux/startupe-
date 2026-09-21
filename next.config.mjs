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
    /* Next 16 treats this as an allowlist and defaults to [75], so a quality
       prop outside it is silently coerced down. 90 is here for the hero photos. */
    qualities: [75, 90],
    // Add external image hosts you load with next/image here
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
