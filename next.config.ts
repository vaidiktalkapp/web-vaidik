import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,  // ← add this
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    if (isServer) {
      config.externals = [...(config.externals || []), 'agora-rtc-sdk-ng'];
    }

    if (dev) {
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;