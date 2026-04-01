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
END $$;