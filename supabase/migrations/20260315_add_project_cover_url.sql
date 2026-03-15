-- Add cover_url to projects for custom banner images
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_url TEXT;
