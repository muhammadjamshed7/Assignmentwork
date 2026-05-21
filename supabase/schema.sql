-- =========================
-- SUPABASE SCHEMA SUGGESTION
-- =========================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
create type user_role as enum ('Student', 'Admin');
create type issue_status as enum ('Pending', 'In Progress', 'Resolved', 'Escalated');
create type priority_level as enum ('Low', 'Medium', 'High', 'Critical');
create type issue_category as enum (
  'Prompt Issues', 
  'Stealth Writer Issues', 
  'Instructions Issues', 
  'Data Extraction Issues', 
  'Reference Memory Issues', 
  'Thesis Issues', 
  'Remake Required'
);

-- 3. TABLES

-- Trainers
create table trainers (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  email varchar(255) not null unique,
  created_at timestamp with time zone default now()
);

-- Students
create table students (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  email varchar(255) unique,
  assigned_trainer_id uuid references trainers(id) on delete set null,
  overall_status issue_status default 'Pending',
  priority priority_level default 'Medium',
  progress int default 0 check (progress >= 0 and progress <= 100),
  last_update timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Courses
create table courses (
  id uuid primary key default uuid_generate_v4(),
  course_code varchar(100) not null unique,
  title varchar(255) not null,
  created_at timestamp with time zone default now()
);

-- Student_Courses (Many-to-Many)
create table student_courses (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  status varchar(100) default 'Active',
  submission_deadline timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(student_id, course_id)
);

-- Issues
create table issues (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  category issue_category not null,
  description text,
  status issue_status default 'Pending',
  priority priority_level default 'Medium',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Comments / Tickets
create table comments (
  id uuid primary key default uuid_generate_v4(),
  issue_id uuid references issues(id) on delete cascade,
  author_id uuid, -- could link to users auth table
  role user_role not null,
  text text not null,
  created_at timestamp with time zone default now()
);

-- AI Tools
create table ai_tools (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null unique,
  description text,
  created_at timestamp with time zone default now()
);

-- Student AI Tool Usage
create table student_ai_tools (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  tool_id uuid references ai_tools(id) on delete cascade,
  usage_count int default 1,
  success_rate int default 100, -- percentage
  created_at timestamp with time zone default now(),
  unique(student_id, tool_id)
);

-- Issue Logs / Activity Timeline
create table issue_logs (
  id uuid primary key default uuid_generate_v4(),
  issue_id uuid references issues(id) on delete cascade,
  action varchar(255) not null,
  performed_by uuid,
  created_at timestamp with time zone default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  title varchar(255) not null,
  message text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- 4. RLS & POLICIES (Example)
alter table students enable row level security;
alter table courses enable row level security;

-- Admin full access example (assuming auth.uid() has admin role logic)
-- create policy "Admins have full access to students" on students for all using (auth.role() = 'authenticated');
