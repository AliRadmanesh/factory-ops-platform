-- Manufacturing Operations Platform — Supabase Schema
-- Run this entire file in the Supabase SQL Editor

CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section_id UUID NOT NULL REFERENCES sections(id),
  pin TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity_required INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id),
  work_order_id UUID NOT NULL REFERENCES work_orders(id),
  section_id UUID NOT NULL REFERENCES sections(id),
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed')),
  parts_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id),
  title TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'per_job')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  operator_id UUID NOT NULL REFERENCES operators(id),
  job_log_id UUID REFERENCES job_logs(id),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Disable RLS for demo
ALTER TABLE sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions DISABLE ROW LEVEL SECURITY;

-- Enable Realtime on job_logs for dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE job_logs;
