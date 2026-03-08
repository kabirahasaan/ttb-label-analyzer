const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    // Don't fail builds on ESLint errors during deployment
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
