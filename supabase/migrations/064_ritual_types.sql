-- ============================================================================
-- Migration 064: Tipos de Ritual Configuráveis
-- TBO OS — People Module (Sprint 3.3.1)
-- Executada em: 2026-02-27
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. RITUAL_TYPES — Tipos de ritual configuráveis por tenant
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ritual_types (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL,
  description       TEXT,
  frequency         TEXT NOT NULL CHECK (frequency IN ('daily','weekly','biweekly','monthly','quarterly','custom')),
  duration_minutes  INT DEFAULT 30,
  default_agenda    TEXT,                                -- template de pauta (markdown)
  default_participants TEXT[],                           -- roles/slugs dos participantes padrão
  icon              TEXT DEFAULT 'calendar',             -- lucide icon name
  color             TEXT DEFAULT '#6366f1',              -- hex color
  is_system         BOOLEAN DEFAULT false,               -- tipo padrão (não editável)
  is_active         BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_ritual_types_tenant ON ritual_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ritual_types_active ON ritual_types(tenant_id, is_active);

-- RLS
ALTER TABLE ritual_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ritual_types_select" ON ritual_types
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "ritual_types_insert" ON ritual_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = ritual_types.tenant_id
        AND r.name IN ('owner', 'admin', 'project_owner')
    )
  );

CREATE POLICY "ritual_types_update" ON ritual_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = ritual_types.tenant_id
        AND r.name IN ('owner', 'admin', 'project_owner')
    )
  );

CREATE POLICY "ritual_types_delete" ON ritual_types
  FOR DELETE USING (
    is_system = false
    AND EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = ritual_types.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 2. ADD ritual_type_id à one_on_ones
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'one_on_ones' AND column_name = 'ritual_type_id'
  ) THEN
    ALTER TABLE one_on_ones ADD COLUMN ritual_type_id UUID REFERENCES ritual_types(id) ON DELETE SET NULL;
    CREATE INDEX idx_1on1_ritual_type ON one_on_ones(ritual_type_id);
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════
-- 3. SEED: Tipos de ritual padrão para todos os tenants
-- ════════════════════════════════════════════════════════════════════

INSERT INTO ritual_types (tenant_id, name, slug, description, frequency, duration_minutes, default_agenda, icon, color, is_system, sort_order)
SELECT
  t.id,
  rt.name, rt.slug, rt.description, rt.frequency, rt.duration_minutes, rt.default_agenda, rt.icon, rt.color, true, rt.sort_order
FROM tenants t
CROSS JOIN (VALUES
  ('1:1 PO + Liderado', '1on1-po-liderado', 'Reunião semanal entre PO e liderado direto para PDI + feedback', 'weekly', 30,
   E'## Pauta\n- Como foi a semana?\n- Progresso no PDI\n- Bloqueios e apoio necessário\n- Feedback bidirecional\n- Próximos passos',
   'users', '#6366f1', 1),
  ('1:1 Sócios + POs', '1on1-socios-pos', 'Reunião quinzenal entre sócios e POs para alinhamento estratégico', 'biweekly', 45,
   E'## Pauta\n- Resultados da quinzena\n- OKRs e métricas-chave\n- Decisões estratégicas pendentes\n- Alinhamento entre BUs\n- Próximas prioridades',
   'briefcase', '#8b5cf6', 2),
  ('Daily Standup', 'daily-standup', 'Alinhamento rápido diário entre fundadores/equipe', 'daily', 15,
   E'## Formato\n- O que fiz ontem?\n- O que farei hoje?\n- Bloqueios?',
   'zap', '#f59e0b', 3),
  ('Review Semanal', 'review-semanal', 'Revisão semanal de entregas por BU', 'weekly', 60,
   E'## Pauta\n- Entregas da semana\n- Métricas e resultados\n- Próximas entregas\n- Riscos identificados',
   'clipboard-check', '#10b981', 4),
  ('Retrospectiva', 'retrospectiva', 'O que foi bem, o que melhorar, ações de melhoria', 'monthly', 60,
   E'## Formato\n- O que foi bem?\n- O que pode melhorar?\n- Ações concretas de melhoria',
   'refresh-cw', '#ec4899', 5),
  ('All Hands', 'all-hands', 'Reunião trimestral de resultados + visão da empresa', 'quarterly', 90,
   E'## Pauta\n- Resultados do trimestre\n- Métricas financeiras\n- Visão e roadmap\n- Celebrações\n- Q&A aberto',
   'megaphone', '#ef4444', 6)
) AS rt(name, slug, description, frequency, duration_minutes, default_agenda, icon, color, sort_order)
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════
-- 4. AUDIT TRIGGER (se fn_audit_trigger existir)
-- ════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_ritual_types') THEN
      EXECUTE 'CREATE TRIGGER trg_audit_ritual_types AFTER INSERT OR UPDATE OR DELETE ON ritual_types FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger()';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- FIM da Migration 064
-- ============================================================================
