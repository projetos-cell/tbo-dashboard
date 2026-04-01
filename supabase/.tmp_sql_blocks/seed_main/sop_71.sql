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
    'Desligamento e Offboarding',
    'tbo-rh-004-desligamento-e-offboarding',
    'recursos-humanos',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Desligamento e Offboarding

Código

TBO-RH-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Recursos Humanos (People)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Padronizar o processo de desligamento para garantir transição adequada de conhecimento, revogação imediata de acessos e conformidade legal.

2. Escopo

2.1 O que está coberto

Decisão e comunicação, transição de conhecimento, revogação de acessos, aspectos legais e entrevista de saída.

2.2 Exclusões

Avaliação de performance (SOP-RH-003), contratação de substituto (SOP-RH-001).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Comunicar desligamento, conduzir entrevista de saída

Executor

---

Ruy

Participar da decisão de desligamento

Aprovador

---

Carol (Ops)

Revogar acessos, coordenar aspectos legais

Executor

---

PO da BU

Redistribuir projetos e garantir handoff de conhecimento

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Decisão de desligamento validada pelos sócios; feedbacks documentados (SOP-RH-003); lista de projetos em andamento do colaborador.

4.2 Ferramentas e Acessos

TBO OS (People, acessos), Google Workspace (revogar), ClickSign (rescisão), Google Meet.

5. Procedimento Passo a Passo

5.1. Decisão e Comunicação

Ação: Decisão conjunta Marco + Ruy (com input do PO). Comunicação ao colaborador por Marco em reunião privada (presencial ou call).

Responsável: Marco + Ruy

Output: Colaborador comunicado

Prazo referência: Conforme decisão

5.2. Transição de Conhecimento

Ação: PO mapeia projetos em andamento e redistribui. Colaborador documenta status de cada tarefa no TBO OS. Handoff de arquivos e acessos de cliente.

Responsável: PO + Colaborador

Output: Projetos redistribuídos e documentados

Prazo referência: Até o último dia

5.3. Revogação de Acessos

Ação: Carol revoga no dia do desligamento efetivo: TBO OS, Google Workspace, ferramentas de design, repositórios, canais de comunicação.

Responsável: Carol (Ops)

Output: Todos os acessos revogados

Prazo referência: Até 2h após comunicação

5.4. Aspectos Legais e Entrevista de Saída

Ação: Carol coordena rescisão com contabilidade (CLT) ou encerramento de contrato (PJ) via ClickSign. Marco conduz entrevista de saída para captar feedback. Registro no TBO OS.

Responsável: Carol + Marco

Output: Documentação legal concluída, feedback registrado

Prazo referência: Até 5 dias úteis após desligamento

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Decisão documentada com feedbacks anteriores

[ ] Comunicação realizada pessoalmente

[ ] Projetos redistribuídos e documentados no TBO OS

[ ] Acessos revogados em até 2h

[ ] Rescisão/encerramento de contrato formalizado

[ ] Entrevista de saída realizada e registrada

6.2 Erros Comuns a Evitar

Acessos não revogados imediatamente → risco de segurança da informação

Desligamento sem feedbacks documentados → risco trabalhista

Não fazer entrevista de saída → perda de aprendizado organizacional

7. Ferramentas e Templates

TBO OS (People), Google Workspace, ClickSign, Google Meet.

8. SLAs e Prazos

Revogação de acessos: até 2h após comunicação

Transição de conhecimento: até último dia

Documentação legal: até 5 dias úteis

Regra: acessos revogados antes de qualquer outra etapa

9. Fluxograma

Decisão de Desligamento → Comunicação (Marco) → Revogação de Acessos (2h) → Transição de Conhecimento → Aspectos Legais (ClickSign) → Entrevista de Saída → Registro no TBO OS → Fim

10. Glossário

Offboarding: processo estruturado de saída de um colaborador.

Revogação: remoção imediata de todos os acessos a sistemas e dados.

Entrevista de saída: conversa final para captar feedback sobre processos e cultura.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Desligamento e Offboarding</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-RH-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Recursos Humanos (People)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Padronizar o processo de desligamento para garantir transição adequada de conhecimento, revogação imediata de acessos e conformidade legal.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Decisão e comunicação, transição de conhecimento, revogação de acessos, aspectos legais e entrevista de saída.</p><p><strong>2.2 Exclusões</strong></p><p>Avaliação de performance (SOP-RH-003), contratação de substituto (SOP-RH-001).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Comunicar desligamento, conduzir entrevista de saída</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Participar da decisão de desligamento</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Revogar acessos, coordenar aspectos legais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Redistribuir projetos e garantir handoff de conhecimento</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Decisão de desligamento validada pelos sócios; feedbacks documentados (SOP-RH-003); lista de projetos em andamento do colaborador.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (People, acessos), Google Workspace (revogar), ClickSign (rescisão), Google Meet.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Decisão e Comunicação</strong></p><p>Ação: Decisão conjunta Marco + Ruy (com input do PO). Comunicação ao colaborador por Marco em reunião privada (presencial ou call).</p><p>Responsável: Marco + Ruy</p><p>Output: Colaborador comunicado</p><p>Prazo referência: Conforme decisão</p><p><strong>5.2. Transição de Conhecimento</strong></p><p>Ação: PO mapeia projetos em andamento e redistribui. Colaborador documenta status de cada tarefa no TBO OS. Handoff de arquivos e acessos de cliente.</p><p>Responsável: PO + Colaborador</p><p>Output: Projetos redistribuídos e documentados</p><p>Prazo referência: Até o último dia</p><p><strong>5.3. Revogação de Acessos</strong></p><p>Ação: Carol revoga no dia do desligamento efetivo: TBO OS, Google Workspace, ferramentas de design, repositórios, canais de comunicação.</p><p>Responsável: Carol (Ops)</p><p>Output: Todos os acessos revogados</p><p>Prazo referência: Até 2h após comunicação</p><p><strong>5.4. Aspectos Legais e Entrevista de Saída</strong></p><p>Ação: Carol coordena rescisão com contabilidade (CLT) ou encerramento de contrato (PJ) via ClickSign. Marco conduz entrevista de saída para captar feedback. Registro no TBO OS.</p><p>Responsável: Carol + Marco</p><p>Output: Documentação legal concluída, feedback registrado</p><p>Prazo referência: Até 5 dias úteis após desligamento</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Decisão documentada com feedbacks anteriores</li><li>[ ] Comunicação realizada pessoalmente</li><li>[ ] Projetos redistribuídos e documentados no TBO OS</li><li>[ ] Acessos revogados em até 2h</li><li>[ ] Rescisão/encerramento de contrato formalizado</li><li>[ ] Entrevista de saída realizada e registrada</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Acessos não revogados imediatamente → risco de segurança da informação</li><li>Desligamento sem feedbacks documentados → risco trabalhista</li><li>Não fazer entrevista de saída → perda de aprendizado organizacional</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (People), Google Workspace, ClickSign, Google Meet.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Revogação de acessos: até 2h após comunicação</li><li>Transição de conhecimento: até último dia</li><li>Documentação legal: até 5 dias úteis</li><li>Regra: acessos revogados antes de qualquer outra etapa</li></ul><p><strong>9. Fluxograma</strong></p><p>Decisão de Desligamento → Comunicação (Marco) → Revogação de Acessos (2h) → Transição de Conhecimento → Aspectos Legais (ClickSign) → Entrevista de Saída → Registro no TBO OS → Fim</p><p><strong>10. Glossário</strong></p><p>Offboarding: processo estruturado de saída de um colaborador.</p><p>Revogação: remoção imediata de todos os acessos a sistemas e dados.</p><p>Entrevista de saída: conversa final para captar feedback sobre processos e cultura.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['rh','pessoas','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-RH-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar o processo de desligamento para garantir transição adequada de conhecimento, revogação imediata de acessos e conformidade legal.', '<p>Padronizar o processo de desligamento para garantir transição adequada de conhecimento, revogação imediata de acessos e conformidade legal.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Decisão e comunicação, transição de conhecimento, revogação de acessos, aspectos legais e entrevista de saída.', '<p>Decisão e comunicação, transição de conhecimento, revogação de acessos, aspectos legais e entrevista de saída.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Avaliação de performance (SOP-RH-003), contratação de substituto (SOP-RH-001).', '<p>Avaliação de performance (SOP-RH-003), contratação de substituto (SOP-RH-001).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Comunicar desligamento, conduzir entrevista de saída

Executor

---

Ruy

Participar da decisão de desligamento

Aprovador

---

Carol (Ops)

Revogar acessos, coordenar aspectos legais

Executor

---

PO da BU

Redistribuir projetos e garantir handoff de conhecimento

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Comunicar desligamento, conduzir entrevista de saída</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Participar da decisão de desligamento</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Revogar acessos, coordenar aspectos legais</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Redistribuir projetos e garantir handoff de conhecimento</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Decisão de desligamento validada pelos sócios; feedbacks documentados (SOP-RH-003); lista de projetos em andamento do colaborador.', '<p>Decisão de desligamento validada pelos sócios; feedbacks documentados (SOP-RH-003); lista de projetos em andamento do colaborador.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (People, acessos), Google Workspace (revogar), ClickSign (rescisão), Google Meet.', '<p>TBO OS (People, acessos), Google Workspace (revogar), ClickSign (rescisão), Google Meet.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Decisão e Comunicação', 'Ação: Decisão conjunta Marco + Ruy (com input do PO). Comunicação ao colaborador por Marco em reunião privada (presencial ou call).

Responsável: Marco + Ruy

Output: Colaborador comunicado

Prazo referência: Conforme decisão', '<p>Ação: Decisão conjunta Marco + Ruy (com input do PO). Comunicação ao colaborador por Marco em reunião privada (presencial ou call).</p><p>Responsável: Marco + Ruy</p><p>Output: Colaborador comunicado</p><p>Prazo referência: Conforme decisão</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Transição de Conhecimento', 'Ação: PO mapeia projetos em andamento e redistribui. Colaborador documenta status de cada tarefa no TBO OS. Handoff de arquivos e acessos de cliente.

Responsável: PO + Colaborador

Output: Projetos redistribuídos e documentados

Prazo referência: Até o último dia', '<p>Ação: PO mapeia projetos em andamento e redistribui. Colaborador documenta status de cada tarefa no TBO OS. Handoff de arquivos e acessos de cliente.</p><p>Responsável: PO + Colaborador</p><p>Output: Projetos redistribuídos e documentados</p><p>Prazo referência: Até o último dia</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revogação de Acessos', 'Ação: Carol revoga no dia do desligamento efetivo: TBO OS, Google Workspace, ferramentas de design, repositórios, canais de comunicação.

Responsável: Carol (Ops)

Output: Todos os acessos revogados

Prazo referência: Até 2h após comunicação', '<p>Ação: Carol revoga no dia do desligamento efetivo: TBO OS, Google Workspace, ferramentas de design, repositórios, canais de comunicação.</p><p>Responsável: Carol (Ops)</p><p>Output: Todos os acessos revogados</p><p>Prazo referência: Até 2h após comunicação</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aspectos Legais e Entrevista de Saída', 'Ação: Carol coordena rescisão com contabilidade (CLT) ou encerramento de contrato (PJ) via ClickSign. Marco conduz entrevista de saída para captar feedback. Registro no TBO OS.

Responsável: Carol + Marco

Output: Documentação legal concluída, feedback registrado

Prazo referência: Até 5 dias úteis após desligamento', '<p>Ação: Carol coordena rescisão com contabilidade (CLT) ou encerramento de contrato (PJ) via ClickSign. Marco conduz entrevista de saída para captar feedback. Registro no TBO OS.</p><p>Responsável: Carol + Marco</p><p>Output: Documentação legal concluída, feedback registrado</p><p>Prazo referência: Até 5 dias úteis após desligamento</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Decisão documentada com feedbacks anteriores

[ ] Comunicação realizada pessoalmente

[ ] Projetos redistribuídos e documentados no TBO OS

[ ] Acessos revogados em até 2h

[ ] Rescisão/encerramento de contrato formalizado

[ ] Entrevista de saída realizada e registrada', '<ul><li>[ ] Decisão documentada com feedbacks anteriores</li><li>[ ] Comunicação realizada pessoalmente</li><li>[ ] Projetos redistribuídos e documentados no TBO OS</li><li>[ ] Acessos revogados em até 2h</li><li>[ ] Rescisão/encerramento de contrato formalizado</li><li>[ ] Entrevista de saída realizada e registrada</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Acessos não revogados imediatamente → risco de segurança da informação

Desligamento sem feedbacks documentados → risco trabalhista

Não fazer entrevista de saída → perda de aprendizado organizacional', '<ul><li>Acessos não revogados imediatamente → risco de segurança da informação</li><li>Desligamento sem feedbacks documentados → risco trabalhista</li><li>Não fazer entrevista de saída → perda de aprendizado organizacional</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People), Google Workspace, ClickSign, Google Meet.', '<p>TBO OS (People), Google Workspace, ClickSign, Google Meet.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Revogação de acessos: até 2h após comunicação

Transição de conhecimento: até último dia

Documentação legal: até 5 dias úteis

Regra: acessos revogados antes de qualquer outra etapa', '<ul><li>Revogação de acessos: até 2h após comunicação</li><li>Transição de conhecimento: até último dia</li><li>Documentação legal: até 5 dias úteis</li><li>Regra: acessos revogados antes de qualquer outra etapa</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Decisão de Desligamento → Comunicação (Marco) → Revogação de Acessos (2h) → Transição de Conhecimento → Aspectos Legais (ClickSign) → Entrevista de Saída → Registro no TBO OS → Fim', '<p>Decisão de Desligamento → Comunicação (Marco) → Revogação de Acessos (2h) → Transição de Conhecimento → Aspectos Legais (ClickSign) → Entrevista de Saída → Registro no TBO OS → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Offboarding: processo estruturado de saída de um colaborador.

Revogação: remoção imediata de todos os acessos a sistemas e dados.

Entrevista de saída: conversa final para captar feedback sobre processos e cultura.', '<p>Offboarding: processo estruturado de saída de um colaborador.</p><p>Revogação: remoção imediata de todos os acessos a sistemas e dados.</p><p>Entrevista de saída: conversa final para captar feedback sobre processos e cultura.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-REL-001: Gestao de Fornecedores ──
END $$;