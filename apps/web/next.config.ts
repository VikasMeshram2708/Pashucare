import type { NextConfig } from "next";
import "./app/env";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
  typedRoutes: true,
  cacheComponents: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
