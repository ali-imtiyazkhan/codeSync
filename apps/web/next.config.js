/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@codesync/db", "@codesync/socket-types"],
};

module.exports = nextConfig;
