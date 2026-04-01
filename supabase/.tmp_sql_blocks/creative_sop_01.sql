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
END $$;