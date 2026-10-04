import type { NextConfig } from "next";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBuild =
  process.env.GITHUB_PAGES === "true" || process.env.GITHUB_ACTIONS === "true";
// Project Pages are served at /<repo>/, which is /ARCUS/ for this repository.
const basePath = pagesBuild ? `/${repo || "ARCUS"}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
