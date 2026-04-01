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
    'Identidade Visual Logo Manual KVs',
    'tbo-brd-002-identidade-visual-logo-manual-kvs',
    'branding',
    'checklist',
    'Identidade Visual (Logo + Manual + KVs)',
    'Standard Operating Procedure

Identidade Visual (Logo + Manual + KVs)

Código

TBO-BRD-002

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

Criar e entregar a identidade visual completa do empreendimento — logotipo, paleta, tipografia, elementos gráficos e KVs (Key Visuals) — com manual de marca aplicado ao mercado imobiliário.

  2. Escopo

2.1 O que está coberto

Desenvolvimento do logotipo, sistema visual (cores, tipografia, texturas, ícones), Key Visuals principais, manual de identidade visual e orientações de aplicação em materiais do empreendimento.

2.2 Exclusões

Produção de materiais finais (folders, tapume, book) cobertos em SOPs específicos. Animação de marca (Motion Design). Identidade digital (coberta no módulo Digital).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Criação do sistema visual e entrega de arquivos

Responsável



Nelson (PO Branding)

Direção criativa, curadoria e alinhamento estratégico

Aprovador



Marco Andolfato

Aprovação final antes de cliente

Aprovador



Cliente/Incorporadora

Aprovação do conceito e identidade



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Nome do empreendimento aprovado (SOP BRD-01), briefing de posicionamento, moodboard de referências visuais, segmento (econômico, médio, alto padrão, luxo), conceito do empreendimento.

4.2 Ferramentas e Acessos

Adobe Illustrator (logotipo e sistema), Adobe InDesign (manual), Adobe Photoshop (KVs e composições), Figma (apresentação e protótipo digital), Google Drive (entrega de arquivos).



  5. Procedimento Passo a Passo

5.1. Definição de direcionamentos criativos

Ação: Com base no briefing e naming aprovado, definir 2 a 3 direcionamentos criativos distintos (ex: minimalista contemporâneo, sofisticado clássico, orgânico natural). Para cada direcionamento: paleta de cores preliminar, referências de tipografia e conceito visual.

Responsável: Designer Senior + Nelson

Output: Painel de direcionamentos (moodboard estruturado por caminho criativo)

Prazo referência: 2 dias úteis

5.2. Desenvolvimento de logotipos

Ação: Criar 2 a 3 opções de logotipo para cada direcionamento aprovado internamente. Incluir variações: versão principal, versão reduzida (símbolo), versão horizontal e vertical. Aplicar em fundos claros e escuros.

Responsável: Designer Senior

Output: Arquivo de apresentação com 6–9 opções de logo em contexto real

Prazo referência: 4 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente

5.3. Apresentação ao cliente — 1ª rodada

Ação: Apresentar os direcionamentos e logotipos em deck estruturado, mostrando aplicações realistas (fachada, material impresso, digital). Coletar feedback estruturado via formulário ou reunião gravada.

Responsável: Nelson (PO Branding)

Output: Ata de reunião com feedback documentado, direcionamento escolhido

Prazo referência: Agendado com cliente (máx. 5 dias úteis após desenvolvimento)

[DECISÃO] Cliente escolhe direcionamento? Sim → refinamento. Não → nova rodada com ajustes (máx. 2 rodadas).

5.4. Refinamento e sistema visual completo

Ação: Com o direcionamento aprovado, desenvolver o sistema visual completo: logotipo refinado em todas as variações, paleta de cores (primária, secundária, neutras, gradientes se houver), tipografia (fontes primária e secundária com hierarquia), texturas ou grafismos, padrão de foto/imagem.

Responsável: Designer Senior

Output: Sistema visual completo em Illustrator + guia de uso preliminar

Prazo referência: 3 dias úteis

5.5. Key Visuals (KVs) principais

Ação: Criar os KVs conceituais do empreendimento — composições visuais de alto impacto que sintetizam a identidade e serão a base de todos os materiais. Mínimo: KV horizontal (banner/tapume), KV vertical (outdoor/mídia social), KV quadrado (redes sociais).

Responsável: Designer Senior

Output: 3–5 KVs entregues em alta resolução (print + digital)

Prazo referência: 3 dias úteis

5.6. Manual de Identidade Visual

Ação: Produzir manual completo em InDesign com: uso correto do logotipo, paleta de cores com código HEX/RGB/CMYK/Pantone, tipografia com hierarquia, exemplos de aplicação (certo/errado), KVs, orientações de fotografia, tom visual.

Responsável: Designer Senior

Output: Manual em PDF (interativo) e INDD editável

Prazo referência: 3 dias úteis

5.7. Aprovação final e entrega de arquivos

Ação: Marco Andolfato revisa entrega completa. Organizar pasta de entrega no Google Drive: arquivos fonte (AI, INDD), exportações (PNG, PDF, SVG, EPS), manual PDF, KVs. Entregar ao cliente com e-mail de instrução de uso.

Responsável: Marco Andolfato / Nelson

Output: Pasta de entrega organizada, e-mail de entrega ao cliente, aprovação documentada

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato assina entrega final

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Logo funciona em P&B e colorido; funciona em tamanhos pequenos (favicon 32x32); paleta com todos os códigos de cor; tipografia com licença de uso verificada; manual com exemplos de aplicação errada (proteção); KVs entregues em alta resolução para print (300dpi mínimo); arquivos fonte organizados no Drive.

6.2 Erros Comuns a Evitar

Usar fontes sem licença comercial; entregar logotipo apenas em formato rasterizado (PNG) sem vetorial (AI/SVG); KVs com textos embutidos sem camadas editáveis; manual sem exemplos de aplicação incorreta; paleta sem código CMYK para impressão.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (apresentação), Google Drive (entrega), Font Squirrel/Adobe Fonts (licença tipográfica).

  8. SLAs e Prazos

Direcionamentos criativos: 2 dias úteis. Desenvolvimento de logos: 4 dias úteis. Sistema visual completo: 3 dias úteis. KVs: 3 dias úteis. Manual: 3 dias úteis. Total estimado (sem revisões cliente): 15 dias úteis. Com revisões: até 25 dias úteis.

  9. Fluxograma

Início → Briefing + naming aprovado → Definir direcionamentos → [APROVAÇÃO INTERNA NELSON] → Desenvolver logotipos → Apresentar ao cliente → [CLIENTE APROVA DIRECIONAMENTO?] → Não: ajustar (máx. 2x) → Sim: Refinamento e sistema visual → Criar KVs → Produzir manual → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar arquivos → Entregar ao cliente → Fim

  10. Glossário

KV (Key Visual): composição visual central que define o padrão estético de um empreendimento, usada como base para todos os materiais. Manual de Identidade Visual: documento que normatiza o uso correto da marca. Pantone: sistema de cores padrão para impressão de alta fidelidade. Vetor: formato de imagem baseado em matemática, escalável sem perda de qualidade (AI, SVG, EPS).



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Identidade Visual (Logo + Manual + KVs)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Criar e entregar a identidade visual completa do empreendimento — logotipo, paleta, tipografia, elementos gráficos e KVs (Key Visuals) — com manual de marca aplicado ao mercado imobiliário.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Desenvolvimento do logotipo, sistema visual (cores, tipografia, texturas, ícones), Key Visuals principais, manual de identidade visual e orientações de aplicação em materiais do empreendimento.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de materiais finais (folders, tapume, book) cobertos em SOPs específicos. Animação de marca (Motion Design). Identidade digital (coberta no módulo Digital).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Criação do sistema visual e entrega de arquivos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa, curadoria e alinhamento estratégico</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes de cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aprovação do conceito e identidade</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Nome do empreendimento aprovado (SOP BRD-01), briefing de posicionamento, moodboard de referências visuais, segmento (econômico, médio, alto padrão, luxo), conceito do empreendimento.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Illustrator (logotipo e sistema), Adobe InDesign (manual), Adobe Photoshop (KVs e composições), Figma (apresentação e protótipo digital), Google Drive (entrega de arquivos).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Definição de direcionamentos criativos</strong></p><p>Ação: Com base no briefing e naming aprovado, definir 2 a 3 direcionamentos criativos distintos (ex: minimalista contemporâneo, sofisticado clássico, orgânico natural). Para cada direcionamento: paleta de cores preliminar, referências de tipografia e conceito visual.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: Painel de direcionamentos (moodboard estruturado por caminho criativo)</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.2. Desenvolvimento de logotipos</strong></p><p>Ação: Criar 2 a 3 opções de logotipo para cada direcionamento aprovado internamente. Incluir variações: versão principal, versão reduzida (símbolo), versão horizontal e vertical. Aplicar em fundos claros e escuros.</p><p>Responsável: Designer Senior</p><p>Output: Arquivo de apresentação com 6–9 opções de logo em contexto real</p><p>Prazo referência: 4 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente</strong></p><p><strong>5.3. Apresentação ao cliente — 1ª rodada</strong></p><p>Ação: Apresentar os direcionamentos e logotipos em deck estruturado, mostrando aplicações realistas (fachada, material impresso, digital). Coletar feedback estruturado via formulário ou reunião gravada.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Ata de reunião com feedback documentado, direcionamento escolhido</p><p>Prazo referência: Agendado com cliente (máx. 5 dias úteis após desenvolvimento)</p><p><strong>[DECISÃO] Cliente escolhe direcionamento? Sim → refinamento. Não → nova rodada com ajustes (máx. 2 rodadas).</strong></p><p><strong>5.4. Refinamento e sistema visual completo</strong></p><p>Ação: Com o direcionamento aprovado, desenvolver o sistema visual completo: logotipo refinado em todas as variações, paleta de cores (primária, secundária, neutras, gradientes se houver), tipografia (fontes primária e secundária com hierarquia), texturas ou grafismos, padrão de foto/imagem.</p><p>Responsável: Designer Senior</p><p>Output: Sistema visual completo em Illustrator + guia de uso preliminar</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.5. Key Visuals (KVs) principais</strong></p><p>Ação: Criar os KVs conceituais do empreendimento — composições visuais de alto impacto que sintetizam a identidade e serão a base de todos os materiais. Mínimo: KV horizontal (banner/tapume), KV vertical (outdoor/mídia social), KV quadrado (redes sociais).</p><p>Responsável: Designer Senior</p><p>Output: 3–5 KVs entregues em alta resolução (print + digital)</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.6. Manual de Identidade Visual</strong></p><p>Ação: Produzir manual completo em InDesign com: uso correto do logotipo, paleta de cores com código HEX/RGB/CMYK/Pantone, tipografia com hierarquia, exemplos de aplicação (certo/errado), KVs, orientações de fotografia, tom visual.</p><p>Responsável: Designer Senior</p><p>Output: Manual em PDF (interativo) e INDD editável</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.7. Aprovação final e entrega de arquivos</strong></p><p>Ação: Marco Andolfato revisa entrega completa. Organizar pasta de entrega no Google Drive: arquivos fonte (AI, INDD), exportações (PNG, PDF, SVG, EPS), manual PDF, KVs. Entregar ao cliente com e-mail de instrução de uso.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Pasta de entrega organizada, e-mail de entrega ao cliente, aprovação documentada</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Marco Andolfato assina entrega final</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Logo funciona em P&amp;B e colorido; funciona em tamanhos pequenos (favicon 32x32); paleta com todos os códigos de cor; tipografia com licença de uso verificada; manual com exemplos de aplicação errada (proteção); KVs entregues em alta resolução para print (300dpi mínimo); arquivos fonte organizados no Drive.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Usar fontes sem licença comercial; entregar logotipo apenas em formato rasterizado (PNG) sem vetorial (AI/SVG); KVs com textos embutidos sem camadas editáveis; manual sem exemplos de aplicação incorreta; paleta sem código CMYK para impressão.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (apresentação), Google Drive (entrega), Font Squirrel/Adobe Fonts (licença tipográfica).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Direcionamentos criativos: 2 dias úteis. Desenvolvimento de logos: 4 dias úteis. Sistema visual completo: 3 dias úteis. KVs: 3 dias úteis. Manual: 3 dias úteis. Total estimado (sem revisões cliente): 15 dias úteis. Com revisões: até 25 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing + naming aprovado → Definir direcionamentos → [APROVAÇÃO INTERNA NELSON] → Desenvolver logotipos → Apresentar ao cliente → [CLIENTE APROVA DIRECIONAMENTO?] → Não: ajustar (máx. 2x) → Sim: Refinamento e sistema visual → Criar KVs → Produzir manual → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar arquivos → Entregar ao cliente → Fim</p><p><strong>  10. Glossário</strong></p><p>KV (Key Visual): composição visual central que define o padrão estético de um empreendimento, usada como base para todos os materiais. Manual de Identidade Visual: documento que normatiza o uso correto da marca. Pantone: sistema de cores padrão para impressão de alta fidelidade. Vetor: formato de imagem baseado em matemática, escalável sem perda de qualidade (AI, SVG, EPS).</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar e entregar a identidade visual completa do empreendimento — logotipo, paleta, tipografia, elementos gráficos e KVs (Key Visuals) — com manual de marca aplicado ao mercado imobiliário.', '<p>Criar e entregar a identidade visual completa do empreendimento — logotipo, paleta, tipografia, elementos gráficos e KVs (Key Visuals) — com manual de marca aplicado ao mercado imobiliário.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Desenvolvimento do logotipo, sistema visual (cores, tipografia, texturas, ícones), Key Visuals principais, manual de identidade visual e orientações de aplicação em materiais do empreendimento.', '<p>Desenvolvimento do logotipo, sistema visual (cores, tipografia, texturas, ícones), Key Visuals principais, manual de identidade visual e orientações de aplicação em materiais do empreendimento.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de materiais finais (folders, tapume, book) cobertos em SOPs específicos. Animação de marca (Motion Design). Identidade digital (coberta no módulo Digital).', '<p>Produção de materiais finais (folders, tapume, book) cobertos em SOPs específicos. Animação de marca (Motion Design). Identidade digital (coberta no módulo Digital).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Criação do sistema visual e entrega de arquivos

Responsável

Nelson (PO Branding)

Direção criativa, curadoria e alinhamento estratégico

Aprovador

Marco Andolfato

Aprovação final antes de cliente

Aprovador

Cliente/Incorporadora

Aprovação do conceito e identidade

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Criação do sistema visual e entrega de arquivos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa, curadoria e alinhamento estratégico</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes de cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Aprovação do conceito e identidade</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Nome do empreendimento aprovado (SOP BRD-01), briefing de posicionamento, moodboard de referências visuais, segmento (econômico, médio, alto padrão, luxo), conceito do empreendimento.', '<p>Nome do empreendimento aprovado (SOP BRD-01), briefing de posicionamento, moodboard de referências visuais, segmento (econômico, médio, alto padrão, luxo), conceito do empreendimento.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (logotipo e sistema), Adobe InDesign (manual), Adobe Photoshop (KVs e composições), Figma (apresentação e protótipo digital), Google Drive (entrega de arquivos).', '<p>Adobe Illustrator (logotipo e sistema), Adobe InDesign (manual), Adobe Photoshop (KVs e composições), Figma (apresentação e protótipo digital), Google Drive (entrega de arquivos).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Definição de direcionamentos criativos', 'Ação: Com base no briefing e naming aprovado, definir 2 a 3 direcionamentos criativos distintos (ex: minimalista contemporâneo, sofisticado clássico, orgânico natural). Para cada direcionamento: paleta de cores preliminar, referências de tipografia e conceito visual.

Responsável: Designer Senior + Nelson

Output: Painel de direcionamentos (moodboard estruturado por caminho criativo)

Prazo referência: 2 dias úteis', '<p>Ação: Com base no briefing e naming aprovado, definir 2 a 3 direcionamentos criativos distintos (ex: minimalista contemporâneo, sofisticado clássico, orgânico natural). Para cada direcionamento: paleta de cores preliminar, referências de tipografia e conceito visual.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: Painel de direcionamentos (moodboard estruturado por caminho criativo)</p><p>Prazo referência: 2 dias úteis</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Desenvolvimento de logotipos', 'Ação: Criar 2 a 3 opções de logotipo para cada direcionamento aprovado internamente. Incluir variações: versão principal, versão reduzida (símbolo), versão horizontal e vertical. Aplicar em fundos claros e escuros.

Responsável: Designer Senior

Output: Arquivo de apresentação com 6–9 opções de logo em contexto real

Prazo referência: 4 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente', '<p>Ação: Criar 2 a 3 opções de logotipo para cada direcionamento aprovado internamente. Incluir variações: versão principal, versão reduzida (símbolo), versão horizontal e vertical. Aplicar em fundos claros e escuros.</p><p>Responsável: Designer Senior</p><p>Output: Arquivo de apresentação com 6–9 opções de logo em contexto real</p><p>Prazo referência: 4 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Apresentação ao cliente — 1ª rodada', 'Ação: Apresentar os direcionamentos e logotipos em deck estruturado, mostrando aplicações realistas (fachada, material impresso, digital). Coletar feedback estruturado via formulário ou reunião gravada.

Responsável: Nelson (PO Branding)

Output: Ata de reunião com feedback documentado, direcionamento escolhido

Prazo referência: Agendado com cliente (máx. 5 dias úteis após desenvolvimento)

[DECISÃO] Cliente escolhe direcionamento? Sim → refinamento. Não → nova rodada com ajustes (máx. 2 rodadas).', '<p>Ação: Apresentar os direcionamentos e logotipos em deck estruturado, mostrando aplicações realistas (fachada, material impresso, digital). Coletar feedback estruturado via formulário ou reunião gravada.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Ata de reunião com feedback documentado, direcionamento escolhido</p><p>Prazo referência: Agendado com cliente (máx. 5 dias úteis após desenvolvimento)</p><p><strong>[DECISÃO] Cliente escolhe direcionamento? Sim → refinamento. Não → nova rodada com ajustes (máx. 2 rodadas).</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Refinamento e sistema visual completo', 'Ação: Com o direcionamento aprovado, desenvolver o sistema visual completo: logotipo refinado em todas as variações, paleta de cores (primária, secundária, neutras, gradientes se houver), tipografia (fontes primária e secundária com hierarquia), texturas ou grafismos, padrão de foto/imagem.

Responsável: Designer Senior

Output: Sistema visual completo em Illustrator + guia de uso preliminar

Prazo referência: 3 dias úteis', '<p>Ação: Com o direcionamento aprovado, desenvolver o sistema visual completo: logotipo refinado em todas as variações, paleta de cores (primária, secundária, neutras, gradientes se houver), tipografia (fontes primária e secundária com hierarquia), texturas ou grafismos, padrão de foto/imagem.</p><p>Responsável: Designer Senior</p><p>Output: Sistema visual completo em Illustrator + guia de uso preliminar</p><p>Prazo referência: 3 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Key Visuals (KVs) principais', 'Ação: Criar os KVs conceituais do empreendimento — composições visuais de alto impacto que sintetizam a identidade e serão a base de todos os materiais. Mínimo: KV horizontal (banner/tapume), KV vertical (outdoor/mídia social), KV quadrado (redes sociais).

Responsável: Designer Senior

Output: 3–5 KVs entregues em alta resolução (print + digital)

Prazo referência: 3 dias úteis', '<p>Ação: Criar os KVs conceituais do empreendimento — composições visuais de alto impacto que sintetizam a identidade e serão a base de todos os materiais. Mínimo: KV horizontal (banner/tapume), KV vertical (outdoor/mídia social), KV quadrado (redes sociais).</p><p>Responsável: Designer Senior</p><p>Output: 3–5 KVs entregues em alta resolução (print + digital)</p><p>Prazo referência: 3 dias úteis</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Manual de Identidade Visual', 'Ação: Produzir manual completo em InDesign com: uso correto do logotipo, paleta de cores com código HEX/RGB/CMYK/Pantone, tipografia com hierarquia, exemplos de aplicação (certo/errado), KVs, orientações de fotografia, tom visual.

Responsável: Designer Senior

Output: Manual em PDF (interativo) e INDD editável

Prazo referência: 3 dias úteis', '<p>Ação: Produzir manual completo em InDesign com: uso correto do logotipo, paleta de cores com código HEX/RGB/CMYK/Pantone, tipografia com hierarquia, exemplos de aplicação (certo/errado), KVs, orientações de fotografia, tom visual.</p><p>Responsável: Designer Senior</p><p>Output: Manual em PDF (interativo) e INDD editável</p><p>Prazo referência: 3 dias úteis</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.7. Aprovação final e entrega de arquivos', 'Ação: Marco Andolfato revisa entrega completa. Organizar pasta de entrega no Google Drive: arquivos fonte (AI, INDD), exportações (PNG, PDF, SVG, EPS), manual PDF, KVs. Entregar ao cliente com e-mail de instrução de uso.

Responsável: Marco Andolfato / Nelson

Output: Pasta de entrega organizada, e-mail de entrega ao cliente, aprovação documentada

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato assina entrega final', '<p>Ação: Marco Andolfato revisa entrega completa. Organizar pasta de entrega no Google Drive: arquivos fonte (AI, INDD), exportações (PNG, PDF, SVG, EPS), manual PDF, KVs. Entregar ao cliente com e-mail de instrução de uso.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Pasta de entrega organizada, e-mail de entrega ao cliente, aprovação documentada</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Marco Andolfato assina entrega final</strong></p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Logo funciona em P&B e colorido; funciona em tamanhos pequenos (favicon 32x32); paleta com todos os códigos de cor; tipografia com licença de uso verificada; manual com exemplos de aplicação errada (proteção); KVs entregues em alta resolução para print (300dpi mínimo); arquivos fonte organizados no Drive.', '<p>Logo funciona em P&amp;B e colorido; funciona em tamanhos pequenos (favicon 32x32); paleta com todos os códigos de cor; tipografia com licença de uso verificada; manual com exemplos de aplicação errada (proteção); KVs entregues em alta resolução para print (300dpi mínimo); arquivos fonte organizados no Drive.</p>', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Usar fontes sem licença comercial; entregar logotipo apenas em formato rasterizado (PNG) sem vetorial (AI/SVG); KVs com textos embutidos sem camadas editáveis; manual sem exemplos de aplicação incorreta; paleta sem código CMYK para impressão.', '<p>Usar fontes sem licença comercial; entregar logotipo apenas em formato rasterizado (PNG) sem vetorial (AI/SVG); KVs com textos embutidos sem camadas editáveis; manual sem exemplos de aplicação incorreta; paleta sem código CMYK para impressão.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (apresentação), Google Drive (entrega), Font Squirrel/Adobe Fonts (licença tipográfica).', '<p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (apresentação), Google Drive (entrega), Font Squirrel/Adobe Fonts (licença tipográfica).</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Direcionamentos criativos: 2 dias úteis. Desenvolvimento de logos: 4 dias úteis. Sistema visual completo: 3 dias úteis. KVs: 3 dias úteis. Manual: 3 dias úteis. Total estimado (sem revisões cliente): 15 dias úteis. Com revisões: até 25 dias úteis.', '<p>Direcionamentos criativos: 2 dias úteis. Desenvolvimento de logos: 4 dias úteis. Sistema visual completo: 3 dias úteis. KVs: 3 dias úteis. Manual: 3 dias úteis. Total estimado (sem revisões cliente): 15 dias úteis. Com revisões: até 25 dias úteis.</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing + naming aprovado → Definir direcionamentos → [APROVAÇÃO INTERNA NELSON] → Desenvolver logotipos → Apresentar ao cliente → [CLIENTE APROVA DIRECIONAMENTO?] → Não: ajustar (máx. 2x) → Sim: Refinamento e sistema visual → Criar KVs → Produzir manual → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar arquivos → Entregar ao cliente → Fim', '<p>Início → Briefing + naming aprovado → Definir direcionamentos → [APROVAÇÃO INTERNA NELSON] → Desenvolver logotipos → Apresentar ao cliente → [CLIENTE APROVA DIRECIONAMENTO?] → Não: ajustar (máx. 2x) → Sim: Refinamento e sistema visual → Criar KVs → Produzir manual → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar arquivos → Entregar ao cliente → Fim</p>', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'KV (Key Visual): composição visual central que define o padrão estético de um empreendimento, usada como base para todos os materiais. Manual de Identidade Visual: documento que normatiza o uso correto da marca. Pantone: sistema de cores padrão para impressão de alta fidelidade. Vetor: formato de imagem baseado em matemática, escalável sem perda de qualidade (AI, SVG, EPS).', '<p>KV (Key Visual): composição visual central que define o padrão estético de um empreendimento, usada como base para todos os materiais. Manual de Identidade Visual: documento que normatiza o uso correto da marca. Pantone: sistema de cores padrão para impressão de alta fidelidade. Vetor: formato de imagem baseado em matemática, escalável sem perda de qualidade (AI, SVG, EPS).</p>', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 19, 'step');

  -- ── TBO-BRD-003: Storytelling de Empreendimento ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Storytelling de Empreendimento',
    'tbo-brd-003-storytelling-de-empreendimento',
    'branding',
    'checklist',
    'Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.',
    'Standard Operating Procedure

Storytelling de Empreendimento

Código

TBO-BRD-003

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

Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.

  2. Escopo

2.1 O que está coberto

Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.

2.2 Exclusões

Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Conteúdo

Criação do storytelling e entrega de textos

Responsável



Nelson (PO Branding)

Alinhamento com identidade visual e conceito

Aprovador



Marco Andolfato

Aprovação estratégica final

Aprovador



Cliente/Incorporadora

Validação de dados técnicos e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.

4.2 Ferramentas e Acessos

Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).



  5. Procedimento Passo a Passo

5.1. Análise do empreendimento e do público

Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.

Responsável: Redator/Estrategista

Output: Mapa de diferenciais e insights do público (1 página)

Prazo referência: 1 dia útil

5.2. Definição do conceito narrativo central

Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.

Responsável: Redator + Nelson

Output: Conceito narrativo documentado com nome, descrição e pilares

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos

5.3. Manifesto de marca

Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').

Responsável: Redator/Estrategista

Output: Manifesto revisado e formatado

Prazo referência: 1 dia útil

5.4. Textos de posicionamento e elevator pitch

Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.

Responsável: Redator/Estrategista

Output: Documento com os 4 formatos de texto aprovados

Prazo referência: 2 dias úteis

5.5. Tom de voz e guia de vocabulário

Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).

Responsável: Redator/Estrategista + Nelson

Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca

Prazo referência: 1 dia útil

5.6. Aprovação final e integração ao manual

Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.

Responsável: Marco Andolfato / Nelson

Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto

Prazo referência: 1 dia útil após aprovação do cliente

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.

6.2 Erros Comuns a Evitar

Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.

  7. Ferramentas e Templates

Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).

  8. SLAs e Prazos

Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.

  9. Fluxograma

Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim

  10. Glossário

Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Storytelling de Empreendimento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.</p><p><strong>2.2 Exclusões</strong></p><p>Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Conteúdo</p></td><td><p>Criação do storytelling e entrega de textos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Alinhamento com identidade visual e conceito</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Validação de dados técnicos e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Análise do empreendimento e do público</strong></p><p>Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.</p><p>Responsável: Redator/Estrategista</p><p>Output: Mapa de diferenciais e insights do público (1 página)</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Definição do conceito narrativo central</strong></p><p>Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.</p><p>Responsável: Redator + Nelson</p><p>Output: Conceito narrativo documentado com nome, descrição e pilares</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos</strong></p><p><strong>5.3. Manifesto de marca</strong></p><p>Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').</p><p>Responsável: Redator/Estrategista</p><p>Output: Manifesto revisado e formatado</p><p>Prazo referência: 1 dia útil</p><p><strong>5.4. Textos de posicionamento e elevator pitch</strong></p><p>Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.</p><p>Responsável: Redator/Estrategista</p><p>Output: Documento com os 4 formatos de texto aprovados</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.5. Tom de voz e guia de vocabulário</strong></p><p>Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).</p><p>Responsável: Redator/Estrategista + Nelson</p><p>Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca</p><p>Prazo referência: 1 dia útil</p><p><strong>5.6. Aprovação final e integração ao manual</strong></p><p>Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto</p><p>Prazo referência: 1 dia útil após aprovação do cliente</p><p><strong>[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim</p><p><strong>  10. Glossário</strong></p><p>Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.', '<p>Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.', '<p>Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.', '<p>Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Conteúdo

Criação do storytelling e entrega de textos

Responsável

Nelson (PO Branding)

Alinhamento com identidade visual e conceito

Aprovador

Marco Andolfato

Aprovação estratégica final

Aprovador

Cliente/Incorporadora

Validação de dados técnicos e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Conteúdo</p></td><td><p>Criação do storytelling e entrega de textos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Alinhamento com identidade visual e conceito</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Validação de dados técnicos e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.', '<p>Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).', '<p>Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Análise do empreendimento e do público', 'Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.

Responsável: Redator/Estrategista

Output: Mapa de diferenciais e insights do público (1 página)

Prazo referência: 1 dia útil', '<p>Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.</p><p>Responsável: Redator/Estrategista</p><p>Output: Mapa de diferenciais e insights do público (1 página)</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição do conceito narrativo central', 'Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.

Responsável: Redator + Nelson

Output: Conceito narrativo documentado com nome, descrição e pilares

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos', '<p>Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.</p><p>Responsável: Redator + Nelson</p><p>Output: Conceito narrativo documentado com nome, descrição e pilares</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Manifesto de marca', 'Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').

Responsável: Redator/Estrategista

Output: Manifesto revisado e formatado

Prazo referência: 1 dia útil', '<p>Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').</p><p>Responsável: Redator/Estrategista</p><p>Output: Manifesto revisado e formatado</p><p>Prazo referência: 1 dia útil</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Textos de posicionamento e elevator pitch', 'Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.

Responsável: Redator/Estrategista

Output: Documento com os 4 formatos de texto aprovados

Prazo referência: 2 dias úteis', '<p>Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.</p><p>Responsável: Redator/Estrategista</p><p>Output: Documento com os 4 formatos de texto aprovados</p><p>Prazo referência: 2 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Tom de voz e guia de vocabulário', 'Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).

Responsável: Redator/Estrategista + Nelson

Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca

Prazo referência: 1 dia útil', '<p>Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).</p><p>Responsável: Redator/Estrategista + Nelson</p><p>Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca</p><p>Prazo referência: 1 dia útil</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação final e integração ao manual', 'Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.

Responsável: Marco Andolfato / Nelson

Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto

Prazo referência: 1 dia útil após aprovação do cliente

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação', '<p>Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto</p><p>Prazo referência: 1 dia útil após aprovação do cliente</p><p><strong>[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.', '<p>Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.', '<p>Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).', '<p>Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.', '<p>Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim', '<p>Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.', '<p>Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-004: Tapume PDV ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Tapume PDV',
    'tbo-brd-004-tapume-pdv',
    'branding',
    'checklist',
    'Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.',
    'Standard Operating Procedure

Tapume & PDV

Código

TBO-BRD-004

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

Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.

  2. Escopo

2.1 O que está coberto

Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.

2.2 Exclusões

Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Criação dos layouts e arte final

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final antes do cliente

Aprovador



Cliente/Incorporadora

Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.

4.2 Ferramentas e Acessos

Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).



  5. Procedimento Passo a Passo

5.1. Levantamento técnico

Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).

Responsável: Designer Senior + Atendimento

Output: Briefing técnico completo validado com fornecedor gráfico

Prazo referência: 1 dia útil

5.2. Definição de conceito visual e layout

Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.

Responsável: Designer Senior + Nelson

Output: 2 sketches/mockups de layout aprovados internamente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final

5.3. Desenvolvimento da arte final do tapume

Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.

Responsável: Designer Senior

Output: Arte final em PDF de alta resolução + arquivo editável AI

Prazo referência: 3 dias úteis

5.4. Materiais de PDV

Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.

Responsável: Designer Senior

Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão

Prazo referência: 3 dias úteis

5.5. Aprovação interna e do cliente

Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.

Responsável: Marco Andolfato / Nelson

Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção

5.6. Envio para produção e acompanhamento

Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.

Responsável: Nelson / Atendimento

Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente

Prazo referência: 1 dia útil após aprovação

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.

6.2 Erros Comuns a Evitar

Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).

  8. SLAs e Prazos

Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).

  9. Fluxograma

Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim

  10. Glossário

Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Tapume &amp; PDV</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.</p><p><strong>2.2 Exclusões</strong></p><p>Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Criação dos layouts e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Levantamento técnico</strong></p><p>Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).</p><p>Responsável: Designer Senior + Atendimento</p><p>Output: Briefing técnico completo validado com fornecedor gráfico</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Definição de conceito visual e layout</strong></p><p>Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: 2 sketches/mockups de layout aprovados internamente</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final</strong></p><p><strong>5.3. Desenvolvimento da arte final do tapume</strong></p><p>Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Arte final em PDF de alta resolução + arquivo editável AI</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.4. Materiais de PDV</strong></p><p>Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.</p><p>Responsável: Designer Senior</p><p>Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.5. Aprovação interna e do cliente</strong></p><p>Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção</strong></p><p><strong>5.6. Envio para produção e acompanhamento</strong></p><p>Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente</p><p>Prazo referência: 1 dia útil após aprovação</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim</p><p><strong>  10. Glossário</strong></p><p>Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.', '<p>Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.', '<p>Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.', '<p>Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Criação dos layouts e arte final

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final antes do cliente

Aprovador

Cliente/Incorporadora

Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Criação dos layouts e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes do cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de dados técnicos (metragem do tapume, regulamentação local) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).', '<p>Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Levantamento técnico', 'Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).

Responsável: Designer Senior + Atendimento

Output: Briefing técnico completo validado com fornecedor gráfico

Prazo referência: 1 dia útil', '<p>Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).</p><p>Responsável: Designer Senior + Atendimento</p><p>Output: Briefing técnico completo validado com fornecedor gráfico</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição de conceito visual e layout', 'Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.

Responsável: Designer Senior + Nelson

Output: 2 sketches/mockups de layout aprovados internamente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final', '<p>Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.</p><p>Responsável: Designer Senior + Nelson</p><p>Output: 2 sketches/mockups de layout aprovados internamente</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento da arte final do tapume', 'Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.

Responsável: Designer Senior

Output: Arte final em PDF de alta resolução + arquivo editável AI

Prazo referência: 3 dias úteis', '<p>Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Arte final em PDF de alta resolução + arquivo editável AI</p><p>Prazo referência: 3 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Materiais de PDV', 'Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.

Responsável: Designer Senior

Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão

Prazo referência: 3 dias úteis', '<p>Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.</p><p>Responsável: Designer Senior</p><p>Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão</p><p>Prazo referência: 3 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação interna e do cliente', 'Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.

Responsável: Marco Andolfato / Nelson

Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção', '<p>Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Envio para produção e acompanhamento', 'Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.

Responsável: Nelson / Atendimento

Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente

Prazo referência: 1 dia útil após aprovação', '<p>Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente</p><p>Prazo referência: 1 dia útil após aprovação</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.', '<p>Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.', '<p>Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).', '<p>Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).', '<p>Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim', '<p>Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.', '<p>Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-006: Book de Vendas ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Book de Vendas',
    'tbo-brd-006-book-de-vendas',
    'branding',
    'checklist',
    'Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.',
    'Standard Operating Procedure

Book de Vendas

Código

TBO-BRD-006

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

Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.

  2. Escopo

2.1 O que está coberto

Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.

2.2 Exclusões

Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e arte final

Responsável



Redator

Textos e legendas

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



Cliente/Incorporadora

Fornecimento de conteúdo (plantas, renders, dados) e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.



  5. Procedimento Passo a Passo

5.1. Reunião de conteúdo e coleta de materiais

Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.

Responsável: Atendimento + Redator

Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente

Prazo referência: 1 dia útil

5.2. Estrutura editorial e roteiro

Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.

Responsável: Redator + Nelson

Output: Roteiro editorial aprovado (índice com descrição de cada seção)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação

5.3. Diagramação — versão 1

Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).

Responsável: Designer Senior + Redator

Output: Book completo em INDD + PDF de revisão para aprovação interna

Prazo referência: 5 dias úteis

5.4. Revisão interna e de conteúdo

Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.

Responsável: Nelson + Marco Andolfato

Output: Lista consolidada de ajustes internos aplicados

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente

5.5. Aprovação do cliente e ajustes

Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.

Responsável: Nelson / Atendimento

Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados

Prazo referência: Máx. 2 rodadas em 5 dias úteis

[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.

5.6. Arte final, PDF interativo e entrega

Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.

Responsável: Designer Senior

Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente

Prazo referência: 2 dias úteis

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.

6.2 Erros Comuns a Evitar

Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).

  8. SLAs e Prazos

Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.

  9. Fluxograma

Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim

  10. Glossário

Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Book de Vendas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.</p><p><strong>2.2 Exclusões</strong></p><p>Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Textos e legendas</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de conteúdo (plantas, renders, dados) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Reunião de conteúdo e coleta de materiais</strong></p><p>Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.</p><p>Responsável: Atendimento + Redator</p><p>Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Estrutura editorial e roteiro</strong></p><p>Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro editorial aprovado (índice com descrição de cada seção)</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação</strong></p><p><strong>5.3. Diagramação — versão 1</strong></p><p>Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).</p><p>Responsável: Designer Senior + Redator</p><p>Output: Book completo em INDD + PDF de revisão para aprovação interna</p><p>Prazo referência: 5 dias úteis</p><p><strong>5.4. Revisão interna e de conteúdo</strong></p><p>Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Lista consolidada de ajustes internos aplicados</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente</strong></p><p><strong>5.5. Aprovação do cliente e ajustes</strong></p><p>Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados</p><p>Prazo referência: Máx. 2 rodadas em 5 dias úteis</p><p><strong>[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.</strong></p><p><strong>5.6. Arte final, PDF interativo e entrega</strong></p><p>Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.</p><p>Responsável: Designer Senior</p><p>Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente</p><p>Prazo referência: 2 dias úteis</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim</p><p><strong>  10. Glossário</strong></p><p>Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.', '<p>Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.', '<p>Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.', '<p>Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e arte final

Responsável

Redator

Textos e legendas

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador

Cliente/Incorporadora

Fornecimento de conteúdo (plantas, renders, dados) e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Textos e legendas</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de conteúdo (plantas, renders, dados) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.', '<p>Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Reunião de conteúdo e coleta de materiais', 'Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.

Responsável: Atendimento + Redator

Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente

Prazo referência: 1 dia útil', '<p>Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.</p><p>Responsável: Atendimento + Redator</p><p>Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Estrutura editorial e roteiro', 'Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.

Responsável: Redator + Nelson

Output: Roteiro editorial aprovado (índice com descrição de cada seção)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação', '<p>Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro editorial aprovado (índice com descrição de cada seção)</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação — versão 1', 'Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).

Responsável: Designer Senior + Redator

Output: Book completo em INDD + PDF de revisão para aprovação interna

Prazo referência: 5 dias úteis', '<p>Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).</p><p>Responsável: Designer Senior + Redator</p><p>Output: Book completo em INDD + PDF de revisão para aprovação interna</p><p>Prazo referência: 5 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna e de conteúdo', 'Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.

Responsável: Nelson + Marco Andolfato

Output: Lista consolidada de ajustes internos aplicados

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente', '<p>Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Lista consolidada de ajustes internos aplicados</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação do cliente e ajustes', 'Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.

Responsável: Nelson / Atendimento

Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados

Prazo referência: Máx. 2 rodadas em 5 dias úteis

[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.', '<p>Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados</p><p>Prazo referência: Máx. 2 rodadas em 5 dias úteis</p><p><strong>[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Arte final, PDF interativo e entrega', 'Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.

Responsável: Designer Senior

Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente

Prazo referência: 2 dias úteis', '<p>Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.</p><p>Responsável: Designer Senior</p><p>Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente</p><p>Prazo referência: 2 dias úteis</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.', '<p>Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.', '<p>Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).', '<p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.', '<p>Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim', '<p>Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.', '<p>Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-007: Folder Combate ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Folder Combate',
    'tbo-brd-007-folder-combate',
    'branding',
    'checklist',
    'Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.',
    'Standard Operating Procedure

Folder Combate

Código

TBO-BRD-007

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

Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.

  2. Escopo

2.1 O que está coberto

Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.

2.2 Exclusões

Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator

Curadoria dos argumentos e copy

Responsável



Designer Senior (Branding)

Diagramação e arte final

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).



  5. Procedimento Passo a Passo

5.1. Levantamento de objeções e argumentos

Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.

Responsável: Redator + Atendimento

Output: Matriz de objeções e argumentos de combate (documento de 1 página)

Prazo referência: 1 dia útil

5.2. Curadoria e hierarquia de conteúdo

Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.

Responsável: Redator + Nelson

Output: Roteiro de conteúdo aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação

5.3. Diagramação e arte final

Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.

Responsável: Designer Senior

Output: Layout em PDF para revisão interna + arquivo INDD editável

Prazo referência: 2 dias úteis

5.4. Revisão interna e aprovação do cliente

Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado por escrito, arte final pronta para impressão

Prazo referência: 3 dias úteis (incluindo revisões)

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente

5.5. Arte final e entrega

Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).

Responsável: Designer Senior

Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente

Prazo referência: 1 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.

6.2 Erros Comuns a Evitar

Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.

  8. SLAs e Prazos

Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.

  9. Fluxograma

Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim

  10. Glossário

Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Folder Combate</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.</p><p><strong>2.2 Exclusões</strong></p><p>Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator</p></td><td><p>Curadoria dos argumentos e copy</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Levantamento de objeções e argumentos</strong></p><p>Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.</p><p>Responsável: Redator + Atendimento</p><p>Output: Matriz de objeções e argumentos de combate (documento de 1 página)</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Curadoria e hierarquia de conteúdo</strong></p><p>Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro de conteúdo aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação</strong></p><p><strong>5.3. Diagramação e arte final</strong></p><p>Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Layout em PDF para revisão interna + arquivo INDD editável</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.4. Revisão interna e aprovação do cliente</strong></p><p>Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Folder aprovado por escrito, arte final pronta para impressão</p><p>Prazo referência: 3 dias úteis (incluindo revisões)</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p><p><strong>5.5. Arte final e entrega</strong></p><p>Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).</p><p>Responsável: Designer Senior</p><p>Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente</p><p>Prazo referência: 1 dia útil</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim</p><p><strong>  10. Glossário</strong></p><p>Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.', '<p>Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.', '<p>Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).', '<p>Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator

Curadoria dos argumentos e copy

Responsável

Designer Senior (Branding)

Diagramação e arte final

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator</p></td><td><p>Curadoria dos argumentos e copy</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).', '<p>Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).', '<p>Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Levantamento de objeções e argumentos', 'Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.

Responsável: Redator + Atendimento

Output: Matriz de objeções e argumentos de combate (documento de 1 página)

Prazo referência: 1 dia útil', '<p>Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.</p><p>Responsável: Redator + Atendimento</p><p>Output: Matriz de objeções e argumentos de combate (documento de 1 página)</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Curadoria e hierarquia de conteúdo', 'Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.

Responsável: Redator + Nelson

Output: Roteiro de conteúdo aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação', '<p>Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro de conteúdo aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação e arte final', 'Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.

Responsável: Designer Senior

Output: Layout em PDF para revisão interna + arquivo INDD editável

Prazo referência: 2 dias úteis', '<p>Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Layout em PDF para revisão interna + arquivo INDD editável</p><p>Prazo referência: 2 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna e aprovação do cliente', 'Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado por escrito, arte final pronta para impressão

Prazo referência: 3 dias úteis (incluindo revisões)

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', '<p>Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Folder aprovado por escrito, arte final pronta para impressão</p><p>Prazo referência: 3 dias úteis (incluindo revisões)</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Arte final e entrega', 'Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).

Responsável: Designer Senior

Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente

Prazo referência: 1 dia útil', '<p>Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).</p><p>Responsável: Designer Senior</p><p>Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente</p><p>Prazo referência: 1 dia útil</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.', '<p>Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.', '<p>Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.', '<p>Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.', '<p>Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim', '<p>Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.', '<p>Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-008: Folder Sanfona ──
END $$;