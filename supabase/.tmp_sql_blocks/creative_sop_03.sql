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
END $$;