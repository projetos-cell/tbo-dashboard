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
    'Reports e Análise de Performance',
    'tbo-mkt-012-reports-e-analise-de-performance',
    'marketing',
    'checklist',
    'Reports e Análise de Performance',
    'Standard Operating Procedure

Reports e Análise de Performance

Código

TBO-MKT-012

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Marketing

Responsável

Rafa (PO Marketing)

Aprovador

Marco Andolfato



  1. Objetivo

Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.

  2. Escopo

2.1 O que está coberto

Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.

2.2 Exclusões

Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Analista de Marketing

Coleta dados, monta e envia relatórios

Rafa / Lucca

Especialista em Tráfego

Rafa / Lucca

Analisa e assina recomendações estratégicas

Marco Andolfato

Cliente

Marco Andolfato

Aprova relatório final de campanha

—

Cliente, BU Estratégia

  4. Pré-requisitos

4.1 Inputs necessários

Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.

4.2 Ferramentas e Acessos

Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.



  5. Procedimento Passo a Passo

5.1. Configuração do Dashboard de Performance

Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.

Responsável: Analista de Marketing

Output: Dashboard ao vivo compartilhado com cliente e gestores internos.

Prazo referência: D+7 após início da campanha

5.2. Coleta e Consolidação Semanal de Dados

Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.

Responsável: Analista de Marketing

Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.

Prazo referência: Toda sexta-feira

5.3. Relatório Semanal de Tráfego

Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.

Responsável: Analista de Marketing

Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.

Prazo referência: Toda segunda-feira

5.4. Relatório Quinzenal de Performance (Fase Lançamento)

Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.

Prazo referência: A cada 15 dias durante a fase de lançamento

5.5. Relatório Mensal Consolidado

Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.

Responsável: Rafa / Lucca

Output: Relatório mensal completo enviado até o dia 5 de cada mês.

Prazo referência: Até dia 5 do mês seguinte

5.6. Relatório Final de Campanha

Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.

Prazo referência: Até 15 dias após encerramento da campanha

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.

6.2 Erros Comuns a Evitar

Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.

  7. Ferramentas e Templates

Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.

  8. SLAs e Prazos

Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.

  9. Fluxograma

Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim

  10. Glossário

Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Reports e Análise de Performance</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-012</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.</p><p><strong>2.2 Exclusões</strong></p><p>Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, monta e envia relatórios</p></td><td><p>Rafa / Lucca</p></td><td><p>Especialista em Tráfego</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Analisa e assina recomendações estratégicas</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprova relatório final de campanha</p></td><td><p>—</p></td><td><p>Cliente, BU Estratégia</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Configuração do Dashboard de Performance</strong></p><p>Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.</p><p>Responsável: Analista de Marketing</p><p>Output: Dashboard ao vivo compartilhado com cliente e gestores internos.</p><p>Prazo referência: D+7 após início da campanha</p><p><strong>5.2. Coleta e Consolidação Semanal de Dados</strong></p><p>Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.</p><p>Prazo referência: Toda sexta-feira</p><p><strong>5.3. Relatório Semanal de Tráfego</strong></p><p>Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.4. Relatório Quinzenal de Performance (Fase Lançamento)</strong></p><p>Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.</p><p>Prazo referência: A cada 15 dias durante a fase de lançamento</p><p><strong>5.5. Relatório Mensal Consolidado</strong></p><p>Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório mensal completo enviado até o dia 5 de cada mês.</p><p>Prazo referência: Até dia 5 do mês seguinte</p><p><strong>5.6. Relatório Final de Campanha</strong></p><p>Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.</p><p>Prazo referência: Até 15 dias após encerramento da campanha</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim</p><p><strong>  10. Glossário</strong></p><p>Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    11,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-012
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.', '<p>Compilar, analisar e apresentar os dados de performance de marketing do empreendimento de forma estruturada, garantindo que clientes e stakeholders internos tenham visibilidade clara dos resultados, ROI e recomendações estratégicas a cada ciclo.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.', '<p>Coleta de dados de todos os canais, consolidação em dashboard unificado, análise de funil de conversão, elaboração de relatórios semanais (tráfego), quinzenais (lançamento) e mensais (visão geral), relatório final de campanha.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).', '<p>Análise de dados de vendas (BU Comercial), relatório de resultado financeiro do empreendimento (Incorporadora).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Analista de Marketing

Coleta dados, monta e envia relatórios

Rafa / Lucca

Especialista em Tráfego

Rafa / Lucca

Analisa e assina recomendações estratégicas

Marco Andolfato

Cliente

Marco Andolfato

Aprova relatório final de campanha

—

Cliente, BU Estratégia', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, monta e envia relatórios</p></td><td><p>Rafa / Lucca</p></td><td><p>Especialista em Tráfego</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Analisa e assina recomendações estratégicas</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprova relatório final de campanha</p></td><td><p>—</p></td><td><p>Cliente, BU Estratégia</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.', '<p>Acesso a todos os canais de dados: Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Social Media Insights, planilha de estoque/vendas da incorporadora.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.', '<p>Google Looker Studio (dashboard), Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Configuração do Dashboard de Performance', 'Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.

Responsável: Analista de Marketing

Output: Dashboard ao vivo compartilhado com cliente e gestores internos.

Prazo referência: D+7 após início da campanha', '<p>Ação: Criar dashboard unificado no Google Looker Studio conectando: GA4, Meta Ads, Google Ads, e dados manuais de social/e-mail. Dashboard deve exibir: leads por canal, CPL por canal, funil de conversão (lead→visita→proposta→venda), investimento acumulado vs. budget, alcance e frequência.</p><p>Responsável: Analista de Marketing</p><p>Output: Dashboard ao vivo compartilhado com cliente e gestores internos.</p><p>Prazo referência: D+7 após início da campanha</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Coleta e Consolidação Semanal de Dados', 'Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.

Responsável: Analista de Marketing

Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.

Prazo referência: Toda sexta-feira', '<p>Ação: Toda sexta-feira: exportar dados da semana de todos os canais e consolidar na planilha master. Validar consistência: volume de leads no Meta/Google vs. chegada no RD Station (tolerância de 5% de discrepância máxima). Investigar e registrar qualquer anomalia.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha master atualizada toda sexta-feira com dados consolidados e validados.</p><p>Prazo referência: Toda sexta-feira</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Relatório Semanal de Tráfego', 'Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.

Responsável: Analista de Marketing

Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.

Prazo referência: Toda segunda-feira', '<p>Ação: Elaborar relatório semanal (para Rafa/Lucca e cliente): investimento da semana, leads gerados por canal, CPL por canal vs. meta, criativos de melhor e pior performance, frequência, anomalias detectadas e ações tomadas, perspectiva para próxima semana.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado toda segunda-feira via e-mail ao cliente.</p><p>Prazo referência: Toda segunda-feira</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Relatório Quinzenal de Performance (Fase Lançamento)', 'Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.

Prazo referência: A cada 15 dias durante a fase de lançamento', '<p>Ação: Na fase de lançamento, elaborar relatório quinzenal com visão mais estratégica: leads acumulados vs. meta da fase, funil completo com taxas de conversão, qualidade de leads (feedback do comercial), ROI parcial estimado, ajustes de estratégia recomendados.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Relatório quinzenal apresentado ao cliente em reunião de alinhamento.</p><p>Prazo referência: A cada 15 dias durante a fase de lançamento</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Mensal Consolidado', 'Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.

Responsável: Rafa / Lucca

Output: Relatório mensal completo enviado até o dia 5 de cada mês.

Prazo referência: Até dia 5 do mês seguinte', '<p>Ação: Todo mês: consolidar performance mensal de todos os canais com análise de tendência (comparativo mês anterior), análise de qualidade dos leads (taxa de conversão em visitas e propostas), análise de ROI de mídia por canal, ranking de criativos do mês, recomendações para o mês seguinte.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório mensal completo enviado até o dia 5 de cada mês.</p><p>Prazo referência: Até dia 5 do mês seguinte</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório Final de Campanha', 'Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.

Prazo referência: Até 15 dias após encerramento da campanha', '<p>Ação: Ao encerrar o ciclo completo da campanha: compilar relatório final com visão integral da campanha (pré-lançamento + lançamento + sustentação). Incluir: total investido, total de leads gerados, CPL médio por fase, funil de conversão completo, ROI total, 5 principais aprendizados e recomendações para o próximo produto.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Relatório final de campanha apresentado ao cliente em reunião de encerramento. Cópia arquivada no Notion.</p><p>Prazo referência: Até 15 dias após encerramento da campanha</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.', '<p>Dashboard ao vivo compartilhado desde a semana 1; relatórios semanais sem atraso; discrepância entre plataformas investigada (máx 5%); relatório final entregue em até 15 dias; aprendizados arquivados no Notion para uso futuro.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.', '<p>Relatórios apenas com dados sem análise e recomendações; inconsistências entre plataformas não investigadas; dashboard não atualizado em tempo real; relatório final sem aprendizados documentados; envio de relatório sem contextualização estratégica.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.', '<p>Google Looker Studio, Google Analytics 4, Meta Ads Manager, Google Ads, RD Station, planilha de consolidação TBO, Google Slides, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.', '<p>Dashboard ao vivo: D+7; relatório semanal: toda segunda-feira; relatório quinzenal: a cada 15 dias (fase lançamento); relatório mensal: dia 5 do mês seguinte; relatório final: 15 dias após encerramento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim', '<p>Início → Setup dashboard (D+7) → Coleta semanal (sextas) → Relatório semanal (segundas) → Relatório quinzenal (lançamento) → Relatório mensal (dia 5) → Relatório final (até D+15 do encerramento) → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.', '<p>Looker Studio: ferramenta de visualização de dados do Google (antes Data Studio). Funil de conversão: sequência lead → visita → proposta → venda com taxas de cada etapa. ROI: Return on Investment. CPL médio: média ponderada do custo por lead considerando todos os canais. Benchmark: referência de mercado para comparação de KPIs.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-AV-001: Teaser de Lançamento ──
END $$;