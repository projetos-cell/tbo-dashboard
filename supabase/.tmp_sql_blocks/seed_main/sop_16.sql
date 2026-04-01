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
END $$;