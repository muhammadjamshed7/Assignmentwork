-- =========================================================
-- DESTRUCTIVE RESET SCRIPT FOR CURRENT TDS MANAGEMENT APP
-- WARNING: This deletes everything in the public schema.
-- Run this only when you want a fresh database for this app.
-- =========================================================

begin;

do $$
begin
  raise exception 'Deprecated reset-current-app.sql uses the pre-auth open-access schema. Use supabase/schema.sql and supabase/seed.sql instead.';
end $$;

-- Remove every existing table, view, policy, trigger, and function in public.
drop schema if exists public cascade;

-- Recreate Supabase's public schema and grants.
create schema public;
comment on schema public is 'standard public schema';

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

commit;

-- Rebuild the current app schema from scratch.
-- =========================================================
-- TDS Management current app schema
-- Tables covered by the current UI:
-- students, courses, student_courses, issues, comments,
-- prompts, ai_tools, user_roles
--
-- Open-access mode: no login route, no default auth user seed.
-- =========================================================

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Enums
do $$ begin
  create type user_role as enum ('Student', 'Admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type issue_status as enum ('Pending', 'In Progress', 'Resolved', 'Escalated');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type priority_level as enum ('Low', 'Medium', 'High', 'Critical');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type issue_category as enum (
    'Prompt Issues',
    'Stealth Writer Issues',
    'Instructions Issues',
    'Data Extraction Issues',
    'Reference Memory Issues',
    'Thesis Issues',
    'Remake Required',
    'Other'
  );
exception
  when duplicate_object then null;
end $$;

-- 3. Updated timestamp helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. Core tables
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  assigned_trainer text not null default 'Unassigned',
  notes text,
  overall_status issue_status not null default 'Pending',
  priority priority_level not null default 'Medium',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  last_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_courses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  category issue_category not null,
  description text not null,
  status issue_status not null default 'Pending',
  priority priority_level not null default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete cascade,
  author_name text not null,
  role user_role not null,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'General',
  content text not null,
  related_course_id uuid references public.courses(id) on delete set null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_tools (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null unique,
  description text not null default '',
  usage_count integer not null default 0 check (usage_count >= 0),
  active_students integer not null default 0 check (active_students >= 0),
  related_problems integer not null default 0 check (related_problems >= 0),
  success_rate integer not null default 100 check (success_rate >= 0 and success_rate <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid() limit 1
$$;

-- 5. Student rollup helper
create or replace function public.sync_student_issue_summary(target_student_id uuid)
returns void
language plpgsql
as $$
declare
  next_status issue_status;
  next_priority priority_level;
begin
  select
    case
      when count(*) filter (where status = 'Escalated') > 0 then 'Escalated'::issue_status
      when count(*) filter (where status = 'Pending') > 0 then 'Pending'::issue_status
      when count(*) filter (where status = 'In Progress') > 0 then 'In Progress'::issue_status
      else 'Resolved'::issue_status
    end,
    case
      when count(*) filter (where priority = 'Critical') > 0 then 'Critical'::priority_level
      when count(*) filter (where priority = 'High') > 0 then 'High'::priority_level
      when count(*) filter (where priority = 'Medium') > 0 then 'Medium'::priority_level
      else 'Low'::priority_level
    end
  into next_status, next_priority
  from public.issues
  where student_id = target_student_id;

  update public.students
  set
    overall_status = coalesce(next_status, 'Resolved'::issue_status),
    priority = coalesce(next_priority, 'Low'::priority_level),
    last_update = now(),
    updated_at = now()
  where id = target_student_id;
end;
$$;

create or replace function public.sync_student_after_issue_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_student_issue_summary(old.student_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.student_id is distinct from new.student_id then
    perform public.sync_student_issue_summary(old.student_id);
  end if;

  perform public.sync_student_issue_summary(new.student_id);
  return new;
end;
$$;

create or replace function public.mark_issue_pending_after_student_comment()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'Student' and new.issue_id is not null then
    update public.issues
    set status = 'Pending', updated_at = now()
    where id = new.issue_id;
  end if;

  update public.students
  set last_update = now(), updated_at = now()
  where id = new.student_id;

  return new;
end;
$$;

-- 6. Triggers
drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists issues_set_updated_at on public.issues;
create trigger issues_set_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_updated_at();

drop trigger if exists ai_tools_set_updated_at on public.ai_tools;
create trigger ai_tools_set_updated_at
before update on public.ai_tools
for each row execute function public.set_updated_at();

drop trigger if exists user_roles_set_updated_at on public.user_roles;
create trigger user_roles_set_updated_at
before update on public.user_roles
for each row execute function public.set_updated_at();

drop trigger if exists issues_sync_student_insert on public.issues;
create trigger issues_sync_student_insert
after insert on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists issues_sync_student_update on public.issues;
create trigger issues_sync_student_update
after update on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists issues_sync_student_delete on public.issues;
create trigger issues_sync_student_delete
after delete on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists comments_student_pending on public.comments;
create trigger comments_student_pending
after insert on public.comments
for each row execute function public.mark_issue_pending_after_student_comment();

-- 7. Indexes
create index if not exists idx_student_courses_student_id on public.student_courses(student_id);
create index if not exists idx_student_courses_course_id on public.student_courses(course_id);
create index if not exists idx_issues_student_id on public.issues(student_id);
create index if not exists idx_issues_status on public.issues(status);
create index if not exists idx_comments_student_id on public.comments(student_id);
create index if not exists idx_comments_issue_id on public.comments(issue_id);
create index if not exists idx_prompts_category on public.prompts(category);
create index if not exists idx_prompts_related_course_id on public.prompts(related_course_id);

-- 8. Row level security
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.student_courses enable row level security;
alter table public.issues enable row level security;
alter table public.comments enable row level security;
alter table public.prompts enable row level security;
alter table public.ai_tools enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "Allow public app access" on public.courses;
drop policy if exists "Allow public app access" on public.students;
drop policy if exists "Allow public app access" on public.student_courses;
drop policy if exists "Allow public app access" on public.issues;
drop policy if exists "Allow public app access" on public.comments;
drop policy if exists "Allow public app access" on public.prompts;
drop policy if exists "Allow public app access" on public.ai_tools;
drop policy if exists "Allow public role access" on public.user_roles;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['courses', 'students', 'student_courses', 'issues', 'comments', 'prompts', 'ai_tools']
  loop
    execute format('drop policy if exists "Authenticated read" on public.%I', table_name);
    execute format('drop policy if exists "Admin insert" on public.%I', table_name);
    execute format('drop policy if exists "Admin update" on public.%I', table_name);
    execute format('drop policy if exists "Admin delete" on public.%I', table_name);

    execute format('create policy "Allow public app access" on public.%I for all to anon, authenticated using (true) with check (true)', table_name);
  end loop;
end $$;

drop policy if exists "Authenticated read own role or admin" on public.user_roles;
drop policy if exists "Admin insert roles" on public.user_roles;
drop policy if exists "Admin update roles" on public.user_roles;
drop policy if exists "Admin delete roles" on public.user_roles;

create policy "Allow public role access"
on public.user_roles
for all
to anon, authenticated
using (true)
with check (true);

-- 9. Realtime
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime set table
  public.courses,
  public.students,
  public.student_courses,
  public.issues,
  public.comments,
  public.prompts,
  public.ai_tools,
  public.user_roles;

-- 10. App seed data intentionally omitted.
