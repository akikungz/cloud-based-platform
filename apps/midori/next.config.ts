import { env } from "@midori/libs/env";
import type { NextConfig } from "next";

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
  // allowedDevOrigins: [env.API_URL, env.FRONTEND_BASE_URL],
};

export default nextConfig;
