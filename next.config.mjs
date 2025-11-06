/** @type {import('next').NextConfig} */

// Detectar si estamos en modo desarrollo o producción
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  // Solo usar 'export' en producción para GitHub Pages
  output: isDev ? undefined : 'export',
  
  // Carpeta de salida
  distDir: 'out',
  
  // BasePath para GitHub Pages
  basePath: isDev ? '' : '/victorcas30.github.io-dentalsaas-',
  
  // AssetPrefix para GitHub Pages
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
  
  // CRÍTICO: Deshabilitar SSG para rutas dinámicas
  // Esto evita el error con generateStaticParams en 'use client'
  experimental: {
    // Forzar todas las páginas a ser estáticas en build time
    isrMemoryCacheSize: 0,
  },
  
  // Configuración de TypeScript y ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // NUEVO: Configuración para evitar errores con rutas dinámicas en export
  // Next.js 15 requiere que todas las páginas sean pre-renderizables
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
