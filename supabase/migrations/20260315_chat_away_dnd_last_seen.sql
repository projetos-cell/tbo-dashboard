-- Migration: Chat Away automático, Do Not Disturb e Last Seen
-- Features #35, #36, #37

-- ── profiles table additions ─────────────────────────────────────

-- #35 Away: away status is tracked ephemerally via Realtime Presence (no DB column needed)
-- But we store the inactivity threshold preference:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS away_timeout_minutes integer DEFAULT 10;

-- #36 Do Not Disturb
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dnd_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dnd_start_time time DEFAULT '22:00:00';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dnd_end_time time DEFAULT '08:00:00';

-- #37 Last seen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Index for last_seen queries
CREATE INDEX IF NOT EXISTS profiles_last_seen_idx ON profiles(last_seen_at DESC);

-- ── RLS policies ─────────────────────────────────────────────────

-- last_seen_at is readable by tenant members (already covered by existing profiles RLS)
-- dnd settings are only readable/writable by the owner

-- Function to check if DND is currently active for a user
CREATE OR REPLACE FUNCTION is_dnd_active(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  dnd_rec RECORD;
  current_time time;
BEGIN
  SELECT dnd_enabled, dnd_start_time, dnd_end_time
  INTO dnd_rec
  FROM profiles
  WHERE id = user_id;

  IF NOT FOUND OR NOT dnd_rec.dnd_enabled THEN
    RETURN false;
  END IF;

  current_time := (NOW() AT TIME ZONE 'UTC')::time;

  -- Overnight schedule (e.g., 22:00 - 08:00)
  IF dnd_rec.dnd_start_time > dnd_rec.dnd_end_time THEN
    RETURN current_time >= dnd_rec.dnd_start_time OR current_time < dnd_rec.dnd_end_time;
  ELSE
    -- Same-day schedule (e.g., 12:00 - 14:00)
    RETURN current_time >= dnd_rec.dnd_start_time AND current_time < dnd_rec.dnd_end_time;
  END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_dnd_active(uuid) TO authenticated;

-- Function to update last_seen_at (called by client periodically)
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET last_seen_at = NOW()
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION update_last_seen() TO authenticated;
