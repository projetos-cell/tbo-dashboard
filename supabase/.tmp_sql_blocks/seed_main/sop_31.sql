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
END $$;