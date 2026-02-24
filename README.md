# Arclo Simulador

Simulador financiero para Arclo Systems — herramienta interna de proyecciones de ingresos y tarifas publicitarias para startup tecnologica S.A. PYME Costa Rica.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS 4** + **shadcn/ui** + **Radix UI**
- **Recharts 3** para visualizaciones
- **Vitest** + **React Testing Library**

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalacion

```bash
git clone <repo-url>
cd arclo-simulador
npm install
```

### Variables de entorno

Crear `.env.local` en la raiz del proyecto:

```env
AUTH_USERS=email1:password1,email2:password2,email3:password3,email4:password4
AUTH_SECRET=una-clave-secreta-segura
```

Formato: pares `email:password` separados por coma. La app soporta N usuarios.

## Desarrollo

```bash
npm run dev        # Servidor de desarrollo (http://localhost:3000)
npm run build      # Build de produccion
npm run start      # Servidor de produccion
npm run lint       # ESLint
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest (single run)
```

## Estructura del proyecto

```
app/
  layout.tsx                          Root layout (fonts, providers)
  login/page.tsx                      Pantalla de login
  api/auth/login/route.ts             API: validacion de credenciales
  api/auth/logout/route.ts            API: cierre de sesion
  (dashboard)/
    layout.tsx                        Layout con sidebar
    page.tsx                          Landing con tarjetas de simuladores
    modelo-ingresos/page.tsx          Simulador de ingresos
    tarifas-publicitarias/page.tsx    Calculadora de tarifas

components/
  sidebar-nav.tsx                     Navegacion lateral colapsable
  theme-toggle.tsx                    Toggle dark/light
  modelo-ingresos/                    Componentes del modelo financiero
  tarifas/                            Componentes de tarifas publicitarias
  ui/                                 Componentes base (shadcn/ui)

lib/
  auth.ts                             HMAC signing/verification (Edge-compatible)
  calculos-ingresos.ts                Logica de calculo financiero
  calculos-tarifas.ts                 Logica de calculo de tarifas
  constants.ts                        Constantes (pricing tiers, ISR, gastos)
  format.ts                           Formateadores (CRC, USD, %)
  utils.ts                            Utilidades (cn)

types/
  index.ts                            Tipos TypeScript centralizados

middleware.ts                          Proteccion de rutas via cookie HMAC
```

## Modulos

### Modelo de Ingresos

Proyeccion financiera a 12 meses con:

- 36 tiers de pricing (3 planes x 3 periodos x 4 packs de modulos)
- Calculo de ISR por tramos (PYME Costa Rica)
- IVA cobrado vs credito fiscal
- Comisiones por linea de negocio (In-App, SINPE, SaaS, productos a la medida)
- Gastos operativos editables
- Distribucion de dividendos por socio
- Graficos de distribucion del ingreso y comparativo mensual

### Tarifas Publicitarias

Calculadora de precios de pauta por:

- **Tiempo** de exposicion (precio/dia)
- **CPM** (costo por mil impresiones)
- **CPC** (costo por clic)

Con soporte para 3 audiencias, descuento por todos los espacios, y conversion CRC/USD.

## Autenticacion

Sistema de autenticacion basado en cookies HMAC-SHA256:

- Credenciales almacenadas en variables de entorno
- Cookie `httpOnly`, `secure` en produccion, `sameSite: lax`
- Middleware protege todas las rutas excepto `/login` y `/api/auth`
- Token firmado con HMAC-SHA256 (Edge-compatible, sin dependencias externas)
- Sesion de 7 dias

## Deploy

Compatible con cualquier plataforma que soporte Next.js:

```bash
npm run build
npm run start
```

Asegurar que las variables de entorno `AUTH_USERS` y `AUTH_SECRET` esten configuradas en el entorno de produccion.

## Licencia

Uso interno — Arclo Systems.
