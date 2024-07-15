/** @type {import('next').NextConfig} */
const withTwin = require("./withTwin.js");
const { i18n } = require("./next-i18next.config");
const nextConfig = {
 i18n,
 reactStrictMode: true,
 experimental: {
  typedRoutes: true,
 },
 output: "standalone",
 swcMinify: false,
 images: {
    domains: ['res.cloudinary.com'],
  },
 eslint: {
  ignoreDuringBuilds: true,
 },
};

module.exports = withTwin(nextConfig);
