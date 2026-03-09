-- P2: Adiciona campos granulares do Omie como colunas indexadas em finance_transactions
-- Criado em: 2026-03-09
-- Motivo: campos chegavam via omie_raw JSONB mas não estavam disponíveis para
--         queries diretas, filtros e cálculos sem extração de JSON em runtime.

ALTER TABLE finance_transactions
  ADD COLUMN IF NOT EXISTS omie_juros              NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS omie_multa              NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS omie_desconto           NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS omie_num_titulo         TEXT,
  ADD COLUMN IF NOT EXISTS omie_categoria_codigo   TEXT,
  ADD COLUMN IF NOT EXISTS omie_departamento_codigo TEXT;

-- Índice para busca por número de título (frequente em reconciliação)
CREATE INDEX IF NOT EXISTS idx_finance_transactions_omie_num_titulo
  ON finance_transactions (tenant_id, omie_num_titulo)
  WHERE omie_num_titulo IS NOT NULL;

COMMENT ON COLUMN finance_transactions.omie_juros              IS 'Valor de juros (nValorJuros) vindo do Omie';
COMMENT ON COLUMN finance_transactions.omie_multa              IS 'Valor de multa (nValorMulta) vindo do Omie';
COMMENT ON COLUMN finance_transactions.omie_desconto           IS 'Valor de desconto (nValorDesconto) vindo do Omie';
COMMENT ON COLUMN finance_transactions.omie_num_titulo         IS 'Número do título (cNumTitulo) vindo do Omie — indexado';
COMMENT ON COLUMN finance_transactions.omie_categoria_codigo   IS 'Código da categoria (codigo_categoria) vindo do Omie';
COMMENT ON COLUMN finance_transactions.omie_departamento_codigo IS 'Código do departamento/centro de custo (codigo_departamento) vindo do Omie';
