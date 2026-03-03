import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Enable WebAssembly for WASM-based background removal processing
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // Ignore missing optional node modules if running purely client side
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
    }

    return config;
  },
};

export default nextConfig;
