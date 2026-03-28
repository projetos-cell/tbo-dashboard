-- ══════════════════════════════════════════════════════════════════════
-- Add deal_id to projects — link CRM deals to projects for automation
-- ══════════════════════════════════════════════════════════════════════

alter table projects add column if not exists deal_id uuid references crm_deals(id) on delete set null;

create index if not exists idx_projects_deal_id on projects(deal_id) where deal_id is not null;

-- Add "briefing" to project status check if not already present
-- (projects created from deals start in briefing status)
