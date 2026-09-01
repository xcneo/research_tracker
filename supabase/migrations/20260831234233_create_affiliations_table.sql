/*
# Create affiliations table (single-tenant, no auth)

1. New Tables
- `affiliations`: stores research project affiliations around the world.
  - `id` (uuid, primary key)
  - `location_name` (text, the city/place, e.g. "Singapore")
  - `country` (text, country name, e.g. "Singapore")
  - `lab` (text, the lab/university, e.g. "NParks")
  - `project` (text, the project name, e.g. "Orchid project")
  - `discipline` (text, the discipline label, e.g. "botany")
  - `color` (text, hex color used for the dot, e.g. "#3b82f6")
  - `lat` (numeric, latitude)
  - `lng` (numeric, longitude)
  - `is_active` (boolean, true = current affiliation, false = past affiliation)
  - `work_done` (boolean, true = work completed, false = ongoing)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `affiliations`.
- Single-tenant no-auth app: allow anon + authenticated full CRUD since data is intentionally shared.
3. Seed data
- Inserts the initial set of research affiliations provided by the researcher.
*/

CREATE TABLE IF NOT EXISTS affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name text NOT NULL,
  country text NOT NULL DEFAULT '',
  lab text NOT NULL DEFAULT '',
  project text NOT NULL DEFAULT '',
  discipline text NOT NULL DEFAULT 'botany',
  color text NOT NULL DEFAULT '#3b82f6',
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  work_done boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affiliations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_affiliations" ON affiliations;
CREATE POLICY "anon_select_affiliations" ON affiliations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_affiliations" ON affiliations;
CREATE POLICY "anon_insert_affiliations" ON affiliations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_affiliations" ON affiliations;
CREATE POLICY "anon_update_affiliations" ON affiliations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_affiliations" ON affiliations;
CREATE POLICY "anon_delete_affiliations" ON affiliations FOR DELETE
  TO anon, authenticated USING (true);

-- Seed initial affiliations
INSERT INTO affiliations (location_name, country, lab, project, discipline, color, lat, lng, is_active, work_done) VALUES
  ('Singapore', 'Singapore', 'NParks', 'Orchid project', 'botany', '#3b82f6', 1.3521, 103.8198, true, false),
  ('Xishuangbanna', 'China', 'XTBG', 'Harmonisation project', 'botany', '#3b82f6', 21.86, 101.26, true, false),
  ('Zurich', 'Switzerland', 'ETH Zurich', 'Glacial metagenomics project', 'glacial', '#a855f7', 47.3769, 8.5417, true, false),
  ('Tokyo', 'Japan', 'UTokyo', 'Astro project', 'astronomy', '#ef4444', 35.6762, 139.6503, true, false),
  ('McMurdo Station', 'Antarctica', 'McMurdo Research Station', 'Research station', 'station', '#eab308', -77.8419, 166.6863, true, false),
  ('Stellenbosch', 'South Africa', 'Stellenbosch University', 'Astronomy project', 'astronomy', '#ef4444', -33.9321, 18.8602, true, false),
  ('Pretoria', 'South Africa', 'University of Pretoria', 'Astronomy project', 'astronomy', '#ef4444', -25.7479, 28.2293, true, false)
ON CONFLICT (id) DO NOTHING;
