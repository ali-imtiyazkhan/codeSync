/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@codesync/db", "@codesync/socket-types", "@excalidraw/excalidraw"],

  experimental: {
    turbo: {
      resolveAlias: {
        "@swc/helpers": "@swc/helpers",
      },
    },
  },
};

module.exports = nextConfig;