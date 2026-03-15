-- Add auto_archive_days and last_activity_at to chat_channels
alter table public.chat_channels
  add column if not exists auto_archive_days integer not null default 0,
  add column if not exists last_activity_at timestamptz;

-- Backfill last_activity_at from latest message per channel
update public.chat_channels c
set last_activity_at = (
  select max(created_at) from public.chat_messages where channel_id = c.id
)
where last_activity_at is null;

-- Trigger: keep last_activity_at updated on every new message
create or replace function public.fn_update_channel_last_activity()
returns trigger language plpgsql security definer as $$
begin
  update public.chat_channels
  set last_activity_at = new.created_at
  where id = new.channel_id
    and (last_activity_at is null or last_activity_at < new.created_at);
  return new;
end;
$$;

drop trigger if exists trg_update_channel_last_activity on public.chat_messages;
create trigger trg_update_channel_last_activity
  after insert on public.chat_messages
  for each row execute function public.fn_update_channel_last_activity();
