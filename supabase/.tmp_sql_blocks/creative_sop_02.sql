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
END $$;