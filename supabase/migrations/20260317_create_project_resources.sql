-- Project Resources: links, files, and references attached to projects
create table if not exists public.project_resources (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  tenant_id uuid not null,
  label text not null,
  url text not null,
  type text not null default 'link', -- link | file | html | drive | contract
  position integer not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_project_resources_project on public.project_resources(project_id);
create index if not exists idx_project_resources_tenant on public.project_resources(tenant_id);

-- RLS
alter table public.project_resources enable row level security;

create policy "tenant_isolation" on public.project_resources
  for all using (tenant_id in (select get_user_tenant_ids()));

-- Updated_at trigger
create trigger set_updated_at
  before update on public.project_resources
  for each row execute function public.update_updated_at_column();
