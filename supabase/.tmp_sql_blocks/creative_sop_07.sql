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
END $$;