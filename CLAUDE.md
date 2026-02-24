# CLAUDE.md — Arclo Simulador

## Project Overview

Simulador financiero interno para Arclo Systems. Proyecciones de ingresos y tarifas publicitarias para startup tecnologica S.A. PYME Costa Rica.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **TypeScript 5** (strict: true)
- **Tailwind CSS 4** (oklch colors, `@theme inline`)
- **shadcn/ui** (new-york style) + **Radix UI**
- **Recharts 3** (dynamically imported)
- **Vitest 4** + **React Testing Library**
- Path alias: `@/*` maps to project root

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint (next config)
npm run test         # Vitest watch
npm run test:run     # Vitest single run
```

## Project Structure

```
app/
  layout.tsx                          Root layout (fonts, ThemeProvider only)
  login/page.tsx                      Login page (no sidebar)
  api/auth/{login,logout}/route.ts    Auth API routes
  (dashboard)/                        Route group (with sidebar)
    layout.tsx                        SidebarNav + main content
    page.tsx                          Landing
    modelo-ingresos/page.tsx          Revenue model simulator
    tarifas-publicitarias/page.tsx    Ad pricing calculator
components/
  ui/                                 shadcn/ui base components
  modelo-ingresos/                    Revenue model components
  tarifas/                            Ad pricing components
  sidebar-nav.tsx, theme-*.tsx        Shell components
lib/
  auth.ts                             HMAC token signing (Edge-compatible)
  calculos-ingresos.ts                Financial calculation logic
  calculos-tarifas.ts                 Ad pricing logic
  constants.ts                        Pricing tiers, ISR brackets, defaults
  format.ts                           CRC/USD/percent formatters
types/index.ts                        All TypeScript interfaces
proxy.ts                              Auth route protection (Edge proxy)
```

## Architecture Decisions

- **Route groups**: `(dashboard)` wraps all authenticated pages with sidebar layout. `/login` renders outside this group (no sidebar).
- **Auth**: Stateless HMAC-SHA256 cookie. No external auth library. Credentials in `.env.local` (`AUTH_USERS`, `AUTH_SECRET`). Edge-compatible (uses `crypto.subtle`).
- **State management**: `useReducer` for modelo-ingresos (complex interdependent state), `useState` for tarifas (simpler state).
- **Code splitting**: `ResumenEjecutivo` (Recharts) loaded via `next/dynamic` with `ssr: false`.
- **All calculations are client-side** — no backend API for financial math.

## Coding Conventions

- TypeScript strict, never use `any`
- No unnecessary comments — code should be self-documenting
- shadcn/ui components in `components/ui/`, add via `npx shadcn@latest add <component>`
- Icons from `lucide-react`
- Formatters: use `formatCRC`, `formatUSD`, `formatPercent` from `lib/format.ts`
- Colors use oklch system with CSS variables (see `app/globals.css`)
- Brand blue: `#2563EB` (used in logo dot and login button)
- Fonts: DM Sans (sans), JetBrains Mono (mono)

## Git Conventions

- Conventional Commits with gitmoji: `✨ feat:`, `🐛 fix:`, `♻️ refactor:`, `⚡ perf:`, `📝 docs:`, `🎨 chore:`
- Never include `Co-Authored-By`

## Key Patterns

- **New page**: create in `app/(dashboard)/route-name/page.tsx`, add nav item in `components/sidebar-nav.tsx` (`NAV_ITEMS` array)
- **New shadcn component**: `npx shadcn@latest add <name>` — installs to `components/ui/`
- **New calculation**: add pure function to `lib/calculos-*.ts`, types to `types/index.ts`, constants to `lib/constants.ts`
- **Formatting values**: always use `lib/format.ts` helpers, never raw `toFixed` or template literals for currencies
- **Memoization**: use `useMemo` for derived calculations, `useCallback` for stable handler refs passed to memoized children
- **Lazy state init**: always use `useState(() => expr)` when initializer is non-trivial (e.g., `structuredClone`)
