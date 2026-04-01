DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'No tenant found.';
    RETURN;
  END IF;
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Prospeccao e Qualificacao de Leads',
    'tbo-com-001-prospeccao-e-qualificacao-de-leads',
    'comercial',
    'checklist',
    'Prospecção e Qualificação de Leads',
    'Standard Operating Procedure

Prospecção e Qualificação de Leads

Código

TBO-COM-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Comercial (Vendas / BD)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar o processo de geração e qualificação de leads para garantir que a TBO invista tempo comercial apenas em oportunidades com real fit de perfil, orçamento e timing de lançamento.

2. Escopo

2.1 O que está coberto

Fontes de lead (inbound, outbound, networking), critérios de qualificação BANT-R, reunião de diagnóstico e registro no CRM.

2.2 Exclusões

Elaboração de proposta (SOP-COM-002), contratação (SOP-COM-003), gestão de pipeline (SOP-COM-004), produção de lead magnets (SOP-MKT).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Prospectar, qualificar e conduzir diagnóstico

Executor

---

Marco

Validar fit operacional e capacidade

Consultor

---

Rafa (PO Marketing)

Gerar leads inbound via campanhas e lead magnets

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Lead magnets ativos no LinkedIn; perfil de cliente ideal (ICP) definido; RD Station CRM configurado com funil de vendas; calendário de eventos do setor.

4.2 Ferramentas e Acessos

RD Station CRM, LinkedIn (perfis da TBO e dos sócios), Google Meet, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Captura de Lead

Ação: Todo lead é registrado no RD Station CRM com fonte, data, dados de contato e observações iniciais. Leads de lead magnets do LinkedIn são importados automaticamente via automação.

Responsável: Ruy Lima / Rafa (inbound)

Output: Lead registrado no CRM com fonte identificada

Prazo referência: Até 24h após primeiro contato

5.2. Qualificação BANT-R

Ação: Ruy aplica os critérios: Budget (orçamento compatível com fee mínimo TBO), Authority (decisor ou influenciador direto), Need (lançamento previsto, reposicionamento ou insatisfação), Timing (lançamento em 3–12 meses), Region (praça atendível). Resultado: Lead Qualificado ou Lead Frio (nurturing).

Responsável: Ruy Lima

Output: Lead classificado no CRM

Prazo referência: Até 48h após captura

5.3. Reunião de Diagnóstico

Ação: Para leads qualificados, Ruy agenda call de diagnóstico (30–45 min) com pauta padronizada: empreendimento, cronograma, orçamento, expectativas, concorrência, fornecedores atuais.

Responsável: Ruy Lima

Output: Diagnóstico registrado no CRM com resumo e próximo passo

Prazo referência: Até 5 dias úteis após qualificação

5.4. Decisão de Próximo Passo

Ação: Ruy define: elaborar proposta, agendar follow-up ou descartar. Para propostas acima de R$ 50.000, alinha escopo com Marco antes de prosseguir.

Responsável: Ruy Lima

Output: Próximo passo definido e registrado

Prazo referência: Imediato após diagnóstico

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Lead registrado no CRM com todos os campos preenchidos

[ ] Critérios BANT-R aplicados e documentados

[ ] Diagnóstico realizado com pauta padronizada

[ ] Resumo da conversa registrado no CRM

[ ] Próximo passo definido (proposta / follow-up / descarte)

6.2 Erros Comuns a Evitar

Elaborar proposta sem diagnóstico → proposta genérica que não conecta com a dor do cliente

Não registrar no CRM → lead perdido, sem rastreabilidade

Qualificar sem critério → tempo gasto com leads sem fit real

7. Ferramentas e Templates

RD Station CRM (gestão de leads e funil), LinkedIn (prospecção outbound), Google Meet (diagnóstico), E-mail (follow-up), TBO Email Studio (nurturing de leads frios).

8. SLAs e Prazos

Registro de lead: até 24h após primeiro contato

Qualificação BANT-R: até 48h após captura

Diagnóstico agendado: até 5 dias úteis após qualificação

Regra: nenhuma proposta é elaborada sem diagnóstico prévio

9. Fluxograma

Lead Capturado → Registro no CRM → Qualificação BANT-R → Qualificado? → Sim: Diagnóstico (30–45min) → Proposta / Follow-up / Descarte → Fim / Não: Nurturing via E-mail → Requalificação em 60 dias → Fim

10. Glossário

BANT-R: framework de qualificação — Budget, Authority, Need, Timing, Region.

ICP: Ideal Customer Profile — perfil de cliente ideal da TBO (incorporadoras mid-to-high-end).

Nurturing: nutrição de leads frios com conteúdo até estarem prontos para abordagem comercial.

Diagnóstico: reunião exploratória para entender necessidades e contexto do potencial cliente.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Prospecção e Qualificação de Leads</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar o processo de geração e qualificação de leads para garantir que a TBO invista tempo comercial apenas em oportunidades com real fit de perfil, orçamento e timing de lançamento.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Fontes de lead (inbound, outbound, networking), critérios de qualificação BANT-R, reunião de diagnóstico e registro no CRM.</p><p><strong>2.2 Exclusões</strong></p><p>Elaboração de proposta (SOP-COM-002), contratação (SOP-COM-003), gestão de pipeline (SOP-COM-004), produção de lead magnets (SOP-MKT).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Prospectar, qualificar e conduzir diagnóstico</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar fit operacional e capacidade</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Rafa (PO Marketing)</strong></p></td><td><p>Gerar leads inbound via campanhas e lead magnets</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Lead magnets ativos no LinkedIn; perfil de cliente ideal (ICP) definido; RD Station CRM configurado com funil de vendas; calendário de eventos do setor.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>RD Station CRM, LinkedIn (perfis da TBO e dos sócios), Google Meet, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Captura de Lead</strong></p><p>Ação: Todo lead é registrado no RD Station CRM com fonte, data, dados de contato e observações iniciais. Leads de lead magnets do LinkedIn são importados automaticamente via automação.</p><p>Responsável: Ruy Lima / Rafa (inbound)</p><p>Output: Lead registrado no CRM com fonte identificada</p><p>Prazo referência: Até 24h após primeiro contato</p><p><strong>5.2. Qualificação BANT-R</strong></p><p>Ação: Ruy aplica os critérios: Budget (orçamento compatível com fee mínimo TBO), Authority (decisor ou influenciador direto), Need (lançamento previsto, reposicionamento ou insatisfação), Timing (lançamento em 3–12 meses), Region (praça atendível). Resultado: Lead Qualificado ou Lead Frio (nurturing).</p><p>Responsável: Ruy Lima</p><p>Output: Lead classificado no CRM</p><p>Prazo referência: Até 48h após captura</p><p><strong>5.3. Reunião de Diagnóstico</strong></p><p>Ação: Para leads qualificados, Ruy agenda call de diagnóstico (30–45 min) com pauta padronizada: empreendimento, cronograma, orçamento, expectativas, concorrência, fornecedores atuais.</p><p>Responsável: Ruy Lima</p><p>Output: Diagnóstico registrado no CRM com resumo e próximo passo</p><p>Prazo referência: Até 5 dias úteis após qualificação</p><p><strong>5.4. Decisão de Próximo Passo</strong></p><p>Ação: Ruy define: elaborar proposta, agendar follow-up ou descartar. Para propostas acima de R$ 50.000, alinha escopo com Marco antes de prosseguir.</p><p>Responsável: Ruy Lima</p><p>Output: Próximo passo definido e registrado</p><p>Prazo referência: Imediato após diagnóstico</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Lead registrado no CRM com todos os campos preenchidos</li><li>[ ] Critérios BANT-R aplicados e documentados</li><li>[ ] Diagnóstico realizado com pauta padronizada</li><li>[ ] Resumo da conversa registrado no CRM</li><li>[ ] Próximo passo definido (proposta / follow-up / descarte)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Elaborar proposta sem diagnóstico → proposta genérica que não conecta com a dor do cliente</li><li>Não registrar no CRM → lead perdido, sem rastreabilidade</li><li>Qualificar sem critério → tempo gasto com leads sem fit real</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>RD Station CRM (gestão de leads e funil), LinkedIn (prospecção outbound), Google Meet (diagnóstico), E-mail (follow-up), TBO Email Studio (nurturing de leads frios).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Registro de lead: até 24h após primeiro contato</li><li>Qualificação BANT-R: até 48h após captura</li><li>Diagnóstico agendado: até 5 dias úteis após qualificação</li><li>Regra: nenhuma proposta é elaborada sem diagnóstico prévio</li></ul><p><strong>9. Fluxograma</strong></p><p>Lead Capturado → Registro no CRM → Qualificação BANT-R → Qualificado? → Sim: Diagnóstico (30–45min) → Proposta / Follow-up / Descarte → Fim / Não: Nurturing via E-mail → Requalificação em 60 dias → Fim</p><p><strong>10. Glossário</strong></p><p>BANT-R: framework de qualificação — Budget, Authority, Need, Timing, Region.</p><p>ICP: Ideal Customer Profile — perfil de cliente ideal da TBO (incorporadoras mid-to-high-end).</p><p>Nurturing: nutrição de leads frios com conteúdo até estarem prontos para abordagem comercial.</p><p>Diagnóstico: reunião exploratória para entender necessidades e contexto do potencial cliente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','cliente']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-COM-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de geração e qualificação de leads para garantir que a TBO invista tempo comercial apenas em oportunidades com real fit de perfil, orçamento e timing de lançamento.', '<p>Padronizar o processo de geração e qualificação de leads para garantir que a TBO invista tempo comercial apenas em oportunidades com real fit de perfil, orçamento e timing de lançamento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Fontes de lead (inbound, outbound, networking), critérios de qualificação BANT-R, reunião de diagnóstico e registro no CRM.', '<p>Fontes de lead (inbound, outbound, networking), critérios de qualificação BANT-R, reunião de diagnóstico e registro no CRM.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Elaboração de proposta (SOP-COM-002), contratação (SOP-COM-003), gestão de pipeline (SOP-COM-004), produção de lead magnets (SOP-MKT).', '<p>Elaboração de proposta (SOP-COM-002), contratação (SOP-COM-003), gestão de pipeline (SOP-COM-004), produção de lead magnets (SOP-MKT).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Prospectar, qualificar e conduzir diagnóstico

Executor

---

Marco

Validar fit operacional e capacidade

Consultor

---

Rafa (PO Marketing)

Gerar leads inbound via campanhas e lead magnets

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Prospectar, qualificar e conduzir diagnóstico</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar fit operacional e capacidade</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Rafa (PO Marketing)</strong></p></td><td><p>Gerar leads inbound via campanhas e lead magnets</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Lead magnets ativos no LinkedIn; perfil de cliente ideal (ICP) definido; RD Station CRM configurado com funil de vendas; calendário de eventos do setor.', '<p>Lead magnets ativos no LinkedIn; perfil de cliente ideal (ICP) definido; RD Station CRM configurado com funil de vendas; calendário de eventos do setor.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station CRM, LinkedIn (perfis da TBO e dos sócios), Google Meet, E-mail corporativo.', '<p>RD Station CRM, LinkedIn (perfis da TBO e dos sócios), Google Meet, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Captura de Lead', 'Ação: Todo lead é registrado no RD Station CRM com fonte, data, dados de contato e observações iniciais. Leads de lead magnets do LinkedIn são importados automaticamente via automação.

Responsável: Ruy Lima / Rafa (inbound)

Output: Lead registrado no CRM com fonte identificada

Prazo referência: Até 24h após primeiro contato', '<p>Ação: Todo lead é registrado no RD Station CRM com fonte, data, dados de contato e observações iniciais. Leads de lead magnets do LinkedIn são importados automaticamente via automação.</p><p>Responsável: Ruy Lima / Rafa (inbound)</p><p>Output: Lead registrado no CRM com fonte identificada</p><p>Prazo referência: Até 24h após primeiro contato</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Qualificação BANT-R', 'Ação: Ruy aplica os critérios: Budget (orçamento compatível com fee mínimo TBO), Authority (decisor ou influenciador direto), Need (lançamento previsto, reposicionamento ou insatisfação), Timing (lançamento em 3–12 meses), Region (praça atendível). Resultado: Lead Qualificado ou Lead Frio (nurturing).

Responsável: Ruy Lima

Output: Lead classificado no CRM

Prazo referência: Até 48h após captura', '<p>Ação: Ruy aplica os critérios: Budget (orçamento compatível com fee mínimo TBO), Authority (decisor ou influenciador direto), Need (lançamento previsto, reposicionamento ou insatisfação), Timing (lançamento em 3–12 meses), Region (praça atendível). Resultado: Lead Qualificado ou Lead Frio (nurturing).</p><p>Responsável: Ruy Lima</p><p>Output: Lead classificado no CRM</p><p>Prazo referência: Até 48h após captura</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Reunião de Diagnóstico', 'Ação: Para leads qualificados, Ruy agenda call de diagnóstico (30–45 min) com pauta padronizada: empreendimento, cronograma, orçamento, expectativas, concorrência, fornecedores atuais.

Responsável: Ruy Lima

Output: Diagnóstico registrado no CRM com resumo e próximo passo

Prazo referência: Até 5 dias úteis após qualificação', '<p>Ação: Para leads qualificados, Ruy agenda call de diagnóstico (30–45 min) com pauta padronizada: empreendimento, cronograma, orçamento, expectativas, concorrência, fornecedores atuais.</p><p>Responsável: Ruy Lima</p><p>Output: Diagnóstico registrado no CRM com resumo e próximo passo</p><p>Prazo referência: Até 5 dias úteis após qualificação</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Decisão de Próximo Passo', 'Ação: Ruy define: elaborar proposta, agendar follow-up ou descartar. Para propostas acima de R$ 50.000, alinha escopo com Marco antes de prosseguir.

Responsável: Ruy Lima

Output: Próximo passo definido e registrado

Prazo referência: Imediato após diagnóstico', '<p>Ação: Ruy define: elaborar proposta, agendar follow-up ou descartar. Para propostas acima de R$ 50.000, alinha escopo com Marco antes de prosseguir.</p><p>Responsável: Ruy Lima</p><p>Output: Próximo passo definido e registrado</p><p>Prazo referência: Imediato após diagnóstico</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Lead registrado no CRM com todos os campos preenchidos

[ ] Critérios BANT-R aplicados e documentados

[ ] Diagnóstico realizado com pauta padronizada

[ ] Resumo da conversa registrado no CRM

[ ] Próximo passo definido (proposta / follow-up / descarte)', '<ul><li>[ ] Lead registrado no CRM com todos os campos preenchidos</li><li>[ ] Critérios BANT-R aplicados e documentados</li><li>[ ] Diagnóstico realizado com pauta padronizada</li><li>[ ] Resumo da conversa registrado no CRM</li><li>[ ] Próximo passo definido (proposta / follow-up / descarte)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Elaborar proposta sem diagnóstico → proposta genérica que não conecta com a dor do cliente

Não registrar no CRM → lead perdido, sem rastreabilidade

Qualificar sem critério → tempo gasto com leads sem fit real', '<ul><li>Elaborar proposta sem diagnóstico → proposta genérica que não conecta com a dor do cliente</li><li>Não registrar no CRM → lead perdido, sem rastreabilidade</li><li>Qualificar sem critério → tempo gasto com leads sem fit real</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station CRM (gestão de leads e funil), LinkedIn (prospecção outbound), Google Meet (diagnóstico), E-mail (follow-up), TBO Email Studio (nurturing de leads frios).', '<p>RD Station CRM (gestão de leads e funil), LinkedIn (prospecção outbound), Google Meet (diagnóstico), E-mail (follow-up), TBO Email Studio (nurturing de leads frios).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Registro de lead: até 24h após primeiro contato

Qualificação BANT-R: até 48h após captura

Diagnóstico agendado: até 5 dias úteis após qualificação

Regra: nenhuma proposta é elaborada sem diagnóstico prévio', '<ul><li>Registro de lead: até 24h após primeiro contato</li><li>Qualificação BANT-R: até 48h após captura</li><li>Diagnóstico agendado: até 5 dias úteis após qualificação</li><li>Regra: nenhuma proposta é elaborada sem diagnóstico prévio</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Lead Capturado → Registro no CRM → Qualificação BANT-R → Qualificado? → Sim: Diagnóstico (30–45min) → Proposta / Follow-up / Descarte → Fim / Não: Nurturing via E-mail → Requalificação em 60 dias → Fim', '<p>Lead Capturado → Registro no CRM → Qualificação BANT-R → Qualificado? → Sim: Diagnóstico (30–45min) → Proposta / Follow-up / Descarte → Fim / Não: Nurturing via E-mail → Requalificação em 60 dias → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'BANT-R: framework de qualificação — Budget, Authority, Need, Timing, Region.

ICP: Ideal Customer Profile — perfil de cliente ideal da TBO (incorporadoras mid-to-high-end).

Nurturing: nutrição de leads frios com conteúdo até estarem prontos para abordagem comercial.

Diagnóstico: reunião exploratória para entender necessidades e contexto do potencial cliente.', '<p>BANT-R: framework de qualificação — Budget, Authority, Need, Timing, Region.</p><p>ICP: Ideal Customer Profile — perfil de cliente ideal da TBO (incorporadoras mid-to-high-end).</p><p>Nurturing: nutrição de leads frios com conteúdo até estarem prontos para abordagem comercial.</p><p>Diagnóstico: reunião exploratória para entender necessidades e contexto do potencial cliente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-COM-002: Elaboracao e Envio de Proposta Comercial ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Elaboracao e Envio de Proposta Comercial',
    'tbo-com-002-elaboracao-e-envio-de-proposta-comercial',
    'comercial',
    'checklist',
    'Elaboração e Envio de Proposta Comercial',
    'Standard Operating Procedure

Elaboração e Envio de Proposta Comercial

Código

TBO-COM-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Comercial (Vendas / BD)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.

2. Escopo

2.1 O que está coberto

Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.

2.2 Exclusões

Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Definir escopo e precificação, conduzir negociação

Executor

---

Marco

Validar escopo operacional e viabilidade de cronograma

Aprovador

---

Carol (Ops)

Formatar proposta no template TBO

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.

4.2 Ferramentas e Acessos

Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Composição da Proposta

Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.

Responsável: Ruy Lima

Output: Proposta em PDF no template TBO

Prazo referência: Até 3 dias úteis após diagnóstico

5.2. Revisão dos Sócios

Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.

Responsável: Marco + Ruy

Output: Proposta aprovada para envio

Prazo referência: Até 24h após composição

5.3. Envio ao Cliente

Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.

Responsável: Ruy Lima

Output: Proposta enviada e CRM atualizado

Prazo referência: No mesmo dia da aprovação

5.4. Negociação e Versionamento

Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.

Responsável: Ruy Lima

Output: Versão final aceita ou oportunidade perdida

Prazo referência: Até 15 dias úteis (prazo máximo de negociação)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Proposta no template padrão TBO com todas as seções

[ ] Escopo detalhado por BU com entregáveis claros

[ ] Revisão de pelo menos um sócio realizada

[ ] PDF enviado e status atualizado no CRM

[ ] Versão final salva no Google Drive

6.2 Erros Comuns a Evitar

Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado

Não versionar alterações → confusão sobre o que foi acordado

Desconto sem aprovação → margem comprometida sem decisão informada

7. Ferramentas e Templates

Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).

8. SLAs e Prazos

Composição: até 3 dias úteis após diagnóstico

Revisão: até 24h

Follow-up pós-envio: D+3

Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)

Regra: nenhuma proposta sai sem revisão de pelo menos um sócio

9. Fluxograma

Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim

10. Glossário

Template TBO: modelo padronizado de proposta com identidade visual da agência.

Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.

Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Elaboração e Envio de Proposta Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.</p><p><strong>2.2 Exclusões</strong></p><p>Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Definir escopo e precificação, conduzir negociação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar escopo operacional e viabilidade de cronograma</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Formatar proposta no template TBO</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Composição da Proposta</strong></p><p>Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta em PDF no template TBO</p><p>Prazo referência: Até 3 dias úteis após diagnóstico</p><p><strong>5.2. Revisão dos Sócios</strong></p><p>Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.</p><p>Responsável: Marco + Ruy</p><p>Output: Proposta aprovada para envio</p><p>Prazo referência: Até 24h após composição</p><p><strong>5.3. Envio ao Cliente</strong></p><p>Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta enviada e CRM atualizado</p><p>Prazo referência: No mesmo dia da aprovação</p><p><strong>5.4. Negociação e Versionamento</strong></p><p>Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.</p><p>Responsável: Ruy Lima</p><p>Output: Versão final aceita ou oportunidade perdida</p><p>Prazo referência: Até 15 dias úteis (prazo máximo de negociação)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Proposta no template padrão TBO com todas as seções</li><li>[ ] Escopo detalhado por BU com entregáveis claros</li><li>[ ] Revisão de pelo menos um sócio realizada</li><li>[ ] PDF enviado e status atualizado no CRM</li><li>[ ] Versão final salva no Google Drive</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado</li><li>Não versionar alterações → confusão sobre o que foi acordado</li><li>Desconto sem aprovação → margem comprometida sem decisão informada</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Composição: até 3 dias úteis após diagnóstico</li><li>Revisão: até 24h</li><li>Follow-up pós-envio: D+3</li><li>Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)</li><li>Regra: nenhuma proposta sai sem revisão de pelo menos um sócio</li></ul><p><strong>9. Fluxograma</strong></p><p>Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim</p><p><strong>10. Glossário</strong></p><p>Template TBO: modelo padronizado de proposta com identidade visual da agência.</p><p>Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.</p><p>Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','cliente','aprovacao']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-COM-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.', '<p>Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.', '<p>Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).', '<p>Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Definir escopo e precificação, conduzir negociação

Executor

---

Marco

Validar escopo operacional e viabilidade de cronograma

Aprovador

---

Carol (Ops)

Formatar proposta no template TBO

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Definir escopo e precificação, conduzir negociação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar escopo operacional e viabilidade de cronograma</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Formatar proposta no template TBO</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.', '<p>Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.', '<p>Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Composição da Proposta', 'Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.

Responsável: Ruy Lima

Output: Proposta em PDF no template TBO

Prazo referência: Até 3 dias úteis após diagnóstico', '<p>Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta em PDF no template TBO</p><p>Prazo referência: Até 3 dias úteis após diagnóstico</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Revisão dos Sócios', 'Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.

Responsável: Marco + Ruy

Output: Proposta aprovada para envio

Prazo referência: Até 24h após composição', '<p>Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.</p><p>Responsável: Marco + Ruy</p><p>Output: Proposta aprovada para envio</p><p>Prazo referência: Até 24h após composição</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Envio ao Cliente', 'Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.

Responsável: Ruy Lima

Output: Proposta enviada e CRM atualizado

Prazo referência: No mesmo dia da aprovação', '<p>Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.</p><p>Responsável: Ruy Lima</p><p>Output: Proposta enviada e CRM atualizado</p><p>Prazo referência: No mesmo dia da aprovação</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Negociação e Versionamento', 'Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.

Responsável: Ruy Lima

Output: Versão final aceita ou oportunidade perdida

Prazo referência: Até 15 dias úteis (prazo máximo de negociação)', '<p>Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.</p><p>Responsável: Ruy Lima</p><p>Output: Versão final aceita ou oportunidade perdida</p><p>Prazo referência: Até 15 dias úteis (prazo máximo de negociação)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Proposta no template padrão TBO com todas as seções

[ ] Escopo detalhado por BU com entregáveis claros

[ ] Revisão de pelo menos um sócio realizada

[ ] PDF enviado e status atualizado no CRM

[ ] Versão final salva no Google Drive', '<ul><li>[ ] Proposta no template padrão TBO com todas as seções</li><li>[ ] Escopo detalhado por BU com entregáveis claros</li><li>[ ] Revisão de pelo menos um sócio realizada</li><li>[ ] PDF enviado e status atualizado no CRM</li><li>[ ] Versão final salva no Google Drive</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado

Não versionar alterações → confusão sobre o que foi acordado

Desconto sem aprovação → margem comprometida sem decisão informada', '<ul><li>Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado</li><li>Não versionar alterações → confusão sobre o que foi acordado</li><li>Desconto sem aprovação → margem comprometida sem decisão informada</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).', '<p>Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Composição: até 3 dias úteis após diagnóstico

Revisão: até 24h

Follow-up pós-envio: D+3

Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)

Regra: nenhuma proposta sai sem revisão de pelo menos um sócio', '<ul><li>Composição: até 3 dias úteis após diagnóstico</li><li>Revisão: até 24h</li><li>Follow-up pós-envio: D+3</li><li>Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)</li><li>Regra: nenhuma proposta sai sem revisão de pelo menos um sócio</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim', '<p>Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Template TBO: modelo padronizado de proposta com identidade visual da agência.

Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.

Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.', '<p>Template TBO: modelo padronizado de proposta com identidade visual da agência.</p><p>Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.</p><p>Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-COM-003: Fechamento e Contratacao ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Fechamento e Contratacao',
    'tbo-com-003-fechamento-e-contratacao',
    'comercial',
    'checklist',
    'Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.',
    'Standard Operating Procedure

Fechamento e Contratação

Código

TBO-COM-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Comercial (Vendas / BD)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.

2. Escopo

2.1 O que está coberto

Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.

2.2 Exclusões

Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Formalizar aceite e alinhar condições finais

Executor

---

Carol (Ops)

Gerar contrato, enviar via ClickSign, confirmar pagamento

Executor

---

Marco

Confirmar recebimento e autorizar início da produção

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.

4.2 Ferramentas e Acessos

ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.

5. Procedimento Passo a Passo

5.1. Aceite Formal

Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.

Responsável: Ruy Lima

Output: Aceite registrado no CRM

Prazo referência: Imediato após confirmação verbal

5.2. Geração do Contrato

Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.

Responsável: Carol (Ops)

Output: Contrato em PDF pronto para assinatura

Prazo referência: Até 2 dias úteis após aceite

5.3. Assinatura Digital

Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).

Responsável: Carol (Ops)

Output: Contrato assinado digitalmente por todas as partes

Prazo referência: Até 5 dias úteis

5.4. Confirmação Financeira e Trigger de Onboarding

Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.

Responsável: Marco + Carol (Ops)

Output: Pagamento confirmado, onboarding iniciado

Prazo referência: Até 48h após assinatura

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Aceite formal documentado (e-mail/mensagem)

[ ] CRM atualizado como Ganho

[ ] Contrato gerado com dados da proposta final

[ ] Assinatura digital concluída por todas as partes

[ ] Contrato armazenado na pasta restrita do Drive

[ ] Primeiro pagamento confirmado

[ ] Onboarding iniciado (SOP-ATD-001)

6.2 Erros Comuns a Evitar

Iniciar produção antes do contrato assinado → risco jurídico e financeiro

Aceite verbal sem documentação → disputa futura sobre escopo

Não confirmar pagamento → entrega sem garantia de recebimento

7. Ferramentas e Templates

ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).

8. SLAs e Prazos

Aceite formal: imediato após confirmação

Contrato gerado: até 2 dias úteis

Assinatura digital: até 5 dias úteis

Confirmação de pagamento: até 48h após assinatura

Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.

9. Fluxograma

Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim

10. Glossário

ClickSign: plataforma de assinatura digital com validade jurídica.

Sinal: primeira parcela paga antes do início da produção.

Trigger: evento que dispara automaticamente o próximo processo.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Fechamento e Contratação</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.</p><p><strong>2.2 Exclusões</strong></p><p>Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Formalizar aceite e alinhar condições finais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Gerar contrato, enviar via ClickSign, confirmar pagamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Confirmar recebimento e autorizar início da produção</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Aceite Formal</strong></p><p>Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.</p><p>Responsável: Ruy Lima</p><p>Output: Aceite registrado no CRM</p><p>Prazo referência: Imediato após confirmação verbal</p><p><strong>5.2. Geração do Contrato</strong></p><p>Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato em PDF pronto para assinatura</p><p>Prazo referência: Até 2 dias úteis após aceite</p><p><strong>5.3. Assinatura Digital</strong></p><p>Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato assinado digitalmente por todas as partes</p><p>Prazo referência: Até 5 dias úteis</p><p><strong>5.4. Confirmação Financeira e Trigger de Onboarding</strong></p><p>Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.</p><p>Responsável: Marco + Carol (Ops)</p><p>Output: Pagamento confirmado, onboarding iniciado</p><p>Prazo referência: Até 48h após assinatura</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Aceite formal documentado (e-mail/mensagem)</li><li>[ ] CRM atualizado como Ganho</li><li>[ ] Contrato gerado com dados da proposta final</li><li>[ ] Assinatura digital concluída por todas as partes</li><li>[ ] Contrato armazenado na pasta restrita do Drive</li><li>[ ] Primeiro pagamento confirmado</li><li>[ ] Onboarding iniciado (SOP-ATD-001)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Iniciar produção antes do contrato assinado → risco jurídico e financeiro</li><li>Aceite verbal sem documentação → disputa futura sobre escopo</li><li>Não confirmar pagamento → entrega sem garantia de recebimento</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Aceite formal: imediato após confirmação</li><li>Contrato gerado: até 2 dias úteis</li><li>Assinatura digital: até 5 dias úteis</li><li>Confirmação de pagamento: até 48h após assinatura</li><li>Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.</li></ul><p><strong>9. Fluxograma</strong></p><p>Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim</p><p><strong>10. Glossário</strong></p><p>ClickSign: plataforma de assinatura digital com validade jurídica.</p><p>Sinal: primeira parcela paga antes do início da produção.</p><p>Trigger: evento que dispara automaticamente o próximo processo.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','cliente','aprovacao']::TEXT[],
    2,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-COM-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.', '<p>Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.', '<p>Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).', '<p>Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Formalizar aceite e alinhar condições finais

Executor

---

Carol (Ops)

Gerar contrato, enviar via ClickSign, confirmar pagamento

Executor

---

Marco

Confirmar recebimento e autorizar início da produção

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Formalizar aceite e alinhar condições finais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Gerar contrato, enviar via ClickSign, confirmar pagamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Confirmar recebimento e autorizar início da produção</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.', '<p>Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.', '<p>ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Aceite Formal', 'Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.

Responsável: Ruy Lima

Output: Aceite registrado no CRM

Prazo referência: Imediato após confirmação verbal', '<p>Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.</p><p>Responsável: Ruy Lima</p><p>Output: Aceite registrado no CRM</p><p>Prazo referência: Imediato após confirmação verbal</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Geração do Contrato', 'Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.

Responsável: Carol (Ops)

Output: Contrato em PDF pronto para assinatura

Prazo referência: Até 2 dias úteis após aceite', '<p>Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato em PDF pronto para assinatura</p><p>Prazo referência: Até 2 dias úteis após aceite</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Assinatura Digital', 'Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).

Responsável: Carol (Ops)

Output: Contrato assinado digitalmente por todas as partes

Prazo referência: Até 5 dias úteis', '<p>Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).</p><p>Responsável: Carol (Ops)</p><p>Output: Contrato assinado digitalmente por todas as partes</p><p>Prazo referência: Até 5 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Confirmação Financeira e Trigger de Onboarding', 'Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.

Responsável: Marco + Carol (Ops)

Output: Pagamento confirmado, onboarding iniciado

Prazo referência: Até 48h após assinatura', '<p>Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.</p><p>Responsável: Marco + Carol (Ops)</p><p>Output: Pagamento confirmado, onboarding iniciado</p><p>Prazo referência: Até 48h após assinatura</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Aceite formal documentado (e-mail/mensagem)

[ ] CRM atualizado como Ganho

[ ] Contrato gerado com dados da proposta final

[ ] Assinatura digital concluída por todas as partes

[ ] Contrato armazenado na pasta restrita do Drive

[ ] Primeiro pagamento confirmado

[ ] Onboarding iniciado (SOP-ATD-001)', '<ul><li>[ ] Aceite formal documentado (e-mail/mensagem)</li><li>[ ] CRM atualizado como Ganho</li><li>[ ] Contrato gerado com dados da proposta final</li><li>[ ] Assinatura digital concluída por todas as partes</li><li>[ ] Contrato armazenado na pasta restrita do Drive</li><li>[ ] Primeiro pagamento confirmado</li><li>[ ] Onboarding iniciado (SOP-ATD-001)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Iniciar produção antes do contrato assinado → risco jurídico e financeiro

Aceite verbal sem documentação → disputa futura sobre escopo

Não confirmar pagamento → entrega sem garantia de recebimento', '<ul><li>Iniciar produção antes do contrato assinado → risco jurídico e financeiro</li><li>Aceite verbal sem documentação → disputa futura sobre escopo</li><li>Não confirmar pagamento → entrega sem garantia de recebimento</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).', '<p>ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite formal: imediato após confirmação

Contrato gerado: até 2 dias úteis

Assinatura digital: até 5 dias úteis

Confirmação de pagamento: até 48h após assinatura

Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.', '<ul><li>Aceite formal: imediato após confirmação</li><li>Contrato gerado: até 2 dias úteis</li><li>Assinatura digital: até 5 dias úteis</li><li>Confirmação de pagamento: até 48h após assinatura</li><li>Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim', '<p>Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'ClickSign: plataforma de assinatura digital com validade jurídica.

Sinal: primeira parcela paga antes do início da produção.

Trigger: evento que dispara automaticamente o próximo processo.', '<p>ClickSign: plataforma de assinatura digital com validade jurídica.</p><p>Sinal: primeira parcela paga antes do início da produção.</p><p>Trigger: evento que dispara automaticamente o próximo processo.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-COM-004: Pipeline e Forecast Comercial ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Pipeline e Forecast Comercial',
    'tbo-com-004-pipeline-e-forecast-comercial',
    'comercial',
    'checklist',
    'Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.',
    'Standard Operating Procedure

Pipeline e Forecast Comercial

Código

TBO-COM-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Comercial (Vendas / BD)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.

2. Escopo

2.1 O que está coberto

Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.

2.2 Exclusões

Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Manter CRM atualizado e gerar forecast

Executor

---

Marco

Revisar pipeline e alinhar capacidade operacional

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.

4.2 Ferramentas e Acessos

RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).

5. Procedimento Passo a Passo

5.1. Atualização Diária do CRM

Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).

Responsável: Ruy Lima

Output: CRM atualizado diariamente

Prazo referência: Contínuo

5.2. Reunião de Pipeline (semanal)

Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.

Responsável: Marco + Ruy

Output: Decisões registradas e pipeline higienizado

Prazo referência: Toda segunda-feira

5.3. Forecast Mensal

Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.

Responsável: Ruy Lima

Output: Forecast mensal compartilhado

Prazo referência: Até dia 5 de cada mês

5.4. Higienização do Pipeline

Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.

Responsável: Ruy Lima

Output: Pipeline refletindo a realidade

Prazo referência: Semanal (na reunião)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todas as oportunidades no estágio correto do funil

[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio

[ ] Reunião semanal de pipeline realizada

[ ] Forecast mensal gerado e compartilhado

6.2 Erros Comuns a Evitar

Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas

Não atualizar CRM diariamente → visibilidade zero do cenário comercial

Forecast sem ponderação → projeção irreal de receita

7. Ferramentas e Templates

RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).

8. SLAs e Prazos

Atualização do CRM: diária

Reunião de pipeline: toda segunda-feira (15 min)

Forecast mensal: até dia 5 de cada mês

Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d

9. Fluxograma

Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim

10. Glossário

Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.

Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.

Pipeline ponderado: valor total × probabilidade de cada oportunidade.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Pipeline e Forecast Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.</p><p><strong>2.2 Exclusões</strong></p><p>Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Manter CRM atualizado e gerar forecast</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Revisar pipeline e alinhar capacidade operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Atualização Diária do CRM</strong></p><p>Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).</p><p>Responsável: Ruy Lima</p><p>Output: CRM atualizado diariamente</p><p>Prazo referência: Contínuo</p><p><strong>5.2. Reunião de Pipeline (semanal)</strong></p><p>Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.</p><p>Responsável: Marco + Ruy</p><p>Output: Decisões registradas e pipeline higienizado</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.3. Forecast Mensal</strong></p><p>Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.</p><p>Responsável: Ruy Lima</p><p>Output: Forecast mensal compartilhado</p><p>Prazo referência: Até dia 5 de cada mês</p><p><strong>5.4. Higienização do Pipeline</strong></p><p>Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.</p><p>Responsável: Ruy Lima</p><p>Output: Pipeline refletindo a realidade</p><p>Prazo referência: Semanal (na reunião)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Todas as oportunidades no estágio correto do funil</li><li>[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio</li><li>[ ] Reunião semanal de pipeline realizada</li><li>[ ] Forecast mensal gerado e compartilhado</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas</li><li>Não atualizar CRM diariamente → visibilidade zero do cenário comercial</li><li>Forecast sem ponderação → projeção irreal de receita</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Atualização do CRM: diária</li><li>Reunião de pipeline: toda segunda-feira (15 min)</li><li>Forecast mensal: até dia 5 de cada mês</li><li>Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d</li></ul><p><strong>9. Fluxograma</strong></p><p>Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim</p><p><strong>10. Glossário</strong></p><p>Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.</p><p>Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.</p><p>Pipeline ponderado: valor total × probabilidade de cada oportunidade.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','aprovacao']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-COM-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.', '<p>Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.', '<p>Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).', '<p>Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Manter CRM atualizado e gerar forecast

Executor

---

Marco

Revisar pipeline e alinhar capacidade operacional

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Manter CRM atualizado e gerar forecast</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Revisar pipeline e alinhar capacidade operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.', '<p>RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).', '<p>RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Atualização Diária do CRM', 'Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).

Responsável: Ruy Lima

Output: CRM atualizado diariamente

Prazo referência: Contínuo', '<p>Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).</p><p>Responsável: Ruy Lima</p><p>Output: CRM atualizado diariamente</p><p>Prazo referência: Contínuo</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Reunião de Pipeline (semanal)', 'Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.

Responsável: Marco + Ruy

Output: Decisões registradas e pipeline higienizado

Prazo referência: Toda segunda-feira', '<p>Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.</p><p>Responsável: Marco + Ruy</p><p>Output: Decisões registradas e pipeline higienizado</p><p>Prazo referência: Toda segunda-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Forecast Mensal', 'Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.

Responsável: Ruy Lima

Output: Forecast mensal compartilhado

Prazo referência: Até dia 5 de cada mês', '<p>Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.</p><p>Responsável: Ruy Lima</p><p>Output: Forecast mensal compartilhado</p><p>Prazo referência: Até dia 5 de cada mês</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Higienização do Pipeline', 'Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.

Responsável: Ruy Lima

Output: Pipeline refletindo a realidade

Prazo referência: Semanal (na reunião)', '<p>Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.</p><p>Responsável: Ruy Lima</p><p>Output: Pipeline refletindo a realidade</p><p>Prazo referência: Semanal (na reunião)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as oportunidades no estágio correto do funil

[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio

[ ] Reunião semanal de pipeline realizada

[ ] Forecast mensal gerado e compartilhado', '<ul><li>[ ] Todas as oportunidades no estágio correto do funil</li><li>[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio</li><li>[ ] Reunião semanal de pipeline realizada</li><li>[ ] Forecast mensal gerado e compartilhado</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas

Não atualizar CRM diariamente → visibilidade zero do cenário comercial

Forecast sem ponderação → projeção irreal de receita', '<ul><li>Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas</li><li>Não atualizar CRM diariamente → visibilidade zero do cenário comercial</li><li>Forecast sem ponderação → projeção irreal de receita</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).', '<p>RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização do CRM: diária

Reunião de pipeline: toda segunda-feira (15 min)

Forecast mensal: até dia 5 de cada mês

Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d', '<ul><li>Atualização do CRM: diária</li><li>Reunião de pipeline: toda segunda-feira (15 min)</li><li>Forecast mensal: até dia 5 de cada mês</li><li>Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim', '<p>Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.

Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.

Pipeline ponderado: valor total × probabilidade de cada oportunidade.', '<p>Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.</p><p>Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.</p><p>Pipeline ponderado: valor total × probabilidade de cada oportunidade.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-FIN-001: Contas a Receber e Faturamento ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Contas a Receber e Faturamento',
    'tbo-fin-001-contas-a-receber-e-faturamento',
    'financeiro',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Contas a Receber e Faturamento

Código

TBO-FIN-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Financeiro (Controladoria)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.

2. Escopo

2.1 O que está coberto

Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.

2.2 Exclusões

Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência

Executor

---

Marco

Validar valores, executar pagamentos, conciliar banco

Aprovador

---

Ruy

Contato direto em inadimplência D+15

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.

4.2 Ferramentas e Acessos

Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.

5. Procedimento Passo a Passo

5.1. Emissão de NF

Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.

Responsável: Carol (Ops) + Marco

Output: NF emitida no Omie

Prazo referência: 3 dias antes do vencimento

5.2. Envio ao Cliente

Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.

Responsável: Carol (Ops)

Output: NF enviada

Prazo referência: No dia da emissão

5.3. Conciliação Bancária

Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.

Responsável: Marco

Output: Conciliação registrada

Prazo referência: Toda sexta-feira

5.4. Cobrança de Inadimplência

Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).

Responsável: Carol → Marco/Ruy

Output: Inadimplência resolvida ou medida aplicada

Prazo referência: Escalonamento conforme dias de atraso

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] NF emitida com antecedência de 3 dias

[ ] NF enviada ao cliente no dia da emissão

[ ] Conciliação bancária semanal realizada

[ ] Inadimplências tratadas conforme SLA

[ ] Nenhuma entrega final com parcela atrasada > 15 dias

6.2 Erros Comuns a Evitar

Emitir NF com valor errado → retrabalho fiscal e desconfiança

Não conciliar semanalmente → perda de controle do fluxo de caixa

Entregar projeto final com parcelas em atraso → perda de leverage

7. Ferramentas e Templates

Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.

8. SLAs e Prazos

Emissão de NF: 3 dias antes do vencimento

Conciliação: toda sexta-feira

Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)

Regra: nenhuma entrega final com parcela atrasada > 15 dias sem autorização dos sócios

9. Fluxograma

Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim

10. Glossário

NF: Nota Fiscal de serviço emitida via Omie.

Conciliação bancária: cruzamento entre registros internos e extrato bancário.

Centro de custo: classificação da receita por projeto/cliente.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Contas a Receber e Faturamento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-FIN-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Financeiro (Controladoria)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.</p><p><strong>2.2 Exclusões</strong></p><p>Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar valores, executar pagamentos, conciliar banco</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Contato direto em inadimplência D+15</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Emissão de NF</strong></p><p>Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: NF emitida no Omie</p><p>Prazo referência: 3 dias antes do vencimento</p><p><strong>5.2. Envio ao Cliente</strong></p><p>Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.</p><p>Responsável: Carol (Ops)</p><p>Output: NF enviada</p><p>Prazo referência: No dia da emissão</p><p><strong>5.3. Conciliação Bancária</strong></p><p>Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.</p><p>Responsável: Marco</p><p>Output: Conciliação registrada</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.4. Cobrança de Inadimplência</strong></p><p>Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).</p><p>Responsável: Carol → Marco/Ruy</p><p>Output: Inadimplência resolvida ou medida aplicada</p><p>Prazo referência: Escalonamento conforme dias de atraso</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] NF emitida com antecedência de 3 dias</li><li>[ ] NF enviada ao cliente no dia da emissão</li><li>[ ] Conciliação bancária semanal realizada</li><li>[ ] Inadimplências tratadas conforme SLA</li><li>[ ] Nenhuma entrega final com parcela atrasada &gt; 15 dias</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Emitir NF com valor errado → retrabalho fiscal e desconfiança</li><li>Não conciliar semanalmente → perda de controle do fluxo de caixa</li><li>Entregar projeto final com parcelas em atraso → perda de leverage</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Emissão de NF: 3 dias antes do vencimento</li><li>Conciliação: toda sexta-feira</li><li>Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)</li><li>Regra: nenhuma entrega final com parcela atrasada &gt; 15 dias sem autorização dos sócios</li></ul><p><strong>9. Fluxograma</strong></p><p>Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim</p><p><strong>10. Glossário</strong></p><p>NF: Nota Fiscal de serviço emitida via Omie.</p><p>Conciliação bancária: cruzamento entre registros internos e extrato bancário.</p><p>Centro de custo: classificação da receita por projeto/cliente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['financeiro','fiscal','entrega','qualidade','cliente']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-FIN-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.', '<p>Garantir que todo projeto contratado gere faturamento pontual, que inadimplências sejam tratadas proativamente e que a receita realizada esteja rastreada no TBO OS e Omie.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.', '<p>Emissão de NF via Omie, envio ao cliente, conciliação bancária semanal, cobrança de inadimplência (D+1 a D+30) e bloqueio de entregas.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).', '<p>Precificação de propostas (SOP-OPS-006), gestão de contas a pagar (SOP-FIN-002), fluxo de caixa projetado (SOP-FIN-003).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência

Executor

---

Marco

Validar valores, executar pagamentos, conciliar banco

Aprovador

---

Ruy

Contato direto em inadimplência D+15

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Solicitar emissão de NF, enviar ao cliente, cobrar inadimplência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Validar valores, executar pagamentos, conciliar banco</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Contato direto em inadimplência D+15</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.', '<p>Contrato assinado com cronograma de pagamento; Omie ERP configurado com dados fiscais; extrato BB Empresarial.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.', '<p>Omie ERP (NFs), TBO OS (módulo financeiro), BB Empresarial (conciliação), E-mail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Emissão de NF', 'Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.

Responsável: Carol (Ops) + Marco

Output: NF emitida no Omie

Prazo referência: 3 dias antes do vencimento', '<p>Ação: Carol solicita emissão no Omie com 3 dias úteis de antecedência do vencimento. Marco valida valores e centro de custo antes da emissão.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: NF emitida no Omie</p><p>Prazo referência: 3 dias antes do vencimento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Envio ao Cliente', 'Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.

Responsável: Carol (Ops)

Output: NF enviada

Prazo referência: No dia da emissão', '<p>Ação: NF enviada por e-mail com boleto/dados bancários. Clientes recorrentes recebem envio automático via Omie.</p><p>Responsável: Carol (Ops)</p><p>Output: NF enviada</p><p>Prazo referência: No dia da emissão</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Conciliação Bancária', 'Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.

Responsável: Marco

Output: Conciliação registrada

Prazo referência: Toda sexta-feira', '<p>Ação: Marco faz conciliação semanal (sexta-feira) via extrato BB. Registra no TBO OS: Faturado, Pago, Atrasado.</p><p>Responsável: Marco</p><p>Output: Conciliação registrada</p><p>Prazo referência: Toda sexta-feira</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Cobrança de Inadimplência', 'Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).

Responsável: Carol → Marco/Ruy

Output: Inadimplência resolvida ou medida aplicada

Prazo referência: Escalonamento conforme dias de atraso', '<p>Ação: D+1: lembrete automático por e-mail. D+5: Carol contata por WhatsApp/telefone. D+15: Marco ou Ruy fazem contato direto. D+30: avaliação de medidas (suspensão de entregas, negociação, assessoria jurídica).</p><p>Responsável: Carol → Marco/Ruy</p><p>Output: Inadimplência resolvida ou medida aplicada</p><p>Prazo referência: Escalonamento conforme dias de atraso</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] NF emitida com antecedência de 3 dias

[ ] NF enviada ao cliente no dia da emissão

[ ] Conciliação bancária semanal realizada

[ ] Inadimplências tratadas conforme SLA

[ ] Nenhuma entrega final com parcela atrasada > 15 dias', '<ul><li>[ ] NF emitida com antecedência de 3 dias</li><li>[ ] NF enviada ao cliente no dia da emissão</li><li>[ ] Conciliação bancária semanal realizada</li><li>[ ] Inadimplências tratadas conforme SLA</li><li>[ ] Nenhuma entrega final com parcela atrasada &gt; 15 dias</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Emitir NF com valor errado → retrabalho fiscal e desconfiança

Não conciliar semanalmente → perda de controle do fluxo de caixa

Entregar projeto final com parcelas em atraso → perda de leverage', '<ul><li>Emitir NF com valor errado → retrabalho fiscal e desconfiança</li><li>Não conciliar semanalmente → perda de controle do fluxo de caixa</li><li>Entregar projeto final com parcelas em atraso → perda de leverage</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.', '<p>Omie ERP, TBO OS (financeiro), BB Empresarial, E-mail, WhatsApp Business.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Emissão de NF: 3 dias antes do vencimento

Conciliação: toda sexta-feira

Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)

Regra: nenhuma entrega final com parcela atrasada > 15 dias sem autorização dos sócios', '<ul><li>Emissão de NF: 3 dias antes do vencimento</li><li>Conciliação: toda sexta-feira</li><li>Cobrança: D+1 (auto), D+5 (Carol), D+15 (sócio), D+30 (medida formal)</li><li>Regra: nenhuma entrega final com parcela atrasada &gt; 15 dias sem autorização dos sócios</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim', '<p>Vencimento se Aproxima → Emissão de NF (D-3) → Envio ao Cliente → Conciliação Semanal → Pago? → Sim: Registro no TBO OS → Fim / Não: Cobrança Escalonada (D+1→D+5→D+15→D+30) → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'NF: Nota Fiscal de serviço emitida via Omie.

Conciliação bancária: cruzamento entre registros internos e extrato bancário.

Centro de custo: classificação da receita por projeto/cliente.', '<p>NF: Nota Fiscal de serviço emitida via Omie.</p><p>Conciliação bancária: cruzamento entre registros internos e extrato bancário.</p><p>Centro de custo: classificação da receita por projeto/cliente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-FIN-002: Contas a Pagar e Controle de Despesas ──
END $$;