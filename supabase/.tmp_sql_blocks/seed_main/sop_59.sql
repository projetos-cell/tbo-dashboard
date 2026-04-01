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
    'Gestao de Reclamacoes e Feedbacks',
    'tbo-atd-003-gestao-de-reclamacoes-e-feedbacks',
    'atendimento',
    'checklist',
    'Gestão de Reclamações e Feedbacks',
    'Standard Operating Procedure

Gestão de Reclamações e Feedbacks

Código

TBO-ATD-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Atendimento (Customer Success)

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



1. Objetivo

Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.

2. Escopo

2.1 O que está coberto

Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.

2.2 Exclusões

Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar, classificar e coordenar resolução

Executor

---

PO da BU

Investigar causa e propor solução técnica

Consultor

---

Marco

Tratar reclamações Nível 2 e participar de Nível 3

Aprovador

---

Ruy

Tratar reclamações Nível 3 (relacional)

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.

4.2 Ferramentas e Acessos

TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.

5. Procedimento Passo a Passo

5.1. Registro da Reclamação

Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.

Responsável: Carol (Ops)

Output: Reclamação registrada com classificação

Prazo referência: Até 2h após recebimento

5.2. Classificação por Nível

Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.

Responsável: Carol (Ops)

Output: Nível classificado e responsável notificado

Prazo referência: Imediato após registro

5.3. Resposta Inicial ao Cliente

Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.

Responsável: Carol (Ops)

Output: Resposta de acknowledgement enviada

Prazo referência: Até 4h úteis

5.4. Resolução

Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.

Responsável: Conforme nível

Output: Reclamação resolvida e registrada

Prazo referência: Conforme SLA por nível

5.5. Análise de Padrões (semanal)

Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.

Responsável: Carol (Ops) + Marco

Output: Ações preventivas definidas quando aplicável

Prazo referência: Reunião semanal interna

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Reclamação registrada no TBO OS com todos os campos

[ ] Nível classificado corretamente

[ ] Resposta de acknowledgement enviada dentro de 4h úteis

[ ] Resolução concluída dentro do SLA do nível

[ ] Análise semanal realizada com identificação de padrões

6.2 Erros Comuns a Evitar

Não registrar reclamação → problema se repete e ninguém percebe o padrão

Demorar mais de 4h para responder → cliente sente que foi ignorado

Resolver sem registrar → aprendizado perdido, erro se repete

7. Ferramentas e Templates

TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).

8. SLAs e Prazos

Registro: até 2h após recebimento

Acknowledgement ao cliente: até 4h úteis

Resolução Nível 1: até 24h úteis

Resolução Nível 2: proposta em até 48h úteis

Resolução Nível 3: reunião com sócios em até 48h úteis

Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado

9. Fluxograma

Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim

10. Glossário

Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.

Nível 1: reclamação operacional de resolução rápida e baixo impacto.

Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.

Nível 3: reclamação relacional que ameaça a continuidade da parceria.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Reclamações e Feedbacks</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.</p><p><strong>2.2 Exclusões</strong></p><p>Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Registrar, classificar e coordenar resolução</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Investigar causa e propor solução técnica</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Tratar reclamações Nível 2 e participar de Nível 3</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Tratar reclamações Nível 3 (relacional)</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Registro da Reclamação</strong></p><p>Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.</p><p>Responsável: Carol (Ops)</p><p>Output: Reclamação registrada com classificação</p><p>Prazo referência: Até 2h após recebimento</p><p><strong>5.2. Classificação por Nível</strong></p><p>Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.</p><p>Responsável: Carol (Ops)</p><p>Output: Nível classificado e responsável notificado</p><p>Prazo referência: Imediato após registro</p><p><strong>5.3. Resposta Inicial ao Cliente</strong></p><p>Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.</p><p>Responsável: Carol (Ops)</p><p>Output: Resposta de acknowledgement enviada</p><p>Prazo referência: Até 4h úteis</p><p><strong>5.4. Resolução</strong></p><p>Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.</p><p>Responsável: Conforme nível</p><p>Output: Reclamação resolvida e registrada</p><p>Prazo referência: Conforme SLA por nível</p><p><strong>5.5. Análise de Padrões (semanal)</strong></p><p>Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Ações preventivas definidas quando aplicável</p><p>Prazo referência: Reunião semanal interna</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Reclamação registrada no TBO OS com todos os campos</li><li>[ ] Nível classificado corretamente</li><li>[ ] Resposta de acknowledgement enviada dentro de 4h úteis</li><li>[ ] Resolução concluída dentro do SLA do nível</li><li>[ ] Análise semanal realizada com identificação de padrões</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Não registrar reclamação → problema se repete e ninguém percebe o padrão</li><li>Demorar mais de 4h para responder → cliente sente que foi ignorado</li><li>Resolver sem registrar → aprendizado perdido, erro se repete</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Registro: até 2h após recebimento</li><li>Acknowledgement ao cliente: até 4h úteis</li><li>Resolução Nível 1: até 24h úteis</li><li>Resolução Nível 2: proposta em até 48h úteis</li><li>Resolução Nível 3: reunião com sócios em até 48h úteis</li><li>Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado</li></ul><p><strong>9. Fluxograma</strong></p><p>Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim</p><p><strong>10. Glossário</strong></p><p>Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.</p><p>Nível 1: reclamação operacional de resolução rápida e baixo impacto.</p><p>Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.</p><p>Nível 3: reclamação relacional que ameaça a continuidade da parceria.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade','aprovacao']::TEXT[],
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

  -- Steps for TBO-ATD-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.', '<p>Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.', '<p>Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).', '<p>Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Registrar, classificar e coordenar resolução

Executor

---

PO da BU

Investigar causa e propor solução técnica

Consultor

---

Marco

Tratar reclamações Nível 2 e participar de Nível 3

Aprovador

---

Ruy

Tratar reclamações Nível 3 (relacional)

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Registrar, classificar e coordenar resolução</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Investigar causa e propor solução técnica</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Tratar reclamações Nível 2 e participar de Nível 3</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Tratar reclamações Nível 3 (relacional)</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.', '<p>Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.', '<p>TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Registro da Reclamação', 'Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.

Responsável: Carol (Ops)

Output: Reclamação registrada com classificação

Prazo referência: Até 2h após recebimento', '<p>Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.</p><p>Responsável: Carol (Ops)</p><p>Output: Reclamação registrada com classificação</p><p>Prazo referência: Até 2h após recebimento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Classificação por Nível', 'Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.

Responsável: Carol (Ops)

Output: Nível classificado e responsável notificado

Prazo referência: Imediato após registro', '<p>Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.</p><p>Responsável: Carol (Ops)</p><p>Output: Nível classificado e responsável notificado</p><p>Prazo referência: Imediato após registro</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Resposta Inicial ao Cliente', 'Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.

Responsável: Carol (Ops)

Output: Resposta de acknowledgement enviada

Prazo referência: Até 4h úteis', '<p>Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.</p><p>Responsável: Carol (Ops)</p><p>Output: Resposta de acknowledgement enviada</p><p>Prazo referência: Até 4h úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Resolução', 'Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.

Responsável: Conforme nível

Output: Reclamação resolvida e registrada

Prazo referência: Conforme SLA por nível', '<p>Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.</p><p>Responsável: Conforme nível</p><p>Output: Reclamação resolvida e registrada</p><p>Prazo referência: Conforme SLA por nível</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Análise de Padrões (semanal)', 'Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.

Responsável: Carol (Ops) + Marco

Output: Ações preventivas definidas quando aplicável

Prazo referência: Reunião semanal interna', '<p>Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.</p><p>Responsável: Carol (Ops) + Marco</p><p>Output: Ações preventivas definidas quando aplicável</p><p>Prazo referência: Reunião semanal interna</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Reclamação registrada no TBO OS com todos os campos

[ ] Nível classificado corretamente

[ ] Resposta de acknowledgement enviada dentro de 4h úteis

[ ] Resolução concluída dentro do SLA do nível

[ ] Análise semanal realizada com identificação de padrões', '<ul><li>[ ] Reclamação registrada no TBO OS com todos os campos</li><li>[ ] Nível classificado corretamente</li><li>[ ] Resposta de acknowledgement enviada dentro de 4h úteis</li><li>[ ] Resolução concluída dentro do SLA do nível</li><li>[ ] Análise semanal realizada com identificação de padrões</li></ul>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Não registrar reclamação → problema se repete e ninguém percebe o padrão

Demorar mais de 4h para responder → cliente sente que foi ignorado

Resolver sem registrar → aprendizado perdido, erro se repete', '<ul><li>Não registrar reclamação → problema se repete e ninguém percebe o padrão</li><li>Demorar mais de 4h para responder → cliente sente que foi ignorado</li><li>Resolver sem registrar → aprendizado perdido, erro se repete</li></ul>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).', '<p>TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Registro: até 2h após recebimento

Acknowledgement ao cliente: até 4h úteis

Resolução Nível 1: até 24h úteis

Resolução Nível 2: proposta em até 48h úteis

Resolução Nível 3: reunião com sócios em até 48h úteis

Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado', '<ul><li>Registro: até 2h após recebimento</li><li>Acknowledgement ao cliente: até 4h úteis</li><li>Resolução Nível 1: até 24h úteis</li><li>Resolução Nível 2: proposta em até 48h úteis</li><li>Resolução Nível 3: reunião com sócios em até 48h úteis</li><li>Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado</li></ul>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim', '<p>Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.

Nível 1: reclamação operacional de resolução rápida e baixo impacto.

Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.

Nível 3: reclamação relacional que ameaça a continuidade da parceria.', '<p>Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.</p><p>Nível 1: reclamação operacional de resolução rápida e baixo impacto.</p><p>Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.</p><p>Nível 3: reclamação relacional que ameaça a continuidade da parceria.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-ATD-004: Handoff entre BUs ──
END $$;