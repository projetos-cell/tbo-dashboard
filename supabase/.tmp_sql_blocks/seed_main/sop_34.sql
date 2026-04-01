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
END $$;