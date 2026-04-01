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
END $$;