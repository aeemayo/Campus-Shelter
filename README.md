# Campus Shelter – Frontend

A student housing marketplace for FUTA — built with React, TypeScript, and Vite. Students browse and book accommodation, landlords list and manage properties, and admins oversee the entire platform.

---

## System Architecture

Campus Shelter follows a **client–server** architecture with a clear separation between the frontend SPA and the backend REST API.

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (SPA)                     │
│  React + TypeScript + Vite                              │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐ │
│  │  Pages /  │  │  Services │  │  Contexts / Hooks   │ │
│  │  Routes   │──│  (API     │──│  (Auth, Query,      │ │
│  │           │  │   Layer)  │  │   Theme)            │ │
│  └───────────┘  └─────┬─────┘  └─────────────────────┘ │
│                       │                                 │
│              apiFetch (lib/api.ts)                       │
│              ─ Bearer JWT token                          │
│              ─ x-api-key header                          │
│              ─ JSON / FormData                           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                   Backend (REST API)                     │
│  Next.js 16 App Router (API routes only)                │
│                                                         │
│  proxy.ts (middleware) ─► API key + CORS                │
│  lib/auth.ts           ─► JWT verification + RBAC       │
│  lib/validations.ts    ─► Zod request schemas           │
│  lib/responses.ts      ─► Standardised JSON responses   │
│                                                         │
│  Prisma 7 ORM  ──►  PostgreSQL (Neon)                   │
│  Nodemailer    ──►  SMTP (password resets)               │
└─────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Frontend → Backend**: All requests go through `apiFetch()` which injects the JWT token and API key automatically.
2. **Dev proxy**: In development, Vite proxies `/api/*` requests to the deployed backend, avoiding CORS issues entirely.
3. **Production**: The frontend is a static SPA deployed independently. It hits the backend at `VITE_API_URL` directly.

---

## Design Choices & Software Engineering Principles

### Separation of Concerns

The codebase is organised into distinct layers, each with a single responsibility:

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Pages** | `src/pages/` | Route-level components, layout composition |
| **Components** | `src/components/` | Reusable UI (further split: `ui/`, `landing/`, `layout/`, `properties/`, `admin/`) |
| **Services** | `src/services/` | API call functions — one file per domain (auth, properties, bookings, etc.) |
| **Lib** | `src/lib/` | Shared utilities: HTTP client, data adapters, helpers |
| **Contexts** | `src/contexts/` | Global state providers (auth) |
| **Hooks** | `src/hooks/` | Reusable stateful logic |

### DRY (Don't Repeat Yourself)

- **`apiFetch()`** — a single HTTP wrapper handles auth headers, error parsing, and content-type detection for every request.
- **`lib/responses.ts`** (backend) — standardised response helpers (`success()`, `badRequest()`, `notFound()`, etc.) so every endpoint returns a consistent shape.
- **Service modules** — each domain's API calls are centralised in one file rather than scattered across components.

### Interface Segregation

- Service files export small, focused functions (`getProperties`, `createBooking`, `adminVerifyLandlord`) instead of monolithic classes.
- Components receive only the props they need — no god objects passed down the tree.

### Fail-Fast Validation

- **Frontend**: Forms use React Hook Form + Zod schemas for instant client-side validation before any network request.
- **Backend**: Every endpoint validates the request body with Zod's `safeParse()` and returns `400` with field-level errors on failure.
- Both layers share the same validation philosophy — validate at the boundary, trust the internals.

### Adapter Pattern

`lib/propertyAdapter.ts` transforms backend API responses into the shape the frontend expects. This decouples UI components from the API contract — if the backend schema changes, only the adapter needs updating.

### Role-Based Access Control (RBAC)

Access control is enforced at **two levels**:

1. **Frontend** — `ProtectedRoute` component checks the user's role and landlord verification status before rendering a page.
2. **Backend** — `requireAuth()` and `requireRole()` middleware reject requests from unauthorised users with `401`/`403` responses.

The frontend guards are for UX (don't show pages users can't use). The backend guards are the real security boundary.

### Lazy Loading & Code Splitting

All page components are loaded with `React.lazy()` + `Suspense`. Vite's rollup config splits vendor bundles into separate chunks (`react-vendor`, `ui-vendor`, `query-vendor`, `recharts`, `framer-motion`) to optimise initial load time.

---

## User Flows

### Authentication

```
Register ──► JWT token stored in localStorage
Login    ──► JWT token stored in localStorage
App load ──► hydrate from localStorage ──► GET /api/auth/me to refresh user data
                                           └─ 401? clear token & redirect to login
```

### Landlord Verification

```
Landlord registers ──► uploads ID card ──► landlordStatus = PENDING
                                               │
                        Admin dashboard ◄──────┘
                        reviews landlord
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
           VERIFIED       REJECTED       SUSPENDED
               │
               ▼
    Can now create properties
    and access landlord dashboard
```

Unverified landlords can still access their profile page but are blocked from the dashboard and property creation — both on the frontend (via `ProtectedRoute`) and the backend (via status check in `POST /api/properties`).

### Property Lifecycle

```
Landlord creates property ──► status = PENDING_APPROVAL
                                    │
                   Admin reviews  ◄─┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
        APPROVED     REJECTED    ARCHIVED
            │
            ▼
   Visible to students
   Students can book
```

### Booking Flow

```
Student finds property ──► POST /api/bookings ──► status = PENDING
                                                      │
                               Landlord reviews  ◄───┘
                                    │
                         ┌──────────┼──────────┐
                         ▼                     ▼
                     APPROVED              REJECTED
                         │
                         ▼
              Landlord creates lease
              Student can submit reviews
              Student can submit maintenance requests
```

---

## Tech Stack

| Concern | Technology |
|---------|------------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 7 |
| Routing | React Router 6 |
| Data fetching | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| UI components | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion 12 |
| Charts | Recharts 2 |
| Notifications | Sonner |
| Testing | Vitest |

---

## Project Structure

```
src/
├── pages/                # Route-level page components (lazy-loaded)
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── landing/          # Hero, Features, HowItWorks, Testimonials, CTA
│   ├── layout/           # Header, Footer
│   ├── properties/       # PropertyCard, PropertyFilters, PropertySearch
│   ├── admin/            # AdminPropertyForm, AdminDocumentUpload
│   ├── illustrations/    # SVG illustrations
│   └── ProtectedRoute.tsx
├── services/             # API service layer (one file per domain)
│   ├── auth.ts
│   ├── properties.ts
│   ├── bookings.ts
│   ├── messages.ts
│   ├── reviews.ts
│   ├── documents.ts
│   ├── maintenance.ts
│   └── leases.ts
├── lib/
│   ├── api.ts            # HTTP client (apiFetch)
│   ├── propertyAdapter.ts # API → UI data transformation
│   └── utils.ts
├── contexts/
│   └── AuthContext.tsx    # Auth state provider
├── hooks/                # Custom React hooks
└── main.tsx              # App entry point
```

---

## Routes

### Public
| Path | Page |
|------|------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Sign up (role selection) |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |
| `/faq`, `/contact`, `/terms`, `/privacy` | Info pages |

### Student (requires `STUDENT` role)
| Path | Page |
|------|------|
| `/properties` | Browse properties |
| `/properties/:id` | Property details |
| `/my-bookings` | Student bookings |

### Landlord (requires `LANDLORD` role + `VERIFIED` status)
| Path | Page |
|------|------|
| `/landlord` | Landlord dashboard |
| `/properties/add` | Create property |

### Admin (requires `ADMIN` role)
| Path | Page |
|------|------|
| `/admin` | Admin dashboard (users, properties, analytics) |
| `/admin/properties/new` | Create property |
| `/admin/properties/edit/:id` | Edit property |

### Shared (authenticated)
| Path | Page |
|------|------|
| `/profile` | User profile |
| `/messages` | Messaging (students & landlords) |

---

## Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh/)

### Setup

```bash
# clone and install
git clone <repo-url>
cd campus-shelter-frontend
npm install   # or: bun install

# configure environment
cp .env.example .env
# set VITE_API_URL and VITE_API_KEY

# start dev server (port 8080)
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with API proxy |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (Vitest) |
| `npm run lint` | Lint with ESLint |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (empty in dev — Vite proxy handles it) |
| `VITE_API_KEY` | API key sent as `x-api-key` header |
