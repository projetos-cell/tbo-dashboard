-- ─── Seed: SOPs de Direção Criativa ─────────────────────────────────
-- SOPs de Direção Criativa para a TBO
-- Total: 8 SOPs
-- Data: 2026-03-22
-- Autor: Marco Andolfato (Diretor Criativo)

DO $$
DECLARE
  v_tenant_id UUID;
  v_sop_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Nenhum tenant encontrado. Abortando seed.';
    RETURN;
  END IF;


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-001: Briefing Criativo de Empreendimento
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Briefing Criativo de Empreendimento',
    'tbo-dc-001-briefing-criativo',
    'geral',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Briefing Criativo de Empreendimento

Código

TBO-DC-001

Versão

1.0

Data de Criação

2026-03-22

Última Atualização

2026-03-22

Área / BU

Direção Criativa (Cross-BU)

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato / Ruy Lima


  1. Objetivo

Padronizar o processo de construção do briefing criativo para novos empreendimentos imobiliários, garantindo que todas as BUs da TBO (3D, Branding, Marketing, Audiovisual) trabalhem a partir de uma mesma base estratégica e estética. O briefing criativo é o documento-mãe que alimenta todos os desdobramentos visuais e narrativos do projeto.

  2. Escopo

2.1 O que está coberto

Definição de posicionamento do empreendimento, arquétipo de marca, tom de voz, universo visual, paleta cromática, materialidade, referências visuais, direção de fotografia/render e narrativa central. Inclui alinhamento com incorporadora e validação interna.

2.2 Exclusões

Execução de peças (coberta por SOPs específicos de cada BU). Planejamento de mídia. Precificação comercial. Projetos arquitetônicos (input, não output).

  3. Responsáveis (RACI)

Papel | Responsável | Aprovador | Consultado | Informado
Diretor Criativo | Construção do briefing | Incorporadora | Atendimento | Todas as BUs
Atendimento | Coleta de inputs do cliente | Marco (Dir. Criativo) | Comercial | PO do projeto
Diretor Estratégia | Validação de posicionamento | Marco (Dir. Criativo) | — | Equipe criativa

  4. Pré-requisitos

4.1 Inputs necessários

Projeto arquitetônico (plantas, implantação, fachada), memorial descritivo, localização e entorno, público-alvo definido pela incorporadora, análise de concorrência (se disponível), briefing comercial da incorporadora, histórico de projetos anteriores (se houver).

4.2 Ferramentas e Acessos

Figma (moodboard), Pinterest (referências), Google Drive (documentação), Notion ou TBO OS (registro), Adobe Creative Suite (composições visuais).

  5. Procedimento Passo a Passo

5.1. Kickoff com incorporadora

Ação: Reunião de imersão com cliente para entender visão, público, diferenciação e expectativas. Documentar em ata estruturada.

Responsável: Atendimento + Diretor Criativo

Output: Ata de kickoff + inputs brutos coletados

Prazo referência: 1 dia

5.2. Análise de contexto e concorrência

Ação: Mapear empreendimentos concorrentes na região, analisar posicionamento visual e narrativo, identificar gaps e oportunidades de diferenciação.

Responsável: Diretor Criativo

Output: Documento de análise competitiva (3-5 concorrentes)

Prazo referência: 1-2 dias

5.3. Definição de posicionamento e arquétipo

Ação: Definir o arquétipo de marca do empreendimento (Explorador, Sábio, Criador, etc.), posicionamento em relação à concorrência, essência da marca.

Responsável: Diretor Criativo + Diretor Estratégia

Output: One-page de posicionamento (arquétipo + essência + promessa)

Prazo referência: 1 dia

[DECISÃO] Se posicionamento diverge da visão da incorporadora, alinhar antes de prosseguir

5.4. Construção do moodboard

Ação: Curar 30-50 referências visuais organizadas por categoria (arquitetura, lifestyle, materialidade, paisagismo, interiores, gráfico). Montar board no Figma com anotações de direção.

Responsável: Diretor Criativo

Output: Moodboard no Figma (link compartilhável)

Prazo referência: 1-2 dias

5.5. Definição de paleta cromática e materialidade

Ação: Selecionar paleta principal (3-5 cores) e paleta de apoio. Definir materiais-chave (madeira, metal, pedra, vidro) com referências fotográficas.

Responsável: Diretor Criativo

Output: Prancha de paleta + materialidade

Prazo referência: 0,5 dia

5.6. Definição de tom de voz e narrativa

Ação: Definir tom de comunicação (sofisticado, acolhedor, aspiracional, etc.), mensagem-chave, manifesto do empreendimento e guidelines de copy.

Responsável: Diretor Criativo

Output: Documento de tom de voz + manifesto

Prazo referência: 1 dia

5.7. Compilação do briefing criativo

Ação: Consolidar todos os outputs anteriores em documento único estruturado: Posicionamento → Moodboard → Paleta → Materialidade → Tom de Voz → Narrativa → Diretrizes por BU.

Responsável: Diretor Criativo

Output: Briefing Criativo Master (documento final)

Prazo referência: 1 dia

5.8. Validação interna

Ação: Apresentar briefing para líderes de cada BU, coletar feedback, ajustar. O briefing só é válido após aprovação do Diretor Criativo.

Responsável: Diretor Criativo

Output: Briefing aprovado internamente

Prazo referência: 0,5 dia

[APROVAÇÃO] Briefing aprovado — habilita início dos trabalhos em todas as BUs

5.9. Apresentação e aprovação do cliente

Ação: Apresentar briefing criativo à incorporadora. Documentar feedbacks e ajustes. Obter aprovação formal.

Responsável: Atendimento + Diretor Criativo

Output: Briefing aprovado pelo cliente (e-mail/ata)

Prazo referência: 1 dia (+ tempo do cliente)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Posicionamento claro e diferenciado. Arquétipo de marca definido com justificativa. Moodboard com mínimo 30 referências categorizadas. Paleta cromática com códigos HEX/RGB. Materialidade com fotos de referência. Tom de voz com exemplos de copy (do/dont). Narrativa central (manifesto ou conceito). Diretrizes específicas por BU (3D, Branding, MKT, AV). Aprovação documentada (interna + cliente).

6.2 Erros Comuns a Evitar

Briefing genérico que não diferencia o empreendimento dos concorrentes. Moodboard com referências aleatórias sem curadoria de direção. Falta de alinhamento entre tom de voz e universo visual. Não consultar equipe interna antes de apresentar ao cliente. Iniciar produção sem aprovação formal do briefing.

  7. Ferramentas e Templates

Figma (moodboard + pranchas de direção), Pinterest (curadoria de referências), Google Drive (atas e documentação), Adobe InDesign (formatação do briefing), TBO OS (registro e tracking), Fireflies (transcrição de reuniões).

  8. SLAs e Prazos

Prazo padrão total: 5-8 dias úteis. Kickoff a briefing compilado: 5 dias. Validação interna: 1 dia. Apresentação ao cliente: 1 dia + tempo de retorno. Briefing simplificado (projeto menor): 3 dias. Extensão: mediante aprovação do Diretor Criativo com justificativa.

  9. Fluxograma

Início → Kickoff com Incorporadora → Análise de Concorrência → Definição de Posicionamento → [DECISÃO: Alinhado com cliente?] → Sim: Moodboard → Não: Realinhar → Paleta e Materialidade → Tom de Voz → Compilação do Briefing → Validação Interna → [APROVAÇÃO Interna] → Apresentação ao Cliente → [APROVAÇÃO Cliente] → Distribuição para BUs → Fim

  10. Glossário

Arquétipo: Modelo simbólico de personalidade de marca (Jung). KV: Key Visual — imagem-chave do empreendimento. Moodboard: Painel visual de referências e direção estética. Paleta Cromática: Conjunto de cores definidas para o projeto. Materialidade: Definição de texturas e materiais visuais. Tom de Voz: Estilo e personalidade da comunicação escrita. Manifesto: Texto conceitual que sintetiza a essência do empreendimento. BU: Business Unit (unidade de negócio).

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'critical',
    ARRAY['briefing','direção-criativa','posicionamento','moodboard','marca','incorporadora','estratégia']::TEXT[],
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

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Padronizar o processo de construção do briefing criativo para novos empreendimentos imobiliários, garantindo que todas as BUs da TBO (3D, Branding, Marketing, Audiovisual) trabalhem a partir de uma mesma base estratégica e estética. O briefing criativo é o documento-mãe que alimenta todos os desdobramentos visuais e narrativos do projeto.', '', 0, 'step'),
  (v_sop_id, '2. Escopo', '**2.1 O que está coberto**

Definição de posicionamento do empreendimento, arquétipo de marca, tom de voz, universo visual, paleta cromática, materialidade, referências visuais, direção de fotografia/render e narrativa central.

**2.2 Exclusões**

Execução de peças (coberta por SOPs específicos de cada BU). Planejamento de mídia. Precificação comercial.', '', 1, 'step'),
  (v_sop_id, '3. Responsáveis (RACI)', 'Diretor Criativo | Construção do briefing | Incorporadora | Atendimento | Todas as BUs
Atendimento | Coleta de inputs do cliente | Marco (Dir. Criativo) | Comercial | PO do projeto
Diretor Estratégia | Validação de posicionamento | Marco (Dir. Criativo) | — | Equipe criativa', '', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '**4.1 Inputs necessários**

Projeto arquitetônico (plantas, implantação, fachada), memorial descritivo, localização e entorno, público-alvo definido pela incorporadora, análise de concorrência, briefing comercial, histórico de projetos anteriores.

**4.2 Ferramentas e Acessos**

Figma (moodboard), Pinterest (referências), Google Drive (documentação), Notion ou TBO OS (registro), Adobe Creative Suite.', '', 3, 'step'),
  (v_sop_id, '5.1. Kickoff com incorporadora', 'Ação: Reunião de imersão com cliente para entender visão, público, diferenciação e expectativas

Responsável: Atendimento + Diretor Criativo

Output: Ata de kickoff + inputs brutos coletados

Prazo referência: 1 dia', '', 4, 'step'),
  (v_sop_id, '5.2. Análise de contexto e concorrência', 'Ação: Mapear empreendimentos concorrentes na região, analisar posicionamento visual e narrativo, identificar gaps e oportunidades

Responsável: Diretor Criativo

Output: Documento de análise competitiva (3-5 concorrentes)

Prazo referência: 1-2 dias', '', 5, 'step'),
  (v_sop_id, '5.3. Definição de posicionamento e arquétipo', 'Ação: Definir arquétipo de marca (Explorador, Sábio, Criador, etc.), posicionamento vs. concorrência, essência da marca

Responsável: Diretor Criativo + Diretor Estratégia

Output: One-page de posicionamento (arquétipo + essência + promessa)

Prazo referência: 1 dia', '', 6, 'step'),
  (v_sop_id, '5.4. Construção do moodboard', 'Ação: Curar 30-50 referências visuais organizadas por categoria (arquitetura, lifestyle, materialidade, paisagismo, interiores, gráfico). Montar board no Figma com anotações de direção.

Responsável: Diretor Criativo

Output: Moodboard no Figma (link compartilhável)

Prazo referência: 1-2 dias', '', 7, 'step'),
  (v_sop_id, '5.5. Definição de paleta cromática e materialidade', 'Ação: Selecionar paleta principal (3-5 cores) e paleta de apoio. Definir materiais-chave (madeira, metal, pedra, vidro) com referências fotográficas.

Responsável: Diretor Criativo

Output: Prancha de paleta + materialidade

Prazo referência: 0,5 dia', '', 8, 'step'),
  (v_sop_id, '5.6. Definição de tom de voz e narrativa', 'Ação: Definir tom de comunicação (sofisticado, acolhedor, aspiracional, etc.), mensagem-chave, manifesto e guidelines de copy.

Responsável: Diretor Criativo

Output: Documento de tom de voz + manifesto

Prazo referência: 1 dia', '', 9, 'step'),
  (v_sop_id, '5.7. Compilação do briefing criativo', 'Ação: Consolidar todos os outputs em documento único: Posicionamento → Moodboard → Paleta → Materialidade → Tom de Voz → Narrativa → Diretrizes por BU

Responsável: Diretor Criativo

Output: Briefing Criativo Master (documento final)

Prazo referência: 1 dia', '', 10, 'step'),
  (v_sop_id, '5.8. Validação interna', 'Ação: Apresentar briefing para líderes de cada BU, coletar feedback, ajustar

Responsável: Diretor Criativo

Output: Briefing aprovado internamente

Prazo referência: 0,5 dia', '', 11, 'checkpoint'),
  (v_sop_id, '5.9. Apresentação e aprovação do cliente', 'Ação: Apresentar briefing à incorporadora. Documentar feedbacks e ajustes. Obter aprovação formal.

Responsável: Atendimento + Diretor Criativo

Output: Briefing aprovado pelo cliente (e-mail/ata)

Prazo referência: 1 dia + tempo do cliente', '', 12, 'checkpoint'),
  (v_sop_id, '6. Critérios de Qualidade', 'Posicionamento claro e diferenciado. Arquétipo de marca definido com justificativa. Moodboard com mínimo 30 referências categorizadas. Paleta cromática com códigos HEX/RGB. Materialidade com fotos de referência. Tom de voz com exemplos de copy (do/dont). Narrativa central (manifesto ou conceito). Diretrizes específicas por BU (3D, Branding, MKT, AV). Aprovação documentada (interna + cliente).', '', 13, 'step'),
  (v_sop_id, '7. Ferramentas e Templates', 'Figma (moodboard + pranchas de direção), Pinterest (curadoria de referências), Google Drive (atas e documentação), Adobe InDesign (formatação do briefing), TBO OS (registro e tracking), Fireflies (transcrição de reuniões).', '', 14, 'step'),
  (v_sop_id, '8. SLAs e Prazos', 'Prazo padrão total: 5-8 dias úteis. Kickoff a briefing compilado: 5 dias. Validação interna: 1 dia. Apresentação ao cliente: 1 dia + tempo de retorno. Briefing simplificado (projeto menor): 3 dias.', '', 15, 'step'),
  (v_sop_id, '9. Fluxograma', 'Início → Kickoff com Incorporadora → Análise de Concorrência → Definição de Posicionamento → [DECISÃO: Alinhado com cliente?] → Sim: Moodboard → Não: Realinhar → Paleta e Materialidade → Tom de Voz → Compilação do Briefing → Validação Interna → [APROVAÇÃO Interna] → Apresentação ao Cliente → [APROVAÇÃO Cliente] → Distribuição para BUs → Fim', '', 16, 'step'),
  (v_sop_id, '10. Glossário', 'Arquétipo: Modelo simbólico de personalidade de marca (Jung). KV: Key Visual — imagem-chave do empreendimento. Moodboard: Painel visual de referências e direção estética. Paleta Cromática: Conjunto de cores definidas para o projeto. Materialidade: Definição de texturas e materiais visuais. Tom de Voz: Estilo e personalidade da comunicação escrita. Manifesto: Texto conceitual que sintetiza a essência. BU: Business Unit.', '', 17, 'step');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-002: Direção de Câmeras 3D
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Direção de Câmeras 3D',
    'tbo-dc-002-direcao-cameras-3d',
    'digital-3d',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Direção de Câmeras 3D

Código

TBO-DC-002

Versão

1.0

Data de Criação

2026-03-22

Última Atualização

2026-03-22

Área / BU

Digital 3D / Direção Criativa

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato


  1. Objetivo

Definir o processo de direção de câmeras para renders 3D de empreendimentos imobiliários, desde a definição dos ângulos estratégicos até a aprovação final dos enquadramentos. Este SOP garante que cada imagem renderizada tenha intencionalidade narrativa, valorize o empreendimento e esteja alinhada ao briefing criativo.

  2. Escopo

2.1 O que está coberto

Definição de câmeras externas (fachada, aérea, perspectiva pedestre, implantação), câmeras internas (unidade-tipo, áreas comuns, rooftop), câmeras de detalhe (materialidade, paisagismo). Inclui composição, lente, altura, iluminação sugerida e mood de cada take.

2.2 Exclusões

Renderização final (SOP específico). Animação de câmera para vídeo (SOP de Audiovisual). Pós-produção de imagem (SOP específico).

  3. Responsáveis (RACI)

Papel | Responsável | Aprovador | Consultado | Informado
Diretor Criativo | Definição de câmeras e composição | — | Coordenador 3D | Incorporadora
Artista 3D | Posicionamento técnico da câmera | Marco (Dir. Criativo) | — | PO do projeto
Coordenador 3D | Viabilidade técnica | Marco (Dir. Criativo) | Artista 3D | Equipe de render

  4. Pré-requisitos

4.1 Inputs necessários

Briefing criativo aprovado (TBO-DC-001), modelo 3D com volumetria finalizada (TBO-3D-001), plantas com dimensões, referências de enquadramento aprovadas, lista de imagens contratadas pelo cliente.

4.2 Ferramentas e Acessos

3ds Max / SketchUp (câmeras), V-Ray / Corona (preview), Figma (prancha de câmeras), Google Drive (referências), TBO OS (tracking).

  5. Procedimento Passo a Passo

5.1. Análise do briefing e lista de imagens

Ação: Revisar briefing criativo, identificar quais imagens foram contratadas, entender hierarquia visual (KV, secundárias, detalhe).

Responsável: Diretor Criativo

Output: Lista de câmeras necessárias com prioridade

Prazo referência: 0,5 dia

5.2. Estudo de implantação e ângulos

Ação: Analisar implantação, orientação solar, entorno, pontos de vista mais favoráveis. Definir ângulos que valorizam fachada e contexto urbano.

Responsável: Diretor Criativo + Artista 3D

Output: Mapa de ângulos sobre implantação

Prazo referência: 0,5 dia

5.3. Definição de composição por câmera

Ação: Para cada câmera, definir: altura (pedestre 1.60m, aérea drone, aérea satélite), lente (24mm grande angular, 35mm natural, 50mm retrato, 85mm detalhe), regra de composição (terços, simetria, leading lines), mood e horário sugerido (golden hour, blue hour, dia, noite), elementos de primeiro plano (vegetação, pessoas, carros).

Responsável: Diretor Criativo

Output: Prancha de direção por câmera (Figma)

Prazo referência: 1-2 dias

[ATENÇÃO] Cada câmera deve ter propósito narrativo — não criar câmeras apenas por quantidade. Perguntar: "O que esta imagem vende?"

5.4. Posicionamento técnico no modelo

Ação: Artista 3D posiciona câmeras no modelo 3D conforme direção. Gerar preview clay (sem materiais) para validação de composição.

Responsável: Artista 3D

Output: Previews clay de todas as câmeras

Prazo referência: 1 dia

5.5. Revisão e ajuste de composição

Ação: Diretor Criativo revisa previews, marca ajustes em vermelho sobre a imagem (crop, rotação, altura, posição), artista implementa correções.

Responsável: Diretor Criativo

Output: Previews aprovados

Prazo referência: 0,5 dia

[DECISÃO] Se mais de 3 câmeras precisam reposicionamento significativo, agendar sessão conjunta (DC + Artista) ao vivo no modelo

5.6. Validação com cliente (opcional)

Ação: Se contrato prevê, apresentar previews de composição ao cliente para pré-aprovação antes de render final.

Responsável: Atendimento + Diretor Criativo

Output: Aprovação de composição pelo cliente

Prazo referência: 1 dia + tempo do cliente

5.7. Documentação final de câmeras

Ação: Criar prancha final com todas as câmeras aprovadas: thumbnail do preview, lente, altura, horário, mood, notas especiais. Documento vira referência para render e pós.

Responsável: Diretor Criativo

Output: Prancha de Câmeras Final (PDF/Figma)

Prazo referência: 0,5 dia

[APROVAÇÃO] Câmeras aprovadas — habilita render

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Cada câmera com propósito narrativo documentado. Lente e altura definidas (não "automáticas"). Composição intencional (regra de terços, leading lines, simetria). Mood e horário definidos. Preview clay aprovado pelo Diretor Criativo. Elementos de primeiro plano definidos. Prancha de câmeras completa com thumbnails.

6.2 Erros Comuns a Evitar

Câmeras com ângulo de "maquete" (muito aéreas, sem escala humana). Lente muito grande angular distorcendo fachada. Falta de elementos de primeiro plano (imagem "vazia"). Todas as câmeras no mesmo horário/mood (monotonia visual). Câmera sem propósito claro ("porque cabe no pacote").

  7. Ferramentas e Templates

3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+ / Corona 10+ (preview), Figma (prancha de câmeras), Google Drive (referências e apresentação), Adobe Photoshop (marcações de revisão), TBO OS (tracking de aprovação).

  8. SLAs e Prazos

Prazo padrão total: 3-5 dias úteis. Definição de câmeras: 2 dias. Posicionamento + preview: 1 dia. Revisão e ajuste: 1 dia. Documentação: 0,5 dia. Pacote simples (até 5 câmeras): 3 dias. Pacote completo (10+ câmeras): 5 dias.

  9. Fluxograma

Início → Análise do Briefing → Estudo de Implantação → Definição de Composição → Posicionamento no Modelo → Preview Clay → [DECISÃO: Composição OK?] → Sim: Documentação → Não: Ajustes → Validação Cliente (se aplicável) → Prancha Final → [APROVAÇÃO] → Render → Fim

  10. Glossário

Clay render: Preview sem materiais, apenas volumetria e iluminação base. Golden hour: Horário do pôr/nascer do sol com luz dourada. Blue hour: Horário crepuscular com luz azulada. Leading lines: Linhas que guiam o olhar do espectador. KV: Key Visual — a imagem principal do empreendimento. Lente: Distância focal simulada da câmera virtual. Composição: Arranjo dos elementos visuais no enquadramento.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'critical',
    ARRAY['câmeras','3d','render','composição','enquadramento','direção-criativa','archviz']::TEXT[],
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

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Definir o processo de direção de câmeras para renders 3D de empreendimentos imobiliários, desde a definição dos ângulos estratégicos até a aprovação final dos enquadramentos. Cada imagem renderizada deve ter intencionalidade narrativa, valorizar o empreendimento e estar alinhada ao briefing criativo.', '', 0, 'step'),
  (v_sop_id, '2. Escopo', '**2.1 O que está coberto**

Câmeras externas (fachada, aérea, perspectiva pedestre, implantação), câmeras internas (unidade-tipo, áreas comuns, rooftop), câmeras de detalhe (materialidade, paisagismo). Composição, lente, altura, iluminação sugerida e mood de cada take.

**2.2 Exclusões**

Renderização final, animação de câmera para vídeo, pós-produção de imagem.', '', 1, 'step'),
  (v_sop_id, '3. Responsáveis (RACI)', 'Diretor Criativo | Definição de câmeras e composição | — | Coordenador 3D | Incorporadora
Artista 3D | Posicionamento técnico da câmera | Marco (Dir. Criativo) | — | PO do projeto
Coordenador 3D | Viabilidade técnica | Marco (Dir. Criativo) | Artista 3D | Equipe de render', '', 2, 'step'),
  (v_sop_id, '4. Pré-requisitos', '**4.1 Inputs necessários**

Briefing criativo aprovado (TBO-DC-001), modelo 3D com volumetria finalizada (TBO-3D-001), plantas com dimensões, referências de enquadramento, lista de imagens contratadas.

**4.2 Ferramentas**

3ds Max / SketchUp (câmeras), V-Ray / Corona (preview), Figma (prancha de câmeras).', '', 3, 'step'),
  (v_sop_id, '5.1. Análise do briefing e lista de imagens', 'Ação: Revisar briefing criativo, identificar imagens contratadas, entender hierarquia visual (KV, secundárias, detalhe)

Responsável: Diretor Criativo

Output: Lista de câmeras necessárias com prioridade

Prazo referência: 0,5 dia', '', 4, 'step'),
  (v_sop_id, '5.2. Estudo de implantação e ângulos', 'Ação: Analisar implantação, orientação solar, entorno, pontos de vista mais favoráveis

Responsável: Diretor Criativo + Artista 3D

Output: Mapa de ângulos sobre implantação

Prazo referência: 0,5 dia', '', 5, 'step'),
  (v_sop_id, '5.3. Definição de composição por câmera', 'Para cada câmera, definir:
- **Altura**: pedestre 1.60m, aérea drone, aérea satélite
- **Lente**: 24mm grande angular, 35mm natural, 50mm retrato, 85mm detalhe
- **Composição**: terços, simetria, leading lines
- **Mood/Horário**: golden hour, blue hour, dia, noite
- **Primeiro plano**: vegetação, pessoas, carros

Prazo referência: 1-2 dias', '', 6, 'step'),
  (v_sop_id, 'Cada câmera deve ter propósito narrativo', 'Não criar câmeras apenas por quantidade. Para cada câmera, responder: "O que esta imagem vende?" Se não há resposta clara, a câmera não deve existir.', '', 7, 'warning'),
  (v_sop_id, '5.4. Posicionamento técnico no modelo', 'Ação: Artista 3D posiciona câmeras no modelo conforme direção. Gerar preview clay (sem materiais) para validação de composição.

Responsável: Artista 3D

Output: Previews clay de todas as câmeras

Prazo referência: 1 dia', '', 8, 'step'),
  (v_sop_id, '5.5. Revisão e ajuste de composição', 'Ação: Diretor Criativo revisa previews, marca ajustes em vermelho sobre a imagem (crop, rotação, altura, posição)

Responsável: Diretor Criativo

Output: Previews aprovados

Prazo referência: 0,5 dia', '', 9, 'step'),
  (v_sop_id, '5.6. Documentação final de câmeras', 'Criar prancha final com todas as câmeras aprovadas: thumbnail do preview, lente, altura, horário, mood, notas especiais.

Output: Prancha de Câmeras Final (PDF/Figma)

Prazo referência: 0,5 dia', '', 10, 'checkpoint'),
  (v_sop_id, '6. Critérios de Qualidade', 'Cada câmera com propósito narrativo documentado. Lente e altura definidas (não "automáticas"). Composição intencional (regra de terços, leading lines, simetria). Mood e horário definidos. Preview clay aprovado pelo Diretor Criativo. Elementos de primeiro plano definidos. Prancha de câmeras completa com thumbnails.', '', 11, 'step'),
  (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+ / Corona 10+ (preview), Figma (prancha de câmeras), Adobe Photoshop (marcações de revisão), TBO OS (tracking).', '', 12, 'step'),
  (v_sop_id, '8. SLAs e Prazos', 'Prazo padrão total: 3-5 dias úteis. Pacote simples (até 5 câmeras): 3 dias. Pacote completo (10+ câmeras): 5 dias.', '', 13, 'step'),
  (v_sop_id, '9. Fluxograma', 'Início → Análise do Briefing → Estudo de Implantação → Definição de Composição → Posicionamento no Modelo → Preview Clay → [DECISÃO: Composição OK?] → Sim: Documentação → Não: Ajustes → Prancha Final → [APROVAÇÃO] → Render → Fim', '', 14, 'step');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-003: Paleta Cromática e Materialidade
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Paleta Cromática e Materialidade',
    'tbo-dc-003-paleta-cromatica-materialidade',
    'branding',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Paleta Cromática e Materialidade

Código: TBO-DC-003 | Versão: 1.0 | Data: 2026-03-22
Área: Branding / Direção Criativa
Responsável: Marco Andolfato (Diretor Criativo)

  1. Objetivo

Padronizar o processo de definição da paleta cromática e da direção de materialidade para empreendimentos imobiliários. A paleta e a materialidade são a espinha dorsal visual do projeto — influenciam renders 3D, peças gráficas, audiovisual, decoração de stand e comunicação digital.

  2. Escopo

2.1 O que está coberto

Definição de paleta cromática principal e de apoio, seleção de materiais visuais (madeira, metal, pedra, vidro, concreto, tecido), mapeamento de texturas para 3D, direção de cor para peças gráficas e fotografia.

2.2 Exclusões

Aplicação técnica de materiais em 3D (SOP de Modelagem). Design gráfico de peças (SOP de Branding). Projeto de interiores executivo.

  3. Responsáveis (RACI)

Diretor Criativo | Definição de paleta e materialidade | — | Coordenador 3D | Todas as BUs
Designer Gráfico | Aplicação em peças | Marco (Dir. Criativo) | — | Atendimento
Artista 3D | Aplicação em renders | Marco (Dir. Criativo) | Coordenador 3D | PO

  4. Pré-requisitos

4.1 Inputs necessários

Briefing criativo aprovado (TBO-DC-001), projeto arquitetônico com memorial descritivo de acabamentos, moodboard aprovado, referências de concorrência.

4.2 Ferramentas

Adobe Color, Coolors, Figma (pranchas), Substance (texturas), biblioteca de materiais TBO.

  5. Procedimento Passo a Passo

5.1. Extração de cores do moodboard

Ação: Analisar moodboard aprovado e extrair cores dominantes, recorrentes e de acento. Usar Adobe Color ou ferramenta similar para gerar paletas baseadas nas referências.

Responsável: Diretor Criativo

Output: 3-5 opções de paleta (cada uma com 5-7 cores)

Prazo referência: 0,5 dia

5.2. Definição da paleta principal

Ação: Selecionar paleta principal composta por: 1-2 cores primárias (identidade forte), 1-2 cores secundárias (apoio/contraste), 1 cor de acento (destaque/CTA), neutros (branco, cinzas, preto). Documentar com HEX, RGB, CMYK e Pantone.

Responsável: Diretor Criativo

Output: Prancha de paleta com códigos

Prazo referência: 0,5 dia

[ATENÇÃO] A paleta DEVE funcionar em: fundo escuro (peça noturna), fundo claro (peça diurna), impressão (CMYK), digital (RGB) e 3D (materialidade)

5.3. Teste de acessibilidade e contraste

Ação: Verificar contraste WCAG entre combinações de cores da paleta. Garantir legibilidade mínima para textos sobre fundos coloridos.

Responsável: Designer Gráfico

Output: Relatório de contraste (pass/fail por combinação)

Prazo referência: 0,5 dia

5.4. Mapeamento de materialidade

Ação: Para cada material definido no memorial descritivo, selecionar referência visual de alta qualidade. Categorias: Madeira (tipo, tom, veio), Metal (escovado, polido, fosco, cor), Pedra (mármore, granito, porcelanato), Vidro (transparente, fumê, espelhado), Concreto (aparente, liso, texturizado), Tecido/Couro (interiores).

Responsável: Diretor Criativo

Output: Prancha de materialidade (foto referência + nome + especificação)

Prazo referência: 1 dia

5.5. Mapeamento de texturas para 3D

Ação: Para cada material, definir textura específica da biblioteca TBO ou fonte externa (Poliigon, Quixel). Incluir especificações: resolução mínima, tile, bump, displacement.

Responsável: Diretor Criativo + Coordenador 3D

Output: Lista de texturas mapeadas com links

Prazo referência: 1 dia

5.6. Prancha de direção cromática

Ação: Compilar tudo em prancha final: paleta + materialidade + aplicações sugeridas (como usar cada cor/material em cada tipo de peça).

Responsável: Diretor Criativo

Output: Prancha de Direção Cromática (Figma/PDF)

Prazo referência: 0,5 dia

[APROVAÇÃO] Paleta e materialidade aprovadas — distribui para BUs

  6. Critérios de Qualidade

Paleta com códigos em HEX, RGB, CMYK e Pantone. Mínimo 5, máximo 7 cores na paleta principal. Materialidade com foto referência de alta resolução. Texturas 3D mapeadas com resolução mínima 4K. Contraste WCAG verificado. Prancha compilada com aplicações sugeridas.

  7. SLAs e Prazos

Prazo padrão total: 3-4 dias úteis. Empreendimento simples: 2 dias. Empreendimento alto padrão: 4 dias.

  8. Fluxograma

Início → Extração de cores do moodboard → Definição da paleta principal → Teste de contraste → Mapeamento de materialidade → Texturas 3D → Prancha final → [APROVAÇÃO] → Distribuição para BUs → Fim

  9. Glossário

HEX: Código hexadecimal de cor (#FF5733). CMYK: Ciano, Magenta, Amarelo, Preto (impressão). Pantone: Sistema universal de cores. Bump map: Mapa de relevo para texturas 3D. Displacement: Deslocamento geométrico baseado em textura. WCAG: Web Content Accessibility Guidelines.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'high',
    ARRAY['paleta','cores','materialidade','textura','branding','direção-criativa','3d']::TEXT[],
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

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Padronizar o processo de definição da paleta cromática e da direção de materialidade para empreendimentos imobiliários. A paleta e a materialidade são a espinha dorsal visual do projeto — influenciam renders 3D, peças gráficas, audiovisual, decoração de stand e comunicação digital.', '', 0, 'step'),
  (v_sop_id, '2. Escopo', '**Coberto:** Paleta cromática principal e de apoio, seleção de materiais visuais, mapeamento de texturas para 3D, direção de cor para peças gráficas e fotografia.

**Exclusões:** Aplicação técnica de materiais em 3D, design gráfico de peças, projeto de interiores executivo.', '', 1, 'step'),
  (v_sop_id, '5.1. Extração de cores do moodboard', 'Ação: Analisar moodboard aprovado e extrair cores dominantes, recorrentes e de acento

Output: 3-5 opções de paleta (cada uma com 5-7 cores)

Prazo referência: 0,5 dia', '', 2, 'step'),
  (v_sop_id, '5.2. Definição da paleta principal', 'Composição da paleta:
- **1-2 cores primárias** (identidade forte)
- **1-2 cores secundárias** (apoio/contraste)
- **1 cor de acento** (destaque/CTA)
- **Neutros** (branco, cinzas, preto)

Documentar com HEX, RGB, CMYK e Pantone.

Prazo referência: 0,5 dia', '', 3, 'step'),
  (v_sop_id, 'A paleta DEVE funcionar em todos os contextos', 'Fundo escuro (peça noturna), fundo claro (peça diurna), impressão (CMYK), digital (RGB) e 3D (materialidade). Testar todas as combinações antes de aprovar.', '', 4, 'warning'),
  (v_sop_id, '5.3. Teste de acessibilidade e contraste', 'Verificar contraste WCAG entre combinações de cores. Garantir legibilidade mínima para textos sobre fundos coloridos.

Output: Relatório de contraste (pass/fail)

Prazo referência: 0,5 dia', '', 5, 'step'),
  (v_sop_id, '5.4. Mapeamento de materialidade', 'Categorias de materiais:
- **Madeira**: tipo, tom, veio
- **Metal**: escovado, polido, fosco, cor
- **Pedra**: mármore, granito, porcelanato
- **Vidro**: transparente, fumê, espelhado
- **Concreto**: aparente, liso, texturizado
- **Tecido/Couro**: interiores

Output: Prancha de materialidade (foto referência + nome + especificação)

Prazo referência: 1 dia', '', 6, 'step'),
  (v_sop_id, '5.5. Mapeamento de texturas para 3D', 'Para cada material, definir textura da biblioteca TBO ou fonte externa (Poliigon, Quixel). Especificações: resolução mínima 4K, tile, bump, displacement.

Prazo referência: 1 dia', '', 7, 'step'),
  (v_sop_id, '5.6. Prancha de direção cromática', 'Compilar: paleta + materialidade + aplicações sugeridas por tipo de peça

Output: Prancha de Direção Cromática (Figma/PDF)

Prazo referência: 0,5 dia', '', 8, 'checkpoint'),
  (v_sop_id, '6. Critérios de Qualidade', 'Paleta com códigos em HEX, RGB, CMYK e Pantone. Mínimo 5, máximo 7 cores. Materialidade com foto referência de alta resolução. Texturas 3D mapeadas com resolução mínima 4K. Contraste WCAG verificado.', '', 9, 'step'),
  (v_sop_id, '8. SLAs e Prazos', 'Prazo padrão: 3-4 dias úteis. Empreendimento simples: 2 dias. Alto padrão: 4 dias.', '', 10, 'step');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-004: Moodboard e Curadoria de Referências
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Moodboard e Curadoria de Referências',
    'tbo-dc-004-moodboard-curadoria',
    'geral',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Moodboard e Curadoria de Referências

Código: TBO-DC-004 | Versão: 1.0 | Data: 2026-03-22
Área: Direção Criativa (Cross-BU)
Responsável: Marco Andolfato (Diretor Criativo)

  1. Objetivo

Padronizar o processo de criação de moodboards e curadoria de referências visuais para empreendimentos imobiliários. O moodboard é o alicerce visual do briefing criativo — traduz posicionamento abstrato em direção estética tangível para todas as BUs.

  2. Escopo

Coberto: Curadoria de referências visuais, organização por categoria, montagem de moodboard no Figma, anotações de direção, apresentação e aprovação.

Exclusões: Criação de peças gráficas. Fotografias originais. Produção de conteúdo.

  3. Responsáveis (RACI)

Diretor Criativo | Curadoria e montagem | — | Líderes de BU | Incorporadora
Assistente Criativo | Pesquisa inicial de referências | Marco (Dir. Criativo) | — | —

  4. Pré-requisitos

Posicionamento do empreendimento definido, arquétipo de marca, público-alvo, briefing comercial da incorporadora, projeto arquitetônico (plantas/fachada).

  5. Procedimento Passo a Passo

5.1. Pesquisa ampla de referências

Ação: Pesquisar 100-150 referências em fontes curadas: Behance, Pinterest, Archdaily, Dezeen, Instagram (contas de archviz/design), bibliotecas internas TBO. Não filtrar neste momento — volume.

Responsável: Diretor Criativo (ou assistente sob supervisão)

Output: Pasta com 100-150 imagens brutas

Prazo referência: 1 dia

5.2. Primeira curadoria (filtro de aderência)

Ação: Filtrar para 40-60 imagens que aderem ao posicionamento. Critérios: alinhamento com arquétipo, coerência de linguagem, relevância para o público-alvo, diferenciação dos concorrentes.

Responsável: Diretor Criativo

Output: Seleção curada (40-60 imagens)

Prazo referência: 0,5 dia

5.3. Categorização

Ação: Organizar referências em categorias: Arquitetura (fachadas, volumetria), Interiores (ambientes, mobiliário), Paisagismo (vegetação, áreas externas), Lifestyle (pessoas, momentos, aspiracional), Materialidade (texturas, acabamentos), Gráfico (tipografia, layout, cores), Fotografia (estilo, iluminação, mood)

Responsável: Diretor Criativo

Output: Imagens categorizadas em pastas/frames

Prazo referência: 0,5 dia

5.4. Montagem do moodboard no Figma

Ação: Criar board organizado visualmente: imagem hero (referência principal), clusters por categoria, anotações de direção em cada imagem ("atenção ao tom quente da madeira", "este enquadramento é a referência para KV"), paleta de cores extraída, keywords visuais.

Responsável: Diretor Criativo

Output: Moodboard no Figma (link compartilhável)

Prazo referência: 1 dia

[ATENÇÃO] O moodboard NÃO é um Pinterest board. É um documento de DIREÇÃO. Cada imagem deve ter razão de estar ali, com anotação do que ela comunica.

5.5. Revisão interna

Ação: Apresentar para líderes de BU. Cada um valida se consegue traduzir a direção visual em entregáveis da sua área.

Responsável: Diretor Criativo

Output: Feedback incorporado, moodboard ajustado

Prazo referência: 0,5 dia

5.6. Apresentação ao cliente

Ação: Apresentar moodboard à incorporadora como parte do briefing criativo. Guiar o cliente pela narrativa visual.

Responsável: Diretor Criativo + Atendimento

Output: Moodboard aprovado

Prazo referência: 1 sessão

[APROVAÇÃO] Moodboard aprovado — alimenta paleta, materialidade e direção de câmeras

  6. Critérios de Qualidade

Mínimo 30 referências curadas (não aleatórias). Organizadas em mínimo 5 categorias. Cada referência com anotação de direção. Imagem hero definida. Paleta de cores extraída. Layout limpo e profissional no Figma. Nenhuma imagem de concorrente direto sem anotação explícita.

  7. Ferramentas

Figma (montagem), Pinterest (pesquisa), Behance (referências), Archdaily/Dezeen (arquitetura), Instagram (lifestyle/archviz), Unsplash/Pexels (lifestyle genérico), Google Drive (backup).

  8. SLAs e Prazos

Prazo padrão: 2-3 dias úteis. Moodboard simplificado: 1,5 dia. Moodboard completo (7+ categorias): 3 dias.

  9. Fluxograma

Início → Pesquisa Ampla (100-150 refs) → Primeira Curadoria (40-60) → Categorização → Montagem Figma → Revisão Interna → [APROVAÇÃO Interna] → Apresentação ao Cliente → [APROVAÇÃO Cliente] → Distribuição para BUs → Fim

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'high',
    ARRAY['moodboard','referências','curadoria','direção-criativa','figma','visual']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Padronizar o processo de criação de moodboards e curadoria de referências visuais para empreendimentos imobiliários. O moodboard é o alicerce visual do briefing criativo — traduz posicionamento abstrato em direção estética tangível para todas as BUs.', '', 0, 'step'),
  (v_sop_id, '5.1. Pesquisa ampla de referências', 'Pesquisar 100-150 referências em fontes curadas: Behance, Pinterest, Archdaily, Dezeen, Instagram (contas de archviz/design), bibliotecas internas TBO. Volume primeiro, filtro depois.

Output: Pasta com 100-150 imagens brutas

Prazo referência: 1 dia', '', 1, 'step'),
  (v_sop_id, '5.2. Primeira curadoria', 'Filtrar para 40-60 imagens aderentes ao posicionamento. Critérios: alinhamento com arquétipo, coerência de linguagem, relevância para público-alvo, diferenciação dos concorrentes.

Prazo referência: 0,5 dia', '', 2, 'step'),
  (v_sop_id, '5.3. Categorização', 'Organizar em categorias:
- **Arquitetura** (fachadas, volumetria)
- **Interiores** (ambientes, mobiliário)
- **Paisagismo** (vegetação, áreas externas)
- **Lifestyle** (pessoas, momentos, aspiracional)
- **Materialidade** (texturas, acabamentos)
- **Gráfico** (tipografia, layout, cores)
- **Fotografia** (estilo, iluminação, mood)

Prazo referência: 0,5 dia', '', 3, 'step'),
  (v_sop_id, '5.4. Montagem do moodboard no Figma', 'Criar board organizado: imagem hero (referência principal), clusters por categoria, anotações de direção em cada imagem, paleta de cores extraída, keywords visuais.

Prazo referência: 1 dia', '', 4, 'step'),
  (v_sop_id, 'O moodboard NÃO é um Pinterest board', 'É um documento de DIREÇÃO. Cada imagem deve ter razão de estar ali, com anotação do que ela comunica. Imagens sem anotação de direção = curadoria incompleta.', '', 5, 'warning'),
  (v_sop_id, '5.5. Revisão interna', 'Apresentar para líderes de BU. Cada um valida se consegue traduzir a direção visual em entregáveis da sua área.

Prazo referência: 0,5 dia', '', 6, 'step'),
  (v_sop_id, '5.6. Apresentação e aprovação', 'Apresentar moodboard à incorporadora como parte do briefing criativo. Guiar pela narrativa visual.

Output: Moodboard aprovado

Prazo referência: 1 sessão', '', 7, 'checkpoint'),
  (v_sop_id, '6. Critérios de Qualidade', 'Mínimo 30 referências curadas. Organizadas em 5+ categorias. Cada referência com anotação de direção. Imagem hero definida. Paleta de cores extraída. Layout profissional no Figma.', '', 8, 'step');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-005: Key Visual (KV)
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Key Visual (KV) do Empreendimento',
    'tbo-dc-005-key-visual',
    'branding',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Key Visual (KV) do Empreendimento

Código: TBO-DC-005 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de criação do Key Visual (KV) — a imagem-mãe do empreendimento que define o padrão estético para todas as demais peças. O KV é a primeira imagem que o mercado vê e deve sintetizar posicionamento, qualidade e diferenciação em uma única composição.

  2. Escopo

Coberto: Definição de câmera KV, render em qualidade máxima, pós-produção conceitual, composição com elementos gráficos (logo, tagline), aprovação multi-stakeholder.

Exclusões: Renders secundários. Adaptações de formato. Peças gráficas derivadas.

  5. Procedimento Passo a Passo

5.1. Seleção da câmera KV

Ação: A partir da prancha de câmeras (TBO-DC-002), selecionar O ângulo que melhor sintetiza o empreendimento. Critérios: impacto visual, clareza do produto, diferenciação, escalabilidade para múltiplos formatos.

Responsável: Diretor Criativo

Output: Câmera KV definida com justificativa

Prazo referência: Junto com DC-002

5.2. Render KV em qualidade máxima

Ação: Renderizar câmera KV com qualidade final: resolução 8000x5000px mínimo, iluminação refinada, materiais finais, vegetação detalhada, sky HDR selecionado.

Responsável: Artista 3D sênior

Output: Render base KV (TIF/EXR 16-bit)

Prazo referência: 2-3 dias

[ATENÇÃO] O KV NUNCA sai direto do render. Sempre passa por pós-produção conceitual do Diretor Criativo.

5.3. Pós-produção conceitual

Ação: Ajustes de cor e mood (color grading), inserção de pessoas/lifestyle, tratamento de céu e atmosfera, correção de materiais, inserção de vegetação complementar, composição com elementos de primeiro plano.

Responsável: Diretor Criativo + Artista de pós

Output: KV pós-produzido (PSD em layers)

Prazo referência: 2-3 dias

5.4. Composição com elementos de marca

Ação: Adicionar logo do empreendimento, tagline/assinatura, selo da incorporadora. Definir posicionamento que não compete com a imagem.

Responsável: Designer Gráfico sob direção criativa

Output: KV com marca aplicada

Prazo referência: 0,5 dia

5.5. Revisão do Diretor Criativo

Ação: Revisão pixel a pixel: consistência de cor, qualidade de inserções, legibilidade da marca, impacto geral.

Responsável: Diretor Criativo

Output: KV aprovado internamente

Prazo referência: 0,5 dia

5.6. Aprovação da incorporadora

Ação: Apresentar KV ao cliente com contextualização da direção criativa.

Responsável: Atendimento + Diretor Criativo

Output: KV aprovado pelo cliente

Prazo referência: 1 dia + tempo do cliente

[APROVAÇÃO] KV aprovado — referência para TODAS as peças subsequentes

  6. Critérios de Qualidade

Resolução mínima 8000x5000px. Color grading consistente com briefing. Pessoas/lifestyle integradas naturalmente. Céu coerente com mood definido. Logo legível em todos os formatos. KV funciona em outdoor, digital, material impresso. Impacto visual em 3 segundos (teste de primeiro olhar).

  8. SLAs e Prazos

Prazo padrão total: 5-7 dias úteis. Render: 2-3 dias. Pós-produção: 2-3 dias. Composição + aprovação: 1-2 dias.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'critical',
    ARRAY['kv','key-visual','render','pós-produção','marca','direção-criativa','hero']::TEXT[],
    4,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Definir o processo de criação do Key Visual (KV) — a imagem-mãe do empreendimento. O KV é a primeira imagem que o mercado vê e deve sintetizar posicionamento, qualidade e diferenciação em uma única composição.', '', 0, 'step'),
  (v_sop_id, '5.1. Seleção da câmera KV', 'A partir da prancha de câmeras (TBO-DC-002), selecionar O ângulo que melhor sintetiza o empreendimento. Critérios: impacto visual, clareza do produto, diferenciação, escalabilidade para múltiplos formatos.

Output: Câmera KV definida com justificativa', '', 1, 'step'),
  (v_sop_id, '5.2. Render KV em qualidade máxima', 'Resolução 8000x5000px mínimo, iluminação refinada, materiais finais, vegetação detalhada, sky HDR selecionado.

Responsável: Artista 3D sênior

Output: Render base KV (TIF/EXR 16-bit)

Prazo: 2-3 dias', '', 2, 'step'),
  (v_sop_id, 'O KV NUNCA sai direto do render', 'Sempre passa por pós-produção conceitual do Diretor Criativo. Render bruto ≠ KV. A diferença entre amador e premium está na pós.', '', 3, 'warning'),
  (v_sop_id, '5.3. Pós-produção conceitual', 'Color grading, inserção de pessoas/lifestyle, tratamento de céu e atmosfera, correção de materiais, vegetação complementar, elementos de primeiro plano.

Output: KV pós-produzido (PSD em layers)

Prazo: 2-3 dias', '', 4, 'step'),
  (v_sop_id, '5.4. Composição com elementos de marca', 'Logo do empreendimento, tagline/assinatura, selo da incorporadora. Posicionamento que não compete com a imagem.

Prazo: 0,5 dia', '', 5, 'step'),
  (v_sop_id, '5.5. Revisão pixel a pixel', 'Consistência de cor, qualidade de inserções, legibilidade da marca, impacto geral.

Output: KV aprovado internamente', '', 6, 'checkpoint'),
  (v_sop_id, '5.6. Aprovação da incorporadora', 'Apresentar com contextualização da direção criativa.

Output: KV aprovado pelo cliente', '', 7, 'checkpoint'),
  (v_sop_id, 'Teste de primeiro olhar', 'O KV deve causar impacto visual em 3 segundos. Se precisa de mais tempo para "funcionar", a composição ou o mood precisam de ajuste. Testar com pessoa de fora do projeto.', '', 8, 'tip'),
  (v_sop_id, '6. Critérios de Qualidade', 'Resolução mínima 8000x5000px. Color grading consistente com briefing. Pessoas integradas naturalmente. Céu coerente com mood. Logo legível em todos os formatos. Funciona em outdoor, digital e impresso.', '', 9, 'step');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-006: Aprovação Criativa (QA de Marca)
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Aprovação Criativa (QA de Marca)',
    'tbo-dc-006-aprovacao-criativa',
    'geral',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Aprovação Criativa (QA de Marca)

Código: TBO-DC-006 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de Quality Assurance criativo para garantir que TODA peça produzida pela TBO esteja alinhada ao briefing criativo, identidade visual e padrão de qualidade do empreendimento. Nenhuma peça sai para o cliente sem passar por este gate.

  2. Escopo

Coberto: Revisão criativa de renders 3D, peças gráficas, vídeos, posts de redes sociais, materiais de PDV, book de vendas, folder, apresentações.

Exclusões: Revisão técnica de modelos 3D (SOP 3D). Revisão de copy/redação (SOP MKT). Testes de impressão.

  5. Procedimento Passo a Passo

5.1. Recebimento da peça para aprovação

Ação: BU submete peça via canal definido (TBO OS ou pasta no Drive). Deve incluir: peça em formato de revisão, briefing criativo de referência, contexto de uso (onde será aplicada).

Responsável: Líder da BU

Output: Peça registrada para aprovação

Prazo referência: Imediato

5.2. Checklist de aderência ao briefing

Ação: Verificar cada item contra o briefing criativo aprovado:
- Paleta cromática correta?
- Materialidade consistente?
- Tom de voz alinhado?
- Tipografia correta?
- Logo com área de proteção respeitada?
- Mood visual coerente com moodboard?
- Hierarquia de informação clara?

Responsável: Diretor Criativo

Output: Checklist preenchido (pass/fail por item)

Prazo referência: 0,5 dia

5.3. Avaliação qualitativa

Ação: Além do checklist técnico, avaliar: impacto visual, originalidade, diferenciação competitiva, adequação ao público-alvo, coerência dentro do ecossistema de peças.

Responsável: Diretor Criativo

Output: Parecer qualitativo (aprovado / aprovado com ressalvas / reprovado)

Prazo referência: Junto com 5.2

5.4. Feedback estruturado

Ação: Se não aprovado, produzir feedback estruturado: o que está errado (específico), por que está errado (referência ao briefing), como corrigir (direção clara), prazo para correção.

Responsável: Diretor Criativo

Output: Documento de feedback com marcações visuais

Prazo referência: Imediato

[ATENÇÃO] Feedback nunca é "não gostei" ou "está estranho". É sempre referenciado ao briefing: "A cor X não está na paleta aprovada" ou "O mood está noturno mas o briefing define golden hour".

5.5. Resubmissão e reavaliação

Ação: BU implementa ajustes e resubmete. Diretor Criativo reavalia apenas os pontos levantados.

Responsável: Líder da BU + Diretor Criativo

Output: Peça aprovada ou novo feedback

Prazo referência: 0,5 dia por rodada

[DECISÃO] Máximo 3 rodadas de revisão. Se após 3 rodadas ainda há problemas, escalar para reunião presencial com a BU.

5.6. Selo de aprovação

Ação: Peça recebe selo de aprovação criativa no TBO OS. Só peças com selo podem ser enviadas ao cliente.

Responsável: Diretor Criativo

Output: Peça com status "Aprovado DC" no sistema

Prazo referência: Imediato

[APROVAÇÃO] Peça aprovada — liberada para envio ao cliente

  6. Critérios de Qualidade

100% das peças passam por QA criativo antes do cliente. Checklist de aderência ao briefing 100% preenchido. Feedback sempre estruturado e referenciado ao briefing. Máximo 3 rodadas de revisão por peça. Tempo máximo de resposta do QA: 24h úteis. Rastreabilidade: todas as aprovações documentadas no TBO OS.

  8. SLAs e Prazos

Primeira resposta do QA: até 24h úteis após submissão. Rodada de revisão: 0,5 dia por rodada. Peça urgente (flag no TBO OS): 4h úteis.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'critical',
    ARRAY['aprovação','qa','qualidade','marca','briefing','checklist','direção-criativa']::TEXT[],
    5,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Garantir que TODA peça produzida pela TBO esteja alinhada ao briefing criativo, identidade visual e padrão de qualidade do empreendimento. Nenhuma peça sai para o cliente sem passar por este gate.', '', 0, 'step'),
  (v_sop_id, '5.1. Recebimento da peça', 'BU submete via TBO OS ou Drive. Deve incluir: peça em formato de revisão, briefing de referência, contexto de uso.

Output: Peça registrada para aprovação', '', 1, 'step'),
  (v_sop_id, '5.2. Checklist de aderência ao briefing', 'Verificar cada item:
- Paleta cromática correta?
- Materialidade consistente?
- Tom de voz alinhado?
- Tipografia correta?
- Logo com área de proteção respeitada?
- Mood visual coerente com moodboard?
- Hierarquia de informação clara?

Output: Checklist preenchido (pass/fail por item)', '', 2, 'step'),
  (v_sop_id, '5.3. Avaliação qualitativa', 'Além do checklist técnico: impacto visual, originalidade, diferenciação competitiva, adequação ao público-alvo, coerência no ecossistema de peças.

Output: Parecer (aprovado / aprovado com ressalvas / reprovado)', '', 3, 'step'),
  (v_sop_id, '5.4. Feedback estruturado', 'Se não aprovado, produzir:
- **O que** está errado (específico)
- **Por que** está errado (referência ao briefing)
- **Como** corrigir (direção clara)
- **Prazo** para correção

Output: Documento de feedback com marcações visuais', '', 4, 'step'),
  (v_sop_id, 'Feedback nunca é subjetivo', 'Nunca "não gostei" ou "está estranho". Sempre referenciado ao briefing: "A cor X não está na paleta aprovada" ou "O mood está noturno mas o briefing define golden hour".', '', 5, 'warning'),
  (v_sop_id, '5.5. Resubmissão', 'BU implementa ajustes e resubmete. Diretor Criativo reavalia apenas os pontos levantados. Máximo 3 rodadas de revisão — se ainda há problemas, escalar para reunião presencial.

Prazo: 0,5 dia por rodada', '', 6, 'step'),
  (v_sop_id, '5.6. Selo de aprovação', 'Peça recebe status "Aprovado DC" no TBO OS. Só peças com selo podem ser enviadas ao cliente.', '', 7, 'checkpoint'),
  (v_sop_id, '6. Critérios de Qualidade', '100% das peças passam por QA antes do cliente. Checklist 100% preenchido. Feedback estruturado e referenciado. Máximo 3 rodadas. Resposta em até 24h úteis. Rastreabilidade no TBO OS.', '', 8, 'step'),
  (v_sop_id, 'SLA de urgência', 'Peças com flag "urgente" no TBO OS: resposta do QA em até 4h úteis. Usar com parcimônia — se tudo é urgente, nada é urgente.', '', 9, 'tip');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-007: Direção de Arte para Peças Gráficas
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Direção de Arte para Peças Gráficas',
    'tbo-dc-007-direcao-arte-pecas',
    'branding',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Direção de Arte para Peças Gráficas

Código: TBO-DC-007 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de direção de arte para peças gráficas de empreendimentos imobiliários (folder, book de vendas, outdoor, digital, PDV, redes sociais). Garantir que toda peça gráfica traduza o briefing criativo em comunicação visual de alto impacto e consistente com a identidade do empreendimento.

  2. Escopo

Coberto: Direção de layout, composição gráfica, hierarquia tipográfica, grid, uso de imagem (render + fotografia), aplicação de marca, adaptações de formato.

Exclusões: Redação de copy (SOP de Marketing). Render 3D (SOP Digital 3D). Impressão e acabamento gráfico.

  5. Procedimento Passo a Passo

5.1. Briefing de peça

Ação: Receber demanda com: objetivo da peça, formato/dimensão, canal de veiculação, público-alvo, conteúdo textual aprovado, imagens disponíveis (renders, fotos).

Responsável: Atendimento → Diretor Criativo

Output: Briefing de peça preenchido

Prazo referência: Imediato

5.2. Definição de grid e layout

Ação: Definir grid base da peça: margens, colunas, áreas de respiro. Para cada formato, estabelecer hierarquia: imagem hero, headline, body, CTA, logo/assinatura.

Responsável: Diretor Criativo

Output: Wireframe/sketch de layout

Prazo referência: 0,5 dia

5.3. Composição visual

Ação: Montar composição combinando: render/fotografia (tratados conforme briefing), elementos gráficos (formas, texturas, patterns), tipografia (família, peso, hierarquia), paleta cromática (conforme TBO-DC-003), espaço negativo (a peça precisa respirar).

Responsável: Designer Gráfico sob direção criativa

Output: Layout V1

Prazo referência: 1-2 dias

[ATENÇÃO] Menos é mais. A tendência no mercado imobiliário é poluição visual. A TBO se diferencia pela sofisticação e respiro.

5.4. Revisão de composição

Ação: Diretor Criativo revisa: equilíbrio visual, hierarquia de leitura, impacto da imagem, legibilidade, aderência ao briefing, diferenciação.

Responsável: Diretor Criativo

Output: Feedback de ajustes (se necessário)

Prazo referência: 0,5 dia

5.5. Adaptações de formato

Ação: A partir da peça master, adaptar para formatos necessários: outdoor, mídias digitais (stories, feed, banner), material impresso, PDV. Manter consistência visual em todas as adaptações.

Responsável: Designer Gráfico

Output: Kit de peças adaptadas

Prazo referência: 1-2 dias

5.6. Aprovação criativa

Ação: Submeter ao fluxo de QA de Marca (TBO-DC-006).

Responsável: Designer Gráfico → Diretor Criativo

Output: Peças aprovadas

Prazo referência: Conforme SLA do DC-006

  6. Critérios de Qualidade

Grid consistente em toda a campanha. Hierarquia tipográfica clara (máximo 2 famílias). Paleta cromática fiel ao briefing (TBO-DC-003). Imagens em alta resolução (300dpi impressão, 72dpi digital). Logo com área de proteção respeitada. Espaço negativo adequado (peça não "sufoca"). Texto legível em tamanho real de veiculação.

  7. Regras de Tipografia

Máximo 2 famílias tipográficas por projeto. Headline: peso bold ou semibold, tamanho impactante. Body: peso regular, legibilidade prioritária. CTA: destacado mas sem competir com headline. Tracking e leading ajustados por contexto.

  8. SLAs e Prazos

Peça simples (post/banner): 1-2 dias. Peça média (folder 4 páginas): 3-4 dias. Peça complexa (book de vendas): 7-10 dias. Adaptações de formato: +1-2 dias.

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'high',
    ARRAY['direção-de-arte','gráfico','layout','tipografia','branding','peças','folder','outdoor']::TEXT[],
    6,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Definir o processo de direção de arte para peças gráficas de empreendimentos imobiliários. Garantir que toda peça gráfica traduza o briefing criativo em comunicação visual de alto impacto e consistente com a identidade.', '', 0, 'step'),
  (v_sop_id, '5.1. Briefing de peça', 'Receber demanda com: objetivo, formato/dimensão, canal, público-alvo, conteúdo textual aprovado, imagens disponíveis.

Output: Briefing de peça preenchido', '', 1, 'step'),
  (v_sop_id, '5.2. Grid e layout', 'Definir grid base: margens, colunas, áreas de respiro. Hierarquia: imagem hero, headline, body, CTA, logo/assinatura.

Output: Wireframe/sketch de layout

Prazo: 0,5 dia', '', 2, 'step'),
  (v_sop_id, '5.3. Composição visual', 'Combinar: render/fotografia, elementos gráficos, tipografia, paleta cromática (DC-003), espaço negativo.

Output: Layout V1

Prazo: 1-2 dias', '', 3, 'step'),
  (v_sop_id, 'Menos é mais', 'A tendência no mercado imobiliário é poluição visual. A TBO se diferencia pela sofisticação e respiro. Se a peça parece "cheia demais", provavelmente está.', '', 4, 'warning'),
  (v_sop_id, '5.4. Revisão de composição', 'Equilíbrio visual, hierarquia de leitura, impacto da imagem, legibilidade, aderência ao briefing.

Prazo: 0,5 dia', '', 5, 'step'),
  (v_sop_id, '5.5. Adaptações de formato', 'A partir da peça master, adaptar: outdoor, digital (stories, feed, banner), impresso, PDV. Manter consistência visual.

Prazo: 1-2 dias', '', 6, 'step'),
  (v_sop_id, 'Regras de tipografia', 'Máximo 2 famílias tipográficas por projeto. Headline: bold/semibold impactante. Body: regular legível. CTA: destacado sem competir com headline. Tracking e leading ajustados por contexto.', '', 7, 'tip'),
  (v_sop_id, '6. Critérios de Qualidade', 'Grid consistente. Máximo 2 famílias tipográficas. Paleta fiel ao briefing. Imagens em alta resolução. Logo com área de proteção. Espaço negativo adequado. Texto legível em tamanho real.', '', 8, 'step');


  -- ══════════════════════════════════════════════════════════════════
  -- SOP DC-008: Direção de Fotografia e Vídeo Arquitetônico
  -- ══════════════════════════════════════════════════════════════════
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Direção de Fotografia e Vídeo Arquitetônico',
    'tbo-dc-008-direcao-foto-video',
    'audiovisual',
    'processo',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Direção de Fotografia e Vídeo Arquitetônico

Código: TBO-DC-008 | Versão: 1.0 | Data: 2026-03-22

  1. Objetivo

Definir o processo de direção de fotografia e vídeo para empreendimentos imobiliários — tanto para obra em andamento quanto para empreendimentos entregues. Garantir que o material fotográfico e audiovisual siga o padrão estético definido no briefing criativo e comunique a qualidade do produto.

  2. Escopo

Coberto: Direção de fotografia arquitetônica (exterior e interior), direção de vídeo institucional/lançamento, definição de estilo visual (iluminação, composição, mood), seleção de equipe e equipamento, direção em set.

Exclusões: Edição de vídeo (SOP de Audiovisual). Pós-produção fotográfica avançada (SOP específico). Fotografia de eventos.

  5. Procedimento Passo a Passo

5.1. Planejamento de produção

Ação: Definir: lista de takes (fotos/cenas) necessários, horários ideais (golden hour, blue hour, meio-dia para interiores), equipamento (câmera, lentes, drone, gimbal, iluminação), equipe (fotógrafo, videomaker, produtor, assistente), logística (acesso ao canteiro, segurança, permissões).

Responsável: Diretor Criativo + Produtor AV

Output: Plano de produção (shot list + cronograma)

Prazo referência: 2 dias antes da diária

5.2. Definição de estilo visual

Ação: Criar referência visual para fotógrafo/videomaker: estilo de iluminação (natural, artificial, mista), composição (linhas, simetria, escala humana), color mood (quente, frio, neutro, contrastado), referências específicas de resultado esperado (Pinterest/portfólio).

Responsável: Diretor Criativo

Output: Prancha de referência para produção (PDF/Figma)

Prazo referência: Junto com 5.1

5.3. Briefing com equipe de produção

Ação: Apresentar briefing criativo e prancha de referências para toda a equipe. Alinhar expectativas, tirar dúvidas, definir prioridades.

Responsável: Diretor Criativo

Output: Equipe alinhada

Prazo referência: 1 dia antes ou início da diária

5.4. Direção em set

Ação: Dirigir cada take no local: composição, enquadramento, iluminação, elementos em cena (staging de mobiliário, vegetação, pessoas). Para vídeo: movimentos de câmera, ritmo, transições. Para drone: rota de voo, altitude, velocidade.

Responsável: Diretor Criativo

Output: Material bruto capturado

Prazo referência: 1 diária (8-12h)

[ATENÇÃO] Sempre capturar 20-30% a mais de takes do que o planejado. Material extra dá liberdade na edição e protege contra takes que não funcionam.

5.5. Revisão de selects

Ação: Revisar material bruto, selecionar takes aprovados (selects), descartar takes com problemas técnicos ou criativos. Para vídeo: selecionar cenas + definir sequência narrativa.

Responsável: Diretor Criativo

Output: Selects aprovados + direção de edição

Prazo referência: 1 dia após diária

5.6. Direção de pós-produção

Ação: Definir direção de tratamento: color grading, retoque, limpeza de cena (fios, placas), inserção de céu (se necessário), compositing. Para vídeo: ritmo de edição, trilha sonora, tipografia.

Responsável: Diretor Criativo

Output: Briefing de pós-produção

Prazo referência: Junto com 5.5

[APROVAÇÃO] Selects e direção de pós aprovados — equipe de edição inicia trabalho

  6. Critérios de Qualidade

Shot list 100% capturada. Iluminação consistente com briefing. Composição com intencionalidade (não casual). Material bruto em qualidade técnica (foco, exposição, estabilização). Selects revisados pelo Diretor Criativo. Direção de pós documentada.

  7. Equipamento mínimo recomendado

Fotografia: câmera full-frame, lentes 16-35mm + 24-70mm + tilt-shift (arquitetura), tripé, flash portátil. Vídeo: câmera cinema/mirrorless 4K+, gimbal, slider, drone (DJI Mavic 3 ou superior), microfone direcional. Iluminação: painéis LED portáteis para interiores.

  8. SLAs e Prazos

Planejamento: 2 dias antes. Diária de captação: 1 dia. Selects + direção de pós: 1 dia após. Total fotografia: 4 dias úteis. Total vídeo: 5-7 dias úteis (inclui edição).

  11. Histórico de Revisões

Versão | Data | Autor | Alterações
1.0 | 2026-03-22 | Marco Andolfato | Criação inicial do SOP
',
    '',
    'published',
    'high',
    ARRAY['fotografia','vídeo','audiovisual','drone','direção-criativa','produção','arquitetônico']::TEXT[],
    7,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type) VALUES
  (v_sop_id, '1. Objetivo', 'Definir o processo de direção de fotografia e vídeo para empreendimentos imobiliários. Garantir que o material siga o padrão estético do briefing criativo e comunique a qualidade do produto.', '', 0, 'step'),
  (v_sop_id, '5.1. Planejamento de produção', 'Definir: lista de takes, horários ideais (golden hour, blue hour), equipamento, equipe, logística de acesso.

Output: Plano de produção (shot list + cronograma)

Prazo: 2 dias antes da diária', '', 1, 'step'),
  (v_sop_id, '5.2. Definição de estilo visual', 'Criar referência para equipe: estilo de iluminação (natural/artificial/mista), composição (linhas, simetria, escala humana), color mood (quente/frio/neutro), referências específicas.

Output: Prancha de referência (PDF/Figma)', '', 2, 'step'),
  (v_sop_id, '5.3. Briefing com equipe', 'Apresentar briefing criativo e referências. Alinhar expectativas, prioridades.

Prazo: 1 dia antes ou início da diária', '', 3, 'step'),
  (v_sop_id, '5.4. Direção em set', 'Dirigir cada take: composição, enquadramento, iluminação, staging (mobiliário, vegetação, pessoas). Vídeo: movimentos de câmera, ritmo. Drone: rota, altitude, velocidade.

Output: Material bruto capturado

Prazo: 1 diária (8-12h)', '', 4, 'step'),
  (v_sop_id, 'Capturar 20-30% a mais', 'Sempre capturar mais takes do que o planejado. Material extra dá liberdade na edição e protege contra takes que não funcionam na pós.', '', 5, 'tip'),
  (v_sop_id, '5.5. Revisão de selects', 'Revisar material bruto, selecionar takes aprovados, descartar problemas técnicos/criativos. Vídeo: selecionar cenas + sequência narrativa.

Output: Selects aprovados + direção de edição

Prazo: 1 dia após diária', '', 6, 'step'),
  (v_sop_id, '5.6. Direção de pós-produção', 'Definir: color grading, retoque, limpeza de cena, inserção de céu, compositing. Vídeo: ritmo, trilha, tipografia.

Output: Briefing de pós-produção', '', 7, 'step'),
  (v_sop_id, 'Equipamento mínimo', '**Foto:** Full-frame, lentes 16-35mm + 24-70mm + tilt-shift, tripé, flash portátil.
**Vídeo:** Cinema/mirrorless 4K+, gimbal, slider, drone DJI Mavic 3+, mic direcional.
**Iluminação:** Painéis LED portáteis para interiores.', '', 8, 'note'),
  (v_sop_id, '6. Critérios de Qualidade', 'Shot list 100% capturada. Iluminação consistente com briefing. Composição intencional. Material bruto com qualidade técnica (foco, exposição, estabilização). Selects revisados pelo DC. Direção de pós documentada.', '', 9, 'step');


  RAISE NOTICE 'Seed de SOPs de Direção Criativa concluído: 8 SOPs inseridos.';
END $$;
