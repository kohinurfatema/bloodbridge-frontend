# BloodBridge — Frontend 🩸

> Find blood donors in minutes, not hours.

BloodBridge is a blood donation and emergency platform. Requesters post blood requests, admins match them with available donors of the same blood type, and donors accept and record their donations. This repository is the **Next.js frontend**; it consumes the [BloodBridge REST API](https://github.com/kohinurfatema/bloodbridge).

| | |
|---|---|
| **Live frontend** | https://bloodbridge-frontend-ten.vercel.app |
| **Live API** | https://bloodbridge-rove.onrender.com |
| **Backend repo** | https://github.com/kohinurfatema/bloodbridge |

> The API runs on Render's free tier, which sleeps after 15 minutes without traffic. If the first click is slow, give it up to a minute to wake up; after that it responds normally.

## Demo accounts

The login page has **one-click demo buttons** for each role. You can also sign in manually:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@bloodbridge.com` | `Admin@1234` |
| Donor | `donor@bloodbridge.com` | `Donor@1234` |
| Requester | `requester@bloodbridge.com` | `Requester@1234` |

Stripe runs in **test mode** — pay with card `4242 4242 4242 4242`, any future expiry and any CVC.

> The API is on Render's free tier and may take up to a minute to wake up on the first request.

## Features by role

**Requester**
- Dashboard with request stats, status filters and pagination (all kept in the URL)
- Create blood requests (blood type, units, urgency, hospital, needed-by date) — emergencies raise an alert automatically
- Request details with progress timeline, matched donors (phone shown only after a donor accepts) and optimistic cancel
- Search donors by blood type, location and availability
- Pay a service fee through **Stripe Checkout**, verified server-side on return; payment history

**Donor**
- Dashboard with availability toggle (optimistic), 56-day eligibility countdown and emergency alerts for their blood type
- Create / edit donor profile
- Accept, decline or mark matches as donated (optimistic updates)
- Browse open requests with blood-compatibility labels

**Admin**
- Platform stats with accessible charts (requests by status, users by role, completion rate)
- User management: search, filter, activate / deactivate (optimistic) and delete
- All blood requests with **donor matching**: same-type, available donors nearest first, with eligibility warnings
- Emergency alerts: raise, match and resolve
- Audit log viewer with action / resource filters

**Everyone:** profile settings, light / dark theme, responsive layout from 390px phones up.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling / UI | Tailwind CSS v4 · shadcn/ui (Radix primitives) · lucide icons |
| Server state | TanStack Query v5 (server prefetch + `HydrationBoundary`, optimistic updates) |
| Client state | Zustand (session user only) |
| Forms | React Hook Form + Zod (schemas mirror the backend's Zod rules) |
| Auth | JWT in **httpOnly cookies**, route protection in `proxy.ts` |
| Payments | Stripe Checkout (test mode) |
| Tooling | ESLint · GitHub Actions CI (lint, build, type-check) |

## Architecture

```
Browser ──► Next.js (Vercel)
             ├─ proxy.ts ............ guards /dashboard and /payment, routes each role to its own area,
             │                        refreshes expired access tokens before pages render
             ├─ Server Components ... read the session cookie, prefetch data with serverApi()
             │                        and hand it to TanStack Query via HydrationBoundary
             ├─ /api/auth/* ......... login / register / logout — sets httpOnly cookies
             └─ /api/proxy/* ........ forwards browser API calls, attaching the JWT from the cookie
                                       ▼
                         BloodBridge API (Express + Prisma on Render)
```

- **Tokens never reach client JavaScript.** The browser talks to `/api/proxy/*`; the route handler adds the `Authorization` header from an httpOnly cookie and transparently refreshes the 15-minute access token. Because the browser never calls the API directly, no CORS setup is needed.
- **Defence in depth.** `proxy.ts` blocks wrong-role pages, the dashboard layout re-checks the session, and the backend authorises every API call.
- **Server vs Client Components.** Pages and layouts are Server Components that fetch and prefetch. `"use client"` is limited to interactive pieces: forms, tables with actions, filters, the sidebar and charts.
- **URL state.** Filters, tabs and pagination live in `useSearchParams`, and the server parses the same params (`src/lib/filters/*`), so shared links and refreshes render instantly with matching query keys.
- **Loading and errors.** Every dashboard segment has `loading.tsx` skeletons and an `error.tsx` boundary; there are also `not-found.tsx` and `global-error.tsx`.
- **Performance.** Static landing page, `next/dynamic` code-split charts, build-time generated favicon and Open Graph image (`next/og`), `keepPreviousData` for smooth pagination.
- **Accessibility.** Audited with axe-core on every page at 390px and 1280px in light and dark mode: WCAG AA contrast, landmarks and skip link, labelled controls, keyboard-reachable tables and charts, reduced-motion support.

## Project structure

```
src/
├─ app/
│  ├─ (auth)/login, register       # auth pages with one-click demo login
│  ├─ dashboard/
│  │  ├─ requester/ donor/ admin/  # role areas, each with loading.tsx + error.tsx
│  │  └─ profile/                  # shared profile settings
│  ├─ payment/success, cancel      # Stripe return pages
│  ├─ api/auth/*, api/proxy/*      # cookie session + API proxy route handlers
│  ├─ page.tsx                     # landing page
│  └─ icon.tsx, opengraph-image.tsx
├─ components/                     # ui/ (shadcn) + feature folders
├─ hooks/                          # TanStack Query hooks per domain
├─ lib/                            # api clients, auth, filters, validations, formatting
├─ services/                       # typed endpoint functions
├─ store/                          # Zustand auth store
├─ types/                          # API types mirroring the Prisma schema
└─ proxy.ts                        # route protection (Next.js 16 name for middleware)
```

## Running locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

| Script | |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (run after a build or `dev`, which generate route types) |

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `API_URL` | server only | Backend base URL, e.g. `https://bloodbridge-rove.onrender.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | public | This site's URL — used for Open Graph image links |

## Deploying to Vercel

1. Import this repository at [vercel.com/new](https://vercel.com/new) (framework preset: **Next.js**).
2. Add `API_URL` and `NEXT_PUBLIC_SITE_URL` (your Vercel URL) under **Settings → Environment Variables**, then deploy.
3. On the **backend** (Render), set `CLIENT_URL` to the Vercel URL so Stripe redirects back to `/payment/success` and `/payment/cancel`.

Pushes to `main` redeploy automatically; GitHub Actions runs lint, build and type-check on every push.
