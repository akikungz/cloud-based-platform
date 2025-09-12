import type { NextConfig } from "next";

import { env } from "@midori/libs/env";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  rewrites: async () => [
    {
      source: "/openapi/:path*",
      destination: `${env.API_URL}/openapi/:path*`,
    },
    {
      source: "/api/:path*",
      destination: `${env.API_URL}/api/:path*`
    },
  ],
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
