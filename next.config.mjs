/** @type {import('next').NextConfig} */

// Detectar si estamos en modo desarrollo o producción
const isDev = process.env.NODE_ENV === 'development'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  // Solo usar 'export' en producción (GitHub Pages necesita archivos estáticos)
  output: isDev ? undefined : 'export',
  
  // Carpeta de salida
  distDir: 'out',
  
  // BasePath solo en producción para GitHub Pages
  basePath: isDev ? '' : '/victorcas30.github.io-dentalsaas-',
  
  // AssetPrefix solo en producción
  assetPrefix: isDev ? '' : '/victorcas30.github.io-dentalsaas-/',
  
  // Configuración de imágenes
  images: {
    unoptimized: true,
  },
  
  // Trailing slash
  trailingSlash: true,
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_BASE_PATH: isDev ? '' : '/victorcas30.github.io-dentalsaas-',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backenddentalsaas-production.up.railway.app/dental_saas/api/v1',
  },
  
  // Deshabilitar la generación de páginas dinámicas en modo export
  // Esto previene el error con rutas [id]
  experimental: {},
  
  // Configuración para evitar problemas con rutas dinámicas en export
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
