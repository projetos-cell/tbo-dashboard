-- ============================================================================
-- Migration 014: Índices de Performance
-- TBO OS v3.0 — M3
--
-- Índices compostos para queries frequentes dos repos.
-- Todos incluem tenant_id como primeiro campo (multi-tenant).
-- ============================================================================

-- Projetos: listagem com status + ordenação por updated_at
CREATE INDEX IF NOT EXISTS idx_projects_tenant_status_updated
  ON projects (tenant_id, status, updated_at DESC);

-- Tarefas: listagem por projeto + status
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_project_status
  ON tasks (tenant_id, project_id, status);

-- Tarefas: por assignee (carga de trabalho)
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_assignee
  ON tasks (tenant_id, assignee_id) WHERE assignee_id IS NOT NULL;

-- Profiles: listagem ativa por tenant
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_active
  ON profiles (tenant_id, is_active, full_name);

-- Chat channels: por tenant
CREATE INDEX IF NOT EXISTS idx_chat_channels_tenant
  ON chat_channels (tenant_id);

-- Chat messages: por canal + created_at (paginação)
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created
  ON chat_messages (channel_id, created_at DESC);

-- Chat messages: tenant filter
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant
  ON chat_messages (tenant_id, channel_id);

-- Chat reactions: tenant + message (para DELETE seguro)
CREATE INDEX IF NOT EXISTS idx_chat_reactions_tenant_message
  ON chat_reactions (tenant_id, message_id);

-- Financial transactions: listagem com tipo + data
CREATE INDEX IF NOT EXISTS idx_fin_transactions_tenant_type_date
  ON financial_transactions (tenant_id, type, date DESC);

-- Financial categories: por tenant + tipo
CREATE INDEX IF NOT EXISTS idx_fin_categories_tenant_type
  ON financial_categories (tenant_id, type);

-- CRM deals: por tenant + status
CREATE INDEX IF NOT EXISTS idx_crm_deals_tenant_status
  ON crm_deals (tenant_id, status, updated_at DESC);

-- Clients: por tenant
CREATE INDEX IF NOT EXISTS idx_clients_tenant_name
  ON clients (tenant_id, name);

-- Audit log: por tenant + created_at (listagem principal)
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_created
  ON audit_log (tenant_id, created_at DESC);

-- Audit log: por ação + entidade
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_action
  ON audit_log (tenant_id, action, entity);

-- Role permissions: lookup rápido
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id
  ON role_permissions (role_id);

-- Project memberships: por projeto + user
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_user
  ON project_memberships (project_id, user_id);
