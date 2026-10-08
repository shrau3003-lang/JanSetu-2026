-- ============================================================
-- JANSETU SUPABASE DEMO SEED DATA SCRIPT (STAGE 15)
-- Safe & Repeatable Seeding Script for SIH Presentation
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. SEED PROFILES (Citizens, Government, Institutes)
-- ------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, role, avatar_url, location)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Aarav Sharma', 'aarav.sharma@jansetu.org', 'CITIZEN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Ranchi, Ward 12, Jharkhand'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Pooja Singh', 'pooja.s@jansetu.org', 'CITIZEN', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Ranchi, Ward 14, Jharkhand'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Officer Rajesh Verma', 'r.verma@jharkhand.gov.in', 'ADMIN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 'Ranchi Municipal Division'),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'ABC Institute R&D Cell', 'rnd@abcinstitute.edu.in', 'INSTITUTE', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80', 'Ranchi, Jharkhand')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;


-- ------------------------------------------------------------
-- 2. SEED INSTITUTES
-- ------------------------------------------------------------
INSERT INTO public.institutes (id, profile_id, name, department, accreditation, verified)
VALUES 
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 
    'ABC Institute of Technology', 
    'Department of Environmental Engineering', 
    'NAAC A++ Accredited', 
    true
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 3. SEED PROBLEMS (Water Quality Demonstration Problem)
-- ------------------------------------------------------------
INSERT INTO public.problems (
  id, 
  author_id, 
  title, 
  description, 
  category, 
  priority, 
  status, 
  location, 
  latitude, 
  longitude, 
  image_url, 
  ai_analysis, 
  supporters_count, 
  comments_count
)
VALUES 
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Water Quality & Turbidity Monitoring in Ward 12',
    'Severe water discoloration and high turbidity reported near main municipal supply line. Requires real-time IoT water monitoring sensors.',
    'Water & Sanitation',
    'high',
    'in_progress',
    'Ranchi, Ward 12, Jharkhand',
    23.3441,
    85.3096,
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    '{
      "category": "Water & Sanitation",
      "severity": "High",
      "urgency": "High",
      "summary": "Critical drinking water turbidity spike requiring continuous electronic sensor monitoring.",
      "affectedPopulation": 2450,
      "requiredSkills": ["Environmental Engineering", "Water Quality Analysis", "IoT Sensors", "Field Testing"],
      "suggestedDepartment": "Department of Environmental Engineering",
      "suggestedSolution": "Deploy low-cost IoT turbidity telemetry nodes with automated alert limits."
    }'::jsonb,
    142,
    4
  ),
  (
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Smart Garbage Bin Overflow at Subhash Chowk',
    'Subhash Chowk commercial market faces daily bin overflows. Requires fill-level sensors and smart dispatch routing.',
    'Waste Management',
    'critical',
    'verified',
    'Dhanbad, Jharkhand',
    23.3600,
    85.3300,
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    '{
      "category": "Waste Management",
      "severity": "High",
      "urgency": "Critical",
      "summary": "Commercial market bin overflow causing public health risks.",
      "affectedPopulation": 1800,
      "requiredSkills": ["Computer Science", "Machine Learning", "GIS Mapping", "Logistics"],
      "suggestedDepartment": "Department of Computer Science & Engineering",
      "suggestedSolution": "Implement bin fill-level ultrasonic sensors and dynamic routing."
    }'::jsonb,
    89,
    2
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 4. SEED VOTES & COMMENTS
-- ------------------------------------------------------------
INSERT INTO public.votes (problem_id, user_id)
VALUES 
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22')
ON CONFLICT (problem_id, user_id) DO NOTHING;

INSERT INTO public.comments (problem_id, author_id, content)
VALUES 
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'This is affecting over 2,000 households. Highly urgent!'),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Municipal team has verified and routed this to ABC Institute R&D.')
ON CONFLICT DO NOTHING;


-- ------------------------------------------------------------
-- 5. SEED MATCHES
-- ------------------------------------------------------------
INSERT INTO public.matches (id, problem_id, institute_id, match_score, status)
VALUES 
  (
    'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    94,
    'approved'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 6. SEED PROJECTS
-- ------------------------------------------------------------
INSERT INTO public.projects (id, title, problem_id, institute_id, status, progress_percentage, lead_name)
VALUES 
  (
    'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    'Automated Water Quality Monitoring System',
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'Field Testing',
    75,
    'Dr. A. K. Sharma & Student Team Alpha'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 7. SEED PROJECT MEMBERS
-- ------------------------------------------------------------
INSERT INTO public.project_members (project_id, user_id, role_title)
VALUES 
  ('h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Student Lead Researcher')
ON CONFLICT (project_id, user_id) DO NOTHING;


-- ------------------------------------------------------------
-- 8. SEED MILESTONES
-- ------------------------------------------------------------
INSERT INTO public.milestones (id, project_id, title, completed, due_date)
VALUES 
  ('m1001', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Challenge Acceptance & Governance Charter', true, '2026-08-01'),
  ('m1002', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Student R&D Team Assembly', true, '2026-08-15'),
  ('m1003', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'IoT Sensor Hardware Prototype', true, '2026-09-05'),
  ('m1004', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Field Testing & Calibration in Ward 12', false, '2026-10-15'),
  ('m1005', 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Municipal Deployment & Final Handover', false, '2026-11-30')
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 9. SEED CERTIFICATES
-- ------------------------------------------------------------
INSERT INTO public.certificates (id, project_id, recipient_name, title, certificate_code, issued_at)
VALUES 
  (
    'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11',
    'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    'Aarav Sharma & Student Research Team A',
    'Certificate of Social Innovation',
    'JS-CERT-2026-9814',
    '2026-09-18T00:00:00Z'
  )
ON CONFLICT (certificate_code) DO NOTHING;


-- ------------------------------------------------------------
-- 10. SEED NOTIFICATIONS
-- ------------------------------------------------------------
INSERT INTO public.notifications (user_id, title, message, read)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Problem Report Verified', 'Your report Water Quality & Turbidity Monitoring in Ward 12 has been verified.', true),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Milestone Submitted for Review', 'ABC Institute submitted Phase 4 Field Testing evidence.', false),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Milestone Phase 3 Approved', 'Government Officer approved IoT Sensor Hardware Prototype deliverable.', false)
ON CONFLICT DO NOTHING;
