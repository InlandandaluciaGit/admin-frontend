# Inland Admin – Frontend

Admin panel for the Inland platform. This is the frontend. It signs existing
Inland administrators in through the Inland API in `../BackEnd`, using their
existing username and password (see [Authentication](#authentication)).

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components)
- React 19, TypeScript (strict)
- Tailwind CSS 4 (CSS-first config in `src/app/globals.css`)
- ESLint 9 (`eslint-config-next`)

There are no UI or icon libraries; the components and icons are local.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npx tsc --noEmit   # type check
npm run build      # production build
npm run start      # serve the production build
```

Requires Node.js 20.9 or newer.

## Authentication

Administrators sign in with their **existing username and password** from the
legacy `CONTACT` table. Nothing in the database is created or changed.

- The browser only talks to this app's own origin. `next.config.ts` rewrites
  `/api/admin/*` to the Inland API (`ADMIN_API_URL`, default
  `http://localhost:4002`), so the session cookie is first-party.
- The API sets an **HTTP-only** session cookie (`inland_admin_session`). The
  frontend never sees or stores a token, and nothing is kept in `localStorage`.
- `src/proxy.ts` validates the cookie with `GET /api/admin/auth/me` on the
  server before any protected page renders. If the API is unreachable, it
  sends the user to `/login`.
- `AdminSessionProvider` loads the signed-in admin for the UI and re-checks the
  session when the window regains focus.
- Logout calls `POST /api/admin/auth/logout`, which ends the session on the server.

Environment (server-side only, set when running `next dev` / `next build`):

| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_API_URL` | `http://localhost:4002` | Base URL of the Inland API (`BackEnd/`) |

To run locally, start the API (`cd ../BackEnd && npm run dev`) and then this app.

## Routes

| Route        | Description                                              |
| ------------ | -------------------------------------------------------- |
| `/`          | Redirects to `/dashboard` when signed in, otherwise `/login` |
| `/login`     | Admin sign-in (redirects to `/dashboard` when signed in)  |
| `/dashboard` | Business overview (live analytics)                        |
| `/analytics/leads` · `/sales` · `/website` · `/properties` · `/homepage` · `/filters` | Analytics modules (live, read-only) |

All routes except `/login` are protected by `src/proxy.ts`.

## Project structure

```text
src/
├── app/
│   ├── (auth)/            # Auth route group (centred layout)
│   │   └── login/
│   ├── (dashboard)/       # Admin route group (sidebar + header shell)
│   │   ├── layout.tsx     # ← add the session check here later
│   │   └── dashboard/
│   ├── globals.css        # Tailwind import + design tokens (@theme)
│   ├── layout.tsx         # Root layout, fonts, metadata (noindex)
│   ├── page.tsx           # Redirects to /login
│   └── not-found.tsx
├── components/
│   ├── ui/                # Primitives: Button, Input, PasswordInput, Checkbox, Card, Table,
│   │                      # Dropdown, Popover, Alert, Badge, EmptyState, LoadingIndicator, Icon
│   ├── common/            # Logo, Breadcrumbs, PageHeading
│   ├── layout/            # DashboardShell, Sidebar, Header, UserMenu, NotificationsMenu, SidebarContext
│   ├── charts/            # TrendChart (line + sparkline), TimeColumnChart, SegmentedBar, RankedBars,
│   │                      # ColumnChart, Meter, ChartDataTable (screen-reader table twin for every chart)
│   ├── analytics/         # AnalyticsShell, DateRangeFilter, KpiCard, TrendIndicator, SectionCard,
│   │                      # DefinitionsPanel, tables/bars; modules/ holds one view per analytics page
│   ├── dashboard/         # Panel/SectionHeader, DashboardHeader, IntroGreeting
│   └── auth/              # LoginForm, AdminSessionProvider
├── constants/             # Routes, navigation config
├── hooks/                 # useLoginForm, useLogout, useCurrentUser, useGreeting, useClickOutside, …
├── lib/                   # cn() helper
├── proxy.ts               # Route protection (runs before rendering)
├── services/              # auth.service (auth), analytics.service (analytics API client)
├── types/                 # Shared TypeScript types
└── utils/                 # Validation, breadcrumb and route helpers
```

## Conventions

- **Server Components by default.** `"use client"` is used only where state or
  browser APIs are needed: the login form, sidebar, header, dropdown and password toggle.
- **Design tokens** live in `src/app/globals.css` under `@theme`. Use the semantic
  utilities (`bg-surface`, `text-fg-muted`, `border-border`, `bg-brand-600`, …)
  rather than raw Tailwind palette colours. Brand colours come from the public
  Inland website.
- **Navigation** is defined once in `src/constants/navigation.ts`, and the sidebar,
  breadcrumbs and header title are derived from it. Planned modules (Properties,
  Enquiries, Reservations, Buyers, Partners, Admin users, Blog, Settings) are
  listed with `status: "soon"` and shown disabled. **To add a module**, create
  `src/app/(dashboard)/<module>/page.tsx` (it inherits the shell and route
  protection automatically) and set its nav item to `status: "available"`.
- **No sample data.** Every figure comes from `/api/admin/analytics/*` (read-only
  queries on the live database). Unavailable metrics show an "Unavailable" state with
  the reason, never a placeholder number. Each page lists its metric definitions
  (source, calculation, date field, exclusions, limitations).
- **Analytics date range** lives in the URL (`?range=7d|30d|90d|this_year|last_year|custom&from&to`).
  Badges say whether a figure follows it ("Selected period"), is the current state
  ("Current"), an all-time counter ("All-time total") or all history ("All history").
- **Chart colours** are tokens in `globals.css` (`--color-chart-*`, `--color-seq-*`).
  The categorical order (indigo `#4F52B6`, orange `#F5702F`, teal `#00A389`) was
  checked with a palette validator for colour-blind separation. Single-series
  charts use one colour; every chart has a screen-reader table.
- **Icons**: add new SVG paths to `src/components/ui/Icon.tsx`.

## Current status

| Area             | Status                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Admin UI shell   | Done: sidebar (collapsible, mobile drawer), header, breadcrumbs, profile menu, notifications placeholder |
| Login            | Existing admin username + password via `POST /api/admin/auth/login`     |
| Route protection | `src/proxy.ts` validates the session with the API (server-side)       |
| Logout           | `POST /api/admin/auth/logout` ends the session and clears the cookie  |
| Analytics        | Business overview + 6 analytics modules on live data (see `reports/Inland Business Analytics Dashboard Implementation.md`) |

### Next phase

1. Protect new admin API routes with `requireAdmin` from `BackEnd/src/routes/adminAuth.ts`.
2. See `reports/Admin Login Implementation Report.md` for known limitations
   (plaintext legacy passwords, in-memory sessions).
