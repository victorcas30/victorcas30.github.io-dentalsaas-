/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/victorcas30.github.io-dentalsaas-',
  assetPrefix: '/victorcas30.github.io-dentalsaas-/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
