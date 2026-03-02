-- ============================================================================
-- Migration 078: Scorecard TBO 2.0 — Fase 3 (Culture Layer)
-- TBO OS — People Module (Supabase)
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. EMPLOYEE_CULTURE_METRICS — Metricas de cultura calculadas por periodo
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS employee_culture_metrics (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id           UUID NOT NULL REFERENCES auth.users(id),
  period                TEXT NOT NULL,                  -- e.g. '2026-03'

  -- 6 metricas normalizadas (0-100)
  values_alignment          NUMERIC(5,2),              -- diversidade de valores TBO reconhecidos
  feedback_engagement       NUMERIC(5,2),              -- feedbacks recebidos
  feedback_given            NUMERIC(5,2),              -- feedbacks dados
  one_on_one_participation  NUMERIC(5,2),              -- participacao em 1:1s
  collaboration_index       NUMERIC(5,2),              -- reconhecimentos + feedbacks dados
  peer_review_score         NUMERIC(5,2),              -- media avaliacoes de pares

  -- Dados brutos para auditoria
  raw_data              JSONB DEFAULT '{}'::jsonb,

  -- Score composto ponderado
  culture_score         NUMERIC(5,2),

  computed_at           TIMESTAMPTZ DEFAULT now(),
  created_at            TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, employee_id, period)
);

CREATE INDEX idx_culture_metrics_tenant   ON employee_culture_metrics(tenant_id);
CREATE INDEX idx_culture_metrics_employee ON employee_culture_metrics(employee_id);
CREATE INDEX idx_culture_metrics_period   ON employee_culture_metrics(period);

ALTER TABLE employee_culture_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "culture_metrics_select" ON employee_culture_metrics
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "culture_metrics_manage" ON employee_culture_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_culture_metrics.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 2. CULTURE_METRIC_CONFIG — Pesos e thresholds por metrica por tenant
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS culture_metric_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_id       TEXT NOT NULL,                     -- e.g. 'values_alignment'
  weight          NUMERIC(4,2) DEFAULT 1.0,          -- peso relativo
  threshold       INT DEFAULT 100,                   -- limite de escala
  is_active       BOOLEAN DEFAULT TRUE,              -- false = skip no calculo
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_id)
);

CREATE INDEX idx_culture_config_tenant ON culture_metric_config(tenant_id);

ALTER TABLE culture_metric_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "culture_config_select" ON culture_metric_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "culture_config_manage" ON culture_metric_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = culture_metric_config.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );
