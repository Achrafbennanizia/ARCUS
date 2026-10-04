import type { NextConfig } from "next";

const isGithubPages =
  process.env.GITHUB_PAGES === "true" ||
  process.env.NEXT_PUBLIC_BASE_PATH === "/arcus-lamp";

const basePath = isGithubPages ? "/arcus-lamp" : "";

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
