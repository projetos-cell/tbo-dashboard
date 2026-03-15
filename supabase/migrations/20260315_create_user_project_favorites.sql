-- V05: User project favorites
create table if not exists user_project_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

-- RLS
alter table user_project_favorites enable row level security;

create policy "Users can manage their own favorites"
  on user_project_favorites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
