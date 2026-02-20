-- ============================================================================
-- TBO OS — Migration v2.3
-- Features: Deal Stage Automation, Document Versions, Dynamic Templates,
--           Weekly Digest, Financial Report
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- 1. FN_DEAL_STAGE_AUTOMATION
-- Quando um deal muda para 'fechado_ganho':
--   → Cria projeto automaticamente
--   → Cria proposta vinculada
--   → Registra no audit_log
--   → Cria notificacao para o owner e founders
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.fn_deal_stage_automation()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_proposal_id UUID;
  v_founder_ids UUID[];
BEGIN
  -- Somente executa quando stage muda
  IF OLD.stage = NEW.stage THEN
    RETURN NEW;
  END IF;

  -- ── FECHADO GANHO → criar projeto + proposta + notificacoes ──
  IF NEW.stage = 'fechado_ganho' THEN

    -- 1. Criar projeto automaticamente
    INSERT INTO public.projects (
      name, client, client_company, status, owner_id, owner_name,
      value, services, priority, source, notes
    ) VALUES (
      'Projeto - ' || NEW.name,
      NEW.contact,
      NEW.company,
      'briefing',
      NEW.owner_id,
      NEW.owner_name,
      NEW.value,
      NEW.services,
      COALESCE(NEW.priority, 'media'),
      'deal_automation',
      'Projeto criado automaticamente a partir do deal "' || NEW.name || '" (ID: ' || NEW.id || ')'
    ) RETURNING id INTO v_project_id;

    -- 2. Criar proposta vinculada
    INSERT INTO public.proposals (
      name, client, company, status, value, services,
      owner_id, owner_name, deal_id, notes
    ) VALUES (
      'Proposta - ' || NEW.name,
      NEW.contact,
      NEW.company,
      'aprovada',
      NEW.value,
      NEW.services,
      NEW.owner_id,
      NEW.owner_name,
      NEW.id,
      'Proposta gerada automaticamente pelo deal "' || NEW.name || '"'
    ) RETURNING id INTO v_proposal_id;

    -- 3. Vincular proposal_id ao projeto
    UPDATE public.projects SET proposal_id = v_proposal_id WHERE id = v_project_id;

    -- 4. Registrar no audit_log
    INSERT INTO public.audit_log (
      entity_type, entity_id, entity_name, action,
      from_state, to_state, user_id, user_name,
      reason, metadata
    ) VALUES (
      'deal', NEW.id::TEXT, NEW.name, 'stage_change',
      OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name,
      'Deal fechado ganho - projeto e proposta criados automaticamente',
      jsonb_build_object(
        'project_id', v_project_id,
        'proposal_id', v_proposal_id,
        'deal_value', NEW.value,
        'company', NEW.company
      )
    );

    -- 5. Notificar owner do deal
    IF NEW.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, title, body, type, entity_type, entity_id, action_url
      ) VALUES (
        NEW.owner_id,
        'Deal Fechado! 🎉',
        'O deal "' || NEW.name || '" (' || COALESCE(NEW.company, '') || ') foi fechado com sucesso! Projeto e proposta criados automaticamente.',
        'success',
        'deal',
        NEW.id::TEXT,
        '#projetos'
      );
    END IF;

    -- 6. Notificar todos os founders
    SELECT ARRAY_AGG(id) INTO v_founder_ids
    FROM public.profiles WHERE role = 'founder' AND id != COALESCE(NEW.owner_id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_founder_ids IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type, entity_type, entity_id, action_url)
      SELECT
        unnest(v_founder_ids),
        'Novo Deal Fechado!',
        'O deal "' || NEW.name || '" (R$ ' || COALESCE(NEW.value::TEXT, '0') || ') foi fechado por ' || COALESCE(NEW.owner_name, 'alguem') || '. Projeto criado automaticamente.',
        'success',
        'deal',
        NEW.id::TEXT,
        '#projetos';
    END IF;

  -- ── FECHADO PERDIDO → registrar e notificar ──
  ELSIF NEW.stage = 'fechado_perdido' THEN

    INSERT INTO public.audit_log (
      entity_type, entity_id, entity_name, action,
      from_state, to_state, user_id, user_name,
      reason, metadata
    ) VALUES (
      'deal', NEW.id::TEXT, NEW.name, 'stage_change',
      OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name,
      'Deal perdido',
      jsonb_build_object('deal_value', NEW.value, 'company', NEW.company)
    );

    IF NEW.owner_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, title, body, type, entity_type, entity_id
      ) VALUES (
        NEW.owner_id,
        'Deal Perdido',
        'O deal "' || NEW.name || '" foi marcado como perdido. Considere registrar o motivo nas notas.',
        'warning',
        'deal',
        NEW.id::TEXT
      );
    END IF;

  -- ── QUALQUER outra mudanca de stage → audit log ──
  ELSE
    INSERT INTO public.audit_log (
      entity_type, entity_id, entity_name, action,
      from_state, to_state, user_id, user_name, metadata
    ) VALUES (
      'deal', NEW.id::TEXT, NEW.name, 'stage_change',
      OLD.stage, NEW.stage, NEW.owner_id, NEW.owner_name,
      jsonb_build_object('deal_value', NEW.value)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger no crm_deals
DROP TRIGGER IF EXISTS trg_deal_stage_automation ON public.crm_deals;
CREATE TRIGGER trg_deal_stage_automation
  AFTER UPDATE OF stage ON public.crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_deal_stage_automation();

-- Enable realtime para as tabelas necessarias
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. DOCUMENT VERSIONS (versionamento de documentos)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'deliverable'
    CHECK (document_type IN ('deliverable', 'proposal', 'contract', 'template', 'knowledge')),
  version INTEGER NOT NULL DEFAULT 1,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT '',
  thumbnail_path TEXT,
  changelog TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  uploaded_by_name TEXT,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, version)
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_versions_select" ON public.document_versions FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "doc_versions_insert" ON public.document_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "doc_versions_update" ON public.document_versions FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'project_owner'))
  );

CREATE INDEX idx_doc_versions_document ON public.document_versions(document_id);
CREATE INDEX idx_doc_versions_current ON public.document_versions(document_id, is_current) WHERE is_current = TRUE;
CREATE INDEX idx_doc_versions_type ON public.document_versions(document_type);

-- Funcao para auto-incrementar versao e desmarcar versoes anteriores
CREATE OR REPLACE FUNCTION public.fn_auto_version_document()
RETURNS TRIGGER AS $$
DECLARE
  v_max_version INTEGER;
BEGIN
  -- Buscar maior versao existente para esse documento
  SELECT COALESCE(MAX(version), 0) INTO v_max_version
  FROM public.document_versions
  WHERE document_id = NEW.document_id;

  -- Definir versao automaticamente
  NEW.version := v_max_version + 1;

  -- Desmarcar versoes anteriores como nao-current
  UPDATE public.document_versions
  SET is_current = FALSE
  WHERE document_id = NEW.document_id AND is_current = TRUE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_version
  BEFORE INSERT ON public.document_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_version_document();

-- ════════════════════════════════════════════════════════════════════════════
-- 3. DYNAMIC TEMPLATES (sistema de templates reutilizaveis)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dynamic_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'proposta'
    CHECK (type IN ('proposta', 'contrato', 'email', 'briefing', 'relatorio', 'ata', 'outro')),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  variables JSONB DEFAULT '[]',
  category TEXT DEFAULT 'geral',
  is_default BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dynamic_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.dynamic_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_select" ON public.dynamic_templates FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "templates_insert" ON public.dynamic_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "templates_update" ON public.dynamic_templates FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('founder', 'project_owner'))
  );
CREATE POLICY "templates_delete" ON public.dynamic_templates FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder')
  );

CREATE INDEX idx_templates_type ON public.dynamic_templates(type);
CREATE INDEX idx_templates_category ON public.dynamic_templates(category);

-- Seed: templates padrao
INSERT INTO public.dynamic_templates (type, name, description, content, variables, is_default) VALUES
(
  'proposta',
  'Proposta Comercial Padrao',
  'Template padrao para propostas comerciais da TBO',
  E'# Proposta Comercial\n\n**Para:** {{cliente_nome}}\n**Empresa:** {{cliente_empresa}}\n**Data:** {{data}}\n\n---\n\n## Escopo do Projeto\n\n{{escopo_descricao}}\n\n## Servicos Inclusos\n\n{{servicos_lista}}\n\n## Investimento\n\n| Item | Valor |\n|------|-------|\n| {{servico_principal}} | R$ {{valor_principal}} |\n| **Total** | **R$ {{valor_total}}** |\n\n## Prazo de Entrega\n\n{{prazo}} dias uteis a partir da aprovacao.\n\n## Condicoes de Pagamento\n\n{{condicoes_pagamento}}\n\n---\n\n*Proposta valida por 15 dias.*\n\nAtenciosamente,\n**TBO Studio**',
  '[{"key":"cliente_nome","label":"Nome do Cliente","type":"text"},{"key":"cliente_empresa","label":"Empresa","type":"text"},{"key":"data","label":"Data","type":"date"},{"key":"escopo_descricao","label":"Descricao do Escopo","type":"textarea"},{"key":"servicos_lista","label":"Lista de Servicos","type":"textarea"},{"key":"servico_principal","label":"Servico Principal","type":"text"},{"key":"valor_principal","label":"Valor Principal","type":"number"},{"key":"valor_total","label":"Valor Total","type":"number"},{"key":"prazo","label":"Prazo (dias)","type":"number"},{"key":"condicoes_pagamento","label":"Condicoes de Pagamento","type":"textarea"}]',
  TRUE
),
(
  'email',
  'Follow-up de Proposta',
  'Email de acompanhamento apos envio de proposta',
  E'Ola {{nome}},\n\nEspero que esteja bem!\n\nGostaria de saber se teve a oportunidade de analisar a proposta que enviamos referente ao projeto {{projeto_nome}}.\n\nEstamos a disposicao para esclarecer qualquer duvida ou ajustar o escopo conforme suas necessidades.\n\nAbracos,\n{{remetente_nome}}\nTBO Studio',
  '[{"key":"nome","label":"Nome do Destinatario","type":"text"},{"key":"projeto_nome","label":"Nome do Projeto","type":"text"},{"key":"remetente_nome","label":"Seu Nome","type":"text"}]',
  TRUE
),
(
  'briefing',
  'Briefing de Projeto',
  'Formulario padrao de briefing para novos projetos',
  E'# Briefing de Projeto\n\n## 1. Informacoes do Cliente\n- **Cliente:** {{cliente_nome}}\n- **Empresa:** {{empresa}}\n- **Contato:** {{contato_email}}\n\n## 2. Objetivo do Projeto\n{{objetivo}}\n\n## 3. Publico-Alvo\n{{publico_alvo}}\n\n## 4. Referencias Visuais\n{{referencias}}\n\n## 5. Entregaveis Esperados\n{{entregaveis}}\n\n## 6. Prazo e Orcamento\n- **Prazo desejado:** {{prazo}}\n- **Orcamento disponivel:** R$ {{orcamento}}\n\n## 7. Observacoes Adicionais\n{{observacoes}}',
  '[{"key":"cliente_nome","label":"Nome do Cliente","type":"text"},{"key":"empresa","label":"Empresa","type":"text"},{"key":"contato_email","label":"Email de Contato","type":"text"},{"key":"objetivo","label":"Objetivo do Projeto","type":"textarea"},{"key":"publico_alvo","label":"Publico-Alvo","type":"textarea"},{"key":"referencias","label":"Referencias Visuais","type":"textarea"},{"key":"entregaveis","label":"Entregaveis","type":"textarea"},{"key":"prazo","label":"Prazo","type":"text"},{"key":"orcamento","label":"Orcamento","type":"number"},{"key":"observacoes","label":"Observacoes","type":"textarea"}]',
  TRUE
),
(
  'contrato',
  'Contrato de Prestacao de Servicos',
  'Modelo basico de contrato de servicos',
  E'# CONTRATO DE PRESTACAO DE SERVICOS\n\n**Contrato nº:** {{numero_contrato}}\n**Data:** {{data}}\n\n---\n\n## CONTRATANTE\n**Nome/Razao Social:** {{contratante_nome}}\n**CNPJ/CPF:** {{contratante_documento}}\n**Endereco:** {{contratante_endereco}}\n\n## CONTRATADA\n**TBO Studio**\n**CNPJ:** {{tbo_cnpj}}\n\n---\n\n## CLAUSULA 1 - OBJETO\nA CONTRATADA se compromete a prestar os seguintes servicos:\n{{descricao_servicos}}\n\n## CLAUSULA 2 - VALOR E PAGAMENTO\nO valor total dos servicos e de **R$ {{valor_total}}**, a ser pago conforme:\n{{condicoes_pagamento}}\n\n## CLAUSULA 3 - PRAZO\nO prazo de execucao e de **{{prazo_dias}} dias uteis** a partir da assinatura.\n\n## CLAUSULA 4 - REVISOES\nEstao incluidas ate **{{num_revisoes}} rodadas de revisao**.\n\n---\n\n_______________________________\nCONTRATANTE\n\n_______________________________\nCONTRATADA - TBO Studio',
  '[{"key":"numero_contrato","label":"Numero do Contrato","type":"text"},{"key":"data","label":"Data","type":"date"},{"key":"contratante_nome","label":"Nome do Contratante","type":"text"},{"key":"contratante_documento","label":"CNPJ/CPF","type":"text"},{"key":"contratante_endereco","label":"Endereco","type":"text"},{"key":"tbo_cnpj","label":"CNPJ TBO","type":"text"},{"key":"descricao_servicos","label":"Descricao dos Servicos","type":"textarea"},{"key":"valor_total","label":"Valor Total","type":"number"},{"key":"condicoes_pagamento","label":"Condicoes de Pagamento","type":"textarea"},{"key":"prazo_dias","label":"Prazo (dias)","type":"number"},{"key":"num_revisoes","label":"Numero de Revisoes","type":"number"}]',
  TRUE
);

-- ════════════════════════════════════════════════════════════════════════════
-- 4. WEEKLY DIGEST / FINANCIAL REPORT SUPPORT
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.digest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('daily', 'weekly', 'financial')),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content_html TEXT,
  snapshot JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

ALTER TABLE public.digest_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "digest_logs_select" ON public.digest_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'));
CREATE POLICY "digest_logs_insert" ON public.digest_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX idx_digest_logs_type ON public.digest_logs(type, sent_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- 5. VIEW para relatorio financeiro semanal
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_weekly_financial_summary AS
SELECT
  COUNT(*) FILTER (WHERE stage = 'fechado_ganho' AND updated_at >= now() - INTERVAL '7 days') AS deals_ganhos_semana,
  COALESCE(SUM(value) FILTER (WHERE stage = 'fechado_ganho' AND updated_at >= now() - INTERVAL '7 days'), 0) AS valor_ganho_semana,
  COUNT(*) FILTER (WHERE stage = 'fechado_perdido' AND updated_at >= now() - INTERVAL '7 days') AS deals_perdidos_semana,
  COUNT(*) FILTER (WHERE stage NOT IN ('fechado_ganho', 'fechado_perdido')) AS deals_em_pipeline,
  COALESCE(SUM(value) FILTER (WHERE stage NOT IN ('fechado_ganho', 'fechado_perdido')), 0) AS valor_pipeline,
  COALESCE(SUM(value * probability / 100.0) FILTER (WHERE stage NOT IN ('fechado_ganho', 'fechado_perdido')), 0) AS valor_ponderado_pipeline
FROM public.crm_deals;

CREATE OR REPLACE VIEW public.v_weekly_project_summary AS
SELECT
  COUNT(*) FILTER (WHERE status IN ('producao', 'briefing', 'planejamento', 'revisao')) AS projetos_ativos,
  COUNT(*) FILTER (WHERE status = 'finalizado' AND updated_at >= now() - INTERVAL '7 days') AS projetos_finalizados_semana,
  COUNT(*) FILTER (WHERE status = 'entrega') AS projetos_em_entrega,
  COALESCE(SUM(value) FILTER (WHERE status IN ('producao', 'briefing', 'planejamento', 'revisao', 'entrega')), 0) AS valor_projetos_ativos
FROM public.projects;

-- ════════════════════════════════════════════════════════════════════════════
-- 6. Storage bucket para document-versions
-- ════════════════════════════════════════════════════════════════════════════
-- Nota: Criar manualmente no Supabase Dashboard:
--   Storage > New Bucket > "document-versions" (Public)
--   Ou via SQL:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('document-versions', 'document-versions', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DONE! Migration v2.3 applied successfully.
-- Features: Deal Automation, Document Versions, Dynamic Templates, Digest/Reports
-- ============================================================================
