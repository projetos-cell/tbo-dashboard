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
    'Flyer',
    'tbo-brd-009-flyer',
    'branding',
    'checklist',
    'Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.',
    'Standard Operating Procedure

Flyer

Código

TBO-BRD-009

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Branding

Responsável

Nelson (PO Branding)

Aprovador

Marco Andolfato



  1. Objetivo

Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.

  2. Escopo

2.1 O que está coberto

Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.

2.2 Exclusões

Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final

Responsável



Redator

Headline e copy do flyer

Responsável



Nelson (PO Branding)

Aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).

4.2 Ferramentas e Acessos

Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).



  5. Procedimento Passo a Passo

5.1. Briefing e definição de formatos

Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).

Responsável: Atendimento + Redator

Output: Briefing de flyer preenchido e aprovado, formatos confirmados

Prazo referência: 0,5 dia útil

5.2. Copy e headline

Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.

Responsável: Redator

Output: Copy aprovado internamente por Nelson

Prazo referência: 0,5 dia útil

[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual

5.3. Desenvolvimento visual

Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.

Responsável: Designer

Output: Layout em todos os formatos em PDF/PNG para revisão

Prazo referência: 1 dia útil

5.4. Revisão, aprovação e arte final

Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).

Responsável: Marco Andolfato / Designer

Output: Arte final entregue em todos os formatos com nomenclatura padrão

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.

6.2 Erros Comuns a Evitar

Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).

  8. SLAs e Prazos

Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.

  9. Fluxograma

Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim

  10. Glossário

Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Flyer</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-009</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.</p><p><strong>2.2 Exclusões</strong></p><p>Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Headline e copy do flyer</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing e definição de formatos</strong></p><p>Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).</p><p>Responsável: Atendimento + Redator</p><p>Output: Briefing de flyer preenchido e aprovado, formatos confirmados</p><p>Prazo referência: 0,5 dia útil</p><p><strong>5.2. Copy e headline</strong></p><p>Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.</p><p>Responsável: Redator</p><p>Output: Copy aprovado internamente por Nelson</p><p>Prazo referência: 0,5 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual</strong></p><p><strong>5.3. Desenvolvimento visual</strong></p><p>Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.</p><p>Responsável: Designer</p><p>Output: Layout em todos os formatos em PDF/PNG para revisão</p><p>Prazo referência: 1 dia útil</p><p><strong>5.4. Revisão, aprovação e arte final</strong></p><p>Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).</p><p>Responsável: Marco Andolfato / Designer</p><p>Output: Arte final entregue em todos os formatos com nomenclatura padrão</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim</p><p><strong>  10. Glossário</strong></p><p>Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    7,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-009
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.', '<p>Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.', '<p>Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.', '<p>Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final

Responsável

Redator

Headline e copy do flyer

Responsável

Nelson (PO Branding)

Aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Headline e copy do flyer</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).', '<p>Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).', '<p>Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing e definição de formatos', 'Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).

Responsável: Atendimento + Redator

Output: Briefing de flyer preenchido e aprovado, formatos confirmados

Prazo referência: 0,5 dia útil', '<p>Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).</p><p>Responsável: Atendimento + Redator</p><p>Output: Briefing de flyer preenchido e aprovado, formatos confirmados</p><p>Prazo referência: 0,5 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Copy e headline', 'Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.

Responsável: Redator

Output: Copy aprovado internamente por Nelson

Prazo referência: 0,5 dia útil

[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual', '<p>Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.</p><p>Responsável: Redator</p><p>Output: Copy aprovado internamente por Nelson</p><p>Prazo referência: 0,5 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento visual', 'Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.

Responsável: Designer

Output: Layout em todos os formatos em PDF/PNG para revisão

Prazo referência: 1 dia útil', '<p>Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.</p><p>Responsável: Designer</p><p>Output: Layout em todos os formatos em PDF/PNG para revisão</p><p>Prazo referência: 1 dia útil</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão, aprovação e arte final', 'Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).

Responsável: Marco Andolfato / Designer

Output: Arte final entregue em todos os formatos com nomenclatura padrão

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente', '<p>Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).</p><p>Responsável: Marco Andolfato / Designer</p><p>Output: Arte final entregue em todos os formatos com nomenclatura padrão</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.', '<p>Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.', '<p>Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).', '<p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.', '<p>Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim', '<p>Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.', '<p>Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-BRD-010: Papelaria ──
END $$;