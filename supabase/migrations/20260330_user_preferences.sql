-- User preferences table for persistent UI/feature preferences
-- Replaces scattered localStorage usage across the app
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Index for fast lookups by user + key
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_key
  ON user_preferences(user_id, key);

-- RLS: users can only access their own preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
