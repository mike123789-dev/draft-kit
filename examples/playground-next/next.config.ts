import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@draftkit/core", "@draftkit/react", "@draftkit/next"],
};

export default nextConfig;
