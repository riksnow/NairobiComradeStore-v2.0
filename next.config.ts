import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from any HTTPS source (Unsplash, Cloudinary, your CDN, etc.).
    remotePatterns: [{ protocol: "https", hostname: "**" }],

    // WebP output — broad, reliable support via sharp. (AVIF is intentionally
    // omitted: it needs sharp built with AVIF/libaom support, which many
    // environments lack, and missing support makes the optimizer return 500.)
    formats: ["image/webp"],

    // Quality levels the optimizer is allowed to emit. (Next 16 will require
    // this to be declared; we keep high values for crisp product/hero imagery.)
    qualities: [25, 50, 60, 75, 80, 85, 90, 92, 100],

    // Widths the optimizer can generate. Tuned to our breakpoints so phones
    // download small files and large screens still get sharp, retina images.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560],
    imageSizes: [48, 64, 80, 96, 128, 160, 256, 384],

    // Cache optimized variants for 31 days so repeat visits are instant.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
