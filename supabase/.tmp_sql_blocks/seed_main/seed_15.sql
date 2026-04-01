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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestao de Fornecedores',
    'tbo-rel-001-gestao-de-fornecedores',
    'relacionamentos',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Gestão de Fornecedores

Código

TBO-REL-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.

2. Escopo

2.1 O que está coberto

Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.

2.2 Exclusões

Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Consolidar avaliações, decidir manutenção/substituição

Executor

---

PO da BU

Avaliar fornecedor ao final de cada projeto

Executor

---

Carol (Ops)

Manter cadastro atualizado no TBO OS

Consultor

---



4. Pré-requisitos

4.1 Inputs necessários

Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.

4.2 Ferramentas e Acessos

TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.

5. Procedimento Passo a Passo

5.1. Cadastro e Qualificação

Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo > R$ 10.000.

Responsável: Carol (Ops)

Output: Fornecedor cadastrado e qualificado

Prazo referência: Antes do primeiro projeto

5.2. Avaliação Pós-Projeto

Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.

Responsável: PO da BU

Output: Avaliação registrada

Prazo referência: Até 5 dias após entrega

5.3. Revisão Trimestral

Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média < 3.0 entram em observação.

Responsável: Marco

Output: Decisão registrada, ações definidas

Prazo referência: Trimestral

5.4. Manutenção de Backup

Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.

Responsável: Marco + POs

Output: Lista de backup atualizada

Prazo referência: Contínuo

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Fornecedor cadastrado com dados completos no TBO OS

[ ] Avaliação pós-projeto registrada

[ ] Revisão trimestral realizada

[ ] Backup de fornecedores críticos mantido (mín. 2)

6.2 Erros Comuns a Evitar

Fornecedor sem avaliação → decisão baseada em percepção, não em dados

Dependência de fornecedor único → risco operacional alto

Novo fornecedor sem piloto → qualidade desconhecida em projeto real

7. Ferramentas e Templates

TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.

8. SLAs e Prazos

Cadastro: antes do primeiro projeto

Avaliação: até 5 dias após entrega

Revisão trimestral: a cada 3 meses

Regra: fornecedor novo não recebe projeto > R$ 10k sem piloto

9. Fluxograma

Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se > R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim

10. Glossário

Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.

SLA: Service Level Agreement — acordo de nível de serviço.

Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Fornecedores</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-REL-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Relacionamentos (Stakeholders)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.</p><p><strong>2.2 Exclusões</strong></p><p>Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Consolidar avaliações, decidir manutenção/substituição</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Avaliar fornecedor ao final de cada projeto</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter cadastro atualizado no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Cadastro e Qualificação</strong></p><p>Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo &gt; R$ 10.000.</p><p>Responsável: Carol (Ops)</p><p>Output: Fornecedor cadastrado e qualificado</p><p>Prazo referência: Antes do primeiro projeto</p><p><strong>5.2. Avaliação Pós-Projeto</strong></p><p>Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Avaliação registrada</p><p>Prazo referência: Até 5 dias após entrega</p><p><strong>5.3. Revisão Trimestral</strong></p><p>Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média &lt; 3.0 entram em observação.</p><p>Responsável: Marco</p><p>Output: Decisão registrada, ações definidas</p><p>Prazo referência: Trimestral</p><p><strong>5.4. Manutenção de Backup</strong></p><p>Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.</p><p>Responsável: Marco + POs</p><p>Output: Lista de backup atualizada</p><p>Prazo referência: Contínuo</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Fornecedor cadastrado com dados completos no TBO OS</li><li>[ ] Avaliação pós-projeto registrada</li><li>[ ] Revisão trimestral realizada</li><li>[ ] Backup de fornecedores críticos mantido (mín. 2)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Fornecedor sem avaliação → decisão baseada em percepção, não em dados</li><li>Dependência de fornecedor único → risco operacional alto</li><li>Novo fornecedor sem piloto → qualidade desconhecida em projeto real</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Cadastro: antes do primeiro projeto</li><li>Avaliação: até 5 dias após entrega</li><li>Revisão trimestral: a cada 3 meses</li><li>Regra: fornecedor novo não recebe projeto &gt; R$ 10k sem piloto</li></ul><p><strong>9. Fluxograma</strong></p><p>Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se &gt; R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim</p><p><strong>10. Glossário</strong></p><p>Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.</p><p>SLA: Service Level Agreement — acordo de nível de serviço.</p><p>Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['relacionamento','parceria','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-REL-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.', '<p>Garantir que a TBO trabalhe com fornecedores qualificados, com termos claros, avaliação contínua e backup para serviços críticos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.', '<p>Cadastro, qualificação, avaliação de performance pós-projeto, revisão trimestral e manutenção de backup.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).', '<p>Contratação de colaboradores (SOP-RH), parcerias estratégicas (SOP-REL-002), negociação de contratos de clientes (SOP-COM).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Consolidar avaliações, decidir manutenção/substituição

Executor

---

PO da BU

Avaliar fornecedor ao final de cada projeto

Executor

---

Carol (Ops)

Manter cadastro atualizado no TBO OS

Consultor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Consolidar avaliações, decidir manutenção/substituição</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Avaliar fornecedor ao final de cada projeto</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Manter cadastro atualizado no TBO OS</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.', '<p>Lista de fornecedores ativos; critérios de avaliação definidos; histórico de projetos com fornecedores.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.', '<p>TBO OS (cadastro e avaliação), Google Drive (contratos e SLAs), E-mail.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Cadastro e Qualificação', 'Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo > R$ 10.000.

Responsável: Carol (Ops)

Output: Fornecedor cadastrado e qualificado

Prazo referência: Antes do primeiro projeto', '<p>Ação: Todo fornecedor recorrente é cadastrado no TBO OS com: razão social, CNPJ, contato, tipo de serviço, condições comerciais, portfólio/referências. Novos fornecedores passam por projeto-piloto antes de receberem escopo &gt; R$ 10.000.</p><p>Responsável: Carol (Ops)</p><p>Output: Fornecedor cadastrado e qualificado</p><p>Prazo referência: Antes do primeiro projeto</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Avaliação Pós-Projeto', 'Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.

Responsável: PO da BU

Output: Avaliação registrada

Prazo referência: Até 5 dias após entrega', '<p>Ação: PO da BU avalia ao final de cada projeto: qualidade (1–5), prazo (1–5), comunicação (1–5), custo-benefício (1–5). Registra no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Avaliação registrada</p><p>Prazo referência: Até 5 dias após entrega</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revisão Trimestral', 'Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média < 3.0 entram em observação.

Responsável: Marco

Output: Decisão registrada, ações definidas

Prazo referência: Trimestral', '<p>Ação: Marco consolida avaliações e decide: manter, renegociar condições ou buscar alternativa. Fornecedores com média &lt; 3.0 entram em observação.</p><p>Responsável: Marco</p><p>Output: Decisão registrada, ações definidas</p><p>Prazo referência: Trimestral</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Manutenção de Backup', 'Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.

Responsável: Marco + POs

Output: Lista de backup atualizada

Prazo referência: Contínuo', '<p>Ação: Para cada serviço crítico (render farm, produtora, gráfica, fotógrafo), manter mínimo 2 fornecedores qualificados e testados.</p><p>Responsável: Marco + POs</p><p>Output: Lista de backup atualizada</p><p>Prazo referência: Contínuo</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Fornecedor cadastrado com dados completos no TBO OS

[ ] Avaliação pós-projeto registrada

[ ] Revisão trimestral realizada

[ ] Backup de fornecedores críticos mantido (mín. 2)', '<ul><li>[ ] Fornecedor cadastrado com dados completos no TBO OS</li><li>[ ] Avaliação pós-projeto registrada</li><li>[ ] Revisão trimestral realizada</li><li>[ ] Backup de fornecedores críticos mantido (mín. 2)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Fornecedor sem avaliação → decisão baseada em percepção, não em dados

Dependência de fornecedor único → risco operacional alto

Novo fornecedor sem piloto → qualidade desconhecida em projeto real', '<ul><li>Fornecedor sem avaliação → decisão baseada em percepção, não em dados</li><li>Dependência de fornecedor único → risco operacional alto</li><li>Novo fornecedor sem piloto → qualidade desconhecida em projeto real</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.', '<p>TBO OS (cadastro, avaliação), Google Drive (contratos), E-mail.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Cadastro: antes do primeiro projeto

Avaliação: até 5 dias após entrega

Revisão trimestral: a cada 3 meses

Regra: fornecedor novo não recebe projeto > R$ 10k sem piloto', '<ul><li>Cadastro: antes do primeiro projeto</li><li>Avaliação: até 5 dias após entrega</li><li>Revisão trimestral: a cada 3 meses</li><li>Regra: fornecedor novo não recebe projeto &gt; R$ 10k sem piloto</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se > R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim', '<p>Novo Fornecedor → Cadastro no TBO OS → Projeto-piloto (se &gt; R$ 10k) → Avaliação Pós-Projeto → Média ≥ 3.0? → Sim: Manter → Revisão Trimestral → Fim / Não: Observação → Buscar Alternativa → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.

SLA: Service Level Agreement — acordo de nível de serviço.

Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.', '<p>Projeto-piloto: primeiro trabalho de baixo risco com um fornecedor novo.</p><p>SLA: Service Level Agreement — acordo de nível de serviço.</p><p>Backup: fornecedor alternativo qualificado para substituição em caso de indisponibilidade.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-REL-002: Parcerias Estrategicas ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Parcerias Estrategicas',
    'tbo-rel-002-parcerias-estrategicas',
    'relacionamentos',
    'checklist',
    'Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.',
    'Standard Operating Procedure

Parcerias Estratégicas

Código

TBO-REL-002

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.

2. Escopo

2.1 O que está coberto

Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.

2.2 Exclusões

Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy

Identificar, abordar e nutrir parcerias

Executor

---

Marco

Co-avaliar oportunidades e aprovar termos

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.

4.2 Ferramentas e Acessos

LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).

5. Procedimento Passo a Passo

5.1. Identificação (trimestral)

Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.

Responsável: Ruy + Marco

Output: Lista de oportunidades priorizada

Prazo referência: Trimestral

5.2. Abordagem

Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.

Responsável: Ruy

Output: Primeira reunião realizada

Prazo referência: Conforme oportunidade

5.3. Formalização

Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.

Responsável: Ruy + Marco

Output: Parceria formalizada ou registrada

Prazo referência: Antes do primeiro projeto conjunto

5.4. Nutrição

Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.

Responsável: Ruy

Output: Parceria ativa e gerando valor

Prazo referência: Contínuo (check a cada 60 dias)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Mapa de parcerias atualizado trimestralmente

[ ] Parcerias financeiras formalizadas por escrito

[ ] Contato com parceiros-chave a cada 60 dias

[ ] Avaliação semestral de resultados

6.2 Erros Comuns a Evitar

Parceria sem termo escrito → desentendimento sobre comissão ou co-branding

Não nutrir relacionamento → parceria esfria e morre

Muitas parcerias sem foco → dispersão sem resultado

7. Ferramentas e Templates

LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.

8. SLAs e Prazos

Mapeamento: trimestral

Nutrição: contato a cada 60 dias

Avaliação: semestral

Regra: toda parceria com divisão de receita requer termo escrito

9. Fluxograma

Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim

10. Glossário

Parceria complementar: empresa que oferece serviço adjacente ao da TBO.

Co-branding: uso conjunto das marcas em ação ou material.

Nutrição: manutenção ativa do relacionamento ao longo do tempo.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Parcerias Estratégicas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-REL-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Relacionamentos (Stakeholders)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.</p><p><strong>2.2 Exclusões</strong></p><p>Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Identificar, abordar e nutrir parcerias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Co-avaliar oportunidades e aprovar termos</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Identificação (trimestral)</strong></p><p>Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.</p><p>Responsável: Ruy + Marco</p><p>Output: Lista de oportunidades priorizada</p><p>Prazo referência: Trimestral</p><p><strong>5.2. Abordagem</strong></p><p>Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.</p><p>Responsável: Ruy</p><p>Output: Primeira reunião realizada</p><p>Prazo referência: Conforme oportunidade</p><p><strong>5.3. Formalização</strong></p><p>Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.</p><p>Responsável: Ruy + Marco</p><p>Output: Parceria formalizada ou registrada</p><p>Prazo referência: Antes do primeiro projeto conjunto</p><p><strong>5.4. Nutrição</strong></p><p>Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.</p><p>Responsável: Ruy</p><p>Output: Parceria ativa e gerando valor</p><p>Prazo referência: Contínuo (check a cada 60 dias)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Mapa de parcerias atualizado trimestralmente</li><li>[ ] Parcerias financeiras formalizadas por escrito</li><li>[ ] Contato com parceiros-chave a cada 60 dias</li><li>[ ] Avaliação semestral de resultados</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Parceria sem termo escrito → desentendimento sobre comissão ou co-branding</li><li>Não nutrir relacionamento → parceria esfria e morre</li><li>Muitas parcerias sem foco → dispersão sem resultado</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Mapeamento: trimestral</li><li>Nutrição: contato a cada 60 dias</li><li>Avaliação: semestral</li><li>Regra: toda parceria com divisão de receita requer termo escrito</li></ul><p><strong>9. Fluxograma</strong></p><p>Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim</p><p><strong>10. Glossário</strong></p><p>Parceria complementar: empresa que oferece serviço adjacente ao da TBO.</p><p>Co-branding: uso conjunto das marcas em ação ou material.</p><p>Nutrição: manutenção ativa do relacionamento ao longo do tempo.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['relacionamento','parceria','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-REL-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.', '<p>Estruturar o desenvolvimento de parcerias que ampliem alcance, capacidade e posicionamento da TBO no mercado imobiliário.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.', '<p>Identificação de oportunidades, abordagem, formalização e nutrição de parcerias complementares, tecnológicas, institucionais e educacionais.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).', '<p>Gestão de fornecedores operacionais (SOP-REL-001), prospecção de clientes (SOP-COM-001), gestão de reputação (SOP-REL-003).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy

Identificar, abordar e nutrir parcerias

Executor

---

Marco

Co-avaliar oportunidades e aprovar termos

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Identificar, abordar e nutrir parcerias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Co-avaliar oportunidades e aprovar termos</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.', '<p>Mapa de stakeholders do setor imobiliário; calendário de eventos; posicionamento estratégico da TBO.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).', '<p>LinkedIn, Google Meet, TBO OS (registro), E-mail, ClickSign (termos de parceria).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Identificação (trimestral)', 'Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.

Responsável: Ruy + Marco

Output: Lista de oportunidades priorizada

Prazo referência: Trimestral', '<p>Ação: Ruy e Marco mapeiam oportunidades de parceria. Tipos: complementar (arquitetura, interiores, consultoria de vendas), tecnológica (plataformas, SaaS), institucional (ADEMI, Sinduscon), educacional (universidades, TBO Academy). Critérios: alinhamento de público, complementaridade, reputação, potencial de leads.</p><p>Responsável: Ruy + Marco</p><p>Output: Lista de oportunidades priorizada</p><p>Prazo referência: Trimestral</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Abordagem', 'Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.

Responsável: Ruy

Output: Primeira reunião realizada

Prazo referência: Conforme oportunidade', '<p>Ação: Ruy lidera abordagem via LinkedIn, evento ou indicação. Primeira reunião com pauta: apresentação mútua, oportunidades conjuntas, modelo de colaboração.</p><p>Responsável: Ruy</p><p>Output: Primeira reunião realizada</p><p>Prazo referência: Conforme oportunidade</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Formalização', 'Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.

Responsável: Ruy + Marco

Output: Parceria formalizada ou registrada

Prazo referência: Antes do primeiro projeto conjunto', '<p>Ação: Parcerias com implicação financeira (comissão, co-branding, divisão de receita) formalizadas via termo escrito (ClickSign). Parcerias informais registradas no TBO OS.</p><p>Responsável: Ruy + Marco</p><p>Output: Parceria formalizada ou registrada</p><p>Prazo referência: Antes do primeiro projeto conjunto</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Nutrição', 'Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.

Responsável: Ruy

Output: Parceria ativa e gerando valor

Prazo referência: Contínuo (check a cada 60 dias)', '<p>Ação: Ruy mantém contato com parceiros-chave a cada 60 dias. Resultados avaliados semestralmente. Se sem geração de valor em 12 meses, reclassificar.</p><p>Responsável: Ruy</p><p>Output: Parceria ativa e gerando valor</p><p>Prazo referência: Contínuo (check a cada 60 dias)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Mapa de parcerias atualizado trimestralmente

[ ] Parcerias financeiras formalizadas por escrito

[ ] Contato com parceiros-chave a cada 60 dias

[ ] Avaliação semestral de resultados', '<ul><li>[ ] Mapa de parcerias atualizado trimestralmente</li><li>[ ] Parcerias financeiras formalizadas por escrito</li><li>[ ] Contato com parceiros-chave a cada 60 dias</li><li>[ ] Avaliação semestral de resultados</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Parceria sem termo escrito → desentendimento sobre comissão ou co-branding

Não nutrir relacionamento → parceria esfria e morre

Muitas parcerias sem foco → dispersão sem resultado', '<ul><li>Parceria sem termo escrito → desentendimento sobre comissão ou co-branding</li><li>Não nutrir relacionamento → parceria esfria e morre</li><li>Muitas parcerias sem foco → dispersão sem resultado</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.', '<p>LinkedIn, Google Meet, TBO OS, ClickSign, E-mail.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Mapeamento: trimestral

Nutrição: contato a cada 60 dias

Avaliação: semestral

Regra: toda parceria com divisão de receita requer termo escrito', '<ul><li>Mapeamento: trimestral</li><li>Nutrição: contato a cada 60 dias</li><li>Avaliação: semestral</li><li>Regra: toda parceria com divisão de receita requer termo escrito</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim', '<p>Mapeamento Trimestral → Oportunidade Priorizada → Abordagem (Ruy) → Interesse Mútuo? → Sim: Formalização → Nutrição a cada 60d → Avaliação Semestral → Gerando valor? → Sim: Manter / Não: Reclassificar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Parceria complementar: empresa que oferece serviço adjacente ao da TBO.

Co-branding: uso conjunto das marcas em ação ou material.

Nutrição: manutenção ativa do relacionamento ao longo do tempo.', '<p>Parceria complementar: empresa que oferece serviço adjacente ao da TBO.</p><p>Co-branding: uso conjunto das marcas em ação ou material.</p><p>Nutrição: manutenção ativa do relacionamento ao longo do tempo.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-REL-003: Gestao de Reputacao e Presenca Institucional ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestao de Reputacao e Presenca Institucional',
    'tbo-rel-003-gestao-de-reputacao-e-presenca-institucional',
    'relacionamentos',
    'checklist',
    'Gestão de Reputação e Presença Institucional',
    'Standard Operating Procedure

Gestão de Reputação e Presença Institucional

Código

TBO-REL-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Relacionamentos (Stakeholders)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.

2. Escopo

2.1 O que está coberto

LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.

2.2 Exclusões

Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy

Conteúdo LinkedIn semanal, avaliação de eventos

Executor

---

Marco

Conteúdo LinkedIn quinzenal (creative direction), documentação de cases

Executor

---

Nelson (PO Branding)

Gestão do Instagram @weare.tbo

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.

4.2 Ferramentas e Acessos

LinkedIn, Instagram, Google Drive (cases), TBO OS.

5. Procedimento Passo a Passo

5.1. LinkedIn dos Sócios

Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.

Responsável: Ruy + Marco

Output: Posts publicados conforme calendário

Prazo referência: Semanal (Ruy), quinzenal (Marco)

5.2. Instagram @weare.tbo

Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.

Responsável: Nelson (PO Branding)

Output: Feed atualizado conforme cronograma

Prazo referência: Conforme calendário mensal

5.3. Eventos e Palestras

Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.

Responsável: Ruy + Marco

Output: Participação em eventos estratégicos

Prazo referência: Conforme convites

5.4. Cases de Sucesso

Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.

Responsável: Marco

Output: Case documentado e publicado

Prazo referência: Até 30 dias após entrega final

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] LinkedIn de Ruy: post semanal publicado

[ ] LinkedIn de Marco: post quinzenal publicado

[ ] Instagram: feed atualizado conforme cronograma mensal

[ ] Cases documentados com autorização do cliente

[ ] Eventos avaliados e participação decidida

6.2 Erros Comuns a Evitar

Publicar sem aprovação de sócio → risco de mensagem desalinhada

Case sem autorização do cliente → violação de confiança

Aceitar muitos eventos → dispersão sem retorno

7. Ferramentas e Templates

LinkedIn, Instagram, Google Drive, TBO OS.

8. SLAs e Prazos

LinkedIn Ruy: semanal

LinkedIn Marco: quinzenal

Instagram: conforme calendário mensal

Cases: até 30 dias após entrega

Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente

9. Fluxograma

Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim

10. Glossário

Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.

Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.

Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Reputação e Presença Institucional</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-REL-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Relacionamentos (Stakeholders)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.</p><p><strong>2.2 Exclusões</strong></p><p>Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Conteúdo LinkedIn semanal, avaliação de eventos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Conteúdo LinkedIn quinzenal (creative direction), documentação de cases</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Nelson (PO Branding)</strong></p></td><td><p>Gestão do Instagram @weare.tbo</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>LinkedIn, Instagram, Google Drive (cases), TBO OS.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. LinkedIn dos Sócios</strong></p><p>Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.</p><p>Responsável: Ruy + Marco</p><p>Output: Posts publicados conforme calendário</p><p>Prazo referência: Semanal (Ruy), quinzenal (Marco)</p><p><strong>5.2. Instagram @weare.tbo</strong></p><p>Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Feed atualizado conforme cronograma</p><p>Prazo referência: Conforme calendário mensal</p><p><strong>5.3. Eventos e Palestras</strong></p><p>Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.</p><p>Responsável: Ruy + Marco</p><p>Output: Participação em eventos estratégicos</p><p>Prazo referência: Conforme convites</p><p><strong>5.4. Cases de Sucesso</strong></p><p>Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.</p><p>Responsável: Marco</p><p>Output: Case documentado e publicado</p><p>Prazo referência: Até 30 dias após entrega final</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] LinkedIn de Ruy: post semanal publicado</li><li>[ ] LinkedIn de Marco: post quinzenal publicado</li><li>[ ] Instagram: feed atualizado conforme cronograma mensal</li><li>[ ] Cases documentados com autorização do cliente</li><li>[ ] Eventos avaliados e participação decidida</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Publicar sem aprovação de sócio → risco de mensagem desalinhada</li><li>Case sem autorização do cliente → violação de confiança</li><li>Aceitar muitos eventos → dispersão sem retorno</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>LinkedIn, Instagram, Google Drive, TBO OS.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>LinkedIn Ruy: semanal</li><li>LinkedIn Marco: quinzenal</li><li>Instagram: conforme calendário mensal</li><li>Cases: até 30 dias após entrega</li><li>Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente</li></ul><p><strong>9. Fluxograma</strong></p><p>Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim</p><p><strong>10. Glossário</strong></p><p>Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.</p><p>Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.</p><p>Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['relacionamento','parceria','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-REL-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.', '<p>Manter a presença institucional da TBO ativa e estratégica, posicionando a marca como referência em branding imobiliário.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.', '<p>LinkedIn dos sócios, Instagram @weare.tbo, participação em eventos/palestras e documentação de cases de sucesso.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).', '<p>Gestão de social media de clientes (SOP-MKT-011), produção de conteúdo de campanha (SOP-BRD-013), lead magnets comerciais (SOP-COM).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy

Conteúdo LinkedIn semanal, avaliação de eventos

Executor

---

Marco

Conteúdo LinkedIn quinzenal (creative direction), documentação de cases

Executor

---

Nelson (PO Branding)

Gestão do Instagram @weare.tbo

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Conteúdo LinkedIn semanal, avaliação de eventos</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Conteúdo LinkedIn quinzenal (creative direction), documentação de cases</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Nelson (PO Branding)</strong></p></td><td><p>Gestão do Instagram @weare.tbo</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.', '<p>Calendário editorial definido; projetos concluídos para cases; convites de eventos avaliados.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'LinkedIn, Instagram, Google Drive (cases), TBO OS.', '<p>LinkedIn, Instagram, Google Drive (cases), TBO OS.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. LinkedIn dos Sócios', 'Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.

Responsável: Ruy + Marco

Output: Posts publicados conforme calendário

Prazo referência: Semanal (Ruy), quinzenal (Marco)', '<p>Ação: Ruy publica semanalmente seguindo calendário editorial. Marco publica quinzenalmente com foco em creative direction e bastidores. Estilo: parágrafos densos, tom consultivo, sem chatgptização.</p><p>Responsável: Ruy + Marco</p><p>Output: Posts publicados conforme calendário</p><p>Prazo referência: Semanal (Ruy), quinzenal (Marco)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Instagram @weare.tbo', 'Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.

Responsável: Nelson (PO Branding)

Output: Feed atualizado conforme cronograma

Prazo referência: Conforme calendário mensal', '<p>Ação: Nelson gerencia feed com cronograma mensal. Conteúdo: projetos entregues, bastidores, insights. Grid cronológico (1→6, inferior direito ao superior esquerdo). Aprovação de pelo menos um sócio antes de publicar.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Feed atualizado conforme cronograma</p><p>Prazo referência: Conforme calendário mensal</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Eventos e Palestras', 'Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.

Responsável: Ruy + Marco

Output: Participação em eventos estratégicos

Prazo referência: Conforme convites', '<p>Ação: Ruy e Marco avaliam convites. Critérios: público relevante (decisores de incorporadoras), visibilidade, potencial de leads. Máximo 1 evento por mês para não dispersar.</p><p>Responsável: Ruy + Marco</p><p>Output: Participação em eventos estratégicos</p><p>Prazo referência: Conforme convites</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Cases de Sucesso', 'Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.

Responsável: Marco

Output: Case documentado e publicado

Prazo referência: Até 30 dias após entrega final', '<p>Ação: Ao final de cada projeto relevante, Marco documenta: desafio, solução, resultados. Requer autorização escrita do cliente. Publicação em LinkedIn, site e propostas.</p><p>Responsável: Marco</p><p>Output: Case documentado e publicado</p><p>Prazo referência: Até 30 dias após entrega final</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] LinkedIn de Ruy: post semanal publicado

[ ] LinkedIn de Marco: post quinzenal publicado

[ ] Instagram: feed atualizado conforme cronograma mensal

[ ] Cases documentados com autorização do cliente

[ ] Eventos avaliados e participação decidida', '<ul><li>[ ] LinkedIn de Ruy: post semanal publicado</li><li>[ ] LinkedIn de Marco: post quinzenal publicado</li><li>[ ] Instagram: feed atualizado conforme cronograma mensal</li><li>[ ] Cases documentados com autorização do cliente</li><li>[ ] Eventos avaliados e participação decidida</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Publicar sem aprovação de sócio → risco de mensagem desalinhada

Case sem autorização do cliente → violação de confiança

Aceitar muitos eventos → dispersão sem retorno', '<ul><li>Publicar sem aprovação de sócio → risco de mensagem desalinhada</li><li>Case sem autorização do cliente → violação de confiança</li><li>Aceitar muitos eventos → dispersão sem retorno</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'LinkedIn, Instagram, Google Drive, TBO OS.', '<p>LinkedIn, Instagram, Google Drive, TBO OS.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'LinkedIn Ruy: semanal

LinkedIn Marco: quinzenal

Instagram: conforme calendário mensal

Cases: até 30 dias após entrega

Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente', '<ul><li>LinkedIn Ruy: semanal</li><li>LinkedIn Marco: quinzenal</li><li>Instagram: conforme calendário mensal</li><li>Cases: até 30 dias após entrega</li><li>Regra: nenhum conteúdo institucional sem aprovação de sócio; cases requerem autorização escrita do cliente</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim', '<p>Calendário Editorial → Produção de Conteúdo → Aprovação de Sócio → Publicação (LinkedIn/Instagram) → Projeto Entregue? → Sim: Documentar Case → Autorização do Cliente → Publicar Case → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.

Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.

Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).', '<p>Case de sucesso: documentação estruturada de um projeto mostrando desafio, solução e resultado.</p><p>Calendário editorial: planejamento mensal de conteúdo para redes sociais e LinkedIn.</p><p>Grid cronológico: ordem de publicação do feed Instagram (1→6, inferior direito ao superior esquerdo).</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-001: Codigo de Conduta e Etica ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Codigo de Conduta e Etica',
    'tbo-pol-001-codigo-de-conduta-e-etica',
    'politicas',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Código de Conduta e Ética

Código

TBO-POL-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Políticas (Compliance)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.

2. Escopo

2.1 O que está coberto

Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.

2.2 Exclusões

Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Definir, comunicar e fazer cumprir o código

Executor

---

Ruy

Aprovar e fazer cumprir

Aprovador

---

Todos os membros

Seguir o código, reportar violações

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Valores da TBO definidos; processos de onboarding atualizados para incluir o código.

4.2 Ferramentas e Acessos

TBO OS, Google Drive (documento do código), ClickSign (aceite formal).

5. Procedimento Passo a Passo

5.1. Definição e Documentação

Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.

Responsável: Marco

Output: Código de conduta documentado

Prazo referência: Versão inicial + revisão anual

5.2. Comunicação e Aceite

Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.

Responsável: Carol (Ops)

Output: Aceite assinado por todos

Prazo referência: No onboarding ou na revisão

5.3. Relato de Violações

Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.

Responsável: Marco + Ruy

Output: Investigação concluída

Prazo referência: Até 10 dias úteis

5.4. Consequências

Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.

Responsável: Marco + Ruy

Output: Medida aplicada e registrada

Prazo referência: Conforme gravidade

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Código documentado e aprovado

[ ] Aceite assinado por todos os membros

[ ] Canal de relato conhecido por todos

[ ] Investigações concluídas dentro do prazo

6.2 Erros Comuns a Evitar

Código apenas no papel → cultura não muda, apenas gera compliance fake

Não investigar relatos → perda de credibilidade do canal

Punição desproporcional → clima organizacional deteriora

7. Ferramentas e Templates

TBO OS, Google Drive, ClickSign.

8. SLAs e Prazos

Aceite: no onboarding

Investigação: até 10 dias úteis

Revisão do código: anual

9. Fluxograma

Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim

10. Glossário

Compliance: conformidade com regras, políticas e legislação aplicável.

Canal de relato: meio confidencial para reportar violações do código.

Advertência formal: registro documentado de violação com plano de correção.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Código de Conduta e Ética</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-POL-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Políticas (Compliance)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.</p><p><strong>2.2 Exclusões</strong></p><p>Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir, comunicar e fazer cumprir o código</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Aprovar e fazer cumprir</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir o código, reportar violações</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Valores da TBO definidos; processos de onboarding atualizados para incluir o código.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS, Google Drive (documento do código), ClickSign (aceite formal).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Definição e Documentação</strong></p><p>Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.</p><p>Responsável: Marco</p><p>Output: Código de conduta documentado</p><p>Prazo referência: Versão inicial + revisão anual</p><p><strong>5.2. Comunicação e Aceite</strong></p><p>Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.</p><p>Responsável: Carol (Ops)</p><p>Output: Aceite assinado por todos</p><p>Prazo referência: No onboarding ou na revisão</p><p><strong>5.3. Relato de Violações</strong></p><p>Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.</p><p>Responsável: Marco + Ruy</p><p>Output: Investigação concluída</p><p>Prazo referência: Até 10 dias úteis</p><p><strong>5.4. Consequências</strong></p><p>Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.</p><p>Responsável: Marco + Ruy</p><p>Output: Medida aplicada e registrada</p><p>Prazo referência: Conforme gravidade</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Código documentado e aprovado</li><li>[ ] Aceite assinado por todos os membros</li><li>[ ] Canal de relato conhecido por todos</li><li>[ ] Investigações concluídas dentro do prazo</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Código apenas no papel → cultura não muda, apenas gera compliance fake</li><li>Não investigar relatos → perda de credibilidade do canal</li><li>Punição desproporcional → clima organizacional deteriora</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS, Google Drive, ClickSign.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Aceite: no onboarding</li><li>Investigação: até 10 dias úteis</li><li>Revisão do código: anual</li></ul><p><strong>9. Fluxograma</strong></p><p>Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim</p><p><strong>10. Glossário</strong></p><p>Compliance: conformidade com regras, políticas e legislação aplicável.</p><p>Canal de relato: meio confidencial para reportar violações do código.</p><p>Advertência formal: registro documentado de violação com plano de correção.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['politica','compliance','entrega','qualidade','cliente','aprovacao']::TEXT[],
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

  -- Steps for TBO-POL-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.', '<p>Estabelecer diretrizes de conduta que orientam o comportamento de todos os membros da TBO — sócios, colaboradores, freelancers e parceiros — no relacionamento interno, com clientes e com o mercado.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.', '<p>Princípios éticos, condutas esperadas, condutas inaceitáveis, canal de relato e consequências.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).', '<p>Políticas de segurança da informação (SOP-POL-002), propriedade intelectual (SOP-POL-003), gestão de contratos (SOP-POL-004).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Definir, comunicar e fazer cumprir o código

Executor

---

Ruy

Aprovar e fazer cumprir

Aprovador

---

Todos os membros

Seguir o código, reportar violações

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Definir, comunicar e fazer cumprir o código</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Aprovar e fazer cumprir</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Todos os membros</strong></p></td><td><p>Seguir o código, reportar violações</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Valores da TBO definidos; processos de onboarding atualizados para incluir o código.', '<p>Valores da TBO definidos; processos de onboarding atualizados para incluir o código.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS, Google Drive (documento do código), ClickSign (aceite formal).', '<p>TBO OS, Google Drive (documento do código), ClickSign (aceite formal).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Definição e Documentação', 'Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.

Responsável: Marco

Output: Código de conduta documentado

Prazo referência: Versão inicial + revisão anual', '<p>Ação: Marco documenta os princípios (integridade, excelência, respeito, responsabilidade, confidencialidade), condutas esperadas e condutas inaceitáveis. Aprovação de Ruy.</p><p>Responsável: Marco</p><p>Output: Código de conduta documentado</p><p>Prazo referência: Versão inicial + revisão anual</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Comunicação e Aceite', 'Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.

Responsável: Carol (Ops)

Output: Aceite assinado por todos

Prazo referência: No onboarding ou na revisão', '<p>Ação: Todo novo membro recebe o código no onboarding (SOP-RH-002) e assina aceite via ClickSign. Membros atuais assinam na primeira versão e em revisões significativas.</p><p>Responsável: Carol (Ops)</p><p>Output: Aceite assinado por todos</p><p>Prazo referência: No onboarding ou na revisão</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Relato de Violações', 'Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.

Responsável: Marco + Ruy

Output: Investigação concluída

Prazo referência: Até 10 dias úteis', '<p>Ação: Qualquer violação pode ser reportada diretamente a Marco ou Ruy de forma confidencial. Relatos são tratados com sigilo e investigados em até 10 dias úteis.</p><p>Responsável: Marco + Ruy</p><p>Output: Investigação concluída</p><p>Prazo referência: Até 10 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Consequências', 'Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.

Responsável: Marco + Ruy

Output: Medida aplicada e registrada

Prazo referência: Conforme gravidade', '<p>Ação: Conforme gravidade: advertência verbal, advertência formal registrada, suspensão de projetos, desligamento. Decisão conjunta dos sócios.</p><p>Responsável: Marco + Ruy</p><p>Output: Medida aplicada e registrada</p><p>Prazo referência: Conforme gravidade</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Código documentado e aprovado

[ ] Aceite assinado por todos os membros

[ ] Canal de relato conhecido por todos

[ ] Investigações concluídas dentro do prazo', '<ul><li>[ ] Código documentado e aprovado</li><li>[ ] Aceite assinado por todos os membros</li><li>[ ] Canal de relato conhecido por todos</li><li>[ ] Investigações concluídas dentro do prazo</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Código apenas no papel → cultura não muda, apenas gera compliance fake

Não investigar relatos → perda de credibilidade do canal

Punição desproporcional → clima organizacional deteriora', '<ul><li>Código apenas no papel → cultura não muda, apenas gera compliance fake</li><li>Não investigar relatos → perda de credibilidade do canal</li><li>Punição desproporcional → clima organizacional deteriora</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS, Google Drive, ClickSign.', '<p>TBO OS, Google Drive, ClickSign.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Aceite: no onboarding

Investigação: até 10 dias úteis

Revisão do código: anual', '<ul><li>Aceite: no onboarding</li><li>Investigação: até 10 dias úteis</li><li>Revisão do código: anual</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim', '<p>Código Documentado → Comunicação ao Time → Aceite Formal (ClickSign) → Violação Reportada? → Sim: Investigação (10 dias) → Medida Aplicada → Registro → Fim / Não: Revisão Anual → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Compliance: conformidade com regras, políticas e legislação aplicável.

Canal de relato: meio confidencial para reportar violações do código.

Advertência formal: registro documentado de violação com plano de correção.', '<p>Compliance: conformidade com regras, políticas e legislação aplicável.</p><p>Canal de relato: meio confidencial para reportar violações do código.</p><p>Advertência formal: registro documentado de violação com plano de correção.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-POL-002: Seguranca da Informacao ──
END $$;