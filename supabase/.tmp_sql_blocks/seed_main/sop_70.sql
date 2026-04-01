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
    'Avaliacao de Performance e Desenvolvimento',
    'tbo-rh-003-avaliacao-de-performance-e-desenvolvimento',
    'recursos-humanos',
    'checklist',
    'Avaliação de Performance e Desenvolvimento',
    'Standard Operating Procedure

Avaliação de Performance e Desenvolvimento

Código

TBO-RH-003

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

Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.

2. Escopo

2.1 O que está coberto

1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.

2.2 Exclusões

Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

PO da BU

Conduzir 1:1 mensal e preencher avaliação

Executor

---

Marco

Avaliação trimestral e anual, decisões de performance

Aprovador

---

Colaborador

Participar, dar e receber feedback, cumprir plano de ação

Executor

---



4. Pré-requisitos

4.1 Inputs necessários

Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.

4.2 Ferramentas e Acessos

TBO OS (módulo People), Google Meet.

5. Procedimento Passo a Passo

5.1. 1:1 Mensal (PO ↔ Colaborador)

Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.

Responsável: PO da BU

Output: Registro de 1:1 no TBO OS

Prazo referência: Mensal

5.2. Avaliação Trimestral

Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.

Responsável: Marco

Output: Avaliação trimestral registrada com plano de ação

Prazo referência: Trimestral

5.3. Avaliação Anual

Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.

Responsável: Marco + Ruy

Output: Avaliação anual registrada, decisões formalizadas

Prazo referência: Dezembro/Janeiro

5.4. Gestão de Baixa Performance

Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).

Responsável: Marco

Output: Plano de melhoria ou decisão de desligamento

Prazo referência: Conforme ciclo

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] 1:1 mensal realizada e registrada

[ ] Avaliação trimestral concluída

[ ] Avaliação anual com decisões formalizadas

[ ] Plano de melhoria documentado (quando aplicável)

6.2 Erros Comuns a Evitar

1:1 sem registro → feedback se perde, padrões não aparecem

Avaliar sem exemplos concretos → feedback genérico não gera ação

Demitir sem feedback documentado → risco trabalhista e cultural

7. Ferramentas e Templates

TBO OS (People), Google Meet.

8. SLAs e Prazos

1:1: mensal

Avaliação trimestral: a cada 3 meses

Avaliação anual: dezembro/janeiro

Plano de melhoria: mínimo 30 dias antes de decisão de desligamento

9. Fluxograma

Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004

10. Glossário

1:1: reunião individual entre gestor e colaborador para feedback.

Plano de melhoria: documento formal com metas específicas e prazo para evolução.

Feedback 360°: avaliação coletada de pares, líderes e liderados.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Avaliação de Performance e Desenvolvimento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-RH-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Recursos Humanos (People)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.</p><p><strong>2.2 Exclusões</strong></p><p>Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Conduzir 1:1 mensal e preencher avaliação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Avaliação trimestral e anual, decisões de performance</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Colaborador</strong></p></td><td><p>Participar, dar e receber feedback, cumprir plano de ação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (módulo People), Google Meet.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. 1:1 Mensal (PO ↔ Colaborador)</strong></p><p>Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Registro de 1:1 no TBO OS</p><p>Prazo referência: Mensal</p><p><strong>5.2. Avaliação Trimestral</strong></p><p>Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.</p><p>Responsável: Marco</p><p>Output: Avaliação trimestral registrada com plano de ação</p><p>Prazo referência: Trimestral</p><p><strong>5.3. Avaliação Anual</strong></p><p>Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.</p><p>Responsável: Marco + Ruy</p><p>Output: Avaliação anual registrada, decisões formalizadas</p><p>Prazo referência: Dezembro/Janeiro</p><p><strong>5.4. Gestão de Baixa Performance</strong></p><p>Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).</p><p>Responsável: Marco</p><p>Output: Plano de melhoria ou decisão de desligamento</p><p>Prazo referência: Conforme ciclo</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] 1:1 mensal realizada e registrada</li><li>[ ] Avaliação trimestral concluída</li><li>[ ] Avaliação anual com decisões formalizadas</li><li>[ ] Plano de melhoria documentado (quando aplicável)</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>1:1 sem registro → feedback se perde, padrões não aparecem</li><li>Avaliar sem exemplos concretos → feedback genérico não gera ação</li><li>Demitir sem feedback documentado → risco trabalhista e cultural</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (People), Google Meet.</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>1:1: mensal</li><li>Avaliação trimestral: a cada 3 meses</li><li>Avaliação anual: dezembro/janeiro</li><li>Plano de melhoria: mínimo 30 dias antes de decisão de desligamento</li></ul><p><strong>9. Fluxograma</strong></p><p>Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004</p><p><strong>10. Glossário</strong></p><p>1:1: reunião individual entre gestor e colaborador para feedback.</p><p>Plano de melhoria: documento formal com metas específicas e prazo para evolução.</p><p>Feedback 360°: avaliação coletada de pares, líderes e liderados.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['rh','pessoas','entrega','qualidade','aprovacao']::TEXT[],
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

  -- Steps for TBO-RH-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.', '<p>Criar cultura de feedback estruturado na TBO, com avaliações regulares, metas claras e oportunidades de desenvolvimento para cada membro do time.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', '1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.', '<p>1:1 mensal, avaliação trimestral, avaliação anual, plano de desenvolvimento individual e regras para decisões de performance.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).', '<p>Recrutamento (SOP-RH-001), onboarding (SOP-RH-002), desligamento (SOP-RH-004).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

PO da BU

Conduzir 1:1 mensal e preencher avaliação

Executor

---

Marco

Avaliação trimestral e anual, decisões de performance

Aprovador

---

Colaborador

Participar, dar e receber feedback, cumprir plano de ação

Executor

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>PO da BU</strong></p></td><td><p>Conduzir 1:1 mensal e preencher avaliação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Avaliação trimestral e anual, decisões de performance</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr><tr><td><p><strong>Colaborador</strong></p></td><td><p>Participar, dar e receber feedback, cumprir plano de ação</p></td><td><p>Executor</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.', '<p>Formulário de avaliação configurado no TBO OS (People); critérios por BU definidos; histórico de entregas do colaborador.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo People), Google Meet.', '<p>TBO OS (módulo People), Google Meet.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. 1:1 Mensal (PO ↔ Colaborador)', 'Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.

Responsável: PO da BU

Output: Registro de 1:1 no TBO OS

Prazo referência: Mensal', '<p>Ação: PO conduz conversa de 30 min com agenda aberta + checklist de performance: qualidade de entregas, prazos, colaboração, iniciativa, aderência aos SOPs. Resultado registrado no TBO OS.</p><p>Responsável: PO da BU</p><p>Output: Registro de 1:1 no TBO OS</p><p>Prazo referência: Mensal</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Avaliação Trimestral', 'Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.

Responsável: Marco

Output: Avaliação trimestral registrada com plano de ação

Prazo referência: Trimestral', '<p>Ação: Marco conversa individualmente com cada colaborador sobre performance geral, alinhamento cultural e aspirações. Plano de ação definido para o próximo trimestre.</p><p>Responsável: Marco</p><p>Output: Avaliação trimestral registrada com plano de ação</p><p>Prazo referência: Trimestral</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Avaliação Anual', 'Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.

Responsável: Marco + Ruy

Output: Avaliação anual registrada, decisões formalizadas

Prazo referência: Dezembro/Janeiro', '<p>Ação: Revisão completa: performance do ano, metas atingidas, feedback consolidado. Decisão sobre: ajuste salarial, promoção, manutenção ou plano de melhoria.</p><p>Responsável: Marco + Ruy</p><p>Output: Avaliação anual registrada, decisões formalizadas</p><p>Prazo referência: Dezembro/Janeiro</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gestão de Baixa Performance', 'Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).

Responsável: Marco

Output: Plano de melhoria ou decisão de desligamento

Prazo referência: Conforme ciclo', '<p>Ação: Se performance abaixo do esperado: plano de melhoria formal (mínimo 30 dias) com metas claras. Se não melhorar após 2 ciclos documentados: processo de desligamento (SOP-RH-004).</p><p>Responsável: Marco</p><p>Output: Plano de melhoria ou decisão de desligamento</p><p>Prazo referência: Conforme ciclo</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] 1:1 mensal realizada e registrada

[ ] Avaliação trimestral concluída

[ ] Avaliação anual com decisões formalizadas

[ ] Plano de melhoria documentado (quando aplicável)', '<ul><li>[ ] 1:1 mensal realizada e registrada</li><li>[ ] Avaliação trimestral concluída</li><li>[ ] Avaliação anual com decisões formalizadas</li><li>[ ] Plano de melhoria documentado (quando aplicável)</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', '1:1 sem registro → feedback se perde, padrões não aparecem

Avaliar sem exemplos concretos → feedback genérico não gera ação

Demitir sem feedback documentado → risco trabalhista e cultural', '<ul><li>1:1 sem registro → feedback se perde, padrões não aparecem</li><li>Avaliar sem exemplos concretos → feedback genérico não gera ação</li><li>Demitir sem feedback documentado → risco trabalhista e cultural</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (People), Google Meet.', '<p>TBO OS (People), Google Meet.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', '1:1: mensal

Avaliação trimestral: a cada 3 meses

Avaliação anual: dezembro/janeiro

Plano de melhoria: mínimo 30 dias antes de decisão de desligamento', '<ul><li>1:1: mensal</li><li>Avaliação trimestral: a cada 3 meses</li><li>Avaliação anual: dezembro/janeiro</li><li>Plano de melhoria: mínimo 30 dias antes de decisão de desligamento</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004', '<p>Mensal: 1:1 (PO + Colaborador) → Trimestral: Avaliação (Marco) → Plano de Ação → Anual: Revisão Completa → Promoção / Manutenção / Plano de Melhoria → Se melhoria: 30 dias → Melhorou? → Sim: Continua / Não: SOP-RH-004</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', '1:1: reunião individual entre gestor e colaborador para feedback.

Plano de melhoria: documento formal com metas específicas e prazo para evolução.

Feedback 360°: avaliação coletada de pares, líderes e liderados.', '<p>1:1: reunião individual entre gestor e colaborador para feedback.</p><p>Plano de melhoria: documento formal com metas específicas e prazo para evolução.</p><p>Feedback 360°: avaliação coletada de pares, líderes e liderados.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-004: Desligamento e Offboarding ──
END $$;