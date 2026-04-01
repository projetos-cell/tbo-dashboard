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
    'Rituais de Acompanhamento de Projeto',
    'tbo-atd-002-rituais-de-acompanhamento-de-projeto',
    'atendimento',
    'checklist',
    'Rituais de Acompanhamento de Projeto',
    'Standard Operating Procedure

Rituais de Acompanhamento de Projeto

Código

TBO-ATD-002

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

Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.

2. Escopo

2.1 O que está coberto

Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.

2.2 Exclusões

Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Preparar e enviar status, agendar calls, consolidar andamento

Executor

---

POs de BU

Atualizar status de tarefas no TBO OS

Consultor

---

Marco/Ruy

Intervir em escalonamentos e validar comunicações estratégicas

Aprovador

---

Cliente

Receber status e responder pendências

Informado

---



4. Pré-requisitos

4.1 Inputs necessários

Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.

4.2 Ferramentas e Acessos

TBO OS, Google Meet, Google Calendar, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Preparação do Status Semanal (toda segunda-feira)

Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.

Responsável: Carol (Ops)

Output: E-mail de status preparado

Prazo referência: Toda segunda-feira até 12h

5.2. Envio e Registro

Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).

Responsável: Carol (Ops)

Output: Status enviado e registrado

Prazo referência: Segunda-feira até 14h

5.3. Call Quinzenal (projetos de escopo grande)

Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.

Responsável: Carol (Ops) + PO da BU principal

Output: Ata de call registrada no TBO OS

Prazo referência: Quinzenal, conforme agenda

5.4. Escalonamento de Pendências

Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.

Responsável: Carol (Ops) → Marco/Ruy

Output: Pendência resolvida ou prazo renegociado

Prazo referência: Até 48h após escalonamento

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] E-mail de status enviado toda segunda-feira

[ ] Call quinzenal realizada (projetos de escopo grande)

[ ] Pendências do cliente rastreadas com datas de follow-up

[ ] Escalonamentos registrados no TBO OS

[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação

6.2 Erros Comuns a Evitar

Enviar status sem conferir com POs → informação incorreta destrói credibilidade

Não escalonar pendência a tempo → atraso silencioso que estoura no deadline

Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar

7. Ferramentas e Templates

TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).

8. SLAs e Prazos

Status semanal: toda segunda-feira até 14h

Resposta a pendência do cliente: até 4h úteis (acknowledgement)

Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)

Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal

9. Fluxograma

Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim

10. Glossário

Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.

Escalonamento: transferência de uma pendência para nível hierárquico superior.

Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Rituais de Acompanhamento de Projeto</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.</p><p><strong>2.2 Exclusões</strong></p><p>Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Preparar e enviar status, agendar calls, consolidar andamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Atualizar status de tarefas no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco/Ruy</strong></p></td><td><p>Intervir em escalonamentos e validar comunicações estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Receber status e responder pendências</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Meet, Google Calendar, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Preparação do Status Semanal (toda segunda-feira)</strong></p><p>Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de status preparado</p><p>Prazo referência: Toda segunda-feira até 12h</p><p><strong>5.2. Envio e Registro</strong></p><p>Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).</p><p>Responsável: Carol (Ops)</p><p>Output: Status enviado e registrado</p><p>Prazo referência: Segunda-feira até 14h</p><p><strong>5.3. Call Quinzenal (projetos de escopo grande)</strong></p><p>Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.</p><p>Responsável: Carol (Ops) + PO da BU principal</p><p>Output: Ata de call registrada no TBO OS</p><p>Prazo referência: Quinzenal, conforme agenda</p><p><strong>5.4. Escalonamento de Pendências</strong></p><p>Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.</p><p>Responsável: Carol (Ops) → Marco/Ruy</p><p>Output: Pendência resolvida ou prazo renegociado</p><p>Prazo referência: Até 48h após escalonamento</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] E-mail de status enviado toda segunda-feira</li><li>[ ] Call quinzenal realizada (projetos de escopo grande)</li><li>[ ] Pendências do cliente rastreadas com datas de follow-up</li><li>[ ] Escalonamentos registrados no TBO OS</li><li>[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Enviar status sem conferir com POs → informação incorreta destrói credibilidade</li><li>Não escalonar pendência a tempo → atraso silencioso que estoura no deadline</li><li>Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Status semanal: toda segunda-feira até 14h</li><li>Resposta a pendência do cliente: até 4h úteis (acknowledgement)</li><li>Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)</li><li>Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal</li></ul><p><strong>9. Fluxograma</strong></p><p>Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim</p><p><strong>10. Glossário</strong></p><p>Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.</p><p>Escalonamento: transferência de uma pendência para nível hierárquico superior.</p><p>Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade']::TEXT[],
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

  -- Steps for TBO-ATD-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.', '<p>Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.', '<p>Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).', '<p>Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Preparar e enviar status, agendar calls, consolidar andamento

Executor

---

POs de BU

Atualizar status de tarefas no TBO OS

Consultor

---

Marco/Ruy

Intervir em escalonamentos e validar comunicações estratégicas

Aprovador

---

Cliente

Receber status e responder pendências

Informado

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Preparar e enviar status, agendar calls, consolidar andamento</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Atualizar status de tarefas no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco/Ruy</strong></p></td><td><p>Intervir em escalonamentos e validar comunicações estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Receber status e responder pendências</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.', '<p>Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Meet, Google Calendar, E-mail corporativo.', '<p>TBO OS, Google Meet, Google Calendar, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Preparação do Status Semanal (toda segunda-feira)', 'Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.

Responsável: Carol (Ops)

Output: E-mail de status preparado

Prazo referência: Toda segunda-feira até 12h', '<p>Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.</p><p>Responsável: Carol (Ops)</p><p>Output: E-mail de status preparado</p><p>Prazo referência: Toda segunda-feira até 12h</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Envio e Registro', 'Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).

Responsável: Carol (Ops)

Output: Status enviado e registrado

Prazo referência: Segunda-feira até 14h', '<p>Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).</p><p>Responsável: Carol (Ops)</p><p>Output: Status enviado e registrado</p><p>Prazo referência: Segunda-feira até 14h</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Call Quinzenal (projetos de escopo grande)', 'Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.

Responsável: Carol (Ops) + PO da BU principal

Output: Ata de call registrada no TBO OS

Prazo referência: Quinzenal, conforme agenda', '<p>Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.</p><p>Responsável: Carol (Ops) + PO da BU principal</p><p>Output: Ata de call registrada no TBO OS</p><p>Prazo referência: Quinzenal, conforme agenda</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Escalonamento de Pendências', 'Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.

Responsável: Carol (Ops) → Marco/Ruy

Output: Pendência resolvida ou prazo renegociado

Prazo referência: Até 48h após escalonamento', '<p>Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.</p><p>Responsável: Carol (Ops) → Marco/Ruy</p><p>Output: Pendência resolvida ou prazo renegociado</p><p>Prazo referência: Até 48h após escalonamento</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] E-mail de status enviado toda segunda-feira

[ ] Call quinzenal realizada (projetos de escopo grande)

[ ] Pendências do cliente rastreadas com datas de follow-up

[ ] Escalonamentos registrados no TBO OS

[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação', '<ul><li>[ ] E-mail de status enviado toda segunda-feira</li><li>[ ] Call quinzenal realizada (projetos de escopo grande)</li><li>[ ] Pendências do cliente rastreadas com datas de follow-up</li><li>[ ] Escalonamentos registrados no TBO OS</li><li>[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar status sem conferir com POs → informação incorreta destrói credibilidade

Não escalonar pendência a tempo → atraso silencioso que estoura no deadline

Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar', '<ul><li>Enviar status sem conferir com POs → informação incorreta destrói credibilidade</li><li>Não escalonar pendência a tempo → atraso silencioso que estoura no deadline</li><li>Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).', '<p>TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Status semanal: toda segunda-feira até 14h

Resposta a pendência do cliente: até 4h úteis (acknowledgement)

Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)

Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal', '<ul><li>Status semanal: toda segunda-feira até 14h</li><li>Resposta a pendência do cliente: até 4h úteis (acknowledgement)</li><li>Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)</li><li>Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim', '<p>Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.

Escalonamento: transferência de uma pendência para nível hierárquico superior.

Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.', '<p>Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.</p><p>Escalonamento: transferência de uma pendência para nível hierárquico superior.</p><p>Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-ATD-003: Gestao de Reclamacoes e Feedbacks ──
END $$;