import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const config: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    // Without a 3840 breakpoint the largest srcset candidate stays at 2048: before layout
    // settles a lazy image can otherwise be requested at 3840, and upscaling a small source
    // to a 19MP encode stalls that request. Every source here is already WebP, so WebP-only
    // output avoids a second, much slower AVIF encode that is also cached separately.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    formats: ["image/webp"],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default config;
