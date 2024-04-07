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
  // domains: [
  //   "link-2-team-development.s3.ap-southeast-1.amazonaws.com",
  //   "link-2-team-staging.s3.ap-southeast-1.amazonaws.com",
  //   "link-2-team-production.s3.ap-southeast-1.amazonaws.com",
  //   "link-2-team-public.s3.ap-southeast-1.amazonaws.com",
  // ],
 },
 eslint: {
  ignoreDuringBuilds: true,
 },
};

module.exports = withTwin(nextConfig);
