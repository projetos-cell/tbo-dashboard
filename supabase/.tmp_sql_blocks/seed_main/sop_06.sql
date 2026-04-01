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
END $$;