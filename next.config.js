const path = require("path");
const pagekageJson = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{
        loader: '@svgr/webpack', options: {
          icon: true,
          typescript: true,
          ext: 'tsx',
        }
      }],
    });
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'place-hold.it' },
      { protocol: 'https', hostname: 'media.fiittoken.io' },
      { protocol: 'https', hostname: 's3-dev.speedkub.io' },
      { protocol: 'https', hostname: 's3.speedkub.io' },
      { protocol: 'https', hostname: 'test902.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.dev.fiittoken.io' },
    ],
  },
  env: {
    APP_VERSION: pagekageJson.version || '',
  },
}

module.exports = nextConfig
