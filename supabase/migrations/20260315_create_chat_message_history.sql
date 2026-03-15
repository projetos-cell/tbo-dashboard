-- #18: Chat message edit history
create table if not exists public.chat_message_history (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  content text not null,
  edited_at timestamptz not null default now(),
  edited_by uuid references auth.users(id)
);

alter table public.chat_message_history enable row level security;

-- Channel members can read edit history of messages in their channels
create policy "Channel members can view message history"
  on public.chat_message_history
  for select
  using (
    exists (
      select 1 from public.chat_messages m
      join public.chat_channel_members cm on cm.channel_id = m.channel_id
      where m.id = chat_message_history.message_id
        and cm.user_id = auth.uid()
    )
  );

-- Service role inserts via trigger (security definer)
create policy "Service can insert message history"
  on public.chat_message_history
  for insert
  with check (true);

-- Trigger: auto-save previous content when a message is edited
create or replace function public.save_chat_message_edit_history()
returns trigger as $$
begin
  if old.content is distinct from new.content then
    insert into public.chat_message_history (message_id, content, edited_by)
    values (old.id, old.content, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists chat_message_edit_history_trigger on public.chat_messages;

create trigger chat_message_edit_history_trigger
  before update on public.chat_messages
  for each row execute function public.save_chat_message_edit_history();
