-- Migration: chat notification preferences per user per channel
-- Setting: 'all' | 'mentions' | 'nothing'

CREATE TABLE IF NOT EXISTS public.chat_notification_prefs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id  uuid        NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  setting     text        NOT NULL DEFAULT 'all'
              CHECK (setting IN ('all', 'mentions', 'nothing')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, channel_id)
);

-- RLS
ALTER TABLE public.chat_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own notification prefs"
  ON public.chat_notification_prefs
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_chat_notif_prefs_user
  ON public.chat_notification_prefs (user_id);
