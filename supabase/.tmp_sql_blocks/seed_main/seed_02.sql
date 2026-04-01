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
    'Planta Perspectivada',
    'tbo-3d-006-planta-perspectivada',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Planta Perspectivada

Código

TBO-3D-006

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Criar plantas perspectivadas (isométricas ou com perspectiva cônica) que permitam ao comprador visualizar o espaço em três dimensões, comunicando pé-direito, volumetria interna e layout de forma intuitiva.

  2. Escopo

2.1 O que está coberto

Modelagem simplificada do layout em 3D (SketchUp ou 3ds Max); configuração de câmera isométrica ou perspectiva; renderização e pós-produção; inserção de mobiliário 3D simplificado; finalização para uso em material comercial.

2.2 Exclusões

Renderização fotorrealista de fachada (coberta pelo SOP 03); planta humanizada 2D (coberta pelo SOP 05); modelagem completa de interiores com materiais fotorrealistas.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D

Modelagem, configuração de câmera e render da planta perspectivada

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo, estilo visual e versão final

Aprovador

—

Gerente de Projetos

Briefing com cliente e entrega de arquivos

Consultado

Informado

Designer Gráfico

Integrar planta perspectivada em layouts de material comercial

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Planta CAD (.dwg) atualizada e aprovada; briefing definindo estilo (isométrico clean, perspectiva realista, estilo explodido); referências visuais aprovadas; lista de ambientes a incluir na visualização.

4.2 Ferramentas e Acessos

SketchUp Pro 2023+ ou 3ds Max; V-Ray for SketchUp ou 3ds Max; Adobe Photoshop; biblioteca de mobiliário 3D simplificado TBO; LayOut (SketchUp) para isométricas técnicas.



  5. Procedimento Passo a Passo

5.1. Importação do CAD e modelagem base

Ação: Importar CAD para SketchUp ou 3ds Max; extrudar paredes na altura de pé-direito real (ex.: 2,70 m, 3,00 m); modelar laje, vãos de porta e janela; não modelar detalhes de acabamento (simplificação intencional).

Responsável: Visualizador 3D

Output: Modelo 3D simplificado com geometria fiel à planta

Prazo referência: 1–2 h

5.2. Inserção de mobiliário 3D simplificado

Ação: Popular os ambientes com mobiliário 3D low-poly da biblioteca TBO; manter escala proporcional; evitar mobiliário excessivamente detalhado — o foco é leitura espacial, não fotorrealismo.

Responsável: Visualizador 3D

Output: Cena com mobiliário em escala e bem distribuído

Prazo referência: 1–2 h

5.3. Configuração de câmera isométrica ou perspectiva

Ação: Para isométrica: configurar projeção paralela em SketchUp (Camera > Parallel Projection), ângulo 45°; para perspectiva cônica: FOV 30–45 mm, câmera elevada; validar com o briefing o ângulo aprovado.

Responsável: Visualizador 3D

Output: Câmera configurada com ângulo aprovado

Prazo referência: 30 min

[DECISÃO] Ângulo e enquadramento aprovados internamente? Sim → render. Não → ajustar câmera.

5.4. Render e linhas de estilo

Ação: Renderizar a cena com iluminação neutra (luz ambiente uniforme + sombra suave); adicionar linhas de arestas (edge rendering) para leitura clara de volumes; se estilo aquarela/sketch, aplicar estilo no SketchUp Style Builder.

Responsável: Visualizador 3D

Output: Render com estilo visual definido exportado

Prazo referência: 1–3 h

5.5. Pós-produção e finalização

Ação: Tratar render no Photoshop: ajustar cor e contraste; inserir fundo branco ou gradiente; adicionar legenda de ambientes (tipografia padrão TBO); inserir escala gráfica e norte se aplicável; revisar com Dir. Criativo e exportar.

Responsável: Visualizador 3D / Pós-produtor

Output: Planta perspectivada finalizada e exportada

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas).

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Pé-direito correto e proporcional (verificar com medida real do projeto). [ ] Mobiliário em escala coerente. [ ] Linhas de aresta limpas e legíveis. [ ] Legenda de ambientes presente e legível. [ ] Estilo visual aderente ao briefing. [ ] Exportação em resolução adequada ao uso (impressão ou digital). [ ] Nomenclatura de arquivo conforme padrão TBO.

6.2 Erros Comuns a Evitar

Proporção distorcida: verificar se pé-direito e largura estão na mesma unidade no CAD importado (1 unidade = 1 cm no SketchUp). Isométrica deformada: confirmar que Parallel Projection está ativado no SketchUp. Mobiliário gigante/minúsculo: reescalar usando grupos e verificar com porta como referência (2,10 m).

  7. Ferramentas e Templates

SketchUp Pro 2023+ com V-Ray for SketchUp; 3ds Max + Corona (alternativa para renders mais realistas); Photoshop; LayOut para composição final com legendas e escalas.

  8. SLAs e Prazos

Planta perspectivada padrão (até 100 m²): 2 dias úteis. Planta perspectivada complexa / múltiplos ângulos: 3–4 dias úteis. Revisão pós-feedback cliente: 1 dia útil por rodada.

  9. Fluxograma

Início → Recebe CAD → Modelagem base (extrusão de paredes) → Inserção de mobiliário → Config. câmera → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render → Pós-produção + legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação → Fim

  10. Glossário

Isométrica: projeção paralela em 30/45° que mantém proporções sem convergência de paralelas. Perspectiva cônica: projeção com ponto de fuga, mais próxima da percepção humana real. Pé-direito: altura interna entre o piso e o teto. Edge rendering: técnica de renderizar linhas de aresta sobre a imagem para reforçar leitura volumétrica. Low-poly: modelo 3D com baixa contagem de polígonos, usado para visualizações esquemáticas.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Planta Perspectivada</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Criar plantas perspectivadas (isométricas ou com perspectiva cônica) que permitam ao comprador visualizar o espaço em três dimensões, comunicando pé-direito, volumetria interna e layout de forma intuitiva.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Modelagem simplificada do layout em 3D (SketchUp ou 3ds Max); configuração de câmera isométrica ou perspectiva; renderização e pós-produção; inserção de mobiliário 3D simplificado; finalização para uso em material comercial.</p><p><strong>2.2 Exclusões</strong></p><p>Renderização fotorrealista de fachada (coberta pelo SOP 03); planta humanizada 2D (coberta pelo SOP 05); modelagem completa de interiores com materiais fotorrealistas.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D</p></td><td><p>Modelagem, configuração de câmera e render da planta perspectivada</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar ângulo, estilo visual e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Briefing com cliente e entrega de arquivos</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Designer Gráfico</p></td><td><p>Integrar planta perspectivada em layouts de material comercial</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Planta CAD (.dwg) atualizada e aprovada; briefing definindo estilo (isométrico clean, perspectiva realista, estilo explodido); referências visuais aprovadas; lista de ambientes a incluir na visualização.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>SketchUp Pro 2023+ ou 3ds Max; V-Ray for SketchUp ou 3ds Max; Adobe Photoshop; biblioteca de mobiliário 3D simplificado TBO; LayOut (SketchUp) para isométricas técnicas.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Importação do CAD e modelagem base</strong></p><p>Ação: Importar CAD para SketchUp ou 3ds Max; extrudar paredes na altura de pé-direito real (ex.: 2,70 m, 3,00 m); modelar laje, vãos de porta e janela; não modelar detalhes de acabamento (simplificação intencional).</p><p>Responsável: Visualizador 3D</p><p>Output: Modelo 3D simplificado com geometria fiel à planta</p><p>Prazo referência: 1–2 h</p><p><strong>5.2. Inserção de mobiliário 3D simplificado</strong></p><p>Ação: Popular os ambientes com mobiliário 3D low-poly da biblioteca TBO; manter escala proporcional; evitar mobiliário excessivamente detalhado — o foco é leitura espacial, não fotorrealismo.</p><p>Responsável: Visualizador 3D</p><p>Output: Cena com mobiliário em escala e bem distribuído</p><p>Prazo referência: 1–2 h</p><p><strong>5.3. Configuração de câmera isométrica ou perspectiva</strong></p><p>Ação: Para isométrica: configurar projeção paralela em SketchUp (Camera &gt; Parallel Projection), ângulo 45°; para perspectiva cônica: FOV 30–45 mm, câmera elevada; validar com o briefing o ângulo aprovado.</p><p>Responsável: Visualizador 3D</p><p>Output: Câmera configurada com ângulo aprovado</p><p>Prazo referência: 30 min</p><p><strong>[DECISÃO] Ângulo e enquadramento aprovados internamente? Sim → render. Não → ajustar câmera.</strong></p><p><strong>5.4. Render e linhas de estilo</strong></p><p>Ação: Renderizar a cena com iluminação neutra (luz ambiente uniforme + sombra suave); adicionar linhas de arestas (edge rendering) para leitura clara de volumes; se estilo aquarela/sketch, aplicar estilo no SketchUp Style Builder.</p><p>Responsável: Visualizador 3D</p><p>Output: Render com estilo visual definido exportado</p><p>Prazo referência: 1–3 h</p><p><strong>5.5. Pós-produção e finalização</strong></p><p>Ação: Tratar render no Photoshop: ajustar cor e contraste; inserir fundo branco ou gradiente; adicionar legenda de ambientes (tipografia padrão TBO); inserir escala gráfica e norte se aplicável; revisar com Dir. Criativo e exportar.</p><p>Responsável: Visualizador 3D / Pós-produtor</p><p>Output: Planta perspectivada finalizada e exportada</p><p>Prazo referência: 1 h + ciclo revisão 24 h</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas).</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Pé-direito correto e proporcional (verificar com medida real do projeto). [ ] Mobiliário em escala coerente. [ ] Linhas de aresta limpas e legíveis. [ ] Legenda de ambientes presente e legível. [ ] Estilo visual aderente ao briefing. [ ] Exportação em resolução adequada ao uso (impressão ou digital). [ ] Nomenclatura de arquivo conforme padrão TBO.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Proporção distorcida: verificar se pé-direito e largura estão na mesma unidade no CAD importado (1 unidade = 1 cm no SketchUp). Isométrica deformada: confirmar que Parallel Projection está ativado no SketchUp. Mobiliário gigante/minúsculo: reescalar usando grupos e verificar com porta como referência (2,10 m).</p><p><strong>  7. Ferramentas e Templates</strong></p><p>SketchUp Pro 2023+ com V-Ray for SketchUp; 3ds Max + Corona (alternativa para renders mais realistas); Photoshop; LayOut para composição final com legendas e escalas.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Planta perspectivada padrão (até 100 m²): 2 dias úteis. Planta perspectivada complexa / múltiplos ângulos: 3–4 dias úteis. Revisão pós-feedback cliente: 1 dia útil por rodada.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebe CAD → Modelagem base (extrusão de paredes) → Inserção de mobiliário → Config. câmera → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render → Pós-produção + legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação → Fim</p><p><strong>  10. Glossário</strong></p><p>Isométrica: projeção paralela em 30/45° que mantém proporções sem convergência de paralelas. Perspectiva cônica: projeção com ponto de fuga, mais próxima da percepção humana real. Pé-direito: altura interna entre o piso e o teto. Edge rendering: técnica de renderizar linhas de aresta sobre a imagem para reforçar leitura volumétrica. Low-poly: modelo 3D com baixa contagem de polígonos, usado para visualizações esquemáticas.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar plantas perspectivadas (isométricas ou com perspectiva cônica) que permitam ao comprador visualizar o espaço em três dimensões, comunicando pé-direito, volumetria interna e layout de forma intuitiva.', '<p>Criar plantas perspectivadas (isométricas ou com perspectiva cônica) que permitam ao comprador visualizar o espaço em três dimensões, comunicando pé-direito, volumetria interna e layout de forma intuitiva.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem simplificada do layout em 3D (SketchUp ou 3ds Max); configuração de câmera isométrica ou perspectiva; renderização e pós-produção; inserção de mobiliário 3D simplificado; finalização para uso em material comercial.', '<p>Modelagem simplificada do layout em 3D (SketchUp ou 3ds Max); configuração de câmera isométrica ou perspectiva; renderização e pós-produção; inserção de mobiliário 3D simplificado; finalização para uso em material comercial.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Renderização fotorrealista de fachada (coberta pelo SOP 03); planta humanizada 2D (coberta pelo SOP 05); modelagem completa de interiores com materiais fotorrealistas.', '<p>Renderização fotorrealista de fachada (coberta pelo SOP 03); planta humanizada 2D (coberta pelo SOP 05); modelagem completa de interiores com materiais fotorrealistas.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D

Modelagem, configuração de câmera e render da planta perspectivada

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo, estilo visual e versão final

Aprovador

—

Gerente de Projetos

Briefing com cliente e entrega de arquivos

Consultado

Informado

Designer Gráfico

Integrar planta perspectivada em layouts de material comercial

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D</p></td><td><p>Modelagem, configuração de câmera e render da planta perspectivada</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar ângulo, estilo visual e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Briefing com cliente e entrega de arquivos</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Designer Gráfico</p></td><td><p>Integrar planta perspectivada em layouts de material comercial</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Planta CAD (.dwg) atualizada e aprovada; briefing definindo estilo (isométrico clean, perspectiva realista, estilo explodido); referências visuais aprovadas; lista de ambientes a incluir na visualização.', '<p>Planta CAD (.dwg) atualizada e aprovada; briefing definindo estilo (isométrico clean, perspectiva realista, estilo explodido); referências visuais aprovadas; lista de ambientes a incluir na visualização.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'SketchUp Pro 2023+ ou 3ds Max; V-Ray for SketchUp ou 3ds Max; Adobe Photoshop; biblioteca de mobiliário 3D simplificado TBO; LayOut (SketchUp) para isométricas técnicas.', '<p>SketchUp Pro 2023+ ou 3ds Max; V-Ray for SketchUp ou 3ds Max; Adobe Photoshop; biblioteca de mobiliário 3D simplificado TBO; LayOut (SketchUp) para isométricas técnicas.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Importação do CAD e modelagem base', 'Ação: Importar CAD para SketchUp ou 3ds Max; extrudar paredes na altura de pé-direito real (ex.: 2,70 m, 3,00 m); modelar laje, vãos de porta e janela; não modelar detalhes de acabamento (simplificação intencional).

Responsável: Visualizador 3D

Output: Modelo 3D simplificado com geometria fiel à planta

Prazo referência: 1–2 h', '<p>Ação: Importar CAD para SketchUp ou 3ds Max; extrudar paredes na altura de pé-direito real (ex.: 2,70 m, 3,00 m); modelar laje, vãos de porta e janela; não modelar detalhes de acabamento (simplificação intencional).</p><p>Responsável: Visualizador 3D</p><p>Output: Modelo 3D simplificado com geometria fiel à planta</p><p>Prazo referência: 1–2 h</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Inserção de mobiliário 3D simplificado', 'Ação: Popular os ambientes com mobiliário 3D low-poly da biblioteca TBO; manter escala proporcional; evitar mobiliário excessivamente detalhado — o foco é leitura espacial, não fotorrealismo.

Responsável: Visualizador 3D

Output: Cena com mobiliário em escala e bem distribuído

Prazo referência: 1–2 h', '<p>Ação: Popular os ambientes com mobiliário 3D low-poly da biblioteca TBO; manter escala proporcional; evitar mobiliário excessivamente detalhado — o foco é leitura espacial, não fotorrealismo.</p><p>Responsável: Visualizador 3D</p><p>Output: Cena com mobiliário em escala e bem distribuído</p><p>Prazo referência: 1–2 h</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Configuração de câmera isométrica ou perspectiva', 'Ação: Para isométrica: configurar projeção paralela em SketchUp (Camera > Parallel Projection), ângulo 45°; para perspectiva cônica: FOV 30–45 mm, câmera elevada; validar com o briefing o ângulo aprovado.

Responsável: Visualizador 3D

Output: Câmera configurada com ângulo aprovado

Prazo referência: 30 min

[DECISÃO] Ângulo e enquadramento aprovados internamente? Sim → render. Não → ajustar câmera.', '<p>Ação: Para isométrica: configurar projeção paralela em SketchUp (Camera &gt; Parallel Projection), ângulo 45°; para perspectiva cônica: FOV 30–45 mm, câmera elevada; validar com o briefing o ângulo aprovado.</p><p>Responsável: Visualizador 3D</p><p>Output: Câmera configurada com ângulo aprovado</p><p>Prazo referência: 30 min</p><p><strong>[DECISÃO] Ângulo e enquadramento aprovados internamente? Sim → render. Não → ajustar câmera.</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Render e linhas de estilo', 'Ação: Renderizar a cena com iluminação neutra (luz ambiente uniforme + sombra suave); adicionar linhas de arestas (edge rendering) para leitura clara de volumes; se estilo aquarela/sketch, aplicar estilo no SketchUp Style Builder.

Responsável: Visualizador 3D

Output: Render com estilo visual definido exportado

Prazo referência: 1–3 h', '<p>Ação: Renderizar a cena com iluminação neutra (luz ambiente uniforme + sombra suave); adicionar linhas de arestas (edge rendering) para leitura clara de volumes; se estilo aquarela/sketch, aplicar estilo no SketchUp Style Builder.</p><p>Responsável: Visualizador 3D</p><p>Output: Render com estilo visual definido exportado</p><p>Prazo referência: 1–3 h</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Pós-produção e finalização', 'Ação: Tratar render no Photoshop: ajustar cor e contraste; inserir fundo branco ou gradiente; adicionar legenda de ambientes (tipografia padrão TBO); inserir escala gráfica e norte se aplicável; revisar com Dir. Criativo e exportar.

Responsável: Visualizador 3D / Pós-produtor

Output: Planta perspectivada finalizada e exportada

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas).', '<p>Ação: Tratar render no Photoshop: ajustar cor e contraste; inserir fundo branco ou gradiente; adicionar legenda de ambientes (tipografia padrão TBO); inserir escala gráfica e norte se aplicável; revisar com Dir. Criativo e exportar.</p><p>Responsável: Visualizador 3D / Pós-produtor</p><p>Output: Planta perspectivada finalizada e exportada</p><p>Prazo referência: 1 h + ciclo revisão 24 h</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas).</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Pé-direito correto e proporcional (verificar com medida real do projeto). [ ] Mobiliário em escala coerente. [ ] Linhas de aresta limpas e legíveis. [ ] Legenda de ambientes presente e legível. [ ] Estilo visual aderente ao briefing. [ ] Exportação em resolução adequada ao uso (impressão ou digital). [ ] Nomenclatura de arquivo conforme padrão TBO.', '<p>[ ] Pé-direito correto e proporcional (verificar com medida real do projeto). [ ] Mobiliário em escala coerente. [ ] Linhas de aresta limpas e legíveis. [ ] Legenda de ambientes presente e legível. [ ] Estilo visual aderente ao briefing. [ ] Exportação em resolução adequada ao uso (impressão ou digital). [ ] Nomenclatura de arquivo conforme padrão TBO.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Proporção distorcida: verificar se pé-direito e largura estão na mesma unidade no CAD importado (1 unidade = 1 cm no SketchUp). Isométrica deformada: confirmar que Parallel Projection está ativado no SketchUp. Mobiliário gigante/minúsculo: reescalar usando grupos e verificar com porta como referência (2,10 m).', '<p>Proporção distorcida: verificar se pé-direito e largura estão na mesma unidade no CAD importado (1 unidade = 1 cm no SketchUp). Isométrica deformada: confirmar que Parallel Projection está ativado no SketchUp. Mobiliário gigante/minúsculo: reescalar usando grupos e verificar com porta como referência (2,10 m).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'SketchUp Pro 2023+ com V-Ray for SketchUp; 3ds Max + Corona (alternativa para renders mais realistas); Photoshop; LayOut para composição final com legendas e escalas.', '<p>SketchUp Pro 2023+ com V-Ray for SketchUp; 3ds Max + Corona (alternativa para renders mais realistas); Photoshop; LayOut para composição final com legendas e escalas.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Planta perspectivada padrão (até 100 m²): 2 dias úteis. Planta perspectivada complexa / múltiplos ângulos: 3–4 dias úteis. Revisão pós-feedback cliente: 1 dia útil por rodada.', '<p>Planta perspectivada padrão (até 100 m²): 2 dias úteis. Planta perspectivada complexa / múltiplos ângulos: 3–4 dias úteis. Revisão pós-feedback cliente: 1 dia útil por rodada.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe CAD → Modelagem base (extrusão de paredes) → Inserção de mobiliário → Config. câmera → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render → Pós-produção + legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação → Fim', '<p>Início → Recebe CAD → Modelagem base (extrusão de paredes) → Inserção de mobiliário → Config. câmera → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render → Pós-produção + legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Isométrica: projeção paralela em 30/45° que mantém proporções sem convergência de paralelas. Perspectiva cônica: projeção com ponto de fuga, mais próxima da percepção humana real. Pé-direito: altura interna entre o piso e o teto. Edge rendering: técnica de renderizar linhas de aresta sobre a imagem para reforçar leitura volumétrica. Low-poly: modelo 3D com baixa contagem de polígonos, usado para visualizações esquemáticas.', '<p>Isométrica: projeção paralela em 30/45° que mantém proporções sem convergência de paralelas. Perspectiva cônica: projeção com ponto de fuga, mais próxima da percepção humana real. Pé-direito: altura interna entre o piso e o teto. Edge rendering: técnica de renderizar linhas de aresta sobre a imagem para reforçar leitura volumétrica. Low-poly: modelo 3D com baixa contagem de polígonos, usado para visualizações esquemáticas.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-007: Implantações Humanizadas ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Implantações Humanizadas',
    'tbo-3d-007-implantacoes-humanizadas',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Implantações Humanizadas

Código

TBO-3D-007

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Produzir imagens de implantação humanizada do empreendimento — vista aérea ou axonométrica do terreno com o projeto implantado, área de lazer, paisagismo e contexto urbano — para uso em material comercial e apresentações ao cliente.

  2. Escopo

2.1 O que está coberto

Montagem de implantação aérea/axonométrica a partir de CAD de implantação; inserção de fachadas renderizadas, paisagismo 3D ou 2D, pessoas, veículos; tratamento de contexto urbano (ruas, lotes vizinhos, arborização); pós-produção e finalização.

2.2 Exclusões

Render fotorrealista de fachada (coberta pelo SOP 03); projeto de paisagismo e posicionamento de blocos (responsabilidade do arquiteto); imagens aéreas reais de drone.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Produzir implantação humanizada completa

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo aéreo, paleta e versão final

Aprovador

—

Gerente de Projetos

Receber CAD do cliente e fazer briefing

Consultado

Informado

Arquiteto / Incorporadora

Fornecer CAD de implantação atualizado e aprovar posicionamento de blocos

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

CAD de implantação com todos os blocos posicionados, vias, áreas comuns e limites de terreno; renders de fachada aprovados (output SOP 03/04); briefing com estilo (realista, aquarela, colorido clean); imagem de satélite do entorno (Google Maps ou Nearmap).

4.2 Ferramentas e Acessos

3ds Max ou SketchUp (modelagem do entorno); V-Ray / Corona (render); Photoshop (compositing aéreo); Google Maps / Nearmap (referência de entorno); biblioteca de assets aéreos TBO (árvores top-view, veículos, sombras).



  5. Procedimento Passo a Passo

5.1. Análise do CAD e mapeamento do entorno

Ação: Abrir CAD de implantação; identificar todos os blocos, áreas de lazer, vias internas e externas, limites de terreno; capturar imagem de satélite do entorno no Google Maps ou Nearmap para referência de contexto urbano e arborização existente.

Responsável: Visualizador 3D Sênior

Output: CAD mapeado + imagem de satélite do entorno salva

Prazo referência: 30–45 min

5.2. Modelagem do empreendimento e entorno

Ação: Modelar volumes dos blocos em 3D com alturas corretas (número de pavimentos × pé-direito); modelar cobertura, piscina, quadra e demais elementos de lazer; modelar entorno simplificado (ruas, calçadas, lotes vizinhos sem detalhe de fachada).

Responsável: Visualizador 3D Sênior

Output: Modelo 3D de implantação com entorno simplificado

Prazo referência: 2–4 h

5.3. Configuração de câmera aérea e render

Ação: Posicionar câmera aérea em altitude que mostre o empreendimento completo + contexto; ângulo sugerido: 45–60° de elevação; configurar iluminação solar de horário nobre (14–16h, luz dourada); renderizar com passes para compositing.

Responsável: Visualizador 3D Sênior

Output: Render aéreo base com passes exportados

Prazo referência: 2–6 h

[DECISÃO] Ângulo aéreo aprovado internamente? Sim → prosseguir. Não → reposicionar câmera.

5.4. Compositing e humanização

Ação: Compor passes no Photoshop; substituir céu por imagem de qualidade da sky library; inserir árvores e paisagismo em escala real (palmeira = 8–12 m, ipê = 6–8 m); adicionar veículos e pessoas em escala; inserir sombras projetadas dos elementos 2D inseridos; ajustar cor para integração.

Responsável: Visualizador 3D Sênior / Pós-produtor

Output: Implantação humanizada com paisagismo e contexto integrados

Prazo referência: 3–5 h

5.5. Legenda, revisão e exportação

Ação: Adicionar legenda com identificação de blocos, áreas e pontos de destaque conforme briefing do cliente; enviar para revisão do Dir. Criativo; incorporar feedback; exportar JPG 300 dpi + PNG + versão sem legenda para uso flexível.

Responsável: Visualizador 3D Sênior

Output: Implantação humanizada finalizada e exportada em múltiplas versões

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo e pelo cliente? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas inclusas).

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Alturas dos blocos corretas (conferir gabarito no CAD). [ ] Paisagismo em escala real. [ ] Entorno simplificado mas reconhecível. [ ] Iluminação solar coerente (sombras na direção correta). [ ] Legenda presente e legível. [ ] Sem distorção de perspectiva aérea. [ ] Exportação em múltiplas versões (com/sem legenda, JPG/PNG). [ ] Nomes de arquivo conforme padrão TBO.

6.2 Erros Comuns a Evitar

Blocos com altura errada: verificar número de pavimentos no memorial descritivo ou corte do projeto. Árvores em escala incorreta: usar altura média de espécie (palmeira imperial ≈ 15 m, ipê ≈ 7 m, gramínea ≈ 0,5 m). Sombras de elementos 2D inconsistentes com o render: criar sombra sintética no Photoshop com Multiply + blur compatível com ângulo solar do render.

  7. Ferramentas e Templates

SketchUp Pro + V-Ray for SketchUp; 3ds Max + Corona; Photoshop; Google Maps / Nearmap; biblioteca de assets aéreos TBO; SunCalc.net (para calcular ângulo solar real por data e localização).

  8. SLAs e Prazos

Implantação humanizada padrão (até 4 blocos): 3–4 dias úteis. Implantação complexa (condomínio clube, múltiplos blocos, área de lazer extensa): 5–7 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas).

  9. Fluxograma

Início → Recebe CAD implantação → Análise + satélite do entorno → Modelagem blocos + entorno → Config. câmera aérea → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render com passes → Compositing + paisagismo → Legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação múltiplas versões → Fim

  10. Glossário

Implantação: planta/imagem mostrando o posicionamento do empreendimento no terreno e seu entorno. Axonométrica: projeção paralela que mostra largura, profundidade e altura sem perspectiva. Gabarito: número máximo de pavimentos permitido para o lote. Nearmap: serviço de imagens aéreas de alta resolução e data recente. Paisagismo top-view: representação de árvores e arbustos vistos de cima.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Implantações Humanizadas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir imagens de implantação humanizada do empreendimento — vista aérea ou axonométrica do terreno com o projeto implantado, área de lazer, paisagismo e contexto urbano — para uso em material comercial e apresentações ao cliente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Montagem de implantação aérea/axonométrica a partir de CAD de implantação; inserção de fachadas renderizadas, paisagismo 3D ou 2D, pessoas, veículos; tratamento de contexto urbano (ruas, lotes vizinhos, arborização); pós-produção e finalização.</p><p><strong>2.2 Exclusões</strong></p><p>Render fotorrealista de fachada (coberta pelo SOP 03); projeto de paisagismo e posicionamento de blocos (responsabilidade do arquiteto); imagens aéreas reais de drone.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Produzir implantação humanizada completa</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar ângulo aéreo, paleta e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Receber CAD do cliente e fazer briefing</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Fornecer CAD de implantação atualizado e aprovar posicionamento de blocos</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>CAD de implantação com todos os blocos posicionados, vias, áreas comuns e limites de terreno; renders de fachada aprovados (output SOP 03/04); briefing com estilo (realista, aquarela, colorido clean); imagem de satélite do entorno (Google Maps ou Nearmap).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max ou SketchUp (modelagem do entorno); V-Ray / Corona (render); Photoshop (compositing aéreo); Google Maps / Nearmap (referência de entorno); biblioteca de assets aéreos TBO (árvores top-view, veículos, sombras).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Análise do CAD e mapeamento do entorno</strong></p><p>Ação: Abrir CAD de implantação; identificar todos os blocos, áreas de lazer, vias internas e externas, limites de terreno; capturar imagem de satélite do entorno no Google Maps ou Nearmap para referência de contexto urbano e arborização existente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: CAD mapeado + imagem de satélite do entorno salva</p><p>Prazo referência: 30–45 min</p><p><strong>5.2. Modelagem do empreendimento e entorno</strong></p><p>Ação: Modelar volumes dos blocos em 3D com alturas corretas (número de pavimentos × pé-direito); modelar cobertura, piscina, quadra e demais elementos de lazer; modelar entorno simplificado (ruas, calçadas, lotes vizinhos sem detalhe de fachada).</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Modelo 3D de implantação com entorno simplificado</p><p>Prazo referência: 2–4 h</p><p><strong>5.3. Configuração de câmera aérea e render</strong></p><p>Ação: Posicionar câmera aérea em altitude que mostre o empreendimento completo + contexto; ângulo sugerido: 45–60° de elevação; configurar iluminação solar de horário nobre (14–16h, luz dourada); renderizar com passes para compositing.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Render aéreo base com passes exportados</p><p>Prazo referência: 2–6 h</p><p><strong>[DECISÃO] Ângulo aéreo aprovado internamente? Sim → prosseguir. Não → reposicionar câmera.</strong></p><p><strong>5.4. Compositing e humanização</strong></p><p>Ação: Compor passes no Photoshop; substituir céu por imagem de qualidade da sky library; inserir árvores e paisagismo em escala real (palmeira = 8–12 m, ipê = 6–8 m); adicionar veículos e pessoas em escala; inserir sombras projetadas dos elementos 2D inseridos; ajustar cor para integração.</p><p>Responsável: Visualizador 3D Sênior / Pós-produtor</p><p>Output: Implantação humanizada com paisagismo e contexto integrados</p><p>Prazo referência: 3–5 h</p><p><strong>5.5. Legenda, revisão e exportação</strong></p><p>Ação: Adicionar legenda com identificação de blocos, áreas e pontos de destaque conforme briefing do cliente; enviar para revisão do Dir. Criativo; incorporar feedback; exportar JPG 300 dpi + PNG + versão sem legenda para uso flexível.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Implantação humanizada finalizada e exportada em múltiplas versões</p><p>Prazo referência: 1 h + ciclo revisão 24 h</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo e pelo cliente? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas inclusas).</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Alturas dos blocos corretas (conferir gabarito no CAD). [ ] Paisagismo em escala real. [ ] Entorno simplificado mas reconhecível. [ ] Iluminação solar coerente (sombras na direção correta). [ ] Legenda presente e legível. [ ] Sem distorção de perspectiva aérea. [ ] Exportação em múltiplas versões (com/sem legenda, JPG/PNG). [ ] Nomes de arquivo conforme padrão TBO.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Blocos com altura errada: verificar número de pavimentos no memorial descritivo ou corte do projeto. Árvores em escala incorreta: usar altura média de espécie (palmeira imperial ≈ 15 m, ipê ≈ 7 m, gramínea ≈ 0,5 m). Sombras de elementos 2D inconsistentes com o render: criar sombra sintética no Photoshop com Multiply + blur compatível com ângulo solar do render.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>SketchUp Pro + V-Ray for SketchUp; 3ds Max + Corona; Photoshop; Google Maps / Nearmap; biblioteca de assets aéreos TBO; SunCalc.net (para calcular ângulo solar real por data e localização).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Implantação humanizada padrão (até 4 blocos): 3–4 dias úteis. Implantação complexa (condomínio clube, múltiplos blocos, área de lazer extensa): 5–7 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebe CAD implantação → Análise + satélite do entorno → Modelagem blocos + entorno → Config. câmera aérea → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render com passes → Compositing + paisagismo → Legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação múltiplas versões → Fim</p><p><strong>  10. Glossário</strong></p><p>Implantação: planta/imagem mostrando o posicionamento do empreendimento no terreno e seu entorno. Axonométrica: projeção paralela que mostra largura, profundidade e altura sem perspectiva. Gabarito: número máximo de pavimentos permitido para o lote. Nearmap: serviço de imagens aéreas de alta resolução e data recente. Paisagismo top-view: representação de árvores e arbustos vistos de cima.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    6,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir imagens de implantação humanizada do empreendimento — vista aérea ou axonométrica do terreno com o projeto implantado, área de lazer, paisagismo e contexto urbano — para uso em material comercial e apresentações ao cliente.', '<p>Produzir imagens de implantação humanizada do empreendimento — vista aérea ou axonométrica do terreno com o projeto implantado, área de lazer, paisagismo e contexto urbano — para uso em material comercial e apresentações ao cliente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Montagem de implantação aérea/axonométrica a partir de CAD de implantação; inserção de fachadas renderizadas, paisagismo 3D ou 2D, pessoas, veículos; tratamento de contexto urbano (ruas, lotes vizinhos, arborização); pós-produção e finalização.', '<p>Montagem de implantação aérea/axonométrica a partir de CAD de implantação; inserção de fachadas renderizadas, paisagismo 3D ou 2D, pessoas, veículos; tratamento de contexto urbano (ruas, lotes vizinhos, arborização); pós-produção e finalização.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Render fotorrealista de fachada (coberta pelo SOP 03); projeto de paisagismo e posicionamento de blocos (responsabilidade do arquiteto); imagens aéreas reais de drone.', '<p>Render fotorrealista de fachada (coberta pelo SOP 03); projeto de paisagismo e posicionamento de blocos (responsabilidade do arquiteto); imagens aéreas reais de drone.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Produzir implantação humanizada completa

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo aéreo, paleta e versão final

Aprovador

—

Gerente de Projetos

Receber CAD do cliente e fazer briefing

Consultado

Informado

Arquiteto / Incorporadora

Fornecer CAD de implantação atualizado e aprovar posicionamento de blocos

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Produzir implantação humanizada completa</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar ângulo aéreo, paleta e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Receber CAD do cliente e fazer briefing</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Fornecer CAD de implantação atualizado e aprovar posicionamento de blocos</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'CAD de implantação com todos os blocos posicionados, vias, áreas comuns e limites de terreno; renders de fachada aprovados (output SOP 03/04); briefing com estilo (realista, aquarela, colorido clean); imagem de satélite do entorno (Google Maps ou Nearmap).', '<p>CAD de implantação com todos os blocos posicionados, vias, áreas comuns e limites de terreno; renders de fachada aprovados (output SOP 03/04); briefing com estilo (realista, aquarela, colorido clean); imagem de satélite do entorno (Google Maps ou Nearmap).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max ou SketchUp (modelagem do entorno); V-Ray / Corona (render); Photoshop (compositing aéreo); Google Maps / Nearmap (referência de entorno); biblioteca de assets aéreos TBO (árvores top-view, veículos, sombras).', '<p>3ds Max ou SketchUp (modelagem do entorno); V-Ray / Corona (render); Photoshop (compositing aéreo); Google Maps / Nearmap (referência de entorno); biblioteca de assets aéreos TBO (árvores top-view, veículos, sombras).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Análise do CAD e mapeamento do entorno', 'Ação: Abrir CAD de implantação; identificar todos os blocos, áreas de lazer, vias internas e externas, limites de terreno; capturar imagem de satélite do entorno no Google Maps ou Nearmap para referência de contexto urbano e arborização existente.

Responsável: Visualizador 3D Sênior

Output: CAD mapeado + imagem de satélite do entorno salva

Prazo referência: 30–45 min', '<p>Ação: Abrir CAD de implantação; identificar todos os blocos, áreas de lazer, vias internas e externas, limites de terreno; capturar imagem de satélite do entorno no Google Maps ou Nearmap para referência de contexto urbano e arborização existente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: CAD mapeado + imagem de satélite do entorno salva</p><p>Prazo referência: 30–45 min</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Modelagem do empreendimento e entorno', 'Ação: Modelar volumes dos blocos em 3D com alturas corretas (número de pavimentos × pé-direito); modelar cobertura, piscina, quadra e demais elementos de lazer; modelar entorno simplificado (ruas, calçadas, lotes vizinhos sem detalhe de fachada).

Responsável: Visualizador 3D Sênior

Output: Modelo 3D de implantação com entorno simplificado

Prazo referência: 2–4 h', '<p>Ação: Modelar volumes dos blocos em 3D com alturas corretas (número de pavimentos × pé-direito); modelar cobertura, piscina, quadra e demais elementos de lazer; modelar entorno simplificado (ruas, calçadas, lotes vizinhos sem detalhe de fachada).</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Modelo 3D de implantação com entorno simplificado</p><p>Prazo referência: 2–4 h</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Configuração de câmera aérea e render', 'Ação: Posicionar câmera aérea em altitude que mostre o empreendimento completo + contexto; ângulo sugerido: 45–60° de elevação; configurar iluminação solar de horário nobre (14–16h, luz dourada); renderizar com passes para compositing.

Responsável: Visualizador 3D Sênior

Output: Render aéreo base com passes exportados

Prazo referência: 2–6 h

[DECISÃO] Ângulo aéreo aprovado internamente? Sim → prosseguir. Não → reposicionar câmera.', '<p>Ação: Posicionar câmera aérea em altitude que mostre o empreendimento completo + contexto; ângulo sugerido: 45–60° de elevação; configurar iluminação solar de horário nobre (14–16h, luz dourada); renderizar com passes para compositing.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Render aéreo base com passes exportados</p><p>Prazo referência: 2–6 h</p><p><strong>[DECISÃO] Ângulo aéreo aprovado internamente? Sim → prosseguir. Não → reposicionar câmera.</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Compositing e humanização', 'Ação: Compor passes no Photoshop; substituir céu por imagem de qualidade da sky library; inserir árvores e paisagismo em escala real (palmeira = 8–12 m, ipê = 6–8 m); adicionar veículos e pessoas em escala; inserir sombras projetadas dos elementos 2D inseridos; ajustar cor para integração.

Responsável: Visualizador 3D Sênior / Pós-produtor

Output: Implantação humanizada com paisagismo e contexto integrados

Prazo referência: 3–5 h', '<p>Ação: Compor passes no Photoshop; substituir céu por imagem de qualidade da sky library; inserir árvores e paisagismo em escala real (palmeira = 8–12 m, ipê = 6–8 m); adicionar veículos e pessoas em escala; inserir sombras projetadas dos elementos 2D inseridos; ajustar cor para integração.</p><p>Responsável: Visualizador 3D Sênior / Pós-produtor</p><p>Output: Implantação humanizada com paisagismo e contexto integrados</p><p>Prazo referência: 3–5 h</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Legenda, revisão e exportação', 'Ação: Adicionar legenda com identificação de blocos, áreas e pontos de destaque conforme briefing do cliente; enviar para revisão do Dir. Criativo; incorporar feedback; exportar JPG 300 dpi + PNG + versão sem legenda para uso flexível.

Responsável: Visualizador 3D Sênior

Output: Implantação humanizada finalizada e exportada em múltiplas versões

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo e pelo cliente? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas inclusas).', '<p>Ação: Adicionar legenda com identificação de blocos, áreas e pontos de destaque conforme briefing do cliente; enviar para revisão do Dir. Criativo; incorporar feedback; exportar JPG 300 dpi + PNG + versão sem legenda para uso flexível.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Implantação humanizada finalizada e exportada em múltiplas versões</p><p>Prazo referência: 1 h + ciclo revisão 24 h</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo e pelo cliente? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas inclusas).</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Alturas dos blocos corretas (conferir gabarito no CAD). [ ] Paisagismo em escala real. [ ] Entorno simplificado mas reconhecível. [ ] Iluminação solar coerente (sombras na direção correta). [ ] Legenda presente e legível. [ ] Sem distorção de perspectiva aérea. [ ] Exportação em múltiplas versões (com/sem legenda, JPG/PNG). [ ] Nomes de arquivo conforme padrão TBO.', '<p>[ ] Alturas dos blocos corretas (conferir gabarito no CAD). [ ] Paisagismo em escala real. [ ] Entorno simplificado mas reconhecível. [ ] Iluminação solar coerente (sombras na direção correta). [ ] Legenda presente e legível. [ ] Sem distorção de perspectiva aérea. [ ] Exportação em múltiplas versões (com/sem legenda, JPG/PNG). [ ] Nomes de arquivo conforme padrão TBO.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Blocos com altura errada: verificar número de pavimentos no memorial descritivo ou corte do projeto. Árvores em escala incorreta: usar altura média de espécie (palmeira imperial ≈ 15 m, ipê ≈ 7 m, gramínea ≈ 0,5 m). Sombras de elementos 2D inconsistentes com o render: criar sombra sintética no Photoshop com Multiply + blur compatível com ângulo solar do render.', '<p>Blocos com altura errada: verificar número de pavimentos no memorial descritivo ou corte do projeto. Árvores em escala incorreta: usar altura média de espécie (palmeira imperial ≈ 15 m, ipê ≈ 7 m, gramínea ≈ 0,5 m). Sombras de elementos 2D inconsistentes com o render: criar sombra sintética no Photoshop com Multiply + blur compatível com ângulo solar do render.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'SketchUp Pro + V-Ray for SketchUp; 3ds Max + Corona; Photoshop; Google Maps / Nearmap; biblioteca de assets aéreos TBO; SunCalc.net (para calcular ângulo solar real por data e localização).', '<p>SketchUp Pro + V-Ray for SketchUp; 3ds Max + Corona; Photoshop; Google Maps / Nearmap; biblioteca de assets aéreos TBO; SunCalc.net (para calcular ângulo solar real por data e localização).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Implantação humanizada padrão (até 4 blocos): 3–4 dias úteis. Implantação complexa (condomínio clube, múltiplos blocos, área de lazer extensa): 5–7 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas).', '<p>Implantação humanizada padrão (até 4 blocos): 3–4 dias úteis. Implantação complexa (condomínio clube, múltiplos blocos, área de lazer extensa): 5–7 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe CAD implantação → Análise + satélite do entorno → Modelagem blocos + entorno → Config. câmera aérea → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render com passes → Compositing + paisagismo → Legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação múltiplas versões → Fim', '<p>Início → Recebe CAD implantação → Análise + satélite do entorno → Modelagem blocos + entorno → Config. câmera aérea → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render com passes → Compositing + paisagismo → Legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação múltiplas versões → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Implantação: planta/imagem mostrando o posicionamento do empreendimento no terreno e seu entorno. Axonométrica: projeção paralela que mostra largura, profundidade e altura sem perspectiva. Gabarito: número máximo de pavimentos permitido para o lote. Nearmap: serviço de imagens aéreas de alta resolução e data recente. Paisagismo top-view: representação de árvores e arbustos vistos de cima.', '<p>Implantação: planta/imagem mostrando o posicionamento do empreendimento no terreno e seu entorno. Axonométrica: projeção paralela que mostra largura, profundidade e altura sem perspectiva. Gabarito: número máximo de pavimentos permitido para o lote. Nearmap: serviço de imagens aéreas de alta resolução e data recente. Paisagismo top-view: representação de árvores e arbustos vistos de cima.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-008: Tour 360 ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Tour 360',
    'tbo-3d-008-tour-360',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Tour 360°

Código

TBO-3D-008

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.

  2. Escopo

2.1 O que está coberto

Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.

2.2 Exclusões

Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Renderizar panoramas 360° e configurar o tour virtual

Responsável

—

Pós-produtor

Tratar imagens equiretangulares e corrigir costuras

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar qualidade visual, navegação e fluxo do tour

Aprovador

—

Gerente de Projetos

Briefing de ambientes, entrega do link ao cliente e suporte ao acesso

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.

4.2 Ferramentas e Acessos

3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.



  5. Procedimento Passo a Passo

5.1. Planejamento do tour e mapeamento de ambientes

Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).

Responsável: Visualizador 3D Sênior

Output: Mapa de navegação do tour documentado

Prazo referência: 30 min

5.2. Configuração e render de panoramas 360°

Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.

Responsável: Visualizador 3D Sênior

Output: Panoramas EXR 360° de todos os ambientes renderizados

Prazo referência: 4–12 h (por quantidade de ambientes)

[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.

5.3. Pós-produção das imagens equiretangulares

Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.

Responsável: Pós-produtor

Output: Panoramas finalizados em JPEG 90%+ prontos para upload

Prazo referência: 1–2 h por ambiente

5.4. Montagem do tour na plataforma

Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.

Responsável: Visualizador 3D Sênior

Output: Tour virtual montado e funcionando na plataforma

Prazo referência: 2–3 h

5.5. QA, aprovação e publicação

Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.

Responsável: Visualizador 3D Sênior

Output: Tour virtual publicado, link final entregue ao cliente

Prazo referência: 1 h QA + ciclo revisão 24 h

[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.

6.2 Erros Comuns a Evitar

Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.

  7. Ferramentas e Templates

3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.

  8. SLAs e Prazos

Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.

  9. Fluxograma

Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim

  10. Glossário

Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Tour 360°</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-008</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Renderizar panoramas 360° e configurar o tour virtual</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Pós-produtor</p></td><td><p>Tratar imagens equiretangulares e corrigir costuras</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar qualidade visual, navegação e fluxo do tour</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Briefing de ambientes, entrega do link ao cliente e suporte ao acesso</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Planejamento do tour e mapeamento de ambientes</strong></p><p>Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Mapa de navegação do tour documentado</p><p>Prazo referência: 30 min</p><p><strong>5.2. Configuração e render de panoramas 360°</strong></p><p>Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Panoramas EXR 360° de todos os ambientes renderizados</p><p>Prazo referência: 4–12 h (por quantidade de ambientes)</p><p><strong>[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.</strong></p><p><strong>5.3. Pós-produção das imagens equiretangulares</strong></p><p>Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.</p><p>Responsável: Pós-produtor</p><p>Output: Panoramas finalizados em JPEG 90%+ prontos para upload</p><p>Prazo referência: 1–2 h por ambiente</p><p><strong>5.4. Montagem do tour na plataforma</strong></p><p>Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual montado e funcionando na plataforma</p><p>Prazo referência: 2–3 h</p><p><strong>5.5. QA, aprovação e publicação</strong></p><p>Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual publicado, link final entregue ao cliente</p><p>Prazo referência: 1 h QA + ciclo revisão 24 h</p><p><strong>[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim</p><p><strong>  10. Glossário</strong></p><p>Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    7,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-008
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.', '<p>Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.', '<p>Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).', '<p>Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Renderizar panoramas 360° e configurar o tour virtual

Responsável

—

Pós-produtor

Tratar imagens equiretangulares e corrigir costuras

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar qualidade visual, navegação e fluxo do tour

Aprovador

—

Gerente de Projetos

Briefing de ambientes, entrega do link ao cliente e suporte ao acesso

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Renderizar panoramas 360° e configurar o tour virtual</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Pós-produtor</p></td><td><p>Tratar imagens equiretangulares e corrigir costuras</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar qualidade visual, navegação e fluxo do tour</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Briefing de ambientes, entrega do link ao cliente e suporte ao acesso</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.', '<p>Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.', '<p>3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Planejamento do tour e mapeamento de ambientes', 'Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).

Responsável: Visualizador 3D Sênior

Output: Mapa de navegação do tour documentado

Prazo referência: 30 min', '<p>Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Mapa de navegação do tour documentado</p><p>Prazo referência: 30 min</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Configuração e render de panoramas 360°', 'Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.

Responsável: Visualizador 3D Sênior

Output: Panoramas EXR 360° de todos os ambientes renderizados

Prazo referência: 4–12 h (por quantidade de ambientes)

[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.', '<p>Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Panoramas EXR 360° de todos os ambientes renderizados</p><p>Prazo referência: 4–12 h (por quantidade de ambientes)</p><p><strong>[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Pós-produção das imagens equiretangulares', 'Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.

Responsável: Pós-produtor

Output: Panoramas finalizados em JPEG 90%+ prontos para upload

Prazo referência: 1–2 h por ambiente', '<p>Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.</p><p>Responsável: Pós-produtor</p><p>Output: Panoramas finalizados em JPEG 90%+ prontos para upload</p><p>Prazo referência: 1–2 h por ambiente</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Montagem do tour na plataforma', 'Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.

Responsável: Visualizador 3D Sênior

Output: Tour virtual montado e funcionando na plataforma

Prazo referência: 2–3 h', '<p>Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual montado e funcionando na plataforma</p><p>Prazo referência: 2–3 h</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. QA, aprovação e publicação', 'Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.

Responsável: Visualizador 3D Sênior

Output: Tour virtual publicado, link final entregue ao cliente

Prazo referência: 1 h QA + ciclo revisão 24 h

[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.', '<p>Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Tour virtual publicado, link final entregue ao cliente</p><p>Prazo referência: 1 h QA + ciclo revisão 24 h</p><p><strong>[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.', '<p>[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.', '<p>Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.', '<p>3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.', '<p>Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim', '<p>Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.', '<p>Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-009: Animações 3D Pré produção ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Animações 3D Pré produção',
    'tbo-3d-009-animacoes-3d-pre-producao',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Animações 3D — Pré-produção

Código

TBO-3D-009

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.

  2. Escopo

2.1 O que está coberto

Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.

2.2 Exclusões

Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Liderar briefing criativo, validar roteiro e aprovar storyboard

Aprovador

—

Visualizador 3D Sênior

Desenvolver storyboard técnico e validar viabilidade de produção

Responsável

—

Gerente de Projetos

Conduzir reunião de briefing com cliente, documentar e distribuir

Responsável

Informado

Cliente / Incorporadora

Aprovar roteiro, storyboard e cronograma antes do início da produção

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.

4.2 Ferramentas e Acessos

Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).



  5. Procedimento Passo a Passo

5.1. Reunião de briefing de animação

Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.

Responsável: Gerente de Projetos + Dir. Criativo

Output: Briefing de animação documentado e assinado pelo cliente

Prazo referência: 1–2 h (reunião) + 30 min (documentação)

5.2. Desenvolvimento do roteiro

Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.

Responsável: Diretor Criativo

Output: Roteiro de animação aprovado internamente

Prazo referência: 1 dia útil

[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.

5.3. Criação do storyboard

Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.

Responsável: Visualizador 3D Sênior

Output: Storyboard completo em apresentação (PDF ou Slides)

Prazo referência: 1–2 dias úteis

5.4. Aprovação do storyboard pelo cliente

Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.

Responsável: Gerente de Projetos

Output: Storyboard aprovado formalmente pelo cliente

Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)

[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).

5.5. Definição técnica e cronograma de produção

Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.

Responsável: Gerente de Projetos + Visualizador 3D Sênior

Output: Documento técnico e cronograma de produção criados e distribuídos

Prazo referência: 4 h

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.

6.2 Erros Comuns a Evitar

Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.

  7. Ferramentas e Templates

Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).

  8. SLAs e Prazos

Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.

  9. Fluxograma

Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim

  10. Glossário

Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Animações 3D — Pré-produção</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-009</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Liderar briefing criativo, validar roteiro e aprovar storyboard</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Desenvolver storyboard técnico e validar viabilidade de produção</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Conduzir reunião de briefing com cliente, documentar e distribuir</p></td><td><p>Responsável</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprovar roteiro, storyboard e cronograma antes do início da produção</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Reunião de briefing de animação</strong></p><p>Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.</p><p>Responsável: Gerente de Projetos + Dir. Criativo</p><p>Output: Briefing de animação documentado e assinado pelo cliente</p><p>Prazo referência: 1–2 h (reunião) + 30 min (documentação)</p><p><strong>5.2. Desenvolvimento do roteiro</strong></p><p>Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.</p><p>Responsável: Diretor Criativo</p><p>Output: Roteiro de animação aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.</strong></p><p><strong>5.3. Criação do storyboard</strong></p><p>Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Storyboard completo em apresentação (PDF ou Slides)</p><p>Prazo referência: 1–2 dias úteis</p><p><strong>5.4. Aprovação do storyboard pelo cliente</strong></p><p>Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.</p><p>Responsável: Gerente de Projetos</p><p>Output: Storyboard aprovado formalmente pelo cliente</p><p>Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)</p><p><strong>[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).</strong></p><p><strong>5.5. Definição técnica e cronograma de produção</strong></p><p>Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.</p><p>Responsável: Gerente de Projetos + Visualizador 3D Sênior</p><p>Output: Documento técnico e cronograma de produção criados e distribuídos</p><p>Prazo referência: 4 h</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim</p><p><strong>  10. Glossário</strong></p><p>Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    8,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-009
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.', '<p>Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.', '<p>Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).', '<p>Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Liderar briefing criativo, validar roteiro e aprovar storyboard

Aprovador

—

Visualizador 3D Sênior

Desenvolver storyboard técnico e validar viabilidade de produção

Responsável

—

Gerente de Projetos

Conduzir reunião de briefing com cliente, documentar e distribuir

Responsável

Informado

Cliente / Incorporadora

Aprovar roteiro, storyboard e cronograma antes do início da produção

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Liderar briefing criativo, validar roteiro e aprovar storyboard</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Desenvolver storyboard técnico e validar viabilidade de produção</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Conduzir reunião de briefing com cliente, documentar e distribuir</p></td><td><p>Responsável</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprovar roteiro, storyboard e cronograma antes do início da produção</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.', '<p>Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).', '<p>Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Reunião de briefing de animação', 'Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.

Responsável: Gerente de Projetos + Dir. Criativo

Output: Briefing de animação documentado e assinado pelo cliente

Prazo referência: 1–2 h (reunião) + 30 min (documentação)', '<p>Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.</p><p>Responsável: Gerente de Projetos + Dir. Criativo</p><p>Output: Briefing de animação documentado e assinado pelo cliente</p><p>Prazo referência: 1–2 h (reunião) + 30 min (documentação)</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Desenvolvimento do roteiro', 'Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.

Responsável: Diretor Criativo

Output: Roteiro de animação aprovado internamente

Prazo referência: 1 dia útil

[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.', '<p>Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.</p><p>Responsável: Diretor Criativo</p><p>Output: Roteiro de animação aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Criação do storyboard', 'Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.

Responsável: Visualizador 3D Sênior

Output: Storyboard completo em apresentação (PDF ou Slides)

Prazo referência: 1–2 dias úteis', '<p>Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Storyboard completo em apresentação (PDF ou Slides)</p><p>Prazo referência: 1–2 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aprovação do storyboard pelo cliente', 'Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.

Responsável: Gerente de Projetos

Output: Storyboard aprovado formalmente pelo cliente

Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)

[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).', '<p>Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.</p><p>Responsável: Gerente de Projetos</p><p>Output: Storyboard aprovado formalmente pelo cliente</p><p>Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)</p><p><strong>[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Definição técnica e cronograma de produção', 'Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.

Responsável: Gerente de Projetos + Visualizador 3D Sênior

Output: Documento técnico e cronograma de produção criados e distribuídos

Prazo referência: 4 h', '<p>Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.</p><p>Responsável: Gerente de Projetos + Visualizador 3D Sênior</p><p>Output: Documento técnico e cronograma de produção criados e distribuídos</p><p>Prazo referência: 4 h</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.', '<p>[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.', '<p>Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).', '<p>Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.', '<p>Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim', '<p>Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.', '<p>Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-010: Animações 3D Produção ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Animações 3D Produção',
    'tbo-3d-010-animacoes-3d-producao',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Animações 3D — Produção

Código

TBO-3D-010

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Digital 3D

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Executar a produção técnica completa da animação 3D — animação de câmeras, iluminação animada, render de frames e organização dos passes — conforme storyboard e especificações aprovadas na pré-produção.

  2. Escopo

2.1 O que está coberto

Animação de câmeras e objetos; setup de iluminação para cenas animadas; configuração e execução do render de frames via render farm; organização e entrega de pastas de frames para pós-produção.

2.2 Exclusões

Pré-produção e storyboard (cobertos pelo SOP 09); edição de vídeo, trilha sonora e entrega final (cobertos pelo SOP 11); modelagem e texturização (cobertos pelo SOP 02).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Animar câmeras, configurar iluminação animada e gerenciar render

Responsável

—

Visualizador 3D Júnior

Suporte em render de cenas secundárias e organização de frames

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar preview de câmeras antes do render final

Aprovador

—

Gerente de Projetos

Monitorar cronograma de produção e comunicar desvios

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Storyboard aprovado pelo cliente (output SOP 09); cenas 3D finalizadas com materiais e iluminação base (output SOP 02 e 03); especificações técnicas (resolução, FPS, duração por cena); render farm disponível e configurado.

4.2 Ferramentas e Acessos

3ds Max 2024+ com V-Ray ou Corona; Chaos Cloud ou render farm local (Deadline, Thinkbox); script de câmera para movimentos cinematográficos (Visu Motion ou câmeras manuais com curvas Bezier); monitor calibrado.



  5. Procedimento Passo a Passo

5.1. Configuração das câmeras animadas

Ação: Criar câmeras de acordo com o storyboard aprovado; animar movimentos: dolly, pan, orbit, crane, fly-through; ajustar timing e suavidade das curvas de animação (ease in/out); verificar que não há colisões de câmera com geometria.

Responsável: Visualizador 3D Sênior

Output: Câmeras animadas por cena, movimento suave e sem colisão

Prazo referência: 1–2 h por cena

5.2. Preview em baixa resolução (animatic 3D)

Ação: Renderizar preview de todas as câmeras em baixa resolução (720p, qualidade draft, 5–10 min por cena); montar sequência de cenas no Premiere Pro ou DaVinci Resolve; revisar ritmo, timing e movimentos de câmera.

Responsável: Visualizador 3D Sênior

Output: Animatic 3D em MP4 para revisão interna

Prazo referência: Meio dia útil

[DECISÃO] Movimentos de câmera e timing aprovados pelo Dir. Criativo? Sim → render final. Não → ajustar curvas de animação e retestar.

5.3. Ajuste de iluminação para cenas em movimento

Ação: Revisar iluminação de cada cena considerando que a câmera estará em movimento; verificar que não há áreas superexpostas ou escuras demais durante o trajeto da câmera; ajustar GI e amostras para consistência entre frames consecutivos.

Responsável: Visualizador 3D Sênior

Output: Iluminação validada para todas as cenas animadas

Prazo referência: 2–4 h

5.4. Configuração e submissão para render farm

Ação: Configurar parâmetros de render final (resolução, FPS, passes necessários); verificar paths de textura e dependências; submeter jobs para render farm via Deadline ou Chaos Cloud; configurar alertas de erro e monitoramento de progresso.

Responsável: Visualizador 3D Sênior

Output: Jobs submetidos ao render farm, monitoramento ativo

Prazo referência: 2–4 h (configuração) + tempo de render (varia)

[DECISÃO] Primeiros frames renderizados sem artefatos? Sim → continuar farm. Não → pausar job, corrigir e reiniciar.

5.5. Monitoramento e controle de qualidade de frames

Ação: Monitorar frames renderizados a cada 10% de conclusão; verificar artefatos (fireflies, flicker de GI, z-fighting animado, artefatos de motion blur); corrigir problemas críticos imediatamente; documentar frames problemáticos para re-render pontual.

Responsável: Visualizador 3D Júnior

Output: Log de QA de frames; re-renders pontuais concluídos

Prazo referência: Contínuo durante render (1–3 dias)

5.6. Organização e entrega dos frames para pós

Ação: Organizar frames renderizados em estrutura de pastas por cena e por passe (EXR sequences nomeadas por frame: CENA01_BEAUTY_0001.exr etc.); verificar completude de todos os frames (sem gaps na sequência); compactar e transferir para servidor de pós-produção.

Responsável: Visualizador 3D Júnior

Output: Pastas de frames organizadas e entregues ao pós-produtor

Prazo referência: 2–4 h (verificação e organização)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Animatic 3D aprovado pelo Dir. Criativo antes do render final. [ ] Sem colisão de câmera com geometria em nenhuma cena. [ ] Movimentos de câmera suaves (sem jitter ou movimento robótico). [ ] Iluminação consistente entre frames consecutivos (sem flicker). [ ] Todos os frames renderizados sem gaps na sequência. [ ] Passes organizados conforme convenção de nomenclatura TBO. [ ] Backup dos frames em servidor de armazenamento.

6.2 Erros Comuns a Evitar

Flicker de GI entre frames: aumentar amostras de irradiance map ou usar modo ''animation'' do GI engine. Jitter de câmera: suavizar curvas de animação no Track View com filtro de tangente Smooth. Gap em sequência de frames (frame faltante): identificar no log do Deadline e re-renderizar frame específico. Motion blur excessivo: reduzir duração do shutter (VRay motion blur duration: 0,25–0,5).

  7. Ferramentas e Templates

3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou Thinkbox Deadline (render farm); VFB para monitoramento de qualidade de frame; Premiere Pro / DaVinci Resolve (montagem do animatic); Backblaze B2 / Google Drive (backup de frames).

  8. SLAs e Prazos

Preview animatic 3D: entregue em 1–2 dias úteis após início da animação. Render de frames (por cena de 10 segundos em FHD): 4–12 h de farm. Organização e entrega de frames para pós: até 24 h após conclusão do render. Duração total de produção (animação 2–3 min): 5–10 dias úteis.

  9. Fluxograma

Início → Recebe storyboard aprovado → Animação de câmeras por cena → Animatic 3D (preview draft) → [Aprovado Dir. Criativo?] → Não: Ajustar câmeras → Sim: Ajuste de iluminação → Config. render farm → Submissão de jobs → Monitoramento de frames → [Artefatos críticos?] → Sim: Pausar e corrigir → Não: Continuar → Organização de pastas → Entrega para Pós (SOP 11) → Fim

  10. Glossário

Render farm: conjunto de computadores (físicos ou nuvem) dedicados ao processamento de render em paralelo. Animatic 3D: versão em baixa qualidade da animação para validação de câmeras e timing. Flicker: variação não intencional de brilho entre frames consecutivos. Deadline: software de gerenciamento de render farm da Thinkbox/AWS. EXR sequence: série de arquivos EXR numerados representando cada frame de uma animação. Motion blur: desfoque de movimento aplicado a objetos ou câmera em movimento para realismo cinematográfico.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Animações 3D — Produção</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-010</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Executar a produção técnica completa da animação 3D — animação de câmeras, iluminação animada, render de frames e organização dos passes — conforme storyboard e especificações aprovadas na pré-produção.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Animação de câmeras e objetos; setup de iluminação para cenas animadas; configuração e execução do render de frames via render farm; organização e entrega de pastas de frames para pós-produção.</p><p><strong>2.2 Exclusões</strong></p><p>Pré-produção e storyboard (cobertos pelo SOP 09); edição de vídeo, trilha sonora e entrega final (cobertos pelo SOP 11); modelagem e texturização (cobertos pelo SOP 02).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Animar câmeras, configurar iluminação animada e gerenciar render</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Suporte em render de cenas secundárias e organização de frames</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar preview de câmeras antes do render final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Monitorar cronograma de produção e comunicar desvios</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Storyboard aprovado pelo cliente (output SOP 09); cenas 3D finalizadas com materiais e iluminação base (output SOP 02 e 03); especificações técnicas (resolução, FPS, duração por cena); render farm disponível e configurado.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max 2024+ com V-Ray ou Corona; Chaos Cloud ou render farm local (Deadline, Thinkbox); script de câmera para movimentos cinematográficos (Visu Motion ou câmeras manuais com curvas Bezier); monitor calibrado.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Configuração das câmeras animadas</strong></p><p>Ação: Criar câmeras de acordo com o storyboard aprovado; animar movimentos: dolly, pan, orbit, crane, fly-through; ajustar timing e suavidade das curvas de animação (ease in/out); verificar que não há colisões de câmera com geometria.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Câmeras animadas por cena, movimento suave e sem colisão</p><p>Prazo referência: 1–2 h por cena</p><p><strong>5.2. Preview em baixa resolução (animatic 3D)</strong></p><p>Ação: Renderizar preview de todas as câmeras em baixa resolução (720p, qualidade draft, 5–10 min por cena); montar sequência de cenas no Premiere Pro ou DaVinci Resolve; revisar ritmo, timing e movimentos de câmera.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Animatic 3D em MP4 para revisão interna</p><p>Prazo referência: Meio dia útil</p><p><strong>[DECISÃO] Movimentos de câmera e timing aprovados pelo Dir. Criativo? Sim → render final. Não → ajustar curvas de animação e retestar.</strong></p><p><strong>5.3. Ajuste de iluminação para cenas em movimento</strong></p><p>Ação: Revisar iluminação de cada cena considerando que a câmera estará em movimento; verificar que não há áreas superexpostas ou escuras demais durante o trajeto da câmera; ajustar GI e amostras para consistência entre frames consecutivos.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Iluminação validada para todas as cenas animadas</p><p>Prazo referência: 2–4 h</p><p><strong>5.4. Configuração e submissão para render farm</strong></p><p>Ação: Configurar parâmetros de render final (resolução, FPS, passes necessários); verificar paths de textura e dependências; submeter jobs para render farm via Deadline ou Chaos Cloud; configurar alertas de erro e monitoramento de progresso.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Jobs submetidos ao render farm, monitoramento ativo</p><p>Prazo referência: 2–4 h (configuração) + tempo de render (varia)</p><p><strong>[DECISÃO] Primeiros frames renderizados sem artefatos? Sim → continuar farm. Não → pausar job, corrigir e reiniciar.</strong></p><p><strong>5.5. Monitoramento e controle de qualidade de frames</strong></p><p>Ação: Monitorar frames renderizados a cada 10% de conclusão; verificar artefatos (fireflies, flicker de GI, z-fighting animado, artefatos de motion blur); corrigir problemas críticos imediatamente; documentar frames problemáticos para re-render pontual.</p><p>Responsável: Visualizador 3D Júnior</p><p>Output: Log de QA de frames; re-renders pontuais concluídos</p><p>Prazo referência: Contínuo durante render (1–3 dias)</p><p><strong>5.6. Organização e entrega dos frames para pós</strong></p><p>Ação: Organizar frames renderizados em estrutura de pastas por cena e por passe (EXR sequences nomeadas por frame: CENA01_BEAUTY_0001.exr etc.); verificar completude de todos os frames (sem gaps na sequência); compactar e transferir para servidor de pós-produção.</p><p>Responsável: Visualizador 3D Júnior</p><p>Output: Pastas de frames organizadas e entregues ao pós-produtor</p><p>Prazo referência: 2–4 h (verificação e organização)</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Animatic 3D aprovado pelo Dir. Criativo antes do render final. [ ] Sem colisão de câmera com geometria em nenhuma cena. [ ] Movimentos de câmera suaves (sem jitter ou movimento robótico). [ ] Iluminação consistente entre frames consecutivos (sem flicker). [ ] Todos os frames renderizados sem gaps na sequência. [ ] Passes organizados conforme convenção de nomenclatura TBO. [ ] Backup dos frames em servidor de armazenamento.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Flicker de GI entre frames: aumentar amostras de irradiance map ou usar modo ''animation'' do GI engine. Jitter de câmera: suavizar curvas de animação no Track View com filtro de tangente Smooth. Gap em sequência de frames (frame faltante): identificar no log do Deadline e re-renderizar frame específico. Motion blur excessivo: reduzir duração do shutter (VRay motion blur duration: 0,25–0,5).</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou Thinkbox Deadline (render farm); VFB para monitoramento de qualidade de frame; Premiere Pro / DaVinci Resolve (montagem do animatic); Backblaze B2 / Google Drive (backup de frames).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Preview animatic 3D: entregue em 1–2 dias úteis após início da animação. Render de frames (por cena de 10 segundos em FHD): 4–12 h de farm. Organização e entrega de frames para pós: até 24 h após conclusão do render. Duração total de produção (animação 2–3 min): 5–10 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebe storyboard aprovado → Animação de câmeras por cena → Animatic 3D (preview draft) → [Aprovado Dir. Criativo?] → Não: Ajustar câmeras → Sim: Ajuste de iluminação → Config. render farm → Submissão de jobs → Monitoramento de frames → [Artefatos críticos?] → Sim: Pausar e corrigir → Não: Continuar → Organização de pastas → Entrega para Pós (SOP 11) → Fim</p><p><strong>  10. Glossário</strong></p><p>Render farm: conjunto de computadores (físicos ou nuvem) dedicados ao processamento de render em paralelo. Animatic 3D: versão em baixa qualidade da animação para validação de câmeras e timing. Flicker: variação não intencional de brilho entre frames consecutivos. Deadline: software de gerenciamento de render farm da Thinkbox/AWS. EXR sequence: série de arquivos EXR numerados representando cada frame de uma animação. Motion blur: desfoque de movimento aplicado a objetos ou câmera em movimento para realismo cinematográfico.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    9,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-010
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Executar a produção técnica completa da animação 3D — animação de câmeras, iluminação animada, render de frames e organização dos passes — conforme storyboard e especificações aprovadas na pré-produção.', '<p>Executar a produção técnica completa da animação 3D — animação de câmeras, iluminação animada, render de frames e organização dos passes — conforme storyboard e especificações aprovadas na pré-produção.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Animação de câmeras e objetos; setup de iluminação para cenas animadas; configuração e execução do render de frames via render farm; organização e entrega de pastas de frames para pós-produção.', '<p>Animação de câmeras e objetos; setup de iluminação para cenas animadas; configuração e execução do render de frames via render farm; organização e entrega de pastas de frames para pós-produção.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Pré-produção e storyboard (cobertos pelo SOP 09); edição de vídeo, trilha sonora e entrega final (cobertos pelo SOP 11); modelagem e texturização (cobertos pelo SOP 02).', '<p>Pré-produção e storyboard (cobertos pelo SOP 09); edição de vídeo, trilha sonora e entrega final (cobertos pelo SOP 11); modelagem e texturização (cobertos pelo SOP 02).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Animar câmeras, configurar iluminação animada e gerenciar render

Responsável

—

Visualizador 3D Júnior

Suporte em render de cenas secundárias e organização de frames

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar preview de câmeras antes do render final

Aprovador

—

Gerente de Projetos

Monitorar cronograma de produção e comunicar desvios

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Animar câmeras, configurar iluminação animada e gerenciar render</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Suporte em render de cenas secundárias e organização de frames</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar preview de câmeras antes do render final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Monitorar cronograma de produção e comunicar desvios</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storyboard aprovado pelo cliente (output SOP 09); cenas 3D finalizadas com materiais e iluminação base (output SOP 02 e 03); especificações técnicas (resolução, FPS, duração por cena); render farm disponível e configurado.', '<p>Storyboard aprovado pelo cliente (output SOP 09); cenas 3D finalizadas com materiais e iluminação base (output SOP 02 e 03); especificações técnicas (resolução, FPS, duração por cena); render farm disponível e configurado.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max 2024+ com V-Ray ou Corona; Chaos Cloud ou render farm local (Deadline, Thinkbox); script de câmera para movimentos cinematográficos (Visu Motion ou câmeras manuais com curvas Bezier); monitor calibrado.', '<p>3ds Max 2024+ com V-Ray ou Corona; Chaos Cloud ou render farm local (Deadline, Thinkbox); script de câmera para movimentos cinematográficos (Visu Motion ou câmeras manuais com curvas Bezier); monitor calibrado.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Configuração das câmeras animadas', 'Ação: Criar câmeras de acordo com o storyboard aprovado; animar movimentos: dolly, pan, orbit, crane, fly-through; ajustar timing e suavidade das curvas de animação (ease in/out); verificar que não há colisões de câmera com geometria.

Responsável: Visualizador 3D Sênior

Output: Câmeras animadas por cena, movimento suave e sem colisão

Prazo referência: 1–2 h por cena', '<p>Ação: Criar câmeras de acordo com o storyboard aprovado; animar movimentos: dolly, pan, orbit, crane, fly-through; ajustar timing e suavidade das curvas de animação (ease in/out); verificar que não há colisões de câmera com geometria.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Câmeras animadas por cena, movimento suave e sem colisão</p><p>Prazo referência: 1–2 h por cena</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Preview em baixa resolução (animatic 3D)', 'Ação: Renderizar preview de todas as câmeras em baixa resolução (720p, qualidade draft, 5–10 min por cena); montar sequência de cenas no Premiere Pro ou DaVinci Resolve; revisar ritmo, timing e movimentos de câmera.

Responsável: Visualizador 3D Sênior

Output: Animatic 3D em MP4 para revisão interna

Prazo referência: Meio dia útil

[DECISÃO] Movimentos de câmera e timing aprovados pelo Dir. Criativo? Sim → render final. Não → ajustar curvas de animação e retestar.', '<p>Ação: Renderizar preview de todas as câmeras em baixa resolução (720p, qualidade draft, 5–10 min por cena); montar sequência de cenas no Premiere Pro ou DaVinci Resolve; revisar ritmo, timing e movimentos de câmera.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Animatic 3D em MP4 para revisão interna</p><p>Prazo referência: Meio dia útil</p><p><strong>[DECISÃO] Movimentos de câmera e timing aprovados pelo Dir. Criativo? Sim → render final. Não → ajustar curvas de animação e retestar.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Ajuste de iluminação para cenas em movimento', 'Ação: Revisar iluminação de cada cena considerando que a câmera estará em movimento; verificar que não há áreas superexpostas ou escuras demais durante o trajeto da câmera; ajustar GI e amostras para consistência entre frames consecutivos.

Responsável: Visualizador 3D Sênior

Output: Iluminação validada para todas as cenas animadas

Prazo referência: 2–4 h', '<p>Ação: Revisar iluminação de cada cena considerando que a câmera estará em movimento; verificar que não há áreas superexpostas ou escuras demais durante o trajeto da câmera; ajustar GI e amostras para consistência entre frames consecutivos.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Iluminação validada para todas as cenas animadas</p><p>Prazo referência: 2–4 h</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Configuração e submissão para render farm', 'Ação: Configurar parâmetros de render final (resolução, FPS, passes necessários); verificar paths de textura e dependências; submeter jobs para render farm via Deadline ou Chaos Cloud; configurar alertas de erro e monitoramento de progresso.

Responsável: Visualizador 3D Sênior

Output: Jobs submetidos ao render farm, monitoramento ativo

Prazo referência: 2–4 h (configuração) + tempo de render (varia)

[DECISÃO] Primeiros frames renderizados sem artefatos? Sim → continuar farm. Não → pausar job, corrigir e reiniciar.', '<p>Ação: Configurar parâmetros de render final (resolução, FPS, passes necessários); verificar paths de textura e dependências; submeter jobs para render farm via Deadline ou Chaos Cloud; configurar alertas de erro e monitoramento de progresso.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Jobs submetidos ao render farm, monitoramento ativo</p><p>Prazo referência: 2–4 h (configuração) + tempo de render (varia)</p><p><strong>[DECISÃO] Primeiros frames renderizados sem artefatos? Sim → continuar farm. Não → pausar job, corrigir e reiniciar.</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Monitoramento e controle de qualidade de frames', 'Ação: Monitorar frames renderizados a cada 10% de conclusão; verificar artefatos (fireflies, flicker de GI, z-fighting animado, artefatos de motion blur); corrigir problemas críticos imediatamente; documentar frames problemáticos para re-render pontual.

Responsável: Visualizador 3D Júnior

Output: Log de QA de frames; re-renders pontuais concluídos

Prazo referência: Contínuo durante render (1–3 dias)', '<p>Ação: Monitorar frames renderizados a cada 10% de conclusão; verificar artefatos (fireflies, flicker de GI, z-fighting animado, artefatos de motion blur); corrigir problemas críticos imediatamente; documentar frames problemáticos para re-render pontual.</p><p>Responsável: Visualizador 3D Júnior</p><p>Output: Log de QA de frames; re-renders pontuais concluídos</p><p>Prazo referência: Contínuo durante render (1–3 dias)</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Organização e entrega dos frames para pós', 'Ação: Organizar frames renderizados em estrutura de pastas por cena e por passe (EXR sequences nomeadas por frame: CENA01_BEAUTY_0001.exr etc.); verificar completude de todos os frames (sem gaps na sequência); compactar e transferir para servidor de pós-produção.

Responsável: Visualizador 3D Júnior

Output: Pastas de frames organizadas e entregues ao pós-produtor

Prazo referência: 2–4 h (verificação e organização)', '<p>Ação: Organizar frames renderizados em estrutura de pastas por cena e por passe (EXR sequences nomeadas por frame: CENA01_BEAUTY_0001.exr etc.); verificar completude de todos os frames (sem gaps na sequência); compactar e transferir para servidor de pós-produção.</p><p>Responsável: Visualizador 3D Júnior</p><p>Output: Pastas de frames organizadas e entregues ao pós-produtor</p><p>Prazo referência: 2–4 h (verificação e organização)</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Animatic 3D aprovado pelo Dir. Criativo antes do render final. [ ] Sem colisão de câmera com geometria em nenhuma cena. [ ] Movimentos de câmera suaves (sem jitter ou movimento robótico). [ ] Iluminação consistente entre frames consecutivos (sem flicker). [ ] Todos os frames renderizados sem gaps na sequência. [ ] Passes organizados conforme convenção de nomenclatura TBO. [ ] Backup dos frames em servidor de armazenamento.', '<p>[ ] Animatic 3D aprovado pelo Dir. Criativo antes do render final. [ ] Sem colisão de câmera com geometria em nenhuma cena. [ ] Movimentos de câmera suaves (sem jitter ou movimento robótico). [ ] Iluminação consistente entre frames consecutivos (sem flicker). [ ] Todos os frames renderizados sem gaps na sequência. [ ] Passes organizados conforme convenção de nomenclatura TBO. [ ] Backup dos frames em servidor de armazenamento.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Flicker de GI entre frames: aumentar amostras de irradiance map ou usar modo ''animation'' do GI engine. Jitter de câmera: suavizar curvas de animação no Track View com filtro de tangente Smooth. Gap em sequência de frames (frame faltante): identificar no log do Deadline e re-renderizar frame específico. Motion blur excessivo: reduzir duração do shutter (VRay motion blur duration: 0,25–0,5).', '<p>Flicker de GI entre frames: aumentar amostras de irradiance map ou usar modo ''animation'' do GI engine. Jitter de câmera: suavizar curvas de animação no Track View com filtro de tangente Smooth. Gap em sequência de frames (frame faltante): identificar no log do Deadline e re-renderizar frame específico. Motion blur excessivo: reduzir duração do shutter (VRay motion blur duration: 0,25–0,5).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou Thinkbox Deadline (render farm); VFB para monitoramento de qualidade de frame; Premiere Pro / DaVinci Resolve (montagem do animatic); Backblaze B2 / Google Drive (backup de frames).', '<p>3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou Thinkbox Deadline (render farm); VFB para monitoramento de qualidade de frame; Premiere Pro / DaVinci Resolve (montagem do animatic); Backblaze B2 / Google Drive (backup de frames).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Preview animatic 3D: entregue em 1–2 dias úteis após início da animação. Render de frames (por cena de 10 segundos em FHD): 4–12 h de farm. Organização e entrega de frames para pós: até 24 h após conclusão do render. Duração total de produção (animação 2–3 min): 5–10 dias úteis.', '<p>Preview animatic 3D: entregue em 1–2 dias úteis após início da animação. Render de frames (por cena de 10 segundos em FHD): 4–12 h de farm. Organização e entrega de frames para pós: até 24 h após conclusão do render. Duração total de produção (animação 2–3 min): 5–10 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe storyboard aprovado → Animação de câmeras por cena → Animatic 3D (preview draft) → [Aprovado Dir. Criativo?] → Não: Ajustar câmeras → Sim: Ajuste de iluminação → Config. render farm → Submissão de jobs → Monitoramento de frames → [Artefatos críticos?] → Sim: Pausar e corrigir → Não: Continuar → Organização de pastas → Entrega para Pós (SOP 11) → Fim', '<p>Início → Recebe storyboard aprovado → Animação de câmeras por cena → Animatic 3D (preview draft) → [Aprovado Dir. Criativo?] → Não: Ajustar câmeras → Sim: Ajuste de iluminação → Config. render farm → Submissão de jobs → Monitoramento de frames → [Artefatos críticos?] → Sim: Pausar e corrigir → Não: Continuar → Organização de pastas → Entrega para Pós (SOP 11) → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Render farm: conjunto de computadores (físicos ou nuvem) dedicados ao processamento de render em paralelo. Animatic 3D: versão em baixa qualidade da animação para validação de câmeras e timing. Flicker: variação não intencional de brilho entre frames consecutivos. Deadline: software de gerenciamento de render farm da Thinkbox/AWS. EXR sequence: série de arquivos EXR numerados representando cada frame de uma animação. Motion blur: desfoque de movimento aplicado a objetos ou câmera em movimento para realismo cinematográfico.', '<p>Render farm: conjunto de computadores (físicos ou nuvem) dedicados ao processamento de render em paralelo. Animatic 3D: versão em baixa qualidade da animação para validação de câmeras e timing. Flicker: variação não intencional de brilho entre frames consecutivos. Deadline: software de gerenciamento de render farm da Thinkbox/AWS. EXR sequence: série de arquivos EXR numerados representando cada frame de uma animação. Motion blur: desfoque de movimento aplicado a objetos ou câmera em movimento para realismo cinematográfico.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-3D-011: Animações 3D Pós produção ──
END $$;