import type { NextConfig } from "next";
import path from "path";
import { withSerwist } from "@serwist/turbopack";

const isDesktop = process.env.IS_DESKTOP === "true";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: (isDesktop && isProd) ? "export" : undefined,
  images: {
    unoptimized: isDesktop,
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    root: path.resolve(__dirname, "./"),
  },
};

export default withSerwist(nextConfig);
