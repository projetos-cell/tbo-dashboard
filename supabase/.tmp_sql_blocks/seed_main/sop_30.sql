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
    'Plano de Marketing',
    'tbo-mkt-002-plano-de-marketing',
    'marketing',
    'checklist',
    'Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.',
    'Standard Operating Procedure

Plano de Marketing

Código

TBO-MKT-002

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

Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.

  2. Escopo

2.1 O que está coberto

Definição de posicionamento e naming, estratégia por fase (pré-lançamento, lançamento, sustentação), definição de canais, metas de CPL e volume de leads, calendário macro de marketing.

2.2 Exclusões

Produção de criativos, execução de mídia paga, detalhamento de plano de mídias (coberto no SOP MKT-03).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora e lidera plano

Marco Andolfato

Cliente, BU Criação

BU Estratégia

Valida posicionamento e mensagem

Marco Andolfato

Rafa / Lucca

BU Criação

Recebe briefing criativo derivado do plano

Rafa / Lucca

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Diagnóstico de Marketing aprovado (MKT-01); briefing de produto final; budget total de marketing aprovado pelo cliente; data-alvo do lançamento.

4.2 Ferramentas e Acessos

Notion, Google Slides, planilha de metas TBO, RD Station (para mapeamento de funil).



  5. Procedimento Passo a Passo

5.1. Definição de Posicionamento e Mensagem Central

Ação: Com base no diagnóstico e nas personas, definir o posicionamento único do produto: tagline, pilares de comunicação (máximo 3) e promessa central da marca do empreendimento.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de posicionamento com tagline, pilares e mensagem central aprovados.

Prazo referência: D+3 após diagnóstico aprovado

5.2. Definição de Fases e Objetivos por Fase

Ação: Estruturar as 3 fases de campanha: Pré-Lançamento (geração de expectativa e base de leads), Lançamento (conversão de leads em propostas) e Sustentação (manutenção de velocidade de vendas). Definir objetivo principal, KPI meta e tom de comunicação de cada fase.

Responsável: Rafa / Lucca

Output: Documento de fases com objetivos, KPIs-meta e tom por fase.

Prazo referência: D+5

5.3. Definição de Canais e Mix de Marketing

Ação: Selecionar canais por fase (mídia paga, social media, e-mail, influenciadores, OOH, eventos, portal imobiliário). Justificar cada canal com base nas personas e no benchmark de concorrência.

Responsável: Rafa / Lucca

Output: Matriz de canais por fase com justificativa e peso estratégico.

Prazo referência: D+7

5.4. Metas e KPIs do Plano

Ação: Definir metas quantitativas: volume de leads por fase, CPL-alvo por canal, taxa de conversão lead→visita→proposta→venda, alcance e frequência estimados. Basear em benchmarks de mercado imobiliário e histórico do cliente.

Responsável: Rafa / Lucca

Output: Planilha de metas com targets por fase, canal e métrica.

Prazo referência: D+9

5.5. Calendário Macro de Marketing

Ação: Montar calendário de marco: ações-chave, datas de ativação por fase, eventos de lançamento, entregas de conteúdo e marcos de revisão de performance.

Responsável: Analista de Marketing

Output: Calendário macro em formato visual (Gantt ou timeline) compartilhado com cliente.

Prazo referência: D+10

5.6. Revisão Interna e Aprovação do Plano

Ação: Apresentar plano internamente para Marco Andolfato e BU Criação. Incorporar feedbacks. Apresentar ao cliente para aprovação formal.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de Marketing aprovado com assinatura ou e-mail de validação do cliente.

Prazo referência: D+14

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Posicionamento diferenciado do concorrente mapeado; metas baseadas em dados (não arbitrárias); todos os canais justificados; calendário alinhado com data de lançamento; plano revisado por Marco antes de ir ao cliente.

6.2 Erros Comuns a Evitar

Metas de CPL sem embasamento em benchmark; plano genérico que poderia ser de qualquer produto; canais selecionados por hábito, não por persona; calendário sem folga para produção de criativos.

  7. Ferramentas e Templates

Notion (documentação), Google Slides (apresentação), planilha de metas TBO, RD Station (funil), Google Calendar / Gantt.

  8. SLAs e Prazos

Posicionamento: D+3; plano completo: D+14 após diagnóstico aprovado; aprovação cliente: D+17.

  9. Fluxograma

Início → Posicionamento + Mensagem → Fases e Objetivos → Mix de Canais → Metas e KPIs → Calendário Macro → Revisão interna → Apresentação cliente → Aprovação → Fim

  10. Glossário

CPL: Custo por Lead. OOH: Out-of-Home (mídia exterior). Mix de canais: combinação de meios de comunicação utilizados. KPI: Key Performance Indicator. Funil: etapas da jornada do lead até a compra.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Plano de Marketing</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Definição de posicionamento e naming, estratégia por fase (pré-lançamento, lançamento, sustentação), definição de canais, metas de CPL e volume de leads, calendário macro de marketing.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de criativos, execução de mídia paga, detalhamento de plano de mídias (coberto no SOP MKT-03).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Elabora e lidera plano</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Criação</p></td></tr><tr><td><p>BU Estratégia</p></td><td><p>Valida posicionamento e mensagem</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr><tr><td><p>BU Criação</p></td><td><p>Recebe briefing criativo derivado do plano</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Diagnóstico de Marketing aprovado (MKT-01); briefing de produto final; budget total de marketing aprovado pelo cliente; data-alvo do lançamento.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion, Google Slides, planilha de metas TBO, RD Station (para mapeamento de funil).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Definição de Posicionamento e Mensagem Central</strong></p><p>Ação: Com base no diagnóstico e nas personas, definir o posicionamento único do produto: tagline, pilares de comunicação (máximo 3) e promessa central da marca do empreendimento.</p><p>Responsável: Rafa / Lucca + BU Estratégia</p><p>Output: Documento de posicionamento com tagline, pilares e mensagem central aprovados.</p><p>Prazo referência: D+3 após diagnóstico aprovado</p><p><strong>5.2. Definição de Fases e Objetivos por Fase</strong></p><p>Ação: Estruturar as 3 fases de campanha: Pré-Lançamento (geração de expectativa e base de leads), Lançamento (conversão de leads em propostas) e Sustentação (manutenção de velocidade de vendas). Definir objetivo principal, KPI meta e tom de comunicação de cada fase.</p><p>Responsável: Rafa / Lucca</p><p>Output: Documento de fases com objetivos, KPIs-meta e tom por fase.</p><p>Prazo referência: D+5</p><p><strong>5.3. Definição de Canais e Mix de Marketing</strong></p><p>Ação: Selecionar canais por fase (mídia paga, social media, e-mail, influenciadores, OOH, eventos, portal imobiliário). Justificar cada canal com base nas personas e no benchmark de concorrência.</p><p>Responsável: Rafa / Lucca</p><p>Output: Matriz de canais por fase com justificativa e peso estratégico.</p><p>Prazo referência: D+7</p><p><strong>5.4. Metas e KPIs do Plano</strong></p><p>Ação: Definir metas quantitativas: volume de leads por fase, CPL-alvo por canal, taxa de conversão lead→visita→proposta→venda, alcance e frequência estimados. Basear em benchmarks de mercado imobiliário e histórico do cliente.</p><p>Responsável: Rafa / Lucca</p><p>Output: Planilha de metas com targets por fase, canal e métrica.</p><p>Prazo referência: D+9</p><p><strong>5.5. Calendário Macro de Marketing</strong></p><p>Ação: Montar calendário de marco: ações-chave, datas de ativação por fase, eventos de lançamento, entregas de conteúdo e marcos de revisão de performance.</p><p>Responsável: Analista de Marketing</p><p>Output: Calendário macro em formato visual (Gantt ou timeline) compartilhado com cliente.</p><p>Prazo referência: D+10</p><p><strong>5.6. Revisão Interna e Aprovação do Plano</strong></p><p>Ação: Apresentar plano internamente para Marco Andolfato e BU Criação. Incorporar feedbacks. Apresentar ao cliente para aprovação formal.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Plano de Marketing aprovado com assinatura ou e-mail de validação do cliente.</p><p>Prazo referência: D+14</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Posicionamento diferenciado do concorrente mapeado; metas baseadas em dados (não arbitrárias); todos os canais justificados; calendário alinhado com data de lançamento; plano revisado por Marco antes de ir ao cliente.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Metas de CPL sem embasamento em benchmark; plano genérico que poderia ser de qualquer produto; canais selecionados por hábito, não por persona; calendário sem folga para produção de criativos.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Notion (documentação), Google Slides (apresentação), planilha de metas TBO, RD Station (funil), Google Calendar / Gantt.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Posicionamento: D+3; plano completo: D+14 após diagnóstico aprovado; aprovação cliente: D+17.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Posicionamento + Mensagem → Fases e Objetivos → Mix de Canais → Metas e KPIs → Calendário Macro → Revisão interna → Apresentação cliente → Aprovação → Fim</p><p><strong>  10. Glossário</strong></p><p>CPL: Custo por Lead. OOH: Out-of-Home (mídia exterior). Mix de canais: combinação de meios de comunicação utilizados. KPI: Key Performance Indicator. Funil: etapas da jornada do lead até a compra.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-MKT-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.', '<p>Estruturar o plano estratégico de marketing do empreendimento imobiliário, definindo posicionamento, mensagem central, canais, fases de campanha e metas de performance para todo o ciclo do lançamento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição de posicionamento e naming, estratégia por fase (pré-lançamento, lançamento, sustentação), definição de canais, metas de CPL e volume de leads, calendário macro de marketing.', '<p>Definição de posicionamento e naming, estratégia por fase (pré-lançamento, lançamento, sustentação), definição de canais, metas de CPL e volume de leads, calendário macro de marketing.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de criativos, execução de mídia paga, detalhamento de plano de mídias (coberto no SOP MKT-03).', '<p>Produção de criativos, execução de mídia paga, detalhamento de plano de mídias (coberto no SOP MKT-03).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Elabora e lidera plano

Marco Andolfato

Cliente, BU Criação

BU Estratégia

Valida posicionamento e mensagem

Marco Andolfato

Rafa / Lucca

BU Criação

Recebe briefing criativo derivado do plano

Rafa / Lucca

Cliente', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Elabora e lidera plano</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente, BU Criação</p></td></tr><tr><td><p>BU Estratégia</p></td><td><p>Valida posicionamento e mensagem</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr><tr><td><p>BU Criação</p></td><td><p>Recebe briefing criativo derivado do plano</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Diagnóstico de Marketing aprovado (MKT-01); briefing de produto final; budget total de marketing aprovado pelo cliente; data-alvo do lançamento.', '<p>Diagnóstico de Marketing aprovado (MKT-01); briefing de produto final; budget total de marketing aprovado pelo cliente; data-alvo do lançamento.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion, Google Slides, planilha de metas TBO, RD Station (para mapeamento de funil).', '<p>Notion, Google Slides, planilha de metas TBO, RD Station (para mapeamento de funil).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Definição de Posicionamento e Mensagem Central', 'Ação: Com base no diagnóstico e nas personas, definir o posicionamento único do produto: tagline, pilares de comunicação (máximo 3) e promessa central da marca do empreendimento.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de posicionamento com tagline, pilares e mensagem central aprovados.

Prazo referência: D+3 após diagnóstico aprovado', '<p>Ação: Com base no diagnóstico e nas personas, definir o posicionamento único do produto: tagline, pilares de comunicação (máximo 3) e promessa central da marca do empreendimento.</p><p>Responsável: Rafa / Lucca + BU Estratégia</p><p>Output: Documento de posicionamento com tagline, pilares e mensagem central aprovados.</p><p>Prazo referência: D+3 após diagnóstico aprovado</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição de Fases e Objetivos por Fase', 'Ação: Estruturar as 3 fases de campanha: Pré-Lançamento (geração de expectativa e base de leads), Lançamento (conversão de leads em propostas) e Sustentação (manutenção de velocidade de vendas). Definir objetivo principal, KPI meta e tom de comunicação de cada fase.

Responsável: Rafa / Lucca

Output: Documento de fases com objetivos, KPIs-meta e tom por fase.

Prazo referência: D+5', '<p>Ação: Estruturar as 3 fases de campanha: Pré-Lançamento (geração de expectativa e base de leads), Lançamento (conversão de leads em propostas) e Sustentação (manutenção de velocidade de vendas). Definir objetivo principal, KPI meta e tom de comunicação de cada fase.</p><p>Responsável: Rafa / Lucca</p><p>Output: Documento de fases com objetivos, KPIs-meta e tom por fase.</p><p>Prazo referência: D+5</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Definição de Canais e Mix de Marketing', 'Ação: Selecionar canais por fase (mídia paga, social media, e-mail, influenciadores, OOH, eventos, portal imobiliário). Justificar cada canal com base nas personas e no benchmark de concorrência.

Responsável: Rafa / Lucca

Output: Matriz de canais por fase com justificativa e peso estratégico.

Prazo referência: D+7', '<p>Ação: Selecionar canais por fase (mídia paga, social media, e-mail, influenciadores, OOH, eventos, portal imobiliário). Justificar cada canal com base nas personas e no benchmark de concorrência.</p><p>Responsável: Rafa / Lucca</p><p>Output: Matriz de canais por fase com justificativa e peso estratégico.</p><p>Prazo referência: D+7</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Metas e KPIs do Plano', 'Ação: Definir metas quantitativas: volume de leads por fase, CPL-alvo por canal, taxa de conversão lead→visita→proposta→venda, alcance e frequência estimados. Basear em benchmarks de mercado imobiliário e histórico do cliente.

Responsável: Rafa / Lucca

Output: Planilha de metas com targets por fase, canal e métrica.

Prazo referência: D+9', '<p>Ação: Definir metas quantitativas: volume de leads por fase, CPL-alvo por canal, taxa de conversão lead→visita→proposta→venda, alcance e frequência estimados. Basear em benchmarks de mercado imobiliário e histórico do cliente.</p><p>Responsável: Rafa / Lucca</p><p>Output: Planilha de metas com targets por fase, canal e métrica.</p><p>Prazo referência: D+9</p>', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Calendário Macro de Marketing', 'Ação: Montar calendário de marco: ações-chave, datas de ativação por fase, eventos de lançamento, entregas de conteúdo e marcos de revisão de performance.

Responsável: Analista de Marketing

Output: Calendário macro em formato visual (Gantt ou timeline) compartilhado com cliente.

Prazo referência: D+10', '<p>Ação: Montar calendário de marco: ações-chave, datas de ativação por fase, eventos de lançamento, entregas de conteúdo e marcos de revisão de performance.</p><p>Responsável: Analista de Marketing</p><p>Output: Calendário macro em formato visual (Gantt ou timeline) compartilhado com cliente.</p><p>Prazo referência: D+10</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Revisão Interna e Aprovação do Plano', 'Ação: Apresentar plano internamente para Marco Andolfato e BU Criação. Incorporar feedbacks. Apresentar ao cliente para aprovação formal.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Plano de Marketing aprovado com assinatura ou e-mail de validação do cliente.

Prazo referência: D+14', '<p>Ação: Apresentar plano internamente para Marco Andolfato e BU Criação. Incorporar feedbacks. Apresentar ao cliente para aprovação formal.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Plano de Marketing aprovado com assinatura ou e-mail de validação do cliente.</p><p>Prazo referência: D+14</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Posicionamento diferenciado do concorrente mapeado; metas baseadas em dados (não arbitrárias); todos os canais justificados; calendário alinhado com data de lançamento; plano revisado por Marco antes de ir ao cliente.', '<p>Posicionamento diferenciado do concorrente mapeado; metas baseadas em dados (não arbitrárias); todos os canais justificados; calendário alinhado com data de lançamento; plano revisado por Marco antes de ir ao cliente.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Metas de CPL sem embasamento em benchmark; plano genérico que poderia ser de qualquer produto; canais selecionados por hábito, não por persona; calendário sem folga para produção de criativos.', '<p>Metas de CPL sem embasamento em benchmark; plano genérico que poderia ser de qualquer produto; canais selecionados por hábito, não por persona; calendário sem folga para produção de criativos.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (documentação), Google Slides (apresentação), planilha de metas TBO, RD Station (funil), Google Calendar / Gantt.', '<p>Notion (documentação), Google Slides (apresentação), planilha de metas TBO, RD Station (funil), Google Calendar / Gantt.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Posicionamento: D+3; plano completo: D+14 após diagnóstico aprovado; aprovação cliente: D+17.', '<p>Posicionamento: D+3; plano completo: D+14 após diagnóstico aprovado; aprovação cliente: D+17.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Posicionamento + Mensagem → Fases e Objetivos → Mix de Canais → Metas e KPIs → Calendário Macro → Revisão interna → Apresentação cliente → Aprovação → Fim', '<p>Início → Posicionamento + Mensagem → Fases e Objetivos → Mix de Canais → Metas e KPIs → Calendário Macro → Revisão interna → Apresentação cliente → Aprovação → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'CPL: Custo por Lead. OOH: Out-of-Home (mídia exterior). Mix de canais: combinação de meios de comunicação utilizados. KPI: Key Performance Indicator. Funil: etapas da jornada do lead até a compra.', '<p>CPL: Custo por Lead. OOH: Out-of-Home (mídia exterior). Mix de canais: combinação de meios de comunicação utilizados. KPI: Key Performance Indicator. Funil: etapas da jornada do lead até a compra.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-003: Plano de Mídias ──
END $$;