// next.config.ts
import { NextConfig } from 'next';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Leave empty for local images only
  },
};

export default nextConfig;

