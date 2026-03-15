-- Chat channel favorites: users can star/favorite channels
CREATE TABLE IF NOT EXISTS chat_channel_favorites (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, channel_id)
);

ALTER TABLE chat_channel_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own channel favorites"
  ON chat_channel_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
