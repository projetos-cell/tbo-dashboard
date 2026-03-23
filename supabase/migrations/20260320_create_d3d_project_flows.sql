-- ══════════════════════════════════════════════════════════════════════
-- D3D Project Flow — Pipeline visual para projetos Digital 3D
-- ══════════════════════════════════════════════════════════════════════

-- Flow principal: 1 por projeto D3D
create table if not exists project_d3d_flows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  tenant_id uuid not null,
  current_stage text not null default '00_briefing',
  total_estimated_days int default 65,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

-- Cada etapa do pipeline (8 fases + 4 gates)
create table if not exists project_d3d_stages (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references project_d3d_flows(id) on delete cascade,
  stage_key text not null,
  stage_type text not null default 'phase' check (stage_type in ('phase', 'gate')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'approved', 'changes_requested')),
  sort_order int not null default 0,
  image_url text,
  started_at timestamptz,
  completed_at timestamptz,
  approved_by text,
  approval_feedback text,
  estimated_days int,
  actual_days int,
  notes text,
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(flow_id, stage_key)
);

-- Share token para portal do cliente (view read-only)
alter table project_d3d_flows add column if not exists share_token text unique;
alter table project_d3d_flows add column if not exists share_enabled boolean not null default false;

-- Índices
create index if not exists idx_d3d_flows_project on project_d3d_flows(project_id);
create index if not exists idx_d3d_flows_tenant on project_d3d_flows(tenant_id);
create index if not exists idx_d3d_stages_flow on project_d3d_stages(flow_id);
create index if not exists idx_d3d_flows_share_token on project_d3d_flows(share_token) where share_token is not null;

-- RLS
alter table project_d3d_flows enable row level security;
alter table project_d3d_stages enable row level security;

-- Policies — tenant isolation
create policy "d3d_flows_tenant_select" on project_d3d_flows
  for select using (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_flows_tenant_insert" on project_d3d_flows
  for insert with check (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_flows_tenant_update" on project_d3d_flows
  for update using (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_flows_tenant_delete" on project_d3d_flows
  for delete using (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_stages_tenant_select" on project_d3d_stages
  for select using (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_stages_tenant_insert" on project_d3d_stages
  for insert with check (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_stages_tenant_update" on project_d3d_stages
  for update using (tenant_id in (select get_user_tenant_ids()));

create policy "d3d_stages_tenant_delete" on project_d3d_stages
  for delete using (tenant_id in (select get_user_tenant_ids()));

-- Policy pública para share token (portal cliente)
create policy "d3d_flows_public_share" on project_d3d_flows
  for select using (share_enabled = true and share_token is not null);

create policy "d3d_stages_public_share" on project_d3d_stages
  for select using (
    flow_id in (
      select id from project_d3d_flows
      where share_enabled = true and share_token is not null
    )
  );
