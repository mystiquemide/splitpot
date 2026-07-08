import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tetherto/wdk",
    "@tetherto/wdk-wallet-evm",
    "@tetherto/wdk-wallet",
    "sodium-universal",
  ],
  turbopack: {
    resolveAlias: {
      // Browser build of sodium-universal expects this alias
      "sodium-native": "sodium-javascript",
    },
  },
  // Fallback when building with --webpack
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sodium-native": path.resolve(
        process.cwd(),
        "node_modules/sodium-javascript"
      ),
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

export default nextConfig
