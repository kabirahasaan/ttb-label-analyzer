const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    // Ensure output file tracing uses the monorepo root on Vercel.
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  eslint: {
    // Don't fail builds on ESLint errors during deployment
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

module.exports = nextConfig;
