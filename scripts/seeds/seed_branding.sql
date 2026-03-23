-- Seed: branding (14 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-BRD-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Naming', 'tbo-brd-001-naming', 'branding', 'checklist', 'Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.', 'Standard Operating Procedure

Naming

Código

TBO-BRD-001

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

Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.

  2. Escopo

2.1 O que está coberto

Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.

2.2 Exclusões

Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Naming

Pesquisa e geração de alternativas

Aprovador

Informado

Nelson (PO Branding)

Curadoria e alinhamento estratégico

Aprovador

Informado

Marco Andolfato

Aprovação final antes da entrega ao cliente

Aprovador



Cliente/Incorporadora

Briefing e aprovação do nome



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.

4.2 Ferramentas e Acessos

Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.



  5. Procedimento Passo a Passo

5.1. Imersão e análise de briefing

Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.

Responsável: Estrategista de Naming

Output: Mapa conceitual e painel de referências de naming

Prazo referência: 1 dia útil

5.2. Geração de alternativas

Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.

Responsável: Estrategista de Naming

Output: Planilha com 30+ opções categorizadas e avaliadas

Prazo referência: 2 dias úteis

5.3. Curadoria interna e seleção de finalistas

Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.

Responsável: Nelson (PO Branding)

Output: Lista curada de 6–10 finalistas

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova lista antes da verificação formal

5.4. Verificação de disponibilidade

Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.

Responsável: Estrategista de Naming

Output: Relatório de disponibilidade por nome

Prazo referência: 1 dia útil

[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.

5.5. Apresentação ao cliente

Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.

Responsável: Nelson (PO Branding)

Output: Deck de naming apresentado ao cliente

Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)

5.6. Aprovação e documentação

Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.

Responsável: Marco Andolfato / Nelson

Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado

Prazo referência: 1 dia útil após apresentação

[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.

6.2 Erros Comuns a Evitar

Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.

  7. Ferramentas e Templates

INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.

  8. SLAs e Prazos

Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).

  9. Fluxograma

Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim

  10. Glossário

INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Naming

Pesquisa e geração de alternativas

Aprovador

Informado

Nelson (PO Branding)

Curadoria e alinhamento estratégico

Aprovador

Informado

Marco Andolfato

Aprovação final antes da entrega ao cliente

Aprovador

Cliente/Incorporadora

Briefing e aprovação do nome

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Imersão e análise de briefing', 'Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.

Responsável: Estrategista de Naming

Output: Mapa conceitual e painel de referências de naming

Prazo referência: 1 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Geração de alternativas', 'Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.

Responsável: Estrategista de Naming

Output: Planilha com 30+ opções categorizadas e avaliadas

Prazo referência: 2 dias úteis', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Curadoria interna e seleção de finalistas', 'Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.

Responsável: Nelson (PO Branding)

Output: Lista curada de 6–10 finalistas

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova lista antes da verificação formal', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Verificação de disponibilidade', 'Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.

Responsável: Estrategista de Naming

Output: Relatório de disponibilidade por nome

Prazo referência: 1 dia útil

[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Apresentação ao cliente', 'Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.

Responsável: Nelson (PO Branding)

Output: Deck de naming apresentado ao cliente

Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Aprovação e documentação', 'Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.

Responsável: Marco Andolfato / Nelson

Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado

Prazo referência: 1 dia útil após apresentação

[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-BRD-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Identidade Visual Logo Manual KVs', 'tbo-brd-002-identidade-visual-logo-manual-kvs', 'branding', 'checklist', 'Identidade Visual (Logo + Manual + KVs)', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Criar e entregar a identidade visual completa do empreendimento — logotipo, paleta, tipografia, elementos gráficos e KVs (Key Visuals) — com manual de marca aplicado ao mercado imobiliário.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Desenvolvimento do logotipo, sistema visual (cores, tipografia, texturas, ícones), Key Visuals principais, manual de identidade visual e orientações de aplicação em materiais do empreendimento.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de materiais finais (folders, tapume, book) cobertos em SOPs específicos. Animação de marca (Motion Design). Identidade digital (coberta no módulo Digital).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Nome do empreendimento aprovado (SOP BRD-01), briefing de posicionamento, moodboard de referências visuais, segmento (econômico, médio, alto padrão, luxo), conceito do empreendimento.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (logotipo e sistema), Adobe InDesign (manual), Adobe Photoshop (KVs e composições), Figma (apresentação e protótipo digital), Google Drive (entrega de arquivos).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Definição de direcionamentos criativos', 'Ação: Com base no briefing e naming aprovado, definir 2 a 3 direcionamentos criativos distintos (ex: minimalista contemporâneo, sofisticado clássico, orgânico natural). Para cada direcionamento: paleta de cores preliminar, referências de tipografia e conceito visual.

Responsável: Designer Senior + Nelson

Output: Painel de direcionamentos (moodboard estruturado por caminho criativo)

Prazo referência: 2 dias úteis', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Desenvolvimento de logotipos', 'Ação: Criar 2 a 3 opções de logotipo para cada direcionamento aprovado internamente. Incluir variações: versão principal, versão reduzida (símbolo), versão horizontal e vertical. Aplicar em fundos claros e escuros.

Responsável: Designer Senior

Output: Arquivo de apresentação com 6–9 opções de logo em contexto real

Prazo referência: 4 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Apresentação ao cliente — 1ª rodada', 'Ação: Apresentar os direcionamentos e logotipos em deck estruturado, mostrando aplicações realistas (fachada, material impresso, digital). Coletar feedback estruturado via formulário ou reunião gravada.

Responsável: Nelson (PO Branding)

Output: Ata de reunião com feedback documentado, direcionamento escolhido

Prazo referência: Agendado com cliente (máx. 5 dias úteis após desenvolvimento)

[DECISÃO] Cliente escolhe direcionamento? Sim → refinamento. Não → nova rodada com ajustes (máx. 2 rodadas).', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Refinamento e sistema visual completo', 'Ação: Com o direcionamento aprovado, desenvolver o sistema visual completo: logotipo refinado em todas as variações, paleta de cores (primária, secundária, neutras, gradientes se houver), tipografia (fontes primária e secundária com hierarquia), texturas ou grafismos, padrão de foto/imagem.

Responsável: Designer Senior

Output: Sistema visual completo em Illustrator + guia de uso preliminar

Prazo referência: 3 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Key Visuals (KVs) principais', 'Ação: Criar os KVs conceituais do empreendimento — composições visuais de alto impacto que sintetizam a identidade e serão a base de todos os materiais. Mínimo: KV horizontal (banner/tapume), KV vertical (outdoor/mídia social), KV quadrado (redes sociais).

Responsável: Designer Senior

Output: 3–5 KVs entregues em alta resolução (print + digital)

Prazo referência: 3 dias úteis', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Manual de Identidade Visual', 'Ação: Produzir manual completo em InDesign com: uso correto do logotipo, paleta de cores com código HEX/RGB/CMYK/Pantone, tipografia com hierarquia, exemplos de aplicação (certo/errado), KVs, orientações de fotografia, tom visual.

Responsável: Designer Senior

Output: Manual em PDF (interativo) e INDD editável

Prazo referência: 3 dias úteis', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.7. Aprovação final e entrega de arquivos', 'Ação: Marco Andolfato revisa entrega completa. Organizar pasta de entrega no Google Drive: arquivos fonte (AI, INDD), exportações (PNG, PDF, SVG, EPS), manual PDF, KVs. Entregar ao cliente com e-mail de instrução de uso.

Responsável: Marco Andolfato / Nelson

Output: Pasta de entrega organizada, e-mail de entrega ao cliente, aprovação documentada

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato assina entrega final', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Logo funciona em P&B e colorido; funciona em tamanhos pequenos (favicon 32x32); paleta com todos os códigos de cor; tipografia com licença de uso verificada; manual com exemplos de aplicação errada (proteção); KVs entregues em alta resolução para print (300dpi mínimo); arquivos fonte organizados no Drive.', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Usar fontes sem licença comercial; entregar logotipo apenas em formato rasterizado (PNG) sem vetorial (AI/SVG); KVs com textos embutidos sem camadas editáveis; manual sem exemplos de aplicação incorreta; paleta sem código CMYK para impressão.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (apresentação), Google Drive (entrega), Font Squirrel/Adobe Fonts (licença tipográfica).', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Direcionamentos criativos: 2 dias úteis. Desenvolvimento de logos: 4 dias úteis. Sistema visual completo: 3 dias úteis. KVs: 3 dias úteis. Manual: 3 dias úteis. Total estimado (sem revisões cliente): 15 dias úteis. Com revisões: até 25 dias úteis.', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing + naming aprovado → Definir direcionamentos → [APROVAÇÃO INTERNA NELSON] → Desenvolver logotipos → Apresentar ao cliente → [CLIENTE APROVA DIRECIONAMENTO?] → Não: ajustar (máx. 2x) → Sim: Refinamento e sistema visual → Criar KVs → Produzir manual → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar arquivos → Entregar ao cliente → Fim', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'KV (Key Visual): composição visual central que define o padrão estético de um empreendimento, usada como base para todos os materiais. Manual de Identidade Visual: documento que normatiza o uso correto da marca. Pantone: sistema de cores padrão para impressão de alta fidelidade. Vetor: formato de imagem baseado em matemática, escalável sem perda de qualidade (AI, SVG, EPS).', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 19, 'step');

  -- TBO-BRD-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Storytelling de Empreendimento', 'tbo-brd-003-storytelling-de-empreendimento', 'branding', 'checklist', 'Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Construir a narrativa do empreendimento — conceito, história, proposta de valor e tom de voz — que será o eixo de toda a comunicação, da campanha de lançamento ao pós-venda.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição do conceito narrativo, desenvolvimento do texto de posicionamento, manifesto de marca, argumento de venda central (elevator pitch), diretrizes de tom de voz e vocabulário.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Roteiros de vídeo (produção audiovisual), textos de mídia paga (tráfego), copy de anúncios, conteúdo de redes sociais.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Naming aprovado (BRD-01), identidade visual em andamento ou aprovada (BRD-02), briefing com dados do empreendimento (localização, metragem, diferenciais, público-alvo, VGV, prazo de entrega), pesquisa de buyer persona.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (documentação), Google Docs (redação colaborativa), ChatGPT/Claude (apoio à ideação — nunca entrega final sem revisão humana).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Análise do empreendimento e do público', 'Ação: Revisar briefing, dados técnicos do empreendimento e perfil do público-alvo. Identificar os 3 principais diferenciais competitivos (localização, projeto arquitetônico, estilo de vida, infraestrutura). Mapear as dores e aspirações do comprador-alvo.

Responsável: Redator/Estrategista

Output: Mapa de diferenciais e insights do público (1 página)

Prazo referência: 1 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Definição do conceito narrativo central', 'Ação: Criar o conceito que ancora toda a comunicação — uma ideia-força que vai além das características físicas do imóvel (ex: ''Viver com intenção'', ''O endereço que transforma rotina em estilo''). O conceito deve ter: nome ou expressão, descrição em 3 linhas, e 3 pilares de comunicação.

Responsável: Redator + Nelson

Output: Conceito narrativo documentado com nome, descrição e pilares

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson valida conceito internamente antes de desenvolver textos', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Manifesto de marca', 'Ação: Redigir o manifesto do empreendimento — texto de 150 a 250 palavras que traduz o conceito em emoção e aspiração. Deve ser escrito para o comprador, não para o incorporador. Tom: empático, inspirador, verdadeiro. Evitar clichês do setor (''sofisticado'', ''exclusivo'', ''conforto e lazer'').

Responsável: Redator/Estrategista

Output: Manifesto revisado e formatado

Prazo referência: 1 dia útil', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Textos de posicionamento e elevator pitch', 'Ação: Criar: (a) Tagline do empreendimento (até 7 palavras); (b) Elevator pitch de 30 segundos para corretores; (c) Descrição curta (50 palavras) para material digital; (d) Descrição longa (150 palavras) para book e folder.

Responsável: Redator/Estrategista

Output: Documento com os 4 formatos de texto aprovados

Prazo referência: 2 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Tom de voz e guia de vocabulário', 'Ação: Definir o tom de voz da marca do empreendimento em 4 atributos (ex: ''sofisticado mas acessível, preciso mas caloroso''). Criar lista de palavras a usar e palavras a evitar. Incluir exemplos de como escrever sobre o empreendimento em diferentes contextos (anúncio, e-mail, legenda).

Responsável: Redator/Estrategista + Nelson

Output: Guia de tom de voz (2–3 páginas) integrado ao manual de marca

Prazo referência: 1 dia útil', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Aprovação final e integração ao manual', 'Ação: Marco Andolfato revisa todo o storytelling. Cliente valida dados técnicos e aprova. Integrar os textos ao manual de identidade visual (SOP BRD-02) como seção de voz e narrativa.

Responsável: Marco Andolfato / Nelson

Output: Storytelling aprovado, integrado ao manual, arquivado no Notion do projeto

Prazo referência: 1 dia útil após aprovação do cliente

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Conceito diferente de todos os concorrentes diretos na praça; manifesto sem clichês do setor imobiliário; tagline testada com ao menos 3 pessoas do público-alvo; tom de voz coerente com identidade visual; textos aprovados pelo cliente por escrito; integrado ao manual.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Manifesto escrito da perspectiva do incorporador (não do comprador); tagline genérica (''qualidade de vida'', ''bem-estar''); elevator pitch muito longo (mais de 45 segundos); tom de voz não documentado (cada material soa diferente); textos com dados técnicos não verificados pelo cliente.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Docs, Notion, Hemingway App (clareza textual), IA como apoio à ideação (Claude/ChatGPT — sempre revisão humana obrigatória).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Análise e conceito: 3 dias úteis. Manifesto + textos: 3 dias úteis. Tom de voz: 1 dia útil. Aprovação: máx. 2 rodadas em 5 dias úteis. Total: 10–15 dias úteis.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing + naming + IV em andamento → Análise do empreendimento → Definir conceito narrativo → [NELSON VALIDA CONCEITO?] → Não: revisar → Sim: Desenvolver manifesto → Criar textos de posicionamento → Definir tom de voz → [MARCO APROVA?] → Não: revisar → Sim: Apresentar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Integrar ao manual → Arquivar no Notion → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Conceito narrativo: ideia-força que ancora toda a comunicação de um empreendimento. Manifesto: texto emocional que expressa o propósito e o espírito da marca. Tagline: frase curta e memorável que sintetiza o posicionamento. Elevator pitch: argumentação de venda em até 30 segundos. Tom de voz: conjunto de atributos que definem como a marca fala.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-BRD-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Tapume PDV', 'tbo-brd-004-tapume-pdv', 'branding', 'checklist', 'Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Criar e produzir o tapume e os materiais do Ponto de Venda (PDV) do empreendimento, garantindo impacto visual na obra e na faixa de tráfego, alinhados à identidade visual aprovada.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Layout do tapume (arte final), materiais de PDV (banner, stand, totem, planta decorada, display de mesa), envio para produção gráfica e acompanhamento de aprovação.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Montagem física do tapume ou stand (responsabilidade da construtora/produtora), compra de insumos (responsabilidade do cliente), decoração de apartamento decorado.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing com medidas exatas do tapume (em metros lineares e altura), regulamentação da prefeitura local, planta do empreendimento (para PDV), fotos do terreno.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (arte final), Adobe Photoshop (composições e KVs), Adobe InDesign (materiais multipágina), Fornecedor gráfico homologado (para template de arquivo de impressão).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Levantamento técnico', 'Ação: Coletar medidas exatas do tapume (comprimento total, altura, número de painéis), especificações de impressão do fornecedor (template, sangria, resolução mínima em dpi por metro linear), e regulamentação da prefeitura sobre dizeres obrigatórios (CNPJ, responsável técnico, memorial descritivo).

Responsável: Designer Senior + Atendimento

Output: Briefing técnico completo validado com fornecedor gráfico

Prazo referência: 1 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Definição de conceito visual e layout', 'Ação: Criar 2 propostas de layout para o tapume, explorando diferentes formas de dividir o espaço (zonas de atenção, hierarquia visual, renderizações do empreendimento, área de contato/QR Code). Definir grid e hierarquia de informação.

Responsável: Designer Senior + Nelson

Output: 2 sketches/mockups de layout aprovados internamente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova layout antes do desenvolvimento em arte final', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Desenvolvimento da arte final do tapume', 'Ação: Produzir arte final em Illustrator/Photoshop conforme template do fornecedor. Incluir: KV do empreendimento, nome e tagline, renderização ou ilustração do empreendimento, diferenciais em destaque, logo da incorporadora, dados legais obrigatórios, QR Code para landing page, dados de contato.

Responsável: Designer Senior

Output: Arte final em PDF de alta resolução + arquivo editável AI

Prazo referência: 3 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Materiais de PDV', 'Ação: Criar layouts dos materiais complementares do PDV conforme briefing: banner stand (850x2000mm padrão), totem de exposição, display de mesa (A3/A4), mapa de implantação decorado (planta do empreendimento com áreas identificadas), pasta para documentação.

Responsável: Designer Senior

Output: Layouts de todos os materiais PDV em arquivos separados prontos para impressão

Prazo referência: 3 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Aprovação interna e do cliente', 'Ação: Marco Andolfato revisa toda a arte final (tapume + PDV). Enviar ao cliente em PDF para aprovação com roteiro de verificação (checklist de itens obrigatórios). Registrar aprovação por e-mail.

Responsável: Marco Andolfato / Nelson

Output: E-mail de aprovação do cliente arquivado, arquivos prontos para envio ao gráfico

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato e cliente assinam aprovação antes do envio para produção', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Envio para produção e acompanhamento', 'Ação: Enviar arquivos aprovados ao fornecedor gráfico com especificações técnicas. Acompanhar prazo de produção. Conferir prova (quando possível) antes da impressão final. Comunicar cliente sobre prazo de entrega.

Responsável: Nelson / Atendimento

Output: Confirmação de envio ao gráfico, prazo de entrega comunicado ao cliente

Prazo referência: 1 dia útil após aprovação', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Arte final no formato exato especificado pelo fornecedor (com sangria e área segura); resolução mínima de 100dpi no tamanho final de impressão; dados legais obrigatórios presentes (CNPJ, RT, registro de imóveis); QR Code testado e funcional; cores em CMYK ou Pantone (não RGB); aprovação do cliente registrada por e-mail antes do envio para gráfica.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar arquivo RGB para impressão (causa variação de cor); esquecer dizeres obrigatórios da prefeitura; QR Code não testado; arte final com resolução insuficiente para o tamanho de impressão; enviar para gráfica sem aprovação formal do cliente.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe Photoshop CC, Adobe InDesign CC, QR Code Generator (qr.io ou similar), Fornecedor gráfico homologado (Lonas e Faixas, Gráfica Lira, etc.).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento técnico: 1 dia útil. Layout: 2 dias úteis. Arte final tapume: 3 dias úteis. PDV: 3 dias úteis. Aprovações: 2 dias úteis. Envio para produção: 1 dia útil. Total: 12–15 dias úteis (antes da data de instalação).', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com medidas e especificações → Levantamento técnico com fornecedor → Definir layout (2 opções) → [NELSON APROVA LAYOUT?] → Não: revisar → Sim: Desenvolver arte final tapume → Criar materiais PDV → [MARCO VALIDA?] → Não: corrigir → Sim: Enviar ao cliente para aprovação → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Enviar para produção gráfica → Acompanhar prazo → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Tapume: estrutura de vedação do canteiro de obras, utilizada como suporte de comunicação visual. PDV (Ponto de Venda): espaço físico de atendimento e venda do empreendimento (stand de vendas). Arte final: arquivo gráfico preparado para impressão, com todas as especificações técnicas. Sangria: área extra além do limite de corte para evitar bordas brancas na impressão. Registro de Incorporação: documento legal obrigatório nas comunicações de empreendimentos imobiliários.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-BRD-006
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Book de Vendas', 'tbo-brd-006-book-de-vendas', 'branding', 'checklist', 'Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 4, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Reunião de conteúdo e coleta de materiais', 'Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.

Responsável: Atendimento + Redator

Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente

Prazo referência: 1 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Estrutura editorial e roteiro', 'Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.

Responsável: Redator + Nelson

Output: Roteiro editorial aprovado (índice com descrição de cada seção)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Diagramação — versão 1', 'Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).

Responsável: Designer Senior + Redator

Output: Book completo em INDD + PDF de revisão para aprovação interna

Prazo referência: 5 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Revisão interna e de conteúdo', 'Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.

Responsável: Nelson + Marco Andolfato

Output: Lista consolidada de ajustes internos aplicados

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Aprovação do cliente e ajustes', 'Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.

Responsável: Nelson / Atendimento

Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados

Prazo referência: Máx. 2 rodadas em 5 dias úteis

[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Arte final, PDF interativo e entrega', 'Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.

Responsável: Designer Senior

Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente

Prazo referência: 2 dias úteis', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-BRD-007
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Folder Combate', 'tbo-brd-007-folder-combate', 'branding', 'checklist', 'Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 5, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Aprovador', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Levantamento de objeções e argumentos', 'Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.

Responsável: Redator + Atendimento

Output: Matriz de objeções e argumentos de combate (documento de 1 página)

Prazo referência: 1 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Curadoria e hierarquia de conteúdo', 'Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.

Responsável: Redator + Nelson

Output: Roteiro de conteúdo aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Diagramação e arte final', 'Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.

Responsável: Designer Senior

Output: Layout em PDF para revisão interna + arquivo INDD editável

Prazo referência: 2 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Revisão interna e aprovação do cliente', 'Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado por escrito, arte final pronta para impressão

Prazo referência: 3 dias úteis (incluindo revisões)

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Arte final e entrega', 'Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).

Responsável: Designer Senior

Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente

Prazo referência: 1 dia útil', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-BRD-008
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Folder Sanfona', 'tbo-brd-008-folder-sanfona', 'branding', 'checklist', 'Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.', 'Standard Operating Procedure

Folder Sanfona

Código

TBO-BRD-008

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

Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.

  2. Escopo

2.1 O que está coberto

Definição da estrutura de dobras, roteiro de conteúdo por painel, diagramação, arte final e especificação de impressão do folder sanfona.

2.2 Exclusões

Produção e impressão física (responsabilidade do cliente), folder combate (SOP BRD-07), flyer (SOP BRD-09).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Layout, diagramação e arte final

Responsável



Redator

Roteiro narrativo por painel

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renders do empreendimento, plantas baixas, conteúdo de lazer e diferenciais, tamanho final definido (formato e número de dobras: 4, 6 ou 8 painéis).

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação com dobras), Adobe Illustrator, Adobe Photoshop, template de diagramação com guias de dobra do fornecedor gráfico.



  5. Procedimento Passo a Passo

5.1. Definição do formato e dobras

Ação: Definir com o cliente o formato final desejado (ex: A4 com 6 painéis, DL com 4 painéis). Solicitar template de diagramação ao fornecedor gráfico com guias de dobra, sangria e área segura. Definir o modo de abertura e a sequência de leitura dos painéis.

Responsável: Designer Senior + Atendimento

Output: Template de diagramação recebido do gráfico, formato definido e aprovado

Prazo referência: 1 dia útil

5.2. Roteiro narrativo por painel

Ação: Criar o roteiro de conteúdo painel a painel seguindo uma narrativa progressiva: Capa (gancho visual) → Conceito/manifesto → Localização → Implantação e áreas → Tipologias → Lazer e diferenciais → Incorporadora e contato (contracapa). Cada painel com título, texto e visual definidos.

Responsável: Redator + Nelson

Output: Roteiro completo por painel aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes da diagramação

5.3. Diagramação na estrutura de dobras

Ação: Diagramar o folder em InDesign seguindo o template com guias de dobra. Atenção especial à continuidade visual entre painéis adjacentes e ao alinhamento de elementos que cruzam dobras. Aplicar identidade visual em toda a estrutura.

Responsável: Designer Senior

Output: Layout completo em INDD + PDF com simulação de dobras para revisão

Prazo referência: 3 dias úteis

5.4. Revisão interna, ajustes e aprovação do cliente

Ação: Revisão interna por Nelson e Marco Andolfato. Enviar ao cliente PDF com simulação visual de como o folder fica dobrado (mockup fotorrealístico). Registrar aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado pelo cliente, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente

5.5. Arte final e especificação de impressão

Ação: Finalizar arte em PDF para impressão (CMYK, 300dpi, com sangria e corte). Emitir especificação de impressão para o cliente: papel recomendado (ex: couchê 150g para miolo, 300g para capa), tipo de dobra, quantidade mínima econômica, acabamento (verniz, laminação fosca/brilhosa).

Responsável: Designer Senior

Output: PDF de impressão + PDF digital + especificação de impressão entregues

Prazo referência: 1 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Template do fornecedor gráfico utilizado (não template genérico); dobras não cortam elementos críticos (faces, textos principais); continuidade visual entre painéis testada em mockup impresso; todos os textos revisados; dados validados pelo cliente; arte final em CMYK com sangria correta.

6.2 Erros Comuns a Evitar

Criar o layout sem o template do gráfico (gera problemas de alinhamento na impressão); elementos críticos cruzando dobras sem intenção; excesso de texto por painel (folder deve ser visual); sequência narrativa confusa; mockup de dobra não apresentado ao cliente antes da aprovação.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Smartmockups (simulação de dobras), fornecedor gráfico homologado.

  8. SLAs e Prazos

Definição de formato: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 3 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 9–12 dias úteis.

  9. Fluxograma

Início → Definir formato e dobras com cliente → Solicitar template ao gráfico → Criar roteiro por painel → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar em InDesign com dobras → Mockup de simulação → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Especificação de impressão → Entregar → Fim

  10. Glossário

Folder sanfona: material impresso com múltiplas dobras paralelas (como um acordeão), criando uma narrativa visual sequencial. DL (Dimension Lengthwise): formato de envelope padrão (220x110mm), comum em materiais corporativos. Couchê: papel com acabamento liso e brilhante, padrão para materiais gráficos de qualidade. Laminação fosca: acabamento superficial que elimina o brilho e dá aparência premium ao impresso.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 6, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição da estrutura de dobras, roteiro de conteúdo por painel, diagramação, arte final e especificação de impressão do folder sanfona.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção e impressão física (responsabilidade do cliente), folder combate (SOP BRD-07), flyer (SOP BRD-09).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Layout, diagramação e arte final

Responsável

Redator

Roteiro narrativo por painel

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renders do empreendimento, plantas baixas, conteúdo de lazer e diferenciais, tamanho final definido (formato e número de dobras: 4, 6 ou 8 painéis).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação com dobras), Adobe Illustrator, Adobe Photoshop, template de diagramação com guias de dobra do fornecedor gráfico.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Definição do formato e dobras', 'Ação: Definir com o cliente o formato final desejado (ex: A4 com 6 painéis, DL com 4 painéis). Solicitar template de diagramação ao fornecedor gráfico com guias de dobra, sangria e área segura. Definir o modo de abertura e a sequência de leitura dos painéis.

Responsável: Designer Senior + Atendimento

Output: Template de diagramação recebido do gráfico, formato definido e aprovado

Prazo referência: 1 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Roteiro narrativo por painel', 'Ação: Criar o roteiro de conteúdo painel a painel seguindo uma narrativa progressiva: Capa (gancho visual) → Conceito/manifesto → Localização → Implantação e áreas → Tipologias → Lazer e diferenciais → Incorporadora e contato (contracapa). Cada painel com título, texto e visual definidos.

Responsável: Redator + Nelson

Output: Roteiro completo por painel aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes da diagramação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Diagramação na estrutura de dobras', 'Ação: Diagramar o folder em InDesign seguindo o template com guias de dobra. Atenção especial à continuidade visual entre painéis adjacentes e ao alinhamento de elementos que cruzam dobras. Aplicar identidade visual em toda a estrutura.

Responsável: Designer Senior

Output: Layout completo em INDD + PDF com simulação de dobras para revisão

Prazo referência: 3 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Revisão interna, ajustes e aprovação do cliente', 'Ação: Revisão interna por Nelson e Marco Andolfato. Enviar ao cliente PDF com simulação visual de como o folder fica dobrado (mockup fotorrealístico). Registrar aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado pelo cliente, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Arte final e especificação de impressão', 'Ação: Finalizar arte em PDF para impressão (CMYK, 300dpi, com sangria e corte). Emitir especificação de impressão para o cliente: papel recomendado (ex: couchê 150g para miolo, 300g para capa), tipo de dobra, quantidade mínima econômica, acabamento (verniz, laminação fosca/brilhosa).

Responsável: Designer Senior

Output: PDF de impressão + PDF digital + especificação de impressão entregues

Prazo referência: 1 dia útil', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Template do fornecedor gráfico utilizado (não template genérico); dobras não cortam elementos críticos (faces, textos principais); continuidade visual entre painéis testada em mockup impresso; todos os textos revisados; dados validados pelo cliente; arte final em CMYK com sangria correta.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Criar o layout sem o template do gráfico (gera problemas de alinhamento na impressão); elementos críticos cruzando dobras sem intenção; excesso de texto por painel (folder deve ser visual); sequência narrativa confusa; mockup de dobra não apresentado ao cliente antes da aprovação.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Smartmockups (simulação de dobras), fornecedor gráfico homologado.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Definição de formato: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 3 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 9–12 dias úteis.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Definir formato e dobras com cliente → Solicitar template ao gráfico → Criar roteiro por painel → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar em InDesign com dobras → Mockup de simulação → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Especificação de impressão → Entregar → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Folder sanfona: material impresso com múltiplas dobras paralelas (como um acordeão), criando uma narrativa visual sequencial. DL (Dimension Lengthwise): formato de envelope padrão (220x110mm), comum em materiais corporativos. Couchê: papel com acabamento liso e brilhante, padrão para materiais gráficos de qualidade. Laminação fosca: acabamento superficial que elimina o brilho e dá aparência premium ao impresso.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-BRD-009
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Flyer', 'tbo-brd-009-flyer', 'branding', 'checklist', 'Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 7, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Aprovador', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Briefing e definição de formatos', 'Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).

Responsável: Atendimento + Redator

Output: Briefing de flyer preenchido e aprovado, formatos confirmados

Prazo referência: 0,5 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Copy e headline', 'Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.

Responsável: Redator

Output: Copy aprovado internamente por Nelson

Prazo referência: 0,5 dia útil

[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Desenvolvimento visual', 'Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.

Responsável: Designer

Output: Layout em todos os formatos em PDF/PNG para revisão

Prazo referência: 1 dia útil', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Revisão, aprovação e arte final', 'Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).

Responsável: Marco Andolfato / Designer

Output: Arte final entregue em todos os formatos com nomenclatura padrão

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 16, 'step');

  -- TBO-BRD-010
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Papelaria', 'tbo-brd-010-papelaria', 'branding', 'checklist', 'Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.', 'Standard Operating Procedure

Papelaria

Código

TBO-BRD-010

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

Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.

  2. Escopo

2.1 O que está coberto

Cartão de visita, papel timbrado, envelope, pasta institucional, assinatura de e-mail, bloco de anotações, crachá e lacre de contrato. Arte final pronta para produção.

2.2 Exclusões

Impressão e produção física (responsabilidade do cliente), brindes e merchandising, papelaria de obra (EPI, placas de segurança).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final de todos os itens

Responsável



Nelson (PO Branding)

Curadoria e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



Cliente/Incorporadora

Fornecimento de dados (contatos, endereços) e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), lista de itens de papelaria solicitados pelo cliente, dados para os itens (nomes, cargos, telefones, endereço, site, e-mail), logotipos em todos os formatos necessários.

4.2 Ferramentas e Acessos

Adobe Illustrator (cartão, crachá, envelope), Adobe InDesign (papel timbrado, pasta), Adobe Photoshop (composições), fornecedores gráficos para especificação técnica.



  5. Procedimento Passo a Passo

5.1. Levantamento dos itens e coleta de dados

Ação: Confirmar com o cliente a lista completa de itens, quantidade de versões (ex: 5 cartões com nomes diferentes), todos os dados para cada peça. Identificar especificações de produção necessárias (ex: cartão 9x5cm com verniz UV localizado).

Responsável: Atendimento + Designer

Output: Lista de itens com dados completos e especificações técnicas

Prazo referência: 0,5 dia útil

5.2. Desenvolvimento dos layouts

Ação: Criar layouts de todos os itens de papelaria aplicando o sistema visual da identidade. Para cada item: desenvolver frente e verso quando aplicável, testar legibilidade, verificar hierarquia de informações. Apresentar internamente para aprovação antes de enviar ao cliente.

Responsável: Designer

Output: Layouts de todos os itens em PDF para revisão interna

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente

5.3. Aprovação do cliente e ajustes

Ação: Enviar PDF ao cliente mostrando todos os itens em mockup fotorrealístico. Registrar feedback. Aplicar ajustes (máx. 2 rodadas incluídas). Confirmar todos os dados (nomes, e-mails, telefones) na última versão antes da arte final.

Responsável: Nelson / Atendimento

Output: Todos os itens aprovados pelo cliente por escrito

Prazo referência: 3 dias úteis

5.4. Arte final e especificações de produção

Ação: Exportar arte final de cada item conforme especificação do gráfico. Para assinatura de e-mail: gerar em HTML ou PNG + instruções de instalação. Para cartão e itens com corte especial: incluir linha de corte e sangria. Emitir guia de produção com recomendações de material e acabamento.

Responsável: Designer

Output: Pasta completa de arte final + guia de produção

Prazo referência: 2 dias úteis

5.5. Entrega e instrução de uso

Ação: Marco Andolfato revisa entrega final. Organizar pasta de entrega no Drive com nomenclatura padronizada. Enviar e-mail de entrega ao cliente com instruções de uso de cada item (especialmente assinatura de e-mail e papel timbrado).

Responsável: Marco Andolfato / Nelson

Output: Entrega concluída, e-mail com instruções de uso enviado ao cliente

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato valida entrega final

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Todos os dados revisados pelo cliente na última versão (nomes, cargos, contatos); cartão de visita conforme norma gráfica (9x5cm ou 8.5x5.4cm); arte final de cartão com sangria e linha de corte; assinatura de e-mail testada no Gmail e Outlook; papel timbrado com margens adequadas para impressão doméstica; guia de produção entregue.

6.2 Erros Comuns a Evitar

Erro de digitação em nome ou cargo (revisão exclusiva do designer, sem conferência do cliente); assinatura de e-mail entregue apenas em PNG sem HTML (não funciona em todos os clientes de e-mail); cartão sem sangria; dados desatualizados não comunicados pelo cliente.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Smartmockups (mockups de papelaria), Stripo ou similar (HTML de assinatura de e-mail), Google Drive (entrega organizada).

  8. SLAs e Prazos

Levantamento: 0,5 dia útil. Layouts: 3 dias úteis. Aprovação: 3 dias úteis. Arte final: 2 dias úteis. Entrega: 1 dia útil. Total: 9–12 dias úteis.

  9. Fluxograma

Início → Coletar dados e lista de itens → Desenvolver layouts de todos os itens → [NELSON APROVA INTERNAMENTE?] → Não: revisar → Sim: Enviar ao cliente em mockup → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Arte final + guia de produção → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar Drive + enviar instruções → Fim

  10. Glossário

Papelaria corporativa: conjunto de materiais impressos e digitais de identidade de uma empresa ou empreendimento. Verniz UV localizado: acabamento brilhante aplicado em área específica da peça, destacando elementos. Lacre de contrato: peça gráfica adesiva usada para selar documentos de compra e venda. Mockup: simulação fotorrealística de como uma peça ficará no ambiente real.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 8, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Cartão de visita, papel timbrado, envelope, pasta institucional, assinatura de e-mail, bloco de anotações, crachá e lacre de contrato. Arte final pronta para produção.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Impressão e produção física (responsabilidade do cliente), brindes e merchandising, papelaria de obra (EPI, placas de segurança).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final de todos os itens

Responsável

Nelson (PO Branding)

Curadoria e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador

Cliente/Incorporadora

Fornecimento de dados (contatos, endereços) e aprovação

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), lista de itens de papelaria solicitados pelo cliente, dados para os itens (nomes, cargos, telefones, endereço, site, e-mail), logotipos em todos os formatos necessários.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (cartão, crachá, envelope), Adobe InDesign (papel timbrado, pasta), Adobe Photoshop (composições), fornecedores gráficos para especificação técnica.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Levantamento dos itens e coleta de dados', 'Ação: Confirmar com o cliente a lista completa de itens, quantidade de versões (ex: 5 cartões com nomes diferentes), todos os dados para cada peça. Identificar especificações de produção necessárias (ex: cartão 9x5cm com verniz UV localizado).

Responsável: Atendimento + Designer

Output: Lista de itens com dados completos e especificações técnicas

Prazo referência: 0,5 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Desenvolvimento dos layouts', 'Ação: Criar layouts de todos os itens de papelaria aplicando o sistema visual da identidade. Para cada item: desenvolver frente e verso quando aplicável, testar legibilidade, verificar hierarquia de informações. Apresentar internamente para aprovação antes de enviar ao cliente.

Responsável: Designer

Output: Layouts de todos os itens em PDF para revisão interna

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Aprovação do cliente e ajustes', 'Ação: Enviar PDF ao cliente mostrando todos os itens em mockup fotorrealístico. Registrar feedback. Aplicar ajustes (máx. 2 rodadas incluídas). Confirmar todos os dados (nomes, e-mails, telefones) na última versão antes da arte final.

Responsável: Nelson / Atendimento

Output: Todos os itens aprovados pelo cliente por escrito

Prazo referência: 3 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Arte final e especificações de produção', 'Ação: Exportar arte final de cada item conforme especificação do gráfico. Para assinatura de e-mail: gerar em HTML ou PNG + instruções de instalação. Para cartão e itens com corte especial: incluir linha de corte e sangria. Emitir guia de produção com recomendações de material e acabamento.

Responsável: Designer

Output: Pasta completa de arte final + guia de produção

Prazo referência: 2 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Entrega e instrução de uso', 'Ação: Marco Andolfato revisa entrega final. Organizar pasta de entrega no Drive com nomenclatura padronizada. Enviar e-mail de entrega ao cliente com instruções de uso de cada item (especialmente assinatura de e-mail e papel timbrado).

Responsável: Marco Andolfato / Nelson

Output: Entrega concluída, e-mail com instruções de uso enviado ao cliente

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato valida entrega final', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Todos os dados revisados pelo cliente na última versão (nomes, cargos, contatos); cartão de visita conforme norma gráfica (9x5cm ou 8.5x5.4cm); arte final de cartão com sangria e linha de corte; assinatura de e-mail testada no Gmail e Outlook; papel timbrado com margens adequadas para impressão doméstica; guia de produção entregue.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Erro de digitação em nome ou cargo (revisão exclusiva do designer, sem conferência do cliente); assinatura de e-mail entregue apenas em PNG sem HTML (não funciona em todos os clientes de e-mail); cartão sem sangria; dados desatualizados não comunicados pelo cliente.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Smartmockups (mockups de papelaria), Stripo ou similar (HTML de assinatura de e-mail), Google Drive (entrega organizada).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento: 0,5 dia útil. Layouts: 3 dias úteis. Aprovação: 3 dias úteis. Arte final: 2 dias úteis. Entrega: 1 dia útil. Total: 9–12 dias úteis.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Coletar dados e lista de itens → Desenvolver layouts de todos os itens → [NELSON APROVA INTERNAMENTE?] → Não: revisar → Sim: Enviar ao cliente em mockup → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Arte final + guia de produção → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar Drive + enviar instruções → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Papelaria corporativa: conjunto de materiais impressos e digitais de identidade de uma empresa ou empreendimento. Verniz UV localizado: acabamento brilhante aplicado em área específica da peça, destacando elementos. Lacre de contrato: peça gráfica adesiva usada para selar documentos de compra e venda. Mockup: simulação fotorrealística de como uma peça ficará no ambiente real.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-BRD-011
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Apresentação Comercial', 'tbo-brd-011-apresentacao-comercial', 'branding', 'checklist', 'Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.', 'Standard Operating Procedure

Apresentação Comercial

Código

TBO-BRD-011

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

Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.

  2. Escopo

2.1 O que está coberto

Apresentação em PowerPoint/Google Slides e/ou Keynote com design aplicado, diagramação de todos os slides, versão para projeção e versão para envio (PDF).

2.2 Exclusões

Apresentações de resultado financeiro (responsabilidade da diretoria), vídeos institucionais, apresentações de briefing interno TBO.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e design dos slides

Responsável



Redator

Estrutura de conteúdo e textos

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação estratégica final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing da apresentação (objetivo, audiência, número de slides estimado, dados a incluir), conteúdo do cliente (textos, dados, fotos).

4.2 Ferramentas e Acessos

Microsoft PowerPoint ou Google Slides (edição pelo cliente), Apple Keynote (apresentações premium), Adobe Illustrator (assets gráficos customizados), Figma (design de slide template).



  5. Procedimento Passo a Passo

5.1. Estrutura narrativa e roteiro de slides

Ação: Definir a estrutura da apresentação com o cliente: problema/oportunidade → solução/empreendimento → diferenciais → provas → proposta/CTA. Criar roteiro slide a slide com título, conteúdo principal e visual sugerido para cada. Máx. 1 ideia por slide.

Responsável: Redator + Nelson

Output: Roteiro de slides aprovado (1 ideia por slide, máx. 20 slides)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes do design

5.2. Design do template de slides

Ação: Criar o template de slides no software escolhido: slide de capa, slide de título de seção, slide de conteúdo com texto + imagem, slide de dados/gráfico, slide de citação/depoimento, slide de encerramento e CTA. Todos dentro do sistema visual da identidade.

Responsável: Designer Senior

Output: Template de slides com todas as variações (master slides)

Prazo referência: 2 dias úteis

5.3. Diagramação de todos os slides

Ação: Aplicar o conteúdo definitivo em todos os slides. Tratar e inserir imagens, criar infográficos e gráficos de dados, formatar textos conforme hierarquia do template. Garantir consistência visual e fluidez da narrativa.

Responsável: Designer Senior + Redator

Output: Apresentação completa diagramada em PDF para revisão interna

Prazo referência: 3 dias úteis

5.4. Revisão interna e do cliente

Ação: Nelson e Marco Andolfato revisam design e narrativa. Enviar ao cliente para aprovação de conteúdo e design. Máx. 2 rodadas de revisão incluídas. Garantir que dados e informações estejam validados pelo cliente.

Responsável: Marco Andolfato / Nelson

Output: Apresentação aprovada, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente

5.5. Exportação e entrega

Ação: Exportar em 3 formatos: (a) arquivo editável no software solicitado (.pptx ou .key); (b) PDF para projeção (alta resolução, widescreen 16:9); (c) PDF para envio (comprimido para e-mail, máx. 10MB). Incluir instrução de uso (como usar os master slides para editar).

Responsável: Designer Senior

Output: Pasta de entrega com 3 formatos + instrução de uso

Prazo referência: 1 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Máx. 1 ideia por slide; sem bullet points longos (máx. 3 bullets por slide); imagens com licença de uso; gráficos com fonte de dados citada; versão editável com master slides organizados; PDF de projeção em 16:9; PDF de envio abaixo de 10MB; aprovação do cliente registrada.

6.2 Erros Comuns a Evitar

Slides com parágrafos longos (''death by PowerPoint''); imagens baixadas do Google sem licença; gráficos sem fonte (risco de credibilidade); template sem master slides (cliente não consegue editar); arquivo editável sem as fontes embarcadas; enviar só PDF sem o arquivo editável.

  7. Ferramentas e Templates

Microsoft PowerPoint, Google Slides, Apple Keynote, Adobe Illustrator (assets), Figma (design inicial), Unsplash/Adobe Stock (imagens com licença).

  8. SLAs e Prazos

Roteiro: 1 dia útil. Template: 2 dias úteis. Diagramação: 3 dias úteis. Revisão: 3 dias úteis. Exportação: 1 dia útil. Total: 10–14 dias úteis.

  9. Fluxograma

Início → Briefing com objetivo e audiência → Criar roteiro de slides → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Design do template → Diagramar todos os slides → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Exportar 3 formatos → Entregar com instrução → Fim

  10. Glossário

Master slide: slide modelo em PowerPoint/Keynote que define o design padrão e é aplicado automaticamente. Death by PowerPoint: fenômeno de apresentações excessivamente textuais que perdem o engajamento da audiência. Widescreen 16:9: proporção de tela padrão para projetores e monitores modernos. CTA (Call to Action): elemento que convida o receptor a realizar uma ação específica.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 9, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Apresentação em PowerPoint/Google Slides e/ou Keynote com design aplicado, diagramação de todos os slides, versão para projeção e versão para envio (PDF).', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Apresentações de resultado financeiro (responsabilidade da diretoria), vídeos institucionais, apresentações de briefing interno TBO.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e design dos slides

Responsável

Redator

Estrutura de conteúdo e textos

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação estratégica final

Aprovador', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing da apresentação (objetivo, audiência, número de slides estimado, dados a incluir), conteúdo do cliente (textos, dados, fotos).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Microsoft PowerPoint ou Google Slides (edição pelo cliente), Apple Keynote (apresentações premium), Adobe Illustrator (assets gráficos customizados), Figma (design de slide template).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Estrutura narrativa e roteiro de slides', 'Ação: Definir a estrutura da apresentação com o cliente: problema/oportunidade → solução/empreendimento → diferenciais → provas → proposta/CTA. Criar roteiro slide a slide com título, conteúdo principal e visual sugerido para cada. Máx. 1 ideia por slide.

Responsável: Redator + Nelson

Output: Roteiro de slides aprovado (1 ideia por slide, máx. 20 slides)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes do design', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Design do template de slides', 'Ação: Criar o template de slides no software escolhido: slide de capa, slide de título de seção, slide de conteúdo com texto + imagem, slide de dados/gráfico, slide de citação/depoimento, slide de encerramento e CTA. Todos dentro do sistema visual da identidade.

Responsável: Designer Senior

Output: Template de slides com todas as variações (master slides)

Prazo referência: 2 dias úteis', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Diagramação de todos os slides', 'Ação: Aplicar o conteúdo definitivo em todos os slides. Tratar e inserir imagens, criar infográficos e gráficos de dados, formatar textos conforme hierarquia do template. Garantir consistência visual e fluidez da narrativa.

Responsável: Designer Senior + Redator

Output: Apresentação completa diagramada em PDF para revisão interna

Prazo referência: 3 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Revisão interna e do cliente', 'Ação: Nelson e Marco Andolfato revisam design e narrativa. Enviar ao cliente para aprovação de conteúdo e design. Máx. 2 rodadas de revisão incluídas. Garantir que dados e informações estejam validados pelo cliente.

Responsável: Marco Andolfato / Nelson

Output: Apresentação aprovada, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Exportação e entrega', 'Ação: Exportar em 3 formatos: (a) arquivo editável no software solicitado (.pptx ou .key); (b) PDF para projeção (alta resolução, widescreen 16:9); (c) PDF para envio (comprimido para e-mail, máx. 10MB). Incluir instrução de uso (como usar os master slides para editar).

Responsável: Designer Senior

Output: Pasta de entrega com 3 formatos + instrução de uso

Prazo referência: 1 dia útil', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Máx. 1 ideia por slide; sem bullet points longos (máx. 3 bullets por slide); imagens com licença de uso; gráficos com fonte de dados citada; versão editável com master slides organizados; PDF de projeção em 16:9; PDF de envio abaixo de 10MB; aprovação do cliente registrada.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Slides com parágrafos longos (''death by PowerPoint''); imagens baixadas do Google sem licença; gráficos sem fonte (risco de credibilidade); template sem master slides (cliente não consegue editar); arquivo editável sem as fontes embarcadas; enviar só PDF sem o arquivo editável.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Microsoft PowerPoint, Google Slides, Apple Keynote, Adobe Illustrator (assets), Figma (design inicial), Unsplash/Adobe Stock (imagens com licença).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Roteiro: 1 dia útil. Template: 2 dias úteis. Diagramação: 3 dias úteis. Revisão: 3 dias úteis. Exportação: 1 dia útil. Total: 10–14 dias úteis.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com objetivo e audiência → Criar roteiro de slides → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Design do template → Diagramar todos os slides → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Exportar 3 formatos → Entregar com instrução → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Master slide: slide modelo em PowerPoint/Keynote que define o design padrão e é aplicado automaticamente. Death by PowerPoint: fenômeno de apresentações excessivamente textuais que perdem o engajamento da audiência. Widescreen 16:9: proporção de tela padrão para projetores e monitores modernos. CTA (Call to Action): elemento que convida o receptor a realizar uma ação específica.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-BRD-012
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Guia do Corretor', 'tbo-brd-012-guia-do-corretor', 'branding', 'checklist', 'Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.', 'Standard Operating Procedure

Guia do Corretor

Código

TBO-BRD-012

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

Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.

  2. Escopo

2.1 O que está coberto

Guia do corretor em formato impresso (A4 espiral ou wire-o) e digital (PDF interativo), com: manifesto do empreendimento, tabela de tipologias, diferenciais, argumentos de venda, respostas a objeções, mapa de localização e contatos da incorporadora.

2.2 Exclusões

Treinamento presencial de corretores (responsabilidade da incorporadora), script de abordagem digital (módulo Digital), materiais para mídia paga.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator

Conteúdo, scripts e argumentos

Responsável



Designer Senior (Branding)

Diagramação e arte final

Responsável



Nelson (PO Branding)

Direção criativa e curadoria de conteúdo

Aprovador



Marco Andolfato

Aprovação final

Aprovador



Cliente/Incorporadora

Validação de dados técnicos e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Storytelling aprovado (BRD-03), folder combate (BRD-07) em andamento ou aprovado, dados técnicos completos do empreendimento, lista de objeções da equipe de vendas, tabela de tipologias e metragens, mapa de implantação.

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação), Adobe Illustrator, Adobe Photoshop, Adobe Acrobat Pro (PDF interativo com índice clicável).



  5. Procedimento Passo a Passo

5.1. Estrutura e levantamento de conteúdo

Ação: Definir os capítulos do guia: (1) Bem-vindo ao empreendimento, (2) Conceito e manifesto, (3) Localização e mapa, (4) O empreendimento em números, (5) Tipologias (plantas + metragens), (6) Infraestrutura e lazer, (7) Diferenciais do produto, (8) Argumentos de venda e respostas a objeções, (9) Incorporadora e equipe, (10) Contatos. Levantar todos os conteúdos necessários.

Responsável: Redator + Atendimento

Output: Estrutura de capítulos aprovada, todo conteúdo coletado e organizado

Prazo referência: 2 dias úteis

5.2. Criação do conteúdo textual

Ação: Redigir todos os textos do guia: introdução motivacional para corretores, argumentos de venda por segmento (investidor, família, casal jovem), scripts de resposta para as 10 principais objeções (preço, localização, concorrência, prazo de entrega), textos descritivos de cada tipologia.

Responsável: Redator

Output: Conteúdo textual completo revisado por Nelson

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson valida todo o conteúdo antes da diagramação

5.3. Diagramação completa

Ação: Diagramar o guia em InDesign com design coerente com a identidade visual do empreendimento, porém funcional para uso prático (fácil navegação, páginas com tabs ou separadores de capítulo, iconografia clara). Incluir sumário com hyperlinks na versão digital.

Responsável: Designer Senior

Output: Guia completo diagramado em PDF para revisão interna

Prazo referência: 4 dias úteis

5.4. Revisão interna e do cliente

Ação: Revisão por Nelson (design e narrativa) e Marco Andolfato (estratégia e qualidade). Enviar ao cliente para validação de todos os dados técnicos. Coletar aprovação formal. Ajustes máx. 2 rodadas.

Responsável: Marco Andolfato / Nelson

Output: Guia aprovado com dados validados pelo cliente

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação antes da arte final

5.5. Arte final, PDF interativo e entrega

Ação: Produzir arte final para impressão (CMYK, 300dpi, com guias de sangria). Criar PDF interativo com sumário clicável, links para WhatsApp e site. Organizar pasta de entrega. Recomendar acabamento de impressão (wire-o ou espiral para facilitar uso em campo).

Responsável: Designer Senior

Output: Arte final de impressão + PDF interativo + especificação de encadernação entregues

Prazo referência: 2 dias úteis

  6. Critérios de Qualidade

6.1 Checklist de Entrega

10 objeções principais com respostas documentadas; scripts de venda por perfil de comprador (mín. 3 perfis); dados técnicos validados pelo cliente por escrito; plantas com metragens e numeração de cômodos; PDF digital com sumário clicável; links de contato (WhatsApp, site) testados e funcionais.

6.2 Erros Comuns a Evitar

Dados de metragem ou preço sem validação do cliente (risco legal); scripts genéricos sem adaptação ao público do empreendimento; PDF com arquivo pesado demais para uso mobile (máx. 15MB); guia diagramado sem divisores de capítulo (dificulta navegação em campo); sem instrução de uso enviada ao corretor.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive.

  8. SLAs e Prazos

Estrutura e conteúdo: 5 dias úteis. Diagramação: 4 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 2 dias úteis. Total: 14–18 dias úteis.

  9. Fluxograma

Início → Definir estrutura de capítulos → Levantar conteúdo → Redigir textos e scripts → [NELSON VALIDA CONTEÚDO?] → Não: revisar → Sim: Diagramar guia completo → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Arte final + PDF interativo → Especificar encadernação → Entregar → Fim

  10. Glossário

Guia do corretor: manual operacional de vendas entregue aos corretores, com argumentos, scripts e dados do empreendimento. Script de venda: roteiro estruturado de argumentação para uso em atendimento. Wire-o: tipo de encadernação com espiral metálico, permite abertura total de 360° e é prático para uso em campo. Objeção: resistência do comprador que precisa ser respondida com argumento específico.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 10, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Guia do corretor em formato impresso (A4 espiral ou wire-o) e digital (PDF interativo), com: manifesto do empreendimento, tabela de tipologias, diferenciais, argumentos de venda, respostas a objeções, mapa de localização e contatos da incorporadora.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Treinamento presencial de corretores (responsabilidade da incorporadora), script de abordagem digital (módulo Digital), materiais para mídia paga.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator

Conteúdo, scripts e argumentos

Responsável

Designer Senior (Branding)

Diagramação e arte final

Responsável

Nelson (PO Branding)

Direção criativa e curadoria de conteúdo

Aprovador

Marco Andolfato

Aprovação final

Aprovador

Cliente/Incorporadora

Validação de dados técnicos e aprovação

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storytelling aprovado (BRD-03), folder combate (BRD-07) em andamento ou aprovado, dados técnicos completos do empreendimento, lista de objeções da equipe de vendas, tabela de tipologias e metragens, mapa de implantação.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Illustrator, Adobe Photoshop, Adobe Acrobat Pro (PDF interativo com índice clicável).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Estrutura e levantamento de conteúdo', 'Ação: Definir os capítulos do guia: (1) Bem-vindo ao empreendimento, (2) Conceito e manifesto, (3) Localização e mapa, (4) O empreendimento em números, (5) Tipologias (plantas + metragens), (6) Infraestrutura e lazer, (7) Diferenciais do produto, (8) Argumentos de venda e respostas a objeções, (9) Incorporadora e equipe, (10) Contatos. Levantar todos os conteúdos necessários.

Responsável: Redator + Atendimento

Output: Estrutura de capítulos aprovada, todo conteúdo coletado e organizado

Prazo referência: 2 dias úteis', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Criação do conteúdo textual', 'Ação: Redigir todos os textos do guia: introdução motivacional para corretores, argumentos de venda por segmento (investidor, família, casal jovem), scripts de resposta para as 10 principais objeções (preço, localização, concorrência, prazo de entrega), textos descritivos de cada tipologia.

Responsável: Redator

Output: Conteúdo textual completo revisado por Nelson

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson valida todo o conteúdo antes da diagramação', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Diagramação completa', 'Ação: Diagramar o guia em InDesign com design coerente com a identidade visual do empreendimento, porém funcional para uso prático (fácil navegação, páginas com tabs ou separadores de capítulo, iconografia clara). Incluir sumário com hyperlinks na versão digital.

Responsável: Designer Senior

Output: Guia completo diagramado em PDF para revisão interna

Prazo referência: 4 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Revisão interna e do cliente', 'Ação: Revisão por Nelson (design e narrativa) e Marco Andolfato (estratégia e qualidade). Enviar ao cliente para validação de todos os dados técnicos. Coletar aprovação formal. Ajustes máx. 2 rodadas.

Responsável: Marco Andolfato / Nelson

Output: Guia aprovado com dados validados pelo cliente

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação antes da arte final', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Arte final, PDF interativo e entrega', 'Ação: Produzir arte final para impressão (CMYK, 300dpi, com guias de sangria). Criar PDF interativo com sumário clicável, links para WhatsApp e site. Organizar pasta de entrega. Recomendar acabamento de impressão (wire-o ou espiral para facilitar uso em campo).

Responsável: Designer Senior

Output: Arte final de impressão + PDF interativo + especificação de encadernação entregues

Prazo referência: 2 dias úteis', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '10 objeções principais com respostas documentadas; scripts de venda por perfil de comprador (mín. 3 perfis); dados técnicos validados pelo cliente por escrito; plantas com metragens e numeração de cômodos; PDF digital com sumário clicável; links de contato (WhatsApp, site) testados e funcionais.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Dados de metragem ou preço sem validação do cliente (risco legal); scripts genéricos sem adaptação ao público do empreendimento; PDF com arquivo pesado demais para uso mobile (máx. 15MB); guia diagramado sem divisores de capítulo (dificulta navegação em campo); sem instrução de uso enviada ao corretor.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Estrutura e conteúdo: 5 dias úteis. Diagramação: 4 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 2 dias úteis. Total: 14–18 dias úteis.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Definir estrutura de capítulos → Levantar conteúdo → Redigir textos e scripts → [NELSON VALIDA CONTEÚDO?] → Não: revisar → Sim: Diagramar guia completo → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Arte final + PDF interativo → Especificar encadernação → Entregar → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Guia do corretor: manual operacional de vendas entregue aos corretores, com argumentos, scripts e dados do empreendimento. Script de venda: roteiro estruturado de argumentação para uso em atendimento. Wire-o: tipo de encadernação com espiral metálico, permite abertura total de 360° e é prático para uso em campo. Objeção: resistência do comprador que precisa ser respondida com argumento específico.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-BRD-013
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Criativos On Off', 'tbo-brd-013-criativos-on-off', 'branding', 'checklist', 'Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 11, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir os criativos de comunicação para mídia on-line (redes sociais, display, WhatsApp) e off-line (outdoor, busdoor, painéis de mídia exterior) do empreendimento, com coerência visual e impacto no ponto de atenção correto.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Criativos para redes sociais (feed, stories, reels cover), Google Display, mídia exterior (outdoor 9x3m, busdoor, painéis de metrô), WhatsApp marketing, materiais para eventos (roll-up, backdrop).', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Roteiro e produção de vídeo (audiovisual), gestão de tráfego e impulsionamento (responsabilidade do time de digital), produção física de outdoor e painéis.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Aprovador', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), KVs aprovados, briefing de campanha (objetivo, período, verba estimada, formatos solicitados), copy de campanha validado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Photoshop (criativos digitais e impressos), Adobe Illustrator (vetoriais e outdoor), Figma (criativos digitais colaborativos), Canva (versões para uso autônomo pelo cliente), Meta Ads Manager (especificações de formato).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Briefing de campanha e definição de formatos', 'Ação: Receber briefing detalhado: objetivo (awareness, geração de leads, lançamento), período da campanha, canais (Meta, Google, outdoor, WhatsApp), mensagem central, oferta ou CTA. Definir lista completa de formatos e dimensões para cada canal. Alinhar internamente com Nelson.

Responsável: Atendimento + Redator + Nelson

Output: Briefing de campanha aprovado, lista de formatos e dimensões definidas

Prazo referência: 0,5 dia útil', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Conceito criativo da campanha', 'Ação: Definir o conceito visual e o copy central da campanha (headline, subheadline, CTA). Criar 1 ou 2 direcionamentos criativos para aprovação do cliente antes de produzir todos os formatos. Apresentar em mockup nos principais formatos.

Responsável: Designer + Redator + Nelson

Output: Conceito criativo em mockup apresentado e aprovado pelo cliente

Prazo referência: 2 dias úteis

[APROVAÇÃO] Nelson aprova internamente; cliente aprova antes da produção em escala', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Produção dos criativos on-line', 'Ação: Adaptar o conceito aprovado para todos os formatos digitais: feed 1080x1080px, stories 1080x1920px, Google Display (vários formatos padrão IAB), WhatsApp 900x1600px. Atentar para áreas seguras, textos nos limites de espaço e CTAs claros.

Responsável: Designer

Output: Todos os formatos digitais em arquivos PNG/JPG + arquivos editáveis

Prazo referência: 2 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Produção dos criativos off-line', 'Ação: Criar artes finais para mídia exterior: outdoor (9x3m ou 12x4m — arte simples, legível a 50m de distância, máx. 7 palavras no headline), busdoor (aprox. 1,20x0,40m), roll-up (850x2000mm), backdrop (tamanho conforme solicitado). Atenção: formatos de outdoor devem ser produzidos em resolução adequada ao tamanho (15–25dpi no tamanho final).

Responsável: Designer

Output: Artes finais de mídia exterior em PDF + AI/PSD editáveis

Prazo referência: 2 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Revisão, aprovação e entrega', 'Ação: Marco Andolfato revisa todos os criativos. Enviar ao cliente kit completo de criativos para aprovação. Aplicar ajustes (máx. 1 rodada por campanha incluída no escopo). Entregar ao cliente com nomenclatura padronizada e planilha de especificações (formato, dimensão, peso, canal).

Responsável: Marco Andolfato / Nelson

Output: Kit completo de criativos aprovados, nomenclatura padronizada, planilha de especificações entregue

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Outdoor: máx. 7 palavras no headline, legível a 50m; formatos digitais dentro dos specs de cada plataforma (verificar Meta Ads Guide); textos nos criativos digitais representam menos de 20% da área total; QR Codes testados; todos os formatos entregues com nomenclatura padronizada; arte de outdoor em CMYK; criativos digitais em RGB sRGB.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Outdoor com texto excessivo (ilegível em movimento); adaptar feed para stories apenas recortando (precisa recompor o layout); imagem de fundo em baixa resolução ampliada para outdoor; criativos digitais em CMYK (cores erradas na tela); nomenclatura de arquivos inconsistente (prejudica a gestão do cliente).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Photoshop CC, Adobe Illustrator CC, Figma, Canva, Meta Ads Specs Guide (referência de dimensões), Google Display Ad Gallery.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing e conceito: 2 dias úteis. Criativos on-line: 2 dias úteis. Criativos off-line: 2 dias úteis. Aprovação: 2 dias úteis. Total: 8–10 dias úteis por campanha.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing de campanha → Definir formatos → Criar conceito criativo → [CLIENTE APROVA CONCEITO?] → Não: ajustar (máx. 1x) → Sim: Produzir criativos on-line → Produzir criativos off-line → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Entregar kit com nomenclatura e specs → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'IAB (Interactive Advertising Bureau): organização que define padrões de formatos para publicidade digital. Busdoor: peça de comunicação visual aplicada nas portas laterais de ônibus. Roll-up: display retrátil portátil usado em eventos e PDV. Backdrop: painel de fundo para eventos e entrevistas (com repetição de logos). dpi (dots per inch): medida de resolução — quanto maior o formato de impressão, menor o dpi necessário.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-BRD-014
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Aprovação e Revisão de Materiais', 'tbo-brd-014-aprovacao-e-revisao-de-materiais', 'branding', 'checklist', 'Aprovação e Revisão de Materiais', 'Standard Operating Procedure

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

', 'published', 'high', ARRAY['marca','design']::TEXT[], 12, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os materiais produzidos pela BU Branding passem por um processo estruturado de revisão interna e aprovação formal do cliente antes de qualquer finalização, impressão ou publicação.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Fluxo de revisão interna (Designer → Nelson → Marco Andolfato), processo de envio e aprovação com o cliente, controle de versões, registro de feedbacks e aprovações formais.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Aprovação jurídica de materiais (responsabilidade do jurídico da incorporadora), revisão de conteúdo gerado por terceiros (renderizações, fotos), aprovação de campanhas de mídia paga.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Material produzido pelo designer em versão de revisão (não arte final), briefing original, versões anteriores aprovadas (para comparação em revisões), checklist de qualidade específico do tipo de material.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (registro de versões e feedbacks), Google Drive (versionamento de arquivos), e-mail (aprovação formal), formulário de feedback padronizado TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Checklist de qualidade pelo designer', 'Ação: Antes de enviar para revisão interna, o designer aplica o checklist de qualidade específico do tipo de material (tapume, book, folder, etc.). Verificar: aderência ao briefing, consistência com identidade visual, dados corretos, resolução adequada, nomenclatura de arquivo correta.

Responsável: Designer

Output: Checklist de qualidade preenchido e arquivado junto ao arquivo de revisão

Prazo referência: 0,5 dia útil por material', 6, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Revisão criativa — Nelson (PO Branding)', 'Ação: Nelson revisa o material com foco em: coerência com a identidade visual, hierarquia de informação, qualidade criativa, alinhamento com o posicionamento estratégico do empreendimento. Documentar todos os apontamentos em lista numerada no Notion. Não devolver para o designer sem lista consolidada.

Responsável: Nelson (PO Branding)

Output: Lista de apontamentos numerada no Notion (ou aprovação direta)

Prazo referência: 4 horas a 1 dia útil

[DECISÃO] Aprovado? Sim → Marco Andolfato. Não → lista de ajustes ao designer.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Revisão estratégica — Marco Andolfato', 'Ação: Marco Andolfato revisa o material já validado por Nelson com foco em: alinhamento estratégico, posicionamento de marca, qualidade de entrega TBO. Aprovar ou adicionar apontamentos. NUNCA enviar material ao cliente sem a aprovação de Marco.

Responsável: Marco Andolfato

Output: Aprovação interna registrada no Notion, ou lista de ajustes adicionais

Prazo referência: 4 horas a 1 dia útil

[APROVAÇÃO] Obrigatório — nenhum material vai ao cliente sem aprovação de Marco Andolfato', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Envio ao cliente e gestão de feedback', 'Ação: Atendimento envia o material ao cliente via e-mail com formulário de feedback padronizado (ou formulário em Notion). O e-mail deve incluir: link para o arquivo (PDF ou Drive), prazo de resposta esperado (máx. 3 dias úteis), instrução de como deixar feedback (link, comentário no PDF ou formulário).

Responsável: Atendimento/Gestor de Conta

Output: E-mail de revisão enviado, prazo confirmado, feedback do cliente recebido e registrado

Prazo referência: Envio imediato; aguardar resposta máx. 3 dias úteis', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Aplicação de ajustes e controle de versões', 'Ação: Designer aplica os ajustes do cliente. Versionar o arquivo (v1, v2, v3) no Google Drive. Nunca sobrescrever versão anterior. Limitar a 2 rodadas de revisão incluídas no escopo. A partir da 3ª rodada, emitir aditivo de horas. Documentar cada versão no Notion.

Responsável: Designer + Atendimento

Output: Arquivo revisado versionado no Drive, registro no Notion atualizado

Prazo referência: 1–2 dias úteis por rodada

[DECISÃO] 3ª rodada? Sim → emitir aditivo e informar o cliente. Não → continuar normalmente.', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Aprovação final e liberação para produção', 'Ação: Cliente aprova a versão final por e-mail (resposta explícita: ''Aprovado'' ou assinatura em documento). Registrar aprovação no Notion. Apenas após aprovação formal o material é liberado para arte final e envio à gráfica ou publicação.

Responsável: Atendimento + Nelson

Output: Aprovação formal registrada, material liberado para produção ou publicação

Prazo referência: 0,5 dia útil', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Checklist específico do tipo de material preenchido antes da revisão interna; nenhum material enviado ao cliente sem aprovação de Marco Andolfato; todas as versões salvas com nomenclatura (v1, v2...) no Drive; feedbacks documentados por escrito (não verbal/WhatsApp informalmente); aprovação final do cliente registrada antes da liberação; máximo de 2 rodadas de revisão dentro do escopo.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Enviar material ao cliente diretamente sem revisão de Nelson ou Marco; aceitar aprovação verbal por WhatsApp sem confirmação por e-mail; sobrescrever versões anteriores no Drive; não documentar apontamentos (dificulta rastreabilidade); iniciar arte final sem aprovação formal registrada.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (gestão do fluxo e registro de versões), Google Drive (versionamento de arquivos), e-mail corporativo (aprovação formal), Adobe Acrobat (comentários em PDF), formulário TBO de feedback.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Revisão Nelson: até 1 dia útil. Revisão Marco: até 1 dia útil. Envio ao cliente: imediato após aprovação interna. Prazo de resposta do cliente: máx. 3 dias úteis. Ajuste e nova versão: 1–2 dias úteis. Total por rodada: 3–5 dias úteis.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Designer conclui material → Checklist de qualidade preenchido → Nelson revisa → [NELSON APROVA?] → Não: ajustes ao designer → Sim: Marco Andolfato revisa → [MARCO APROVA?] → Não: ajustes → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: [É 3ª RODADA?] → Sim: emitir aditivo → Não: aplicar ajustes → versionar no Drive → Sim: Registrar aprovação formal → Liberar para produção/publicação → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Rodada de revisão: ciclo de feedback e ajuste de um material. Aditivo: instrumento contratual para cobrar horas além do escopo original. Versionamento: prática de salvar cada iteração de um arquivo com identificação de versão (v1, v2). Arte final: versão definitiva de um arquivo preparada para impressão ou publicação.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-BRD-015
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Marca do Cliente', 'tbo-brd-015-gestao-de-marca-do-cliente', 'branding', 'checklist', 'Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['marca','design']::TEXT[], 13, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Gerir de forma contínua a marca da incorporadora e/ou do empreendimento, garantindo consistência visual e de comunicação em todos os pontos de contato ao longo do tempo — da pré-venda ao pós-venda.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Guardianismo de marca (brand guardian), auditoria periódica de aplicações, atualização do manual de identidade visual, gestão de solicitações de uso de marca de terceiros, treinamento da equipe do cliente, relatórios de saúde da marca.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de novos materiais específicos (cobertos por SOPs específicos da BU Branding), gestão de redes sociais (módulo Digital), campanhas de mídia paga.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Manual de identidade visual aprovado (BRD-02), histórico de materiais produzidos arquivado no Drive, contrato de gestão de marca ativo, acesso às plataformas e canais do cliente.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Notion (dashboard de saúde da marca, registro de demandas), Google Drive (repositório de arquivos e histórico), Adobe Creative Suite (produções e revisões), planilha de auditoria de marca TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Dashboard de saúde da marca', 'Ação: Manter no Notion o dashboard de saúde da marca do cliente com: status do manual (última atualização), calendário de auditorias, log de materiais aprovados e reprovados, registro de solicitações de uso da marca por terceiros, alertas de inconsistências identificadas.

Responsável: Nelson (PO Branding)

Output: Dashboard atualizado no Notion, revisado mensalmente

Prazo referência: Atualização mensal (recorrente)', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Auditoria trimestral de aplicações', 'Ação: A cada trimestre, auditar todas as aplicações da marca nos materiais ativos do cliente: redes sociais, materiais impressos em uso, sinalização, site, apresentações e materiais de terceiros (fornecedores, parceiros). Verificar aderência ao manual. Emitir relatório de auditoria com recomendações.

Responsável: Nelson + Designer Senior

Output: Relatório de auditoria com pontuação de consistência e lista de itens a corrigir

Prazo referência: 5 dias úteis (a cada trimestre)

[DECISÃO] Inconsistências críticas? Sim → acionar cliente e corrigir imediatamente. Não → incluir no próximo ciclo de manutenção.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Atualização do manual de identidade visual', 'Ação: Quando surgirem novos contextos de aplicação (nova plataforma, novo tipo de material, novo formato de mídia), atualizar o manual de identidade visual com as novas diretrizes. Documentar a versão, data e o que mudou. Comunicar ao cliente e à equipe interna.

Responsável: Designer Senior + Nelson

Output: Manual atualizado versionado no Drive, comunicado ao cliente

Prazo referência: Conforme necessidade — máx. 5 dias úteis por atualização

[APROVAÇÃO] Marco Andolfato aprova toda atualização de manual antes da comunicação ao cliente', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Gestão de solicitações de uso por terceiros', 'Ação: Quando o cliente receber solicitação de uso da marca do empreendimento por terceiros (parceiros, fornecedores, imprensa), analisar a solicitação: verificar contexto de uso, mídia, adaptações necessárias. Aprovar, condicionar (com ajustes) ou reprovar. Documentar toda solicitação e decisão.

Responsável: Nelson (PO Branding)

Output: Parecer documentado sobre cada solicitação de uso de marca por terceiros

Prazo referência: 2 dias úteis por solicitação', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Treinamento e capacitação da equipe do cliente', 'Ação: Realizar treinamento de uso de marca com a equipe de marketing e vendas do cliente ao menos 1x por ano (ou a cada novo lançamento). Formato: apresentação de 60 min + guia de uso rápido (1 página). Registrar participantes e data.

Responsável: Nelson (PO Branding)

Output: Treinamento realizado, lista de presença registrada, guia de uso rápido entregue

Prazo referência: Anual (ou por lançamento)', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Relatório semestral de marca', 'Ação: A cada 6 meses, produzir relatório executivo de gestão de marca para o cliente: resumo das produções realizadas, índice de consistência da auditoria, solicitações de terceiros e decisões tomadas, recomendações para o próximo semestre, agenda de próximos lançamentos ou revisões.

Responsável: Nelson + Marco Andolfato

Output: Relatório semestral entregue ao cliente em PDF

Prazo referência: 5 dias úteis (a cada semestre)

[APROVAÇÃO] Marco Andolfato aprova relatório antes da entrega ao cliente', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Manual de identidade visual com versão e data de atualização; auditoria trimestral realizada e documentada; todas as solicitações de uso por terceiros com parecer registrado; treinamento anual realizado com lista de presença; dashboard no Notion atualizado mensalmente; relatório semestral entregue dentro do prazo.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Aceitar uso da marca por terceiros sem análise e registro formal; manual desatualizado sem data de revisão; auditoria realizada sem relatório escrito; cliente usando materiais de versão reprovada sem que a TBO tenha identificado e corrigido; treinamento realizado sem registro de participantes.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Notion (dashboard e registro), Google Drive (repositório e versionamento), Adobe Creative Suite (auditorias e atualizações), Google Slides (treinamento), planilha de auditoria de marca TBO.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Dashboard: atualização mensal. Auditoria: trimestral (5 dias úteis). Atualização de manual: até 5 dias úteis. Resposta a solicitação de terceiros: 2 dias úteis. Treinamento: anual. Relatório semestral: 5 dias úteis.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início (contrato ativo) → Manter dashboard Notion → [AUDITORIA TRIMESTRAL] → Auditar aplicações → [INCONSISTÊNCIAS CRÍTICAS?] → Sim: acionar cliente e corrigir → Não: incluir próximo ciclo → [NOVA PLATAFORMA OU CONTEXTO?] → Sim: Atualizar manual → Marco aprova → Comunicar ao cliente → [SOLICITAÇÃO DE TERCEIROS?] → Analisar → Aprovar/Reprovar/Condicionar → Documentar → [SEMESTRAL] → Relatório executivo → Marco aprova → Entregar ao cliente → [ANUAL] → Treinamento da equipe → Registrar → Continuar ciclo → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Brand Guardian: responsável pela integridade e consistência da marca ao longo do tempo. Auditoria de marca: verificação sistemática de todas as aplicações de uma identidade visual para garantir aderência ao manual. Índice de consistência: métrica percentual que indica o grau de conformidade das aplicações com o manual de marca. Guardianismo: prática contínua de proteção e manutenção de uma marca.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

END $$;
