-- Backfill project codes for existing projects that don't have one.
-- Format: TBO-YYYY-NNN where YYYY is the project's creation year.

DO $$
DECLARE
  rec RECORD;
  yr INT;
  seq INT;
BEGIN
  FOR rec IN
    SELECT id, created_at
    FROM projects
    WHERE code IS NULL OR code = ''
    ORDER BY created_at ASC
  LOOP
    yr := EXTRACT(YEAR FROM rec.created_at);

    -- Get the current max sequence for this year
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(code FROM 'TBO-' || yr || '-(\d+)') AS INT
        )
      ), 0
    ) + 1
    INTO seq
    FROM projects
    WHERE code LIKE 'TBO-' || yr || '-%'
      AND code ~ ('^TBO-' || yr || '-\d{3,}$');

    UPDATE projects
    SET code = 'TBO-' || yr || '-' || LPAD(seq::TEXT, 3, '0'),
        updated_at = NOW()
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Add unique constraint on code to prevent duplicates
ALTER TABLE projects ADD CONSTRAINT projects_code_unique UNIQUE (code);
