-- F01: User view preferences (column widths, order, visibility) per project
create table if not exists public.user_view_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null,
  column_widths jsonb default '{}'::jsonb,
  column_order jsonb default '[]'::jsonb,
  hidden_columns jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, project_id)
);

-- RLS
alter table public.user_view_preferences enable row level security;

create policy "Users can read own view preferences"
  on public.user_view_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own view preferences"
  on public.user_view_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own view preferences"
  on public.user_view_preferences for update
  using (auth.uid() = user_id);

create policy "Users can delete own view preferences"
  on public.user_view_preferences for delete
  using (auth.uid() = user_id);
