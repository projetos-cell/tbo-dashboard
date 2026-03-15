-- CF04: no schema changes needed (search is client-side)
-- C01: Task Followers
create table if not exists public.task_followers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.os_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  unique(task_id, user_id)
);

alter table public.task_followers enable row level security;

create policy "Tenant isolation" on public.task_followers
  for all using (tenant_id in (select get_user_tenant_ids()));

-- C02: Comment Reactions
create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.project_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  unique(comment_id, user_id, emoji)
);

alter table public.comment_reactions enable row level security;

create policy "Tenant isolation" on public.comment_reactions
  for all using (tenant_id in (select get_user_tenant_ids()));
