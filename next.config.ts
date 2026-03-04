import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // @xenova/transformers pulls in Node-only deps (sharp, onnxruntime-node).
    // We only use it in the browser, so alias them to empty stubs.
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    }
    return config
  },
};

export default nextConfig;
