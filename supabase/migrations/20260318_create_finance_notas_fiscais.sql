-- ============================================================
-- TBO OS — finance_notas_fiscais + finance_tax_config
-- Item 06: Motor fiscal — NF-e, cálculo de impostos, relatório
-- ============================================================

-- ── Tax configuration per tenant ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.finance_tax_config (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  cnpj                  TEXT,
  razao_social          TEXT,
  codigo_municipio      TEXT,
  codigo_cnae           TEXT,
  regime_tributario     TEXT NOT NULL DEFAULT 'simples_nacional'
                        CHECK (regime_tributario IN ('simples_nacional', 'lucro_presumido', 'lucro_real', 'mei')),
  optante_simples       BOOLEAN NOT NULL DEFAULT TRUE,
  incentivador_cultural BOOLEAN NOT NULL DEFAULT FALSE,
  -- Alíquotas padrão (%)
  aliquota_iss          NUMERIC(8,4) NOT NULL DEFAULT 5.0000,
  aliquota_pis          NUMERIC(8,4) NOT NULL DEFAULT 0.6500,
  aliquota_cofins       NUMERIC(8,4) NOT NULL DEFAULT 3.0000,
  aliquota_ir           NUMERIC(8,4) NOT NULL DEFAULT 1.5000,
  aliquota_csll         NUMERIC(8,4) NOT NULL DEFAULT 1.0000,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ftaxcfg_tenant ON public.finance_tax_config(tenant_id);

ALTER TABLE public.finance_tax_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_tax_config_tenant_select" ON public.finance_tax_config
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "finance_tax_config_tenant_insert" ON public.finance_tax_config
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "finance_tax_config_tenant_update" ON public.finance_tax_config
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

-- ── Notas Fiscais ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.finance_notas_fiscais (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  transaction_id                  UUID REFERENCES public.finance_transactions(id) ON DELETE SET NULL,

  -- Identificação
  numero                          TEXT,
  serie                           TEXT,
  tipo                            TEXT NOT NULL DEFAULT 'nfse'
                                  CHECK (tipo IN ('nfse', 'nfe', 'nfce')),
  status                          TEXT NOT NULL DEFAULT 'rascunho'
                                  CHECK (status IN ('rascunho', 'autorizada', 'cancelada', 'rejeitada', 'processando')),

  -- Emitente
  prestador_cnpj                  TEXT,
  prestador_razao                 TEXT,
  prestador_im                    TEXT,              -- inscrição municipal

  -- Tomador
  tomador_cnpj                    TEXT,
  tomador_cpf                     TEXT,
  tomador_razao                   TEXT,
  tomador_email                   TEXT,
  tomador_endereco                JSONB,             -- { logradouro, numero, bairro, cidade, uf, cep }

  -- Valores
  valor_servicos                  NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_deducoes                  NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_desconto_incondicionado   NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_desconto_condicionado     NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_base_calculo              NUMERIC(15,2) NOT NULL DEFAULT 0,

  -- Impostos calculados
  aliquota_iss                    NUMERIC(8,4) NOT NULL DEFAULT 0,
  valor_iss                       NUMERIC(15,2) NOT NULL DEFAULT 0,
  iss_retido                      BOOLEAN NOT NULL DEFAULT FALSE,

  aliquota_pis                    NUMERIC(8,4) NOT NULL DEFAULT 0,
  valor_pis                       NUMERIC(15,2) NOT NULL DEFAULT 0,

  aliquota_cofins                 NUMERIC(8,4) NOT NULL DEFAULT 0,
  valor_cofins                    NUMERIC(15,2) NOT NULL DEFAULT 0,

  aliquota_ir                     NUMERIC(8,4) NOT NULL DEFAULT 0,
  valor_ir                        NUMERIC(15,2) NOT NULL DEFAULT 0,

  aliquota_csll                   NUMERIC(8,4) NOT NULL DEFAULT 0,
  valor_csll                      NUMERIC(15,2) NOT NULL DEFAULT 0,

  valor_total_impostos            NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_liquido                   NUMERIC(15,2) NOT NULL DEFAULT 0,

  -- Dados do serviço
  discriminacao                   TEXT,
  codigo_municipio                TEXT,
  codigo_cnae                     TEXT,
  codigo_tributacao_municipio     TEXT,
  natureza_operacao               INTEGER NOT NULL DEFAULT 1, -- 1=tributação no município
  regime_especial_tributacao      INTEGER,

  -- Datas
  data_emissao                    DATE,
  data_competencia                TEXT,              -- YYYY-MM
  data_cancelamento               TIMESTAMPTZ,
  motivo_cancelamento             TEXT,

  -- Chaves externas
  chave_acesso                    TEXT,
  protocolo                       TEXT,
  numero_rps                      TEXT,
  serie_rps                       TEXT,
  xml_url                         TEXT,
  pdf_url                         TEXT,

  -- Auditoria
  created_by                      UUID REFERENCES auth.users(id),
  updated_by                      UUID REFERENCES auth.users(id),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fnf_tenant        ON public.finance_notas_fiscais(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fnf_status        ON public.finance_notas_fiscais(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_fnf_competencia   ON public.finance_notas_fiscais(tenant_id, data_competencia);
CREATE INDEX IF NOT EXISTS idx_fnf_emissao       ON public.finance_notas_fiscais(tenant_id, data_emissao);
CREATE INDEX IF NOT EXISTS idx_fnf_transaction   ON public.finance_notas_fiscais(transaction_id);
CREATE INDEX IF NOT EXISTS idx_fnf_tomador_cnpj  ON public.finance_notas_fiscais(tenant_id, tomador_cnpj);

ALTER TABLE public.finance_notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finance_notas_fiscais_tenant_select" ON public.finance_notas_fiscais
  FOR SELECT USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "finance_notas_fiscais_tenant_insert" ON public.finance_notas_fiscais
  FOR INSERT WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "finance_notas_fiscais_tenant_update" ON public.finance_notas_fiscais
  FOR UPDATE USING (tenant_id IN (SELECT get_user_tenant_ids()))
  WITH CHECK (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "finance_notas_fiscais_tenant_delete" ON public.finance_notas_fiscais
  FOR DELETE USING (tenant_id IN (SELECT get_user_tenant_ids()));
