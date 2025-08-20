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
    domains: [
      "place-hold.it",
      "media.fiittoken.io",
      "s3-dev.speedkub.io",
      "s3.speedkub.io",
      "test902.s3.amazonaws.com",
      "picsum.photos",
      "images.unsplash.com",
      "media.dev.fiittoken.io",
    ],
  },
  publicRuntimeConfig: {
    appVersion: pagekageJson.version || '',
  },
}

module.exports = nextConfig
