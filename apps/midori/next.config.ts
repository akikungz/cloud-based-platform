import type { NextConfig } from "next";

import { env } from "@midori/libs/env";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  rewrites: async () => [
    {
      source: "/docs/:path*",
      destination: `${env.BACKEND_URL}/docs/:path*`,
    },
    {
      source: "/api/:path*",
      destination: `${env.BACKEND_URL}/api/:path*`
    },
  ],
};

export default nextConfig;
