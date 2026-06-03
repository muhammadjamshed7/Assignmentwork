# TDS Management

TDS Management is a Next.js App Router dashboard for managing academic service work: students, courses, issues, comments, prompts, reports, approved AI tools, settings, and an assignment workflow prompt guide.

The app requires Supabase Auth login. Admin users can manage the full workspace, while student users register into a pending state and must be approved before accessing student-allowed pages.

For deeper architecture notes, see [SYSTEM_FLOW.md](./SYSTEM_FLOW.md).

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS, shadcn-style components, lucide icons |
| Data | Supabase Postgres |
| Realtime | Supabase `postgres_changes` subscriptions |
| State | Zustand for global search and toasts |
| Charts | Recharts |
| PDF | `@react-pdf/renderer` |
| PWA | Manifest, icons, service worker |

## Quick Start

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is only needed for server-side user-management API routes. Never expose it in client code.

Run the database schema and baseline seed:

```bash
psql $DATABASE_URL < supabase/schema.sql
psql $DATABASE_URL < supabase/seed.sql
```

If you are upgrading an existing database, apply the auth approval migration first:

```bash
psql $DATABASE_URL < supabase/auth-approval-migration.sql
```

Create or update the default admin account:

```bash
npm run seed:admin
```

If SQL Editor setup is needed instead, run `supabase/00-reset-admin-auth.sql` first, then `supabase/01-enable-admin-auth.sql`.

Default admin login:

```text
admin@tds.com / admin123
```

Start the dev server:

```bash
npm run dev
```

Open student login:

```text
http://localhost:3000/login
```

Open admin login:

```text
http://localhost:3000/admin/login
```

On Windows PowerShell, if `npm.ps1` is blocked by execution policy, run scripts through `npm.cmd`, for example:

```bash
npm.cmd run lint
npm.cmd run build
```

## Supabase SQL Files

| File | Purpose |
| --- | --- |
| `supabase/schema.sql` | Main app schema: tables, enums, triggers, indexes, grants, RLS, realtime publication. |
| `supabase/seed.sql` | Seeds only the approved baseline AI tool records. No demo students, courses, issues, comments, or prompts. |
| `supabase/full-reset.sql` | Deprecated reset helper from the pre-auth schema. Use `supabase/schema.sql` plus `supabase/seed.sql` for the current auth-enabled app. |
| `supabase/reset-current-app.sql` | Deprecated reset helper from the pre-auth schema. Use `supabase/schema.sql` for the current auth-enabled app. |
| `supabase/clear-data.sql` | Truncates app data while preserving schema. Run `seed.sql` afterward if you want baseline AI tools back. |

There is also a helper script for reseeding approved tools from `.env.local`:

```bash
node scripts/upsert-approved-tools.mjs
```

## App Routes

| Route | Purpose | Main Tables |
| --- | --- | --- |
| `/` | Dashboard metrics, charts, recent students | `students`, `courses`, `issues` |
| `/students` | Student CRUD and course assignment | `students`, `student_courses`, `courses`, `issues` |
| `/courses` | Course CRUD and enrollment counts | `courses`, `student_courses` |
| `/issues` | Student issue tracking and new issue dialog | `issues`, `students`, `comments` |
| `/comments` | Ticket/comment workspace | `comments`, `issues`, `students` |
| `/prompts` | Prompt template CRUD, search, copy | `prompts`, `courses` |
| `/reports` | Student report index | `students`, `issues`, `courses` |
| `/reports/[studentId]` | Student detail report and PDF export | `students`, `issues`, `comments`, `courses` |
| `/tools` | Approved AI tools directory | `ai_tools` |
| `/workflow` | Assignment workflow prompt guide, including the unknown-assignment planning workflow | Static UI |
| `/settings` | Supabase status and user-management UI | `user_roles`, Supabase Auth admin API |

API routes:

| Route | Purpose |
| --- | --- |
| `/api/report/[studentId]/pdf` | Generates a student PDF report. |
| `/api/users` | Lists/invites users through the service-role client. |
| `/api/users/[userId]` | Updates/removes users through the service-role client. |

## Data Model

| Table | Stores |
| --- | --- |
| `courses` | Course code, title, timestamps |
| `students` | Student profile, trainer, notes, progress, derived status/priority |
| `student_courses` | Student-to-course assignments |
| `issues` | Student issue category, description, status, priority |
| `comments` | Student/issue thread messages |
| `prompts` | Reusable prompt templates with tags and optional course link |
| `ai_tools` | Approved AI tool name, description, and reserved metrics |
| `user_roles` | Legacy/admin compatibility role rows |

Important database behavior:

- `set_updated_at` triggers keep `updated_at` fresh.
- Issue insert/update/delete triggers recalculate each student's derived status and priority.
- Student comments can set a related issue back to `Pending`.
- Realtime is enabled for app tables so subscribed pages refresh automatically.
- RLS is enabled but open for anon/authenticated access in this no-login workspace mode.

## Open Access Mode

Login and route protection have intentionally been removed. The app opens directly at `/`.

Compatibility auth files remain so existing UI and API code can keep using the same interfaces:

| File | Current Behavior |
| --- | --- |
| `lib/auth/client.ts` | Open-access client compatibility helpers. |
| `lib/auth/roles.ts` | Returns admin access and allows mutation helpers. |
| `lib/auth/server.ts` | Creates a service-role client for server API routes. |
| `lib/auth/use-current-user-role.ts` | Gives the UI open admin role state. |
| `lib/auth/role-utils.ts` | Shared role constants/messages retained for compatibility. |

## Project Structure

```text
app/
  api/
    report/[studentId]/pdf/route.ts
    users/route.ts
    users/[userId]/route.ts
  comments/page.tsx
  courses/page.tsx
  issues/page.tsx
  prompts/page.tsx
  reports/page.tsx
  reports/[studentId]/page.tsx
  settings/page.tsx
  students/page.tsx
  tools/page.tsx
  workflow/page.tsx
  layout.tsx
  manifest.ts
  page.tsx

components/
  dashboard/charts.tsx
  issues/new-issue-dialog.tsx
  layout/dashboard-layout.tsx
  ui/

lib/
  auth/
  data/
  supabase.ts
  utils.ts

store/
  useSearchStore.ts
  useToastStore.ts

supabase/
  schema.sql
  seed.sql
  full-reset.sql
  reset-current-app.sql
  clear-data.sql
```

## Common Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Developer Notes

- This repo uses Next.js `16.2.6`. Before changing Next.js APIs or route conventions, read the relevant local docs under `node_modules/next/dist/docs/`.
- App data should flow through `lib/data/*` helpers rather than direct page-level Supabase queries where possible.
- `useSupabaseQuery()` handles loading state, error state, refresh, and realtime subscriptions.
- Zustand is not the source of app records; it is used for global search and toast notifications.
- Keep database schema changes in `supabase/schema.sql`.
- Keep seed data limited to approved baseline AI tool records unless real operational data is intentionally being added.
