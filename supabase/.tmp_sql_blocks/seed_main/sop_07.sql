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
END $$;