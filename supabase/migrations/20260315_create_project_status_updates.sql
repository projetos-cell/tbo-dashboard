-- R01: Status updates narrativos para projetos
create table if not exists public.project_status_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  author_id uuid not null,
  author_name text not null default '',
  health text not null default 'on_track' check (health in ('on_track', 'at_risk', 'off_track')),
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.project_status_updates enable row level security;

create policy "project_status_updates_tenant_access" on public.project_status_updates
  for all using (tenant_id in (select unnest(get_user_tenant_ids())));

-- indexes
create index if not exists idx_project_status_updates_project on public.project_status_updates(project_id);
create index if not exists idx_project_status_updates_tenant on public.project_status_updates(tenant_id);
