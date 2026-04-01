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
END $$;