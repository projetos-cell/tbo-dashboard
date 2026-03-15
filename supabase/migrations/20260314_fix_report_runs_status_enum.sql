-- Fix status enum mismatch: 'success'/'error' -> 'completed'/'failed'
-- Frontend already uses completed/failed which is more intuitive

-- Update existing rows
UPDATE report_runs SET status = 'completed' WHERE status = 'success';
UPDATE report_runs SET status = 'failed' WHERE status = 'error';

-- Drop old constraint and create new one
ALTER TABLE report_runs DROP CONSTRAINT IF EXISTS report_runs_status_check;
ALTER TABLE report_runs ADD CONSTRAINT report_runs_status_check
  CHECK (status IN ('pending', 'running', 'completed', 'failed'));
