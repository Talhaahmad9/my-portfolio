import type { NextConfig } from "next";

const r2Hostname = process.env.NEXT_PUBLIC_R2_PUBLIC_URL 
  ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname 
  : "*.r2.dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: r2Hostname,
      },
    ],
  },
};

export default nextConfig;
