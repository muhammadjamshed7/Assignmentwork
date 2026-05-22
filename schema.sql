-- =========================================================
-- EduMetrics current app schema
-- Tables covered by the current UI only:
-- students, courses, student_courses, issues, comments,
-- prompts, ai_tools
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

alter type issue_category add value if not exists 'Other';

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
  usage_count integer not null default 0 check (usage_count >= 0),
  active_students integer not null default 0 check (active_students >= 0),
  related_problems integer not null default 0 check (related_problems >= 0),
  success_rate integer not null default 100 check (success_rate >= 0 and success_rate <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  perform public.sync_student_issue_summary(coalesce(new.student_id, old.student_id));
  return coalesce(new, old);
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

drop trigger if exists issues_sync_student_insert on public.issues;
create trigger issues_sync_student_insert
after insert on public.issues
for each row execute function public.sync_student_after_issue_change();

drop trigger if exists issues_sync_student_update on public.issues;
create trigger issues_sync_student_update
after update of status, priority, category on public.issues
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

drop policy if exists "Allow public app access" on public.courses;
create policy "Allow public app access" on public.courses for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.students;
create policy "Allow public app access" on public.students for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.student_courses;
create policy "Allow public app access" on public.student_courses for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.issues;
create policy "Allow public app access" on public.issues for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.comments;
create policy "Allow public app access" on public.comments for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.prompts;
create policy "Allow public app access" on public.prompts for all using (true) with check (true);

drop policy if exists "Allow public app access" on public.ai_tools;
create policy "Allow public app access" on public.ai_tools for all using (true) with check (true);

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
  public.ai_tools;

-- 10. Seed data intentionally omitted.
