import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.7'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.teqfocus.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
