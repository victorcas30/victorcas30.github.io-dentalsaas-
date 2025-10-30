'use client'

import { useEffect } from 'react'

export default function BootstrapClient() {
  useEffect(() => {
    // Importar Bootstrap JS dinámicamente
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  return null
}
