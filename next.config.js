/** @type {import('next').NextConfig} */
const withTwin = require("./withTwin.js");
const { i18n } = require("./i18nConfig");

const nextConfig = {
 i18n,
 reactStrictMode: true,
 experimental: {
  typedRoutes: true,
 },
 output: "standalone",
 swcMinify: true,
 images: {
    domains: ['res.cloudinary.com'],
  },
 eslint: {
  ignoreDuringBuilds: true,
 },
};

module.exports = withTwin(nextConfig);

