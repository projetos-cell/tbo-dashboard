-- Add custom status fields to profiles
alter table public.profiles
  add column if not exists status_emoji text,
  add column if not exists status_text text,
  add column if not exists status_expires_at timestamptz;

-- Index for efficient status expiry queries
create index if not exists profiles_status_expires_at_idx
  on public.profiles (status_expires_at)
  where status_expires_at is not null;
