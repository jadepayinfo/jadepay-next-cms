# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn dev          # Start dev server at http://localhost:3000
yarn build        # Production build (standalone output)
yarn start        # Start production server
yarn lint         # ESLint via next lint
yarn debug        # Dev server with Node.js inspector enabled
```

No test suite is configured.

## Environment

Requires a `.env` file with:
```
NEXT_PUBLIC_BASE_URL=   # Base URL for the backend API
```

## Architecture

This is a **Next.js 15 CMS** (Pages Router) for the Jadepay platform — an admin dashboard for managing customer KYC, approvals, and user accounts.

### Request Flow

All authenticated pages use the `withAuth` HOC (`hoc/with_auth.tsx`), which:
1. Checks for a JWT `token` cookie (constant: `TOKEN_APP` in `lib/constant.ts`)
2. Redirects to `/error` or `/login` on failure
3. Wraps the page in the shared layout (Sidebar + Navbar + Container + Footer)

Pages call **Next.js API routes** under `pages/api/` which proxy to the backend using the `Backend` axios instance (`lib/axios.ts`). The `Backend` instance reads `NEXT_PUBLIC_BASE_URL` and attaches the `token` cookie as a Bearer token on every request. For SSR, call `initHeaderWithServerSide(ctx)` in `getServerSideProps` before making backend requests.

### Context Providers

Three contexts wrap the entire app via `GlobalProvider` (`context/index.tsx`), nested in order:

- **AuthContext** (`context/auth_context.tsx`) — stores `user: UserInfoType`, `token`, and exposes `logout()` and `getMyLevelControl()` for role-based UI gating. Roles: `ROOT > COMPANY_ADMIN > COMPANY_PLATFORM_ADMIN > COMPANY_PLATFORM_STAFF`.
- **ThemeContext** (`context/theme_context.tsx`) — manages DaisyUI theme selection.
- **MenuContext** (`context/menu_context.tsx`) — holds sidebar menu state (`RawDataMenu` from `lib/menu.ts`) and `isIconMenu`/`isHamburgerMenu` flags. Role-based menu filtering logic exists in the context but is currently commented out.

### Page Structure

| Route | Description |
|---|---|
| `/dashboard` | Summary stats + user trend chart |
| `/dashboard/register-by-month` | Registration chart |
| `/dashboard/approve-by-month` | Approval chart |
| `/dashboard/kyc-approve-by-month` | KYC approval chart |
| `/customer/detail` | Customer list + detail view |
| `/customer/re-kyc` | Re-KYC workflow |
| `/notification/*` | Notification management |
| `/user/*` | User account management |

### Key Conventions

- **SVGs** are imported as React components via `@svgr/webpack` (configured in `next.config.js`).
- **Styling**: Tailwind CSS 3 + DaisyUI 4 + MUI components. Use `clsx`/`tailwind-merge` for conditional classes.
- **Forms/selects**: `react-select` — use helpers in `lib/react_select.ts` for consistent styling.
- **Date formatting**: use `dayjs` for manipulation, `lib/time.ts` for display helpers.
- **Alerts/confirmations**: use `sweetalert2` / `sweetalert2-react-content`.
- **CSV export**: `export-to-csv` or `react-csv` depending on the feature.
- Path alias `@/` maps to the project root (configured in `tsconfig.json`).
