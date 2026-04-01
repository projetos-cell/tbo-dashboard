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
    'Plano de Mídias',
    'tbo-mkt-003-plano-de-midias',
    'marketing',
    'checklist',
    'Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.',
    'Standard Operating Procedure

Plano de Mídias

Código

TBO-MKT-003

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

Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.

  2. Escopo

2.1 O que está coberto

Planejamento de Google Ads, Meta Ads, portais imobiliários, mídia programática, YouTube, influenciadores (budget), e distribuição de investimento por fase e canal.

2.2 Exclusões

Execução e gestão das campanhas (coberto em MKT-09), produção de criativos (BU Criação), gestão de influenciadores (MKT-07).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora plano de mídias

Marco Andolfato

Cliente, BU Criação

Especialista em Tráfego

Valida viabilidade técnica e projeções

Rafa / Lucca

Analista de Marketing

Cliente / Incorporadora

Aprova budget e distribuição

Marco Andolfato

Rafa / Lucca

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Marketing aprovado (MKT-02); budget total de mídia aprovado; personas finais; data de lançamento; portais imobiliários de preferência do cliente.

4.2 Ferramentas e Acessos

Google Ads Keyword Planner, Meta Ads Manager (estimativas), planilha de plano de mídias TBO, Semrush.



  5. Procedimento Passo a Passo

5.1. Distribuição de Budget por Fase e Canal

Ação: Alocar o budget total de mídia entre as fases (Pré-Lançamento, Lançamento, Sustentação) e dentro de cada fase entre os canais (Meta Ads, Google Ads, portais, YouTube, programática). Justificar pesos com base nas personas e objetivos de cada fase.

Responsável: Rafa / Lucca + Especialista em Tráfego

Output: Planilha de distribuição de budget com percentuais e valores absolutos por fase/canal.

Prazo referência: D+3 após plano aprovado

5.2. Definição de Segmentações e Públicos

Ação: Mapear segmentações para cada canal: públicos por interesse, comportamento, localização (raio do empreendimento), faixa de renda estimada, lookalike de clientes anteriores. Criar matriz de públicos por fase.

Responsável: Especialista em Tráfego

Output: Matriz de segmentação por canal e fase.

Prazo referência: D+5

5.3. Definição de Formatos e Criativos Necessários

Ação: Listar todos os formatos de anúncio necessários por canal (stories, feed, carrossel, vídeo, display, search, responsive). Gerar briefing de produção para BU Criação com especificações técnicas.

Responsável: Rafa / Lucca

Output: Lista de formatos por canal e briefing de produção para criação.

Prazo referência: D+6

5.4. Projeções de Entrega e Metas por Canal

Ação: Calcular projeções de impressões, cliques, CPL estimado e volume de leads por canal baseado no budget alocado e benchmarks históricos de mercado imobiliário.

Responsável: Especialista em Tráfego

Output: Planilha de projeções com alcance, frequência, CTR estimado, CPL e volume de leads por canal.

Prazo referência: D+8

5.5. Cronograma de Ativação de Mídias

Ação: Definir datas de ativação, pausas e intensificações de cada canal ao longo das fases. Incluir períodos de testes A/B e janelas de otimização.

Responsável: Rafa / Lucca

Output: Cronograma de ativação em formato calendário ou Gantt.

Prazo referência: D+9

5.6. Aprovação do Plano de Mídias

Ação: Apresentar plano ao cliente com distribuição de budget, projeções e cronograma. Obter aprovação formal antes de iniciar produção de criativos e configuração das campanhas.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de mídias aprovado (documento assinado ou e-mail de validação).

Prazo referência: D+12

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Budget 100% alocado sem valor residual sem destino; projeções baseadas em CPL de referência de mercado imobiliário (não fictícias); todos os formatos mapeados para briefing de criação; cronograma alinhado com calendário de produção; aprovação formal registrada.

6.2 Erros Comuns a Evitar

Budget distribuído igualmente entre canais sem critério estratégico; projeções superestimadas sem embasamento; formatos de anúncio não especificados tecnicamente; plano sem cronograma de ativação.

  7. Ferramentas e Templates

Google Ads Keyword Planner, Meta Ads Manager (ferramenta de estimativas), planilha de plano de mídias TBO, Semrush, Notion.

  8. SLAs e Prazos

Rascunho do plano: D+9; aprovação cliente: D+12 após plano de marketing aprovado.

  9. Fluxograma

Início → Distribuição de Budget → Segmentações e Públicos → Formatos e Briefing Criação → Projeções por Canal → Cronograma de Ativação → Revisão interna → Apresentação cliente → Aprovação → Fim

  10. Glossário

CPM: Custo por Mil Impressões. CTR: Click-Through Rate. Lookalike: público similar a uma base de referência. Programática: compra automatizada de mídia digital. Formatos: dimensões e tipos de peças publicitárias por plataforma.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Plano de Mídias</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Planejamento de Google Ads, Meta Ads, portais imobiliários, mídia programática, YouTube, influenciadores (budget), e distribuição de investimento por fase e canal.</p><p><strong>2.2 Exclusões</strong></p><p>Execução e gestão das campanhas (coberto em MKT-09), produção de criativos (BU Criação), gestão de influenciadores (MKT-07).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Elabora plano de mídias</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Criação</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Valida viabilidade técnica e projeções</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprova budget e distribuição</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de Marketing aprovado (MKT-02); budget total de mídia aprovado; personas finais; data de lançamento; portais imobiliários de preferência do cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Ads Keyword Planner, Meta Ads Manager (estimativas), planilha de plano de mídias TBO, Semrush.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Distribuição de Budget por Fase e Canal</strong></p><p>Ação: Alocar o budget total de mídia entre as fases (Pré-Lançamento, Lançamento, Sustentação) e dentro de cada fase entre os canais (Meta Ads, Google Ads, portais, YouTube, programática). Justificar pesos com base nas personas e objetivos de cada fase.</p><p>Responsável: Rafa / Lucca + Especialista em Tráfego</p><p>Output: Planilha de distribuição de budget com percentuais e valores absolutos por fase/canal.</p><p>Prazo referência: D+3 após plano aprovado</p><p><strong>5.2. Definição de Segmentações e Públicos</strong></p><p>Ação: Mapear segmentações para cada canal: públicos por interesse, comportamento, localização (raio do empreendimento), faixa de renda estimada, lookalike de clientes anteriores. Criar matriz de públicos por fase.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Matriz de segmentação por canal e fase.</p><p>Prazo referência: D+5</p><p><strong>5.3. Definição de Formatos e Criativos Necessários</strong></p><p>Ação: Listar todos os formatos de anúncio necessários por canal (stories, feed, carrossel, vídeo, display, search, responsive). Gerar briefing de produção para BU Criação com especificações técnicas.</p><p>Responsável: Rafa / Lucca</p><p>Output: Lista de formatos por canal e briefing de produção para criação.</p><p>Prazo referência: D+6</p><p><strong>5.4. Projeções de Entrega e Metas por Canal</strong></p><p>Ação: Calcular projeções de impressões, cliques, CPL estimado e volume de leads por canal baseado no budget alocado e benchmarks históricos de mercado imobiliário.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Planilha de projeções com alcance, frequência, CTR estimado, CPL e volume de leads por canal.</p><p>Prazo referência: D+8</p><p><strong>5.5. Cronograma de Ativação de Mídias</strong></p><p>Ação: Definir datas de ativação, pausas e intensificações de cada canal ao longo das fases. Incluir períodos de testes A/B e janelas de otimização.</p><p>Responsável: Rafa / Lucca</p><p>Output: Cronograma de ativação em formato calendário ou Gantt.</p><p>Prazo referência: D+9</p><p><strong>5.6. Aprovação do Plano de Mídias</strong></p><p>Ação: Apresentar plano ao cliente com distribuição de budget, projeções e cronograma. Obter aprovação formal antes de iniciar produção de criativos e configuração das campanhas.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Plano de mídias aprovado (documento assinado ou e-mail de validação).</p><p>Prazo referência: D+12</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Budget 100% alocado sem valor residual sem destino; projeções baseadas em CPL de referência de mercado imobiliário (não fictícias); todos os formatos mapeados para briefing de criação; cronograma alinhado com calendário de produção; aprovação formal registrada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Budget distribuído igualmente entre canais sem critério estratégico; projeções superestimadas sem embasamento; formatos de anúncio não especificados tecnicamente; plano sem cronograma de ativação.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Ads Keyword Planner, Meta Ads Manager (ferramenta de estimativas), planilha de plano de mídias TBO, Semrush, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Rascunho do plano: D+9; aprovação cliente: D+12 após plano de marketing aprovado.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Distribuição de Budget → Segmentações e Públicos → Formatos e Briefing Criação → Projeções por Canal → Cronograma de Ativação → Revisão interna → Apresentação cliente → Aprovação → Fim</p><p><strong>  10. Glossário</strong></p><p>CPM: Custo por Mil Impressões. CTR: Click-Through Rate. Lookalike: público similar a uma base de referência. Programática: compra automatizada de mídia digital. Formatos: dimensões e tipos de peças publicitárias por plataforma.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.', '<p>Elaborar o plano tático de mídias pagas e orgânicas do empreendimento, detalhando distribuição de budget, canais, segmentações, formatos, cronograma de ativação e projeções de entrega por fase.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Planejamento de Google Ads, Meta Ads, portais imobiliários, mídia programática, YouTube, influenciadores (budget), e distribuição de investimento por fase e canal.', '<p>Planejamento de Google Ads, Meta Ads, portais imobiliários, mídia programática, YouTube, influenciadores (budget), e distribuição de investimento por fase e canal.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Execução e gestão das campanhas (coberto em MKT-09), produção de criativos (BU Criação), gestão de influenciadores (MKT-07).', '<p>Execução e gestão das campanhas (coberto em MKT-09), produção de criativos (BU Criação), gestão de influenciadores (MKT-07).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora plano de mídias

Marco Andolfato

Cliente, BU Criação

Especialista em Tráfego

Valida viabilidade técnica e projeções

Rafa / Lucca

Analista de Marketing

Cliente / Incorporadora

Aprova budget e distribuição

Marco Andolfato

Rafa / Lucca', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Elabora plano de mídias</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Criação</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Valida viabilidade técnica e projeções</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprova budget e distribuição</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02); budget total de mídia aprovado; personas finais; data de lançamento; portais imobiliários de preferência do cliente.', '<p>Plano de Marketing aprovado (MKT-02); budget total de mídia aprovado; personas finais; data de lançamento; portais imobiliários de preferência do cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Ads Keyword Planner, Meta Ads Manager (estimativas), planilha de plano de mídias TBO, Semrush.', '<p>Google Ads Keyword Planner, Meta Ads Manager (estimativas), planilha de plano de mídias TBO, Semrush.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Distribuição de Budget por Fase e Canal', 'Ação: Alocar o budget total de mídia entre as fases (Pré-Lançamento, Lançamento, Sustentação) e dentro de cada fase entre os canais (Meta Ads, Google Ads, portais, YouTube, programática). Justificar pesos com base nas personas e objetivos de cada fase.

Responsável: Rafa / Lucca + Especialista em Tráfego

Output: Planilha de distribuição de budget com percentuais e valores absolutos por fase/canal.

Prazo referência: D+3 após plano aprovado', '<p>Ação: Alocar o budget total de mídia entre as fases (Pré-Lançamento, Lançamento, Sustentação) e dentro de cada fase entre os canais (Meta Ads, Google Ads, portais, YouTube, programática). Justificar pesos com base nas personas e objetivos de cada fase.</p><p>Responsável: Rafa / Lucca + Especialista em Tráfego</p><p>Output: Planilha de distribuição de budget com percentuais e valores absolutos por fase/canal.</p><p>Prazo referência: D+3 após plano aprovado</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição de Segmentações e Públicos', 'Ação: Mapear segmentações para cada canal: públicos por interesse, comportamento, localização (raio do empreendimento), faixa de renda estimada, lookalike de clientes anteriores. Criar matriz de públicos por fase.

Responsável: Especialista em Tráfego

Output: Matriz de segmentação por canal e fase.

Prazo referência: D+5', '<p>Ação: Mapear segmentações para cada canal: públicos por interesse, comportamento, localização (raio do empreendimento), faixa de renda estimada, lookalike de clientes anteriores. Criar matriz de públicos por fase.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Matriz de segmentação por canal e fase.</p><p>Prazo referência: D+5</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Definição de Formatos e Criativos Necessários', 'Ação: Listar todos os formatos de anúncio necessários por canal (stories, feed, carrossel, vídeo, display, search, responsive). Gerar briefing de produção para BU Criação com especificações técnicas.

Responsável: Rafa / Lucca

Output: Lista de formatos por canal e briefing de produção para criação.

Prazo referência: D+6', '<p>Ação: Listar todos os formatos de anúncio necessários por canal (stories, feed, carrossel, vídeo, display, search, responsive). Gerar briefing de produção para BU Criação com especificações técnicas.</p><p>Responsável: Rafa / Lucca</p><p>Output: Lista de formatos por canal e briefing de produção para criação.</p><p>Prazo referência: D+6</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Projeções de Entrega e Metas por Canal', 'Ação: Calcular projeções de impressões, cliques, CPL estimado e volume de leads por canal baseado no budget alocado e benchmarks históricos de mercado imobiliário.

Responsável: Especialista em Tráfego

Output: Planilha de projeções com alcance, frequência, CTR estimado, CPL e volume de leads por canal.

Prazo referência: D+8', '<p>Ação: Calcular projeções de impressões, cliques, CPL estimado e volume de leads por canal baseado no budget alocado e benchmarks históricos de mercado imobiliário.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Planilha de projeções com alcance, frequência, CTR estimado, CPL e volume de leads por canal.</p><p>Prazo referência: D+8</p>', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Cronograma de Ativação de Mídias', 'Ação: Definir datas de ativação, pausas e intensificações de cada canal ao longo das fases. Incluir períodos de testes A/B e janelas de otimização.

Responsável: Rafa / Lucca

Output: Cronograma de ativação em formato calendário ou Gantt.

Prazo referência: D+9', '<p>Ação: Definir datas de ativação, pausas e intensificações de cada canal ao longo das fases. Incluir períodos de testes A/B e janelas de otimização.</p><p>Responsável: Rafa / Lucca</p><p>Output: Cronograma de ativação em formato calendário ou Gantt.</p><p>Prazo referência: D+9</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação do Plano de Mídias', 'Ação: Apresentar plano ao cliente com distribuição de budget, projeções e cronograma. Obter aprovação formal antes de iniciar produção de criativos e configuração das campanhas.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de mídias aprovado (documento assinado ou e-mail de validação).

Prazo referência: D+12', '<p>Ação: Apresentar plano ao cliente com distribuição de budget, projeções e cronograma. Obter aprovação formal antes de iniciar produção de criativos e configuração das campanhas.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Plano de mídias aprovado (documento assinado ou e-mail de validação).</p><p>Prazo referência: D+12</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Budget 100% alocado sem valor residual sem destino; projeções baseadas em CPL de referência de mercado imobiliário (não fictícias); todos os formatos mapeados para briefing de criação; cronograma alinhado com calendário de produção; aprovação formal registrada.', '<p>Budget 100% alocado sem valor residual sem destino; projeções baseadas em CPL de referência de mercado imobiliário (não fictícias); todos os formatos mapeados para briefing de criação; cronograma alinhado com calendário de produção; aprovação formal registrada.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Budget distribuído igualmente entre canais sem critério estratégico; projeções superestimadas sem embasamento; formatos de anúncio não especificados tecnicamente; plano sem cronograma de ativação.', '<p>Budget distribuído igualmente entre canais sem critério estratégico; projeções superestimadas sem embasamento; formatos de anúncio não especificados tecnicamente; plano sem cronograma de ativação.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Ads Keyword Planner, Meta Ads Manager (ferramenta de estimativas), planilha de plano de mídias TBO, Semrush, Notion.', '<p>Google Ads Keyword Planner, Meta Ads Manager (ferramenta de estimativas), planilha de plano de mídias TBO, Semrush, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Rascunho do plano: D+9; aprovação cliente: D+12 após plano de marketing aprovado.', '<p>Rascunho do plano: D+9; aprovação cliente: D+12 após plano de marketing aprovado.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Distribuição de Budget → Segmentações e Públicos → Formatos e Briefing Criação → Projeções por Canal → Cronograma de Ativação → Revisão interna → Apresentação cliente → Aprovação → Fim', '<p>Início → Distribuição de Budget → Segmentações e Públicos → Formatos e Briefing Criação → Projeções por Canal → Cronograma de Ativação → Revisão interna → Apresentação cliente → Aprovação → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'CPM: Custo por Mil Impressões. CTR: Click-Through Rate. Lookalike: público similar a uma base de referência. Programática: compra automatizada de mídia digital. Formatos: dimensões e tipos de peças publicitárias por plataforma.', '<p>CPM: Custo por Mil Impressões. CTR: Click-Through Rate. Lookalike: público similar a uma base de referência. Programática: compra automatizada de mídia digital. Formatos: dimensões e tipos de peças publicitárias por plataforma.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-004: Gestão de Campanha Pré Lançamento 45d ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Campanha Pré Lançamento 45d',
    'tbo-mkt-004-gestao-de-campanha-pre-lancamento-45d',
    'marketing',
    'checklist',
    'Gestão de Campanha — Pré-Lançamento (45d)',
    'Standard Operating Procedure

Gestão de Campanha — Pré-Lançamento (45d)

Código

TBO-MKT-004

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

Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.

  2. Escopo

2.1 O que está coberto

Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.

2.2 Exclusões

Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera execução da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas pagas diariamente

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs e prepara relatório semanal

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.



  5. Procedimento Passo a Passo

5.1. Setup e Ativação das Campanhas

Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.

Responsável: Especialista em Tráfego

Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.

Prazo referência: D-45 (início da fase)

5.2. Validação da Landing Page e Rastreamento

Ação: Validar landing page com checklist: velocidade (PageSpeed >80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.

Responsável: Analista de Marketing + Especialista em Tráfego

Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.

Prazo referência: D-45

5.3. Ativação de Influenciadores e Conteúdo Orgânico

Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.

Prazo referência: Conforme calendário de conteúdo

5.4. Monitoramento Diário e Otimização

Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.

Responsável: Especialista em Tráfego

Output: Log diário de otimizações na planilha de monitoramento.

Prazo referência: Diário durante os 45 dias

5.5. Relatório Semanal de Performance

Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.

Responsável: Analista de Marketing

Output: Relatório semanal enviado ao cliente com análise e recomendações.

Prazo referência: Toda segunda-feira

5.6. Preparação da Base para o Lançamento

Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.

Responsável: Rafa / Lucca

Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.

Prazo referência: D-7 antes do lançamento

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Rastreamento validado antes de ativar campanhas; meta de leads da fase >80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.

6.2 Erros Comuns a Evitar

Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.

  8. SLAs e Prazos

Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.

  9. Fluxograma

Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase

  10. Glossário

LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Campanha — Pré-Lançamento (45d)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.</p><p><strong>2.2 Exclusões</strong></p><p>Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera execução da fase</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas pagas diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs e prepara relatório semanal</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Setup e Ativação das Campanhas</strong></p><p>Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.</p><p>Prazo referência: D-45 (início da fase)</p><p><strong>5.2. Validação da Landing Page e Rastreamento</strong></p><p>Ação: Validar landing page com checklist: velocidade (PageSpeed &gt;80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.</p><p>Responsável: Analista de Marketing + Especialista em Tráfego</p><p>Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.</p><p>Prazo referência: D-45</p><p><strong>5.3. Ativação de Influenciadores e Conteúdo Orgânico</strong></p><p>Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.</p><p>Prazo referência: Conforme calendário de conteúdo</p><p><strong>5.4. Monitoramento Diário e Otimização</strong></p><p>Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log diário de otimizações na planilha de monitoramento.</p><p>Prazo referência: Diário durante os 45 dias</p><p><strong>5.5. Relatório Semanal de Performance</strong></p><p>Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado ao cliente com análise e recomendações.</p><p>Prazo referência: Toda segunda-feira</p><p><strong>5.6. Preparação da Base para o Lançamento</strong></p><p>Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.</p><p>Prazo referência: D-7 antes do lançamento</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Rastreamento validado antes de ativar campanhas; meta de leads da fase &gt;80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase</p><p><strong>  10. Glossário</strong></p><p>LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.', '<p>Executar a fase de pré-lançamento da campanha imobiliária nos 45 dias anteriores ao evento de lançamento, construindo base de leads qualificados, gerando expectativa e preparando todos os ativos digitais para o lançamento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.', '<p>Ativação de campanhas de captura de leads, construção de landing page, aquecimento de base, ativação de influenciadores, monitoramento de performance e otimização diária de campanhas.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).', '<p>Evento de lançamento presencial (BU Eventos), produção de criativos (BU Criação), gestão de relacionamento pós-visita (BU Comercial).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera execução da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas pagas diariamente

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs e prepara relatório semanal

Rafa / Lucca

Cliente', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera execução da fase</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas pagas diariamente</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs e prepara relatório semanal</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.', '<p>Plano de Mídias aprovado (MKT-03); criativos da fase pré-lançamento entregues e aprovados (BU Criação); landing page da campanha desenvolvida e testada; URL de rastreamento configurada; RD Station configurado com fluxo de nutrição.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Setup e Ativação das Campanhas', 'Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.

Responsável: Especialista em Tráfego

Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.

Prazo referência: D-45 (início da fase)', '<p>Ação: Configurar todas as campanhas no Meta Ads e Google Ads conforme plano de mídias: criar públicos, carregar criativos, definir objetivos de campanha (conversão/leads), configurar pixel e tags de rastreamento. Testar fluxo completo lead → CRM antes de ativar.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas ativas com rastreamento validado e leads chegando ao RD Station.</p><p>Prazo referência: D-45 (início da fase)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Validação da Landing Page e Rastreamento', 'Ação: Validar landing page com checklist: velocidade (PageSpeed >80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.

Responsável: Analista de Marketing + Especialista em Tráfego

Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.

Prazo referência: D-45', '<p>Ação: Validar landing page com checklist: velocidade (PageSpeed &gt;80), formulário funcionando, pixel disparando, GA4 registrando eventos, Hotjar gravando sessões, responsividade mobile.</p><p>Responsável: Analista de Marketing + Especialista em Tráfego</p><p>Output: Checklist de validação 100% aprovado. Hotjar e GA4 confirmados.</p><p>Prazo referência: D-45</p>', 7, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Ativação de Influenciadores e Conteúdo Orgânico', 'Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.

Prazo referência: Conforme calendário de conteúdo', '<p>Ação: Coordenar publicações dos influenciadores contratados conforme calendário. Publicar conteúdo orgânico nas redes do empreendimento e do cliente (teasers, countdown, bastidores). Monitorar engajamento e responder comentários.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Publicações realizadas conforme calendário com registro de métricas de engajamento.</p><p>Prazo referência: Conforme calendário de conteúdo</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Monitoramento Diário e Otimização', 'Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.

Responsável: Especialista em Tráfego

Output: Log diário de otimizações na planilha de monitoramento.

Prazo referência: Diário durante os 45 dias', '<p>Ação: Revisar diariamente: custo por lead, volume de leads, CTR, frequência de anúncios, qualidade dos leads (taxa de resposta no CRM). Realizar otimizações: pausar criativos com baixo desempenho, ajustar lances, testar novos públicos.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log diário de otimizações na planilha de monitoramento.</p><p>Prazo referência: Diário durante os 45 dias</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Semanal de Performance', 'Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.

Responsável: Analista de Marketing

Output: Relatório semanal enviado ao cliente com análise e recomendações.

Prazo referência: Toda segunda-feira', '<p>Ação: Compilar relatório semanal com evolução dos KPIs: leads acumulados vs. meta, CPL por canal, distribuição por público, principais criativos, aprendizados e próximos ajustes. Enviar ao cliente toda segunda-feira.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório semanal enviado ao cliente com análise e recomendações.</p><p>Prazo referência: Toda segunda-feira</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Preparação da Base para o Lançamento', 'Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.

Responsável: Rafa / Lucca

Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.

Prazo referência: D-7 antes do lançamento', '<p>Ação: Nos 7 dias anteriores ao lançamento: intensificar campanhas, enviar e-mail de convite ao evento para toda a base, ativar fluxo de nutrição intensivo no RD Station, preparar relatório de status da base para o time comercial.</p><p>Responsável: Rafa / Lucca</p><p>Output: Relatório de base de leads para BU Comercial: volume, segmentação por temperatura, histórico de interações.</p><p>Prazo referência: D-7 antes do lançamento</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Rastreamento validado antes de ativar campanhas; meta de leads da fase >80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.', '<p>Rastreamento validado antes de ativar campanhas; meta de leads da fase &gt;80% atingida ao fim dos 45 dias; relatórios semanais enviados sem atraso; log de otimizações completo; base entregue ao comercial com segmentação de temperatura.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.', '<p>Campanhas ativadas sem validar rastreamento; otimizações apenas semanais (devem ser diárias); relatório semanal sem recomendações práticas; base entregue ao comercial sem segmentação por temperatura de interesse.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Google Tag Manager, Hotjar, planilha de monitoramento TBO, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.', '<p>Setup: D-45 (dia 1 da fase); primeiros leads em 48h após ativação; relatório semanal toda segunda-feira; entrega de base ao comercial: D-7 do lançamento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase', '<p>Início → Setup campanhas + LP → Validação rastreamento → Ativação campanhas → Conteúdo orgânico e influenciadores → Monitoramento diário → Relatório semanal → Intensificação (D-7) → Entrega base ao comercial → Fim da fase</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.', '<p>LP: Landing Page. CRM: Customer Relationship Management (RD Station). Pixel: código de rastreamento do Meta. Temperatura de lead: classificação por nível de interesse (quente, morno, frio). Frequência: média de vezes que o mesmo usuário viu o anúncio.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-005: Gestão de Campanha Lançamento 120d ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Campanha Lançamento 120d',
    'tbo-mkt-005-gestao-de-campanha-lancamento-120d',
    'marketing',
    'checklist',
    'Gestão de Campanha — Lançamento (120d)',
    'Standard Operating Procedure

Gestão de Campanha — Lançamento (120d)

Código

TBO-MKT-005

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

Executar a fase de lançamento da campanha imobiliária nos 120 dias após o evento de lançamento, maximizando a conversão de leads em visitas e propostas, mantendo volume de leads qualificados e ajustando estratégia conforme velocidade de vendas.

  2. Escopo

2.1 O que está coberto

Operação intensiva de mídia paga, nutrição da base de leads, produção de conteúdo de prova social, ajuste de segmentações conforme perfil de compradores, interface diária com time comercial.

2.2 Exclusões

Gestão do processo de vendas (BU Comercial), produção de criativos sob demanda (BU Criação), eventos presenciais de vendas (BU Eventos).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia e otimização da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações diárias

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs, relatório quinzenal e nutrição

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Base de leads da fase pré-lançamento; dados do evento de lançamento (leads gerados, vendas realizadas, perfil dos compradores); criativos pós-lançamento aprovados; budget da fase confirmado.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha.



  5. Procedimento Passo a Passo

5.1. Reconfiguração de Campanhas Pós-Lançamento

Ação: Atualizar campanhas com criativos do lançamento (fotos do evento, depoimentos, unidades disponíveis). Reampliar alcance para públicos frios. Criar campanha de remarketing para leads que não compraram. Ajustar budget conforme performance do evento.

Responsável: Especialista em Tráfego

Output: Campanhas atualizadas ativas com novos criativos e segmentações revisadas.

Prazo referência: D+1 a D+3 após evento

5.2. Revisão Quinzenal de Estratégia com Comercial

Ação: Realizar reunião quinzenal com BU Comercial para: alinhamento de volume e qualidade de leads, feedbacks sobre perfil de compradores, ajuste de segmentações, revisão de scripts de abordagem de leads do marketing.

Responsável: Rafa / Lucca + BU Comercial

Output: Ata de reunião com ajustes acordados e implementados nas campanhas.

Prazo referência: A cada 15 dias

5.3. Nutrição da Base e E-mail Marketing

Ação: Operar fluxos de nutrição no RD Station: envio de conteúdos de valor (tour virtual, plant tour, vídeo do empreendimento), cases de clientes, urgência de unidades disponíveis. Monitorar taxa de abertura, cliques e conversões.

Responsável: Analista de Marketing

Output: Fluxos de nutrição ativos com relatório mensal de performance de e-mail.

Prazo referência: Contínuo durante 120 dias

5.4. Produção e Ativação de Prova Social

Ação: Coordenar produção de depoimentos de primeiros compradores, vídeos de visita à obra, posts de reconhecimento de clientes. Usar como criativos em campanhas pagas e orgânico para reduzir objeções.

Responsável: Rafa / Lucca + BU Criação

Output: Peças de prova social publicadas e ativadas como criativos em campanhas.

Prazo referência: A partir de D+30

5.5. Otimização Contínua de Campanhas

Ação: Manter rotina diária de otimização: pausar anúncios com frequência >3 ou CTR abaixo do benchmark, testar novos criativos a cada 3 semanas, ajustar segmentações conforme perfil dos compradores efetivos, redistribuir budget para canais com menor CPL.

Responsável: Especialista em Tráfego

Output: Log de otimizações atualizado diariamente. Benchmark de CPL por canal atualizado semanalmente.

Prazo referência: Diário

5.6. Relatório Quinzenal e Gestão de Performance

Ação: Elaborar relatório quinzenal com: leads gerados vs. meta, CPL por canal, funil de conversão (lead→visita→proposta→venda), velocidade de vendas, estoque restante, projeção de encerramento da fase.

Responsável: Analista de Marketing

Output: Relatório quinzenal enviado ao cliente com análise e recomendações de ajuste.

Prazo referência: A cada 15 dias

5.7. Avaliação de Transição para Sustentação

Ação: Ao atingir 75% das unidades vendidas ou ao fim dos 120 dias, avaliar com cliente e BU Comercial a necessidade de transição para fase de sustentação. Documentar aprendizados e KPIs finais da fase.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Decisão documentada sobre transição + relatório de encerramento da fase de lançamento.

Prazo referência: D+110 a D+120

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Campanhas atualizadas em 72h após evento de lançamento; reuniões quinzenais com comercial realizadas e documentadas; fluxos de nutrição ativos durante toda a fase; relatórios quinzenais sem atraso; log de otimizações diário completo.

6.2 Erros Comuns a Evitar

Manter os mesmos criativos do pré-lançamento sem atualização; ausência de integração com comercial; nutrição pausada após evento; relatório apenas com dados sem análise e recomendações.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha TBO.

  8. SLAs e Prazos

Atualização de campanhas pós-evento: D+3; reuniões com comercial: quinzenais; relatório quinzenal: até 2 dias após fechamento da quinzena; avaliação de transição: D+110.

  9. Fluxograma

Início → Reconfiguração pós-evento → Ativação campanhas de lançamento → Nutrição base → Reunião quinzenal comercial → Otimização diária → Prova social → Relatório quinzenal → Avaliação transição → Fim da fase

  10. Glossário

Prova social: depoimentos e evidências de compras realizadas. Remarketing: campanhas direcionadas a usuários que já interagiram. Velocidade de vendas: número de unidades vendidas por período. Funil de conversão: proporção de leads que avançam em cada etapa.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Campanha — Lançamento (120d)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-005</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Executar a fase de lançamento da campanha imobiliária nos 120 dias após o evento de lançamento, maximizando a conversão de leads em visitas e propostas, mantendo volume de leads qualificados e ajustando estratégia conforme velocidade de vendas.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Operação intensiva de mídia paga, nutrição da base de leads, produção de conteúdo de prova social, ajuste de segmentações conforme perfil de compradores, interface diária com time comercial.</p><p><strong>2.2 Exclusões</strong></p><p>Gestão do processo de vendas (BU Comercial), produção de criativos sob demanda (BU Criação), eventos presenciais de vendas (BU Eventos).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera estratégia e otimização da fase</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas e otimizações diárias</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs, relatório quinzenal e nutrição</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Base de leads da fase pré-lançamento; dados do evento de lançamento (leads gerados, vendas realizadas, perfil dos compradores); criativos pós-lançamento aprovados; budget da fase confirmado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Reconfiguração de Campanhas Pós-Lançamento</strong></p><p>Ação: Atualizar campanhas com criativos do lançamento (fotos do evento, depoimentos, unidades disponíveis). Reampliar alcance para públicos frios. Criar campanha de remarketing para leads que não compraram. Ajustar budget conforme performance do evento.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas atualizadas ativas com novos criativos e segmentações revisadas.</p><p>Prazo referência: D+1 a D+3 após evento</p><p><strong>5.2. Revisão Quinzenal de Estratégia com Comercial</strong></p><p>Ação: Realizar reunião quinzenal com BU Comercial para: alinhamento de volume e qualidade de leads, feedbacks sobre perfil de compradores, ajuste de segmentações, revisão de scripts de abordagem de leads do marketing.</p><p>Responsável: Rafa / Lucca + BU Comercial</p><p>Output: Ata de reunião com ajustes acordados e implementados nas campanhas.</p><p>Prazo referência: A cada 15 dias</p><p><strong>5.3. Nutrição da Base e E-mail Marketing</strong></p><p>Ação: Operar fluxos de nutrição no RD Station: envio de conteúdos de valor (tour virtual, plant tour, vídeo do empreendimento), cases de clientes, urgência de unidades disponíveis. Monitorar taxa de abertura, cliques e conversões.</p><p>Responsável: Analista de Marketing</p><p>Output: Fluxos de nutrição ativos com relatório mensal de performance de e-mail.</p><p>Prazo referência: Contínuo durante 120 dias</p><p><strong>5.4. Produção e Ativação de Prova Social</strong></p><p>Ação: Coordenar produção de depoimentos de primeiros compradores, vídeos de visita à obra, posts de reconhecimento de clientes. Usar como criativos em campanhas pagas e orgânico para reduzir objeções.</p><p>Responsável: Rafa / Lucca + BU Criação</p><p>Output: Peças de prova social publicadas e ativadas como criativos em campanhas.</p><p>Prazo referência: A partir de D+30</p><p><strong>5.5. Otimização Contínua de Campanhas</strong></p><p>Ação: Manter rotina diária de otimização: pausar anúncios com frequência &gt;3 ou CTR abaixo do benchmark, testar novos criativos a cada 3 semanas, ajustar segmentações conforme perfil dos compradores efetivos, redistribuir budget para canais com menor CPL.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log de otimizações atualizado diariamente. Benchmark de CPL por canal atualizado semanalmente.</p><p>Prazo referência: Diário</p><p><strong>5.6. Relatório Quinzenal e Gestão de Performance</strong></p><p>Ação: Elaborar relatório quinzenal com: leads gerados vs. meta, CPL por canal, funil de conversão (lead→visita→proposta→venda), velocidade de vendas, estoque restante, projeção de encerramento da fase.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório quinzenal enviado ao cliente com análise e recomendações de ajuste.</p><p>Prazo referência: A cada 15 dias</p><p><strong>5.7. Avaliação de Transição para Sustentação</strong></p><p>Ação: Ao atingir 75% das unidades vendidas ou ao fim dos 120 dias, avaliar com cliente e BU Comercial a necessidade de transição para fase de sustentação. Documentar aprendizados e KPIs finais da fase.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Decisão documentada sobre transição + relatório de encerramento da fase de lançamento.</p><p>Prazo referência: D+110 a D+120</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Campanhas atualizadas em 72h após evento de lançamento; reuniões quinzenais com comercial realizadas e documentadas; fluxos de nutrição ativos durante toda a fase; relatórios quinzenais sem atraso; log de otimizações diário completo.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Manter os mesmos criativos do pré-lançamento sem atualização; ausência de integração com comercial; nutrição pausada após evento; relatório apenas com dados sem análise e recomendações.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha TBO.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Atualização de campanhas pós-evento: D+3; reuniões com comercial: quinzenais; relatório quinzenal: até 2 dias após fechamento da quinzena; avaliação de transição: D+110.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Reconfiguração pós-evento → Ativação campanhas de lançamento → Nutrição base → Reunião quinzenal comercial → Otimização diária → Prova social → Relatório quinzenal → Avaliação transição → Fim da fase</p><p><strong>  10. Glossário</strong></p><p>Prova social: depoimentos e evidências de compras realizadas. Remarketing: campanhas direcionadas a usuários que já interagiram. Velocidade de vendas: número de unidades vendidas por período. Funil de conversão: proporção de leads que avançam em cada etapa.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-005
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Executar a fase de lançamento da campanha imobiliária nos 120 dias após o evento de lançamento, maximizando a conversão de leads em visitas e propostas, mantendo volume de leads qualificados e ajustando estratégia conforme velocidade de vendas.', '<p>Executar a fase de lançamento da campanha imobiliária nos 120 dias após o evento de lançamento, maximizando a conversão de leads em visitas e propostas, mantendo volume de leads qualificados e ajustando estratégia conforme velocidade de vendas.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Operação intensiva de mídia paga, nutrição da base de leads, produção de conteúdo de prova social, ajuste de segmentações conforme perfil de compradores, interface diária com time comercial.', '<p>Operação intensiva de mídia paga, nutrição da base de leads, produção de conteúdo de prova social, ajuste de segmentações conforme perfil de compradores, interface diária com time comercial.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Gestão do processo de vendas (BU Comercial), produção de criativos sob demanda (BU Criação), eventos presenciais de vendas (BU Eventos).', '<p>Gestão do processo de vendas (BU Comercial), produção de criativos sob demanda (BU Criação), eventos presenciais de vendas (BU Eventos).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia e otimização da fase

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações diárias

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora KPIs, relatório quinzenal e nutrição

Rafa / Lucca

Cliente', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera estratégia e otimização da fase</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas e otimizações diárias</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora KPIs, relatório quinzenal e nutrição</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Base de leads da fase pré-lançamento; dados do evento de lançamento (leads gerados, vendas realizadas, perfil dos compradores); criativos pós-lançamento aprovados; budget da fase confirmado.', '<p>Base de leads da fase pré-lançamento; dados do evento de lançamento (leads gerados, vendas realizadas, perfil dos compradores); criativos pós-lançamento aprovados; budget da fase confirmado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Reconfiguração de Campanhas Pós-Lançamento', 'Ação: Atualizar campanhas com criativos do lançamento (fotos do evento, depoimentos, unidades disponíveis). Reampliar alcance para públicos frios. Criar campanha de remarketing para leads que não compraram. Ajustar budget conforme performance do evento.

Responsável: Especialista em Tráfego

Output: Campanhas atualizadas ativas com novos criativos e segmentações revisadas.

Prazo referência: D+1 a D+3 após evento', '<p>Ação: Atualizar campanhas com criativos do lançamento (fotos do evento, depoimentos, unidades disponíveis). Reampliar alcance para públicos frios. Criar campanha de remarketing para leads que não compraram. Ajustar budget conforme performance do evento.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas atualizadas ativas com novos criativos e segmentações revisadas.</p><p>Prazo referência: D+1 a D+3 após evento</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Revisão Quinzenal de Estratégia com Comercial', 'Ação: Realizar reunião quinzenal com BU Comercial para: alinhamento de volume e qualidade de leads, feedbacks sobre perfil de compradores, ajuste de segmentações, revisão de scripts de abordagem de leads do marketing.

Responsável: Rafa / Lucca + BU Comercial

Output: Ata de reunião com ajustes acordados e implementados nas campanhas.

Prazo referência: A cada 15 dias', '<p>Ação: Realizar reunião quinzenal com BU Comercial para: alinhamento de volume e qualidade de leads, feedbacks sobre perfil de compradores, ajuste de segmentações, revisão de scripts de abordagem de leads do marketing.</p><p>Responsável: Rafa / Lucca + BU Comercial</p><p>Output: Ata de reunião com ajustes acordados e implementados nas campanhas.</p><p>Prazo referência: A cada 15 dias</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Nutrição da Base e E-mail Marketing', 'Ação: Operar fluxos de nutrição no RD Station: envio de conteúdos de valor (tour virtual, plant tour, vídeo do empreendimento), cases de clientes, urgência de unidades disponíveis. Monitorar taxa de abertura, cliques e conversões.

Responsável: Analista de Marketing

Output: Fluxos de nutrição ativos com relatório mensal de performance de e-mail.

Prazo referência: Contínuo durante 120 dias', '<p>Ação: Operar fluxos de nutrição no RD Station: envio de conteúdos de valor (tour virtual, plant tour, vídeo do empreendimento), cases de clientes, urgência de unidades disponíveis. Monitorar taxa de abertura, cliques e conversões.</p><p>Responsável: Analista de Marketing</p><p>Output: Fluxos de nutrição ativos com relatório mensal de performance de e-mail.</p><p>Prazo referência: Contínuo durante 120 dias</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Produção e Ativação de Prova Social', 'Ação: Coordenar produção de depoimentos de primeiros compradores, vídeos de visita à obra, posts de reconhecimento de clientes. Usar como criativos em campanhas pagas e orgânico para reduzir objeções.

Responsável: Rafa / Lucca + BU Criação

Output: Peças de prova social publicadas e ativadas como criativos em campanhas.

Prazo referência: A partir de D+30', '<p>Ação: Coordenar produção de depoimentos de primeiros compradores, vídeos de visita à obra, posts de reconhecimento de clientes. Usar como criativos em campanhas pagas e orgânico para reduzir objeções.</p><p>Responsável: Rafa / Lucca + BU Criação</p><p>Output: Peças de prova social publicadas e ativadas como criativos em campanhas.</p><p>Prazo referência: A partir de D+30</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Otimização Contínua de Campanhas', 'Ação: Manter rotina diária de otimização: pausar anúncios com frequência >3 ou CTR abaixo do benchmark, testar novos criativos a cada 3 semanas, ajustar segmentações conforme perfil dos compradores efetivos, redistribuir budget para canais com menor CPL.

Responsável: Especialista em Tráfego

Output: Log de otimizações atualizado diariamente. Benchmark de CPL por canal atualizado semanalmente.

Prazo referência: Diário', '<p>Ação: Manter rotina diária de otimização: pausar anúncios com frequência &gt;3 ou CTR abaixo do benchmark, testar novos criativos a cada 3 semanas, ajustar segmentações conforme perfil dos compradores efetivos, redistribuir budget para canais com menor CPL.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Log de otimizações atualizado diariamente. Benchmark de CPL por canal atualizado semanalmente.</p><p>Prazo referência: Diário</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório Quinzenal e Gestão de Performance', 'Ação: Elaborar relatório quinzenal com: leads gerados vs. meta, CPL por canal, funil de conversão (lead→visita→proposta→venda), velocidade de vendas, estoque restante, projeção de encerramento da fase.

Responsável: Analista de Marketing

Output: Relatório quinzenal enviado ao cliente com análise e recomendações de ajuste.

Prazo referência: A cada 15 dias', '<p>Ação: Elaborar relatório quinzenal com: leads gerados vs. meta, CPL por canal, funil de conversão (lead→visita→proposta→venda), velocidade de vendas, estoque restante, projeção de encerramento da fase.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório quinzenal enviado ao cliente com análise e recomendações de ajuste.</p><p>Prazo referência: A cada 15 dias</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.7. Avaliação de Transição para Sustentação', 'Ação: Ao atingir 75% das unidades vendidas ou ao fim dos 120 dias, avaliar com cliente e BU Comercial a necessidade de transição para fase de sustentação. Documentar aprendizados e KPIs finais da fase.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Decisão documentada sobre transição + relatório de encerramento da fase de lançamento.

Prazo referência: D+110 a D+120', '<p>Ação: Ao atingir 75% das unidades vendidas ou ao fim dos 120 dias, avaliar com cliente e BU Comercial a necessidade de transição para fase de sustentação. Documentar aprendizados e KPIs finais da fase.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Decisão documentada sobre transição + relatório de encerramento da fase de lançamento.</p><p>Prazo referência: D+110 a D+120</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Campanhas atualizadas em 72h após evento de lançamento; reuniões quinzenais com comercial realizadas e documentadas; fluxos de nutrição ativos durante toda a fase; relatórios quinzenais sem atraso; log de otimizações diário completo.', '<p>Campanhas atualizadas em 72h após evento de lançamento; reuniões quinzenais com comercial realizadas e documentadas; fluxos de nutrição ativos durante toda a fase; relatórios quinzenais sem atraso; log de otimizações diário completo.</p>', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manter os mesmos criativos do pré-lançamento sem atualização; ausência de integração com comercial; nutrição pausada após evento; relatório apenas com dados sem análise e recomendações.', '<p>Manter os mesmos criativos do pré-lançamento sem atualização; ausência de integração com comercial; nutrição pausada após evento; relatório apenas com dados sem análise e recomendações.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha TBO.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, Hotjar, planilha de performance TBO, dashboard de campanha TBO.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Atualização de campanhas pós-evento: D+3; reuniões com comercial: quinzenais; relatório quinzenal: até 2 dias após fechamento da quinzena; avaliação de transição: D+110.', '<p>Atualização de campanhas pós-evento: D+3; reuniões com comercial: quinzenais; relatório quinzenal: até 2 dias após fechamento da quinzena; avaliação de transição: D+110.</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Reconfiguração pós-evento → Ativação campanhas de lançamento → Nutrição base → Reunião quinzenal comercial → Otimização diária → Prova social → Relatório quinzenal → Avaliação transição → Fim da fase', '<p>Início → Reconfiguração pós-evento → Ativação campanhas de lançamento → Nutrição base → Reunião quinzenal comercial → Otimização diária → Prova social → Relatório quinzenal → Avaliação transição → Fim da fase</p>', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Prova social: depoimentos e evidências de compras realizadas. Remarketing: campanhas direcionadas a usuários que já interagiram. Velocidade de vendas: número de unidades vendidas por período. Funil de conversão: proporção de leads que avançam em cada etapa.', '<p>Prova social: depoimentos e evidências de compras realizadas. Remarketing: campanhas direcionadas a usuários que já interagiram. Velocidade de vendas: número de unidades vendidas por período. Funil de conversão: proporção de leads que avançam em cada etapa.</p>', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 19, 'step');

  -- ── TBO-MKT-006: Gestão de Campanha Sustentação 120d ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Campanha Sustentação 120d',
    'tbo-mkt-006-gestao-de-campanha-sustentacao-120d',
    'marketing',
    'checklist',
    'Gestão de Campanha — Sustentação (120d)',
    'Standard Operating Procedure

Gestão de Campanha — Sustentação (120d)

Código

TBO-MKT-006

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

Manter a performance de vendas do empreendimento na fase de sustentação, gerenciando a comunicação de estoque restante, reativando leads frios e maximizando a conversão das últimas unidades disponíveis.

  2. Escopo

2.1 O que está coberto

Operação de campanhas de estoque final, reativação de base de leads, comunicação de urgência e escassez, ajuste de mix de mídia para maior eficiência de custo, relatórios de encerramento.

2.2 Exclusões

Estratégia de precificação das últimas unidades (Incorporadora/Comercial), negociações com compradores (BU Comercial).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia de sustentação

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora leads, reativação e relatórios

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Relatório de encerramento da fase de lançamento; estoque atualizado de unidades disponíveis; budget da fase de sustentação confirmado; lista de leads não convertidos da base.

4.2 Ferramentas e Acessos

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades.



  5. Procedimento Passo a Passo

5.1. Reconfiguração de Campanhas para Sustentação

Ação: Reduzir volume total de campanhas e focar em canais com menor CPL histórico. Criar campanha específica de estoque final com comunicação de urgência e escassez (unidades disponíveis, planta, preço). Pausar campanhas de awareness puro.

Responsável: Especialista em Tráfego

Output: Campanhas de sustentação ativas com novo posicionamento de estoque.

Prazo referência: D+1 a D+5 após início da fase

5.2. Campanha de Reativação da Base de Leads

Ação: Segmentar toda a base de leads não convertidos no RD Station por temperatura e motivo de não compra. Criar fluxo de reativação com nova oferta (condições especiais, unidades premium disponíveis, nova visita). Ativar e-mail + WhatsApp (se disponível).

Responsável: Analista de Marketing

Output: Fluxo de reativação ativo com meta de recuperação de 10-15% da base.

Prazo referência: D+7

5.3. Comunicação de Escassez e Urgência

Ação: Atualizar criativos semanalmente com informações de estoque real (ex.: ''últimas 8 unidades'', ''tipo X esgotado''). Criar senso de urgência genuíno baseado em dados reais. Coordenar com BU Criação para peças atualizadas.

Responsável: Rafa / Lucca

Output: Criativos de urgência atualizados semanalmente alinhados com estoque real.

Prazo referência: Semanal

5.4. Otimização de Budget para Eficiência

Ação: Revisar distribuição de budget quinzenalmente. Concentrar recursos em canais com melhor CPL histórico do empreendimento. Testar canais alternativos de menor custo (ex.: portais imobiliários orgânico, SEO local). Reduzir gradualmente o volume conforme estoque diminui.

Responsável: Especialista em Tráfego

Output: Budget redistribuído com foco em eficiência de custo. CPL da fase controlado.

Prazo referência: A cada 15 dias

5.5. Relatório Mensal de Sustentação

Ação: Elaborar relatório mensal com: unidades vendidas no período, estoque restante, leads gerados, CPL, taxa de reativação de leads antigos, projeção de encerramento total de vendas.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente com projeção de encerramento.

Prazo referência: Mensal

5.6. Encerramento da Campanha

Ação: Ao vender última unidade ou ao fim dos 120 dias: pausar todas as campanhas, exportar dados completos de performance, elaborar relatório final de campanha (do início ao fim), documentar aprendizados para próximos produtos.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final completo do ciclo da campanha. Aprendizados documentados no Notion.

Prazo referência: Em até 7 dias após última unidade vendida ou D+120

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Campanhas reconfiguradas dentro de 5 dias do início da fase; fluxo de reativação ativo; criativos de urgência com dados reais (não fictícios); budget reduzido proporcionalmente ao estoque restante; relatório final entregue ao cliente.

6.2 Erros Comuns a Evitar

Manter volume de campanhas igual ao lançamento sem ajuste de eficiência; comunicar urgência sem embasamento em estoque real; não reativar base de leads não convertidos; encerrar campanha sem relatório final documentado.

  7. Ferramentas e Templates

Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades, Notion (documentação de aprendizados).

  8. SLAs e Prazos

Reconfiguração: D+5; fluxo de reativação: D+7; relatório mensal: até dia 5 do mês seguinte; relatório final: 7 dias após encerramento.

  9. Fluxograma

Início → Reconfiguração campanhas sustentação → Reativação base de leads → Comunicação de escassez → Otimização budget → Relatório mensal → Revisão quinzenal com comercial → Encerramento e relatório final → Fim

  10. Glossário

Estoque: unidades disponíveis para venda. Reativação: ações para reengajar leads que não responderam anteriormente. Escassez: comunicação baseada em disponibilidade limitada real. CPL: Custo por Lead.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Campanha — Sustentação (120d)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Manter a performance de vendas do empreendimento na fase de sustentação, gerenciando a comunicação de estoque restante, reativando leads frios e maximizando a conversão das últimas unidades disponíveis.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Operação de campanhas de estoque final, reativação de base de leads, comunicação de urgência e escassez, ajuste de mix de mídia para maior eficiência de custo, relatórios de encerramento.</p><p><strong>2.2 Exclusões</strong></p><p>Estratégia de precificação das últimas unidades (Incorporadora/Comercial), negociações com compradores (BU Comercial).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera estratégia de sustentação</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas e otimizações</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora leads, reativação e relatórios</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Relatório de encerramento da fase de lançamento; estoque atualizado de unidades disponíveis; budget da fase de sustentação confirmado; lista de leads não convertidos da base.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Reconfiguração de Campanhas para Sustentação</strong></p><p>Ação: Reduzir volume total de campanhas e focar em canais com menor CPL histórico. Criar campanha específica de estoque final com comunicação de urgência e escassez (unidades disponíveis, planta, preço). Pausar campanhas de awareness puro.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas de sustentação ativas com novo posicionamento de estoque.</p><p>Prazo referência: D+1 a D+5 após início da fase</p><p><strong>5.2. Campanha de Reativação da Base de Leads</strong></p><p>Ação: Segmentar toda a base de leads não convertidos no RD Station por temperatura e motivo de não compra. Criar fluxo de reativação com nova oferta (condições especiais, unidades premium disponíveis, nova visita). Ativar e-mail + WhatsApp (se disponível).</p><p>Responsável: Analista de Marketing</p><p>Output: Fluxo de reativação ativo com meta de recuperação de 10-15% da base.</p><p>Prazo referência: D+7</p><p><strong>5.3. Comunicação de Escassez e Urgência</strong></p><p>Ação: Atualizar criativos semanalmente com informações de estoque real (ex.: ''últimas 8 unidades'', ''tipo X esgotado''). Criar senso de urgência genuíno baseado em dados reais. Coordenar com BU Criação para peças atualizadas.</p><p>Responsável: Rafa / Lucca</p><p>Output: Criativos de urgência atualizados semanalmente alinhados com estoque real.</p><p>Prazo referência: Semanal</p><p><strong>5.4. Otimização de Budget para Eficiência</strong></p><p>Ação: Revisar distribuição de budget quinzenalmente. Concentrar recursos em canais com melhor CPL histórico do empreendimento. Testar canais alternativos de menor custo (ex.: portais imobiliários orgânico, SEO local). Reduzir gradualmente o volume conforme estoque diminui.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Budget redistribuído com foco em eficiência de custo. CPL da fase controlado.</p><p>Prazo referência: A cada 15 dias</p><p><strong>5.5. Relatório Mensal de Sustentação</strong></p><p>Ação: Elaborar relatório mensal com: unidades vendidas no período, estoque restante, leads gerados, CPL, taxa de reativação de leads antigos, projeção de encerramento total de vendas.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal enviado ao cliente com projeção de encerramento.</p><p>Prazo referência: Mensal</p><p><strong>5.6. Encerramento da Campanha</strong></p><p>Ação: Ao vender última unidade ou ao fim dos 120 dias: pausar todas as campanhas, exportar dados completos de performance, elaborar relatório final de campanha (do início ao fim), documentar aprendizados para próximos produtos.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Relatório final completo do ciclo da campanha. Aprendizados documentados no Notion.</p><p>Prazo referência: Em até 7 dias após última unidade vendida ou D+120</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Campanhas reconfiguradas dentro de 5 dias do início da fase; fluxo de reativação ativo; criativos de urgência com dados reais (não fictícios); budget reduzido proporcionalmente ao estoque restante; relatório final entregue ao cliente.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Manter volume de campanhas igual ao lançamento sem ajuste de eficiência; comunicar urgência sem embasamento em estoque real; não reativar base de leads não convertidos; encerrar campanha sem relatório final documentado.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades, Notion (documentação de aprendizados).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Reconfiguração: D+5; fluxo de reativação: D+7; relatório mensal: até dia 5 do mês seguinte; relatório final: 7 dias após encerramento.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Reconfiguração campanhas sustentação → Reativação base de leads → Comunicação de escassez → Otimização budget → Relatório mensal → Revisão quinzenal com comercial → Encerramento e relatório final → Fim</p><p><strong>  10. Glossário</strong></p><p>Estoque: unidades disponíveis para venda. Reativação: ações para reengajar leads que não responderam anteriormente. Escassez: comunicação baseada em disponibilidade limitada real. CPL: Custo por Lead.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter a performance de vendas do empreendimento na fase de sustentação, gerenciando a comunicação de estoque restante, reativando leads frios e maximizando a conversão das últimas unidades disponíveis.', '<p>Manter a performance de vendas do empreendimento na fase de sustentação, gerenciando a comunicação de estoque restante, reativando leads frios e maximizando a conversão das últimas unidades disponíveis.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Operação de campanhas de estoque final, reativação de base de leads, comunicação de urgência e escassez, ajuste de mix de mídia para maior eficiência de custo, relatórios de encerramento.', '<p>Operação de campanhas de estoque final, reativação de base de leads, comunicação de urgência e escassez, ajuste de mix de mídia para maior eficiência de custo, relatórios de encerramento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Estratégia de precificação das últimas unidades (Incorporadora/Comercial), negociações com compradores (BU Comercial).', '<p>Estratégia de precificação das últimas unidades (Incorporadora/Comercial), negociações com compradores (BU Comercial).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera estratégia de sustentação

Marco Andolfato

Cliente, BU Comercial

Especialista em Tráfego

Opera campanhas e otimizações

Rafa / Lucca

Analista de Marketing

Analista de Marketing

Monitora leads, reativação e relatórios

Rafa / Lucca

Cliente', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera estratégia de sustentação</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Comercial</p></td></tr><tr><td><p>Especialista em Tráfego</p></td><td><p>Opera campanhas e otimizações</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora leads, reativação e relatórios</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Relatório de encerramento da fase de lançamento; estoque atualizado de unidades disponíveis; budget da fase de sustentação confirmado; lista de leads não convertidos da base.', '<p>Relatório de encerramento da fase de lançamento; estoque atualizado de unidades disponíveis; budget da fase de sustentação confirmado; lista de leads não convertidos da base.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades.', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Reconfiguração de Campanhas para Sustentação', 'Ação: Reduzir volume total de campanhas e focar em canais com menor CPL histórico. Criar campanha específica de estoque final com comunicação de urgência e escassez (unidades disponíveis, planta, preço). Pausar campanhas de awareness puro.

Responsável: Especialista em Tráfego

Output: Campanhas de sustentação ativas com novo posicionamento de estoque.

Prazo referência: D+1 a D+5 após início da fase', '<p>Ação: Reduzir volume total de campanhas e focar em canais com menor CPL histórico. Criar campanha específica de estoque final com comunicação de urgência e escassez (unidades disponíveis, planta, preço). Pausar campanhas de awareness puro.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Campanhas de sustentação ativas com novo posicionamento de estoque.</p><p>Prazo referência: D+1 a D+5 após início da fase</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Campanha de Reativação da Base de Leads', 'Ação: Segmentar toda a base de leads não convertidos no RD Station por temperatura e motivo de não compra. Criar fluxo de reativação com nova oferta (condições especiais, unidades premium disponíveis, nova visita). Ativar e-mail + WhatsApp (se disponível).

Responsável: Analista de Marketing

Output: Fluxo de reativação ativo com meta de recuperação de 10-15% da base.

Prazo referência: D+7', '<p>Ação: Segmentar toda a base de leads não convertidos no RD Station por temperatura e motivo de não compra. Criar fluxo de reativação com nova oferta (condições especiais, unidades premium disponíveis, nova visita). Ativar e-mail + WhatsApp (se disponível).</p><p>Responsável: Analista de Marketing</p><p>Output: Fluxo de reativação ativo com meta de recuperação de 10-15% da base.</p><p>Prazo referência: D+7</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Comunicação de Escassez e Urgência', 'Ação: Atualizar criativos semanalmente com informações de estoque real (ex.: ''últimas 8 unidades'', ''tipo X esgotado''). Criar senso de urgência genuíno baseado em dados reais. Coordenar com BU Criação para peças atualizadas.

Responsável: Rafa / Lucca

Output: Criativos de urgência atualizados semanalmente alinhados com estoque real.

Prazo referência: Semanal', '<p>Ação: Atualizar criativos semanalmente com informações de estoque real (ex.: ''últimas 8 unidades'', ''tipo X esgotado''). Criar senso de urgência genuíno baseado em dados reais. Coordenar com BU Criação para peças atualizadas.</p><p>Responsável: Rafa / Lucca</p><p>Output: Criativos de urgência atualizados semanalmente alinhados com estoque real.</p><p>Prazo referência: Semanal</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Otimização de Budget para Eficiência', 'Ação: Revisar distribuição de budget quinzenalmente. Concentrar recursos em canais com melhor CPL histórico do empreendimento. Testar canais alternativos de menor custo (ex.: portais imobiliários orgânico, SEO local). Reduzir gradualmente o volume conforme estoque diminui.

Responsável: Especialista em Tráfego

Output: Budget redistribuído com foco em eficiência de custo. CPL da fase controlado.

Prazo referência: A cada 15 dias', '<p>Ação: Revisar distribuição de budget quinzenalmente. Concentrar recursos em canais com melhor CPL histórico do empreendimento. Testar canais alternativos de menor custo (ex.: portais imobiliários orgânico, SEO local). Reduzir gradualmente o volume conforme estoque diminui.</p><p>Responsável: Especialista em Tráfego</p><p>Output: Budget redistribuído com foco em eficiência de custo. CPL da fase controlado.</p><p>Prazo referência: A cada 15 dias</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Relatório Mensal de Sustentação', 'Ação: Elaborar relatório mensal com: unidades vendidas no período, estoque restante, leads gerados, CPL, taxa de reativação de leads antigos, projeção de encerramento total de vendas.

Responsável: Analista de Marketing

Output: Relatório mensal enviado ao cliente com projeção de encerramento.

Prazo referência: Mensal', '<p>Ação: Elaborar relatório mensal com: unidades vendidas no período, estoque restante, leads gerados, CPL, taxa de reativação de leads antigos, projeção de encerramento total de vendas.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal enviado ao cliente com projeção de encerramento.</p><p>Prazo referência: Mensal</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Encerramento da Campanha', 'Ação: Ao vender última unidade ou ao fim dos 120 dias: pausar todas as campanhas, exportar dados completos de performance, elaborar relatório final de campanha (do início ao fim), documentar aprendizados para próximos produtos.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Relatório final completo do ciclo da campanha. Aprendizados documentados no Notion.

Prazo referência: Em até 7 dias após última unidade vendida ou D+120', '<p>Ação: Ao vender última unidade ou ao fim dos 120 dias: pausar todas as campanhas, exportar dados completos de performance, elaborar relatório final de campanha (do início ao fim), documentar aprendizados para próximos produtos.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Relatório final completo do ciclo da campanha. Aprendizados documentados no Notion.</p><p>Prazo referência: Em até 7 dias após última unidade vendida ou D+120</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Campanhas reconfiguradas dentro de 5 dias do início da fase; fluxo de reativação ativo; criativos de urgência com dados reais (não fictícios); budget reduzido proporcionalmente ao estoque restante; relatório final entregue ao cliente.', '<p>Campanhas reconfiguradas dentro de 5 dias do início da fase; fluxo de reativação ativo; criativos de urgência com dados reais (não fictícios); budget reduzido proporcionalmente ao estoque restante; relatório final entregue ao cliente.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manter volume de campanhas igual ao lançamento sem ajuste de eficiência; comunicar urgência sem embasamento em estoque real; não reativar base de leads não convertidos; encerrar campanha sem relatório final documentado.', '<p>Manter volume de campanhas igual ao lançamento sem ajuste de eficiência; comunicar urgência sem embasamento em estoque real; não reativar base de leads não convertidos; encerrar campanha sem relatório final documentado.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades, Notion (documentação de aprendizados).', '<p>Meta Ads Manager, Google Ads, RD Station, Google Analytics 4, planilha de estoque de unidades, Notion (documentação de aprendizados).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Reconfiguração: D+5; fluxo de reativação: D+7; relatório mensal: até dia 5 do mês seguinte; relatório final: 7 dias após encerramento.', '<p>Reconfiguração: D+5; fluxo de reativação: D+7; relatório mensal: até dia 5 do mês seguinte; relatório final: 7 dias após encerramento.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Reconfiguração campanhas sustentação → Reativação base de leads → Comunicação de escassez → Otimização budget → Relatório mensal → Revisão quinzenal com comercial → Encerramento e relatório final → Fim', '<p>Início → Reconfiguração campanhas sustentação → Reativação base de leads → Comunicação de escassez → Otimização budget → Relatório mensal → Revisão quinzenal com comercial → Encerramento e relatório final → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Estoque: unidades disponíveis para venda. Reativação: ações para reengajar leads que não responderam anteriormente. Escassez: comunicação baseada em disponibilidade limitada real. CPL: Custo por Lead.', '<p>Estoque: unidades disponíveis para venda. Reativação: ações para reengajar leads que não responderam anteriormente. Escassez: comunicação baseada em disponibilidade limitada real. CPL: Custo por Lead.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-007: Gestão de Influenciadores ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Influenciadores',
    'tbo-mkt-007-gestao-de-influenciadores',
    'marketing',
    'checklist',
    'Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.',
    'Standard Operating Procedure

Gestão de Influenciadores

Código

TBO-MKT-007

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

Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.

  2. Escopo

2.1 O que está coberto

Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.

2.2 Exclusões

Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera seleção, negociação e gestão

Marco Andolfato

Cliente, Jurídico

Analista de Marketing

Monitora publicações, engajamento e pagamentos

Rafa / Lucca

Influenciador

Jurídico / Financeiro TBO

Valida contrato e processa pagamento

Marco Andolfato

Rafa / Lucca

  4. Pré-requisitos

4.1 Inputs necessários

Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.

4.2 Ferramentas e Acessos

Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.



  5. Procedimento Passo a Passo

5.1. Prospecção e Seleção de Influenciadores

Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: >100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.

Prazo referência: D+5 após aprovação do plano

5.2. Negociação e Contratação

Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.

Responsável: Rafa / Lucca

Output: Contratos assinados com todos os influenciadores da campanha.

Prazo referência: D+12

5.3. Briefing de Conteúdo

Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).

Responsável: Rafa / Lucca

Output: Briefing individual por influenciador aprovado pelo cliente.

Prazo referência: D+15

5.4. Aprovação de Conteúdo Antes da Publicação

Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.

Responsável: Rafa / Lucca

Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).

Prazo referência: 48h antes da publicação prevista

5.5. Monitoramento de Publicações e Performance

Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.

Responsável: Analista de Marketing

Output: Planilha de performance de influenciadores atualizada por publicação.

Prazo referência: 24-48h após cada publicação

5.6. Gestão de Pagamento e Encerramento

Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.

Responsável: Analista de Marketing + Financeiro TBO

Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.

Prazo referência: Conforme prazo contratual

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.

6.2 Erros Comuns a Evitar

Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.

  7. Ferramentas e Templates

HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.

  8. SLAs e Prazos

Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.

  9. Fluxograma

Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim

  10. Glossário

Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Influenciadores</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera seleção, negociação e gestão</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, Jurídico</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora publicações, engajamento e pagamentos</p></td><td><p>Rafa / Lucca</p></td><td><p>Influenciador</p></td></tr><tr><td><p>Jurídico / Financeiro TBO</p></td><td><p>Valida contrato e processa pagamento</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Prospecção e Seleção de Influenciadores</strong></p><p>Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: &gt;100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.</p><p>Prazo referência: D+5 após aprovação do plano</p><p><strong>5.2. Negociação e Contratação</strong></p><p>Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.</p><p>Responsável: Rafa / Lucca</p><p>Output: Contratos assinados com todos os influenciadores da campanha.</p><p>Prazo referência: D+12</p><p><strong>5.3. Briefing de Conteúdo</strong></p><p>Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing individual por influenciador aprovado pelo cliente.</p><p>Prazo referência: D+15</p><p><strong>5.4. Aprovação de Conteúdo Antes da Publicação</strong></p><p>Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.</p><p>Responsável: Rafa / Lucca</p><p>Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).</p><p>Prazo referência: 48h antes da publicação prevista</p><p><strong>5.5. Monitoramento de Publicações e Performance</strong></p><p>Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de performance de influenciadores atualizada por publicação.</p><p>Prazo referência: 24-48h após cada publicação</p><p><strong>5.6. Gestão de Pagamento e Encerramento</strong></p><p>Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.</p><p>Responsável: Analista de Marketing + Financeiro TBO</p><p>Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.</p><p>Prazo referência: Conforme prazo contratual</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim</p><p><strong>  10. Glossário</strong></p><p>Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.', '<p>Selecionar, contratar, briefar e gerenciar influenciadores digitais para amplificar o alcance das campanhas imobiliárias, gerando prova social, expectativa e credibilidade para o empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.', '<p>Prospecção e seleção de influenciadores, negociação e contrato, briefing de conteúdo, aprovação de posts, monitoramento de performance e pagamento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).', '<p>Produção de criativos institucionais (BU Criação), gestão de mídia paga com impulsionamento de posts de influenciadores (MKT-09).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Lidera seleção, negociação e gestão

Marco Andolfato

Cliente, Jurídico

Analista de Marketing

Monitora publicações, engajamento e pagamentos

Rafa / Lucca

Influenciador

Jurídico / Financeiro TBO

Valida contrato e processa pagamento

Marco Andolfato

Rafa / Lucca', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Lidera seleção, negociação e gestão</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, Jurídico</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Monitora publicações, engajamento e pagamentos</p></td><td><p>Rafa / Lucca</p></td><td><p>Influenciador</p></td></tr><tr><td><p>Jurídico / Financeiro TBO</p></td><td><p>Valida contrato e processa pagamento</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.', '<p>Plano de Marketing aprovado (MKT-02) com budget de influenciadores definido; briefing do produto; personas do empreendimento; calendário de ativação.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.', '<p>Instagram Insights, YouTube Analytics, HypeAuditor (ou similar), planilha de gestão de influenciadores TBO, Notion, contrato-padrão TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Prospecção e Seleção de Influenciadores', 'Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: >100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.

Responsável: Rafa / Lucca + Analista de Marketing

Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.

Prazo referência: D+5 após aprovação do plano', '<p>Ação: Mapear influenciadores alinhados às personas do produto: segmento (arquitetura, lifestyle, imóveis, família, luxo), localização geográfica, faixa de seguidores (macro: &gt;100k, micro: 10k-100k, nano: 1k-10k). Analisar taxa de engajamento real, autenticidade de audiência (sem compra de seguidores) e histórico de parcerias.</p><p>Responsável: Rafa / Lucca + Analista de Marketing</p><p>Output: Shortlist de 5-10 influenciadores com análise de métricas e alinhamento à persona.</p><p>Prazo referência: D+5 após aprovação do plano</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Negociação e Contratação', 'Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.

Responsável: Rafa / Lucca

Output: Contratos assinados com todos os influenciadores da campanha.

Prazo referência: D+12', '<p>Ação: Entrar em contato com influenciadores selecionados (via direct, e-mail ou assessoria). Negociar formato de entrega, número de posts, janela de exclusividade, valor. Formalizar via contrato-padrão TBO com cláusula de aprovação prévia de conteúdo.</p><p>Responsável: Rafa / Lucca</p><p>Output: Contratos assinados com todos os influenciadores da campanha.</p><p>Prazo referência: D+12</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Briefing de Conteúdo', 'Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).

Responsável: Rafa / Lucca

Output: Briefing individual por influenciador aprovado pelo cliente.

Prazo referência: D+15', '<p>Ação: Elaborar briefing por influenciador: mensagens obrigatórias, tom de voz, produtos/cômodos a destacar, hashtags, menções obrigatórias, data de publicação, formato (stories, reels, feed, YouTube). Incluir o que NÃO deve ser comunicado (preço, condições, concorrentes).</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing individual por influenciador aprovado pelo cliente.</p><p>Prazo referência: D+15</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aprovação de Conteúdo Antes da Publicação', 'Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.

Responsável: Rafa / Lucca

Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).

Prazo referência: 48h antes da publicação prevista', '<p>Ação: Receber rascunho/roteiro de cada conteúdo antes da publicação. Revisar aderência ao briefing, mensagens obrigatórias, tom. Solicitar ajustes se necessário. Aprovar formalmente antes de publicar.</p><p>Responsável: Rafa / Lucca</p><p>Output: Conteúdo aprovado documentado por influenciador (print ou e-mail de aprovação).</p><p>Prazo referência: 48h antes da publicação prevista</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Monitoramento de Publicações e Performance', 'Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.

Responsável: Analista de Marketing

Output: Planilha de performance de influenciadores atualizada por publicação.

Prazo referência: 24-48h após cada publicação', '<p>Ação: Após publicação: registrar métricas nas primeiras 24h (alcance, impressões, engajamento, cliques no link, stories swipe-up). Solicitar print de insights direto do influenciador. Registrar na planilha de gestão.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de performance de influenciadores atualizada por publicação.</p><p>Prazo referência: 24-48h após cada publicação</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Gestão de Pagamento e Encerramento', 'Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.

Responsável: Analista de Marketing + Financeiro TBO

Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.

Prazo referência: Conforme prazo contratual', '<p>Ação: Após entrega completa e validação das métricas, encaminhar para financeiro para pagamento conforme contrato. Documentar performance final de cada influenciador para base de dados de influenciadores TBO.</p><p>Responsável: Analista de Marketing + Financeiro TBO</p><p>Output: Pagamento processado e ficha do influenciador atualizada no banco de dados TBO.</p><p>Prazo referência: Conforme prazo contratual</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.', '<p>Influenciadores selecionados com análise de autenticidade de audiência; contrato assinado antes de qualquer publicação; briefing individual por influenciador; aprovação prévia de 100% dos conteúdos; métricas coletadas e registradas; pagamento somente após entrega validada.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.', '<p>Selecionar influenciadores por número de seguidores sem analisar engajamento real; publicar sem contrato; não ter aprovação prévia de conteúdo; pagar antes de receber métricas; não registrar performance para base de dados futura.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.', '<p>HypeAuditor (ou similar para análise de audiência), Instagram Insights, YouTube Analytics, planilha de gestão de influenciadores TBO, contrato-padrão TBO, Notion.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.', '<p>Shortlist: D+5; contratos: D+12; briefings: D+15; aprovação de conteúdo: 48h antes da publicação; métricas: 48h após publicação; pagamento: conforme contrato.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim', '<p>Início → Prospecção e análise → Shortlist → Negociação → Contrato → Briefing → Recebimento de rascunho → Aprovação → Publicação → Coleta de métricas → Validação → Pagamento → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.', '<p>Micro-influenciador: perfil com 10k-100k seguidores. Taxa de engajamento: percentual de seguidores que interagem com o conteúdo. Swipe-up: ação de arrastar no stories para acessar link. Exclusividade: período em que o influenciador não pode promover concorrentes.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-008: E mail Marketing ──
END $$;