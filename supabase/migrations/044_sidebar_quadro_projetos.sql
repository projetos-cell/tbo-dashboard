-- ============================================================================
-- TBO OS — Migration 044: Adiciona "Quadro de Projetos" à sidebar do Supabase
--
-- Insere o child item 'Quadro de Projetos' (route: quadro-projetos) dentro do
-- workspace 'Geral' para o tenant TBO.
--
-- IDEMPOTENTE: verifica existência antes de inserir.
-- ============================================================================

DO $$
DECLARE
  v_tid        UUID;
  v_geral_id   UUID;
  v_next_order INTEGER;
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
    RAISE NOTICE '[044] Workspace "Geral" não encontrado — migration ignorada.';
    RETURN;
  END IF;

  -- ── Idempotência: pular se já existe ───────────────────────────────────
  IF EXISTS (
    SELECT 1 FROM sidebar_items
    WHERE tenant_id = v_tid
      AND route     = 'quadro-projetos'
  ) THEN
    RAISE NOTICE '[044] Item "Quadro de Projetos" já existe — nada a fazer.';
    RETURN;
  END IF;

  -- ── Calcular próximo order_index livre ────────────────────────────────
  SELECT COALESCE(MAX(order_index), 900) + 1
  INTO v_next_order
  FROM sidebar_items
  WHERE tenant_id = v_tid;

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
    v_next_order,
    'layout-dashboard',
    'quadro-projetos',
    TRUE,
    '{}',
    '{}'
  );

  RAISE NOTICE '[044] Item "Quadro de Projetos" inserido com order_index=% no workspace Geral.', v_next_order;
END $$;

-- ============================================================================
-- FIM DA MIGRATION 044
-- ============================================================================
