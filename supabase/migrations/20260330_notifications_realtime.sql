-- Add notifications table to Supabase Realtime publication
-- Enables instant notification delivery instead of 60s polling

-- REPLICA IDENTITY FULL is required for RLS policy evaluation during Realtime events
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add to the existing Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
