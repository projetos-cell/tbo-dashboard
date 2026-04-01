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
END $$;