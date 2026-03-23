-- Seed: atendimento (4 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-ATD-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Onboarding de Cliente', 'tbo-atd-001-onboarding-de-cliente', 'atendimento', 'checklist', 'Carol (Coordenadora de Operações)', 'Standard Operating Procedure

Onboarding de Cliente

Código

TBO-ATD-001

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

Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.

2. Escopo

2.1 O que está coberto

Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.

2.2 Exclusões

Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar setup, kickoffs e cobrança de materiais

Executor

---

Marco Andolfato

Validar cronograma e escopo operacional

Aprovador

---

POs de BU

Participar do kickoff interno e confirmar disponibilidade

Executor

---

Cliente

Fornecer materiais e participar do kickoff

Informado

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).

4.2 Ferramentas e Acessos

TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.

5. Procedimento Passo a Passo

5.1. Setup Interno (D+0 a D+1)

Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.

Responsável: Carol (Ops)

Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado

Prazo referência: Até 1 dia útil após confirmação de pagamento

5.2. Kickoff Interno (D+1 a D+2)

Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.

Responsável: Carol (Ops) + POs de BU

Output: Ata de kickoff interno registrada no TBO OS

Prazo referência: Até 2 dias úteis

5.3. Kickoff com Cliente (D+2 a D+5)

Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.

Responsável: Carol (Ops) + Marco (quando estratégico)

Output: E-mail de boas-vindas enviado com resumo do kickoff

Prazo referência: Até 5 dias úteis

5.4. Cobrança de Materiais (D+5 a D+10)

Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.

Responsável: Carol (Ops)

Output: Checklist de materiais 100% recebido e registrado

Prazo referência: Até 10 dias úteis

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Projeto criado no TBO OS com todos os campos preenchidos

[ ] POs atribuídos e notificados

[ ] Kickoff interno realizado com ata registrada

[ ] Kickoff com cliente realizado

[ ] E-mail de boas-vindas enviado

[ ] Checklist de materiais enviado e rastreado

[ ] Primeira tarefa de produção em andamento

6.2 Erros Comuns a Evitar

Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia

Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio

Pular o kickoff com cliente → expectativas desalinhadas desde o início

7. Ferramentas e Templates

TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).

8. SLAs e Prazos

Setup no TBO OS: até D+1 após confirmação de pagamento

Kickoff interno: até D+2

Kickoff com cliente: até D+5

Materiais completos recebidos: até D+10 (com follow-up ativo)

9. Fluxograma

Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim

10. Glossário

Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.

Milestone: marco de entrega dentro do cronograma do projeto.

PO (Product Owner): líder responsável pela entrega de uma BU específica.

Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['atendimento','cliente']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar setup, kickoffs e cobrança de materiais

Executor

---

Marco Andolfato

Validar cronograma e escopo operacional

Aprovador

---

POs de BU

Participar do kickoff interno e confirmar disponibilidade

Executor

---

Cliente

Fornecer materiais e participar do kickoff

Informado

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Setup Interno (D+0 a D+1)', 'Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.

Responsável: Carol (Ops)

Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado

Prazo referência: Até 1 dia útil após confirmação de pagamento', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Kickoff Interno (D+1 a D+2)', 'Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.

Responsável: Carol (Ops) + POs de BU

Output: Ata de kickoff interno registrada no TBO OS

Prazo referência: Até 2 dias úteis', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Kickoff com Cliente (D+2 a D+5)', 'Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.

Responsável: Carol (Ops) + Marco (quando estratégico)

Output: E-mail de boas-vindas enviado com resumo do kickoff

Prazo referência: Até 5 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Cobrança de Materiais (D+5 a D+10)', 'Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.

Responsável: Carol (Ops)

Output: Checklist de materiais 100% recebido e registrado

Prazo referência: Até 10 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Projeto criado no TBO OS com todos os campos preenchidos

[ ] POs atribuídos e notificados

[ ] Kickoff interno realizado com ata registrada

[ ] Kickoff com cliente realizado

[ ] E-mail de boas-vindas enviado

[ ] Checklist de materiais enviado e rastreado

[ ] Primeira tarefa de produção em andamento', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia

Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio

Pular o kickoff com cliente → expectativas desalinhadas desde o início', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup no TBO OS: até D+1 após confirmação de pagamento

Kickoff interno: até D+2

Kickoff com cliente: até D+5

Materiais completos recebidos: até D+10 (com follow-up ativo)', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.

Milestone: marco de entrega dentro do cronograma do projeto.

PO (Product Owner): líder responsável pela entrega de uma BU específica.

Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-ATD-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Rituais de Acompanhamento de Projeto', 'tbo-atd-002-rituais-de-acompanhamento-de-projeto', 'atendimento', 'checklist', 'Rituais de Acompanhamento de Projeto', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['atendimento','cliente']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Definir a cadência e o formato de comunicação com clientes ativos, evitando tanto o silêncio excessivo quanto o micro-gerenciamento por parte do cliente, mantendo previsibilidade e confiança.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Status semanal por e-mail, calls quinzenais de progresso, relatórios mensais de gestão contínua e regras de escalonamento para pendências.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Comunicação comercial pré-contrato (SOP-COM), reports de performance de marketing (SOP-MKT-012), feedbacks criativos específicos (SOP de cada BU).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto ativo no TBO OS com tarefas e status atualizados pelos POs; template de e-mail de status configurado; agenda de calls recorrentes no Google Calendar.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Meet, Google Calendar, E-mail corporativo.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Preparação do Status Semanal (toda segunda-feira)', 'Ação: Carol coleta andamento de cada PO via TBO OS. Consolida em template de e-mail padrão com seções: Concluído, Em andamento, Pendente do cliente, Próximas entregas.

Responsável: Carol (Ops)

Output: E-mail de status preparado

Prazo referência: Toda segunda-feira até 12h', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Envio e Registro', 'Ação: Envio do e-mail com CC para Marco (ou Ruy conforme o projeto). Registro da comunicação no TBO OS (campo de notas do projeto).

Responsável: Carol (Ops)

Output: Status enviado e registrado

Prazo referência: Segunda-feira até 14h', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Call Quinzenal (projetos de escopo grande)', 'Ação: Reunião de 30 min via Google Meet para apresentação visual do progresso. Carol compartilha tela com TBO OS e materiais em produção. Resultado: ata curta registrada.

Responsável: Carol (Ops) + PO da BU principal

Output: Ata de call registrada no TBO OS

Prazo referência: Quinzenal, conforme agenda', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Escalonamento de Pendências', 'Ação: Se o cliente não responde a materiais pendentes após 2 follow-ups (4 dias úteis), Carol escalona para Marco/Ruy que fazem contato direto. Se há risco de atraso, registro inclui nova data estimada.

Responsável: Carol (Ops) → Marco/Ruy

Output: Pendência resolvida ou prazo renegociado

Prazo referência: Até 48h após escalonamento', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] E-mail de status enviado toda segunda-feira

[ ] Call quinzenal realizada (projetos de escopo grande)

[ ] Pendências do cliente rastreadas com datas de follow-up

[ ] Escalonamentos registrados no TBO OS

[ ] Nenhum projeto ficou mais de 7 dias úteis sem comunicação', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar status sem conferir com POs → informação incorreta destrói credibilidade

Não escalonar pendência a tempo → atraso silencioso que estoura no deadline

Silêncio por mais de 7 dias úteis → cliente perde confiança e começa a micro-gerenciar', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (status, notas), Google Meet (calls), Google Calendar (recorrências), E-mail (status semanal).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Status semanal: toda segunda-feira até 14h

Resposta a pendência do cliente: até 4h úteis (acknowledgement)

Escalonamento: após 2 follow-ups sem resposta (4 dias úteis)

Regra de ouro: nenhum projeto fica mais de 7 dias úteis sem comunicação formal', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início da Semana → Carol coleta status dos POs → Consolida e-mail → Envia ao cliente → Pendência? → Sim: Follow-up 48h → Sem resposta? → Escalonamento → Fim / Não: Próxima semana → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Status semanal: e-mail padronizado com andamento do projeto enviado toda segunda.

Escalonamento: transferência de uma pendência para nível hierárquico superior.

Follow-up: contato de acompanhamento para cobrar resposta ou ação pendente.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

  -- TBO-ATD-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestao de Reclamacoes e Feedbacks', 'tbo-atd-003-gestao-de-reclamacoes-e-feedbacks', 'atendimento', 'checklist', 'Gestão de Reclamações e Feedbacks', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['atendimento','cliente']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Estabelecer um fluxo estruturado para receber, classificar, tratar e resolver reclamações de clientes, garantindo que cada feedback gere aprendizado e melhoria contínua de processos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Registro, classificação (3 níveis), tratamento, resolução e análise de padrões de reclamações de clientes ativos.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Feedbacks internos entre colaboradores (SOP-RH), avaliações de fornecedores (SOP-REL), disputas contratuais formais (jurídico).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Reclamação recebida por qualquer canal (e-mail, call, WhatsApp); projeto ativo no TBO OS; histórico de entregas do projeto.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (registro e rastreamento), Google Meet, WhatsApp Business, E-mail.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Registro da Reclamação', 'Ação: Carol registra toda reclamação no TBO OS incluindo: data, canal de recebimento, descrição detalhada, classificação de nível e responsável pela resolução.

Responsável: Carol (Ops)

Output: Reclamação registrada com classificação

Prazo referência: Até 2h após recebimento', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Classificação por Nível', 'Ação: Nível 1 (Operacional): atraso pontual, arquivo em formato errado, falha de comunicação — resolução pela Carol. Nível 2 (Qualidade): insatisfação com resultado criativo, retrabalho além do contratado — PO + Marco. Nível 3 (Relacional): quebra de confiança, ameaça de cancelamento — Marco + Ruy.

Responsável: Carol (Ops)

Output: Nível classificado e responsável notificado

Prazo referência: Imediato após registro', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Resposta Inicial ao Cliente', 'Ação: Enviar acknowledgement ao cliente confirmando recebimento e prazo estimado de resolução. Não é necessário ter a solução — é necessário confirmar que está sendo tratada.

Responsável: Carol (Ops)

Output: Resposta de acknowledgement enviada

Prazo referência: Até 4h úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Resolução', 'Ação: Nível 1: resolução em até 24h úteis. Nível 2: proposta de solução em até 48h (pode envolver call de alinhamento). Nível 3: reunião com sócios em até 48h. Todas as resoluções são registradas no TBO OS.

Responsável: Conforme nível

Output: Reclamação resolvida e registrada

Prazo referência: Conforme SLA por nível', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Análise de Padrões (semanal)', 'Ação: Carol apresenta reclamações da semana na reunião interna. Se o mesmo tipo ocorre 3 vezes em 90 dias, é obrigatória revisão do SOP relacionado.

Responsável: Carol (Ops) + Marco

Output: Ações preventivas definidas quando aplicável

Prazo referência: Reunião semanal interna', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Reclamação registrada no TBO OS com todos os campos

[ ] Nível classificado corretamente

[ ] Resposta de acknowledgement enviada dentro de 4h úteis

[ ] Resolução concluída dentro do SLA do nível

[ ] Análise semanal realizada com identificação de padrões', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Não registrar reclamação → problema se repete e ninguém percebe o padrão

Demorar mais de 4h para responder → cliente sente que foi ignorado

Resolver sem registrar → aprendizado perdido, erro se repete', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (registro e rastreamento), Google Meet (calls de resolução), E-mail (comunicação formal), WhatsApp Business (urgências).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Registro: até 2h após recebimento

Acknowledgement ao cliente: até 4h úteis

Resolução Nível 1: até 24h úteis

Resolução Nível 2: proposta em até 48h úteis

Resolução Nível 3: reunião com sócios em até 48h úteis

Regra: 3 reclamações iguais em 90 dias → revisão obrigatória do SOP relacionado', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Reclamação Recebida → Registro no TBO OS → Classificação (N1/N2/N3) → Acknowledgement ao Cliente (4h) → Resolução conforme nível → Registro da Resolução → Análise Semanal → Padrão identificado? → Sim: Revisão de SOP → Fim / Não: Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Acknowledgement: resposta inicial confirmando recebimento, sem necessidade de solução.

Nível 1: reclamação operacional de resolução rápida e baixo impacto.

Nível 2: reclamação de qualidade que envolve insatisfação com entregas criativas.

Nível 3: reclamação relacional que ameaça a continuidade da parceria.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 17, 'step');

  -- TBO-ATD-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Handoff entre BUs', 'tbo-atd-004-handoff-entre-bus', 'atendimento', 'checklist', 'Carol (Coordenadora de Operações)', 'Standard Operating Procedure

Handoff entre BUs

Código

TBO-ATD-004

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

Padronizar a passagem de bastão entre as BUs da TBO (Digital 3D, Branding, Marketing, Audiovisual, Gamificação), garantindo que nenhuma informação se perca e que o cliente perceba continuidade na experiência.

2. Escopo

2.1 O que está coberto

Checklist de handoff, reunião entre POs quando necessário, comunicação ao cliente sobre transição de fase, e registro formal de aceite.

2.2 Exclusões

Handoff final ao cliente (SOP-OPS-008), gestão de fornecedores externos (SOP-REL-001), processo de QA interno de cada BU (SOPs de BU).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o handoff, garantir checklist e comunicar cliente

Executor

---

PO da BU que entrega

Preencher checklist, organizar arquivos e briefing

Executor

---

PO da BU que recebe

Validar recebimento e confirmar aceite

Executor

---

Marco

Autorizar exceções ao fluxo padrão

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Entrega da BU anterior aprovada pelo cliente; arquivos finais nomeados conforme padrão TBO; briefing e feedbacks consolidados.

4.2 Ferramentas e Acessos

TBO OS (checklist de handoff, registro de aceite), Google Drive (arquivos), Google Meet (reunião entre POs).

5. Procedimento Passo a Passo

5.1. Preenchimento do Checklist de Handoff

Ação: PO da BU que entrega preenche no TBO OS: arquivos finais entregues (links, nomenclatura, resolução), briefing e referências que orientaram a produção, feedbacks do cliente consolidados, pontos de atenção ou exceções.

Responsável: PO da BU que entrega

Output: Checklist preenchido no TBO OS

Prazo referência: Até 24h após aprovação do cliente na etapa anterior

5.2. Reunião de Handoff (projetos de alta complexidade)

Ação: Carol agenda reunião de 15 min entre POs das BUs envolvidas. Resultado: registro de aceite no TBO OS.

Responsável: Carol (Ops)

Output: Ata de handoff registrada

Prazo referência: Até 48h após checklist preenchido

5.3. Comunicação ao Cliente

Ação: Carol informa o cliente sobre a transição de fase, apresenta o novo ponto focal (se houver mudança) e confirma a próxima milestone.

Responsável: Carol (Ops)

Output: E-mail ou mensagem de transição enviada ao cliente

Prazo referência: No mesmo dia da reunião de handoff

5.4. Aceite da BU Receptora

Ação: PO da BU que recebe confirma aceite formal no TBO OS após verificar que tem todos os insumos para iniciar a produção.

Responsável: PO da BU que recebe

Output: Aceite registrado no TBO OS

Prazo referência: Até 24h após reunião de handoff

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Checklist de handoff preenchido com todos os campos

[ ] Arquivos finais organizados e nomeados conforme padrão

[ ] Feedbacks do cliente consolidados e acessíveis

[ ] Reunião de handoff realizada (se projeto complexo)

[ ] Comunicação ao cliente sobre transição enviada

[ ] Aceite formal da BU receptora registrado no TBO OS

6.2 Erros Comuns a Evitar

BU receptora inicia sem checklist → retrabalho por falta de contexto

Arquivos sem nomenclatura padrão → perda de tempo procurando versão correta

Não comunicar o cliente → sensação de descontinuidade e perda de confiança

7. Ferramentas e Templates

TBO OS (checklist, aceite, registro), Google Drive (arquivos), Google Meet (reunião de handoff), E-mail (comunicação ao cliente).

8. SLAs e Prazos

Checklist de handoff: até 24h após aprovação da etapa anterior

Reunião de handoff: até 48h (projetos complexos)

Comunicação ao cliente: no mesmo dia

Aceite da BU receptora: até 24h após reunião

Regra: nenhuma BU inicia sem checklist preenchido — exceções requerem aprovação de Marco

9. Fluxograma

Entrega da BU Anterior Aprovada → PO preenche Checklist de Handoff → Projeto Complexo? → Sim: Reunião de Handoff (15min) → Comunicação ao Cliente → Aceite da BU Receptora → Produção Inicia → Fim / Não: Comunicação ao Cliente → Aceite → Produção → Fim

10. Glossário

Handoff: passagem formal de entregáveis e contexto de uma BU para outra.

Checklist de handoff: formulário padronizado no TBO OS que documenta tudo o que a BU receptora precisa para iniciar.

Aceite: confirmação formal de que a BU receptora tem condições de iniciar o trabalho.

11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP

', 'published', 'medium', ARRAY['atendimento','cliente']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar a passagem de bastão entre as BUs da TBO (Digital 3D, Branding, Marketing, Audiovisual, Gamificação), garantindo que nenhuma informação se perca e que o cliente perceba continuidade na experiência.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Checklist de handoff, reunião entre POs quando necessário, comunicação ao cliente sobre transição de fase, e registro formal de aceite.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Handoff final ao cliente (SOP-OPS-008), gestão de fornecedores externos (SOP-REL-001), processo de QA interno de cada BU (SOPs de BU).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o handoff, garantir checklist e comunicar cliente

Executor

---

PO da BU que entrega

Preencher checklist, organizar arquivos e briefing

Executor

---

PO da BU que recebe

Validar recebimento e confirmar aceite

Executor

---

Marco

Autorizar exceções ao fluxo padrão

Aprovador

---', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entrega da BU anterior aprovada pelo cliente; arquivos finais nomeados conforme padrão TBO; briefing e feedbacks consolidados.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (checklist de handoff, registro de aceite), Google Drive (arquivos), Google Meet (reunião entre POs).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Preenchimento do Checklist de Handoff', 'Ação: PO da BU que entrega preenche no TBO OS: arquivos finais entregues (links, nomenclatura, resolução), briefing e referências que orientaram a produção, feedbacks do cliente consolidados, pontos de atenção ou exceções.

Responsável: PO da BU que entrega

Output: Checklist preenchido no TBO OS

Prazo referência: Até 24h após aprovação do cliente na etapa anterior', 6, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Reunião de Handoff (projetos de alta complexidade)', 'Ação: Carol agenda reunião de 15 min entre POs das BUs envolvidas. Resultado: registro de aceite no TBO OS.

Responsável: Carol (Ops)

Output: Ata de handoff registrada

Prazo referência: Até 48h após checklist preenchido', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Comunicação ao Cliente', 'Ação: Carol informa o cliente sobre a transição de fase, apresenta o novo ponto focal (se houver mudança) e confirma a próxima milestone.

Responsável: Carol (Ops)

Output: E-mail ou mensagem de transição enviada ao cliente

Prazo referência: No mesmo dia da reunião de handoff', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Aceite da BU Receptora', 'Ação: PO da BU que recebe confirma aceite formal no TBO OS após verificar que tem todos os insumos para iniciar a produção.

Responsável: PO da BU que recebe

Output: Aceite registrado no TBO OS

Prazo referência: Até 24h após reunião de handoff', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Checklist de handoff preenchido com todos os campos

[ ] Arquivos finais organizados e nomeados conforme padrão

[ ] Feedbacks do cliente consolidados e acessíveis

[ ] Reunião de handoff realizada (se projeto complexo)

[ ] Comunicação ao cliente sobre transição enviada

[ ] Aceite formal da BU receptora registrado no TBO OS', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'BU receptora inicia sem checklist → retrabalho por falta de contexto

Arquivos sem nomenclatura padrão → perda de tempo procurando versão correta

Não comunicar o cliente → sensação de descontinuidade e perda de confiança', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (checklist, aceite, registro), Google Drive (arquivos), Google Meet (reunião de handoff), E-mail (comunicação ao cliente).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Checklist de handoff: até 24h após aprovação da etapa anterior

Reunião de handoff: até 48h (projetos complexos)

Comunicação ao cliente: no mesmo dia

Aceite da BU receptora: até 24h após reunião

Regra: nenhuma BU inicia sem checklist preenchido — exceções requerem aprovação de Marco', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Entrega da BU Anterior Aprovada → PO preenche Checklist de Handoff → Projeto Complexo? → Sim: Reunião de Handoff (15min) → Comunicação ao Cliente → Aceite da BU Receptora → Produção Inicia → Fim / Não: Comunicação ao Cliente → Aceite → Produção → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Handoff: passagem formal de entregáveis e contexto de uma BU para outra.

Checklist de handoff: formulário padronizado no TBO OS que documenta tudo o que a BU receptora precisa para iniciar.

Aceite: confirmação formal de que a BU receptora tem condições de iniciar o trabalho.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', 16, 'step');

END $$;
