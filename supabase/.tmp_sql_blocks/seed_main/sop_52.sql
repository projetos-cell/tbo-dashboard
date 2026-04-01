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
END $$;