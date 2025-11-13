'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Importar FullCalendar dinámicamente
const FullCalendar = dynamic(
  () => import('@fullcalendar/react').then((mod) => mod.default || mod.FullCalendar),
  { 
    ssr: false,
    loading: () => (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Cargando calendario...</p>
      </div>
    )
  }
)

export default function FullCalendarWrapper(props) {
  const [plugins, setPlugins] = useState(null)
  const [locale, setLocale] = useState(null)

  useEffect(() => {
    // Cargar plugins y locale
    Promise.all([
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/timegrid'),
      import('@fullcalendar/interaction'),
      import('@fullcalendar/core/locales/es')
    ]).then(([dayGrid, timeGrid, interaction, esLocale]) => {
      setPlugins([dayGrid.default, timeGrid.default, interaction.default])
      setLocale(esLocale.default)
    }).catch((err) => {
      console.error('Error loading FullCalendar plugins:', err)
    })
  }, [])

  if (!plugins || !locale) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Cargando calendario...</p>
      </div>
    )
  }

  return (
    <FullCalendar
      {...props}
      plugins={plugins}
      locale={locale}
    />
  )
}

