# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

El formato esta basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.0] - 2026-02-24

### Added

- **Autenticacion**: login con 4 usuarios pre-configurados via variables de entorno
  - Validacion server-side con API Route
  - Cookie HMAC-SHA256 firmada (httpOnly, secure, sameSite)
  - Middleware de proteccion de rutas (Edge-compatible)
  - Boton de cerrar sesion en sidebar
- **Modelo de Ingresos**: simulador financiero completo a 12 meses
  - 36 tiers de pricing (3 planes x 3 periodos x 4 packs)
  - Calculo de ISR por tramos PYME Costa Rica
  - IVA cobrado vs credito fiscal
  - Comisiones por linea de negocio
  - Gastos operativos editables
  - Distribucion de dividendos
  - Resumen ejecutivo con 6 KPIs y graficos (Recharts)
  - Celdas editables en tabla de 12 meses
- **Tarifas Publicitarias**: calculadora de precios de pauta
  - 3 modelos: tiempo, CPM, CPC
  - 3 audiencias con tarifas base editables
  - Descuento por todos los espacios (25%)
  - Conversion automatica CRC/USD
- **UI/UX**
  - Sidebar colapsable con navegacion
  - Dark/light mode con persistencia (next-themes)
  - Pagina de login con branding Arclo y gradientes atmosfericos
  - Favicon y logo SVG personalizados
  - Animaciones de entrada (fade-in-up, scale-in)
  - Accesibilidad: ARIA labels, skip-to-content, semantic HTML
- **Arquitectura**
  - Next.js 16 App Router con route groups
  - TypeScript strict, sin `any`
  - Tailwind CSS 4 con oklch color system
  - shadcn/ui + Radix UI para componentes base
  - Dynamic import de Recharts (code splitting)
  - Lazy state initialization (Vercel best practices)
  - Tests unitarios con Vitest + React Testing Library
