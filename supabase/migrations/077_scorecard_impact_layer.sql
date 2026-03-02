-- ============================================================================
-- Migration 077: Scorecard TBO 2.0 — Fase 2 (Impact Layer)
-- TBO OS — People Module (Supabase)
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. EMPLOYEE_IMPACT_METRICS — Metricas de impacto calculadas por periodo
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS employee_impact_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id         UUID NOT NULL REFERENCES auth.users(id),
  period              TEXT NOT NULL,                  -- e.g. '2026-03'

  -- 6 metricas normalizadas (0-100)
  on_time_delivery    NUMERIC(5,2),                   -- % entregas no prazo
  rework_rate         NUMERIC(5,2),                   -- % retrabalho (invertido)
  project_margin      NUMERIC(5,2),                   -- margem de projetos (placeholder)
  okr_completion      NUMERIC(5,2),                   -- % OKRs concluidos
  decision_participation NUMERIC(5,2),                -- participacao em decisoes
  recognitions_received  NUMERIC(5,2),                -- reconhecimentos recebidos

  -- Dados brutos para auditoria
  raw_data            JSONB DEFAULT '{}'::jsonb,

  -- Score composto ponderado
  impact_score        NUMERIC(5,2),

  computed_at         TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, employee_id, period)
);

CREATE INDEX idx_impact_metrics_tenant   ON employee_impact_metrics(tenant_id);
CREATE INDEX idx_impact_metrics_employee ON employee_impact_metrics(employee_id);
CREATE INDEX idx_impact_metrics_period   ON employee_impact_metrics(period);

ALTER TABLE employee_impact_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_metrics_select" ON employee_impact_metrics
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "impact_metrics_manage" ON employee_impact_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = employee_impact_metrics.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );

-- ════════════════════════════════════════════════════════════════════
-- 2. IMPACT_METRIC_CONFIG — Pesos e thresholds por metrica por tenant
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS impact_metric_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_id       TEXT NOT NULL,                     -- e.g. 'on_time_delivery'
  weight          NUMERIC(4,2) DEFAULT 1.0,          -- peso relativo
  threshold       INT DEFAULT 100,                   -- limite de escala (ex: 5 reconhecimentos = 100)
  is_inverted     BOOLEAN DEFAULT FALSE,             -- true = menor valor e melhor (rework)
  is_active       BOOLEAN DEFAULT TRUE,              -- false = skip no calculo
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_id)
);

CREATE INDEX idx_impact_config_tenant ON impact_metric_config(tenant_id);

ALTER TABLE impact_metric_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impact_config_select" ON impact_metric_config
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "impact_config_manage" ON impact_metric_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = impact_metric_config.tenant_id
        AND r.name IN ('owner', 'admin')
    )
  );
