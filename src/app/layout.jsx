import './globals.css'
import './horizontal-styles.css'

export const metadata = {
  title: 'DentalSaaS - Sistema de Gestión Dental',
  description: 'Sistema integral para la gestión de clínicas dentales',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-bs-theme="light" data-color-theme="Blue_Theme">
      <head>
        {/* Bootstrap CSS */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" 
          crossOrigin="anonymous"
        />
        
        {/* Tabler Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" 
        />
        
        {/* Google Fonts - Poppins */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        
        {/* Bootstrap JS Bundle (incluye Popper) */}
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" 
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" 
          crossOrigin="anonymous"
          async
        ></script>
      </body>
    </html>
  )
}
