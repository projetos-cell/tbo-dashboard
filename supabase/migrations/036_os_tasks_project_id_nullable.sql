-- ============================================================
-- Migration 036: Make project_id nullable on os_tasks
-- Allows personal tasks (Minhas Tarefas) without a project
-- ============================================================

ALTER TABLE os_tasks ALTER COLUMN project_id DROP NOT NULL;
