-- ── finance_ai_suggestions ────────────────────────────────────────────────────
-- Persiste sugestões do agente AI de conciliação bancária.
-- Cada sugestão tem status (pending/accepted/rejected/expired) e audit trail.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match','categorize','anomaly','rule','summary','conflict')),
  -- Deduplicação: hash do input para evitar re-análise
  input_hash TEXT NOT NULL,
  -- Contexto que gerou a sugestão
  context_json JSONB NOT NULL DEFAULT '{}',
  -- Sugestão do AI
  suggestion_json JSONB NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  reasoning TEXT,
  -- Workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired')),
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  -- Metadata
  model_used TEXT NOT NULL DEFAULT 'claude-haiku-4-5',
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_tenant ON finance_ai_suggestions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON finance_ai_suggestions(tenant_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_suggestions_dedup ON finance_ai_suggestions(tenant_id, type, input_hash)
  WHERE status = 'pending';

-- RLS
ALTER TABLE finance_ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_suggestions_tenant_isolation" ON finance_ai_suggestions
  FOR ALL USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Adicionar 'ai' como método válido no reconciliation_log (se existir)
DO $$
BEGIN
  -- Verifica se a coluna method existe na tabela finance_reconciliation_log
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'finance_reconciliation_log' AND column_name = 'method'
  ) THEN
    -- Atualiza o CHECK constraint para incluir 'ai'
    ALTER TABLE finance_reconciliation_log DROP CONSTRAINT IF EXISTS finance_reconciliation_log_method_check;
    ALTER TABLE finance_reconciliation_log ADD CONSTRAINT finance_reconciliation_log_method_check
      CHECK (method IN ('auto', 'manual', 'rule', 'ai'));
  END IF;
END $$;
