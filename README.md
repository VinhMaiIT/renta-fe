# RENTA FE — Tenant Portal

Production-ready admin web app for the **RENTA** multi-tenant rental management
platform (Tenant Portal). Built with Next.js (App Router), React, TypeScript
(strict), TailwindCSS, TanStack Query, React Hook Form + Zod, Zustand, Axios and
the [`xizot/ui-design-system`](https://github.com/xizot/ui-design-system)
component library.

> Scope: **Tenant Portal only**. No SaaS Admin Portal, no payment module.

## Features

- **Authentication** — tenant login (`tenantId` + username + password), JWT
  storage, automatic Bearer injection, single-flight refresh on 401, protected
  routes, session persistence, logout.
- **Branch context** — switch the active working branch from the header; default
  branch resolved from the user's assignments at login.
- **Dashboard** — active rentals, overdue rentals, total customers, total &
  available inventory, recent rental orders.
- **Customers** — CRUD, search by name/phone, responsive cards on mobile.
- **Master Data** — Sizes, Units, Product Types, Product Groups: list, search,
  pagination, create, edit, delete, status toggle (one generic implementation).
- **Products** — list/detail/create/edit, images, sizes, type/group/unit links.
- **Inventory Items** — list/detail/create, filters (branch, product, size,
  status, condition), lifecycle status + physical condition transitions.
- **Rental Orders** — list, detail, 5-step create wizard (customer → inventory →
  rental info → review → submit as DRAFT or RENTING), edit (DRAFT only), confirm,
  cancel. Enforces customer XOR (`customerId` vs inline `customer`).
- **Return Transactions** — list, detail, create with **partial returns**
  (per-item condition, damage fee, late fee). Order status reflects
  `PARTIALLY_RETURNED` / `RETURNED`.
- **Settings** — profile, appearance (light/dark/system), branch selection,
  change password.
- **UX** — every screen has loading skeletons, empty states, error states with
  retry, success toasts, and confirmation dialogs. Fully responsive (desktop
  table → tablet compact → mobile cards + drawer sidebar + sticky actions).
- **Dark / light mode** via `next-themes` (defaults to light; toggle on the login page, header, or Settings).
- **Bilingual (Vietnamese / English)** — Vietnamese by default. Cookie-based locale so the server renders the right `<html lang>` and copy with no hydration flash; switch from the header or Settings → Appearance. Messages live in `src/i18n/messages/{en,vi}/<namespace>.ts`; use `const { t } = useT()` and `t('namespace.key', { vars })`.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional — sensible defaults are baked in)
cp .env.example .env.local

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

**Demo login** (mock mode, default): tenant `1`, username `staff01`, any password.
(`manager` also works.)

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run format` | Prettier write |

## Mock vs. real backend

The app ships with a **built-in in-memory mock backend** (an Axios adapter in
`src/mocks/`) that reproduces the real response envelope, error shape, pagination
and business rules (inventory reservation/release, order lifecycle, partial
returns). This lets the app run with no backend.

To point at the real NestJS backend instead, set in `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

All feature code uses the same `http` client either way — only the Axios adapter
changes. Every response is unwrapped at `response.data.data`; errors are
normalized to `{ code, message }` and surfaced via toasts.

## Backend contract

Base URL `http://localhost:3000/api`. Swagger: `http://localhost:3000/api/docs`.
The integration guide (`renta-be/FE-INTEGRATION.md`) is the source of truth for
auth, tenant scoping, pagination, enums, and business flows. A condensed,
field-level contract used to build the modules lives in `docs/FE-BUILD-SPEC.md`.

## Pages / routes

| Route | Page |
| --- | --- |
| `/login` | Tenant login |
| `/dashboard` | Dashboard widgets |
| `/customers` | Customers CRUD |
| `/sizes` `/units` `/product-types` `/product-groups` | Master data CRUD |
| `/products` · `/products/new` · `/products/[id]` · `/products/[id]/edit` | Products |
| `/inventory-items` · `/inventory-items/[id]` | Inventory items |
| `/rental-orders` · `/rental-orders/new` · `/rental-orders/[id]` · `/rental-orders/[id]/edit` | Rental orders |
| `/return-transactions` · `/return-transactions/new` · `/return-transactions/[id]` | Return transactions |
| `/settings` | Settings |

## Project structure

```
src/
├── app/
│   ├── (app)/                # Authenticated shell (route group, guarded)
│   │   ├── layout.tsx        # RouteGuard + AppShell
│   │   ├── dashboard/  customers/
│   │   ├── sizes/ units/ product-types/ product-groups/
│   │   ├── products/         # list, new, [id], [id]/edit
│   │   ├── inventory-items/  # list, [id]
│   │   ├── rental-orders/    # list, new (wizard), [id], [id]/edit
│   │   ├── return-transactions/  # list, new, [id]
│   │   └── settings/
│   ├── login/                # Public login page
│   ├── layout.tsx            # Root layout + providers
│   └── globals.css           # Tailwind v4 theme tokens (light/dark)
├── components/
│   ├── ui/                   # Design-system primitives (Button, Input, …)
│   ├── rhf/                  # Design-system React Hook Form wrappers
│   ├── providers/            # ThemeProvider
│   ├── common/               # PageHeader, StatusBadge, ConfirmDialog, states, toolbar
│   ├── forms/                # SelectField
│   ├── layout/               # AppShell, sidebar, header, breadcrumbs, switchers
│   └── tables/               # ListView (responsive table/cards), PaginationBar
├── features/                 # Feature modules (api + hooks + components)
│   ├── auth/ branches/ dashboard/ customers/ master-data/
│   ├── products/ inventory-items/ rental-orders/ return-transactions/ settings/
├── lib/
│   ├── api/                  # axios client, interceptors, error normalize, http helpers
│   ├── auth/                 # token storage, JWT decode
│   ├── query/                # QueryClient factory
│   ├── toast.ts  format.ts  utils.ts
├── hooks/                    # usePagination, useTenantContext, useIsMobile
├── stores/                   # Zustand auth store
├── types/                    # ApiResponse, PaginatedResponse, enums, domain models
├── constants/                # config, enum labels/colors, navigation, form sizes
├── mocks/                    # in-memory DB + axios mock adapter + route handlers
└── providers/                # AppProviders (Query + Theme + Toaster + nuqs)
```

## API layer

- `src/lib/api/client.ts` — Axios instance, request interceptor (Bearer),
  response interceptor (single-flight refresh on 401 → retry → redirect).
- `src/lib/api/http.ts` — typed `get/post/put/patch/delete` that unwrap the
  envelope and throw `NormalizedApiError`.
- `src/types/api.ts` — `ApiResponse<T>`, `PaginatedResponse<T>`, `NormalizedApiError`.
- `usePagination()` (`src/hooks/use-pagination.ts`) — page / pageSize / order /
  search / filters → `queryParams` for any list endpoint.

## Tech notes

- Next.js 16 + React 19 + Tailwind CSS v4 (CSS-first theme in `globals.css`).
- Design system is vendored under `src/components/{ui,rhf,providers}` with
  matching `src/{lib,hooks,constants}` helpers (relative imports preserved).
- Strict TypeScript, no `any`. `npm run typecheck` and `npm run build` are clean.
