-- #17: Chat bookmarks (saved messages)
create table if not exists public.chat_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, message_id)
);

alter table public.chat_bookmarks enable row level security;

create policy "Users can manage their own bookmarks"
  on public.chat_bookmarks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
