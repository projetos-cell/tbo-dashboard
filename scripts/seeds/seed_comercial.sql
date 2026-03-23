-- Seed: comercial (4 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-COM-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Prospeccao e Qualificacao de Leads', 'tbo-com-001-prospeccao-e-qualificacao-de-leads', 'comercial', 'checklist', 'Prospecção e Qualificação de Leads', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['comercial','vendas']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de geração e qualificação de leads para garantir que a TBO invista tempo comercial apenas em oportunidades com real fit de perfil, orçamento e timing de lançamento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Fontes de lead (inbound, outbound, networking), critérios de qualificação BANT-R, reunião de diagnóstico e registro no CRM.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Elaboração de proposta (SOP-COM-002), contratação (SOP-COM-003), gestão de pipeline (SOP-COM-004), produção de lead magnets (SOP-MKT).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Lead magnets ativos no LinkedIn; perfil de cliente ideal (ICP) definido; RD Station CRM configurado com funil de vendas; calendário de eventos do setor.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station CRM, LinkedIn (perfis da TBO e dos sócios), Google Meet, E-mail corporativo.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Captura de Lead', 'Ação: Todo lead é registrado no RD Station CRM com fonte, data, dados de contato e observações iniciais. Leads de lead magnets do LinkedIn são importados automaticamente via automação.

Responsável: Ruy Lima / Rafa (inbound)

Output: Lead registrado no CRM com fonte identificada

Prazo referência: Até 24h após primeiro contato', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Qualificação BANT-R', 'Ação: Ruy aplica os critérios: Budget (orçamento compatível com fee mínimo TBO), Authority (decisor ou influenciador direto), Need (lançamento previsto, reposicionamento ou insatisfação), Timing (lançamento em 3–12 meses), Region (praça atendível). Resultado: Lead Qualificado ou Lead Frio (nurturing).

Responsável: Ruy Lima

Output: Lead classificado no CRM

Prazo referência: Até 48h após captura', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Reunião de Diagnóstico', 'Ação: Para leads qualificados, Ruy agenda call de diagnóstico (30–45 min) com pauta padronizada: empreendimento, cronograma, orçamento, expectativas, concorrência, fornecedores atuais.

Responsável: Ruy Lima

Output: Diagnóstico registrado no CRM com resumo e próximo passo

Prazo referência: Até 5 dias úteis após qualificação', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Decisão de Próximo Passo', 'Ação: Ruy define: elaborar proposta, agendar follow-up ou descartar. Para propostas acima de R$ 50.000, alinha escopo com Marco antes de prosseguir.

Responsável: Ruy Lima

Output: Próximo passo definido e registrado

Prazo referência: Imediato após diagnóstico', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Lead registrado no CRM com todos os campos preenchidos

[ ] Critérios BANT-R aplicados e documentados

[ ] Diagnóstico realizado com pauta padronizada

[ ] Resumo da conversa registrado no CRM

[ ] Próximo passo definido (proposta / follow-up / descarte)', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Elaborar proposta sem diagnóstico → proposta genérica que não conecta com a dor do cliente

Não registrar no CRM → lead perdido, sem rastreabilidade

Qualificar sem critério → tempo gasto com leads sem fit real', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station CRM (gestão de leads e funil), LinkedIn (prospecção outbound), Google Meet (diagnóstico), E-mail (follow-up), TBO Email Studio (nurturing de leads frios).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Registro de lead: até 24h após primeiro contato

Qualificação BANT-R: até 48h após captura

Diagnóstico agendado: até 5 dias úteis após qualificação

Regra: nenhuma proposta é elaborada sem diagnóstico prévio', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Lead Capturado → Registro no CRM → Qualificação BANT-R → Qualificado? → Sim: Diagnóstico (30–45min) → Proposta / Follow-up / Descarte → Fim / Não: Nurturing via E-mail → Requalificação em 60 dias → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'BANT-R: framework de qualificação — Budget, Authority, Need, Timing, Region.

ICP: Ideal Customer Profile — perfil de cliente ideal da TBO (incorporadoras mid-to-high-end).

Nurturing: nutrição de leads frios com conteúdo até estarem prontos para abordagem comercial.

Diagnóstico: reunião exploratória para entender necessidades e contexto do potencial cliente.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-COM-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Elaboracao e Envio de Proposta Comercial', 'tbo-com-002-elaboracao-e-envio-de-proposta-comercial', 'comercial', 'checklist', 'Elaboração e Envio de Proposta Comercial', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['comercial','vendas']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar a elaboração de propostas comerciais, garantindo consistência na apresentação, precificação e termos, com revisão obrigatória dos sócios antes do envio.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Composição da proposta (template padrão TBO), revisão de sócios, envio, versionamento e negociação.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Diagnóstico comercial (SOP-COM-001), contratação pós-aceite (SOP-COM-003), precificação unitária de serviços (SOP-OPS-006).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Diagnóstico concluído (SOP-COM-001); tabela de preços atualizada; template de proposta TBO (papel timbrado, Plus Jakarta Sans); capacidade operacional validada.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive (template e versionamento), TBO OS, RD Station CRM, E-mail corporativo.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Composição da Proposta', 'Ação: Ruy monta a proposta com base no diagnóstico, seguindo template padrão: capa TBO, contexto/diagnóstico do empreendimento, escopo detalhado por BU com entregáveis, cronograma macro, investimento (valores por BU ou pacote, condições de pagamento), termos e condições.

Responsável: Ruy Lima

Output: Proposta em PDF no template TBO

Prazo referência: Até 3 dias úteis após diagnóstico', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Revisão dos Sócios', 'Ação: Marco valida escopo criativo/operacional e cronograma. Ruy valida estratégia e precificação. Para propostas acima de R$ 50.000, ambos revisam em conjunto.

Responsável: Marco + Ruy

Output: Proposta aprovada para envio

Prazo referência: Até 24h após composição', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Envio ao Cliente', 'Ação: Proposta enviada por e-mail com PDF anexo. Status atualizado no RD Station CRM para Proposta Enviada. Follow-up agendado para D+3.

Responsável: Ruy Lima

Output: Proposta enviada e CRM atualizado

Prazo referência: No mesmo dia da aprovação', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Negociação e Versionamento', 'Ação: Ruy conduz a negociação. Alterações de escopo ou preço geram nova versão (v2, v3). Desconto acima de 10% requer aprovação conjunta dos sócios. Versão final salva no Drive.

Responsável: Ruy Lima

Output: Versão final aceita ou oportunidade perdida

Prazo referência: Até 15 dias úteis (prazo máximo de negociação)', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Proposta no template padrão TBO com todas as seções

[ ] Escopo detalhado por BU com entregáveis claros

[ ] Revisão de pelo menos um sócio realizada

[ ] PDF enviado e status atualizado no CRM

[ ] Versão final salva no Google Drive', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar proposta sem revisão de sócio → risco de escopo sub ou superdimensionado

Não versionar alterações → confusão sobre o que foi acordado

Desconto sem aprovação → margem comprometida sem decisão informada', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive (template, versionamento), RD Station CRM (funil), E-mail (envio), TBO OS (referência de capacidade).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Composição: até 3 dias úteis após diagnóstico

Revisão: até 24h

Follow-up pós-envio: D+3

Prazo máximo de negociação: 15 dias úteis (após, reclassificar no pipeline)

Regra: nenhuma proposta sai sem revisão de pelo menos um sócio', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Diagnóstico Concluído → Composição da Proposta (template TBO) → Revisão Marco/Ruy → Aprovada? → Sim: Envio ao Cliente → Follow-up D+3 → Negociação → Aceita? → SOP-COM-003 / Não: Registro como Perdida → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Template TBO: modelo padronizado de proposta com identidade visual da agência.

Versionamento: controle de alterações (v1, v2, v3) para rastreabilidade.

Fee mínimo: valor mínimo por projeto que viabiliza a operação da TBO.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-COM-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Fechamento e Contratacao', 'tbo-com-003-fechamento-e-contratacao', 'comercial', 'checklist', 'Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['comercial','vendas']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar a transição de proposta aceita para contrato assinado, garantindo que todas as condições estejam formalizadas e o pagamento confirmado antes do início da produção.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Aceite formal, geração de contrato, assinatura via ClickSign, confirmação de pagamento e trigger de onboarding.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação (SOP-COM-002), onboarding de cliente (SOP-ATD-001), faturamento recorrente (SOP-FIN-001).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Proposta aceita formalmente (e-mail ou mensagem escrita); versão final da proposta no Drive; template de contrato jurídico TBO atualizado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'ClickSign (assinatura digital), Google Drive (contrato), TBO OS (módulo financeiro), Banco do Brasil Empresarial.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Aceite Formal', 'Ação: Ruy obtém aceite por escrito (e-mail ou mensagem) do decisor do cliente. Registra no RD Station CRM como Ganho.

Responsável: Ruy Lima

Output: Aceite registrado no CRM

Prazo referência: Imediato após confirmação verbal', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Geração do Contrato', 'Ação: Carol gera contrato com base no template jurídico TBO, inserindo dados específicos: escopo conforme proposta final, valores, condições de pagamento, prazos, cláusulas de revisão e cancelamento.

Responsável: Carol (Ops)

Output: Contrato em PDF pronto para assinatura

Prazo referência: Até 2 dias úteis após aceite', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Assinatura Digital', 'Ação: Contrato enviado via ClickSign para assinatura do cliente e dos sócios da TBO. Documento assinado armazenado no Drive (pasta restrita).

Responsável: Carol (Ops)

Output: Contrato assinado digitalmente por todas as partes

Prazo referência: Até 5 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Confirmação Financeira e Trigger de Onboarding', 'Ação: Marco confirma recebimento do sinal ou primeira parcela via extrato BB Empresarial. Registro no TBO OS (módulo financeiro). Com contrato assinado e pagamento confirmado, Carol inicia SOP-ATD-001.

Responsável: Marco + Carol (Ops)

Output: Pagamento confirmado, onboarding iniciado

Prazo referência: Até 48h após assinatura', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Aceite formal documentado (e-mail/mensagem)

[ ] CRM atualizado como Ganho

[ ] Contrato gerado com dados da proposta final

[ ] Assinatura digital concluída por todas as partes

[ ] Contrato armazenado na pasta restrita do Drive

[ ] Primeiro pagamento confirmado

[ ] Onboarding iniciado (SOP-ATD-001)', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Iniciar produção antes do contrato assinado → risco jurídico e financeiro

Aceite verbal sem documentação → disputa futura sobre escopo

Não confirmar pagamento → entrega sem garantia de recebimento', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'ClickSign (assinatura digital), RD Station CRM (funil), Google Drive (armazenamento), TBO OS (financeiro), BB Empresarial (conciliação).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite formal: imediato após confirmação

Contrato gerado: até 2 dias úteis

Assinatura digital: até 5 dias úteis

Confirmação de pagamento: até 48h após assinatura

Regra: nenhuma produção inicia sem contrato + pagamento. Exceções requerem aprovação escrita de ambos os sócios.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Proposta Aceita → Aceite Formal Documentado → Carol Gera Contrato → ClickSign (assinatura) → Pagamento Confirmado? → Sim: Trigger SOP-ATD-001 (Onboarding) → Fim / Não: Follow-up de Cobrança → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'ClickSign: plataforma de assinatura digital com validade jurídica.

Sinal: primeira parcela paga antes do início da produção.

Trigger: evento que dispara automaticamente o próximo processo.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-COM-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Pipeline e Forecast Comercial', 'tbo-com-004-pipeline-e-forecast-comercial', 'comercial', 'checklist', 'Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['comercial','vendas']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Atualização Diária do CRM', 'Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).

Responsável: Ruy Lima

Output: CRM atualizado diariamente

Prazo referência: Contínuo', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Reunião de Pipeline (semanal)', 'Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.

Responsável: Marco + Ruy

Output: Decisões registradas e pipeline higienizado

Prazo referência: Toda segunda-feira', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Forecast Mensal', 'Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.

Responsável: Ruy Lima

Output: Forecast mensal compartilhado

Prazo referência: Até dia 5 de cada mês', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Higienização do Pipeline', 'Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.

Responsável: Ruy Lima

Output: Pipeline refletindo a realidade

Prazo referência: Semanal (na reunião)', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as oportunidades no estágio correto do funil

[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio

[ ] Reunião semanal de pipeline realizada

[ ] Forecast mensal gerado e compartilhado', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas

Não atualizar CRM diariamente → visibilidade zero do cenário comercial

Forecast sem ponderação → projeção irreal de receita', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização do CRM: diária

Reunião de pipeline: toda segunda-feira (15 min)

Forecast mensal: até dia 5 de cada mês

Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.

Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.

Pipeline ponderado: valor total × probabilidade de cada oportunidade.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

END $$;
