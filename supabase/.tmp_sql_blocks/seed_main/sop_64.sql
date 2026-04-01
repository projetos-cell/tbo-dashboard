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
    'Pipeline e Forecast Comercial',
    'tbo-com-004-pipeline-e-forecast-comercial',
    'comercial',
    'checklist',
    'Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.',
    'Standard Operating Procedure

Pipeline e Forecast Comercial

Código

TBO-COM-004

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Comercial (Vendas / BD)

Responsável

Ruy Lima (CEO/CMO)

Aprovador

Marco Andolfato + Ruy Lima



1. Objetivo

Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.

2. Escopo

2.1 O que está coberto

Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.

2.2 Exclusões

Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).

3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Ruy Lima

Manter CRM atualizado e gerar forecast

Executor

---

Marco

Revisar pipeline e alinhar capacidade operacional

Aprovador

---



4. Pré-requisitos

4.1 Inputs necessários

RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.

4.2 Ferramentas e Acessos

RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).

5. Procedimento Passo a Passo

5.1. Atualização Diária do CRM

Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).

Responsável: Ruy Lima

Output: CRM atualizado diariamente

Prazo referência: Contínuo

5.2. Reunião de Pipeline (semanal)

Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.

Responsável: Marco + Ruy

Output: Decisões registradas e pipeline higienizado

Prazo referência: Toda segunda-feira

5.3. Forecast Mensal

Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.

Responsável: Ruy Lima

Output: Forecast mensal compartilhado

Prazo referência: Até dia 5 de cada mês

5.4. Higienização do Pipeline

Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.

Responsável: Ruy Lima

Output: Pipeline refletindo a realidade

Prazo referência: Semanal (na reunião)

6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todas as oportunidades no estágio correto do funil

[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio

[ ] Reunião semanal de pipeline realizada

[ ] Forecast mensal gerado e compartilhado

6.2 Erros Comuns a Evitar

Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas

Não atualizar CRM diariamente → visibilidade zero do cenário comercial

Forecast sem ponderação → projeção irreal de receita

7. Ferramentas e Templates

RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).

8. SLAs e Prazos

Atualização do CRM: diária

Reunião de pipeline: toda segunda-feira (15 min)

Forecast mensal: até dia 5 de cada mês

Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d

9. Fluxograma

Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim

10. Glossário

Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.

Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.

Pipeline ponderado: valor total × probabilidade de cada oportunidade.

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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Pipeline e Forecast Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-COM-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Comercial (Vendas / BD)</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Ruy Lima (CEO/CMO)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato + Ruy Lima</p></td></tr></table><p><strong>1. Objetivo</strong></p><p>Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.</p><p><strong>2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.</p><p><strong>2.2 Exclusões</strong></p><p>Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).</p><p><strong>3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Manter CRM atualizado e gerar forecast</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Revisar pipeline e alinhar capacidade operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table><p><strong>4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).</p><p><strong>5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Atualização Diária do CRM</strong></p><p>Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).</p><p>Responsável: Ruy Lima</p><p>Output: CRM atualizado diariamente</p><p>Prazo referência: Contínuo</p><p><strong>5.2. Reunião de Pipeline (semanal)</strong></p><p>Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.</p><p>Responsável: Marco + Ruy</p><p>Output: Decisões registradas e pipeline higienizado</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.3. Forecast Mensal</strong></p><p>Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.</p><p>Responsável: Ruy Lima</p><p>Output: Forecast mensal compartilhado</p><p>Prazo referência: Até dia 5 de cada mês</p><p><strong>5.4. Higienização do Pipeline</strong></p><p>Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.</p><p>Responsável: Ruy Lima</p><p>Output: Pipeline refletindo a realidade</p><p>Prazo referência: Semanal (na reunião)</p><p><strong>6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><ul><li>[ ] Todas as oportunidades no estágio correto do funil</li><li>[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio</li><li>[ ] Reunião semanal de pipeline realizada</li><li>[ ] Forecast mensal gerado e compartilhado</li></ul><p><strong>6.2 Erros Comuns a Evitar</strong></p><ul><li>Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas</li><li>Não atualizar CRM diariamente → visibilidade zero do cenário comercial</li><li>Forecast sem ponderação → projeção irreal de receita</li></ul><p><strong>7. Ferramentas e Templates</strong></p><p>RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).</p><p><strong>8. SLAs e Prazos</strong></p><ul><li>Atualização do CRM: diária</li><li>Reunião de pipeline: toda segunda-feira (15 min)</li><li>Forecast mensal: até dia 5 de cada mês</li><li>Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d</li></ul><p><strong>9. Fluxograma</strong></p><p>Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim</p><p><strong>10. Glossário</strong></p><p>Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.</p><p>Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.</p><p>Pipeline ponderado: valor total × probabilidade de cada oportunidade.</p><p><strong>11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['comercial','vendas','entrega','qualidade','aprovacao']::TEXT[],
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

  -- Steps for TBO-COM-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.', '<p>Manter visibilidade atualizada do pipeline comercial para decisões sobre investimentos, contratações e capacidade operacional, com previsão de receita para os próximos 90 dias.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.', '<p>Estrutura do funil no CRM, atualização diária, reunião semanal de pipeline, forecast mensal ponderado.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).', '<p>Fluxo de caixa e DRE (SOP-FIN-003), gestão de capacidade operacional (SOP-OPS-004), estratégia de marketing para geração de leads (SOP-MKT).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Ruy Lima

Manter CRM atualizado e gerar forecast

Executor

---

Marco

Revisar pipeline e alinhar capacidade operacional

Aprovador

---', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p><strong>Ruy Lima</strong></p></td><td><p>Manter CRM atualizado e gerar forecast</p></td><td><p>Executor</p></td><td><p>---</p></td></tr><tr><td><p><strong>Marco</strong></p></td><td><p>Revisar pipeline e alinhar capacidade operacional</p></td><td><p>Aprovador</p></td><td><p>---</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.', '<p>RD Station CRM com funil estruturado; histórico de propostas e conversões; tabela de capacidade operacional por BU.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).', '<p>RD Station CRM, TBO OS (financeiro), Google Sheets (forecast).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Atualização Diária do CRM', 'Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).

Responsável: Ruy Lima

Output: CRM atualizado diariamente

Prazo referência: Contínuo', '<p>Ação: Ruy mantém cada oportunidade no estágio correto do funil: Lead Novo → Lead Qualificado → Diagnóstico Agendado → Proposta Enviada → Negociação → Ganho/Perdido. Prazos máximos: Lead Qualificado (5d), Proposta Enviada (10d), Negociação (15d).</p><p>Responsável: Ruy Lima</p><p>Output: CRM atualizado diariamente</p><p>Prazo referência: Contínuo</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Reunião de Pipeline (semanal)', 'Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.

Responsável: Marco + Ruy

Output: Decisões registradas e pipeline higienizado

Prazo referência: Toda segunda-feira', '<p>Ação: Marco e Ruy revisam o pipeline toda segunda-feira (15 min). Pauta: novas oportunidades, gargalos, probabilidade de fechamento, impacto na capacidade operacional.</p><p>Responsável: Marco + Ruy</p><p>Output: Decisões registradas e pipeline higienizado</p><p>Prazo referência: Toda segunda-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Forecast Mensal', 'Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.

Responsável: Ruy Lima

Output: Forecast mensal compartilhado

Prazo referência: Até dia 5 de cada mês', '<p>Ação: Ruy gera previsão de receita para 90 dias com base no pipeline ponderado (probabilidade × valor). Compartilha com Marco para planejamento financeiro e de capacidade.</p><p>Responsável: Ruy Lima</p><p>Output: Forecast mensal compartilhado</p><p>Prazo referência: Até dia 5 de cada mês</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Higienização do Pipeline', 'Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.

Responsável: Ruy Lima

Output: Pipeline refletindo a realidade

Prazo referência: Semanal (na reunião)', '<p>Ação: Oportunidades que ultrapassam prazo máximo sem movimentação são rebaixadas ou descartadas. Pipeline inflado gera decisões erradas.</p><p>Responsável: Ruy Lima</p><p>Output: Pipeline refletindo a realidade</p><p>Prazo referência: Semanal (na reunião)</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as oportunidades no estágio correto do funil

[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio

[ ] Reunião semanal de pipeline realizada

[ ] Forecast mensal gerado e compartilhado', '<ul><li>[ ] Todas as oportunidades no estágio correto do funil</li><li>[ ] Nenhuma oportunidade ultrapassando prazo máximo do estágio</li><li>[ ] Reunião semanal de pipeline realizada</li><li>[ ] Forecast mensal gerado e compartilhado</li></ul>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas

Não atualizar CRM diariamente → visibilidade zero do cenário comercial

Forecast sem ponderação → projeção irreal de receita', '<ul><li>Pipeline inflado com oportunidades mortas → decisões de contratação e investimento erradas</li><li>Não atualizar CRM diariamente → visibilidade zero do cenário comercial</li><li>Forecast sem ponderação → projeção irreal de receita</li></ul>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).', '<p>RD Station CRM (funil e oportunidades), Google Sheets (forecast ponderado), TBO OS (capacidade operacional).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização do CRM: diária

Reunião de pipeline: toda segunda-feira (15 min)

Forecast mensal: até dia 5 de cada mês

Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d', '<ul><li>Atualização do CRM: diária</li><li>Reunião de pipeline: toda segunda-feira (15 min)</li><li>Forecast mensal: até dia 5 de cada mês</li><li>Prazo máximo por estágio: Lead Qualificado 5d, Proposta Enviada 10d, Negociação 15d</li></ul>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim', '<p>Atualização Diária do CRM → Segunda-feira: Reunião de Pipeline (Marco + Ruy) → Gargalos? → Sim: Ações definidas → Dia 5: Forecast Mensal → Compartilhar com Marco → Fim / Não: Próxima semana → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.

Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.

Pipeline ponderado: valor total × probabilidade de cada oportunidade.', '<p>Pipeline: conjunto de oportunidades comerciais em diferentes estágios de maturação.</p><p>Forecast: previsão de receita futura baseada na probabilidade de fechamento das oportunidades.</p><p>Pipeline ponderado: valor total × probabilidade de cada oportunidade.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Marco Andolfato

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Marco Andolfato</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-FIN-001: Contas a Receber e Faturamento ──
END $$;