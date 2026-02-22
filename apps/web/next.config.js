/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@codesync/db", "@codesync/socket-types"],

  experimental: {
    turbo: {
      resolveAlias: {
        "@swc/helpers": "@swc/helpers",
      },
    },
  },
};

module.exports = nextConfig;