import type { NextConfig } from "next";

import { env } from "@midori/libs/env";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    instrumentationHook: false,
    serverComponentsExternalPackages: ['@opentelemetry/api'],
  },
  telemetry: {
    disabled: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude OpenTelemetry packages from server bundle
      config.externals = config.externals || [];
      config.externals.push('@opentelemetry/api');
    }
    return config;
  },
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
