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
    'Imagens Estáticas Iluminação e Render',
    'tbo-3d-003-imagens-estaticas-iluminacao-e-render',
    'digital-3d',
    'checklist',
    'Imagens Estáticas — Iluminação e Render',
    'Standard Operating Procedure

Imagens Estáticas — Iluminação e Render

Código

TBO-3D-003

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

Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.

  2. Escopo

2.1 O que está coberto

Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).

2.2 Exclusões

Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Executar setup de iluminação e configurar parâmetros de render

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar configuração de luz e câmera antes do render final

Aprovador

—

Visualizador 3D Júnior

Suporte em testes de render e organização de passes

Consultado

—

Gerente de Projetos

Acompanhar prazo e comunicar cliente sobre status

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.

4.2 Ferramentas e Acessos

3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.



  5. Procedimento Passo a Passo

5.1. Revisão de briefing e referências

Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.

Responsável: Visualizador 3D Sênior

Output: Lista de parâmetros de iluminação e ângulos confirmados

Prazo referência: 30 min

5.2. Setup de iluminação

Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.

Responsável: Visualizador 3D Sênior

Output: Iluminação configurada e testada em preview

Prazo referência: 1–2 h

[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.

5.3. Configuração de câmera e composição

Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.

Responsável: Visualizador 3D Sênior

Output: Câmera posicionada com composição aprovada

Prazo referência: 30–45 min

5.4. Render de teste (baixa resolução)

Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.

Responsável: Visualizador 3D Sênior

Output: Imagem de teste revisada e lista de ajustes documentada

Prazo referência: 30–60 min

[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.

5.5. Aprovação interna e ajustes finais

Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.

Responsável: Visualizador 3D Sênior

Output: Cena aprovada internamente para render final

Prazo referência: 1–3 h (incluindo ciclo de feedback)

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.

5.6. Render final com passes

Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.

Responsável: Visualizador 3D Sênior

Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO

Prazo referência: 2–8 h (variável por complexidade e hardware)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.

6.2 Erros Comuns a Evitar

Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.

  7. Ferramentas e Templates

3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.

  8. SLAs e Prazos

Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.

  9. Fluxograma

Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim

  10. Glossário

HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Imagens Estáticas — Iluminação e Render</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Executar setup de iluminação e configurar parâmetros de render</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar configuração de luz e câmera antes do render final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Suporte em testes de render e organização de passes</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Acompanhar prazo e comunicar cliente sobre status</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Revisão de briefing e referências</strong></p><p>Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Lista de parâmetros de iluminação e ângulos confirmados</p><p>Prazo referência: 30 min</p><p><strong>5.2. Setup de iluminação</strong></p><p>Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Iluminação configurada e testada em preview</p><p>Prazo referência: 1–2 h</p><p><strong>[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.</strong></p><p><strong>5.3. Configuração de câmera e composição</strong></p><p>Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Câmera posicionada com composição aprovada</p><p>Prazo referência: 30–45 min</p><p><strong>5.4. Render de teste (baixa resolução)</strong></p><p>Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Imagem de teste revisada e lista de ajustes documentada</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.</strong></p><p><strong>5.5. Aprovação interna e ajustes finais</strong></p><p>Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Cena aprovada internamente para render final</p><p>Prazo referência: 1–3 h (incluindo ciclo de feedback)</p><p><strong>[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.</strong></p><p><strong>5.6. Render final com passes</strong></p><p>Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO</p><p>Prazo referência: 2–8 h (variável por complexidade e hardware)</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim</p><p><strong>  10. Glossário</strong></p><p>HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.', '<p>Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).', '<p>Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.', '<p>Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Executar setup de iluminação e configurar parâmetros de render

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar configuração de luz e câmera antes do render final

Aprovador

—

Visualizador 3D Júnior

Suporte em testes de render e organização de passes

Consultado

—

Gerente de Projetos

Acompanhar prazo e comunicar cliente sobre status

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Executar setup de iluminação e configurar parâmetros de render</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar configuração de luz e câmera antes do render final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Suporte em testes de render e organização de passes</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Acompanhar prazo e comunicar cliente sobre status</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.', '<p>Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.', '<p>3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Revisão de briefing e referências', 'Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.

Responsável: Visualizador 3D Sênior

Output: Lista de parâmetros de iluminação e ângulos confirmados

Prazo referência: 30 min', '<p>Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Lista de parâmetros de iluminação e ângulos confirmados</p><p>Prazo referência: 30 min</p>', 6, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Setup de iluminação', 'Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.

Responsável: Visualizador 3D Sênior

Output: Iluminação configurada e testada em preview

Prazo referência: 1–2 h

[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.', '<p>Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Iluminação configurada e testada em preview</p><p>Prazo referência: 1–2 h</p><p><strong>[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Configuração de câmera e composição', 'Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.

Responsável: Visualizador 3D Sênior

Output: Câmera posicionada com composição aprovada

Prazo referência: 30–45 min', '<p>Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Câmera posicionada com composição aprovada</p><p>Prazo referência: 30–45 min</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Render de teste (baixa resolução)', 'Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.

Responsável: Visualizador 3D Sênior

Output: Imagem de teste revisada e lista de ajustes documentada

Prazo referência: 30–60 min

[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.', '<p>Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Imagem de teste revisada e lista de ajustes documentada</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação interna e ajustes finais', 'Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.

Responsável: Visualizador 3D Sênior

Output: Cena aprovada internamente para render final

Prazo referência: 1–3 h (incluindo ciclo de feedback)

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.', '<p>Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Cena aprovada internamente para render final</p><p>Prazo referência: 1–3 h (incluindo ciclo de feedback)</p><p><strong>[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Render final com passes', 'Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.

Responsável: Visualizador 3D Sênior

Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO

Prazo referência: 2–8 h (variável por complexidade e hardware)', '<p>Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO</p><p>Prazo referência: 2–8 h (variável por complexidade e hardware)</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.', '<p>[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.', '<p>Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.', '<p>3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.', '<p>Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim', '<p>Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.', '<p>HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-3D-004: Imagens Estáticas Pós produção ──
END $$;