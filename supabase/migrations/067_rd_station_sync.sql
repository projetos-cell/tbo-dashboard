-- 067: RD Station + Fireflies sync tables
create table if not exists public.rd_sync_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  status text not null default 'running' check (status in ('running','success','error')),
  deals_synced int not null default 0,
  contacts_synced int not null default 0,
  organizations_synced int not null default 0,
  errors jsonb default '[]'::jsonb,
  triggered_by uuid references auth.users(id),
  trigger_source text default 'manual',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_rd_sync_log_tenant on public.rd_sync_log(tenant_id);
alter table public.rd_sync_log enable row level security;
create policy "rd_sync_log_tenant_read" on public.rd_sync_log for select using (tenant_id in (select get_user_tenant_ids()));
create policy "rd_sync_log_tenant_insert" on public.rd_sync_log for insert with check (tenant_id in (select get_user_tenant_ids()));
create policy "rd_sync_log_tenant_update" on public.rd_sync_log for update using (tenant_id in (select get_user_tenant_ids()));

create table if not exists public.rd_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) unique,
  api_token text,
  base_url text default 'https://crm.rdstation.com/api/v1',
  enabled boolean not null default false,
  last_sync timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.rd_config enable row level security;
create policy "rd_config_tenant_rw" on public.rd_config for all using (tenant_id in (select get_user_tenant_ids()));

create table if not exists public.fireflies_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) unique,
  api_key text,
  enabled boolean not null default false,
  auto_sync boolean not null default false,
  last_sync timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fireflies_config enable row level security;
create policy "fireflies_config_tenant_rw" on public.fireflies_config for all using (tenant_id in (select get_user_tenant_ids()));

create table if not exists public.fireflies_sync_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  status text not null default 'running' check (status in ('running','success','error')),
  meetings_synced int not null default 0,
  transcripts_synced int not null default 0,
  errors jsonb default '[]'::jsonb,
  triggered_by uuid references auth.users(id),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_fireflies_sync_log_tenant on public.fireflies_sync_log(tenant_id);
alter table public.fireflies_sync_log enable row level security;
create policy "fireflies_sync_log_tenant_read" on public.fireflies_sync_log for select using (tenant_id in (select get_user_tenant_ids()));
create policy "fireflies_sync_log_tenant_insert" on public.fireflies_sync_log for insert with check (tenant_id in (select get_user_tenant_ids()));
create policy "fireflies_sync_log_tenant_update" on public.fireflies_sync_log for update using (tenant_id in (select get_user_tenant_ids()));
