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
    'Briefing e Kick off de Projeto',
    'tbo-ops-003-briefing-e-kick-off-de-projeto',
    'operacoes',
    'checklist',
    'Carol (Coordenadora de Operações)',
    'Standard Operating Procedure

Briefing e Kick-off de Projeto

Código

TBO-OPS-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir que todo projeto seja iniciado com briefing completo, escopo definido, responsáveis atribuídos e prazo acordado, evitando retrabalho por alinhamento insuficiente.

  2. Escopo

2.1 O que está coberto

Coleta de briefing, validação de escopo, reunião de kick-off, abertura formal do projeto no Asana e comunicação de início à equipe.

2.2 Exclusões

Negociação comercial e precificação (SOP OPS-06), execução técnica do projeto (SOPs de cada BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Conduzir sessão de briefing, registrar no Asana, abrir projeto formal

Executor

—

Marco Andolfato

Validar viabilidade criativa e técnica do escopo

Aprovador

—

Líder de BU

Confirmar capacidade de execução e prazo

Consultado

—

Cliente

Fornecer todas as informações e aprovar escopo

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Proposta comercial aprovada; cliente ativo no sistema (onboarding concluído); contato do cliente para agendamento da reunião de briefing.

4.2 Ferramentas e Acessos

Formulário de briefing TBO (Google Forms ou Notion), Asana (template de projeto por tipo de entrega), Google Meet, Google Drive.



  5. Procedimento Passo a Passo

5.1. Envio e Preenchimento do Briefing

Ação: Carol envia formulário de briefing padrão TBO ao cliente com prazo de 48h para resposta; o formulário cobre: objetivo do projeto, público-alvo, referências, diferenciais, prazo desejado, assets disponíveis e pontos de atenção.

Responsável: Carol (Ops) + Cliente

Output: Briefing preenchido e recebido

Prazo referência: Dia 1–2

5.2. Análise Interna do Briefing

Ação: Carol e Marco analisam o briefing: identificar lacunas de informação, validar viabilidade do prazo solicitado pelo cliente, estimar esforço por BU e confirmar disponibilidade de equipe.

Responsável: Carol (Ops) + Marco Andolfato

Output: Lista de perguntas complementares e estimativa de prazo

Prazo referência: Dia 3

5.3. Reunião de Kick-off

Ação: Reunião com cliente (45–60min): apresentar entendimento do briefing, esclarecer dúvidas, confirmar escopo final, definir milestone de aprovação intermediária, alinhar prazo de entrega e canal de comunicação do projeto.

Responsável: Carol (Ops) + Líder de BU + Cliente

Output: Ata de kick-off com escopo, prazo e responsáveis

Prazo referência: Dia 4

5.4. Abertura Formal no Asana

Ação: Carol cria projeto no Asana a partir do template correto por tipo de entrega; preenche todas as tasks com responsável, prazo e descrição; adiciona cliente como colaborador; envia link do Asana ao cliente.

Responsável: Carol (Ops)

Output: Projeto aberto no Asana com todas as tasks

Prazo referência: Dia 4 (pós-kick-off)

5.5. Comunicação de Início à Equipe

Ação: Carol envia mensagem no canal do projeto (Slack/WhatsApp) com: resumo do briefing, prazo, cliente, responsáveis por fase e link do Asana; confirma disponibilidade de todos os envolvidos.

Responsável: Carol (Ops)

Output: Equipe informada e projeto iniciado

Prazo referência: Dia 4

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing preenchido pelo cliente antes do kick-off; [ ] Ata de kick-off redigida e enviada ao cliente em até 24h; [ ] Projeto no Asana com 100% das tasks preenchidas; [ ] Prazo confirmado e registrado; [ ] Cliente adicionado ao Asana como colaborador.

6.2 Erros Comuns a Evitar

Projeto iniciado sem briefing formal → retrabalho e conflito de expectativas. Kick-off sem ata → cliente e equipe com entendimentos diferentes. Asana não atualizado → gestão do projeto fica na cabeça das pessoas.

  7. Ferramentas e Templates

Google Forms, Asana, Google Meet, Google Drive, Slack/WhatsApp.

  8. SLAs e Prazos

Formulário de briefing: 48h de prazo para cliente. Análise interna: 1 dia útil. Reunião de kick-off: até 4 dias úteis pós-briefing. Ata: enviada em até 24h após reunião.

  9. Fluxograma

Início → Envio de Briefing ao Cliente → Preenchimento (48h) → Análise Interna → Reunião de Kick-off → Ata de Kick-off → Abertura no Asana → Comunicação à Equipe → Projeto em Execução → Fim

  10. Glossário

Briefing: documento com todas as informações necessárias para execução do projeto. Kick-off: reunião de início formal. Ata: registro escrito das decisões e acordos de uma reunião. Milestone: marco intermediário de entrega ou aprovação.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Briefing e Kick-off de Projeto</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todo projeto seja iniciado com briefing completo, escopo definido, responsáveis atribuídos e prazo acordado, evitando retrabalho por alinhamento insuficiente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Coleta de briefing, validação de escopo, reunião de kick-off, abertura formal do projeto no Asana e comunicação de início à equipe.</p><p><strong>2.2 Exclusões</strong></p><p>Negociação comercial e precificação (SOP OPS-06), execução técnica do projeto (SOPs de cada BU).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Conduzir sessão de briefing, registrar no Asana, abrir projeto formal</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Validar viabilidade criativa e técnica do escopo</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Confirmar capacidade de execução e prazo</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Fornecer todas as informações e aprovar escopo</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Proposta comercial aprovada; cliente ativo no sistema (onboarding concluído); contato do cliente para agendamento da reunião de briefing.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Formulário de briefing TBO (Google Forms ou Notion), Asana (template de projeto por tipo de entrega), Google Meet, Google Drive.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Envio e Preenchimento do Briefing</strong></p><p>Ação: Carol envia formulário de briefing padrão TBO ao cliente com prazo de 48h para resposta; o formulário cobre: objetivo do projeto, público-alvo, referências, diferenciais, prazo desejado, assets disponíveis e pontos de atenção.</p><p>Responsável: Carol (Ops) + Cliente</p><p>Output: Briefing preenchido e recebido</p><p>Prazo referência: Dia 1–2</p><p><strong>5.2. Análise Interna do Briefing</strong></p><p>Ação: Carol e Marco analisam o briefing: identificar lacunas de informação, validar viabilidade do prazo solicitado pelo cliente, estimar esforço por BU e confirmar disponibilidade de equipe.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Lista de perguntas complementares e estimativa de prazo</p><p>Prazo referência: Dia 3</p><p><strong>5.3. Reunião de Kick-off</strong></p><p>Ação: Reunião com cliente (45–60min): apresentar entendimento do briefing, esclarecer dúvidas, confirmar escopo final, definir milestone de aprovação intermediária, alinhar prazo de entrega e canal de comunicação do projeto.</p><p>Responsável: Carol (Ops) + Líder de BU + Cliente</p><p>Output: Ata de kick-off com escopo, prazo e responsáveis</p><p>Prazo referência: Dia 4</p><p><strong>5.4. Abertura Formal no Asana</strong></p><p>Ação: Carol cria projeto no Asana a partir do template correto por tipo de entrega; preenche todas as tasks com responsável, prazo e descrição; adiciona cliente como colaborador; envia link do Asana ao cliente.</p><p>Responsável: Carol (Ops)</p><p>Output: Projeto aberto no Asana com todas as tasks</p><p>Prazo referência: Dia 4 (pós-kick-off)</p><p><strong>5.5. Comunicação de Início à Equipe</strong></p><p>Ação: Carol envia mensagem no canal do projeto (Slack/WhatsApp) com: resumo do briefing, prazo, cliente, responsáveis por fase e link do Asana; confirma disponibilidade de todos os envolvidos.</p><p>Responsável: Carol (Ops)</p><p>Output: Equipe informada e projeto iniciado</p><p>Prazo referência: Dia 4</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Briefing preenchido pelo cliente antes do kick-off; [ ] Ata de kick-off redigida e enviada ao cliente em até 24h; [ ] Projeto no Asana com 100% das tasks preenchidas; [ ] Prazo confirmado e registrado; [ ] Cliente adicionado ao Asana como colaborador.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Projeto iniciado sem briefing formal → retrabalho e conflito de expectativas. Kick-off sem ata → cliente e equipe com entendimentos diferentes. Asana não atualizado → gestão do projeto fica na cabeça das pessoas.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Forms, Asana, Google Meet, Google Drive, Slack/WhatsApp.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Formulário de briefing: 48h de prazo para cliente. Análise interna: 1 dia útil. Reunião de kick-off: até 4 dias úteis pós-briefing. Ata: enviada em até 24h após reunião.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Envio de Briefing ao Cliente → Preenchimento (48h) → Análise Interna → Reunião de Kick-off → Ata de Kick-off → Abertura no Asana → Comunicação à Equipe → Projeto em Execução → Fim</p><p><strong>  10. Glossário</strong></p><p>Briefing: documento com todas as informações necessárias para execução do projeto. Kick-off: reunião de início formal. Ata: registro escrito das decisões e acordos de uma reunião. Milestone: marco intermediário de entrega ou aprovação.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-OPS-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo projeto seja iniciado com briefing completo, escopo definido, responsáveis atribuídos e prazo acordado, evitando retrabalho por alinhamento insuficiente.', '<p>Garantir que todo projeto seja iniciado com briefing completo, escopo definido, responsáveis atribuídos e prazo acordado, evitando retrabalho por alinhamento insuficiente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Coleta de briefing, validação de escopo, reunião de kick-off, abertura formal do projeto no Asana e comunicação de início à equipe.', '<p>Coleta de briefing, validação de escopo, reunião de kick-off, abertura formal do projeto no Asana e comunicação de início à equipe.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação comercial e precificação (SOP OPS-06), execução técnica do projeto (SOPs de cada BU).', '<p>Negociação comercial e precificação (SOP OPS-06), execução técnica do projeto (SOPs de cada BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Conduzir sessão de briefing, registrar no Asana, abrir projeto formal

Executor

—

Marco Andolfato

Validar viabilidade criativa e técnica do escopo

Aprovador

—

Líder de BU

Confirmar capacidade de execução e prazo

Consultado

—

Cliente

Fornecer todas as informações e aprovar escopo

Consultado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Conduzir sessão de briefing, registrar no Asana, abrir projeto formal</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Validar viabilidade criativa e técnica do escopo</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Confirmar capacidade de execução e prazo</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Fornecer todas as informações e aprovar escopo</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Proposta comercial aprovada; cliente ativo no sistema (onboarding concluído); contato do cliente para agendamento da reunião de briefing.', '<p>Proposta comercial aprovada; cliente ativo no sistema (onboarding concluído); contato do cliente para agendamento da reunião de briefing.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Formulário de briefing TBO (Google Forms ou Notion), Asana (template de projeto por tipo de entrega), Google Meet, Google Drive.', '<p>Formulário de briefing TBO (Google Forms ou Notion), Asana (template de projeto por tipo de entrega), Google Meet, Google Drive.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Envio e Preenchimento do Briefing', 'Ação: Carol envia formulário de briefing padrão TBO ao cliente com prazo de 48h para resposta; o formulário cobre: objetivo do projeto, público-alvo, referências, diferenciais, prazo desejado, assets disponíveis e pontos de atenção.

Responsável: Carol (Ops) + Cliente

Output: Briefing preenchido e recebido

Prazo referência: Dia 1–2', '<p>Ação: Carol envia formulário de briefing padrão TBO ao cliente com prazo de 48h para resposta; o formulário cobre: objetivo do projeto, público-alvo, referências, diferenciais, prazo desejado, assets disponíveis e pontos de atenção.</p><p>Responsável: Carol (Ops) + Cliente</p><p>Output: Briefing preenchido e recebido</p><p>Prazo referência: Dia 1–2</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Análise Interna do Briefing', 'Ação: Carol e Marco analisam o briefing: identificar lacunas de informação, validar viabilidade do prazo solicitado pelo cliente, estimar esforço por BU e confirmar disponibilidade de equipe.

Responsável: Carol (Ops) + Marco Andolfato

Output: Lista de perguntas complementares e estimativa de prazo

Prazo referência: Dia 3', '<p>Ação: Carol e Marco analisam o briefing: identificar lacunas de informação, validar viabilidade do prazo solicitado pelo cliente, estimar esforço por BU e confirmar disponibilidade de equipe.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Lista de perguntas complementares e estimativa de prazo</p><p>Prazo referência: Dia 3</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Reunião de Kick-off', 'Ação: Reunião com cliente (45–60min): apresentar entendimento do briefing, esclarecer dúvidas, confirmar escopo final, definir milestone de aprovação intermediária, alinhar prazo de entrega e canal de comunicação do projeto.

Responsável: Carol (Ops) + Líder de BU + Cliente

Output: Ata de kick-off com escopo, prazo e responsáveis

Prazo referência: Dia 4', '<p>Ação: Reunião com cliente (45–60min): apresentar entendimento do briefing, esclarecer dúvidas, confirmar escopo final, definir milestone de aprovação intermediária, alinhar prazo de entrega e canal de comunicação do projeto.</p><p>Responsável: Carol (Ops) + Líder de BU + Cliente</p><p>Output: Ata de kick-off com escopo, prazo e responsáveis</p><p>Prazo referência: Dia 4</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Abertura Formal no Asana', 'Ação: Carol cria projeto no Asana a partir do template correto por tipo de entrega; preenche todas as tasks com responsável, prazo e descrição; adiciona cliente como colaborador; envia link do Asana ao cliente.

Responsável: Carol (Ops)

Output: Projeto aberto no Asana com todas as tasks

Prazo referência: Dia 4 (pós-kick-off)', '<p>Ação: Carol cria projeto no Asana a partir do template correto por tipo de entrega; preenche todas as tasks com responsável, prazo e descrição; adiciona cliente como colaborador; envia link do Asana ao cliente.</p><p>Responsável: Carol (Ops)</p><p>Output: Projeto aberto no Asana com todas as tasks</p><p>Prazo referência: Dia 4 (pós-kick-off)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Comunicação de Início à Equipe', 'Ação: Carol envia mensagem no canal do projeto (Slack/WhatsApp) com: resumo do briefing, prazo, cliente, responsáveis por fase e link do Asana; confirma disponibilidade de todos os envolvidos.

Responsável: Carol (Ops)

Output: Equipe informada e projeto iniciado

Prazo referência: Dia 4', '<p>Ação: Carol envia mensagem no canal do projeto (Slack/WhatsApp) com: resumo do briefing, prazo, cliente, responsáveis por fase e link do Asana; confirma disponibilidade de todos os envolvidos.</p><p>Responsável: Carol (Ops)</p><p>Output: Equipe informada e projeto iniciado</p><p>Prazo referência: Dia 4</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing preenchido pelo cliente antes do kick-off; [ ] Ata de kick-off redigida e enviada ao cliente em até 24h; [ ] Projeto no Asana com 100% das tasks preenchidas; [ ] Prazo confirmado e registrado; [ ] Cliente adicionado ao Asana como colaborador.', '<p>[ ] Briefing preenchido pelo cliente antes do kick-off; [ ] Ata de kick-off redigida e enviada ao cliente em até 24h; [ ] Projeto no Asana com 100% das tasks preenchidas; [ ] Prazo confirmado e registrado; [ ] Cliente adicionado ao Asana como colaborador.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Projeto iniciado sem briefing formal → retrabalho e conflito de expectativas. Kick-off sem ata → cliente e equipe com entendimentos diferentes. Asana não atualizado → gestão do projeto fica na cabeça das pessoas.', '<p>Projeto iniciado sem briefing formal → retrabalho e conflito de expectativas. Kick-off sem ata → cliente e equipe com entendimentos diferentes. Asana não atualizado → gestão do projeto fica na cabeça das pessoas.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Forms, Asana, Google Meet, Google Drive, Slack/WhatsApp.', '<p>Google Forms, Asana, Google Meet, Google Drive, Slack/WhatsApp.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Formulário de briefing: 48h de prazo para cliente. Análise interna: 1 dia útil. Reunião de kick-off: até 4 dias úteis pós-briefing. Ata: enviada em até 24h após reunião.', '<p>Formulário de briefing: 48h de prazo para cliente. Análise interna: 1 dia útil. Reunião de kick-off: até 4 dias úteis pós-briefing. Ata: enviada em até 24h após reunião.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Envio de Briefing ao Cliente → Preenchimento (48h) → Análise Interna → Reunião de Kick-off → Ata de Kick-off → Abertura no Asana → Comunicação à Equipe → Projeto em Execução → Fim', '<p>Início → Envio de Briefing ao Cliente → Preenchimento (48h) → Análise Interna → Reunião de Kick-off → Ata de Kick-off → Abertura no Asana → Comunicação à Equipe → Projeto em Execução → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Briefing: documento com todas as informações necessárias para execução do projeto. Kick-off: reunião de início formal. Ata: registro escrito das decisões e acordos de uma reunião. Milestone: marco intermediário de entrega ou aprovação.', '<p>Briefing: documento com todas as informações necessárias para execução do projeto. Kick-off: reunião de início formal. Ata: registro escrito das decisões e acordos de uma reunião. Milestone: marco intermediário de entrega ou aprovação.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-004: Gestão de Projetos Fluxo Kanban ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Projetos Fluxo Kanban',
    'tbo-ops-004-gestao-de-projetos-fluxo-kanban',
    'operacoes',
    'checklist',
    'Gestão de Projetos (Fluxo Kanban)',
    'Standard Operating Procedure

Gestão de Projetos (Fluxo Kanban)

Código

TBO-OPS-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir que todos os projetos em andamento sejam geridos com visibilidade, rastreabilidade e previsibilidade através do fluxo Kanban no Asana, com reuniões de acompanhamento semanais e alertas de risco proativos.

  2. Escopo

2.1 O que está coberto

Gestão do ciclo de vida do projeto do kick-off ao encerramento, incluindo atualizações de status, gestão de bloqueios, comunicação com cliente e controle de prazo.

2.2 Exclusões

Execução técnica (responsabilidade de cada BU), negociação comercial de novos escopos (SOP OPS-06), onboarding inicial (SOP OPS-03).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Manter Asana atualizado, conduzir reuniões de acompanhamento, reportar riscos

Executor

—

Marco Andolfato

Aprovar decisões de re-escopo, desbloquear impedimentos estratégicos

Aprovador

—

Responsável de BU

Atualizar tasks, reportar bloqueios, entregar no prazo

Executor

—

Cliente

Aprovar entregas intermediárias no prazo combinado

Consultado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Projeto aberto no Asana com tasks e prazos definidos (SOP OPS-03 concluído); equipe responsável definida; canal de comunicação do projeto ativo.

4.2 Ferramentas e Acessos

Asana (board Kanban por projeto), Google Drive, Google Meet, planilha de controle geral de projetos TBO (status semanal).



  5. Procedimento Passo a Passo

5.1. Manutenção Diária do Kanban

Ação: Cada responsável atualiza suas tasks no Asana diariamente: mover entre colunas (A fazer → Em andamento → Revisão interna → Aguardando cliente → Concluído), adicionar comentários de progresso e sinalizar bloqueios com tag [BLOQUEIO].

Responsável: Equipe de BU

Output: Asana atualizado diariamente

Prazo referência: Diário

5.2. Reunião Semanal de Acompanhamento (Interna)

Ação: Carol conduz reunião semanal de 30min com responsáveis de BU: revisar status de todos os projetos ativos, identificar projetos em risco de atraso (>2 dias do prazo original), definir ação corretiva para cada bloqueio.

Responsável: Carol (Ops) + Líderes de BU

Output: Ata semanal com status e ações corretivas

Prazo referência: Toda segunda-feira

5.3. Atualização de Status ao Cliente

Ação: Carol envia update semanal ao cliente para projetos com prazo de entrega em até 2 semanas: resumo do andamento, próxima entrega intermediária esperada, eventuais ajustes de prazo justificados.

Responsável: Carol (Ops)

Output: Cliente informado semanalmente

Prazo referência: Toda sexta-feira

5.4. Gestão de Entregas para Aprovação do Cliente

Ação: Quando task atinge coluna ''Aguardando cliente'', Carol notifica cliente com link de acesso (frame.io, Drive ou Asana), prazo de resposta (48–72h) e instrução de como aprovar ou comentar. Registrar data de envio.

Responsável: Carol (Ops)

Output: Aprovação do cliente rastreada

Prazo referência: No momento da entrega intermediária

5.5. Gestão de Riscos e Re-escopo

Ação: Quando projeto sinaliza risco de atraso >3 dias úteis ou mudança de escopo pelo cliente, Carol aciona Marco; juntos avaliam impacto, comunicam ao cliente e registram no Asana o motivo do ajuste de prazo ou custo adicional.

Responsável: Carol (Ops) + Marco Andolfato

Output: Risco registrado e plano de ação documentado

Prazo referência: Assim que identificado

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Nenhum projeto com task sem atualização há mais de 2 dias; [ ] Reunião semanal realizada e ata registrada; [ ] Cliente com entregas pendentes avisado com prazo claro; [ ] Todo re-escopo documentado no Asana; [ ] Projetos em risco sinalizados com cor/tag no Asana.

6.2 Erros Comuns a Evitar

Asana não atualizado → gestão cega, surpresas negativas. Sem reunião semanal → problemas acumulam sem solução. Cliente sem update → ansiedade e desconfiança. Re-escopo sem registro → conflito sobre o que foi ou não acordado.

  7. Ferramentas e Templates

Asana, Google Drive, Google Meet, frame.io, planilha de controle de projetos.

  8. SLAs e Prazos

Atualização de task no Asana: diária. Reunião semanal: toda segunda-feira. Update ao cliente: toda sexta para projetos ativos. Prazo de resposta do cliente: 48–72h.

  9. Fluxograma

Início → Projeto Aberto no Asana → Execução Diária (tasks) → Reunião Semanal → Update ao Cliente (sextas) → Entrega Intermediária → Aprovação do Cliente → Próxima Fase → ... → Encerramento (SOP OPS-08) → Fim

  10. Glossário

Kanban: método de gestão visual de fluxo de trabalho por colunas. Bloqueio: impedimento que impede avanço de uma task. Re-escopo: mudança formal no escopo original do projeto. SLA: Service Level Agreement — prazo acordado de resposta ou entrega.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Projetos (Fluxo Kanban)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todos os projetos em andamento sejam geridos com visibilidade, rastreabilidade e previsibilidade através do fluxo Kanban no Asana, com reuniões de acompanhamento semanais e alertas de risco proativos.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Gestão do ciclo de vida do projeto do kick-off ao encerramento, incluindo atualizações de status, gestão de bloqueios, comunicação com cliente e controle de prazo.</p><p><strong>2.2 Exclusões</strong></p><p>Execução técnica (responsabilidade de cada BU), negociação comercial de novos escopos (SOP OPS-06), onboarding inicial (SOP OPS-03).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Manter Asana atualizado, conduzir reuniões de acompanhamento, reportar riscos</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovar decisões de re-escopo, desbloquear impedimentos estratégicos</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Atualizar tasks, reportar bloqueios, entregar no prazo</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Aprovar entregas intermediárias no prazo combinado</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Projeto aberto no Asana com tasks e prazos definidos (SOP OPS-03 concluído); equipe responsável definida; canal de comunicação do projeto ativo.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Asana (board Kanban por projeto), Google Drive, Google Meet, planilha de controle geral de projetos TBO (status semanal).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Manutenção Diária do Kanban</strong></p><p>Ação: Cada responsável atualiza suas tasks no Asana diariamente: mover entre colunas (A fazer → Em andamento → Revisão interna → Aguardando cliente → Concluído), adicionar comentários de progresso e sinalizar bloqueios com tag [BLOQUEIO].</p><p>Responsável: Equipe de BU</p><p>Output: Asana atualizado diariamente</p><p>Prazo referência: Diário</p><p><strong>5.2. Reunião Semanal de Acompanhamento (Interna)</strong></p><p>Ação: Carol conduz reunião semanal de 30min com responsáveis de BU: revisar status de todos os projetos ativos, identificar projetos em risco de atraso (&gt;2 dias do prazo original), definir ação corretiva para cada bloqueio.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Ata semanal com status e ações corretivas</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.3. Atualização de Status ao Cliente</strong></p><p>Ação: Carol envia update semanal ao cliente para projetos com prazo de entrega em até 2 semanas: resumo do andamento, próxima entrega intermediária esperada, eventuais ajustes de prazo justificados.</p><p>Responsável: Carol (Ops)</p><p>Output: Cliente informado semanalmente</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.4. Gestão de Entregas para Aprovação do Cliente</strong></p><p>Ação: Quando task atinge coluna ''Aguardando cliente'', Carol notifica cliente com link de acesso (frame.io, Drive ou Asana), prazo de resposta (48–72h) e instrução de como aprovar ou comentar. Registrar data de envio.</p><p>Responsável: Carol (Ops)</p><p>Output: Aprovação do cliente rastreada</p><p>Prazo referência: No momento da entrega intermediária</p><p><strong>5.5. Gestão de Riscos e Re-escopo</strong></p><p>Ação: Quando projeto sinaliza risco de atraso &gt;3 dias úteis ou mudança de escopo pelo cliente, Carol aciona Marco; juntos avaliam impacto, comunicam ao cliente e registram no Asana o motivo do ajuste de prazo ou custo adicional.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Risco registrado e plano de ação documentado</p><p>Prazo referência: Assim que identificado</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Nenhum projeto com task sem atualização há mais de 2 dias; [ ] Reunião semanal realizada e ata registrada; [ ] Cliente com entregas pendentes avisado com prazo claro; [ ] Todo re-escopo documentado no Asana; [ ] Projetos em risco sinalizados com cor/tag no Asana.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Asana não atualizado → gestão cega, surpresas negativas. Sem reunião semanal → problemas acumulam sem solução. Cliente sem update → ansiedade e desconfiança. Re-escopo sem registro → conflito sobre o que foi ou não acordado.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Asana, Google Drive, Google Meet, frame.io, planilha de controle de projetos.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Atualização de task no Asana: diária. Reunião semanal: toda segunda-feira. Update ao cliente: toda sexta para projetos ativos. Prazo de resposta do cliente: 48–72h.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Projeto Aberto no Asana → Execução Diária (tasks) → Reunião Semanal → Update ao Cliente (sextas) → Entrega Intermediária → Aprovação do Cliente → Próxima Fase → ... → Encerramento (SOP OPS-08) → Fim</p><p><strong>  10. Glossário</strong></p><p>Kanban: método de gestão visual de fluxo de trabalho por colunas. Bloqueio: impedimento que impede avanço de uma task. Re-escopo: mudança formal no escopo original do projeto. SLA: Service Level Agreement — prazo acordado de resposta ou entrega.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-OPS-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os projetos em andamento sejam geridos com visibilidade, rastreabilidade e previsibilidade através do fluxo Kanban no Asana, com reuniões de acompanhamento semanais e alertas de risco proativos.', '<p>Garantir que todos os projetos em andamento sejam geridos com visibilidade, rastreabilidade e previsibilidade através do fluxo Kanban no Asana, com reuniões de acompanhamento semanais e alertas de risco proativos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Gestão do ciclo de vida do projeto do kick-off ao encerramento, incluindo atualizações de status, gestão de bloqueios, comunicação com cliente e controle de prazo.', '<p>Gestão do ciclo de vida do projeto do kick-off ao encerramento, incluindo atualizações de status, gestão de bloqueios, comunicação com cliente e controle de prazo.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Execução técnica (responsabilidade de cada BU), negociação comercial de novos escopos (SOP OPS-06), onboarding inicial (SOP OPS-03).', '<p>Execução técnica (responsabilidade de cada BU), negociação comercial de novos escopos (SOP OPS-06), onboarding inicial (SOP OPS-03).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Manter Asana atualizado, conduzir reuniões de acompanhamento, reportar riscos

Executor

—

Marco Andolfato

Aprovar decisões de re-escopo, desbloquear impedimentos estratégicos

Aprovador

—

Responsável de BU

Atualizar tasks, reportar bloqueios, entregar no prazo

Executor

—

Cliente

Aprovar entregas intermediárias no prazo combinado

Consultado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Manter Asana atualizado, conduzir reuniões de acompanhamento, reportar riscos</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovar decisões de re-escopo, desbloquear impedimentos estratégicos</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Atualizar tasks, reportar bloqueios, entregar no prazo</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Aprovar entregas intermediárias no prazo combinado</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto aberto no Asana com tasks e prazos definidos (SOP OPS-03 concluído); equipe responsável definida; canal de comunicação do projeto ativo.', '<p>Projeto aberto no Asana com tasks e prazos definidos (SOP OPS-03 concluído); equipe responsável definida; canal de comunicação do projeto ativo.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Asana (board Kanban por projeto), Google Drive, Google Meet, planilha de controle geral de projetos TBO (status semanal).', '<p>Asana (board Kanban por projeto), Google Drive, Google Meet, planilha de controle geral de projetos TBO (status semanal).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Manutenção Diária do Kanban', 'Ação: Cada responsável atualiza suas tasks no Asana diariamente: mover entre colunas (A fazer → Em andamento → Revisão interna → Aguardando cliente → Concluído), adicionar comentários de progresso e sinalizar bloqueios com tag [BLOQUEIO].

Responsável: Equipe de BU

Output: Asana atualizado diariamente

Prazo referência: Diário', '<p>Ação: Cada responsável atualiza suas tasks no Asana diariamente: mover entre colunas (A fazer → Em andamento → Revisão interna → Aguardando cliente → Concluído), adicionar comentários de progresso e sinalizar bloqueios com tag [BLOQUEIO].</p><p>Responsável: Equipe de BU</p><p>Output: Asana atualizado diariamente</p><p>Prazo referência: Diário</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Reunião Semanal de Acompanhamento (Interna)', 'Ação: Carol conduz reunião semanal de 30min com responsáveis de BU: revisar status de todos os projetos ativos, identificar projetos em risco de atraso (>2 dias do prazo original), definir ação corretiva para cada bloqueio.

Responsável: Carol (Ops) + Líderes de BU

Output: Ata semanal com status e ações corretivas

Prazo referência: Toda segunda-feira', '<p>Ação: Carol conduz reunião semanal de 30min com responsáveis de BU: revisar status de todos os projetos ativos, identificar projetos em risco de atraso (&gt;2 dias do prazo original), definir ação corretiva para cada bloqueio.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Ata semanal com status e ações corretivas</p><p>Prazo referência: Toda segunda-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Atualização de Status ao Cliente', 'Ação: Carol envia update semanal ao cliente para projetos com prazo de entrega em até 2 semanas: resumo do andamento, próxima entrega intermediária esperada, eventuais ajustes de prazo justificados.

Responsável: Carol (Ops)

Output: Cliente informado semanalmente

Prazo referência: Toda sexta-feira', '<p>Ação: Carol envia update semanal ao cliente para projetos com prazo de entrega em até 2 semanas: resumo do andamento, próxima entrega intermediária esperada, eventuais ajustes de prazo justificados.</p><p>Responsável: Carol (Ops)</p><p>Output: Cliente informado semanalmente</p><p>Prazo referência: Toda sexta-feira</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gestão de Entregas para Aprovação do Cliente', 'Ação: Quando task atinge coluna ''Aguardando cliente'', Carol notifica cliente com link de acesso (frame.io, Drive ou Asana), prazo de resposta (48–72h) e instrução de como aprovar ou comentar. Registrar data de envio.

Responsável: Carol (Ops)

Output: Aprovação do cliente rastreada

Prazo referência: No momento da entrega intermediária', '<p>Ação: Quando task atinge coluna ''Aguardando cliente'', Carol notifica cliente com link de acesso (frame.io, Drive ou Asana), prazo de resposta (48–72h) e instrução de como aprovar ou comentar. Registrar data de envio.</p><p>Responsável: Carol (Ops)</p><p>Output: Aprovação do cliente rastreada</p><p>Prazo referência: No momento da entrega intermediária</p>', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Gestão de Riscos e Re-escopo', 'Ação: Quando projeto sinaliza risco de atraso >3 dias úteis ou mudança de escopo pelo cliente, Carol aciona Marco; juntos avaliam impacto, comunicam ao cliente e registram no Asana o motivo do ajuste de prazo ou custo adicional.

Responsável: Carol (Ops) + Marco Andolfato

Output: Risco registrado e plano de ação documentado

Prazo referência: Assim que identificado', '<p>Ação: Quando projeto sinaliza risco de atraso &gt;3 dias úteis ou mudança de escopo pelo cliente, Carol aciona Marco; juntos avaliam impacto, comunicam ao cliente e registram no Asana o motivo do ajuste de prazo ou custo adicional.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Risco registrado e plano de ação documentado</p><p>Prazo referência: Assim que identificado</p>', 10, 'warning');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Nenhum projeto com task sem atualização há mais de 2 dias; [ ] Reunião semanal realizada e ata registrada; [ ] Cliente com entregas pendentes avisado com prazo claro; [ ] Todo re-escopo documentado no Asana; [ ] Projetos em risco sinalizados com cor/tag no Asana.', '<p>[ ] Nenhum projeto com task sem atualização há mais de 2 dias; [ ] Reunião semanal realizada e ata registrada; [ ] Cliente com entregas pendentes avisado com prazo claro; [ ] Todo re-escopo documentado no Asana; [ ] Projetos em risco sinalizados com cor/tag no Asana.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Asana não atualizado → gestão cega, surpresas negativas. Sem reunião semanal → problemas acumulam sem solução. Cliente sem update → ansiedade e desconfiança. Re-escopo sem registro → conflito sobre o que foi ou não acordado.', '<p>Asana não atualizado → gestão cega, surpresas negativas. Sem reunião semanal → problemas acumulam sem solução. Cliente sem update → ansiedade e desconfiança. Re-escopo sem registro → conflito sobre o que foi ou não acordado.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Asana, Google Drive, Google Meet, frame.io, planilha de controle de projetos.', '<p>Asana, Google Drive, Google Meet, frame.io, planilha de controle de projetos.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização de task no Asana: diária. Reunião semanal: toda segunda-feira. Update ao cliente: toda sexta para projetos ativos. Prazo de resposta do cliente: 48–72h.', '<p>Atualização de task no Asana: diária. Reunião semanal: toda segunda-feira. Update ao cliente: toda sexta para projetos ativos. Prazo de resposta do cliente: 48–72h.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Projeto Aberto no Asana → Execução Diária (tasks) → Reunião Semanal → Update ao Cliente (sextas) → Entrega Intermediária → Aprovação do Cliente → Próxima Fase → ... → Encerramento (SOP OPS-08) → Fim', '<p>Início → Projeto Aberto no Asana → Execução Diária (tasks) → Reunião Semanal → Update ao Cliente (sextas) → Entrega Intermediária → Aprovação do Cliente → Próxima Fase → ... → Encerramento (SOP OPS-08) → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Kanban: método de gestão visual de fluxo de trabalho por colunas. Bloqueio: impedimento que impede avanço de uma task. Re-escopo: mudança formal no escopo original do projeto. SLA: Service Level Agreement — prazo acordado de resposta ou entrega.', '<p>Kanban: método de gestão visual de fluxo de trabalho por colunas. Bloqueio: impedimento que impede avanço de uma task. Re-escopo: mudança formal no escopo original do projeto. SLA: Service Level Agreement — prazo acordado de resposta ou entrega.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-005: Controle Financeiro Faturas e Centros de Custo ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Controle Financeiro Faturas e Centros de Custo',
    'tbo-ops-005-controle-financeiro-faturas-e-centros-de-custo',
    'operacoes',
    'checklist',
    'Controle Financeiro (Faturas e Centros de Custo)',
    'Standard Operating Procedure

Controle Financeiro (Faturas e Centros de Custo)

Código

TBO-OPS-005

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.

  2. Escopo

2.1 O que está coberto

Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.

2.2 Exclusões

Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório

Executor

—

Marco Andolfato

Aprovar despesas acima de R$500, revisar relatório mensal

Aprovador

—

Contador Externo

Apuração fiscal, obrigações acessórias, SPED

Consultado

Informado

Líderes de BU

Informar despesas de projeto e aprovações de compra

Executor

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.

4.2 Ferramentas e Acessos

NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).



  5. Procedimento Passo a Passo

5.1. Emissão de Nota Fiscal

Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.

Responsável: Carol (Ops)

Output: NF emitida, enviada ao cliente e registrada

Prazo referência: Até 2 dias úteis após entrega aprovada

5.2. Controle de Recebíveis

Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (>5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso >15 dias.

Responsável: Carol (Ops)

Output: Planilha de recebíveis atualizada

Prazo referência: Toda sexta-feira

5.3. Categorização de Despesas

Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas >R$500 exigem aprovação de Marco.

Responsável: Carol (Ops) + Líderes de BU

Output: Despesas categorizadas em tempo real

Prazo referência: No mesmo dia da despesa

5.4. Conciliação Bancária (Quinzenal)

Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.

Responsável: Carol (Ops)

Output: Planilha conciliada com extrato bancário

Prazo referência: Dias 15 e último dia do mês

5.5. Relatório Mensal de Resultado

Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.

Responsável: Carol (Ops) + Marco Andolfato

Output: Relatório mensal aprovado por Marco

Prazo referência: Até o 5º dia útil do mês seguinte

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.

6.2 Erros Comuns a Evitar

NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.

  7. Ferramentas e Templates

NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.

  8. SLAs e Prazos

Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.

  9. Fluxograma

Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim

  10. Glossário

NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Controle Financeiro (Faturas e Centros de Custo)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-005</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.</p><p><strong>2.2 Exclusões</strong></p><p>Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovar despesas acima de R$500, revisar relatório mensal</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Contador Externo</p></td><td><p>Apuração fiscal, obrigações acessórias, SPED</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líderes de BU</p></td><td><p>Informar despesas de projeto e aprovações de compra</p></td><td><p>Executor</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Emissão de Nota Fiscal</strong></p><p>Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.</p><p>Responsável: Carol (Ops)</p><p>Output: NF emitida, enviada ao cliente e registrada</p><p>Prazo referência: Até 2 dias úteis após entrega aprovada</p><p><strong>5.2. Controle de Recebíveis</strong></p><p>Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (&gt;5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso &gt;15 dias.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha de recebíveis atualizada</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.3. Categorização de Despesas</strong></p><p>Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas &gt;R$500 exigem aprovação de Marco.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Despesas categorizadas em tempo real</p><p>Prazo referência: No mesmo dia da despesa</p><p><strong>5.4. Conciliação Bancária (Quinzenal)</strong></p><p>Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha conciliada com extrato bancário</p><p>Prazo referência: Dias 15 e último dia do mês</p><p><strong>5.5. Relatório Mensal de Resultado</strong></p><p>Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Relatório mensal aprovado por Marco</p><p>Prazo referência: Até o 5º dia útil do mês seguinte</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim</p><p><strong>  10. Glossário</strong></p><p>NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    4,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-005
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.', '<p>Garantir a emissão correta e pontual de notas fiscais, controle de contas a receber, categorização de despesas por centro de custo e disponibilidade de relatório financeiro mensal para tomada de decisão.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.', '<p>Emissão de NF-e, controle de recebíveis, categorização de despesas por BU/projeto, conciliação bancária básica e relatório mensal de resultado por centro de custo.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.', '<p>Contabilidade fiscal e apuração de impostos (responsabilidade do contador externo), folha de pagamento (RH), investimentos e captação de recursos.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório

Executor

—

Marco Andolfato

Aprovar despesas acima de R$500, revisar relatório mensal

Aprovador

—

Contador Externo

Apuração fiscal, obrigações acessórias, SPED

Consultado

Informado

Líderes de BU

Informar despesas de projeto e aprovações de compra

Executor

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Emitir NFs, controlar recebíveis, categorizar despesas, preparar relatório</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovar despesas acima de R$500, revisar relatório mensal</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Contador Externo</p></td><td><p>Apuração fiscal, obrigações acessórias, SPED</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Líderes de BU</p></td><td><p>Informar despesas de projeto e aprovações de compra</p></td><td><p>Executor</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.', '<p>Contrato do cliente com valores e condições de pagamento; notas de despesas e recibos organizados por BU; acesso ao sistema de emissão de NF (Prefeitura ou emissor como NFE.io); planilha financeira TBO atualizada.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).', '<p>NFE.io ou sistema municipal de emissão de NFS-e, planilha financeira Google Sheets (modelo TBO), Supabase (registro de transações), internet banking, Google Drive (/financeiro).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Emissão de Nota Fiscal', 'Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.

Responsável: Carol (Ops)

Output: NF emitida, enviada ao cliente e registrada

Prazo referência: Até 2 dias úteis após entrega aprovada', '<p>Ação: Ao concluir entrega faturável (conforme contrato), Carol emite NFS-e no sistema municipal informando: tomador, descrição do serviço, valor, alíquotas de imposto. Envia PDF ao cliente por e-mail. Registra na planilha de recebíveis.</p><p>Responsável: Carol (Ops)</p><p>Output: NF emitida, enviada ao cliente e registrada</p><p>Prazo referência: Até 2 dias úteis após entrega aprovada</p>', 6, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Controle de Recebíveis', 'Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (>5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso >15 dias.

Responsável: Carol (Ops)

Output: Planilha de recebíveis atualizada

Prazo referência: Toda sexta-feira', '<p>Ação: Carol atualiza planilha de recebíveis semanalmente: marcar NFs pagas, identificar NFs em atraso (&gt;5 dias do vencimento), acionar cliente via WhatsApp para cobrança amigável; escalar para Marco se atraso &gt;15 dias.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha de recebíveis atualizada</p><p>Prazo referência: Toda sexta-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Categorização de Despesas', 'Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas >R$500 exigem aprovação de Marco.

Responsável: Carol (Ops) + Líderes de BU

Output: Despesas categorizadas em tempo real

Prazo referência: No mesmo dia da despesa', '<p>Ação: Ao realizar qualquer despesa de projeto, Carol (ou líder de BU) registra na planilha: data, valor, fornecedor, centro de custo (BU: AV / GAM / OPS / ADM), projeto vinculado, comprovante no Drive. Despesas &gt;R$500 exigem aprovação de Marco.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Despesas categorizadas em tempo real</p><p>Prazo referência: No mesmo dia da despesa</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Conciliação Bancária (Quinzenal)', 'Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.

Responsável: Carol (Ops)

Output: Planilha conciliada com extrato bancário

Prazo referência: Dias 15 e último dia do mês', '<p>Ação: Carol compara extrato bancário com planilha de recebíveis e despesas: identificar recebimentos não registrados, despesas não categorizadas e transferências internas; ajustar planilha.</p><p>Responsável: Carol (Ops)</p><p>Output: Planilha conciliada com extrato bancário</p><p>Prazo referência: Dias 15 e último dia do mês</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Mensal de Resultado', 'Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.

Responsável: Carol (Ops) + Marco Andolfato

Output: Relatório mensal aprovado por Marco

Prazo referência: Até o 5º dia útil do mês seguinte', '<p>Ação: Nos primeiros 5 dias úteis do mês seguinte, Carol prepara relatório: receita por cliente e BU, despesas por centro de custo, margem por BU, inadimplência, comparativo com mês anterior. Apresentar a Marco em reunião de 30min.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Relatório mensal aprovado por Marco</p><p>Prazo referência: Até o 5º dia útil do mês seguinte</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.', '<p>[ ] NF emitida em até 2 dias após entrega aprovada; [ ] Zero NFs enviadas com dados do cliente incorretos; [ ] Todas as despesas com comprovante no Drive; [ ] Conciliação bancária realizada 2x por mês; [ ] Relatório mensal entregue até o 5º dia útil.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.', '<p>NF emitida com CNPJ errado do cliente → cancelamento e reemissão, atraso no pagamento. Despesa sem comprovante → impossibilidade de dedução fiscal. Recebível em atraso não cobrado → fluxo de caixa negativo. Relatório mensal atrasado → decisões sem base financeira.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.', '<p>NFE.io, Google Sheets, Supabase, Internet Banking, Google Drive.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.', '<p>Emissão de NF: 2 dias úteis pós-entrega. Atualização de recebíveis: semanal (sextas). Categorização de despesa: no mesmo dia. Relatório mensal: até 5º dia útil.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim', '<p>Início → Entrega Aprovada → Emissão de NF → Envio ao Cliente → Controle de Recebível → Pagamento Recebido (ou Cobrança) → Despesas Categorizadas → Conciliação Quinzenal → Relatório Mensal → Marco Revisa → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.', '<p>NFS-e: Nota Fiscal de Serviços eletrônica. Recebível: valor a receber de cliente já faturado. Centro de custo: categoria de agrupamento de despesas por área ou projeto. Conciliação bancária: processo de comparar registros internos com extrato bancário.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-006: Precificação e Proposta Comercial ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Precificação e Proposta Comercial',
    'tbo-ops-006-precificacao-e-proposta-comercial',
    'operacoes',
    'checklist',
    'Precificação e Proposta Comercial',
    'Standard Operating Procedure

Precificação e Proposta Comercial

Código

TBO-OPS-006

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.

  2. Escopo

2.1 O que está coberto

Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.

2.2 Exclusões

Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coletar informações, calcular estimativa, montar documento de proposta

Executor

—

Marco Andolfato

Validar escopo, aprovar precificação, assinar proposta final

Aprovador

—

Líder de BU

Estimar esforço técnico e prazo realista por tipo de entrega

Consultado

—

Cliente / Prospect

Fornecer briefing comercial, receber e analisar proposta

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.

4.2 Ferramentas e Acessos

Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.



  5. Procedimento Passo a Passo

5.1. Recebimento e Análise do Briefing Comercial

Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.

Responsável: Carol (Ops) + Marco Andolfato

Output: Briefing comercial registrado

Prazo referência: Dia 1

5.2. Estimativa de Esforço por BU

Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.

Responsável: Carol (Ops) + Líderes de BU

Output: Estimativa de esforço por BU validada

Prazo referência: Dia 2

5.3. Cálculo de Preço

Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).

Responsável: Carol (Ops) + Marco Andolfato

Output: Preço calculado e aprovado por Marco

Prazo referência: Dia 2–3

5.4. Elaboração da Proposta

Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).

Responsável: Carol (Ops)

Output: Proposta elaborada em PDF

Prazo referência: Dia 3–4

5.5. Aprovação Interna e Envio

Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.

Responsável: Marco Andolfato + Carol (Ops)

Output: Proposta enviada ao cliente

Prazo referência: Dia 4–5

5.6. Follow-up e Fechamento

Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.

Responsável: Carol (Ops) + Marco Andolfato

Output: Proposta aceita → contrato iniciado / Negada → motivo registrado

Prazo referência: Dia 7 (2 dias após envio)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.

6.2 Erros Comuns a Evitar

Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.

  7. Ferramentas e Templates

Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).

  8. SLAs e Prazos

Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.

  9. Fluxograma

Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim

  10. Glossário

Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Precificação e Proposta Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.</p><p><strong>2.2 Exclusões</strong></p><p>Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coletar informações, calcular estimativa, montar documento de proposta</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Validar escopo, aprovar precificação, assinar proposta final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Estimar esforço técnico e prazo realista por tipo de entrega</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Prospect</p></td><td><p>Fornecer briefing comercial, receber e analisar proposta</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Recebimento e Análise do Briefing Comercial</strong></p><p>Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Briefing comercial registrado</p><p>Prazo referência: Dia 1</p><p><strong>5.2. Estimativa de Esforço por BU</strong></p><p>Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Estimativa de esforço por BU validada</p><p>Prazo referência: Dia 2</p><p><strong>5.3. Cálculo de Preço</strong></p><p>Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Preço calculado e aprovado por Marco</p><p>Prazo referência: Dia 2–3</p><p><strong>5.4. Elaboração da Proposta</strong></p><p>Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).</p><p>Responsável: Carol (Ops)</p><p>Output: Proposta elaborada em PDF</p><p>Prazo referência: Dia 3–4</p><p><strong>5.5. Aprovação Interna e Envio</strong></p><p>Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Proposta enviada ao cliente</p><p>Prazo referência: Dia 4–5</p><p><strong>5.6. Follow-up e Fechamento</strong></p><p>Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Proposta aceita → contrato iniciado / Negada → motivo registrado</p><p>Prazo referência: Dia 7 (2 dias após envio)</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim</p><p><strong>  10. Glossário</strong></p><p>Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    5,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.', '<p>Garantir que toda proposta comercial da TBO seja elaborada com precificação consistente, margem adequada por BU, apresentação profissional e aprovação interna de Marco antes do envio ao cliente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.', '<p>Recebimento de solicitação comercial, estimativa de esforço por BU, cálculo de preço com base em tabela interna, elaboração do documento de proposta e envio ao cliente.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).', '<p>Negociação de contratos e aspectos jurídicos (assessoria jurídica), onboarding do cliente após aceite (SOP OPS-02), execução dos projetos (SOPs de BU).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coletar informações, calcular estimativa, montar documento de proposta

Executor

—

Marco Andolfato

Validar escopo, aprovar precificação, assinar proposta final

Aprovador

—

Líder de BU

Estimar esforço técnico e prazo realista por tipo de entrega

Consultado

—

Cliente / Prospect

Fornecer briefing comercial, receber e analisar proposta

Informado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coletar informações, calcular estimativa, montar documento de proposta</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Validar escopo, aprovar precificação, assinar proposta final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Líder de BU</p></td><td><p>Estimar esforço técnico e prazo realista por tipo de entrega</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Prospect</p></td><td><p>Fornecer briefing comercial, receber e analisar proposta</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.', '<p>Briefing comercial do cliente (tipo de projeto, escopo desejado, prazo, volume); tabela de precificação interna TBO atualizada; disponibilidade de equipe para o período.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.', '<p>Planilha de precificação TBO (Google Sheets), template de proposta (Google Slides ou Canva), Google Drive, e-mail corporativo.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Recebimento e Análise do Briefing Comercial', 'Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.

Responsável: Carol (Ops) + Marco Andolfato

Output: Briefing comercial registrado

Prazo referência: Dia 1', '<p>Ação: Carol recebe demanda comercial (via indicação, inbound ou prospecção ativa); realiza call de 30min com prospect para entender escopo, prazo, volume e expectativa de investimento; registra no CRM/planilha.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Briefing comercial registrado</p><p>Prazo referência: Dia 1</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Estimativa de Esforço por BU', 'Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.

Responsável: Carol (Ops) + Líderes de BU

Output: Estimativa de esforço por BU validada

Prazo referência: Dia 2', '<p>Ação: Carol consulta líderes de BU envolvidos para estimar horas/dias de trabalho por fase; verificar disponibilidade de equipe e câmeras/equipamentos para o prazo solicitado; registrar estimativas na planilha.</p><p>Responsável: Carol (Ops) + Líderes de BU</p><p>Output: Estimativa de esforço por BU validada</p><p>Prazo referência: Dia 2</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Cálculo de Preço', 'Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).

Responsável: Carol (Ops) + Marco Andolfato

Output: Preço calculado e aprovado por Marco

Prazo referência: Dia 2–3', '<p>Ação: Carol aplica tabela de precificação interna: custo por hora/entregável por BU, custos diretos (locações, atores, equipamentos externos, licenças de trilha), overhead e margem alvo. Marco revisa e ajusta conforme estratégia de precificação (cliente novo, volume, urgência).</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Preço calculado e aprovado por Marco</p><p>Prazo referência: Dia 2–3</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Elaboração da Proposta', 'Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).

Responsável: Carol (Ops)

Output: Proposta elaborada em PDF

Prazo referência: Dia 3–4', '<p>Ação: Carol monta documento de proposta no template TBO: apresentação da agência (1 slide), compreensão do briefing, escopo detalhado por entregável, investimento por item e total, prazo de execução, condições de pagamento, validade da proposta (15 dias).</p><p>Responsável: Carol (Ops)</p><p>Output: Proposta elaborada em PDF</p><p>Prazo referência: Dia 3–4</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação Interna e Envio', 'Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.

Responsável: Marco Andolfato + Carol (Ops)

Output: Proposta enviada ao cliente

Prazo referência: Dia 4–5', '<p>Ação: Marco revisa proposta final: checagem de escopo, preço, prazo e linguagem; assina digitalmente ou aprova por e-mail interno; Carol envia ao prospect com e-mail de encaminhamento personalizado e agenda follow-up em 48h.</p><p>Responsável: Marco Andolfato + Carol (Ops)</p><p>Output: Proposta enviada ao cliente</p><p>Prazo referência: Dia 4–5</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Follow-up e Fechamento', 'Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.

Responsável: Carol (Ops) + Marco Andolfato

Output: Proposta aceita → contrato iniciado / Negada → motivo registrado

Prazo referência: Dia 7 (2 dias após envio)', '<p>Ação: Carol realiza follow-up em 48h após envio; registra resposta no CRM; se aceita: inicia SOP OPS-02 (Onboarding de Cliente); se negada: registrar motivo para análise; se negociação: escalar para Marco.</p><p>Responsável: Carol (Ops) + Marco Andolfato</p><p>Output: Proposta aceita → contrato iniciado / Negada → motivo registrado</p><p>Prazo referência: Dia 7 (2 dias após envio)</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.', '<p>[ ] Briefing comercial documentado antes de qualquer cálculo; [ ] Margem mínima por BU respeitada; [ ] Proposta aprovada por Marco antes do envio; [ ] Template de proposta TBO utilizado (sem versões genéricas); [ ] Prazo de validade de 15 dias incluído; [ ] Follow-up agendado no momento do envio.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.', '<p>Proposta enviada sem aprovação de Marco → preço abaixo da margem mínima. Estimativa de esforço sem consultar BU → prazo inexequível. Proposta genérica sem customização → taxa de conversão baixa. Follow-up não realizado → perda de venda por inércia.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).', '<p>Google Sheets (precificação), Google Slides / Canva (template proposta), Google Drive, Gmail, CRM (planilha ou ferramenta).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.', '<p>Proposta enviada: até 5 dias úteis após briefing comercial. Follow-up: 48h após envio. Validade da proposta: 15 dias corridos.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim', '<p>Início → Briefing Comercial → Estimativa de Esforço (BUs) → Cálculo de Preço → Marco Aprova → Elaboração da Proposta → Marco Revisa e Aprova → Envio ao Cliente → Follow-up 48h → Aceite → Onboarding (SOP OPS-02) / Negada → Registro → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.', '<p>Margem: diferença percentual entre receita e custos diretos+overhead. Overhead: custos indiretos da agência (aluguel, software, admin). Follow-up: contato proativo para verificar decisão do cliente. Validade da proposta: período durante o qual os valores são garantidos.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-OPS-007: Controle de Qualidade Geral QA Cross BU ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Controle de Qualidade Geral QA Cross BU',
    'tbo-ops-007-controle-de-qualidade-geral-qa-cross-bu',
    'operacoes',
    'checklist',
    'Controle de Qualidade Geral (QA Cross-BU)',
    'Standard Operating Procedure

Controle de Qualidade Geral (QA Cross-BU)

Código

TBO-OPS-007

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Operações

Responsável

Carol (Coordenadora de Operações)

Aprovador

Marco Andolfato



  1. Objetivo

Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.

  2. Escopo

2.1 O que está coberto

Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.

2.2 Exclusões

Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o processo de QA, aplicar checklist, registrar não conformidades

Executor

—

Marco Andolfato

Revisão criativa final (vídeos, peças visuais, aplicações 3D)

Aprovador

—

Responsável de BU

Corrigir não conformidades identificadas no QA

Executor

—

Cliente

Aprovação final após QA interno aprovado

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).

4.2 Ferramentas e Acessos

Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.



  5. Procedimento Passo a Passo

5.1. Sinalização de Prontidão para QA

Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.

Responsável: Responsável de BU

Output: Material disponível para QA com contexto

Prazo referência: Antes do envio ao cliente

5.2. Aplicação do Checklist de QA

Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.

Responsável: Carol (Ops)

Output: Checklist de QA preenchido com resultado

Prazo referência: Até 1 dia útil após sinalização

5.3. Revisão Criativa por Marco (entregas AV e GAM)

Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.

Responsável: Marco Andolfato

Output: Pontos de ajuste criativos registrados

Prazo referência: Até 1 dia útil após checklist de Carol

5.4. Correção de Não Conformidades

Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.

Responsável: Responsável de BU + Carol (Ops)

Output: Não conformidades corrigidas e verificadas

Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)

5.5. Liberação para Envio ao Cliente

Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).

Responsável: Carol (Ops)

Output: Entrega enviada ao cliente com QA aprovado

Prazo referência: Após aprovação do QA

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.

6.2 Erros Comuns a Evitar

Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.

  7. Ferramentas e Templates

Google Sheets (checklists), frame.io, Asana, Google Drive.

  8. SLAs e Prazos

QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.

  9. Fluxograma

Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim

  10. Glossário

QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

',
    '<p><em>Standard Operating Procedure</em></p><p><strong>Controle de Qualidade Geral (QA Cross-BU)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-OPS-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Operações</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Carol (Coordenadora de Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.</p><p><strong>2.2 Exclusões</strong></p><p>Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar o processo de QA, aplicar checklist, registrar não conformidades</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Revisão criativa final (vídeos, peças visuais, aplicações 3D)</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Corrigir não conformidades identificadas no QA</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Aprovação final após QA interno aprovado</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Sinalização de Prontidão para QA</strong></p><p>Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.</p><p>Responsável: Responsável de BU</p><p>Output: Material disponível para QA com contexto</p><p>Prazo referência: Antes do envio ao cliente</p><p><strong>5.2. Aplicação do Checklist de QA</strong></p><p>Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de QA preenchido com resultado</p><p>Prazo referência: Até 1 dia útil após sinalização</p><p><strong>5.3. Revisão Criativa por Marco (entregas AV e GAM)</strong></p><p>Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.</p><p>Responsável: Marco Andolfato</p><p>Output: Pontos de ajuste criativos registrados</p><p>Prazo referência: Até 1 dia útil após checklist de Carol</p><p><strong>5.4. Correção de Não Conformidades</strong></p><p>Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.</p><p>Responsável: Responsável de BU + Carol (Ops)</p><p>Output: Não conformidades corrigidas e verificadas</p><p>Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)</p><p><strong>5.5. Liberação para Envio ao Cliente</strong></p><p>Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).</p><p>Responsável: Carol (Ops)</p><p>Output: Entrega enviada ao cliente com QA aprovado</p><p>Prazo referência: Após aprovação do QA</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Sheets (checklists), frame.io, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.</p><p><strong>  9. Fluxograma</strong></p><p>Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim</p><p><strong>  10. Glossário</strong></p><p>QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'critical',
    ARRAY['operacoes','processo','gestao','entrega','qualidade','cliente']::TEXT[],
    6,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-OPS-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.', '<p>Garantir que toda entrega ao cliente passe por revisão de qualidade padronizada antes do envio, independentemente da BU de origem, reduzindo retrabalho pós-entrega e protegendo a reputação da TBO.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.', '<p>Revisão de qualidade de entregas de Audiovisual, Gamificação e Operações antes do envio ao cliente; checklist por tipo de entrega; registro de não conformidades e fluxo de correção.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.', '<p>Revisões técnicas de engenharia (estrutural, elétrica), revisões jurídicas de contrato, auditorias externas.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Coordenar o processo de QA, aplicar checklist, registrar não conformidades

Executor

—

Marco Andolfato

Revisão criativa final (vídeos, peças visuais, aplicações 3D)

Aprovador

—

Responsável de BU

Corrigir não conformidades identificadas no QA

Executor

—

Cliente

Aprovação final após QA interno aprovado

Informado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Coordenar o processo de QA, aplicar checklist, registrar não conformidades</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Revisão criativa final (vídeos, peças visuais, aplicações 3D)</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Responsável de BU</p></td><td><p>Corrigir não conformidades identificadas no QA</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente</p></td><td><p>Aprovação final após QA interno aprovado</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).', '<p>Entrega técnica concluída pelo responsável de BU; checklist de QA por tipo de entrega (AV, GAM, OPS); acesso ao material (Drive, frame.io, build de aplicação).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.', '<p>Google Sheets (checklists de QA), frame.io (comentários em vídeo), Asana (task de QA em cada projeto), Google Drive.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Sinalização de Prontidão para QA', 'Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.

Responsável: Responsável de BU

Output: Material disponível para QA com contexto

Prazo referência: Antes do envio ao cliente', '<p>Ação: Responsável de BU move task para coluna ''Revisão Interna'' no Asana e notifica Carol; disponibiliza o material no local correto (frame.io para vídeos, Drive para documentos, link de build para apps); descreve o que foi produzido e pontos de atenção.</p><p>Responsável: Responsável de BU</p><p>Output: Material disponível para QA com contexto</p><p>Prazo referência: Antes do envio ao cliente</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Aplicação do Checklist de QA', 'Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.

Responsável: Carol (Ops)

Output: Checklist de QA preenchido com resultado

Prazo referência: Até 1 dia útil após sinalização', '<p>Ação: Carol aplica checklist específico por tipo: AV (formatos, legenda, logo, grading), GAM (framerate, fluxo, dados corretos, responsividade), OPS (dados do cliente corretos, links ativos, formatação). Registra itens aprovados e não conformidades.</p><p>Responsável: Carol (Ops)</p><p>Output: Checklist de QA preenchido com resultado</p><p>Prazo referência: Até 1 dia útil após sinalização</p>', 7, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revisão Criativa por Marco (entregas AV e GAM)', 'Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.

Responsável: Marco Andolfato

Output: Pontos de ajuste criativos registrados

Prazo referência: Até 1 dia útil após checklist de Carol', '<p>Ação: Para entregas de Audiovisual e Gamificação, Marco realiza revisão criativa paralela: avalia identidade visual, nível de acabamento, narrativa, movimento de câmera ou experiência do usuário; registra pontos de ajuste no frame.io ou documento.</p><p>Responsável: Marco Andolfato</p><p>Output: Pontos de ajuste criativos registrados</p><p>Prazo referência: Até 1 dia útil após checklist de Carol</p>', 8, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Correção de Não Conformidades', 'Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.

Responsável: Responsável de BU + Carol (Ops)

Output: Não conformidades corrigidas e verificadas

Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)', '<p>Ação: Responsável de BU corrige todos os itens sinalizados no QA (checklist + revisão de Marco); notifica Carol após correção; Carol re-verifica itens críticos.</p><p>Responsável: Responsável de BU + Carol (Ops)</p><p>Output: Não conformidades corrigidas e verificadas</p><p>Prazo referência: Conforme urgência do projeto (geralmente 1–2 dias)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Liberação para Envio ao Cliente', 'Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).

Responsável: Carol (Ops)

Output: Entrega enviada ao cliente com QA aprovado

Prazo referência: Após aprovação do QA', '<p>Ação: Carol atualiza checklist de QA com status ''Aprovado''; move task para ''Aguardando Cliente'' no Asana; envia entrega ao cliente com mensagem padronizada de encaminhamento e prazo de feedback (48–72h).</p><p>Responsável: Carol (Ops)</p><p>Output: Entrega enviada ao cliente com QA aprovado</p><p>Prazo referência: Após aprovação do QA</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.', '<p>[ ] Nenhuma entrega ao cliente sem checklist de QA preenchido; [ ] Revisão criativa de Marco realizada em 100% das entregas AV e GAM; [ ] Não conformidades corrigidas antes do envio; [ ] Task no Asana em ''Aguardando Cliente'' antes do envio; [ ] Registro de não conformidades mantido para análise de padrão.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.', '<p>Envio ao cliente sem QA → erros chegam ao cliente, desgaste da relação. QA feito de forma superficial → não conformidades passam despercebidas. Não conformidade corrigida sem re-verificação → problema persiste. Sem histórico de QA → impossível identificar padrões de erro por BU.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Sheets (checklists), frame.io, Asana, Google Drive.', '<p>Google Sheets (checklists), frame.io, Asana, Google Drive.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.', '<p>QA (checklist Carol): até 1 dia útil após sinalização. Revisão criativa Marco: até 1 dia útil. Correção de não conformidades: 1–2 dias úteis. Liberação para cliente: após QA 100% aprovado.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim', '<p>Início → BU sinaliza prontidão (Asana) → Carol aplica checklist QA → Marco revisão criativa (AV/GAM) → Não conformidades? → Sim: BU corrige → re-verificação → Não: Aprovado → Envio ao Cliente → Feedback → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.', '<p>QA: Quality Assurance — processo de verificação de qualidade antes da entrega. Não conformidade: item que não atende ao padrão esperado. Checklist: lista de verificação com critérios binários (ok / não ok). Cross-BU: processo que atravessa todas as unidades de negócio.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-OPS-008: Encerramento e Pós entrega ──
END $$;