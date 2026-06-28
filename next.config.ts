import type { NextConfig } from "next";
import path from "path";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
  },
});

const isDesktop = process.env.IS_DESKTOP === "true";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: (isDesktop && isProd) ? "export" : undefined,
  images: {
    unoptimized: isDesktop,
  },
  turbopack: {
    root: path.resolve(__dirname, "./"),
  },
};

export default withPWA(nextConfig);
