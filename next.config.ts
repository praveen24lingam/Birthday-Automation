import type { NextConfig } from "next";

// Static export: the whole site builds to /out and can be hosted on
// Firebase Hosting (or any static host) for free.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
