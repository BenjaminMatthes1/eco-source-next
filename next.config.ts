// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Use 'http' if applicable
        hostname: 'your-domain.com', // Replace with your actual domain
        port: '',
        pathname: '/public/images',
      },
      // Add more patterns if needed
    ],
  },
  // Removed the 'env' object
  // Removed the 'rewrites' function
  // Adjusted or removed 'webpack' configuration as per your choice
};

export default nextConfig;
