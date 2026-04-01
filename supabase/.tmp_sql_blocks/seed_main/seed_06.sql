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
    'Criativos On Off',
    'tbo-brd-013-criativos-on-off',
    'branding',
    'checklist',
    'Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.',
    'Standard Operating Procedure

Criativos On & Off

Código

TBO-BRD-013

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

Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.

  2. Escopo

2.1 O que está coberto

Criativos para redes sociais (feed, stories, reels cover), Google Display, mídia exterior (outdoor 9x3m, busdoor, painéis de metrô), WhatsApp marketing, materiais para eventos (roll-up, backdrop).

2.2 Exclusões

Roteiro e produção de vídeo (audiovisual), gestão de tráfego e impulsionamento (responsabilidade do time de digital), produção física de outdoor e painéis.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final de todos os formatos

Responsável



Redator

Copy de cada formato

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação estratégica e final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), KVs aprovados, briefing de campanha (objetivo, período, verba estimada, formatos solicitados), copy de campanha validado.

4.2 Ferramentas e Acessos

Adobe Photoshop (criativos digitais e impressos), Adobe Illustrator (vetoriais e outdoor), Figma (criativos digitais colaborativos), Canva (versões para uso autônomo pelo cliente), Meta Ads Manager (especificações de formato).



  5. Procedimento Passo a Passo

5.1. Briefing de campanha e definição de formatos

Ação: Receber briefing detalhado: objetivo (awareness, geração de leads, lançamento), período da campanha, canais (Meta, Google, outdoor, WhatsApp), mensagem central, oferta ou CTA. Definir lista completa de formatos e dimensões para cada canal. Alinhar internamente com Nelson.

Responsável: Atendimento + Redator + Nelson

Output: Briefing de campanha aprovado, lista de formatos e dimensões definidas

Prazo referência: 0,5 dia útil

5.2. Conceito criativo da campanha

Ação: Definir o conceito visual e o copy central da campanha (headline, subheadline, CTA). Criar 1 ou 2 direcionamentos criativos para aprovação do cliente antes de produzir todos os formatos. Apresentar em mockup nos principais formatos.

Responsável: Designer + Redator + Nelson

Output: Conceito criativo em mockup apresentado e aprovado pelo cliente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova internamente; cliente aprova antes da produção em escala

5.3. Produção dos criativos on-line

Ação: Adaptar o conceito aprovado para todos os formatos digitais: feed 1080x1080px, stories 1080x1920px, Google Display (vários formatos padrão IAB), WhatsApp 900x1600px. Atentar para áreas seguras, textos nos limites de espaço e CTAs claros.

Responsável: Designer

Output: Todos os formatos digitais em arquivos PNG/JPG + arquivos editáveis

Prazo referência: 2 dias úteis

5.4. Produção dos criativos off-line

Ação: Criar artes finais para mídia exterior: outdoor (9x3m ou 12x4m — arte simples, legível a 50m de distância, máx. 7 palavras no headline), busdoor (aprox. 1,20x0,40m), roll-up (850x2000mm), backdrop (tamanho conforme solicitado). Atenção: formatos de outdoor devem ser produzidos em resolução adequada ao tamanho (15–25dpi no tamanho final).

Responsável: Designer

Output: Artes finais de mídia exterior em PDF + AI/PSD editáveis

Prazo referência: 2 dias úteis

5.5. Revisão, aprovação e entrega

Ação: Marco Andolfato revisa todos os criativos. Enviar ao cliente kit completo de criativos para aprovação. Aplicar ajustes (máx. 1 rodada por campanha incluída no escopo). Entregar ao cliente com nomenclatura padronizada e planilha de especificações (formato, dimensão, peso, canal).

Responsável: Marco Andolfato / Nelson

Output: Kit completo de criativos aprovados, nomenclatura padronizada, planilha de especificações entregue

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Outdoor: máx. 7 palavras no headline, legível a 50m; formatos digitais dentro dos specs de cada plataforma (verificar Meta Ads Guide); textos nos criativos digitais representam menos de 20% da área total; QR Codes testados; todos os formatos entregues com nomenclatura padronizada; arte de outdoor em CMYK; criativos digitais em RGB sRGB.

6.2 Erros Comuns a Evitar

Outdoor com texto excessivo (ilegível em movimento); adaptar feed para stories apenas recortando (precisa recompor o layout); imagem de fundo em baixa resolução ampliada para outdoor; criativos digitais em CMYK (cores erradas na tela); nomenclatura de arquivos inconsistente (prejudica a gestão do cliente).

  7. Ferramentas e Templates

Adobe Photoshop CC, Adobe Illustrator CC, Figma, Canva, Meta Ads Specs Guide (referência de dimensões), Google Display Ad Gallery.

  8. SLAs e Prazos

Briefing e conceito: 2 dias úteis. Criativos on-line: 2 dias úteis. Criativos off-line: 2 dias úteis. Aprovação: 2 dias úteis. Total: 8–10 dias úteis por campanha.

  9. Fluxograma

Início → Briefing de campanha → Definir formatos → Criar conceito criativo → [CLIENTE APROVA CONCEITO?] → Não: ajustar (máx. 1x) → Sim: Produzir criativos on-line → Produzir criativos off-line → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Entregar kit com nomenclatura e specs → Fim

  10. Glossário

IAB (Interactive Advertising Bureau): organização que define padrões de formatos para publicidade digital. Busdoor: peça de comunicação visual aplicada nas portas laterais de ônibus. Roll-up: display retrátil portátil usado em eventos e PDV. Backdrop: painel de fundo para eventos e entrevistas (com repetição de logos). dpi (dots per inch): medida de resolução — quanto maior o formato de impressão, menor o dpi necessário.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Criativos On &amp; Off</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-013</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criativos para redes sociais (feed, stories, reels cover), Google Display, mídia exterior (outdoor 9x3m, busdoor, painéis de metrô), WhatsApp marketing, materiais para eventos (roll-up, backdrop).</p><p><strong>2.2 Exclusões</strong></p><p>Roteiro e produção de vídeo (audiovisual), gestão de tráfego e impulsionamento (responsabilidade do time de digital), produção física de outdoor e painéis.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final de todos os formatos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Copy de cada formato</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica e final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), KVs aprovados, briefing de campanha (objetivo, período, verba estimada, formatos solicitados), copy de campanha validado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Photoshop (criativos digitais e impressos), Adobe Illustrator (vetoriais e outdoor), Figma (criativos digitais colaborativos), Canva (versões para uso autônomo pelo cliente), Meta Ads Manager (especificações de formato).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing de campanha e definição de formatos</strong></p><p>Ação: Receber briefing detalhado: objetivo (awareness, geração de leads, lançamento), período da campanha, canais (Meta, Google, outdoor, WhatsApp), mensagem central, oferta ou CTA. Definir lista completa de formatos e dimensões para cada canal. Alinhar internamente com Nelson.</p><p>Responsável: Atendimento + Redator + Nelson</p><p>Output: Briefing de campanha aprovado, lista de formatos e dimensões definidas</p><p>Prazo referência: 0,5 dia útil</p><p><strong>5.2. Conceito criativo da campanha</strong></p><p>Ação: Definir o conceito visual e o copy central da campanha (headline, subheadline, CTA). Criar 1 ou 2 direcionamentos criativos para aprovação do cliente antes de produzir todos os formatos. Apresentar em mockup nos principais formatos.</p><p>Responsável: Designer + Redator + Nelson</p><p>Output: Conceito criativo em mockup apresentado e aprovado pelo cliente</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova internamente; cliente aprova antes da produção em escala</strong></p><p><strong>5.3. Produção dos criativos on-line</strong></p><p>Ação: Adaptar o conceito aprovado para todos os formatos digitais: feed 1080x1080px, stories 1080x1920px, Google Display (vários formatos padrão IAB), WhatsApp 900x1600px. Atentar para áreas seguras, textos nos limites de espaço e CTAs claros.</p><p>Responsável: Designer</p><p>Output: Todos os formatos digitais em arquivos PNG/JPG + arquivos editáveis</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.4. Produção dos criativos off-line</strong></p><p>Ação: Criar artes finais para mídia exterior: outdoor (9x3m ou 12x4m — arte simples, legível a 50m de distância, máx. 7 palavras no headline), busdoor (aprox. 1,20x0,40m), roll-up (850x2000mm), backdrop (tamanho conforme solicitado). Atenção: formatos de outdoor devem ser produzidos em resolução adequada ao tamanho (15–25dpi no tamanho final).</p><p>Responsável: Designer</p><p>Output: Artes finais de mídia exterior em PDF + AI/PSD editáveis</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.5. Revisão, aprovação e entrega</strong></p><p>Ação: Marco Andolfato revisa todos os criativos. Enviar ao cliente kit completo de criativos para aprovação. Aplicar ajustes (máx. 1 rodada por campanha incluída no escopo). Entregar ao cliente com nomenclatura padronizada e planilha de especificações (formato, dimensão, peso, canal).</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Kit completo de criativos aprovados, nomenclatura padronizada, planilha de especificações entregue</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Outdoor: máx. 7 palavras no headline, legível a 50m; formatos digitais dentro dos specs de cada plataforma (verificar Meta Ads Guide); textos nos criativos digitais representam menos de 20% da área total; QR Codes testados; todos os formatos entregues com nomenclatura padronizada; arte de outdoor em CMYK; criativos digitais em RGB sRGB.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Outdoor com texto excessivo (ilegível em movimento); adaptar feed para stories apenas recortando (precisa recompor o layout); imagem de fundo em baixa resolução ampliada para outdoor; criativos digitais em CMYK (cores erradas na tela); nomenclatura de arquivos inconsistente (prejudica a gestão do cliente).</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Photoshop CC, Adobe Illustrator CC, Figma, Canva, Meta Ads Specs Guide (referência de dimensões), Google Display Ad Gallery.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Briefing e conceito: 2 dias úteis. Criativos on-line: 2 dias úteis. Criativos off-line: 2 dias úteis. Aprovação: 2 dias úteis. Total: 8–10 dias úteis por campanha.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing de campanha → Definir formatos → Criar conceito criativo → [CLIENTE APROVA CONCEITO?] → Não: ajustar (máx. 1x) → Sim: Produzir criativos on-line → Produzir criativos off-line → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Entregar kit com nomenclatura e specs → Fim</p><p><strong>  10. Glossário</strong></p><p>IAB (Interactive Advertising Bureau): organização que define padrões de formatos para publicidade digital. Busdoor: peça de comunicação visual aplicada nas portas laterais de ônibus. Roll-up: display retrátil portátil usado em eventos e PDV. Backdrop: painel de fundo para eventos e entrevistas (com repetição de logos). dpi (dots per inch): medida de resolução — quanto maior o formato de impressão, menor o dpi necessário.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-013
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.', '<p>Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criativos para redes sociais (feed, stories, reels cover), Google Display, mídia exterior (outdoor 9x3m, busdoor, painéis de metrô), WhatsApp marketing, materiais para eventos (roll-up, backdrop).', '<p>Criativos para redes sociais (feed, stories, reels cover), Google Display, mídia exterior (outdoor 9x3m, busdoor, painéis de metrô), WhatsApp marketing, materiais para eventos (roll-up, backdrop).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Roteiro e produção de vídeo (audiovisual), gestão de tráfego e impulsionamento (responsabilidade do time de digital), produção física de outdoor e painéis.', '<p>Roteiro e produção de vídeo (audiovisual), gestão de tráfego e impulsionamento (responsabilidade do time de digital), produção física de outdoor e painéis.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final de todos os formatos

Responsável

Redator

Copy de cada formato

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação estratégica e final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final de todos os formatos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Copy de cada formato</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica e final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), KVs aprovados, briefing de campanha (objetivo, período, verba estimada, formatos solicitados), copy de campanha validado.', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), KVs aprovados, briefing de campanha (objetivo, período, verba estimada, formatos solicitados), copy de campanha validado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Photoshop (criativos digitais e impressos), Adobe Illustrator (vetoriais e outdoor), Figma (criativos digitais colaborativos), Canva (versões para uso autônomo pelo cliente), Meta Ads Manager (especificações de formato).', '<p>Adobe Photoshop (criativos digitais e impressos), Adobe Illustrator (vetoriais e outdoor), Figma (criativos digitais colaborativos), Canva (versões para uso autônomo pelo cliente), Meta Ads Manager (especificações de formato).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing de campanha e definição de formatos', 'Ação: Receber briefing detalhado: objetivo (awareness, geração de leads, lançamento), período da campanha, canais (Meta, Google, outdoor, WhatsApp), mensagem central, oferta ou CTA. Definir lista completa de formatos e dimensões para cada canal. Alinhar internamente com Nelson.

Responsável: Atendimento + Redator + Nelson

Output: Briefing de campanha aprovado, lista de formatos e dimensões definidas

Prazo referência: 0,5 dia útil', '<p>Ação: Receber briefing detalhado: objetivo (awareness, geração de leads, lançamento), período da campanha, canais (Meta, Google, outdoor, WhatsApp), mensagem central, oferta ou CTA. Definir lista completa de formatos e dimensões para cada canal. Alinhar internamente com Nelson.</p><p>Responsável: Atendimento + Redator + Nelson</p><p>Output: Briefing de campanha aprovado, lista de formatos e dimensões definidas</p><p>Prazo referência: 0,5 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Conceito criativo da campanha', 'Ação: Definir o conceito visual e o copy central da campanha (headline, subheadline, CTA). Criar 1 ou 2 direcionamentos criativos para aprovação do cliente antes de produzir todos os formatos. Apresentar em mockup nos principais formatos.

Responsável: Designer + Redator + Nelson

Output: Conceito criativo em mockup apresentado e aprovado pelo cliente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova internamente; cliente aprova antes da produção em escala', '<p>Ação: Definir o conceito visual e o copy central da campanha (headline, subheadline, CTA). Criar 1 ou 2 direcionamentos criativos para aprovação do cliente antes de produzir todos os formatos. Apresentar em mockup nos principais formatos.</p><p>Responsável: Designer + Redator + Nelson</p><p>Output: Conceito criativo em mockup apresentado e aprovado pelo cliente</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova internamente; cliente aprova antes da produção em escala</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Produção dos criativos on-line', 'Ação: Adaptar o conceito aprovado para todos os formatos digitais: feed 1080x1080px, stories 1080x1920px, Google Display (vários formatos padrão IAB), WhatsApp 900x1600px. Atentar para áreas seguras, textos nos limites de espaço e CTAs claros.

Responsável: Designer

Output: Todos os formatos digitais em arquivos PNG/JPG + arquivos editáveis

Prazo referência: 2 dias úteis', '<p>Ação: Adaptar o conceito aprovado para todos os formatos digitais: feed 1080x1080px, stories 1080x1920px, Google Display (vários formatos padrão IAB), WhatsApp 900x1600px. Atentar para áreas seguras, textos nos limites de espaço e CTAs claros.</p><p>Responsável: Designer</p><p>Output: Todos os formatos digitais em arquivos PNG/JPG + arquivos editáveis</p><p>Prazo referência: 2 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Produção dos criativos off-line', 'Ação: Criar artes finais para mídia exterior: outdoor (9x3m ou 12x4m — arte simples, legível a 50m de distância, máx. 7 palavras no headline), busdoor (aprox. 1,20x0,40m), roll-up (850x2000mm), backdrop (tamanho conforme solicitado). Atenção: formatos de outdoor devem ser produzidos em resolução adequada ao tamanho (15–25dpi no tamanho final).

Responsável: Designer

Output: Artes finais de mídia exterior em PDF + AI/PSD editáveis

Prazo referência: 2 dias úteis', '<p>Ação: Criar artes finais para mídia exterior: outdoor (9x3m ou 12x4m — arte simples, legível a 50m de distância, máx. 7 palavras no headline), busdoor (aprox. 1,20x0,40m), roll-up (850x2000mm), backdrop (tamanho conforme solicitado). Atenção: formatos de outdoor devem ser produzidos em resolução adequada ao tamanho (15–25dpi no tamanho final).</p><p>Responsável: Designer</p><p>Output: Artes finais de mídia exterior em PDF + AI/PSD editáveis</p><p>Prazo referência: 2 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Revisão, aprovação e entrega', 'Ação: Marco Andolfato revisa todos os criativos. Enviar ao cliente kit completo de criativos para aprovação. Aplicar ajustes (máx. 1 rodada por campanha incluída no escopo). Entregar ao cliente com nomenclatura padronizada e planilha de especificações (formato, dimensão, peso, canal).

Responsável: Marco Andolfato / Nelson

Output: Kit completo de criativos aprovados, nomenclatura padronizada, planilha de especificações entregue

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', '<p>Ação: Marco Andolfato revisa todos os criativos. Enviar ao cliente kit completo de criativos para aprovação. Aplicar ajustes (máx. 1 rodada por campanha incluída no escopo). Entregar ao cliente com nomenclatura padronizada e planilha de especificações (formato, dimensão, peso, canal).</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Kit completo de criativos aprovados, nomenclatura padronizada, planilha de especificações entregue</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Outdoor: máx. 7 palavras no headline, legível a 50m; formatos digitais dentro dos specs de cada plataforma (verificar Meta Ads Guide); textos nos criativos digitais representam menos de 20% da área total; QR Codes testados; todos os formatos entregues com nomenclatura padronizada; arte de outdoor em CMYK; criativos digitais em RGB sRGB.', '<p>Outdoor: máx. 7 palavras no headline, legível a 50m; formatos digitais dentro dos specs de cada plataforma (verificar Meta Ads Guide); textos nos criativos digitais representam menos de 20% da área total; QR Codes testados; todos os formatos entregues com nomenclatura padronizada; arte de outdoor em CMYK; criativos digitais em RGB sRGB.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Outdoor com texto excessivo (ilegível em movimento); adaptar feed para stories apenas recortando (precisa recompor o layout); imagem de fundo em baixa resolução ampliada para outdoor; criativos digitais em CMYK (cores erradas na tela); nomenclatura de arquivos inconsistente (prejudica a gestão do cliente).', '<p>Outdoor com texto excessivo (ilegível em movimento); adaptar feed para stories apenas recortando (precisa recompor o layout); imagem de fundo em baixa resolução ampliada para outdoor; criativos digitais em CMYK (cores erradas na tela); nomenclatura de arquivos inconsistente (prejudica a gestão do cliente).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Photoshop CC, Adobe Illustrator CC, Figma, Canva, Meta Ads Specs Guide (referência de dimensões), Google Display Ad Gallery.', '<p>Adobe Photoshop CC, Adobe Illustrator CC, Figma, Canva, Meta Ads Specs Guide (referência de dimensões), Google Display Ad Gallery.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing e conceito: 2 dias úteis. Criativos on-line: 2 dias úteis. Criativos off-line: 2 dias úteis. Aprovação: 2 dias úteis. Total: 8–10 dias úteis por campanha.', '<p>Briefing e conceito: 2 dias úteis. Criativos on-line: 2 dias úteis. Criativos off-line: 2 dias úteis. Aprovação: 2 dias úteis. Total: 8–10 dias úteis por campanha.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing de campanha → Definir formatos → Criar conceito criativo → [CLIENTE APROVA CONCEITO?] → Não: ajustar (máx. 1x) → Sim: Produzir criativos on-line → Produzir criativos off-line → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Entregar kit com nomenclatura e specs → Fim', '<p>Início → Briefing de campanha → Definir formatos → Criar conceito criativo → [CLIENTE APROVA CONCEITO?] → Não: ajustar (máx. 1x) → Sim: Produzir criativos on-line → Produzir criativos off-line → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Entregar kit com nomenclatura e specs → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'IAB (Interactive Advertising Bureau): organização que define padrões de formatos para publicidade digital. Busdoor: peça de comunicação visual aplicada nas portas laterais de ônibus. Roll-up: display retrátil portátil usado em eventos e PDV. Backdrop: painel de fundo para eventos e entrevistas (com repetição de logos). dpi (dots per inch): medida de resolução — quanto maior o formato de impressão, menor o dpi necessário.', '<p>IAB (Interactive Advertising Bureau): organização que define padrões de formatos para publicidade digital. Busdoor: peça de comunicação visual aplicada nas portas laterais de ônibus. Roll-up: display retrátil portátil usado em eventos e PDV. Backdrop: painel de fundo para eventos e entrevistas (com repetição de logos). dpi (dots per inch): medida de resolução — quanto maior o formato de impressão, menor o dpi necessário.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-014: Aprovação e Revisão de Materiais ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Aprovação e Revisão de Materiais',
    'tbo-brd-014-aprovacao-e-revisao-de-materiais',
    'branding',
    'checklist',
    'Aprovação e Revisão de Materiais',
    'Standard Operating Procedure

Aprovação e Revisão de Materiais

Código

TBO-BRD-014

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

Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.

  2. Escopo

2.1 O que está coberto

Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.

2.2 Exclusões

Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Produzir versão de revisão e aplicar ajustes

Responsável



Nelson (PO Branding)

Revisão criativa e de identidade visual — 1ª aprovação interna

Aprovador



Marco Andolfato

Aprovação estratégica final interna — 2ª aprovação antes do cliente

Aprovador



Atendimento/Gestor de Conta

Envio ao cliente e gestão do processo de aprovação

Responsável



Cliente/Incorporadora

Aprovação de conteúdo, dados e design



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.

4.2 Ferramentas e Acessos

Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.



  5. Procedimento Passo a Passo

5.1. Checklist de qualidade pelo designer

Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.

Responsável: Designer

Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão

Prazo referência: 0,5 dia útil por material

5.2. Revisão criativa — Nelson (PO Branding)

Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.

Responsável: Nelson (PO Branding)

Output: Lista de apontamentos numerada no Notion (ou aprovação direta)

Prazo referência: 4 horas a 1 dia útil

[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.

5.3. Revisão estratégica — Marco Andolfato

Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.

Responsável: Marco Andolfato

Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais

Prazo referência: 4 horas a 1 dia útil

[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato

5.4. Envio ao cliente e gestão de feedback

Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).

Responsável: Atendimento/Gestor de Conta

Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado

Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis

5.5. Aplicação de ajustes e controle de versões

Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.

Responsável: Designer + Atendimento

Output: Arquivo revisado versionado no Drive, registro no Notion atualizado

Prazo referência: 1–2 dias úteis por rodada

[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.

5.6. Aprovação final e liberação para produção

Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.

Responsável: Atendimento + Nelson

Output: Aprovação formal registrada, material liberado para produção ou publicação

Prazo referência: 0,5 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.

6.2 Erros Comuns a Evitar

Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.

  7. Ferramentas e Templates

Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.

  8. SLAs e Prazos

Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.

  9. Fluxograma

Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim

  10. Glossário

Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Aprovação e Revisão de Materiais</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-014</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.</p><p><strong>2.2 Exclusões</strong></p><p>Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Produzir versão de revisão e aplicar ajustes</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Revisão criativa e de identidade visual — 1ª aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final interna — 2ª aprovação antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Atendimento/Gestor de Conta</p></td><td><p>Envio ao cliente e gestão do processo de aprovação</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aprovação de conteúdo, dados e design</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Checklist de qualidade pelo designer</strong></p><p>Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.</p><p>Responsável: Designer</p><p>Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão</p><p>Prazo referência: 0,5 dia útil por material</p><p><strong>5.2. Revisão criativa — Nelson (PO Branding)</strong></p><p>Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista de apontamentos numerada no Notion (ou aprovação direta)</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.</strong></p><p><strong>5.3. Revisão estratégica — Marco Andolfato</strong></p><p>Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.</p><p>Responsável: Marco Andolfato</p><p>Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato</strong></p><p><strong>5.4. Envio ao cliente e gestão de feedback</strong></p><p>Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).</p><p>Responsável: Atendimento/Gestor de Conta</p><p>Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado</p><p>Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis</p><p><strong>5.5. Aplicação de ajustes e controle de versões</strong></p><p>Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.</p><p>Responsável: Designer + Atendimento</p><p>Output: Arquivo revisado versionado no Drive, registro no Notion atualizado</p><p>Prazo referência: 1–2 dias úteis por rodada</p><p><strong>[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.</strong></p><p><strong>5.6. Aprovação final e liberação para produção</strong></p><p>Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.</p><p>Responsável: Atendimento + Nelson</p><p>Output: Aprovação formal registrada, material liberado para produção ou publicação</p><p>Prazo referência: 0,5 dia útil</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim</p><p><strong>  10. Glossário</strong></p><p>Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    12,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-014
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.', '<p>Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.', '<p>Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.', '<p>Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Produzir versão de revisão e aplicar ajustes

Responsável

Nelson (PO Branding)

Revisão criativa e de identidade visual — 1ª aprovação interna

Aprovador

Marco Andolfato

Aprovação estratégica final interna — 2ª aprovação antes do cliente

Aprovador

Atendimento/Gestor de Conta

Envio ao cliente e gestão do processo de aprovação

Responsável

Cliente/Incorporadora

Aprovação de conteúdo, dados e design

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Produzir versão de revisão e aplicar ajustes</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Revisão criativa e de identidade visual — 1ª aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final interna — 2ª aprovação antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Atendimento/Gestor de Conta</p></td><td><p>Envio ao cliente e gestão do processo de aprovação</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aprovação de conteúdo, dados e design</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.', '<p>Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.', '<p>Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Checklist de qualidade pelo designer', 'Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.

Responsável: Designer

Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão

Prazo referência: 0,5 dia útil por material', '<p>Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.</p><p>Responsável: Designer</p><p>Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão</p><p>Prazo referência: 0,5 dia útil por material</p>', 6, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Revisão criativa — Nelson (PO Branding)', 'Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.

Responsável: Nelson (PO Branding)

Output: Lista de apontamentos numerada no Notion (ou aprovação direta)

Prazo referência: 4 horas a 1 dia útil

[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.', '<p>Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista de apontamentos numerada no Notion (ou aprovação direta)</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Revisão estratégica — Marco Andolfato', 'Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.

Responsável: Marco Andolfato

Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais

Prazo referência: 4 horas a 1 dia útil

[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato', '<p>Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.</p><p>Responsável: Marco Andolfato</p><p>Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais</p><p>Prazo referência: 4 horas a 1 dia útil</p><p><strong>[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Envio ao cliente e gestão de feedback', 'Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).

Responsável: Atendimento/Gestor de Conta

Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado

Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis', '<p>Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).</p><p>Responsável: Atendimento/Gestor de Conta</p><p>Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado</p><p>Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aplicação de ajustes e controle de versões', 'Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.

Responsável: Designer + Atendimento

Output: Arquivo revisado versionado no Drive, registro no Notion atualizado

Prazo referência: 1–2 dias úteis por rodada

[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.', '<p>Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.</p><p>Responsável: Designer + Atendimento</p><p>Output: Arquivo revisado versionado no Drive, registro no Notion atualizado</p><p>Prazo referência: 1–2 dias úteis por rodada</p><p><strong>[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação final e liberação para produção', 'Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.

Responsável: Atendimento + Nelson

Output: Aprovação formal registrada, material liberado para produção ou publicação

Prazo referência: 0,5 dia útil', '<p>Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.</p><p>Responsável: Atendimento + Nelson</p><p>Output: Aprovação formal registrada, material liberado para produção ou publicação</p><p>Prazo referência: 0,5 dia útil</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.', '<p>Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.', '<p>Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.', '<p>Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.', '<p>Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim', '<p>Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.', '<p>Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-015: Gestão de Marca do Cliente ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Marca do Cliente',
    'tbo-brd-015-gestao-de-marca-do-cliente',
    'branding',
    'checklist',
    'Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.',
    'Standard Operating Procedure

Gestão de Marca do Cliente

Código

TBO-BRD-015

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

Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.

  2. Escopo

2.1 O que está coberto

Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.

2.2 Exclusões

Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Nelson (PO Branding)

Brand Guardian — responsável pela consistência da marca do cliente

Responsável



Designer Senior (Branding)

Suporte técnico em auditorias e atualizações

Responsável



Marco Andolfato

Aprovação de decisões estratégicas de marca

Aprovador



Cliente/Incorporadora

Aderência às diretrizes e reporte de novas demandas



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.

4.2 Ferramentas e Acessos

Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.



  5. Procedimento Passo a Passo

5.1. Dashboard de saúde da marca

Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.

Responsável: Nelson (PO Branding)

Output: Dashboard atualizado no Notion, revisado mensalmente

Prazo referência: Atualização mensal (recorrente)

5.2. Auditoria trimestral de aplicações

Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.

Responsável: Nelson + Designer Senior

Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir

Prazo referência: 5 dias úteis (a cada trimestre)

[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.

5.3. Atualização do manual de identidade visual

Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.

Responsável: Designer Senior + Nelson

Output: Manual atualizado versionado no Drive, comunicado ao cliente

Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização

[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente

5.4. Gestão de solicitações de uso por terceiros

Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.

Responsável: Nelson (PO Branding)

Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros

Prazo referência: 2 dias úteis por solicitação

5.5. Treinamento e capacitação da equipe do cliente

Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.

Responsável: Nelson (PO Branding)

Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue

Prazo referência: Anual (ou por lançamento)

5.6. Relatório semestral de marca

Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.

Responsável: Nelson + Marco Andolfato

Output: Relatório semestral entregue ao cliente em PDF

Prazo referência: 5 dias úteis (a cada semestre)

[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.

6.2 Erros Comuns a Evitar

Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.

  7. Ferramentas e Templates

Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.

  8. SLAs e Prazos

Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.

  9. Fluxograma

Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim

  10. Glossário

Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Marca do Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-015</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.</p><p><strong>2.2 Exclusões</strong></p><p>Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Brand Guardian — responsável pela consistência da marca do cliente</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Suporte técnico em auditorias e atualizações</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação de decisões estratégicas de marca</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aderência às diretrizes e reporte de novas demandas</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Dashboard de saúde da marca</strong></p><p>Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Dashboard atualizado no Notion, revisado mensalmente</p><p>Prazo referência: Atualização mensal (recorrente)</p><p><strong>5.2. Auditoria trimestral de aplicações</strong></p><p>Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.</p><p>Responsável: Nelson + Designer Senior</p><p>Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir</p><p>Prazo referência: 5 dias úteis (a cada trimestre)</p><p><strong>[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.</strong></p><p><strong>5.3. Atualização do manual de identidade visual</strong></p><p>Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: Manual atualizado versionado no Drive, comunicado ao cliente</p><p>Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente</strong></p><p><strong>5.4. Gestão de solicitações de uso por terceiros</strong></p><p>Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros</p><p>Prazo referência: 2 dias úteis por solicitação</p><p><strong>5.5. Treinamento e capacitação da equipe do cliente</strong></p><p>Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue</p><p>Prazo referência: Anual (ou por lançamento)</p><p><strong>5.6. Relatório semestral de marca</strong></p><p>Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Relatório semestral entregue ao cliente em PDF</p><p>Prazo referência: 5 dias úteis (a cada semestre)</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim</p><p><strong>  10. Glossário</strong></p><p>Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    13,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-015
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.', '<p>Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.', '<p>Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.', '<p>Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Nelson (PO Branding)

Brand Guardian — responsável pela consistência da marca do cliente

Responsável

Designer Senior (Branding)

Suporte técnico em auditorias e atualizações

Responsável

Marco Andolfato

Aprovação de decisões estratégicas de marca

Aprovador

Cliente/Incorporadora

Aderência às diretrizes e reporte de novas demandas

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Brand Guardian — responsável pela consistência da marca do cliente</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Suporte técnico em auditorias e atualizações</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação de decisões estratégicas de marca</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aderência às diretrizes e reporte de novas demandas</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.', '<p>Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.', '<p>Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Dashboard de saúde da marca', 'Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.

Responsável: Nelson (PO Branding)

Output: Dashboard atualizado no Notion, revisado mensalmente

Prazo referência: Atualização mensal (recorrente)', '<p>Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Dashboard atualizado no Notion, revisado mensalmente</p><p>Prazo referência: Atualização mensal (recorrente)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Auditoria trimestral de aplicações', 'Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.

Responsável: Nelson + Designer Senior

Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir

Prazo referência: 5 dias úteis (a cada trimestre)

[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.', '<p>Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.</p><p>Responsável: Nelson + Designer Senior</p><p>Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir</p><p>Prazo referência: 5 dias úteis (a cada trimestre)</p><p><strong>[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Atualização do manual de identidade visual', 'Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.

Responsável: Designer Senior + Nelson

Output: Manual atualizado versionado no Drive, comunicado ao cliente

Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização

[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente', '<p>Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: Manual atualizado versionado no Drive, comunicado ao cliente</p><p>Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gestão de solicitações de uso por terceiros', 'Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.

Responsável: Nelson (PO Branding)

Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros

Prazo referência: 2 dias úteis por solicitação', '<p>Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros</p><p>Prazo referência: 2 dias úteis por solicitação</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Treinamento e capacitação da equipe do cliente', 'Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.

Responsável: Nelson (PO Branding)

Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue

Prazo referência: Anual (ou por lançamento)', '<p>Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue</p><p>Prazo referência: Anual (ou por lançamento)</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Relatório semestral de marca', 'Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.

Responsável: Nelson + Marco Andolfato

Output: Relatório semestral entregue ao cliente em PDF

Prazo referência: 5 dias úteis (a cada semestre)

[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente', '<p>Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Relatório semestral entregue ao cliente em PDF</p><p>Prazo referência: 5 dias úteis (a cada semestre)</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.', '<p>Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.', '<p>Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.', '<p>Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.', '<p>Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim', '<p>Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.', '<p>Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-001: Diagnóstico de Marketing ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Diagnóstico de Marketing',
    'tbo-mkt-001-diagnostico-de-marketing',
    'marketing',
    'checklist',
    'Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.',
    'Standard Operating Procedure

Diagnóstico de Marketing

Código

TBO-MKT-001

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

Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.

  2. Escopo

2.1 O que está coberto

Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.

2.2 Exclusões

Criação de materiais, execução de campanhas, definição de budgets de mídia.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Conduz briefing e análise

Marco Andolfato

Diretor de Criação, BU Estratégia

Analista de Marketing

Coleta dados, pesquisa concorrência

Rafa / Lucca

Cliente

BU Estratégia

Valida posicionamento e persona

Marco Andolfato

Rafa / Lucca

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).

4.2 Ferramentas e Acessos

Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.



  5. Procedimento Passo a Passo

5.1. Briefing Estruturado

Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.

Responsável: Rafa / Lucca

Output: Briefing preenchido e validado pelo cliente.

Prazo referência: D+2 após kickoff

5.2. Pesquisa de Mercado e Concorrência

Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.

Responsável: Analista de Marketing

Output: Relatório de benchmarking com prints e análise qualitativa.

Prazo referência: D+5

5.3. Análise de Público-Alvo

Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.

Prazo referência: D+7

5.4. Auditoria de Ativos Digitais

Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.

Responsável: Analista de Marketing

Output: Planilha de auditoria com notas por canal e gaps identificados.

Prazo referência: D+7

5.5. Consolidação do Diagnóstico

Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.

Responsável: Rafa / Lucca

Output: Documento de Diagnóstico de Marketing (PDF + slides).

Prazo referência: D+10

5.6. Apresentação ao Cliente

Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.

Prazo referência: D+12

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.

6.2 Erros Comuns a Evitar

Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.

  7. Ferramentas e Templates

Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).

  8. SLAs e Prazos

Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.

  9. Fluxograma

Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim

  10. Glossário

CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Diagnóstico de Marketing</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-MKT-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Marketing</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Rafa (PO Marketing)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.</p><p><strong>2.2 Exclusões</strong></p><p>Criação de materiais, execução de campanhas, definição de budgets de mídia.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Conduz briefing e análise</p></td><td><p>Marco Andolfato</p></td><td><p>Diretor de Criação, BU Estratégia</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, pesquisa concorrência</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Estratégia</p></td><td><p>Valida posicionamento e persona</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing Estruturado</strong></p><p>Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing preenchido e validado pelo cliente.</p><p>Prazo referência: D+2 após kickoff</p><p><strong>5.2. Pesquisa de Mercado e Concorrência</strong></p><p>Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de benchmarking com prints e análise qualitativa.</p><p>Prazo referência: D+5</p><p><strong>5.3. Análise de Público-Alvo</strong></p><p>Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.</p><p>Responsável: Rafa / Lucca + BU Estratégia</p><p>Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.</p><p>Prazo referência: D+7</p><p><strong>5.4. Auditoria de Ativos Digitais</strong></p><p>Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de auditoria com notas por canal e gaps identificados.</p><p>Prazo referência: D+7</p><p><strong>5.5. Consolidação do Diagnóstico</strong></p><p>Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.</p><p>Responsável: Rafa / Lucca</p><p>Output: Documento de Diagnóstico de Marketing (PDF + slides).</p><p>Prazo referência: D+10</p><p><strong>5.6. Apresentação ao Cliente</strong></p><p>Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.</p><p>Prazo referência: D+12</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim</p><p><strong>  10. Glossário</strong></p><p>CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marketing','campanha','digital','entrega','qualidade','cliente']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-MKT-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.', '<p>Realizar análise completa do cenário de marketing do cliente, do produto imobiliário e do mercado local para embasar o planejamento estratégico de comunicação e mídia.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.', '<p>Briefing com cliente, análise de posicionamento, pesquisa de concorrência, análise de público-alvo, auditoria de ativos digitais existentes e mapeamento de oportunidades.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de materiais, execução de campanhas, definição de budgets de mídia.', '<p>Criação de materiais, execução de campanhas, definição de budgets de mídia.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Rafa / Lucca

Conduz briefing e análise

Marco Andolfato

Diretor de Criação, BU Estratégia

Analista de Marketing

Coleta dados, pesquisa concorrência

Rafa / Lucca

Cliente

BU Estratégia

Valida posicionamento e persona

Marco Andolfato

Rafa / Lucca', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Rafa / Lucca</p></td><td><p>Conduz briefing e análise</p></td><td><p>Marco Andolfato</p></td><td><p>Diretor de Criação, BU Estratégia</p></td></tr><tr><td><p>Analista de Marketing</p></td><td><p>Coleta dados, pesquisa concorrência</p></td><td><p>Rafa / Lucca</p></td><td><p>Cliente</p></td></tr><tr><td><p>BU Estratégia</p></td><td><p>Valida posicionamento e persona</p></td><td><p>Marco Andolfato</p></td><td><p>Rafa / Lucca</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).', '<p>Contrato assinado; briefing inicial do cliente; materiais do produto (memorial descritivo, planta, localização); histórico de campanhas anteriores (se houver).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.', '<p>Google Analytics, Meta Business Suite, Semrush, Google Trends, Hotjar (se site existir), planilha de diagnóstico TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing Estruturado', 'Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.

Responsável: Rafa / Lucca

Output: Briefing preenchido e validado pelo cliente.

Prazo referência: D+2 após kickoff', '<p>Ação: Realizar sessão de briefing com cliente usando template TBO: produto, público, concorrentes, diferenciais, histórico, expectativas de VGV e prazo de lançamento.</p><p>Responsável: Rafa / Lucca</p><p>Output: Briefing preenchido e validado pelo cliente.</p><p>Prazo referência: D+2 após kickoff</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Pesquisa de Mercado e Concorrência', 'Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.

Responsável: Analista de Marketing

Output: Relatório de benchmarking com prints e análise qualitativa.

Prazo referência: D+5', '<p>Ação: Mapear 5-8 concorrentes diretos na região. Analisar posicionamento, canais, criativos, estimativa de investimento em mídia e diferenciais comunicados.</p><p>Responsável: Analista de Marketing</p><p>Output: Relatório de benchmarking com prints e análise qualitativa.</p><p>Prazo referência: D+5</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Análise de Público-Alvo', 'Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.

Responsável: Rafa / Lucca + BU Estratégia

Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.

Prazo referência: D+7', '<p>Ação: Cruzar dados demográficos do bairro (IBGE), perfil do produto e dados do cliente para construir personas primária e secundária. Validar com BU Estratégia.</p><p>Responsável: Rafa / Lucca + BU Estratégia</p><p>Output: Documento de personas com dores, desejos, canais preferidos e jornada de compra imobiliária.</p><p>Prazo referência: D+7</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Auditoria de Ativos Digitais', 'Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.

Responsável: Analista de Marketing

Output: Planilha de auditoria com notas por canal e gaps identificados.

Prazo referência: D+7', '<p>Ação: Auditar site, redes sociais, base de e-mails e campanhas anteriores do cliente. Avaliar performance histórica (CTR, CPL, taxa de conversão) se dados disponíveis.</p><p>Responsável: Analista de Marketing</p><p>Output: Planilha de auditoria com notas por canal e gaps identificados.</p><p>Prazo referência: D+7</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Consolidação do Diagnóstico', 'Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.

Responsável: Rafa / Lucca

Output: Documento de Diagnóstico de Marketing (PDF + slides).

Prazo referência: D+10', '<p>Ação: Compilar achados em documento de diagnóstico: SWOT de marketing, oportunidades por canal, posicionamento recomendado, alertas e riscos.</p><p>Responsável: Rafa / Lucca</p><p>Output: Documento de Diagnóstico de Marketing (PDF + slides).</p><p>Prazo referência: D+10</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Apresentação ao Cliente', 'Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.

Responsável: Rafa / Lucca + Marco Andolfato

Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.

Prazo referência: D+12', '<p>Ação: Apresentar diagnóstico ao cliente em reunião formal. Coletar validações, ajustes e alinhamentos estratégicos antes de avançar ao Plano de Marketing.</p><p>Responsável: Rafa / Lucca + Marco Andolfato</p><p>Output: Diagnóstico aprovado com ata de reunião e registro de ajustes.</p><p>Prazo referência: D+12</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.', '<p>Briefing com todas as seções preenchidas; mínimo 5 concorrentes mapeados; personas validadas pela BU Estratégia; auditoria digital com dados (não apenas capturas de tela); diagnóstico revisado por Marco antes da apresentação.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.', '<p>Diagnóstico genérico sem especificidade do produto ou região; personas baseadas apenas em feeling sem dados; concorrentes mapeados fora do raio de influência do empreendimento; auditoria sem análise de performance histórica quando dados existem.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).', '<p>Semrush (análise de domínio e concorrência), Google Trends, Meta Ad Library, Google Analytics, Hotjar, planilha de diagnóstico TBO, Notion (documentação).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.', '<p>Briefing: até D+2; diagnóstico completo: até D+12 após kickoff; aprovação do cliente: até D+15.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim', '<p>Início → Kickoff + Briefing → Pesquisa de Concorrência → Construção de Personas → Auditoria Digital → Consolidação SWOT → Revisão interna (Marco) → Apresentação ao cliente → Aprovação → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.', '<p>CPL: Custo por Lead. VGV: Valor Geral de Vendas. Persona: representação semifictícia do cliente ideal. SWOT: análise de forças, fraquezas, oportunidades e ameaças. CTR: Click-Through Rate.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-MKT-002: Plano de Marketing ──
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