-- ============================================================
-- FloorOps — Seed Data
-- Run once in Supabase SQL editor
-- Requires: pgcrypto extension (enabled by default on Supabase)
-- ============================================================

-- 2.1 Sections
INSERT INTO sections (name, color) VALUES
  ('Raw Materials',   '#7c3aed'),
  ('Fabrication',     '#dc2626'),
  ('Assembly',        '#2563eb'),
  ('Quality Control', '#059669'),
  ('Dispatch',        '#d97706');

-- 2.2 Operators (PINs listed below for testing)
-- Raw Materials:   Carlos Vega      1234
-- Raw Materials:   Sofia Reyes      2345
-- Fabrication:     Marcus Webb      3456
-- Fabrication:     Priya Nair       4567
-- Assembly:        Derek Osei       5678
-- Assembly:        Lena Fischer     6789
-- Quality Control: James Thornton   7890
-- Quality Control: Anika Patel      8901
-- Dispatch:        Ryan Callahan    9012
-- Dispatch:        Mei Lin          0123

INSERT INTO operators (name, section_id, pin, is_active)
SELECT 'Carlos Vega',    id, crypt('1234', gen_salt('bf')), true FROM sections WHERE name = 'Raw Materials'
UNION ALL
SELECT 'Sofia Reyes',    id, crypt('2345', gen_salt('bf')), true FROM sections WHERE name = 'Raw Materials'
UNION ALL
SELECT 'Marcus Webb',    id, crypt('3456', gen_salt('bf')), true FROM sections WHERE name = 'Fabrication'
UNION ALL
SELECT 'Priya Nair',     id, crypt('4567', gen_salt('bf')), true FROM sections WHERE name = 'Fabrication'
UNION ALL
SELECT 'Derek Osei',     id, crypt('5678', gen_salt('bf')), true FROM sections WHERE name = 'Assembly'
UNION ALL
SELECT 'Lena Fischer',   id, crypt('6789', gen_salt('bf')), true FROM sections WHERE name = 'Assembly'
UNION ALL
SELECT 'James Thornton', id, crypt('7890', gen_salt('bf')), true FROM sections WHERE name = 'Quality Control'
UNION ALL
SELECT 'Anika Patel',    id, crypt('8901', gen_salt('bf')), true FROM sections WHERE name = 'Quality Control'
UNION ALL
SELECT 'Ryan Callahan',  id, crypt('9012', gen_salt('bf')), true FROM sections WHERE name = 'Dispatch'
UNION ALL
SELECT 'Mei Lin',        id, crypt('0123', gen_salt('bf')), true FROM sections WHERE name = 'Dispatch';

-- 2.3 Work Orders
INSERT INTO work_orders (job_number, product_name, product_type, quantity_required, status) VALUES
  ('WO-2026-0041', 'Hydraulic Cylinder Assembly 50mm',  'Hydraulics',    4,  'open'),
  ('WO-2026-0042', 'Flanged Coupling Unit Type-B',      'Mechanical',    8,  'open'),
  ('WO-2026-0043', 'Precision Valve Body 3"',           'Fluid Control', 3,  'open'),
  ('WO-2026-0044', 'Shaft Seal Assembly 75mm',          'Mechanical',    10, 'open'),
  ('WO-2026-0045', 'Custom Manifold Block',             'Fluid Control', 2,  'open'),
  ('WO-2026-0046', 'Bearing Housing Assembly Type-A',   'Mechanical',    6,  'open'),
  ('WO-2026-0047', 'Actuator Rod End 40mm',             'Hydraulics',    5,  'open'),
  ('WO-2026-0048', 'Pressure Regulator Body',           'Fluid Control', 2,  'open'),
  ('WO-2026-0039', 'Drive Shaft Coupling 60mm',         'Mechanical',    4,  'in_progress'),
  ('WO-2026-0038', 'Flow Control Valve Assembly',       'Fluid Control', 12, 'completed');

-- 2.4 Tasks (3–5 per section, mix of daily / per_job)
INSERT INTO tasks (section_id, title, frequency, order_index, is_active)
-- Raw Materials
SELECT id, 'Inspect incoming materials against purchase order',  'per_job', 1, true FROM sections WHERE name = 'Raw Materials'
UNION ALL
SELECT id, 'Verify material certifications and lot numbers',     'per_job', 2, true FROM sections WHERE name = 'Raw Materials'
UNION ALL
SELECT id, 'Check storage area organisation and labelling',      'daily',   3, true FROM sections WHERE name = 'Raw Materials'
UNION ALL
SELECT id, 'Log material receipt in inventory system',           'per_job', 4, true FROM sections WHERE name = 'Raw Materials'

-- Fabrication
UNION ALL
SELECT id, 'Verify machine setup against work order drawing',    'per_job', 1, true FROM sections WHERE name = 'Fabrication'
UNION ALL
SELECT id, 'Calibrate measuring instruments before shift',       'daily',   2, true FROM sections WHERE name = 'Fabrication'
UNION ALL
SELECT id, 'Inspect first-off part dimensions',                  'per_job', 3, true FROM sections WHERE name = 'Fabrication'
UNION ALL
SELECT id, 'Record process parameters in job traveller',         'per_job', 4, true FROM sections WHERE name = 'Fabrication'
UNION ALL
SELECT id, 'Clean work area and return tooling to store',        'daily',   5, true FROM sections WHERE name = 'Fabrication'

-- Assembly
UNION ALL
SELECT id, 'Verify all components against bill of materials',    'per_job', 1, true FROM sections WHERE name = 'Assembly'
UNION ALL
SELECT id, 'Torque fasteners to specified values',               'per_job', 2, true FROM sections WHERE name = 'Assembly'
UNION ALL
SELECT id, 'Inspect sealing surfaces before assembly',           'per_job', 3, true FROM sections WHERE name = 'Assembly'
UNION ALL
SELECT id, 'Apply correct lubricants and record batch numbers',  'per_job', 4, true FROM sections WHERE name = 'Assembly'
UNION ALL
SELECT id, 'Clean bench and organise assembly fixtures',         'daily',   5, true FROM sections WHERE name = 'Assembly'

-- Quality Control
UNION ALL
SELECT id, 'Perform dimensional inspection to drawing',          'per_job', 1, true FROM sections WHERE name = 'Quality Control'
UNION ALL
SELECT id, 'Conduct functional test to specification',           'per_job', 2, true FROM sections WHERE name = 'Quality Control'
UNION ALL
SELECT id, 'Complete inspection report and sign off',            'per_job', 3, true FROM sections WHERE name = 'Quality Control'
UNION ALL
SELECT id, 'Calibrate test equipment and log results',           'daily',   4, true FROM sections WHERE name = 'Quality Control'

-- Dispatch
UNION ALL
SELECT id, 'Verify work order quantity and part numbers',        'per_job', 1, true FROM sections WHERE name = 'Dispatch'
UNION ALL
SELECT id, 'Package with appropriate protective material',       'per_job', 2, true FROM sections WHERE name = 'Dispatch'
UNION ALL
SELECT id, 'Apply correct shipping labels and documentation',    'per_job', 3, true FROM sections WHERE name = 'Dispatch'
UNION ALL
SELECT id, 'Record consignment details in dispatch log',         'per_job', 4, true FROM sections WHERE name = 'Dispatch'
UNION ALL
SELECT id, 'Inspect outbound dock and clear staging area',       'daily',   5, true FROM sections WHERE name = 'Dispatch';
