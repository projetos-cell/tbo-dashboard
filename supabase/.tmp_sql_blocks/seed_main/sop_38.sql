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
    'SEO',
    'tbo-mkt-010-seo',
    'marketing',
    'checklist',
    'Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.',
    'Standard Operating Procedure

SEO

Código

TBO-MKT-010

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

Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.

  2. Escopo

2.1 O que está coberto

Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.

2.2 Exclusões

Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Analista de Marketing

Executa pesquisa de palavras-chave e otimizações on-page

Rafa / Lucca

BU Criação / TI

Rafa / Lucca

Define estratégia e prioriza ações

Marco Andolfato

Cliente

BU Criação / TI

Implementa otimizações técnicas na LP

Rafa / Lucca

Analista de Marketing

  4. Pré-requisitos

4.1 Inputs necessários

Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.

4.2 Ferramentas e Acessos

Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).



  5. Procedimento Passo a Passo

5.1. Pesquisa de Palavras-Chave

Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.

Responsável: Analista de Marketing

Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.

Prazo referência: D+5 após início

5.2. Auditoria Técnica da Landing Page

Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (<3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.

Responsável: Analista de Marketing

Output: Relatório de auditoria com lista priorizada de correções.

Prazo referência: D+7

5.3. Otimização On-Page

Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (<60 chars), meta description com CTA (<155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.

Responsável: Analista de Marketing + BU Criação / TI

Output: LP otimizada com todas as correções implementadas e validadas no Search Console.

Prazo referência: D+15

5.4. SEO Local e Google Meu Negócio

Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.

Responsável: Analista de Marketing

Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.

Prazo referência: D+10

5.5. Link Building Básico

Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.

Responsável: Rafa / Lucca

Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.

Prazo referência: D+30

5.6. Monitoramento Mensal de Performance Orgânica

Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.

Responsável: Analista de Marketing

Output: Relatório mensal de SEO com evolução de rankings e recomendações.

Prazo referência: Mensal

  6. Critérios de Qualidade

6.1 Checklist de Entrega

H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed >70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.

6.2 Erros Comuns a Evitar

Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.

  7. Ferramentas e Templates

Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.

  8. SLAs e Prazos

Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.

  9. Fluxograma

Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim

  10. Glossário

SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>SEO</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-010</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.</p><p><strong>2.2 Exclusões</strong></p><p>Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Executa pesquisa de palavras-chave e otimizações on-page</p></td><td><p>Rafa / Lucca</p></td><td><p>BU Criação / TI</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e prioriza ações</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Criação / TI</p></td><td><p>Implementa otimizações técnicas na LP</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Pesquisa de Palavras-Chave</strong></p><p>Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.</p><p>Prazo referência: D+5 após início</p><p><strong>5.2. Auditoria Técnica da Landing Page</strong></p><p>Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (&lt;3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de auditoria com lista priorizada de correções.</p><p>Prazo referência: D+7</p><p><strong>5.3. Otimização On-Page</strong></p><p>Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (&lt;60 chars), meta description com CTA (&lt;155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.</p><p>Responsável: Analista de Marketing + BU Criação / TI</p><p>Output: LP otimizada com todas as correções implementadas e validadas no Search Console.</p><p>Prazo referência: D+15</p><p><strong>5.4. SEO Local e Google Meu Negócio</strong></p><p>Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.</p><p>Responsável: Analista de Marketing</p><p>Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.</p><p>Prazo referência: D+10</p><p><strong>5.5. Link Building Básico</strong></p><p>Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.</p><p>Responsável: Rafa / Lucca</p><p>Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.</p><p>Prazo referência: D+30</p><p><strong>5.6. Monitoramento Mensal de Performance Orgânica</strong></p><p>Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal de SEO com evolução de rankings e recomendações.</p><p>Prazo referência: Mensal</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed &gt;70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim</p><p><strong>  10. Glossário</strong></p><p>SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    9,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-010
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.', '<p>Implementar estratégia de SEO para o empreendimento imobiliário, aumentando a visibilidade orgânica nos buscadores para termos relevantes de compra de imóveis na região do produto, gerando tráfego qualificado de custo zero.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.', '<p>Pesquisa de palavras-chave, otimização on-page da landing page e site do empreendimento, SEO local (Google Meu Negócio), link building básico, monitoramento de rankings e tráfego orgânico.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).', '<p>Desenvolvimento de site (TI/BU Criação), produção de conteúdo editorial de blog (escopo separado), SEO técnico de servidor (TI).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Analista de Marketing

Executa pesquisa de palavras-chave e otimizações on-page

Rafa / Lucca

BU Criação / TI

Rafa / Lucca

Define estratégia e prioriza ações

Marco Andolfato

Cliente

BU Criação / TI

Implementa otimizações técnicas na LP

Rafa / Lucca

Analista de Marketing', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Executa pesquisa de palavras-chave e otimizações on-page</p></td><td><p>Rafa / Lucca</p></td><td><p>BU Criação / TI</p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Define estratégia e prioriza ações</p></td><td><p>Marco Andolfato</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Criação / TI</p></td><td><p>Implementa otimizações técnicas na LP</p></td><td><p>Rafa / Lucca</p></td><td><p>Analista de Marketing</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.', '<p>Landing page do empreendimento publicada; acesso ao Google Search Console e Google Analytics 4; acesso ao Google Meu Negócio do cliente; Semrush conta ativa.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).', '<p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog (auditoria técnica).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Pesquisa de Palavras-Chave', 'Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.

Responsável: Analista de Marketing

Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.

Prazo referência: D+5 após início', '<p>Ação: Mapear palavras-chave relevantes: termos de produto (ex.: ''apartamento 2 quartos no Água Verde''), termos de localização, termos de intenção de compra, termos de concorrentes. Priorizar por volume, dificuldade e intenção transacional. Mínimo 30 termos mapeados.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de palavras-chave com volume, dificuldade, intenção e prioridade.</p><p>Prazo referência: D+5 após início</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Auditoria Técnica da Landing Page', 'Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (<3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.

Responsável: Analista de Marketing

Output: Relatório de auditoria com lista priorizada de correções.

Prazo referência: D+7', '<p>Ação: Auditar LP com Screaming Frog e PageSpeed: velocidade de carregamento (&lt;3s mobile), estrutura de headings (H1 único com palavra-chave principal), meta title e description, alt text em imagens, URL amigável, schema markup de imóvel.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de auditoria com lista priorizada de correções.</p><p>Prazo referência: D+7</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Otimização On-Page', 'Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (<60 chars), meta description com CTA (<155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.

Responsável: Analista de Marketing + BU Criação / TI

Output: LP otimizada com todas as correções implementadas e validadas no Search Console.

Prazo referência: D+15', '<p>Ação: Implementar (ou briefar TI/Criação): meta title com palavra-chave principal (&lt;60 chars), meta description com CTA (&lt;155 chars), H1 com localização e tipo de produto, conteúdo da LP com palavras-chave naturalmente inseridas, schema markup de RealEstateListing, URLs canônicas.</p><p>Responsável: Analista de Marketing + BU Criação / TI</p><p>Output: LP otimizada com todas as correções implementadas e validadas no Search Console.</p><p>Prazo referência: D+15</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. SEO Local e Google Meu Negócio', 'Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.

Responsável: Analista de Marketing

Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.

Prazo referência: D+10', '<p>Ação: Otimizar perfil do Google Meu Negócio do incorporador/empreendimento: categorias corretas, fotos do produto, descrição com palavras-chave, horário de atendimento do estande de vendas, posts regulares sobre o empreendimento. Monitorar avaliações.</p><p>Responsável: Analista de Marketing</p><p>Output: Perfil Google Meu Negócio 100% preenchido e postagens ativas.</p><p>Prazo referência: D+10</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Link Building Básico', 'Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.

Responsável: Rafa / Lucca

Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.

Prazo referência: D+30', '<p>Ação: Obter links relevantes para a LP: portais imobiliários (Zap, VivaReal, OLX Imóveis) com link para o site, assessoria de imprensa local, parcerias com blogs de decoração/arquitetura da região.</p><p>Responsável: Rafa / Lucca</p><p>Output: Mínimo 5 links externos de qualidade apontando para a LP registrados na planilha.</p><p>Prazo referência: D+30</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Monitoramento Mensal de Performance Orgânica', 'Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.

Responsável: Analista de Marketing

Output: Relatório mensal de SEO com evolução de rankings e recomendações.

Prazo referência: Mensal', '<p>Ação: Monitorar mensalmente via Search Console e GA4: posição média das palavras-chave alvo, cliques orgânicos, impressões, taxa de cliques (CTR). Identificar termos com posições 4-10 (oportunidade de push para top 3). Ajustar conteúdo conforme dados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório mensal de SEO com evolução de rankings e recomendações.</p><p>Prazo referência: Mensal</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed >70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.', '<p>H1 único e com palavra-chave principal; meta title e description em 100% das páginas; PageSpeed &gt;70 no mobile; Google Meu Negócio completo; mínimo 5 links externos; Search Console sem erros críticos.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.', '<p>Múltiplos H1 na mesma página; meta description duplicada; imagens sem alt text; LP sem schema markup de imóvel; não monitorar rankings após otimização.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.', '<p>Semrush, Google Search Console, Google Analytics 4, Google Meu Negócio, PageSpeed Insights, Screaming Frog.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.', '<p>Pesquisa de palavras-chave: D+5; auditoria técnica: D+7; otimizações on-page: D+15; Google Meu Negócio: D+10; link building inicial: D+30; relatório mensal: todo dia 5.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim', '<p>Início → Pesquisa de palavras-chave → Auditoria técnica → Otimização on-page → SEO Local (GMB) → Link building → Monitoramento mensal → Ajustes → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.', '<p>SEO: Search Engine Optimization. On-page: otimizações realizadas dentro do próprio site. Schema markup: código estruturado que ajuda o Google a entender o conteúdo. GMB: Google Meu Negócio. Search Console: ferramenta do Google para monitorar performance orgânica. Canonical: tag que indica a URL principal de uma página.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-011: Gestão de Social Media ──
END $$;