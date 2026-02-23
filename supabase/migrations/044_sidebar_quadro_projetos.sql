-- ============================================================================
-- TBO OS — Migration 044: Adiciona "Quadro de Projetos" à sidebar do Supabase
--
-- Insere o child item 'Quadro de Projetos' (route: quadro-projetos) dentro do
-- workspace 'Geral' para todos os tenants que já possuam esse workspace.
--
-- IDEMPOTENTE: ON CONFLICT DO NOTHING garante re-execução segura.
-- ============================================================================

DO $$
DECLARE
  v_tid      UUID;
  v_geral_id UUID;
BEGIN
  -- ── Buscar tenant TBO ──────────────────────────────────────────────────
  SELECT id INTO v_tid
  FROM tenants
  WHERE slug = 'tbo'
  LIMIT 1;

  IF v_tid IS NULL THEN
    RAISE NOTICE '[044] Tenant TBO não encontrado — migration ignorada.';
    RETURN;
  END IF;

  -- ── Buscar o workspace "Geral" deste tenant ────────────────────────────
  SELECT id INTO v_geral_id
  FROM sidebar_items
  WHERE tenant_id = v_tid
    AND type      = 'workspace'
    AND name      = 'Geral'
  LIMIT 1;

  IF v_geral_id IS NULL THEN
    RAISE NOTICE '[044] Workspace "Geral" não encontrado para o tenant TBO — migration ignorada.';
    RETURN;
  END IF;

  -- ── Verificar se o item já existe (idempotência extra) ─────────────────
  IF EXISTS (
    SELECT 1 FROM sidebar_items
    WHERE tenant_id = v_tid
      AND parent_id = v_geral_id
      AND route     = 'quadro-projetos'
  ) THEN
    RAISE NOTICE '[044] Item "Quadro de Projetos" já existe — nada a fazer.';
    RETURN;
  END IF;

  -- ── Inserir o item ─────────────────────────────────────────────────────
  INSERT INTO sidebar_items (
    tenant_id,
    parent_id,
    name,
    type,
    order_index,
    icon,
    route,
    is_visible,
    allowed_roles,
    metadata
  ) VALUES (
    v_tid,
    v_geral_id,
    'Quadro de Projetos',
    'child',
    9.025,                -- entre "Quadro Geral v2" (9.02) e "Manual de Cultura" (9.03)
    'layout-dashboard',
    'quadro-projetos',
    TRUE,
    '{}',                 -- visível para todos os roles
    '{}'
  );

  RAISE NOTICE '[044] Item "Quadro de Projetos" inserido com sucesso no workspace Geral.';
END $$;

-- ============================================================================
-- FIM DA MIGRATION 044
-- ============================================================================
