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