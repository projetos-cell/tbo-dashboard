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
END $$;