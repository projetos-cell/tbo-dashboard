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
    'Onboarding de Colaborador',
    'tbo-rh-002-onboarding-de-colaborador',
    'recursos-humanos',
    'checklist',
    'Onboarding de Colaborador (People)',
    'Standard Operating Procedure

Onboarding de Colaborador (People)

Código

TBO-RH-002

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

Marco Andolfato



1. Objetivo

Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.

2. Escopo

2.1 O que está coberto

Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).

2.2 Exclusões

Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Carol (Ops)

Configurar acessos, contrato, logística do onboarding

Executor

---

Marco

Apresentação cultural, check-ins quinzenais, avaliação de 30 dias

Executor

---

PO da BU

Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias

Consultor

---

Novo Colaborador

Participar ativamente, completar checklist

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.

4.2 Ferramentas e Acessos

TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.

5. Procedimento Passo a Passo

5.1. Pré-Onboarding (D-2)

Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.

Responsável: Carol (Ops)

Output: Acessos configurados, kit preparado

Prazo referência: 2 dias antes da entrada

5.2. Dia 1 — Cultura e Ferramentas

Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.

Responsável: Marco + Carol + PO

Output: Colaborador ambientado

Prazo referência: Dia 1

5.3. Semana 1 — Processos

Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.

Responsável: PO + Carol

Output: Checklist de ferramentas concluído

Prazo referência: Dias 2–5

5.4. Semanas 2–4 — Imersão e Avaliação

Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.

Responsável: PO + Marco

Output: Avaliação de 30 dias registrada no TBO OS

Prazo referência: Até dia 30

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Acessos configurados antes do Dia 1

[ ] Kit de boas-vindas entregue

[ ] Apresentação cultural realizada

[ ] Checklist de ferramentas concluído

[ ] Buddy designado

[ ] Avaliação de 30 dias realizada e registrada

6.2 Erros Comuns a Evitar

Colaborador sem acesso no Dia 1 → primeira impressão negativa

Onboarding informal → não internaliza processos, gera retrabalho

Sem avaliação de 30 dias → problemas de performance descobertos tarde

7. Ferramentas e Templates

TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.

8. SLAs e Prazos

Acessos: D-2

Dia 1: cultura + ferramentas

Semana 1: processos e check-ins diários

Avaliação: até dia 30

Regra: nenhum colaborador inicia sem contrato e acessos configurados

9. Fluxograma

Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim

10. Glossário

Buddy: colega designado para apoiar o novo membro nas primeiras semanas.

Role: nível de permissão no TBO OS (colaborador = nível 3).

Check-in: conversa curta de acompanhamento entre gestor e colaborador.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Onboarding de Colaborador (People)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-RH-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Recursos Humanos (People)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).</p><p><strong>2.2 Exclusões</strong></p><p>Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Configurar acessos, contrato, logística do onboarding</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Apresentação cultural, check-ins quinzenais, avaliação de 30 dias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Novo Colaborador</strong></p></td><td><p>Participar ativamente, completar checklist</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Pré-Onboarding (D-2)</strong></p><p>Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, kit preparado</p><p>Prazo referência: 2 dias antes da entrada</p><p><strong>5.2. Dia 1 — Cultura e Ferramentas</strong></p><p>Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.</p><p>Responsável: Marco + Carol + PO</p><p>Output: Colaborador ambientado</p><p>Prazo referência: Dia 1</p><p><strong>5.3. Semana 1 — Processos</strong></p><p>Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.</p><p>Responsável: PO + Carol</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dias 2–5</p><p><strong>5.4. Semanas 2–4 — Imersão e Avaliação</strong></p><p>Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.</p><p>Responsável: PO + Marco</p><p>Output: Avaliação de 30 dias registrada no TBO OS</p><p>Prazo referência: Até dia 30</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Acessos configurados antes do Dia 1</li><li>[ ] Kit de boas-vindas entregue</li><li>[ ] Apresentação cultural realizada</li><li>[ ] Checklist de ferramentas concluído</li><li>[ ] Buddy designado</li><li>[ ] Avaliação de 30 dias realizada e registrada</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Colaborador sem acesso no Dia 1 → primeira impressão negativa</li><li>Onboarding informal → não internaliza processos, gera retrabalho</li><li>Sem avaliação de 30 dias → problemas de performance descobertos tarde</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Acessos: D-2</li><li>Dia 1: cultura + ferramentas</li><li>Semana 1: processos e check-ins diários</li><li>Avaliação: até dia 30</li><li>Regra: nenhum colaborador inicia sem contrato e acessos configurados</li></ul><p><strong>9. Fluxograma</strong></p><p>Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim</p><p><strong>10. Glossário</strong></p><p>Buddy: colega designado para apoiar o novo membro nas primeiras semanas.</p><p>Role: nível de permissão no TBO OS (colaborador = nível 3).</p><p>Check-in: conversa curta de acompanhamento entre gestor e colaborador.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['rh','pessoas','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-RH-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.', '<p>Garantir que todo novo membro seja integrado com clareza sobre cultura, processos, ferramentas e expectativas, reduzindo tempo até produtividade plena para no máximo 30 dias.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).', '<p>Pré-onboarding (acessos e contrato), dia 1 (cultura e ferramentas), primeira semana (processos), primeiras 4 semanas (imersão e avaliação).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).', '<p>Processo seletivo (SOP-RH-001), treinamentos técnicos específicos de BU (responsabilidade de cada PO), gestão de performance contínua (SOP-RH-003).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Carol (Ops)

Configurar acessos, contrato, logística do onboarding

Executor

---

Marco

Apresentação cultural, check-ins quinzenais, avaliação de 30 dias

Executor

---

PO da BU

Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias

Consultor

---

Novo Colaborador

Participar ativamente, completar checklist

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Carol (Ops)</strong></p></td><td><p>Configurar acessos, contrato, logística do onboarding</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Apresentação cultural, check-ins quinzenais, avaliação de 30 dias</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Mentor técnico, check-in diário na primeira semana, avaliação de 30 dias</p></td><td><p>Consultor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Novo Colaborador</strong></p></td><td><p>Participar ativamente, completar checklist</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.', '<p>Contrato assinado; e-mail corporativo criado; acessos configurados (TBO OS, Google Workspace, ferramentas da BU); kit de boas-vindas digital preparado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.', '<p>TBO OS (módulo People), Google Workspace, Google Meet, ClickSign.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Pré-Onboarding (D-2)', 'Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.

Responsável: Carol (Ops)

Output: Acessos configurados, kit preparado

Prazo referência: 2 dias antes da entrada', '<p>Ação: Carol configura acessos (TBO OS role colaborador nível 3, Google Workspace, ferramentas da BU). Prepara kit digital: manual de cultura, organograma, SOPs da BU, calendário de rituais. Agenda reunião de boas-vindas.</p><p>Responsável: Carol (Ops)</p><p>Output: Acessos configurados, kit preparado</p><p>Prazo referência: 2 dias antes da entrada</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Dia 1 — Cultura e Ferramentas', 'Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.

Responsável: Marco + Carol + PO

Output: Colaborador ambientado

Prazo referência: Dia 1', '<p>Ação: Marco apresenta: história da TBO, missão think-build-own, valores, clientes, posicionamento. Carol apresenta equipe e ferramentas. PO alinha escopo inicial e designa buddy.</p><p>Responsável: Marco + Carol + PO</p><p>Output: Colaborador ambientado</p><p>Prazo referência: Dia 1</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Semana 1 — Processos', 'Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.

Responsável: PO + Carol

Output: Checklist de ferramentas concluído

Prazo referência: Dias 2–5', '<p>Ação: PO conduz treinamento de ferramentas da área. Carol orienta sobre processos operacionais (TBO OS, comunicação, gestão de arquivos). Check-in diário de 10 min com PO.</p><p>Responsável: PO + Carol</p><p>Output: Checklist de ferramentas concluído</p><p>Prazo referência: Dias 2–5</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Semanas 2–4 — Imersão e Avaliação', 'Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.

Responsável: PO + Marco

Output: Avaliação de 30 dias registrada no TBO OS

Prazo referência: Até dia 30', '<p>Ação: Colaborador participa de projeto real como apoio. Check-in semanal com PO, quinzenal com Marco. Dia 30: avaliação formal (PO + Marco) com checklist de competências e feedback 360°.</p><p>Responsável: PO + Marco</p><p>Output: Avaliação de 30 dias registrada no TBO OS</p><p>Prazo referência: Até dia 30</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Acessos configurados antes do Dia 1

[ ] Kit de boas-vindas entregue

[ ] Apresentação cultural realizada

[ ] Checklist de ferramentas concluído

[ ] Buddy designado

[ ] Avaliação de 30 dias realizada e registrada', '<ul><li>[ ] Acessos configurados antes do Dia 1</li><li>[ ] Kit de boas-vindas entregue</li><li>[ ] Apresentação cultural realizada</li><li>[ ] Checklist de ferramentas concluído</li><li>[ ] Buddy designado</li><li>[ ] Avaliação de 30 dias realizada e registrada</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Colaborador sem acesso no Dia 1 → primeira impressão negativa

Onboarding informal → não internaliza processos, gera retrabalho

Sem avaliação de 30 dias → problemas de performance descobertos tarde', '<ul><li>Colaborador sem acesso no Dia 1 → primeira impressão negativa</li><li>Onboarding informal → não internaliza processos, gera retrabalho</li><li>Sem avaliação de 30 dias → problemas de performance descobertos tarde</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.', '<p>TBO OS (People, acessos), Google Workspace, Google Meet, ClickSign.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Acessos: D-2

Dia 1: cultura + ferramentas

Semana 1: processos e check-ins diários

Avaliação: até dia 30

Regra: nenhum colaborador inicia sem contrato e acessos configurados', '<ul><li>Acessos: D-2</li><li>Dia 1: cultura + ferramentas</li><li>Semana 1: processos e check-ins diários</li><li>Avaliação: até dia 30</li><li>Regra: nenhum colaborador inicia sem contrato e acessos configurados</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim', '<p>Contratação Aprovada → Pré-Onboarding D-2 (acessos + kit) → Dia 1 (cultura + ferramentas) → Semana 1 (processos + check-ins) → Semanas 2–4 (imersão + projeto real) → Avaliação 30 dias → Aprovado? → Sim: Operação normal → Fim / Não: Plano de ajuste → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Buddy: colega designado para apoiar o novo membro nas primeiras semanas.

Role: nível de permissão no TBO OS (colaborador = nível 3).

Check-in: conversa curta de acompanhamento entre gestor e colaborador.', '<p>Buddy: colega designado para apoiar o novo membro nas primeiras semanas.</p><p>Role: nível de permissão no TBO OS (colaborador = nível 3).</p><p>Check-in: conversa curta de acompanhamento entre gestor e colaborador.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-003: Avaliacao de Performance e Desenvolvimento ──
END $$;