# AGENTS.md

## Project Overview

**Zero Calendar** is an AI-powered scheduling application built with Next.js 16 (App Router), React 19, and Convex as the backend. It features Google Calendar bi-directional sync, natural-language event creation via AI chat, conflict detection, analytics, and event invitations via email.

## Tech Stack

- **Runtime / Package Manager:** Bun (pinned to 1.3.11 via `packageManager` in `package.json`)
- **Framework:** Next.js 16 with App Router and Turbopack
- **Language:** TypeScript 6 (strict mode)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui components (Radix UI primitives), Framer Motion
- **Backend:** Convex (schema, queries, mutations, HTTP actions in `convex/`)
- **Auth:** Better Auth integrated with Convex (`@convex-dev/better-auth`)
- **AI:** Vercel AI SDK with OpenRouter provider (`@ai-sdk/openai`, `@openrouter/ai-sdk-provider`)
- **Email:** Resend
- **Forms:** react-hook-form + Zod validation
- **Analytics:** @vercel/analytics

## Project Structure

```
app/                    # Next.js App Router pages, layouts, and API routes
  api/                  # API route handlers (ai, auth, calendar, invitations, etc.)
  auth/                 # Auth pages (signin, signup)
  calendar/             # Main calendar page
  invite/               # Invitation response pages
  settings/             # User settings
components/             # React components
  ui/                   # shadcn/ui primitives (~58 components)
convex/                 # Convex backend
  schema.ts             # Database schema (users, events, categories, invitations)
  _generated/           # Auto-generated Convex types (do not edit)
  *.ts                  # Server functions (queries, mutations, HTTP actions)
hooks/                  # Custom React hooks
lib/                    # Shared utilities
  ai.ts, ai-tools.ts   # AI configuration and tool definitions
  auth*.ts              # Auth client/server helpers
  calendar*.ts          # Calendar logic and Google sync
  google-calendar.ts    # Google Calendar API integration
  convex.ts             # Convex client setup
  resend.ts             # Email via Resend
  utils.ts              # General utilities
types/                  # Shared TypeScript type definitions
styles/                 # Additional global styles
```

## Development Commands

```sh
bun install             # Install dependencies
bun run dev             # Start Next.js dev server (Turbopack)
bun run build           # Production build
bun run start           # Start production server
bun run lint            # Lint and check formatting (Ultracite/Biome)
bun run lint:fix        # Auto-fix lint and formatting issues
```

Aliases: `bun run check` = `bun run lint`, `bun run fix` = `bun run lint:fix`.

## Linting and Formatting

This project uses **Biome** via **Ultracite** for both linting and formatting.

- Config: `biome.jsonc` extends `ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`
- The `convex/_generated/` directory is excluded from linting
- Always run `bun run lint` before committing to verify your changes pass
- Run `bun run lint:fix` to auto-fix issues

Several lint categories have rules explicitly relaxed in `biome.jsonc` (a11y, complexity, correctness, performance, style, suspicious, security). Follow the existing patterns rather than re-enabling stricter rules.

## TypeScript

- Root `tsconfig.json` uses strict mode with `@/*` path alias mapping to project root
- Convex has its own `convex/tsconfig.json`
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so the build will succeed even with TS errors — run `bun run lint` to catch type issues

## Code Conventions

- **Imports:** Use `@/` path aliases (e.g., `@/components/ui/button`, `@/lib/utils`)
- **Components:** Follow shadcn/ui patterns — components in `components/ui/` are Radix-based primitives styled with Tailwind and `class-variance-authority`
- **Icons:** Use `@hugeicons/react` (configured as the icon library in `components.json`)
- **Styling:** Tailwind CSS v4 utility classes with CSS variables for theming; use `cn()` from `@/lib/utils` for conditional class merging (clsx + tailwind-merge)
- **Forms:** Use react-hook-form with Zod schemas for validation
- **State:** Convex reactive queries for server state; local React state for UI state
- **Server vs Client:** Next.js App Router conventions — components are server components by default; add `"use client"` directive only when needed

## Convex Backend

- Schema defined in `convex/schema.ts` with four tables: `users`, `events`, `categories`, `invitations`
- Server functions are in `convex/*.ts` (queries, mutations, actions)
- HTTP endpoints in `convex/http.ts`
- Never manually edit files in `convex/_generated/`
- Auth configuration in `convex/auth.ts` and `convex/auth.config.ts`

## Testing

No automated test suite is currently configured. There are no test files or test runner scripts in the project.

## Environment

The project requires environment variables (e.g., for Convex, Google OAuth, OpenRouter, Resend). These are managed via `.env*` files which are gitignored. Check the code in `lib/` for the specific variables referenced.
