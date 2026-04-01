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
    'Imagens Estáticas Pós produção',
    'tbo-3d-004-imagens-estaticas-pos-producao',
    'digital-3d',
    'checklist',
    'Imagens Estáticas — Pós-produção',
    'Standard Operating Procedure

Imagens Estáticas — Pós-produção

Código

TBO-3D-004

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

Realizar o tratamento completo das imagens estáticas em pós-produção — compositing de passes, correção de cor, inserção de elementos de ambientação e finalização para entrega — gerando arquivos prontos para apresentação ao cliente.

  2. Escopo

2.1 O que está coberto

Compositing de passes de render no Photoshop; correção e gradação de cor; inserção de elementos 2D (céu, vegetação, pessoas, veículos, reflexos de poça); ajustes locais de luz e sombra; finalização e exportação em formatos de entrega.

2.2 Exclusões

Renderização 3D (coberta pelo SOP 03); tratamento de vídeo e animações (cobertos pelos SOPs 09–11); criação de peças de marketing final (responsabilidade do time de Design).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Pós-produtor / Motion Designer

Executar compositing e finalização de imagens

Responsável

—

Visualizador 3D Sênior

Entregar passes organizados e apoiar ajustes de elementos 3D

Consultado

—

Diretor Criativo (Marco Andolfato)

Aprovar paleta de cor, inserção de elementos e versão final

Aprovador

—

Gerente de Projetos

Validar entregáveis conforme escopo contratado e comunicar cliente

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Pasta de passes EXR entregue pelo Visualizador 3D (output SOP 03); briefing criativo com referências de cor, clima e estilo de ambientação; biblioteca de assets 2D TBO (céus, pessoas, vegetação PNG recortados).

4.2 Ferramentas e Acessos

Adobe Photoshop 2024+; Adobe Camera Raw; biblioteca de assets 2D TBO (sky library, entourage library); Nik Collection (opcional para gradação); monitor calibrado; perfil de cor sRGB.



  5. Procedimento Passo a Passo

5.1. Importação e organização de passes

Ação: Abrir passes EXR no Photoshop; nomear grupos e layers conforme convenção TBO (Beauty, Diffuse, Reflection, Shadow, AO, Depth, Masks); configurar modo de mesclagem correto por passe (Multiply para AO, Screen para reflexos etc.).

Responsável: Pós-produtor

Output: Arquivo PSD organizado com passes em grupos nomeados

Prazo referência: 30–45 min

5.2. Compositing base e ajuste de exposição

Ação: Montar composição base com passes; ajustar exposição geral e balanço de branco via Camera Raw; revisar áreas críticas (janelas, céu, sombras profundas); garantir que o range dinâmico esteja equilibrado.

Responsável: Pós-produtor

Output: Composição base equilibrada e revisada

Prazo referência: 30–60 min

[DECISÃO] Base está equilibrada e sem artefatos visíveis? Sim → prosseguir. Não → solicitar re-render de passe específico ao 3D.

5.3. Inserção de elementos de ambientação

Ação: Inserir céu (da sky library TBO ou sky photography aprovada); adicionar vegetação, pessoas, veículos e outros entourage em escala correta; ajustar sombras e reflexos dos elementos inseridos para integração realista; inserir efeitos atmosféricos (névoa, god rays) se indicado no briefing.

Responsável: Pós-produtor

Output: Imagem com ambientação completa e escala coerente

Prazo referência: 1–3 h

5.4. Gradação de cor e finalização criativa

Ação: Aplicar gradação de cor (LUT ou ajustes Curves/Hue-Saturation) conforme referência do briefing; reforçar contraste local em pontos de interesse; suavizar transições entre elementos 3D e 2D inseridos; aplicar vignette sutil se adequado ao estilo.

Responsável: Pós-produtor

Output: Versão final com paleta de cor aprovada

Prazo referência: 30–60 min

5.5. Revisão interna e aprovação do Dir. Criativo

Ação: Enviar versão final para revisão do Diretor Criativo via TBO OS (comments na tarefa); incorporar feedback de cor, elementos e ajustes; máximo de 2 rodadas de revisão interna.

Responsável: Pós-produtor

Output: Imagem aprovada internamente

Prazo referência: 24 h (ciclo de revisão)

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → novo ciclo (máx. 2x).

5.6. Exportação e nomenclatura final

Ação: Exportar JPEG alta qualidade (90–95%, sRGB, 72 dpi para digital / 300 dpi para impressão); exportar PNG sem fundo se solicitado; salvar PSD master com layers preservadas; nomear arquivos conforme padrão: [PROJETO]_[ANGULO]_[VERSAO]_[DATA].

Responsável: Pós-produtor

Output: Arquivos finais exportados e nomeados; PSD master salvo em servidor

Prazo referência: 30 min

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Passes corretamente compostos (sem banding, sem artefatos de borda). [ ] Elementos de ambientação em escala correta e com sombra coerente. [ ] Paleta de cor aderente ao briefing. [ ] Sem halos ou franjas em bordas de recorte. [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] PSD master salvo no servidor com todas as layers. [ ] Nomenclatura de arquivo conforme padrão TBO.

6.2 Erros Comuns a Evitar

Halo branco em recortes: refinar máscara com Select and Mask ou Defringe. Escala errada de entourage: recalibrar pela altura de portas/pessoas (porta padrão = 2,10 m). Cor dessaturada/acinzentada: verificar perfil de cor do documento (deve ser sRGB IEC61966-2.1). Artefatos de compressão no JPEG: aumentar qualidade para 95 ou exportar como TIFF.

  7. Ferramentas e Templates

Adobe Photoshop 2024+; Adobe Camera Raw; Nik Color Efex Pro (opcional); biblioteca TBO de assets 2D (sky, entourage); Pantone Connect (para validação de cor em materiais de impressão).

  8. SLAs e Prazos

Compositing + inserção de elementos: 3–6 h por imagem. Ciclo de revisão interna: até 24 h por rodada. Máximo de 2 rodadas de revisão interna inclusas. Exportação final: entregue no mesmo dia da aprovação interna.

  9. Fluxograma

Início → Recebe passes EXR → Importação e organização no PSD → Compositing base → [ARTEFATOS?] → Sim: Solicita re-render → Não: Inserção de ambientação → Gradação de cor → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega ao Gerente de Projetos → Fim

  10. Glossário

Passes de render: camadas separadas para composição flexível em pós. Entourage: elementos de ambientação (pessoas, carros, vegetação) inseridos em pós. Compositing: processo de combinar múltiplas camadas/imagens em uma composição final. LUT: Look-Up Table, tabela de gradação de cor pré-definida. Vignette: escurecimento sutil das bordas para guiar o olhar ao centro. PSD master: arquivo Photoshop com todas as layers preservadas para futuras revisões.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Imagens Estáticas — Pós-produção</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Realizar o tratamento completo das imagens estáticas em pós-produção — compositing de passes, correção de cor, inserção de elementos de ambientação e finalização para entrega — gerando arquivos prontos para apresentação ao cliente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Compositing de passes de render no Photoshop; correção e gradação de cor; inserção de elementos 2D (céu, vegetação, pessoas, veículos, reflexos de poça); ajustes locais de luz e sombra; finalização e exportação em formatos de entrega.</p><p><strong>2.2 Exclusões</strong></p><p>Renderização 3D (coberta pelo SOP 03); tratamento de vídeo e animações (cobertos pelos SOPs 09–11); criação de peças de marketing final (responsabilidade do time de Design).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Pós-produtor / Motion Designer</p></td><td><p>Executar compositing e finalização de imagens</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Entregar passes organizados e apoiar ajustes de elementos 3D</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar paleta de cor, inserção de elementos e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Validar entregáveis conforme escopo contratado e comunicar cliente</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Pasta de passes EXR entregue pelo Visualizador 3D (output SOP 03); briefing criativo com referências de cor, clima e estilo de ambientação; biblioteca de assets 2D TBO (céus, pessoas, vegetação PNG recortados).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Photoshop 2024+; Adobe Camera Raw; biblioteca de assets 2D TBO (sky library, entourage library); Nik Collection (opcional para gradação); monitor calibrado; perfil de cor sRGB.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Importação e organização de passes</strong></p><p>Ação: Abrir passes EXR no Photoshop; nomear grupos e layers conforme convenção TBO (Beauty, Diffuse, Reflection, Shadow, AO, Depth, Masks); configurar modo de mesclagem correto por passe (Multiply para AO, Screen para reflexos etc.).</p><p>Responsável: Pós-produtor</p><p>Output: Arquivo PSD organizado com passes em grupos nomeados</p><p>Prazo referência: 30–45 min</p><p><strong>5.2. Compositing base e ajuste de exposição</strong></p><p>Ação: Montar composição base com passes; ajustar exposição geral e balanço de branco via Camera Raw; revisar áreas críticas (janelas, céu, sombras profundas); garantir que o range dinâmico esteja equilibrado.</p><p>Responsável: Pós-produtor</p><p>Output: Composição base equilibrada e revisada</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Base está equilibrada e sem artefatos visíveis? Sim → prosseguir. Não → solicitar re-render de passe específico ao 3D.</strong></p><p><strong>5.3. Inserção de elementos de ambientação</strong></p><p>Ação: Inserir céu (da sky library TBO ou sky photography aprovada); adicionar vegetação, pessoas, veículos e outros entourage em escala correta; ajustar sombras e reflexos dos elementos inseridos para integração realista; inserir efeitos atmosféricos (névoa, god rays) se indicado no briefing.</p><p>Responsável: Pós-produtor</p><p>Output: Imagem com ambientação completa e escala coerente</p><p>Prazo referência: 1–3 h</p><p><strong>5.4. Gradação de cor e finalização criativa</strong></p><p>Ação: Aplicar gradação de cor (LUT ou ajustes Curves/Hue-Saturation) conforme referência do briefing; reforçar contraste local em pontos de interesse; suavizar transições entre elementos 3D e 2D inseridos; aplicar vignette sutil se adequado ao estilo.</p><p>Responsável: Pós-produtor</p><p>Output: Versão final com paleta de cor aprovada</p><p>Prazo referência: 30–60 min</p><p><strong>5.5. Revisão interna e aprovação do Dir. Criativo</strong></p><p>Ação: Enviar versão final para revisão do Diretor Criativo via TBO OS (comments na tarefa); incorporar feedback de cor, elementos e ajustes; máximo de 2 rodadas de revisão interna.</p><p>Responsável: Pós-produtor</p><p>Output: Imagem aprovada internamente</p><p>Prazo referência: 24 h (ciclo de revisão)</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → novo ciclo (máx. 2x).</strong></p><p><strong>5.6. Exportação e nomenclatura final</strong></p><p>Ação: Exportar JPEG alta qualidade (90–95%, sRGB, 72 dpi para digital / 300 dpi para impressão); exportar PNG sem fundo se solicitado; salvar PSD master com layers preservadas; nomear arquivos conforme padrão: [PROJETO]_[ANGULO]_[VERSAO]_[DATA].</p><p>Responsável: Pós-produtor</p><p>Output: Arquivos finais exportados e nomeados; PSD master salvo em servidor</p><p>Prazo referência: 30 min</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Passes corretamente compostos (sem banding, sem artefatos de borda). [ ] Elementos de ambientação em escala correta e com sombra coerente. [ ] Paleta de cor aderente ao briefing. [ ] Sem halos ou franjas em bordas de recorte. [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] PSD master salvo no servidor com todas as layers. [ ] Nomenclatura de arquivo conforme padrão TBO.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Halo branco em recortes: refinar máscara com Select and Mask ou Defringe. Escala errada de entourage: recalibrar pela altura de portas/pessoas (porta padrão = 2,10 m). Cor dessaturada/acinzentada: verificar perfil de cor do documento (deve ser sRGB IEC61966-2.1). Artefatos de compressão no JPEG: aumentar qualidade para 95 ou exportar como TIFF.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Photoshop 2024+; Adobe Camera Raw; Nik Color Efex Pro (opcional); biblioteca TBO de assets 2D (sky, entourage); Pantone Connect (para validação de cor em materiais de impressão).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Compositing + inserção de elementos: 3–6 h por imagem. Ciclo de revisão interna: até 24 h por rodada. Máximo de 2 rodadas de revisão interna inclusas. Exportação final: entregue no mesmo dia da aprovação interna.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebe passes EXR → Importação e organização no PSD → Compositing base → [ARTEFATOS?] → Sim: Solicita re-render → Não: Inserção de ambientação → Gradação de cor → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega ao Gerente de Projetos → Fim</p><p><strong>  10. Glossário</strong></p><p>Passes de render: camadas separadas para composição flexível em pós. Entourage: elementos de ambientação (pessoas, carros, vegetação) inseridos em pós. Compositing: processo de combinar múltiplas camadas/imagens em uma composição final. LUT: Look-Up Table, tabela de gradação de cor pré-definida. Vignette: escurecimento sutil das bordas para guiar o olhar ao centro. PSD master: arquivo Photoshop com todas as layers preservadas para futuras revisões.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    3,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Realizar o tratamento completo das imagens estáticas em pós-produção — compositing de passes, correção de cor, inserção de elementos de ambientação e finalização para entrega — gerando arquivos prontos para apresentação ao cliente.', '<p>Realizar o tratamento completo das imagens estáticas em pós-produção — compositing de passes, correção de cor, inserção de elementos de ambientação e finalização para entrega — gerando arquivos prontos para apresentação ao cliente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Compositing de passes de render no Photoshop; correção e gradação de cor; inserção de elementos 2D (céu, vegetação, pessoas, veículos, reflexos de poça); ajustes locais de luz e sombra; finalização e exportação em formatos de entrega.', '<p>Compositing de passes de render no Photoshop; correção e gradação de cor; inserção de elementos 2D (céu, vegetação, pessoas, veículos, reflexos de poça); ajustes locais de luz e sombra; finalização e exportação em formatos de entrega.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Renderização 3D (coberta pelo SOP 03); tratamento de vídeo e animações (cobertos pelos SOPs 09–11); criação de peças de marketing final (responsabilidade do time de Design).', '<p>Renderização 3D (coberta pelo SOP 03); tratamento de vídeo e animações (cobertos pelos SOPs 09–11); criação de peças de marketing final (responsabilidade do time de Design).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Pós-produtor / Motion Designer

Executar compositing e finalização de imagens

Responsável

—

Visualizador 3D Sênior

Entregar passes organizados e apoiar ajustes de elementos 3D

Consultado

—

Diretor Criativo (Marco Andolfato)

Aprovar paleta de cor, inserção de elementos e versão final

Aprovador

—

Gerente de Projetos

Validar entregáveis conforme escopo contratado e comunicar cliente

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Pós-produtor / Motion Designer</p></td><td><p>Executar compositing e finalização de imagens</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Entregar passes organizados e apoiar ajustes de elementos 3D</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar paleta de cor, inserção de elementos e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Validar entregáveis conforme escopo contratado e comunicar cliente</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Pasta de passes EXR entregue pelo Visualizador 3D (output SOP 03); briefing criativo com referências de cor, clima e estilo de ambientação; biblioteca de assets 2D TBO (céus, pessoas, vegetação PNG recortados).', '<p>Pasta de passes EXR entregue pelo Visualizador 3D (output SOP 03); briefing criativo com referências de cor, clima e estilo de ambientação; biblioteca de assets 2D TBO (céus, pessoas, vegetação PNG recortados).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Photoshop 2024+; Adobe Camera Raw; biblioteca de assets 2D TBO (sky library, entourage library); Nik Collection (opcional para gradação); monitor calibrado; perfil de cor sRGB.', '<p>Adobe Photoshop 2024+; Adobe Camera Raw; biblioteca de assets 2D TBO (sky library, entourage library); Nik Collection (opcional para gradação); monitor calibrado; perfil de cor sRGB.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Importação e organização de passes', 'Ação: Abrir passes EXR no Photoshop; nomear grupos e layers conforme convenção TBO (Beauty, Diffuse, Reflection, Shadow, AO, Depth, Masks); configurar modo de mesclagem correto por passe (Multiply para AO, Screen para reflexos etc.).

Responsável: Pós-produtor

Output: Arquivo PSD organizado com passes em grupos nomeados

Prazo referência: 30–45 min', '<p>Ação: Abrir passes EXR no Photoshop; nomear grupos e layers conforme convenção TBO (Beauty, Diffuse, Reflection, Shadow, AO, Depth, Masks); configurar modo de mesclagem correto por passe (Multiply para AO, Screen para reflexos etc.).</p><p>Responsável: Pós-produtor</p><p>Output: Arquivo PSD organizado com passes em grupos nomeados</p><p>Prazo referência: 30–45 min</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Compositing base e ajuste de exposição', 'Ação: Montar composição base com passes; ajustar exposição geral e balanço de branco via Camera Raw; revisar áreas críticas (janelas, céu, sombras profundas); garantir que o range dinâmico esteja equilibrado.

Responsável: Pós-produtor

Output: Composição base equilibrada e revisada

Prazo referência: 30–60 min

[DECISÃO] Base está equilibrada e sem artefatos visíveis? Sim → prosseguir. Não → solicitar re-render de passe específico ao 3D.', '<p>Ação: Montar composição base com passes; ajustar exposição geral e balanço de branco via Camera Raw; revisar áreas críticas (janelas, céu, sombras profundas); garantir que o range dinâmico esteja equilibrado.</p><p>Responsável: Pós-produtor</p><p>Output: Composição base equilibrada e revisada</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Base está equilibrada e sem artefatos visíveis? Sim → prosseguir. Não → solicitar re-render de passe específico ao 3D.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Inserção de elementos de ambientação', 'Ação: Inserir céu (da sky library TBO ou sky photography aprovada); adicionar vegetação, pessoas, veículos e outros entourage em escala correta; ajustar sombras e reflexos dos elementos inseridos para integração realista; inserir efeitos atmosféricos (névoa, god rays) se indicado no briefing.

Responsável: Pós-produtor

Output: Imagem com ambientação completa e escala coerente

Prazo referência: 1–3 h', '<p>Ação: Inserir céu (da sky library TBO ou sky photography aprovada); adicionar vegetação, pessoas, veículos e outros entourage em escala correta; ajustar sombras e reflexos dos elementos inseridos para integração realista; inserir efeitos atmosféricos (névoa, god rays) se indicado no briefing.</p><p>Responsável: Pós-produtor</p><p>Output: Imagem com ambientação completa e escala coerente</p><p>Prazo referência: 1–3 h</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gradação de cor e finalização criativa', 'Ação: Aplicar gradação de cor (LUT ou ajustes Curves/Hue-Saturation) conforme referência do briefing; reforçar contraste local em pontos de interesse; suavizar transições entre elementos 3D e 2D inseridos; aplicar vignette sutil se adequado ao estilo.

Responsável: Pós-produtor

Output: Versão final com paleta de cor aprovada

Prazo referência: 30–60 min', '<p>Ação: Aplicar gradação de cor (LUT ou ajustes Curves/Hue-Saturation) conforme referência do briefing; reforçar contraste local em pontos de interesse; suavizar transições entre elementos 3D e 2D inseridos; aplicar vignette sutil se adequado ao estilo.</p><p>Responsável: Pós-produtor</p><p>Output: Versão final com paleta de cor aprovada</p><p>Prazo referência: 30–60 min</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Revisão interna e aprovação do Dir. Criativo', 'Ação: Enviar versão final para revisão do Diretor Criativo via TBO OS (comments na tarefa); incorporar feedback de cor, elementos e ajustes; máximo de 2 rodadas de revisão interna.

Responsável: Pós-produtor

Output: Imagem aprovada internamente

Prazo referência: 24 h (ciclo de revisão)

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → novo ciclo (máx. 2x).', '<p>Ação: Enviar versão final para revisão do Diretor Criativo via TBO OS (comments na tarefa); incorporar feedback de cor, elementos e ajustes; máximo de 2 rodadas de revisão interna.</p><p>Responsável: Pós-produtor</p><p>Output: Imagem aprovada internamente</p><p>Prazo referência: 24 h (ciclo de revisão)</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → novo ciclo (máx. 2x).</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Exportação e nomenclatura final', 'Ação: Exportar JPEG alta qualidade (90–95%, sRGB, 72 dpi para digital / 300 dpi para impressão); exportar PNG sem fundo se solicitado; salvar PSD master com layers preservadas; nomear arquivos conforme padrão: [PROJETO]_[ANGULO]_[VERSAO]_[DATA].

Responsável: Pós-produtor

Output: Arquivos finais exportados e nomeados; PSD master salvo em servidor

Prazo referência: 30 min', '<p>Ação: Exportar JPEG alta qualidade (90–95%, sRGB, 72 dpi para digital / 300 dpi para impressão); exportar PNG sem fundo se solicitado; salvar PSD master com layers preservadas; nomear arquivos conforme padrão: [PROJETO]_[ANGULO]_[VERSAO]_[DATA].</p><p>Responsável: Pós-produtor</p><p>Output: Arquivos finais exportados e nomeados; PSD master salvo em servidor</p><p>Prazo referência: 30 min</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Passes corretamente compostos (sem banding, sem artefatos de borda). [ ] Elementos de ambientação em escala correta e com sombra coerente. [ ] Paleta de cor aderente ao briefing. [ ] Sem halos ou franjas em bordas de recorte. [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] PSD master salvo no servidor com todas as layers. [ ] Nomenclatura de arquivo conforme padrão TBO.', '<p>[ ] Passes corretamente compostos (sem banding, sem artefatos de borda). [ ] Elementos de ambientação em escala correta e com sombra coerente. [ ] Paleta de cor aderente ao briefing. [ ] Sem halos ou franjas em bordas de recorte. [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] PSD master salvo no servidor com todas as layers. [ ] Nomenclatura de arquivo conforme padrão TBO.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Halo branco em recortes: refinar máscara com Select and Mask ou Defringe. Escala errada de entourage: recalibrar pela altura de portas/pessoas (porta padrão = 2,10 m). Cor dessaturada/acinzentada: verificar perfil de cor do documento (deve ser sRGB IEC61966-2.1). Artefatos de compressão no JPEG: aumentar qualidade para 95 ou exportar como TIFF.', '<p>Halo branco em recortes: refinar máscara com Select and Mask ou Defringe. Escala errada de entourage: recalibrar pela altura de portas/pessoas (porta padrão = 2,10 m). Cor dessaturada/acinzentada: verificar perfil de cor do documento (deve ser sRGB IEC61966-2.1). Artefatos de compressão no JPEG: aumentar qualidade para 95 ou exportar como TIFF.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Photoshop 2024+; Adobe Camera Raw; Nik Color Efex Pro (opcional); biblioteca TBO de assets 2D (sky, entourage); Pantone Connect (para validação de cor em materiais de impressão).', '<p>Adobe Photoshop 2024+; Adobe Camera Raw; Nik Color Efex Pro (opcional); biblioteca TBO de assets 2D (sky, entourage); Pantone Connect (para validação de cor em materiais de impressão).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Compositing + inserção de elementos: 3–6 h por imagem. Ciclo de revisão interna: até 24 h por rodada. Máximo de 2 rodadas de revisão interna inclusas. Exportação final: entregue no mesmo dia da aprovação interna.', '<p>Compositing + inserção de elementos: 3–6 h por imagem. Ciclo de revisão interna: até 24 h por rodada. Máximo de 2 rodadas de revisão interna inclusas. Exportação final: entregue no mesmo dia da aprovação interna.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe passes EXR → Importação e organização no PSD → Compositing base → [ARTEFATOS?] → Sim: Solicita re-render → Não: Inserção de ambientação → Gradação de cor → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega ao Gerente de Projetos → Fim', '<p>Início → Recebe passes EXR → Importação e organização no PSD → Compositing base → [ARTEFATOS?] → Sim: Solicita re-render → Não: Inserção de ambientação → Gradação de cor → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega ao Gerente de Projetos → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Passes de render: camadas separadas para composição flexível em pós. Entourage: elementos de ambientação (pessoas, carros, vegetação) inseridos em pós. Compositing: processo de combinar múltiplas camadas/imagens em uma composição final. LUT: Look-Up Table, tabela de gradação de cor pré-definida. Vignette: escurecimento sutil das bordas para guiar o olhar ao centro. PSD master: arquivo Photoshop com todas as layers preservadas para futuras revisões.', '<p>Passes de render: camadas separadas para composição flexível em pós. Entourage: elementos de ambientação (pessoas, carros, vegetação) inseridos em pós. Compositing: processo de combinar múltiplas camadas/imagens em uma composição final. LUT: Look-Up Table, tabela de gradação de cor pré-definida. Vignette: escurecimento sutil das bordas para guiar o olhar ao centro. PSD master: arquivo Photoshop com todas as layers preservadas para futuras revisões.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-3D-005: Plantas Humanizadas ──
END $$;