# Small Business Tracker

A full-stack web application for small businesses to track daily sales and expenses, visualize profit/loss, and manage their product catalog — built mobile-first for real-world use.

---

## Features

- **Dashboard** — daily and weekly summary of sales, expenses, and profit with a chart
- **Sales** — register sales by selecting products with quantities, or enter a free amount when product breakdown isn't available
- **Expenses** — log expenses with categories, amounts, and dates
- **Products** — manage the product catalog with name, description, and sale price
- **Reports** — weekly and monthly summaries with charts: sales vs expenses, profit trend, expense breakdown by category
- **Multi-user** — multiple users can share the same business data (owner + members)
- **Settings** — configure business name and logo (custom image or auto-generated initials with custom background color)
- **PWA** — installable as a mobile app, mobile-first design
- **Auth** — secure login with persistent JWT sessions (30-day expiry, auto-redirect on expiration)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui v4 (base-nova / @base-ui/react) |
| Database | Turso (LibSQL / SQLite edge) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 (JWT strategy, Edge-safe middleware) |
| Validation | Zod v4 |
| Charts | Recharts |
| Forms | React Hook Form |
| Font | Inter (Google Fonts) |

---

## Architecture highlights

- **App Router with Server Actions** — data mutations go through typed server functions, no separate API layer needed
- **Edge-safe auth** — `auth.config.ts` (no Node.js dependencies) is used by middleware; `auth.ts` handles credential verification with bcrypt and DB queries
- **Multi-tenant schema** — `businesses` table links users, products, and expense categories so multiple users share one business view
- **Split date utils** — all date range helpers use local timezone (not UTC) to avoid off-by-one errors for users in UTC-5 (Peru)

---

## Database Schema

```
businesses  ──< users
            ──< products
            ──< expense_categories ──< expenses
                                        sales ──< sale_items >── products
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/small-business-tracker.git
cd small-business-tracker
npm install
```

### 2. Set up environment variables

Create a `.env.local` file:

```env
# Turso database (https://turso.tech)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# NextAuth secret (generate with: openssl rand -hex 32)
AUTH_SECRET=your-secret
```

### 3. Push schema and seed

```bash
npm run db:push    # apply schema to Turso
npm run db:seed    # create demo business + user
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — login with `lafresona@negocio.com` / `lafresona123`.

> **Demo online:** [cuentasclara.vercel.app](https://cuentasclara.vercel.app) — cuenta de prueba: `pruebas@negocio.com` / `pruebas123`

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/
│   └── (dashboard)/
│       ├── dashboard/
│       ├── ventas/
│       ├── gastos/
│       ├── productos/
│       ├── reportes/
│       └── configuracion/
├── features/
│   ├── dashboard/
│   ├── sales/
│   ├── expenses/
│   ├── products/
│   ├── reports/
│   ├── settings/
│   └── navigation/
├── db/
│   ├── schema/
│   └── seed.ts
└── lib/
    ├── auth.ts        # Node.js auth (credentials + DB)
    ├── auth.config.ts # Edge-safe auth config (middleware)
    └── format.ts      # Currency, date helpers
```

---

## Scripts

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run db:push    # Push schema changes to Turso
npm run db:seed    # Seed demo data
```

---

## Author

**Manuel Enrique Antón Cisneros** — Systems Engineer, Peru.

[LinkedIn](https://www.linkedin.com/in/manuel-eac/) · [GitHub](https://github.com/ACManuel)
