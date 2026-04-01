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
    'Onboarding de Cliente',
    'tbo-atd-001-onboarding-de-cliente',
    'atendimento',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

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

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-ATD-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Atendimento (Customer Success)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.</p><p><strong>2.2 Exclusões</strong></p><p>Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Coordenar setup, kickoffs e cobrança de materiais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco Andolfato</strong></p></td><td><p>Validar cronograma e escopo operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Participar do kickoff interno e confirmar disponibilidade</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Fornecer materiais e participar do kickoff</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Setup Interno (D+0 a D+1)</strong></p><p>Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.</p><p>Responsável: Carol (Ops)</p><p>Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado</p><p>Prazo referência: Até 1 dia útil após confirmação de pagamento</p><p><strong>5.2. Kickoff Interno (D+1 a D+2)</strong></p><p>Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.</p><p>Responsável: Carol (Ops) + POs de BU</p><p>Output: Ata de kickoff interno registrada no TBO OS</p><p>Prazo referência: Até 2 dias úteis</p><p><strong>5.3. Kickoff com Cliente (D+2 a D+5)</strong></p><p>Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.</p><p>Responsável: Carol (Ops) + Marco (quando estratégico)</p><p>Output: E-mail de boas-vindas enviado com resumo do kickoff</p><p>Prazo referência: Até 5 dias úteis</p><p><strong>5.4. Cobrança de Materiais (D+5 a D+10)</strong></p><p>Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de materiais 100% recebido e registrado</p><p>Prazo referência: Até 10 dias úteis</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Projeto criado no TBO OS com todos os campos preenchidos</li><li>[ ] POs atribuídos e notificados</li><li>[ ] Kickoff interno realizado com ata registrada</li><li>[ ] Kickoff com cliente realizado</li><li>[ ] E-mail de boas-vindas enviado</li><li>[ ] Checklist de materiais enviado e rastreado</li><li>[ ] Primeira tarefa de produção em andamento</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia</li><li>Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio</li><li>Pular o kickoff com cliente → expectativas desalinhadas desde o início</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Setup no TBO OS: até D+1 após confirmação de pagamento</li><li>Kickoff interno: até D+2</li><li>Kickoff com cliente: até D+5</li><li>Materiais completos recebidos: até D+10 (com follow-up ativo)</li></ul><p><strong>9. Fluxograma</strong></p><p>Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim</p><p><strong>10. Glossário</strong></p><p>Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.</p><p>Milestone: marco de entrega dentro do cronograma do projeto.</p><p>PO (Product Owner): líder responsável pela entrega de uma BU específica.</p><p>Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['atendimento','cliente','entrega','qualidade']::TEXT[],
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

  -- Steps for TBO-ATD-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.', '<p>Padronizar o processo de integração de novos clientes após assinatura de contrato, garantindo que o projeto seja configurado no TBO OS, que o cliente compreenda os rituais de acompanhamento e que a equipe interna esteja alinhada sobre escopo, prazos e responsáveis.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.', '<p>Todo o fluxo desde a confirmação de pagamento até o início efetivo da produção: setup no TBO OS, kickoff interno, kickoff com cliente, cobrança de materiais e ativação do projeto.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).', '<p>Processo comercial e negociação (SOP-COM), produção técnica das BUs (SOPs de cada BU), gestão financeira de parcelas (SOP-FIN).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Coordenar setup, kickoffs e cobrança de materiais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco Andolfato</strong></p></td><td><p>Validar cronograma e escopo operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>POs de BU</strong></p></td><td><p>Participar do kickoff interno e confirmar disponibilidade</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Cliente</strong></p></td><td><p>Fornecer materiais e participar do kickoff</p></td><td><p>Informado</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).', '<p>Contrato assinado via ClickSign; confirmação de pagamento da primeira parcela; briefing comercial preenchido por Ruy; dados do empreendimento (nome, tipologias, localização, público-alvo).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.', '<p>TBO OS, Google Meet, Google Drive, WhatsApp Business, E-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Setup Interno (D+0 a D+1)', 'Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.

Responsável: Carol (Ops)

Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado

Prazo referência: Até 1 dia útil após confirmação de pagamento', '<p>Ação: Carol cria o projeto no TBO OS com dados do contrato (cliente, empreendimento, escopo, valor, prazos). Atribui POs de cada BU envolvida. Cria canal de Chat do projeto. Configura cronograma macro com milestones.</p><p>Responsável: Carol (Ops)</p><p>Output: Projeto ativo no TBO OS com POs atribuídos e cronograma configurado</p><p>Prazo referência: Até 1 dia útil após confirmação de pagamento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Kickoff Interno (D+1 a D+2)', 'Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.

Responsável: Carol (Ops) + POs de BU

Output: Ata de kickoff interno registrada no TBO OS

Prazo referência: Até 2 dias úteis', '<p>Ação: Carol convoca reunião interna de alinhamento com POs envolvidos. Pauta: escopo detalhado, cronograma, riscos, dependências do cliente. Resultado: ata registrada no TBO OS com responsáveis e datas.</p><p>Responsável: Carol (Ops) + POs de BU</p><p>Output: Ata de kickoff interno registrada no TBO OS</p><p>Prazo referência: Até 2 dias úteis</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Kickoff com Cliente (D+2 a D+5)', 'Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.

Responsável: Carol (Ops) + Marco (quando estratégico)

Output: E-mail de boas-vindas enviado com resumo do kickoff

Prazo referência: Até 5 dias úteis', '<p>Ação: Carol agenda reunião de kickoff via Google Meet. Pauta padrão: apresentação da equipe, cronograma, rituais de status, canais de comunicação, política de revisões, materiais pendentes. Envio de e-mail de boas-vindas com resumo.</p><p>Responsável: Carol (Ops) + Marco (quando estratégico)</p><p>Output: E-mail de boas-vindas enviado com resumo do kickoff</p><p>Prazo referência: Até 5 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Cobrança de Materiais (D+5 a D+10)', 'Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.

Responsável: Carol (Ops)

Output: Checklist de materiais 100% recebido e registrado

Prazo referência: Até 10 dias úteis', '<p>Ação: Carol envia checklist de materiais necessários (projetos arquitetônicos, referências visuais, briefing de marketing, assets de marca). Follow-up a cada 48h até recebimento completo. Registro no TBO OS: status de cada material.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de materiais 100% recebido e registrado</p><p>Prazo referência: Até 10 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Projeto criado no TBO OS com todos os campos preenchidos

[ ] POs atribuídos e notificados

[ ] Kickoff interno realizado com ata registrada

[ ] Kickoff com cliente realizado

[ ] E-mail de boas-vindas enviado

[ ] Checklist de materiais enviado e rastreado

[ ] Primeira tarefa de produção em andamento', '<ul><li>[ ] Projeto criado no TBO OS com todos os campos preenchidos</li><li>[ ] POs atribuídos e notificados</li><li>[ ] Kickoff interno realizado com ata registrada</li><li>[ ] Kickoff com cliente realizado</li><li>[ ] E-mail de boas-vindas enviado</li><li>[ ] Checklist de materiais enviado e rastreado</li><li>[ ] Primeira tarefa de produção em andamento</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia

Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio

Pular o kickoff com cliente → expectativas desalinhadas desde o início', '<ul><li>Iniciar produção sem materiais essenciais do cliente → retrabalho e atraso em cadeia</li><li>Não registrar o kickoff → equipe sem alinhamento, escopo vira telefone sem fio</li><li>Pular o kickoff com cliente → expectativas desalinhadas desde o início</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).', '<p>TBO OS (projeto, chat, cronograma), Google Meet (kickoffs), Google Drive (materiais), WhatsApp Business (follow-up), E-mail (boas-vindas e status).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup no TBO OS: até D+1 após confirmação de pagamento

Kickoff interno: até D+2

Kickoff com cliente: até D+5

Materiais completos recebidos: até D+10 (com follow-up ativo)', '<ul><li>Setup no TBO OS: até D+1 após confirmação de pagamento</li><li>Kickoff interno: até D+2</li><li>Kickoff com cliente: até D+5</li><li>Materiais completos recebidos: até D+10 (com follow-up ativo)</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim', '<p>Contrato Assinado + Pagamento Confirmado → Setup TBO OS (D+0) → Kickoff Interno (D+1–2) → Kickoff com Cliente (D+2–5) → Cobrança de Materiais (D+5–10) → Materiais Recebidos → Produção Inicia → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.

Milestone: marco de entrega dentro do cronograma do projeto.

PO (Product Owner): líder responsável pela entrega de uma BU específica.

Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.', '<p>Kickoff: reunião de alinhamento inicial que define escopo, prazos e responsáveis.</p><p>Milestone: marco de entrega dentro do cronograma do projeto.</p><p>PO (Product Owner): líder responsável pela entrega de uma BU específica.</p><p>Handoff: passagem formal de entregáveis entre BUs ou entre TBO e cliente.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-ATD-002: Rituais de Acompanhamento de Projeto ──
END $$;