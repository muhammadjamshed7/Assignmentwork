# TDS Management

TDS Management is a Next.js App Router dashboard for assignment operations. It manages writers, courses, issues, comments, reports, reusable prompts, approved AI tools, and a guided assignment workflow library.

The app uses Supabase Auth for login and Supabase Postgres for data. Admin users manage the full workspace. Writer expert users use the internal role value `student`; they can access only the pages approved for writers after their account status is approved.

For the dedicated auth guide, see [LOGIN_REGISTRATION_SETUP.md](./LOGIN_REGISTRATION_SETUP.md). For deeper app-flow notes, see [SYSTEM_FLOW.md](./SYSTEM_FLOW.md).

## README Map

Use this README in this order if you are new to the project:

1. Start with **Quick Start** to run the app.
2. Read **User Roles** to understand admin and writer expert access.
3. Read **Sidebar Navigation** to understand what each main menu item does.
4. Read **Workflow Sidebar Section** and **Prompts Sidebar Section** carefully. These are the two most important writer-facing productivity areas.
5. Use **App Routes**, **API Routes**, and **Project Structure** when editing code.

## Table Of Contents

- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [User Roles](#user-roles)
- [Sidebar Navigation](#sidebar-navigation)
- [Workflow Sidebar Section](#workflow-sidebar-section)
- [Prompts Sidebar Section](#prompts-sidebar-section)
- [App Routes](#app-routes)
- [API Routes](#api-routes)
- [Data Model](#data-model)
- [Authentication And Approval](#authentication-and-approval)
- [Supabase SQL Files](#supabase-sql-files)
- [Project Structure](#project-structure)
- [Common Commands](#common-commands)
- [Manual Test Checklist](#manual-test-checklist)
- [Developer Notes](#developer-notes)

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS, shadcn-style local components, lucide icons |
| Database | Supabase Postgres |
| Auth | Supabase Auth plus `public.user_roles` |
| Realtime | Supabase `postgres_changes` subscriptions |
| State | Zustand for search and toast state |
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

`SUPABASE_SERVICE_ROLE_KEY` is required only for server-side user-management routes and scripts. Never expose it in client code.

Run schema and seed files:

```bash
psql $DATABASE_URL < supabase/schema.sql
psql $DATABASE_URL < supabase/seed.sql
```

If the database existed before the approval system was added, run:

```bash
psql $DATABASE_URL < supabase/auth-approval-migration.sql
```

Create or update the default admin:

```bash
npm run seed:admin
```

Default admin login:

```text
admin@tds.com / khan123office
```

Default writer expert password:

```text
12345678
```

Start local development:

```bash
npm run dev
```

Open:

```text
Writer login: http://localhost:3000/login
Admin login:  http://localhost:3000/admin/login
```

On Windows PowerShell, if `npm.ps1` is blocked, use `npm.cmd`:

```bash
npm.cmd run lint
npm.cmd run build
```

## User Roles

| User type | Login URL | Internal role | Status needed | Destination |
| --- | --- | --- | --- | --- |
| Admin | `/admin/login` | `admin` | `approved` | `/` |
| Writer expert | `/login` | `student` | `approved` | `/workflow` |

Writer experts must use Gmail addresses. They are stored in Supabase Auth, linked to `public.students`, and authorized through `public.user_roles`.

## Sidebar Navigation

The sidebar is the main navigation shell after login. It is defined in `components/layout/dashboard-layout.tsx` and renders different menu items depending on the signed-in user's role.

Admins see the full operational workspace. Writer experts see the pages they need to complete assignment work, communicate about issues, and use approved prompts/tools.

| Sidebar item | Route | Admin | Writer expert | Purpose |
| --- | --- | --- | --- | --- |
| Dashboard | `/` | Yes | No | Admin metrics, charts, and recent activity |
| Writers | `/students` | Yes | No | Writer profile management |
| Reports | `/reports` | Yes | No | Writer reports and PDF exports |
| Courses | `/courses` | Yes | Yes | Course records and assigned writer course visibility |
| Prompts | `/prompts` | Yes | Yes | Prompt library, prompt copying, sharing, and admin prompt CRUD |
| Workflow | `/workflow` | Yes | Yes | Step-by-step assignment workflow library |
| Issues | `/issues` | Yes | Yes | Writer issue tracking and ticket creation |
| Comments & Tickets | `/comments` | Yes | Yes | Comment and support-ticket workspace |
| AI Tools | `/tools` | Yes | Yes | Approved AI tools directory |
| Settings | `/settings` | Yes | No | Supabase status and user approval management |

Public pages do not show the sidebar:

```text
/login
/admin/login
/register
/pending-approval
/access-denied
```

### Prompts vs Workflow In The Sidebar

The `Prompts` and `Workflow` sidebar items are related, but they are not the same thing.

| Sidebar item | Best used for | What it gives the user |
| --- | --- | --- |
| `Workflow` | Deciding the correct assignment process before starting | Step-by-step planning systems, guardrails, and copy-ready workflow prompts |
| `Prompts` | Reusing specific prompt templates during work | Subject-wise prompts, saved prompts, copy buttons, sharing, preview, and admin prompt management |

Simple rule:

```text
Use Workflow first when the assignment process is unclear.
Use Prompts when you already know what kind of prompt/template you need.
```

Practical examples:

| Situation | Click first | Why |
| --- | --- | --- |
| A writer receives a vague assignment brief and does not know the required output | `Workflow` | The writer needs a planning process before selecting a prompt |
| A writer needs a cybersecurity brief-analysis template | `Prompts` | The writer already knows the required prompt category |
| A writer needs to install Kali Linux, Power BI, RStudio, or another tool | `Workflow` | The tool setup process must be planned before execution |
| An admin wants to add a reusable company prompt for all writers | `Prompts` | Saved prompt creation is managed from the Prompts page |
| A writer receives screenshots, voice notes, Urdu, or Roman Urdu instructions | `Prompts` | The built-in voice/image requirements prompt helps clean and clarify the brief |

In day-to-day work, a writer may use both:

```text
Open Workflow -> choose planning process -> copy workflow prompt -> clarify the assignment
Open Prompts -> choose subject/template prompt -> copy prompt -> produce or refine the work
```

## Workflow Sidebar Section

The `Workflow` sidebar item opens `/workflow`. This section is a static workflow library for planning and executing academic assignment work. It is available to both approved admins and approved writer experts.

Workflow exists to stop writers from jumping directly into a final answer. It guides them through understanding the assignment, checking the brief, identifying tools, selecting the right academic structure, confirming deliverables, and only then starting execution.

Think of Workflow as the process map. It answers:

- What kind of assignment is this?
- What information is missing?
- What tools, files, screenshots, or evidence are required?
- What structure should the final work follow?
- What must be confirmed before writing starts?
- What approval/checkpoint should happen before moving forward?

Main files:

```text
app/workflow/page.tsx
app/workflow/[slug]/page.tsx
app/workflow/workflow-data.ts
app/workflow/_components/copy-workflow-button.tsx
```

### What Users See From The Sidebar

When a user clicks `Workflow` in the sidebar, they land on `/workflow`. The page shows a library of workflow cards. Each card represents a different assignment situation, such as:

- Unknown or unclear assignment.
- Tool installation or technical setup assignment.
- Essay topic selection.
- Dissertation topic selection.
- Assignment brief extraction and outline planning.
- General or specific assignment writing workflow.
- Master assignment prompt.

The cards are designed for scanning. A writer can quickly choose the workflow that matches the current assignment instead of guessing the right process.

### Workflow Landing Page

`app/workflow/page.tsx` renders workflow cards from `workflowCards` in `app/workflow/workflow-data.ts`. Each card has a title, slug, category, subtitle, description, and button text.

Current workflow cards include:

| Workflow | Slug | Category | Use case |
| --- | --- | --- | --- |
| Unknown Assignment Workflow | `unknown-assignment-workflow` | Planning First | Use when the assignment is unclear, incomplete, unfamiliar, or first-time |
| Tools Installation Workflow | `tools-installation-workflow` | Tool Setup First | Use when the assignment needs software, notebooks, technical tools, or setup |
| Essay Topic Selection Workflow | `essay-topic-selection` | Academic Planning | Select the strongest essay topic before writing |
| Dissertation Topic Selection Workflow | `dissertation-topic-selection` | Academic Planning | Select and scope a feasible dissertation topic |
| Assignment Intelligence | `assignment-intelligence` | Academic Planning | Extract brief details, identify missing information, plan topic and outline |
| Assignment Intelligence Prompt | `assignment-intelligence-workflow` | Academic Planning | Brief analysis, topic confirmation, word-count plan, outline approval |
| Specific Assignment Workflow | `specific-assignment-workflow` | Academic Writing | Apply the correct structure for a known assignment type |
| General Assignment Workflow | `general-assignment-workflow` | Academic Writing | General brief-to-outline-to-section writing workflow |
| General Assignment Workflow | `standard-academic-assignment-workflow` | Academic Writing | Section-by-section completion with approval gates |
| Master Assignment Prompt | `master-assignment-prompt` | Master Prompt | One reusable prompt containing the complete assignment workflow |

### Workflow Detail Pages

Each workflow opens at:

```text
/workflow/[slug]
```

`app/workflow/[slug]/page.tsx` uses `generateStaticParams()` to build static detail pages for every card in `workflowCards`.

Each detail page usually contains:

- A back link to `/workflow`.
- A category badge and workflow title.
- Purpose and usage notes.
- Step-by-step process cards.
- Mandatory output format.
- Copy-ready prompt block.
- Workflow summary side panel.
- Next workflow navigation.

Some workflows are rendered with custom article components, such as unknown assignments, tool installation, specific assignment workflow, standard academic workflow, and master prompt. Other workflows use structured objects from `workflowSteps`.

### Workflow Detail Side Panel

On `/workflow/[slug]`, the detail layout includes a summary side panel. This panel helps users understand the selected workflow without reading the entire prompt block first.

The side panel shows:

- Workflow category.
- Number of prompt blocks or counted prompt items.
- Important guardrails, such as planning before execution, structure approval, evidence checklist, or one-section-at-a-time writing.

This side panel is useful for writers because it reminds them what the workflow is meant to control before they copy the prompt.

### Workflow Is Not A Database Feature

Workflow content is static application content. It is stored in code, not in Supabase.

That means:

- Writers can read and copy workflows.
- Admins can read and copy workflows.
- Workflows do not appear in `/settings`.
- Workflow cards are not created from the UI.
- Updating workflow content requires a code change in `app/workflow/workflow-data.ts`.

### How Writers Should Use Workflow

The Workflow section is meant to prevent writers from starting too quickly. The intended pattern is:

1. Open `/workflow`.
2. Choose the workflow that matches the assignment situation.
3. Read the purpose and when-to-use guidance.
4. Copy the reusable prompt block.
5. Paste the student's assignment brief into the prompt.
6. Complete planning first: subject, task breakdown, tools, structure, deliverables, and approval gates.
7. Start writing or technical execution only after the workflow has clarified the assignment.

### Recommended Writer Routine

For every new assignment, the writer should follow this routine:

1. Open the assignment brief and check whether it is clear.
2. If the brief is unclear, open `Workflow` and choose `Unknown Assignment Workflow`.
3. If the assignment requires software or screenshots, choose `Tools Installation Workflow`.
4. If the task is academic writing, choose the general or specific assignment workflow.
5. Copy the workflow prompt.
6. Use the prompt to produce a plan, outline, deliverables checklist, or setup checklist.
7. Only after the plan is clear, move to `Prompts` for subject-specific or saved prompt templates.

### When To Choose Each Workflow

| Assignment situation | Recommended workflow |
| --- | --- |
| Requirements are unclear, incomplete, or unfamiliar | Unknown Assignment Workflow |
| Assignment needs software installation, tool setup, screenshots, or technical evidence | Tools Installation Workflow |
| Essay topic is open and must be selected first | Essay Topic Selection Workflow |
| Dissertation topic must be selected, scoped, or checked for feasibility | Dissertation Topic Selection Workflow |
| User has a full brief and wants extraction, topic confirmation, word count, and outline | Assignment Intelligence |
| Assignment type is known, such as essay, report, case study, or lab report | Specific Assignment Workflow |
| Assignment is normal academic writing but needs step-by-step control | General Assignment Workflow |
| User wants one reusable complete prompt | Master Assignment Prompt |

### Admin And Writer Behavior

Both admins and approved writer experts can read workflow pages and copy workflow prompts. Workflow content is static code data, not database content, so normal users do not create or edit workflows from the UI.

To change workflow content, a developer edits:

```text
app/workflow/workflow-data.ts
```

### Adding A New Workflow

To add another workflow:

1. Add a new card to `workflowCards` in `app/workflow/workflow-data.ts`.
2. Add a structured workflow entry to `workflowSteps` if the workflow follows the standard structured format.
3. If the workflow needs custom rendering, add a custom article component in `app/workflow/[slug]/page.tsx` and route it in `WorkflowArticle`.
4. If the card needs a specific icon, update `workflowIcons` in `app/workflow/page.tsx`.

## Prompts Sidebar Section

The `Prompts` sidebar item opens `/prompts`. This section is a reusable prompt library for assignment planning, writing support, subject-specific brief analysis, and saved operational prompt templates.

Prompts is where writers go when they need a ready-made instruction to copy, preview, share, or adapt. Unlike Workflow, which focuses on full process control, Prompts focuses on reusable prompt text.

Think of Prompts as the template library. It answers:

- Which prompt should I paste into an AI tool?
- Which academic subject or assignment type does this prompt support?
- Is there a saved company prompt for this task?
- Can I copy, preview, or share this prompt quickly?
- Can an admin turn a built-in template into a managed saved prompt?

Main files:

```text
app/prompts/page.tsx
app/api/prompts/route.ts
app/api/prompts/[promptId]/route.ts
lib/data/prompts.ts
supabase/schema.sql
```

### What Users See From The Sidebar

When a user clicks `Prompts` in the sidebar, they land on `/prompts`. The page is split into practical working areas:

- A writing-style instruction block for natural, direct writing guidance.
- A subject-wise academic prompt library for common assignment categories.
- A saved prompt library backed by Supabase.
- Search and category filters.
- Copy, view details, share link, and preview actions.
- Admin-only create, edit, save, and delete controls.

For a writer expert, this page is mostly a copy-and-use library. For an admin, it is also a management screen for saved prompts.

### What The Prompts Page Contains

The page has three major prompt areas:

| Area | Source | Purpose |
| --- | --- | --- |
| Writing style instructions | Local constant in `app/prompts/page.tsx` | Copy a reusable natural-writing instruction prompt |
| Subject-wise academic prompts | Local `subjectWisePrompts` array | Built-in templates for common assignment types and subjects |
| Saved prompts | Supabase `prompts` table | Admin-created prompt records shown as searchable, paginated cards |

### Built-In Prompts vs Saved Prompts

The Prompts page has two different kinds of prompt content:

| Prompt type | Stored in | Edited from UI | Who can use it | Best for |
| --- | --- | --- | --- | --- |
| Built-in subject-wise prompts | `app/prompts/page.tsx` | No | Admins and approved writers | Standard reusable templates shipped with the app |
| Saved prompts | Supabase `public.prompts` | Yes, admins only | Admins and approved writers | Operational prompts that admins manage over time |

This distinction matters. If a prompt should be changed often by admins, save it as a database prompt. If it is a core template that ships with the codebase, keep it as a built-in subject-wise prompt.

### Prompts Page Layout

The `/prompts` page is organized for repeated daily use:

| UI area | What it does |
| --- | --- |
| Header/actions | Shows page purpose and admin create action |
| Writing style block | Provides a copy-ready instruction for simple, natural, direct writing |
| Subject-wise prompt section | Shows built-in prompt cards by category |
| Subject prompt filters | Lets users filter built-in prompts by academic area |
| Saved prompt grid | Shows database prompts as cards |
| Search box | Filters saved prompts by title/content/category/tags |
| Category dropdown | Narrows saved prompts by category |
| Preview panel | Shows the selected saved prompt in full |
| Share controls | Builds shareable prompt URLs |

### Subject-Wise Prompt Library

Subject-wise prompts are built into `app/prompts/page.tsx`. They are not database rows unless an admin saves one as a new prompt.

Current filter groups include:

```text
All
Voice and Image requirements
Academic Planning
Presentation Planning
Cybersecurity
MBA / Business
BBA / Business Studies
Computer Science / IT
Marketing
```

Subject-wise prompt cards support:

- Category filtering.
- Copy prompt.
- View details.
- Share link.
- Admin "save as new prompt" action.
- Special assignment-requirement workflow display for voice/image requirement prompts.

The voice/image requirement prompt is designed for assignment requirements received as images, Urdu text, Roman Urdu, English text, or voice-note transcription. It asks the AI to understand the brief first, identify missing details, ask cross-questions, and avoid starting the final answer until requirements are clear.

### Assignment Requirement Workflow Inside Prompts

When the selected subject-wise prompt is related to `Voice and Image requirements`, the Prompts page displays a special assignment requirement workflow.

This workflow explains how to handle messy input before using a final academic prompt. It covers:

- Image requirements.
- Voice-note transcription.
- Urdu and Roman Urdu requirements.
- Requirement cleaning.
- GPT understanding stage.
- Cross-question stage.
- Execution stage.
- Final review.

This is important because many assignment requests do not arrive as clean text. The prompt workflow helps the writer convert unclear material into a complete brief before starting final work.

### Saved Prompt Library

Saved prompts are database-backed records from `public.prompts`.

Prompt table shape:

```text
prompts
  id uuid primary key
  title text not null
  category text not null default 'General'
  content text not null
  related_course_id uuid references courses(id)
  tags text[] not null default '{}'
  created_at timestamptz
  updated_at timestamptz
```

Saved prompt features:

- Paginated prompt cards.
- Search by prompt title, content, category, and tags.
- Category filter.
- Related course label.
- Prompt preview side panel.
- Copy prompt to clipboard.
- Share prompt links through `?prompt=<promptId>`.
- Admin create/edit/delete.
- Admin save a built-in subject-wise prompt into the database.

### Saved Prompt User Flow

For approved writer experts:

1. Open `/prompts` from the sidebar.
2. Use the search box or category filter.
3. Select a prompt card.
4. Read the preview panel.
5. Copy the prompt.
6. Paste it into the AI tool or assignment workflow where needed.

For admins:

1. Open `/prompts`.
2. Create a new saved prompt with title, category, course, tags, and content.
3. Edit or delete existing saved prompts when templates change.
4. Save a built-in subject-wise prompt as a new database prompt when it should become part of the managed prompt library.
5. Share prompt links with writers when a specific template should be used.

### Sharing Prompts

The Prompts page supports URL-based sharing:

```text
/prompts?prompt=<promptId>
/prompts?subjectPrompt=<subjectPromptSlug>
```

`prompt` opens a saved database prompt. `subjectPrompt` opens a built-in subject-wise prompt. This is useful when an admin wants to point writers directly to the correct prompt.

### Recommended Writer Routine

For daily use, a writer should use the Prompts sidebar like this:

1. Open `/prompts` from the sidebar.
2. If the assignment came as images, voice notes, Urdu, or Roman Urdu, start with the voice/image requirements prompt.
3. If the subject is known, filter subject-wise prompts by category.
4. If the team has a saved prompt for the task, search the saved prompt library.
5. Open the prompt details or preview panel.
6. Copy the prompt.
7. Paste it into the AI tool with the assignment brief or cleaned requirements.
8. If the result still needs planning, go back to `Workflow`.

### Recommended Admin Routine

Admins should use the Prompts sidebar as a prompt management area:

1. Create saved prompts for templates that writers need repeatedly.
2. Keep titles clear and searchable.
3. Use categories consistently so writers can filter quickly.
4. Add tags for subject, assignment type, tool, or workflow stage.
5. Link prompts to a course when the template is course-specific.
6. Remove outdated prompts to avoid duplicate or conflicting instructions.
7. Share direct prompt links when assigning a specific template to writers.

### Prompt Permissions

| Action | Admin | Writer expert |
| --- | --- | --- |
| Read saved prompts | Yes | Yes, if approved |
| Read subject-wise prompts | Yes | Yes, if approved |
| Copy prompts | Yes | Yes |
| Share prompt links | Yes | Yes |
| Create saved prompts | Yes | No |
| Edit saved prompts | Yes | No |
| Delete saved prompts | Yes | No |

The API enforces this:

- `GET /api/prompts` and `GET /api/prompts/[promptId]` require an approved login.
- `POST /api/prompts`, `PATCH /api/prompts/[promptId]`, and `DELETE /api/prompts/[promptId]` require approved admin access.

### Adding Prompt Categories

To add a new prompt category:

1. Add the category to `PROMPT_CATEGORIES` in `app/prompts/page.tsx`.
2. If it should appear as a subject-wise filter, add it to `SUBJECT_PROMPT_FILTERS`.
3. Use the same category value in saved prompt records or built-in subject-wise prompts.

### Adding Built-In Subject-Wise Prompts

To add a built-in subject-wise prompt:

1. Add a new object to `subjectWisePrompts` in `app/prompts/page.tsx`.
2. Include `title`, `category`, `description`, `tags`, and `content`.
3. Confirm the category exists in `SUBJECT_PROMPT_FILTERS` if it needs a top filter.
4. If admins should save it into the database, the existing "save as new prompt" action can use it.

### Prompt API Flow

Client helper:

```text
lib/data/prompts.ts
```

API routes:

```text
GET    /api/prompts?page=1&pageSize=10
POST   /api/prompts
GET    /api/prompts/[promptId]
PATCH  /api/prompts/[promptId]
DELETE /api/prompts/[promptId]
```

Saved prompt responses are mapped through `mapPrompt()` and returned in the app's `Prompt` shape:

```text
id
title
category
content
relatedCourseId
tags
createdAt
updatedAt
```

## App Routes

| Route | Access | Purpose | Main data |
| --- | --- | --- | --- |
| `/` | Admin | Dashboard metrics, charts, recent writers | `students`, `courses`, `issues` |
| `/admin/login` | Public | Admin login | Supabase Auth |
| `/login` | Public | Writer expert login | Supabase Auth |
| `/register` | Public | Writer expert registration | Supabase Auth, `students`, `user_roles` |
| `/pending-approval` | Signed-in pending users | Pending account status | `user_roles` |
| `/access-denied` | Public | Rejected/disabled account status | `user_roles` |
| `/students` | Admin | Writer CRUD and course assignment | `students`, `student_courses`, `courses` |
| `/courses` | Admin, writer | Course records | `courses`, `student_courses` |
| `/issues` | Admin, writer | Issue tracking | `issues`, `students` |
| `/comments` | Admin, writer | Ticket/comment workspace | `comments`, `issues`, `students` |
| `/prompts` | Admin, writer | Prompt library | `prompts`, `courses` |
| `/reports` | Admin | Writer report index | `students`, `issues`, `courses` |
| `/reports/[studentId]` | Admin, assigned writer | Writer detail report and PDF export | `students`, `issues`, `comments`, `courses` |
| `/tools` | Admin, writer | Approved AI tools directory | `ai_tools` |
| `/workflow` | Admin, writer | Workflow library | Static workflow data |
| `/workflow/[slug]` | Admin, writer | Workflow detail page | Static workflow data |
| `/settings` | Admin | User approval and Supabase status | `user_roles`, Supabase Auth admin API |

## API Routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/auth/me` | `GET` | Returns the authenticated user's role/status profile |
| `/api/auth/register` | `POST` | Creates a pending writer expert login and linked writer profile |
| `/api/prompts` | `GET`, `POST` | Lists prompts for approved users; creates prompts for admins |
| `/api/prompts/[promptId]` | `GET`, `PATCH`, `DELETE` | Reads prompts for approved users; updates/deletes prompts for admins |
| `/api/report/[studentId]/pdf` | `GET` | Generates a writer PDF report |
| `/api/users` | `GET`, `POST` | Admin-only user listing and creation |
| `/api/users/[userId]` | `PATCH`, `DELETE` | Admin-only user update/delete |

## Data Model

| Table | Stores |
| --- | --- |
| `courses` | Course code, title, timestamps |
| `students` | Writer profile, email, trainer, notes, progress, derived status and priority |
| `student_courses` | Writer-to-course assignments |
| `issues` | Writer issue category, description, status, priority |
| `comments` | Writer/issue thread messages |
| `prompts` | Reusable saved prompt templates with tags and optional course link |
| `ai_tools` | Approved AI tool name, description, and reserved metrics |
| `user_roles` | Role, approval status, linked writer profile, approval metadata |

Important database behavior:

- `set_updated_at` triggers maintain `updated_at`.
- Issue insert/update/delete triggers recalculate each writer's derived status and priority.
- Student comments can set a related issue back to `Pending`.
- Realtime is enabled for app tables.
- RLS is approval-aware: approved admins can manage app data, while approved writers are scoped to their own writer records and writer-safe resources.

## Authentication And Approval

Auth files:

```text
lib/auth/role-utils.ts
lib/auth/roles.ts
lib/auth/server.ts
lib/auth/use-current-user-role.ts
lib/auth/writers.ts
proxy.ts
```

Key rules:

- Admin account is `admin@tds.com` with password `khan123office`.
- Writer expert accounts use Gmail addresses and password `12345678`.
- The UI label is "Writer Expert"; the internal role value is `student`.
- `user_roles.status` controls access: `pending`, `approved`, `rejected`, or `disabled`.
- `proxy.ts` handles page redirects.
- API routes perform their own JSON auth checks.
- Admins approve, reject, disable, or delete users from `/settings`.

## Supabase SQL Files

| File | Purpose |
| --- | --- |
| `supabase/schema.sql` | Main schema, enums, triggers, indexes, grants, RLS, realtime publication |
| `supabase/seed.sql` | Baseline AI tool seed data |
| `supabase/auth-approval-migration.sql` | Migration for approval-based auth on an existing database |
| `supabase/00-reset-admin-auth.sql` | SQL helper to remove only the default admin auth account |
| `supabase/01-enable-admin-auth.sql` | SQL helper to create/enable the default admin account |
| `supabase/clear-data.sql` | Clears app data while preserving schema |

## Project Structure

```text
app/
  access-denied/page.tsx
  admin/login/page.tsx
  api/
    auth/me/route.ts
    auth/register/route.ts
    prompts/route.ts
    prompts/[promptId]/route.ts
    report/[studentId]/pdf/route.ts
    users/route.ts
    users/[userId]/route.ts
  comments/page.tsx
  courses/page.tsx
  issues/page.tsx
  login/page.tsx
  pending-approval/page.tsx
  prompts/page.tsx
  register/page.tsx
  reports/page.tsx
  reports/[studentId]/page.tsx
  settings/page.tsx
  students/page.tsx
  tools/page.tsx
  workflow/
    _components/copy-workflow-button.tsx
    [slug]/page.tsx
    page.tsx
    workflow-data.ts
  layout.tsx
  manifest.ts
  page.tsx

components/
  auth/login-card.tsx
  dashboard/charts.tsx
  issues/new-issue-dialog.tsx
  layout/dashboard-layout.tsx
  ui/

lib/
  auth/
    role-utils.ts
    roles.ts
    server.ts
    use-current-user-role.ts
    writers.ts
  data/
    prompts.ts
  supabase.ts
  utils.ts

scripts/
  ensure-default-admin.mjs
  reset-writer-passwords.mjs
  upsert-approved-tools.mjs

store/
  useSearchStore.ts
  useToastStore.ts

supabase/
  00-reset-admin-auth.sql
  01-enable-admin-auth.sql
  auth-approval-migration.sql
  clear-data.sql
  schema.sql
  seed.sql

proxy.ts
```

## Common Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run seed:admin
npm run reset:writers-password
```

## Manual Test Checklist

Use this after auth, workflow, prompt, or route changes:

1. Run `npm.cmd run lint`.
2. Run `npm.cmd run build`.
3. Open `/login`, `/admin/login`, `/register`, `/workflow`, and `/prompts`.
4. Confirm unauthenticated protected pages redirect to the correct login page.
5. Confirm unauthenticated API requests return JSON `401`, not HTML redirects.
6. Sign in as admin and open `/settings`.
7. Sign in as a writer and confirm `/workflow` and `/prompts` are accessible.
8. Confirm writer access to admin-only pages redirects back to `/workflow`.
9. Copy a workflow prompt from `/workflow/[slug]`.
10. Copy, preview, and share a prompt from `/prompts`.
11. As admin, create/edit/delete a saved prompt.

## Developer Notes

- This repo uses Next.js `16.2.6`. Before changing Next.js route conventions or APIs, read the local docs under `node_modules/next/dist/docs/`.
- Keep database schema changes in `supabase/schema.sql`.
- Keep app data access inside `lib/data/*` helpers where possible.
- Keep auth rules centralized in `lib/auth/*` and `proxy.ts`.
- Add workflow content in `app/workflow/workflow-data.ts`.
- Add built-in subject-wise prompt templates in `app/prompts/page.tsx`.
- Add saved prompt behavior through `/api/prompts` and `lib/data/prompts.ts`.
- Do not commit real service-role keys or user secrets.
