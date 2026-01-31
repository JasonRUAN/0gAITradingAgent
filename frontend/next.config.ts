import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许与浏览器扩展交互（MetaMask 等钱包）
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension:;",
          },
        ],
      },
    ];
  },
  
  // 禁用严格模式以避免与某些钱包扩展的兼容性问题
  reactStrictMode: false,
};

export default nextConfig;
