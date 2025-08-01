import { env } from "@midori/libs/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
  output: "standalone",
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${env.API_URL}/api/:path*`
    }
  ]
};

export default nextConfig;
