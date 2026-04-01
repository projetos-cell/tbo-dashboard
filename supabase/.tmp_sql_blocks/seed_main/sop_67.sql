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
    'Fluxo de Caixa e DRE Mensal',
    'tbo-fin-003-fluxo-de-caixa-e-dre-mensal',
    'financeiro',
    'checklist',
    'Marco Andolfato (Dir. Operações)',
    'Standard Operating Procedure

Fluxo de Caixa e DRE Mensal

Código

TBO-FIN-003

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Financeiro (Controladoria)

Responsável

Marco Andolfato (Dir. Operações)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.

2. Escopo

2.1 O que está coberto

Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.

2.2 Exclusões

Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco

Atualizar fluxo de caixa, consolidar DRE, acionar contingência

Executor

---

Ruy

Revisar DRE e participar de decisões estratégicas

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.

4.2 Ferramentas e Acessos

TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.

5. Procedimento Passo a Passo

5.1. Fluxo de Caixa Projetado (semanal)

Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).

Responsável: Marco

Output: Fluxo de caixa atualizado

Prazo referência: Toda sexta-feira

5.2. DRE Mensal

Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.

Responsável: Marco

Output: DRE mensal consolidada

Prazo referência: Até dia 10 de cada mês

5.3. Reunião Financeira Mensal

Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.

Responsável: Marco + Ruy

Output: Ata com decisões financeiras registrada

Prazo referência: Até dia 15 de cada mês

5.4. Plano de Contingência

Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.

Responsável: Marco

Output: Plano de contingência ativado

Prazo referência: Imediato quando detectado

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Fluxo de caixa atualizado semanalmente

[ ] DRE mensal consolidada até dia 10

[ ] Reunião financeira mensal realizada até dia 15

[ ] Plano de contingência acionado quando necessário

6.2 Erros Comuns a Evitar

Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação

DRE atrasada → decisões baseadas em feeling, não em dados

Ignorar saldo negativo projetado → crise de liquidez evitável

7. Ferramentas e Templates

TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).

8. SLAs e Prazos

Fluxo de caixa: atualização semanal (sexta)

DRE: até dia 10

Reunião financeira: até dia 15

Contingência: imediato se projeção 30d for negativa

9. Fluxograma

Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim

10. Glossário

DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.

EBITDA: lucro antes de juros, impostos, depreciação e amortização.

Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.

Contingência: ações emergenciais para evitar crise de liquidez.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Fluxo de Caixa e DRE Mensal</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-FIN-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Financeiro (Controladoria)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Dir. Operações)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.</p><p><strong>2.2 Exclusões</strong></p><p>Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Atualizar fluxo de caixa, consolidar DRE, acionar contingência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Revisar DRE e participar de decisões estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Fluxo de Caixa Projetado (semanal)</strong></p><p>Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).</p><p>Responsável: Marco</p><p>Output: Fluxo de caixa atualizado</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.2. DRE Mensal</strong></p><p>Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.</p><p>Responsável: Marco</p><p>Output: DRE mensal consolidada</p><p>Prazo referência: Até dia 10 de cada mês</p><p><strong>5.3. Reunião Financeira Mensal</strong></p><p>Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.</p><p>Responsável: Marco + Ruy</p><p>Output: Ata com decisões financeiras registrada</p><p>Prazo referência: Até dia 15 de cada mês</p><p><strong>5.4. Plano de Contingência</strong></p><p>Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.</p><p>Responsável: Marco</p><p>Output: Plano de contingência ativado</p><p>Prazo referência: Imediato quando detectado</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Fluxo de caixa atualizado semanalmente</li><li>[ ] DRE mensal consolidada até dia 10</li><li>[ ] Reunião financeira mensal realizada até dia 15</li><li>[ ] Plano de contingência acionado quando necessário</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação</li><li>DRE atrasada → decisões baseadas em feeling, não em dados</li><li>Ignorar saldo negativo projetado → crise de liquidez evitável</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Fluxo de caixa: atualização semanal (sexta)</li><li>DRE: até dia 10</li><li>Reunião financeira: até dia 15</li><li>Contingência: imediato se projeção 30d for negativa</li></ul><p><strong>9. Fluxograma</strong></p><p>Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim</p><p><strong>10. Glossário</strong></p><p>DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.</p><p>EBITDA: lucro antes de juros, impostos, depreciação e amortização.</p><p>Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.</p><p>Contingência: ações emergenciais para evitar crise de liquidez.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['financeiro','fiscal','entrega','qualidade']::TEXT[],
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

  -- Steps for TBO-FIN-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.', '<p>Manter visibilidade constante da saúde financeira da TBO através de fluxo de caixa projetado para 90 dias e DRE mensal, permitindo decisões informadas sobre investimentos, contratações e operação.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.', '<p>Projeção semanal de fluxo de caixa, DRE mensal consolidada, reunião financeira mensal entre sócios e plano de contingência para caixa negativo.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).', '<p>Contas a receber (SOP-FIN-001), contas a pagar (SOP-FIN-002), forecast comercial (SOP-COM-004), planejamento tributário (contabilidade externa).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco

Atualizar fluxo de caixa, consolidar DRE, acionar contingência

Executor

---

Ruy

Revisar DRE e participar de decisões estratégicas

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Atualizar fluxo de caixa, consolidar DRE, acionar contingência</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Ruy</strong></p></td><td><p>Revisar DRE e participar de decisões estratégicas</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.', '<p>Contas a receber atualizadas; contas a pagar registradas; pipeline comercial ponderado (SOP-COM-004); extrato bancário atualizado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.', '<p>TBO OS (módulo financeiro), Omie ERP, Google Sheets (fluxo de caixa), BB Empresarial.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Fluxo de Caixa Projetado (semanal)', 'Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).

Responsável: Marco

Output: Fluxo de caixa atualizado

Prazo referência: Toda sexta-feira', '<p>Ação: Marco atualiza semanalmente a projeção para 90 dias, cruzando contas a receber (contratos + pipeline ponderado) com contas a pagar (fixas + variáveis previstas).</p><p>Responsável: Marco</p><p>Output: Fluxo de caixa atualizado</p><p>Prazo referência: Toda sexta-feira</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. DRE Mensal', 'Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.

Responsável: Marco

Output: DRE mensal consolidada

Prazo referência: Até dia 10 de cada mês', '<p>Ação: Até dia 10, Marco consolida a DRE do mês anterior: Receita Bruta → Impostos → Receita Líquida → Custos de Produção → Margem Bruta → Despesas Operacionais → EBITDA.</p><p>Responsável: Marco</p><p>Output: DRE mensal consolidada</p><p>Prazo referência: Até dia 10 de cada mês</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Reunião Financeira Mensal', 'Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.

Responsável: Marco + Ruy

Output: Ata com decisões financeiras registrada

Prazo referência: Até dia 15 de cada mês', '<p>Ação: Marco e Ruy revisam DRE e fluxo de caixa até dia 15. Decisões sobre investimentos, contratações ou cortes são registradas em ata no TBO OS.</p><p>Responsável: Marco + Ruy</p><p>Output: Ata com decisões financeiras registrada</p><p>Prazo referência: Até dia 15 de cada mês</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Plano de Contingência', 'Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.

Responsável: Marco

Output: Plano de contingência ativado

Prazo referência: Imediato quando detectado', '<p>Ação: Se o fluxo projetado para 30 dias indicar saldo negativo, Marco aciona imediatamente: antecipação de recebíveis, renegociação de prazos com fornecedores, contenção de despesas variáveis.</p><p>Responsável: Marco</p><p>Output: Plano de contingência ativado</p><p>Prazo referência: Imediato quando detectado</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Fluxo de caixa atualizado semanalmente

[ ] DRE mensal consolidada até dia 10

[ ] Reunião financeira mensal realizada até dia 15

[ ] Plano de contingência acionado quando necessário', '<ul><li>[ ] Fluxo de caixa atualizado semanalmente</li><li>[ ] DRE mensal consolidada até dia 10</li><li>[ ] Reunião financeira mensal realizada até dia 15</li><li>[ ] Plano de contingência acionado quando necessário</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação

DRE atrasada → decisões baseadas em feeling, não em dados

Ignorar saldo negativo projetado → crise de liquidez evitável', '<ul><li>Não projetar fluxo de caixa → surpresas de caixa negativo sem tempo de reação</li><li>DRE atrasada → decisões baseadas em feeling, não em dados</li><li>Ignorar saldo negativo projetado → crise de liquidez evitável</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).', '<p>TBO OS (financeiro), Omie ERP (dados contábeis), Google Sheets (projeções), BB Empresarial (extrato).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Fluxo de caixa: atualização semanal (sexta)

DRE: até dia 10

Reunião financeira: até dia 15

Contingência: imediato se projeção 30d for negativa', '<ul><li>Fluxo de caixa: atualização semanal (sexta)</li><li>DRE: até dia 10</li><li>Reunião financeira: até dia 15</li><li>Contingência: imediato se projeção 30d for negativa</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim', '<p>Sexta: Atualizar Fluxo de Caixa → Projeção 30d negativa? → Sim: Acionar Contingência → Dia 10: Consolidar DRE → Dia 15: Reunião Financeira (Marco + Ruy) → Decisões Registradas → Fim / Não: Dia 10: DRE → Dia 15: Reunião → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.

EBITDA: lucro antes de juros, impostos, depreciação e amortização.

Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.

Contingência: ações emergenciais para evitar crise de liquidez.', '<p>DRE: Demonstração do Resultado do Exercício — relatório que mostra receitas, custos e lucro.</p><p>EBITDA: lucro antes de juros, impostos, depreciação e amortização.</p><p>Fluxo de caixa projetado: estimativa de entradas e saídas nos próximos 90 dias.</p><p>Contingência: ações emergenciais para evitar crise de liquidez.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-RH-001: Recrutamento e Selecao ──
END $$;