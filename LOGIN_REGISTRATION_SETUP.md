# Admin And Writer Login Registration Setup

This document explains how the TDS Management login and registration system is set up for admins and writer experts. In the codebase, writer expert accounts are stored with the internal role name `student`.

## Overview

The app uses Supabase Auth for email/password authentication and a custom `user_roles` table for app-level authorization.

There are two login pages:

| User type | URL | Internal role | Default destination |
| --- | --- | --- | --- |
| Admin | `/admin/login` | `admin` | `/` |
| Writer expert | `/login` | `student` | `/workflow` |

Writer experts use Gmail addresses and the default writer password `12345678`. They can self-register from `/register`, but they are created with `status = pending` unless an admin already approved the account. They cannot use the main app until an approved admin changes their status to `approved` from `/settings`.

## Required Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used by browser and server Supabase clients.
- `SUPABASE_SERVICE_ROLE_KEY` is used only on server-side API routes for creating, approving, updating, inviting, and deleting users.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components.

## Database Setup

Run the main schema:

```bash
psql "$DATABASE_URL" < supabase/schema.sql
```

If the database already existed before the approval system was added, run:

```bash
psql "$DATABASE_URL" < supabase/auth-approval-migration.sql
```

The important auth-related database table is `public.user_roles`.

```text
user_roles
  user_id uuid primary key references auth.users(id)
  email text not null
  role text not null
  status text not null default 'pending'
  student_id uuid references public.students(id)
  approved_by uuid references auth.users(id)
  approved_at timestamptz
  created_at timestamptz
  updated_at timestamptz
```

Valid role values:

```text
admin
student
```

Valid status values:

```text
pending
approved
rejected
disabled
```

## Create The Default Admin

The project includes a script for creating or updating the default admin account:

```bash
npm run seed:admin
```

This runs:

```text
scripts/ensure-default-admin.mjs
```

Default admin credentials currently defined in that script:

```text
Email: admin@tds.com
Password: khan123office
```

The script creates or updates a Supabase Auth user, then upserts this row into `user_roles`:

```text
role: admin
status: approved
```

## Writer Registration Flow

Writer expert registration starts at:

```text
/register
```

Main files:

```text
app/register/page.tsx
app/api/auth/register/route.ts
```

Flow:

1. The writer opens `/register`.
2. The writer enters full name and Gmail address.
3. `app/register/page.tsx` sends a `POST` request to `/api/auth/register`.
4. `app/api/auth/register/route.ts` validates the input.
5. The server creates or updates a Supabase Auth user using the service-role client.
6. The server links an existing matching `students` row by Gmail, or creates a new `students` row if one does not exist.
7. The server creates or updates a `user_roles` row:

```text
role: student
status: pending
student_id: created student id
```

8. The page signs the writer in automatically with the default writer password `12345678`.
9. The writer is redirected to `/pending-approval`.

While pending, the writer cannot access the approved app pages.

## Admin Login Flow

Admin login starts at:

```text
/admin/login
```

Main files:

```text
app/admin/login/page.tsx
components/auth/login-card.tsx
app/api/auth/me/route.ts
lib/auth/server.ts
lib/auth/role-utils.ts
```

Flow:

1. The admin opens `/admin/login`.
2. `app/admin/login/page.tsx` renders `LoginCard` with `expectedRole: "admin"`.
3. `LoginCard` signs in with `supabase.auth.signInWithPassword`.
4. After sign-in, it calls `/api/auth/me`.
5. `/api/auth/me` calls `getCurrentUserProfile()`.
6. `getCurrentUserProfile()` reads the authenticated Supabase user and their `user_roles` row.
7. `LoginCard` confirms the returned profile has `role = admin`.
8. If the admin is approved, the user is redirected to `/`.

If an admin tries to use `/login`, they are signed out and shown the role-specific error:

```text
This login is for writer experts. Admins must use /admin/login.
```

## Writer Login Flow

Writer expert login starts at:

```text
/login
```

Main files:

```text
app/login/page.tsx
components/auth/login-card.tsx
app/api/auth/me/route.ts
lib/auth/server.ts
lib/auth/role-utils.ts
```

Flow:

1. The writer opens `/login`.
2. `app/login/page.tsx` renders `LoginCard` with `expectedRole: "student"`.
3. `LoginCard` signs in with `supabase.auth.signInWithPassword`.
4. After sign-in, it calls `/api/auth/me`.
5. `/api/auth/me` returns the current role and approval status.
6. `LoginCard` confirms the account has `role = student`.
7. Redirect depends on status:

| Status | Redirect |
| --- | --- |
| `approved` | `/workflow` |
| `pending` | `/pending-approval` |
| `rejected` | `/access-denied` |
| `disabled` | `/access-denied` |

If a writer tries to use `/admin/login`, they are signed out and shown the role-specific error:

```text
This login is for admins. Writer experts must use /login.
```

## Approval Flow

Approved admins manage users from:

```text
/settings
```

Main files:

```text
app/settings/page.tsx
app/api/users/route.ts
app/api/users/[userId]/route.ts
lib/auth/server.ts
```

Admin actions available in `/settings`:

| Action | Result |
| --- | --- |
| Approve | Sets `status = approved` |
| Reject | Sets `status = rejected` |
| Disable | Sets `status = disabled` |
| Change role | Sets `role = admin` or `role = student` |
| Delete user | Deletes from `user_roles`, then deletes the Supabase Auth user |

When an admin approves a user, `app/api/users/[userId]/route.ts` also records:

```text
approved_by: current admin user id
approved_at: current timestamp
```

The same route updates Supabase Auth `user_metadata` with the latest role and status.

## Route Protection

Route protection is handled by:

```text
proxy.ts
```

Public pages:

```text
/login
/admin/login
/register
/pending-approval
/access-denied
```

Public API prefix:

```text
/api/auth
```

Admin-only paths:

```text
/
/students
/reports
/settings
```

Writer expert allowed paths:

```text
/workflow
/prompts
/tools
/courses
/issues
/comments
/api/auth
```

Protection behavior:

- Unauthenticated users are redirected to the correct login page.
- Pending users are redirected to `/pending-approval`.
- Rejected or disabled users are redirected to `/access-denied`.
- Approved admins can access admin pages.
- Approved writers are redirected away from admin-only pages and sent to `/workflow`.

## Auth Helper Files

```text
lib/auth/role-utils.ts
```

Defines shared auth types and role/status helpers:

```text
UserRole = "admin" | "student"
UserStatus = "pending" | "approved" | "rejected" | "disabled"
isApprovedAdmin()
isApprovedStudent()
```

```text
lib/auth/server.ts
```

Creates server Supabase clients and exposes server-side auth guards:

```text
createServiceRoleClient()
getCurrentUserProfile()
requireApprovedUser()
requireAdminRequest()
```

```text
lib/auth/roles.ts
```

Client helper for reading the current profile from `/api/auth/me`.

```text
lib/auth/use-current-user-role.ts
```

React hook used by client pages to know whether the current user is an approved admin or approved writer.

```text
lib/supabase.ts
```

Creates the browser Supabase client with `@supabase/ssr`.

## Auth Folder Structure

```text
app/
  admin/
    login/
      page.tsx                # Admin login page
  api/
    auth/
      me/
        route.ts              # Returns current authenticated profile
      register/
        route.ts              # Creates pending writer expert accounts
    users/
      route.ts                # Admin-only list/invite users API
      [userId]/
        route.ts              # Admin-only update/delete user API
  login/
    page.tsx                  # Writer expert login page
  register/
    page.tsx                  # Writer expert registration page
  pending-approval/
    page.tsx                  # Pending account status page
  access-denied/
    page.tsx                  # Rejected/disabled account page
  settings/
    page.tsx                  # Admin user management UI

components/
  auth/
    login-card.tsx            # Shared admin/writer login form
  ui/
    password-input.tsx        # Password input used by login forms

lib/
  auth/
    role-utils.ts             # Role/status types and helpers
    roles.ts                  # Client current-profile helper
    server.ts                 # Server auth helpers and guards
    use-current-user-role.ts  # Client hook for role/status
  supabase.ts                 # Browser Supabase client

scripts/
  ensure-default-admin.mjs    # Creates or updates default approved admin
  reset-writer-passwords.mjs  # Helper script for writer passwords

supabase/
  schema.sql                  # Main schema, RLS, auth helper functions
  auth-approval-migration.sql # Migration for approval-based auth
  00-reset-admin-auth.sql     # SQL reset helper
  01-enable-admin-auth.sql    # SQL admin auth helper

proxy.ts                      # Route protection and redirects
```

## Important Implementation Details

The UI uses the label "Writer Expert", but the database and TypeScript role value are `student`.

Registration creates or links these records:

```text
auth.users
students
user_roles
```

Login checks both authentication and authorization:

```text
Supabase Auth session exists
user_roles.role matches the login page
user_roles.status controls access
```

Admin-only APIs must call:

```text
requireAdminRequest()
```

This ensures the requester is authenticated, has `role = admin`, and has `status = approved`.

## Manual Test Checklist

Use this checklist after changing auth code:

1. Open `/register` and create a writer expert account.
2. Confirm the writer lands on `/pending-approval`.
3. Try opening `/workflow` while pending and confirm access is blocked.
4. Sign in as admin at `/admin/login`.
5. Open `/settings`.
6. Approve the pending writer.
7. Sign in as the writer at `/login`.
8. Confirm the writer lands on `/workflow`.
9. Try opening `/settings` as the writer and confirm redirect to `/workflow`.
10. Disable or reject the writer from admin settings.
11. Confirm the writer lands on `/access-denied`.

## Common Issues

### Supabase is not configured

Check `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

### Writer stays pending after approval

Refresh the page or click "Check status" on `/pending-approval`. Also confirm the `user_roles` row has:

```text
role = student
status = approved
student_id = matching students.id
```

### Admin cannot manage users

Confirm the admin has this row in `user_roles`:

```text
role = admin
status = approved
```

Also confirm `SUPABASE_SERVICE_ROLE_KEY` exists in `.env.local`.

### Wrong login page error

Admins must use:

```text
/admin/login
```

Writer experts must use:

```text
/login
```
