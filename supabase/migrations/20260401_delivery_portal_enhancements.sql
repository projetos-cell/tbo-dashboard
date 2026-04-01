-- Delivery portal enhancements: personal message + password protection
ALTER TABLE project_deliveries
  ADD COLUMN IF NOT EXISTS personal_message text,
  ADD COLUMN IF NOT EXISTS access_password text;
