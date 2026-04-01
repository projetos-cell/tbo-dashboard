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
    'Animações 3D Pós produção',
    'tbo-3d-011-animacoes-3d-pos-producao',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Animações 3D — Pós-produção

Código

TBO-3D-011

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

Transformar as sequências de frames renderizados em um vídeo final polido — com compositing, gradação de cor, trilha sonora, motion graphics e entrega nos formatos contratados — pronto para apresentação e distribuição ao cliente.

  2. Escopo

2.1 O que está coberto

Compositing de passes de render em After Effects; gradação de cor; inserção de elementos 2D animados (céu, vegetação, pessoas); trilha sonora e voice-over; criação de títulos e motion graphics; exportação em formatos de entrega (MP4, MOV, DPX).

2.2 Exclusões

Produção de frames 3D (coberta pelo SOP 10); criação de conteúdo de voice-over pelo time TBO; distribuição em plataformas digitais (responsabilidade do time de Marketing).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Pós-produtor / Motion Designer

Executar compositing, gradação de cor e edição final

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar cut de edição, paleta de cor e versão final

Aprovador

—

Gerente de Projetos

Coordenar entrega de trilha sonora e aprovação com cliente

Consultado

Informado

Cliente / Incorporadora

Aprovar versão final antes da exportação master

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Pastas de frames EXR organizados por cena e passe (output SOP 10); trilha sonora ou diretrizes de trilha (licença confirmada); voice-over gravado (se aplicável); logo animado e identidade visual do empreendimento; storyboard aprovado como referência de edição.

4.2 Ferramentas e Acessos

Adobe After Effects 2024+ (compositing e motion graphics); Adobe Premiere Pro (edição e montagem final); DaVinci Resolve (gradação de cor profissional); Adobe Audition (edição de áudio); ATEM Mini ou rodada de voice-over (gravação); biblioteca de trilhas licenciadas (Epidemic Sound, Artlist).



  5. Procedimento Passo a Passo

5.1. Importação e organização no After Effects

Ação: Importar sequences EXR de todos os passes no After Effects; criar composições por cena com duração correta; montar grupos de camadas por passe (Beauty, Diffuse, Reflection, AO, Depth); configurar project settings (FPS, espaço de cor ACES ou sRGB conforme workflow).

Responsável: Pós-produtor / Motion Designer

Output: Projeto AE organizado com todas as cenas importadas

Prazo referência: 2–4 h

5.2. Compositing de passes e enriquecimento de cenas

Ação: Combinar passes com blending modes corretos; inserir elementos 2D animados (céu em movimento, vegetação com wind effect, pessoas animadas); adicionar profundidade de campo em pós (Lens Blur via passe de depth); adicionar efeitos atmosféricos (névoa, partículas de poeira, flares de luz).

Responsável: Pós-produtor / Motion Designer

Output: Compositing completo de todas as cenas

Prazo referência: 1–2 dias úteis

5.3. Montagem e ritmo de edição

Ação: Montar sequência de cenas no Premiere Pro seguindo storyboard aprovado; ajustar duração de cada cena ao ritmo da trilha sonora; criar transições entre cenas (cross-fade, wipe, cut no beat da música); inserir marcadores de aprovação por segmento.

Responsável: Pós-produtor / Motion Designer

Output: Cut de edição montado com trilha em rough cut

Prazo referência: 4–8 h

[DECISÃO] Rough cut aprovado internamente pelo Dir. Criativo? Sim → gradação de cor. Não → ajustar timing/cortes.

5.4. Gradação de cor no DaVinci Resolve

Ação: Exportar sequência do Premiere como DPX ou XML para DaVinci Resolve; aplicar gradação de cor global para consistência entre cenas; ajustar cenas individualmente (balanço de cenas externas vs. internas); criar look final coerente com identidade do empreendimento.

Responsável: Pós-produtor / Motion Designer

Output: Versão com gradação de cor finalizada

Prazo referência: 4–8 h

5.5. Motion graphics, títulos e end card

Ação: Criar animação de logo do empreendimento (logo reveal); inserir títulos de ambientes no formato e tipografia aprovados; criar end card com CTA, contato da incorporadora e logomarca TBO; verificar sincronismo com áudio.

Responsável: Pós-produtor / Motion Designer

Output: Versão com motion graphics completos

Prazo referência: 4–8 h

5.6. Revisão final e exportação master

Ação: Enviar versão final para aprovação do Dir. Criativo e em seguida ao cliente via link Vimeo ou Frame.io (senha protegido); incorporar feedback final (máx. 2 rodadas inclusas); exportar master H.264 1080p/4K + versão para Instagram Reels (9:16) + versão para apresentação (4:3 se necessário).

Responsável: Pós-produtor / Motion Designer

Output: Arquivos master exportados e organizados; link de entrega enviado ao cliente

Prazo referência: 1 h exportação + ciclo revisão 3–5 dias úteis

[DECISÃO] Aprovado pelo cliente? Sim → exportação master e entrega. Não → ajustar (máx. 2 rodadas).

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todas as cenas compostas sem artefatos de borda ou transição. [ ] Gradação de cor consistente entre todas as cenas. [ ] Trilha sonora em volume adequado (pico máximo -3 dB; voz, se houver, inteligível). [ ] Motion graphics alinhados com identidade visual. [ ] End card com informações corretas. [ ] Versão 9:16 para redes sociais produzida (se no escopo). [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] Nomenclatura de arquivo conforme padrão TBO.

6.2 Erros Comuns a Evitar

Flicker entre cenas no compositing: verificar se todas as composições usam o mesmo espaço de cor. Áudio fora de sincronia: verificar se FPS do projeto AE/Premiere bate com FPS do audio (25 vs 30 fps). Logo pixelado no end card: usar arquivo SVG ou AI vetorial, nunca PNG de baixa resolução. Exportação com banding de cor: aumentar bit depth para 10-bit na exportação (ProRes 422 HQ ou H.265 Main10).

  7. Ferramentas e Templates

Adobe After Effects 2024+; Adobe Premiere Pro 2024+; DaVinci Resolve 18+ (Studio para noise reduction); Adobe Audition; Frame.io ou Vimeo Review (aprovação do cliente); Epidemic Sound / Artlist (trilhas licenciadas); HandBrake (compressão para entrega web).

  8. SLAs e Prazos

Rough cut (primeira montagem): 2–3 dias úteis após recebimento dos frames. Gradação de cor e MGs: +2 dias úteis. Ciclo de revisão com cliente: 3–5 dias úteis por rodada (máx. 2 inclusas). Exportação master após aprovação: mesmo dia. Duração total de pós-produção (animação 2–3 min): 7–12 dias úteis.

  9. Fluxograma

Início → Recebe frames EXR → Importação e organização no AE → Compositing de passes + enriquecimento → Montagem no Premiere (rough cut) → [Rough cut aprovado internamente?] → Não: Ajustar cortes → Sim: Gradação DaVinci → Motion graphics + títulos → Envio ao cliente para revisão → [Cliente aprova?] → Não: Ajustes (max 2x) → Sim: Exportação master → Entrega → Fim

  10. Glossário

Rough cut: primeira montagem da edição com todas as cenas na sequência, sem refinamentos finais. Gradação de cor: processo de ajuste artístico de cor para criar consistência visual e atmosfera. Motion graphics: animações gráficas (textos animados, logos, transições) sobrepostas ao vídeo. DPX: formato de arquivo de vídeo profissional sem perda de qualidade, usado em pipelines VFX. End card: tela final de um vídeo com chamada para ação, contato e identidade da marca. LUT: tabela de gradação de cor pré-definida (Look-Up Table).



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Animações 3D — Pós-produção</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-011</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Transformar as sequências de frames renderizados em um vídeo final polido — com compositing, gradação de cor, trilha sonora, motion graphics e entrega nos formatos contratados — pronto para apresentação e distribuição ao cliente.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Compositing de passes de render em After Effects; gradação de cor; inserção de elementos 2D animados (céu, vegetação, pessoas); trilha sonora e voice-over; criação de títulos e motion graphics; exportação em formatos de entrega (MP4, MOV, DPX).</p><p><strong>2.2 Exclusões</strong></p><p>Produção de frames 3D (coberta pelo SOP 10); criação de conteúdo de voice-over pelo time TBO; distribuição em plataformas digitais (responsabilidade do time de Marketing).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Pós-produtor / Motion Designer</p></td><td><p>Executar compositing, gradação de cor e edição final</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar cut de edição, paleta de cor e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Coordenar entrega de trilha sonora e aprovação com cliente</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprovar versão final antes da exportação master</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Pastas de frames EXR organizados por cena e passe (output SOP 10); trilha sonora ou diretrizes de trilha (licença confirmada); voice-over gravado (se aplicável); logo animado e identidade visual do empreendimento; storyboard aprovado como referência de edição.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe After Effects 2024+ (compositing e motion graphics); Adobe Premiere Pro (edição e montagem final); DaVinci Resolve (gradação de cor profissional); Adobe Audition (edição de áudio); ATEM Mini ou rodada de voice-over (gravação); biblioteca de trilhas licenciadas (Epidemic Sound, Artlist).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Importação e organização no After Effects</strong></p><p>Ação: Importar sequences EXR de todos os passes no After Effects; criar composições por cena com duração correta; montar grupos de camadas por passe (Beauty, Diffuse, Reflection, AO, Depth); configurar project settings (FPS, espaço de cor ACES ou sRGB conforme workflow).</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Projeto AE organizado com todas as cenas importadas</p><p>Prazo referência: 2–4 h</p><p><strong>5.2. Compositing de passes e enriquecimento de cenas</strong></p><p>Ação: Combinar passes com blending modes corretos; inserir elementos 2D animados (céu em movimento, vegetação com wind effect, pessoas animadas); adicionar profundidade de campo em pós (Lens Blur via passe de depth); adicionar efeitos atmosféricos (névoa, partículas de poeira, flares de luz).</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Compositing completo de todas as cenas</p><p>Prazo referência: 1–2 dias úteis</p><p><strong>5.3. Montagem e ritmo de edição</strong></p><p>Ação: Montar sequência de cenas no Premiere Pro seguindo storyboard aprovado; ajustar duração de cada cena ao ritmo da trilha sonora; criar transições entre cenas (cross-fade, wipe, cut no beat da música); inserir marcadores de aprovação por segmento.</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Cut de edição montado com trilha em rough cut</p><p>Prazo referência: 4–8 h</p><p><strong>[DECISÃO] Rough cut aprovado internamente pelo Dir. Criativo? Sim → gradação de cor. Não → ajustar timing/cortes.</strong></p><p><strong>5.4. Gradação de cor no DaVinci Resolve</strong></p><p>Ação: Exportar sequência do Premiere como DPX ou XML para DaVinci Resolve; aplicar gradação de cor global para consistência entre cenas; ajustar cenas individualmente (balanço de cenas externas vs. internas); criar look final coerente com identidade do empreendimento.</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Versão com gradação de cor finalizada</p><p>Prazo referência: 4–8 h</p><p><strong>5.5. Motion graphics, títulos e end card</strong></p><p>Ação: Criar animação de logo do empreendimento (logo reveal); inserir títulos de ambientes no formato e tipografia aprovados; criar end card com CTA, contato da incorporadora e logomarca TBO; verificar sincronismo com áudio.</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Versão com motion graphics completos</p><p>Prazo referência: 4–8 h</p><p><strong>5.6. Revisão final e exportação master</strong></p><p>Ação: Enviar versão final para aprovação do Dir. Criativo e em seguida ao cliente via link Vimeo ou Frame.io (senha protegido); incorporar feedback final (máx. 2 rodadas inclusas); exportar master H.264 1080p/4K + versão para Instagram Reels (9:16) + versão para apresentação (4:3 se necessário).</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Arquivos master exportados e organizados; link de entrega enviado ao cliente</p><p>Prazo referência: 1 h exportação + ciclo revisão 3–5 dias úteis</p><p><strong>[DECISÃO] Aprovado pelo cliente? Sim → exportação master e entrega. Não → ajustar (máx. 2 rodadas).</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todas as cenas compostas sem artefatos de borda ou transição. [ ] Gradação de cor consistente entre todas as cenas. [ ] Trilha sonora em volume adequado (pico máximo -3 dB; voz, se houver, inteligível). [ ] Motion graphics alinhados com identidade visual. [ ] End card com informações corretas. [ ] Versão 9:16 para redes sociais produzida (se no escopo). [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] Nomenclatura de arquivo conforme padrão TBO.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Flicker entre cenas no compositing: verificar se todas as composições usam o mesmo espaço de cor. Áudio fora de sincronia: verificar se FPS do projeto AE/Premiere bate com FPS do audio (25 vs 30 fps). Logo pixelado no end card: usar arquivo SVG ou AI vetorial, nunca PNG de baixa resolução. Exportação com banding de cor: aumentar bit depth para 10-bit na exportação (ProRes 422 HQ ou H.265 Main10).</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe After Effects 2024+; Adobe Premiere Pro 2024+; DaVinci Resolve 18+ (Studio para noise reduction); Adobe Audition; Frame.io ou Vimeo Review (aprovação do cliente); Epidemic Sound / Artlist (trilhas licenciadas); HandBrake (compressão para entrega web).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Rough cut (primeira montagem): 2–3 dias úteis após recebimento dos frames. Gradação de cor e MGs: +2 dias úteis. Ciclo de revisão com cliente: 3–5 dias úteis por rodada (máx. 2 inclusas). Exportação master após aprovação: mesmo dia. Duração total de pós-produção (animação 2–3 min): 7–12 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebe frames EXR → Importação e organização no AE → Compositing de passes + enriquecimento → Montagem no Premiere (rough cut) → [Rough cut aprovado internamente?] → Não: Ajustar cortes → Sim: Gradação DaVinci → Motion graphics + títulos → Envio ao cliente para revisão → [Cliente aprova?] → Não: Ajustes (max 2x) → Sim: Exportação master → Entrega → Fim</p><p><strong>  10. Glossário</strong></p><p>Rough cut: primeira montagem da edição com todas as cenas na sequência, sem refinamentos finais. Gradação de cor: processo de ajuste artístico de cor para criar consistência visual e atmosfera. Motion graphics: animações gráficas (textos animados, logos, transições) sobrepostas ao vídeo. DPX: formato de arquivo de vídeo profissional sem perda de qualidade, usado em pipelines VFX. End card: tela final de um vídeo com chamada para ação, contato e identidade da marca. LUT: tabela de gradação de cor pré-definida (Look-Up Table).</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    10,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-011
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Transformar as sequências de frames renderizados em um vídeo final polido — com compositing, gradação de cor, trilha sonora, motion graphics e entrega nos formatos contratados — pronto para apresentação e distribuição ao cliente.', '<p>Transformar as sequências de frames renderizados em um vídeo final polido — com compositing, gradação de cor, trilha sonora, motion graphics e entrega nos formatos contratados — pronto para apresentação e distribuição ao cliente.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Compositing de passes de render em After Effects; gradação de cor; inserção de elementos 2D animados (céu, vegetação, pessoas); trilha sonora e voice-over; criação de títulos e motion graphics; exportação em formatos de entrega (MP4, MOV, DPX).', '<p>Compositing de passes de render em After Effects; gradação de cor; inserção de elementos 2D animados (céu, vegetação, pessoas); trilha sonora e voice-over; criação de títulos e motion graphics; exportação em formatos de entrega (MP4, MOV, DPX).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de frames 3D (coberta pelo SOP 10); criação de conteúdo de voice-over pelo time TBO; distribuição em plataformas digitais (responsabilidade do time de Marketing).', '<p>Produção de frames 3D (coberta pelo SOP 10); criação de conteúdo de voice-over pelo time TBO; distribuição em plataformas digitais (responsabilidade do time de Marketing).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Pós-produtor / Motion Designer

Executar compositing, gradação de cor e edição final

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar cut de edição, paleta de cor e versão final

Aprovador

—

Gerente de Projetos

Coordenar entrega de trilha sonora e aprovação com cliente

Consultado

Informado

Cliente / Incorporadora

Aprovar versão final antes da exportação master

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Pós-produtor / Motion Designer</p></td><td><p>Executar compositing, gradação de cor e edição final</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar cut de edição, paleta de cor e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Coordenar entrega de trilha sonora e aprovação com cliente</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Aprovar versão final antes da exportação master</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Pastas de frames EXR organizados por cena e passe (output SOP 10); trilha sonora ou diretrizes de trilha (licença confirmada); voice-over gravado (se aplicável); logo animado e identidade visual do empreendimento; storyboard aprovado como referência de edição.', '<p>Pastas de frames EXR organizados por cena e passe (output SOP 10); trilha sonora ou diretrizes de trilha (licença confirmada); voice-over gravado (se aplicável); logo animado e identidade visual do empreendimento; storyboard aprovado como referência de edição.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe After Effects 2024+ (compositing e motion graphics); Adobe Premiere Pro (edição e montagem final); DaVinci Resolve (gradação de cor profissional); Adobe Audition (edição de áudio); ATEM Mini ou rodada de voice-over (gravação); biblioteca de trilhas licenciadas (Epidemic Sound, Artlist).', '<p>Adobe After Effects 2024+ (compositing e motion graphics); Adobe Premiere Pro (edição e montagem final); DaVinci Resolve (gradação de cor profissional); Adobe Audition (edição de áudio); ATEM Mini ou rodada de voice-over (gravação); biblioteca de trilhas licenciadas (Epidemic Sound, Artlist).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Importação e organização no After Effects', 'Ação: Importar sequences EXR de todos os passes no After Effects; criar composições por cena com duração correta; montar grupos de camadas por passe (Beauty, Diffuse, Reflection, AO, Depth); configurar project settings (FPS, espaço de cor ACES ou sRGB conforme workflow).

Responsável: Pós-produtor / Motion Designer

Output: Projeto AE organizado com todas as cenas importadas

Prazo referência: 2–4 h', '<p>Ação: Importar sequences EXR de todos os passes no After Effects; criar composições por cena com duração correta; montar grupos de camadas por passe (Beauty, Diffuse, Reflection, AO, Depth); configurar project settings (FPS, espaço de cor ACES ou sRGB conforme workflow).</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Projeto AE organizado com todas as cenas importadas</p><p>Prazo referência: 2–4 h</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Compositing de passes e enriquecimento de cenas', 'Ação: Combinar passes com blending modes corretos; inserir elementos 2D animados (céu em movimento, vegetação com wind effect, pessoas animadas); adicionar profundidade de campo em pós (Lens Blur via passe de depth); adicionar efeitos atmosféricos (névoa, partículas de poeira, flares de luz).

Responsável: Pós-produtor / Motion Designer

Output: Compositing completo de todas as cenas

Prazo referência: 1–2 dias úteis', '<p>Ação: Combinar passes com blending modes corretos; inserir elementos 2D animados (céu em movimento, vegetação com wind effect, pessoas animadas); adicionar profundidade de campo em pós (Lens Blur via passe de depth); adicionar efeitos atmosféricos (névoa, partículas de poeira, flares de luz).</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Compositing completo de todas as cenas</p><p>Prazo referência: 1–2 dias úteis</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Montagem e ritmo de edição', 'Ação: Montar sequência de cenas no Premiere Pro seguindo storyboard aprovado; ajustar duração de cada cena ao ritmo da trilha sonora; criar transições entre cenas (cross-fade, wipe, cut no beat da música); inserir marcadores de aprovação por segmento.

Responsável: Pós-produtor / Motion Designer

Output: Cut de edição montado com trilha em rough cut

Prazo referência: 4–8 h

[DECISÃO] Rough cut aprovado internamente pelo Dir. Criativo? Sim → gradação de cor. Não → ajustar timing/cortes.', '<p>Ação: Montar sequência de cenas no Premiere Pro seguindo storyboard aprovado; ajustar duração de cada cena ao ritmo da trilha sonora; criar transições entre cenas (cross-fade, wipe, cut no beat da música); inserir marcadores de aprovação por segmento.</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Cut de edição montado com trilha em rough cut</p><p>Prazo referência: 4–8 h</p><p><strong>[DECISÃO] Rough cut aprovado internamente pelo Dir. Criativo? Sim → gradação de cor. Não → ajustar timing/cortes.</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Gradação de cor no DaVinci Resolve', 'Ação: Exportar sequência do Premiere como DPX ou XML para DaVinci Resolve; aplicar gradação de cor global para consistência entre cenas; ajustar cenas individualmente (balanço de cenas externas vs. internas); criar look final coerente com identidade do empreendimento.

Responsável: Pós-produtor / Motion Designer

Output: Versão com gradação de cor finalizada

Prazo referência: 4–8 h', '<p>Ação: Exportar sequência do Premiere como DPX ou XML para DaVinci Resolve; aplicar gradação de cor global para consistência entre cenas; ajustar cenas individualmente (balanço de cenas externas vs. internas); criar look final coerente com identidade do empreendimento.</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Versão com gradação de cor finalizada</p><p>Prazo referência: 4–8 h</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Motion graphics, títulos e end card', 'Ação: Criar animação de logo do empreendimento (logo reveal); inserir títulos de ambientes no formato e tipografia aprovados; criar end card com CTA, contato da incorporadora e logomarca TBO; verificar sincronismo com áudio.

Responsável: Pós-produtor / Motion Designer

Output: Versão com motion graphics completos

Prazo referência: 4–8 h', '<p>Ação: Criar animação de logo do empreendimento (logo reveal); inserir títulos de ambientes no formato e tipografia aprovados; criar end card com CTA, contato da incorporadora e logomarca TBO; verificar sincronismo com áudio.</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Versão com motion graphics completos</p><p>Prazo referência: 4–8 h</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Revisão final e exportação master', 'Ação: Enviar versão final para aprovação do Dir. Criativo e em seguida ao cliente via link Vimeo ou Frame.io (senha protegido); incorporar feedback final (máx. 2 rodadas inclusas); exportar master H.264 1080p/4K + versão para Instagram Reels (9:16) + versão para apresentação (4:3 se necessário).

Responsável: Pós-produtor / Motion Designer

Output: Arquivos master exportados e organizados; link de entrega enviado ao cliente

Prazo referência: 1 h exportação + ciclo revisão 3–5 dias úteis

[DECISÃO] Aprovado pelo cliente? Sim → exportação master e entrega. Não → ajustar (máx. 2 rodadas).', '<p>Ação: Enviar versão final para aprovação do Dir. Criativo e em seguida ao cliente via link Vimeo ou Frame.io (senha protegido); incorporar feedback final (máx. 2 rodadas inclusas); exportar master H.264 1080p/4K + versão para Instagram Reels (9:16) + versão para apresentação (4:3 se necessário).</p><p>Responsável: Pós-produtor / Motion Designer</p><p>Output: Arquivos master exportados e organizados; link de entrega enviado ao cliente</p><p>Prazo referência: 1 h exportação + ciclo revisão 3–5 dias úteis</p><p><strong>[DECISÃO] Aprovado pelo cliente? Sim → exportação master e entrega. Não → ajustar (máx. 2 rodadas).</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as cenas compostas sem artefatos de borda ou transição. [ ] Gradação de cor consistente entre todas as cenas. [ ] Trilha sonora em volume adequado (pico máximo -3 dB; voz, se houver, inteligível). [ ] Motion graphics alinhados com identidade visual. [ ] End card com informações corretas. [ ] Versão 9:16 para redes sociais produzida (se no escopo). [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] Nomenclatura de arquivo conforme padrão TBO.', '<p>[ ] Todas as cenas compostas sem artefatos de borda ou transição. [ ] Gradação de cor consistente entre todas as cenas. [ ] Trilha sonora em volume adequado (pico máximo -3 dB; voz, se houver, inteligível). [ ] Motion graphics alinhados com identidade visual. [ ] End card com informações corretas. [ ] Versão 9:16 para redes sociais produzida (se no escopo). [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] Nomenclatura de arquivo conforme padrão TBO.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Flicker entre cenas no compositing: verificar se todas as composições usam o mesmo espaço de cor. Áudio fora de sincronia: verificar se FPS do projeto AE/Premiere bate com FPS do audio (25 vs 30 fps). Logo pixelado no end card: usar arquivo SVG ou AI vetorial, nunca PNG de baixa resolução. Exportação com banding de cor: aumentar bit depth para 10-bit na exportação (ProRes 422 HQ ou H.265 Main10).', '<p>Flicker entre cenas no compositing: verificar se todas as composições usam o mesmo espaço de cor. Áudio fora de sincronia: verificar se FPS do projeto AE/Premiere bate com FPS do audio (25 vs 30 fps). Logo pixelado no end card: usar arquivo SVG ou AI vetorial, nunca PNG de baixa resolução. Exportação com banding de cor: aumentar bit depth para 10-bit na exportação (ProRes 422 HQ ou H.265 Main10).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe After Effects 2024+; Adobe Premiere Pro 2024+; DaVinci Resolve 18+ (Studio para noise reduction); Adobe Audition; Frame.io ou Vimeo Review (aprovação do cliente); Epidemic Sound / Artlist (trilhas licenciadas); HandBrake (compressão para entrega web).', '<p>Adobe After Effects 2024+; Adobe Premiere Pro 2024+; DaVinci Resolve 18+ (Studio para noise reduction); Adobe Audition; Frame.io ou Vimeo Review (aprovação do cliente); Epidemic Sound / Artlist (trilhas licenciadas); HandBrake (compressão para entrega web).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Rough cut (primeira montagem): 2–3 dias úteis após recebimento dos frames. Gradação de cor e MGs: +2 dias úteis. Ciclo de revisão com cliente: 3–5 dias úteis por rodada (máx. 2 inclusas). Exportação master após aprovação: mesmo dia. Duração total de pós-produção (animação 2–3 min): 7–12 dias úteis.', '<p>Rough cut (primeira montagem): 2–3 dias úteis após recebimento dos frames. Gradação de cor e MGs: +2 dias úteis. Ciclo de revisão com cliente: 3–5 dias úteis por rodada (máx. 2 inclusas). Exportação master após aprovação: mesmo dia. Duração total de pós-produção (animação 2–3 min): 7–12 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe frames EXR → Importação e organização no AE → Compositing de passes + enriquecimento → Montagem no Premiere (rough cut) → [Rough cut aprovado internamente?] → Não: Ajustar cortes → Sim: Gradação DaVinci → Motion graphics + títulos → Envio ao cliente para revisão → [Cliente aprova?] → Não: Ajustes (max 2x) → Sim: Exportação master → Entrega → Fim', '<p>Início → Recebe frames EXR → Importação e organização no AE → Compositing de passes + enriquecimento → Montagem no Premiere (rough cut) → [Rough cut aprovado internamente?] → Não: Ajustar cortes → Sim: Gradação DaVinci → Motion graphics + títulos → Envio ao cliente para revisão → [Cliente aprova?] → Não: Ajustes (max 2x) → Sim: Exportação master → Entrega → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Rough cut: primeira montagem da edição com todas as cenas na sequência, sem refinamentos finais. Gradação de cor: processo de ajuste artístico de cor para criar consistência visual e atmosfera. Motion graphics: animações gráficas (textos animados, logos, transições) sobrepostas ao vídeo. DPX: formato de arquivo de vídeo profissional sem perda de qualidade, usado em pipelines VFX. End card: tela final de um vídeo com chamada para ação, contato e identidade da marca. LUT: tabela de gradação de cor pré-definida (Look-Up Table).', '<p>Rough cut: primeira montagem da edição com todas as cenas na sequência, sem refinamentos finais. Gradação de cor: processo de ajuste artístico de cor para criar consistência visual e atmosfera. Motion graphics: animações gráficas (textos animados, logos, transições) sobrepostas ao vídeo. DPX: formato de arquivo de vídeo profissional sem perda de qualidade, usado em pipelines VFX. End card: tela final de um vídeo com chamada para ação, contato e identidade da marca. LUT: tabela de gradação de cor pré-definida (Look-Up Table).</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-3D-012: Controle de Qualidade 3D ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Controle de Qualidade 3D',
    'tbo-3d-012-controle-de-qualidade-3d',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Controle de Qualidade 3D

Código

TBO-3D-012

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

Garantir que todos os entregáveis do time Digital 3D — imagens estáticas, plantas, tours e animações — atendam aos padrões técnicos e criativos da TBO antes de qualquer envio ao cliente, eliminando retrabalho pós-entrega.

  2. Escopo

2.1 O que está coberto

Checklist de QA técnico e criativo por tipo de entregável; processo de revisão por pares; aprovação final do Diretor Criativo; registro de não-conformidades e retrabalho; métricas de qualidade do time.

2.2 Exclusões

Aprovação final pelo cliente (responsabilidade do Gerente de Projetos); QA de materiais gráficos de design (responsabilidade do time de Design); testes de plataformas digitais (responsabilidade do time de Tecnologia).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Aprovação final de todos os entregáveis 3D antes da entrega ao cliente

Aprovador

—

Visualizador 3D Sênior

Executar QA técnico dos entregáveis e revisão por pares

Responsável

—

Visualizador 3D Júnior

Auto-revisão antes de submeter para QA sênior

Responsável

—

Gerente de Projetos

Confirmar que QA foi concluído antes de enviar ao cliente

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Entregável finalizado pelo Visualizador 3D; briefing original e referências aprovadas pelo cliente; checklists de QA por tipo de entregável (imagem estática, planta, tour, animação).

4.2 Ferramentas e Acessos

Monitor calibrado (perfil sRGB); ferramenta de comparação de imagens (Lightroom Compare View ou FastStone Image Viewer); checklist TBO de QA em formato digital (TBO OS ou Google Sheets); histograma de cor (Photoshop).



  5. Procedimento Passo a Passo

5.1. Auto-revisão pelo produtor (nível 1)

Ação: Antes de submeter qualquer entregável para revisão, o produtor realiza auto-revisão com checklist específico do tipo de entregável; verifica: resolução, formato, nomenclatura, ausência de artefatos visíveis, aderência ao briefing; documenta no TBO OS.

Responsável: Visualizador 3D (quem produziu)

Output: Checklist de auto-revisão preenchido e arquivado

Prazo referência: 30–60 min por entregável

5.2. Revisão técnica por par sênior (nível 2)

Ação: Visualizador Sênior diferente do produtor revisa o entregável usando histograma de cor, zoom em áreas críticas (reflexos, sombras, bordas de recorte), verificação de escala e consistência com briefing; registra não-conformidades com screenshots.

Responsável: Visualizador 3D Sênior

Output: Relatório de não-conformidades (ou aprovação) documentado

Prazo referência: 30–60 min por entregável

[DECISÃO] Entregável aprovado na revisão técnica? Sim → submeter para Dir. Criativo. Não → devolver para correção com lista de ajustes.

5.3. Correções e re-submissão (quando necessário)

Ação: Produtor recebe lista de não-conformidades; executa correções; re-submete para revisão técnica; máximo de 1 ciclo de correção antes de escalar para discussão com Dir. Criativo se o problema for de interpretação de briefing.

Responsável: Visualizador 3D (quem produziu)

Output: Entregável corrigido re-submetido para revisão

Prazo referência: 1–4 h por rodada de correção

5.4. Aprovação do Diretor Criativo (nível 3)

Ação: Dir. Criativo revisa entregável aprovado tecnicamente; avalia: impacto visual, coerência criativa com posicionamento do empreendimento, apelo comercial; fornece feedback via TBO OS com comentários precisos; aprova ou solicita ajustes criativos.

Responsável: Diretor Criativo

Output: Aprovação ou lista de ajustes criativos documentada no TBO OS

Prazo referência: 24 h

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → entregável liberado para cliente. Não → ajustes criativos e novo ciclo.

5.5. Registro de métricas e lições aprendidas

Ação: Após conclusão do QA, registrar no TBO OS: número de não-conformidades por tipo, tempo de retrabalho, tipo de erro (técnico/criativo/briefing); revisar mensalmente para identificar padrões e melhorar treinamento do time.

Responsável: Visualizador 3D Sênior

Output: Registro de métricas de QA atualizado

Prazo referência: 15 min por entregável

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Auto-revisão nível 1 realizada e documentada. [ ] Revisão técnica nível 2 por par sênior realizada. [ ] Não-conformidades corrigidas e verificadas. [ ] Aprovação do Dir. Criativo registrada no TBO OS. [ ] Arquivos nomeados conforme padrão TBO. [ ] Backup do arquivo final em servidor. [ ] Métricas de QA registradas.

6.2 Erros Comuns a Evitar

Entregável enviado ao cliente sem aprovação do Dir. Criativo: BLOQUEANTE — nunca enviar sem aprovação formal. Checklist não preenchido: não aceitar submissão para revisão sem checklist preenchido. Ciclo de correção longo (mais de 2 rodadas): escalar para reunião com Dir. Criativo para realinhamento de briefing.

  7. Ferramentas e Templates

TBO OS (registro de aprovações e não-conformidades); Adobe Photoshop (histograma, zoom de inspeção); FastStone Image Viewer (comparação de versões); Google Sheets (dashboard de métricas de qualidade mensal).

  8. SLAs e Prazos

Auto-revisão nível 1: concluída antes de submeter (não bloqueia cronograma externo). Revisão técnica nível 2: até 24 h após submissão. Aprovação do Dir. Criativo: até 24 h após submissão (entregável padrão); até 48 h (animação). Meta de qualidade: máx. 1 rodada de retrabalho por entregável enviado ao cliente.

  9. Fluxograma

Início → Entregável finalizado → [NÍVEL 1] Auto-revisão produtor → [NÍVEL 2] Revisão técnica sênior → [Aprovado tecnicamente?] → Não: Correções → Re-submissão → Sim: [NÍVEL 3] Aprovação Dir. Criativo → [Aprovado criativamente?] → Não: Ajustes criativos → Re-submissão → Sim: Entregável liberado para cliente → Registro de métricas → Fim

  10. Glossário

Não-conformidade: desvio detectado em relação ao padrão de qualidade ou briefing aprovado. Revisão por pares: processo de revisão feito por colega diferente do produtor, eliminando viés de auto-análise. Histograma de cor: representação gráfica da distribuição de tons em uma imagem (detecta overexposure e clipping). Auto-revisão: primeira camada de controle de qualidade feita pelo próprio produtor antes de submeter o trabalho.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Controle de Qualidade 3D</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-012</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Garantir que todos os entregáveis do time Digital 3D — imagens estáticas, plantas, tours e animações — atendam aos padrões técnicos e criativos da TBO antes de qualquer envio ao cliente, eliminando retrabalho pós-entrega.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Checklist de QA técnico e criativo por tipo de entregável; processo de revisão por pares; aprovação final do Diretor Criativo; registro de não-conformidades e retrabalho; métricas de qualidade do time.</p><p><strong>2.2 Exclusões</strong></p><p>Aprovação final pelo cliente (responsabilidade do Gerente de Projetos); QA de materiais gráficos de design (responsabilidade do time de Design); testes de plataformas digitais (responsabilidade do time de Tecnologia).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovação final de todos os entregáveis 3D antes da entrega ao cliente</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Executar QA técnico dos entregáveis e revisão por pares</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Auto-revisão antes de submeter para QA sênior</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Confirmar que QA foi concluído antes de enviar ao cliente</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Entregável finalizado pelo Visualizador 3D; briefing original e referências aprovadas pelo cliente; checklists de QA por tipo de entregável (imagem estática, planta, tour, animação).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Monitor calibrado (perfil sRGB); ferramenta de comparação de imagens (Lightroom Compare View ou FastStone Image Viewer); checklist TBO de QA em formato digital (TBO OS ou Google Sheets); histograma de cor (Photoshop).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Auto-revisão pelo produtor (nível 1)</strong></p><p>Ação: Antes de submeter qualquer entregável para revisão, o produtor realiza auto-revisão com checklist específico do tipo de entregável; verifica: resolução, formato, nomenclatura, ausência de artefatos visíveis, aderência ao briefing; documenta no TBO OS.</p><p>Responsável: Visualizador 3D (quem produziu)</p><p>Output: Checklist de auto-revisão preenchido e arquivado</p><p>Prazo referência: 30–60 min por entregável</p><p><strong>5.2. Revisão técnica por par sênior (nível 2)</strong></p><p>Ação: Visualizador Sênior diferente do produtor revisa o entregável usando histograma de cor, zoom em áreas críticas (reflexos, sombras, bordas de recorte), verificação de escala e consistência com briefing; registra não-conformidades com screenshots.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Relatório de não-conformidades (ou aprovação) documentado</p><p>Prazo referência: 30–60 min por entregável</p><p><strong>[DECISÃO] Entregável aprovado na revisão técnica? Sim → submeter para Dir. Criativo. Não → devolver para correção com lista de ajustes.</strong></p><p><strong>5.3. Correções e re-submissão (quando necessário)</strong></p><p>Ação: Produtor recebe lista de não-conformidades; executa correções; re-submete para revisão técnica; máximo de 1 ciclo de correção antes de escalar para discussão com Dir. Criativo se o problema for de interpretação de briefing.</p><p>Responsável: Visualizador 3D (quem produziu)</p><p>Output: Entregável corrigido re-submetido para revisão</p><p>Prazo referência: 1–4 h por rodada de correção</p><p><strong>5.4. Aprovação do Diretor Criativo (nível 3)</strong></p><p>Ação: Dir. Criativo revisa entregável aprovado tecnicamente; avalia: impacto visual, coerência criativa com posicionamento do empreendimento, apelo comercial; fornece feedback via TBO OS com comentários precisos; aprova ou solicita ajustes criativos.</p><p>Responsável: Diretor Criativo</p><p>Output: Aprovação ou lista de ajustes criativos documentada no TBO OS</p><p>Prazo referência: 24 h</p><p><strong>[DECISÃO] Aprovado pelo Dir. Criativo? Sim → entregável liberado para cliente. Não → ajustes criativos e novo ciclo.</strong></p><p><strong>5.5. Registro de métricas e lições aprendidas</strong></p><p>Ação: Após conclusão do QA, registrar no TBO OS: número de não-conformidades por tipo, tempo de retrabalho, tipo de erro (técnico/criativo/briefing); revisar mensalmente para identificar padrões e melhorar treinamento do time.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Registro de métricas de QA atualizado</p><p>Prazo referência: 15 min por entregável</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Auto-revisão nível 1 realizada e documentada. [ ] Revisão técnica nível 2 por par sênior realizada. [ ] Não-conformidades corrigidas e verificadas. [ ] Aprovação do Dir. Criativo registrada no TBO OS. [ ] Arquivos nomeados conforme padrão TBO. [ ] Backup do arquivo final em servidor. [ ] Métricas de QA registradas.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Entregável enviado ao cliente sem aprovação do Dir. Criativo: BLOQUEANTE — nunca enviar sem aprovação formal. Checklist não preenchido: não aceitar submissão para revisão sem checklist preenchido. Ciclo de correção longo (mais de 2 rodadas): escalar para reunião com Dir. Criativo para realinhamento de briefing.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>TBO OS (registro de aprovações e não-conformidades); Adobe Photoshop (histograma, zoom de inspeção); FastStone Image Viewer (comparação de versões); Google Sheets (dashboard de métricas de qualidade mensal).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Auto-revisão nível 1: concluída antes de submeter (não bloqueia cronograma externo). Revisão técnica nível 2: até 24 h após submissão. Aprovação do Dir. Criativo: até 24 h após submissão (entregável padrão); até 48 h (animação). Meta de qualidade: máx. 1 rodada de retrabalho por entregável enviado ao cliente.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Entregável finalizado → [NÍVEL 1] Auto-revisão produtor → [NÍVEL 2] Revisão técnica sênior → [Aprovado tecnicamente?] → Não: Correções → Re-submissão → Sim: [NÍVEL 3] Aprovação Dir. Criativo → [Aprovado criativamente?] → Não: Ajustes criativos → Re-submissão → Sim: Entregável liberado para cliente → Registro de métricas → Fim</p><p><strong>  10. Glossário</strong></p><p>Não-conformidade: desvio detectado em relação ao padrão de qualidade ou briefing aprovado. Revisão por pares: processo de revisão feito por colega diferente do produtor, eliminando viés de auto-análise. Histograma de cor: representação gráfica da distribuição de tons em uma imagem (detecta overexposure e clipping). Auto-revisão: primeira camada de controle de qualidade feita pelo próprio produtor antes de submeter o trabalho.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'critical',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    11,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-012
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os entregáveis do time Digital 3D — imagens estáticas, plantas, tours e animações — atendam aos padrões técnicos e criativos da TBO antes de qualquer envio ao cliente, eliminando retrabalho pós-entrega.', '<p>Garantir que todos os entregáveis do time Digital 3D — imagens estáticas, plantas, tours e animações — atendam aos padrões técnicos e criativos da TBO antes de qualquer envio ao cliente, eliminando retrabalho pós-entrega.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Checklist de QA técnico e criativo por tipo de entregável; processo de revisão por pares; aprovação final do Diretor Criativo; registro de não-conformidades e retrabalho; métricas de qualidade do time.', '<p>Checklist de QA técnico e criativo por tipo de entregável; processo de revisão por pares; aprovação final do Diretor Criativo; registro de não-conformidades e retrabalho; métricas de qualidade do time.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Aprovação final pelo cliente (responsabilidade do Gerente de Projetos); QA de materiais gráficos de design (responsabilidade do time de Design); testes de plataformas digitais (responsabilidade do time de Tecnologia).', '<p>Aprovação final pelo cliente (responsabilidade do Gerente de Projetos); QA de materiais gráficos de design (responsabilidade do time de Design); testes de plataformas digitais (responsabilidade do time de Tecnologia).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Aprovação final de todos os entregáveis 3D antes da entrega ao cliente

Aprovador

—

Visualizador 3D Sênior

Executar QA técnico dos entregáveis e revisão por pares

Responsável

—

Visualizador 3D Júnior

Auto-revisão antes de submeter para QA sênior

Responsável

—

Gerente de Projetos

Confirmar que QA foi concluído antes de enviar ao cliente

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovação final de todos os entregáveis 3D antes da entrega ao cliente</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Executar QA técnico dos entregáveis e revisão por pares</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Auto-revisão antes de submeter para QA sênior</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Confirmar que QA foi concluído antes de enviar ao cliente</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entregável finalizado pelo Visualizador 3D; briefing original e referências aprovadas pelo cliente; checklists de QA por tipo de entregável (imagem estática, planta, tour, animação).', '<p>Entregável finalizado pelo Visualizador 3D; briefing original e referências aprovadas pelo cliente; checklists de QA por tipo de entregável (imagem estática, planta, tour, animação).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Monitor calibrado (perfil sRGB); ferramenta de comparação de imagens (Lightroom Compare View ou FastStone Image Viewer); checklist TBO de QA em formato digital (TBO OS ou Google Sheets); histograma de cor (Photoshop).', '<p>Monitor calibrado (perfil sRGB); ferramenta de comparação de imagens (Lightroom Compare View ou FastStone Image Viewer); checklist TBO de QA em formato digital (TBO OS ou Google Sheets); histograma de cor (Photoshop).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Auto-revisão pelo produtor (nível 1)', 'Ação: Antes de submeter qualquer entregável para revisão, o produtor realiza auto-revisão com checklist específico do tipo de entregável; verifica: resolução, formato, nomenclatura, ausência de artefatos visíveis, aderência ao briefing; documenta no TBO OS.

Responsável: Visualizador 3D (quem produziu)

Output: Checklist de auto-revisão preenchido e arquivado

Prazo referência: 30–60 min por entregável', '<p>Ação: Antes de submeter qualquer entregável para revisão, o produtor realiza auto-revisão com checklist específico do tipo de entregável; verifica: resolução, formato, nomenclatura, ausência de artefatos visíveis, aderência ao briefing; documenta no TBO OS.</p><p>Responsável: Visualizador 3D (quem produziu)</p><p>Output: Checklist de auto-revisão preenchido e arquivado</p><p>Prazo referência: 30–60 min por entregável</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Revisão técnica por par sênior (nível 2)', 'Ação: Visualizador Sênior diferente do produtor revisa o entregável usando histograma de cor, zoom em áreas críticas (reflexos, sombras, bordas de recorte), verificação de escala e consistência com briefing; registra não-conformidades com screenshots.

Responsável: Visualizador 3D Sênior

Output: Relatório de não-conformidades (ou aprovação) documentado

Prazo referência: 30–60 min por entregável

[DECISÃO] Entregável aprovado na revisão técnica? Sim → submeter para Dir. Criativo. Não → devolver para correção com lista de ajustes.', '<p>Ação: Visualizador Sênior diferente do produtor revisa o entregável usando histograma de cor, zoom em áreas críticas (reflexos, sombras, bordas de recorte), verificação de escala e consistência com briefing; registra não-conformidades com screenshots.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Relatório de não-conformidades (ou aprovação) documentado</p><p>Prazo referência: 30–60 min por entregável</p><p><strong>[DECISÃO] Entregável aprovado na revisão técnica? Sim → submeter para Dir. Criativo. Não → devolver para correção com lista de ajustes.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Correções e re-submissão (quando necessário)', 'Ação: Produtor recebe lista de não-conformidades; executa correções; re-submete para revisão técnica; máximo de 1 ciclo de correção antes de escalar para discussão com Dir. Criativo se o problema for de interpretação de briefing.

Responsável: Visualizador 3D (quem produziu)

Output: Entregável corrigido re-submetido para revisão

Prazo referência: 1–4 h por rodada de correção', '<p>Ação: Produtor recebe lista de não-conformidades; executa correções; re-submete para revisão técnica; máximo de 1 ciclo de correção antes de escalar para discussão com Dir. Criativo se o problema for de interpretação de briefing.</p><p>Responsável: Visualizador 3D (quem produziu)</p><p>Output: Entregável corrigido re-submetido para revisão</p><p>Prazo referência: 1–4 h por rodada de correção</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aprovação do Diretor Criativo (nível 3)', 'Ação: Dir. Criativo revisa entregável aprovado tecnicamente; avalia: impacto visual, coerência criativa com posicionamento do empreendimento, apelo comercial; fornece feedback via TBO OS com comentários precisos; aprova ou solicita ajustes criativos.

Responsável: Diretor Criativo

Output: Aprovação ou lista de ajustes criativos documentada no TBO OS

Prazo referência: 24 h

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → entregável liberado para cliente. Não → ajustes criativos e novo ciclo.', '<p>Ação: Dir. Criativo revisa entregável aprovado tecnicamente; avalia: impacto visual, coerência criativa com posicionamento do empreendimento, apelo comercial; fornece feedback via TBO OS com comentários precisos; aprova ou solicita ajustes criativos.</p><p>Responsável: Diretor Criativo</p><p>Output: Aprovação ou lista de ajustes criativos documentada no TBO OS</p><p>Prazo referência: 24 h</p><p><strong>[DECISÃO] Aprovado pelo Dir. Criativo? Sim → entregável liberado para cliente. Não → ajustes criativos e novo ciclo.</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Registro de métricas e lições aprendidas', 'Ação: Após conclusão do QA, registrar no TBO OS: número de não-conformidades por tipo, tempo de retrabalho, tipo de erro (técnico/criativo/briefing); revisar mensalmente para identificar padrões e melhorar treinamento do time.

Responsável: Visualizador 3D Sênior

Output: Registro de métricas de QA atualizado

Prazo referência: 15 min por entregável', '<p>Ação: Após conclusão do QA, registrar no TBO OS: número de não-conformidades por tipo, tempo de retrabalho, tipo de erro (técnico/criativo/briefing); revisar mensalmente para identificar padrões e melhorar treinamento do time.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Registro de métricas de QA atualizado</p><p>Prazo referência: 15 min por entregável</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Auto-revisão nível 1 realizada e documentada. [ ] Revisão técnica nível 2 por par sênior realizada. [ ] Não-conformidades corrigidas e verificadas. [ ] Aprovação do Dir. Criativo registrada no TBO OS. [ ] Arquivos nomeados conforme padrão TBO. [ ] Backup do arquivo final em servidor. [ ] Métricas de QA registradas.', '<p>[ ] Auto-revisão nível 1 realizada e documentada. [ ] Revisão técnica nível 2 por par sênior realizada. [ ] Não-conformidades corrigidas e verificadas. [ ] Aprovação do Dir. Criativo registrada no TBO OS. [ ] Arquivos nomeados conforme padrão TBO. [ ] Backup do arquivo final em servidor. [ ] Métricas de QA registradas.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Entregável enviado ao cliente sem aprovação do Dir. Criativo: BLOQUEANTE — nunca enviar sem aprovação formal. Checklist não preenchido: não aceitar submissão para revisão sem checklist preenchido. Ciclo de correção longo (mais de 2 rodadas): escalar para reunião com Dir. Criativo para realinhamento de briefing.', '<p>Entregável enviado ao cliente sem aprovação do Dir. Criativo: BLOQUEANTE — nunca enviar sem aprovação formal. Checklist não preenchido: não aceitar submissão para revisão sem checklist preenchido. Ciclo de correção longo (mais de 2 rodadas): escalar para reunião com Dir. Criativo para realinhamento de briefing.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (registro de aprovações e não-conformidades); Adobe Photoshop (histograma, zoom de inspeção); FastStone Image Viewer (comparação de versões); Google Sheets (dashboard de métricas de qualidade mensal).', '<p>TBO OS (registro de aprovações e não-conformidades); Adobe Photoshop (histograma, zoom de inspeção); FastStone Image Viewer (comparação de versões); Google Sheets (dashboard de métricas de qualidade mensal).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Auto-revisão nível 1: concluída antes de submeter (não bloqueia cronograma externo). Revisão técnica nível 2: até 24 h após submissão. Aprovação do Dir. Criativo: até 24 h após submissão (entregável padrão); até 48 h (animação). Meta de qualidade: máx. 1 rodada de retrabalho por entregável enviado ao cliente.', '<p>Auto-revisão nível 1: concluída antes de submeter (não bloqueia cronograma externo). Revisão técnica nível 2: até 24 h após submissão. Aprovação do Dir. Criativo: até 24 h após submissão (entregável padrão); até 48 h (animação). Meta de qualidade: máx. 1 rodada de retrabalho por entregável enviado ao cliente.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Entregável finalizado → [NÍVEL 1] Auto-revisão produtor → [NÍVEL 2] Revisão técnica sênior → [Aprovado tecnicamente?] → Não: Correções → Re-submissão → Sim: [NÍVEL 3] Aprovação Dir. Criativo → [Aprovado criativamente?] → Não: Ajustes criativos → Re-submissão → Sim: Entregável liberado para cliente → Registro de métricas → Fim', '<p>Início → Entregável finalizado → [NÍVEL 1] Auto-revisão produtor → [NÍVEL 2] Revisão técnica sênior → [Aprovado tecnicamente?] → Não: Correções → Re-submissão → Sim: [NÍVEL 3] Aprovação Dir. Criativo → [Aprovado criativamente?] → Não: Ajustes criativos → Re-submissão → Sim: Entregável liberado para cliente → Registro de métricas → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Não-conformidade: desvio detectado em relação ao padrão de qualidade ou briefing aprovado. Revisão por pares: processo de revisão feito por colega diferente do produtor, eliminando viés de auto-análise. Histograma de cor: representação gráfica da distribuição de tons em uma imagem (detecta overexposure e clipping). Auto-revisão: primeira camada de controle de qualidade feita pelo próprio produtor antes de submeter o trabalho.', '<p>Não-conformidade: desvio detectado em relação ao padrão de qualidade ou briefing aprovado. Revisão por pares: processo de revisão feito por colega diferente do produtor, eliminando viés de auto-análise. Histograma de cor: representação gráfica da distribuição de tons em uma imagem (detecta overexposure e clipping). Auto-revisão: primeira camada de controle de qualidade feita pelo próprio produtor antes de submeter o trabalho.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-013: Entrega e Handoff ao Cliente ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Entrega e Handoff ao Cliente',
    'tbo-3d-013-entrega-e-handoff-ao-cliente',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Entrega e Handoff ao Cliente

Código

TBO-3D-013

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

Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.

  2. Escopo

2.1 O que está coberto

Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.

2.2 Exclusões

Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Gerente de Projetos

Organizar entrega, comunicar cliente e coletar aceite formal

Responsável

—

Visualizador 3D Sênior

Organizar e nomear arquivos conforme padrão TBO

Responsável

—

Diretor Criativo (Marco Andolfato)

Confirmar que todos os itens do escopo foram entregues

Aprovador

—

Cliente / Incorporadora

Confirmar recebimento, revisar e emitir aceite formal

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).

4.2 Ferramentas e Acessos

Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.



  5. Procedimento Passo a Passo

5.1. Conferência final do escopo entregue

Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.

Responsável: Gerente de Projetos

Output: Checklist de escopo 100% concluído documentado

Prazo referência: 30 min

[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.

5.2. Organização e nomenclatura dos arquivos

Ação: Criar estrutura de pastas padrão: [PROJETO] > [DATA_ENTREGA] > [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.

Responsável: Visualizador 3D Sênior

Output: Pasta de entrega organizada e nomeada conforme padrão TBO

Prazo referência: 30–60 min

5.3. Upload e geração de link de entrega

Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.

Responsável: Gerente de Projetos

Output: Link de entrega funcional e verificado

Prazo referência: 30–60 min

5.4. Comunicação formal de entrega ao cliente

Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.

Responsável: Gerente de Projetos

Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS

Prazo referência: 1 h

5.5. Coleta de aceite e encerramento do projeto

Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.

Responsável: Gerente de Projetos

Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO

Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite

[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.

6.2 Erros Comuns a Evitar

Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.

  7. Ferramentas e Templates

Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.

  8. SLAs e Prazos

Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.

  9. Fluxograma

Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim

  10. Glossário

Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Entrega e Handoff ao Cliente</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-013</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.</p><p><strong>2.2 Exclusões</strong></p><p>Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Organizar entrega, comunicar cliente e coletar aceite formal</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Organizar e nomear arquivos conforme padrão TBO</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Confirmar que todos os itens do escopo foram entregues</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Confirmar recebimento, revisar e emitir aceite formal</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Conferência final do escopo entregue</strong></p><p>Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.</p><p>Responsável: Gerente de Projetos</p><p>Output: Checklist de escopo 100% concluído documentado</p><p>Prazo referência: 30 min</p><p><strong>[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.</strong></p><p><strong>5.2. Organização e nomenclatura dos arquivos</strong></p><p>Ação: Criar estrutura de pastas padrão: [PROJETO] &gt; [DATA_ENTREGA] &gt; [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de entrega organizada e nomeada conforme padrão TBO</p><p>Prazo referência: 30–60 min</p><p><strong>5.3. Upload e geração de link de entrega</strong></p><p>Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.</p><p>Responsável: Gerente de Projetos</p><p>Output: Link de entrega funcional e verificado</p><p>Prazo referência: 30–60 min</p><p><strong>5.4. Comunicação formal de entrega ao cliente</strong></p><p>Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS</p><p>Prazo referência: 1 h</p><p><strong>5.5. Coleta de aceite e encerramento do projeto</strong></p><p>Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO</p><p>Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite</p><p><strong>[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim</p><p><strong>  10. Glossário</strong></p><p>Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'high',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
    12,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-013
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.', '<p>Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.', '<p>Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).', '<p>Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Gerente de Projetos

Organizar entrega, comunicar cliente e coletar aceite formal

Responsável

—

Visualizador 3D Sênior

Organizar e nomear arquivos conforme padrão TBO

Responsável

—

Diretor Criativo (Marco Andolfato)

Confirmar que todos os itens do escopo foram entregues

Aprovador

—

Cliente / Incorporadora

Confirmar recebimento, revisar e emitir aceite formal

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Organizar entrega, comunicar cliente e coletar aceite formal</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Organizar e nomear arquivos conforme padrão TBO</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Confirmar que todos os itens do escopo foram entregues</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Confirmar recebimento, revisar e emitir aceite formal</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).', '<p>Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.', '<p>Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Conferência final do escopo entregue', 'Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.

Responsável: Gerente de Projetos

Output: Checklist de escopo 100% concluído documentado

Prazo referência: 30 min

[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.', '<p>Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.</p><p>Responsável: Gerente de Projetos</p><p>Output: Checklist de escopo 100% concluído documentado</p><p>Prazo referência: 30 min</p><p><strong>[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.</strong></p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Organização e nomenclatura dos arquivos', 'Ação: Criar estrutura de pastas padrão: [PROJETO] > [DATA_ENTREGA] > [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.

Responsável: Visualizador 3D Sênior

Output: Pasta de entrega organizada e nomeada conforme padrão TBO

Prazo referência: 30–60 min', '<p>Ação: Criar estrutura de pastas padrão: [PROJETO] &gt; [DATA_ENTREGA] &gt; [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de entrega organizada e nomeada conforme padrão TBO</p><p>Prazo referência: 30–60 min</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Upload e geração de link de entrega', 'Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.

Responsável: Gerente de Projetos

Output: Link de entrega funcional e verificado

Prazo referência: 30–60 min', '<p>Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.</p><p>Responsável: Gerente de Projetos</p><p>Output: Link de entrega funcional e verificado</p><p>Prazo referência: 30–60 min</p>', 8, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Comunicação formal de entrega ao cliente', 'Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.

Responsável: Gerente de Projetos

Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS

Prazo referência: 1 h', '<p>Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS</p><p>Prazo referência: 1 h</p>', 9, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Coleta de aceite e encerramento do projeto', 'Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.

Responsável: Gerente de Projetos

Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO

Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite

[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.', '<p>Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.</p><p>Responsável: Gerente de Projetos</p><p>Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO</p><p>Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite</p><p><strong>[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.', '<p>[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.', '<p>Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.', '<p>Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.', '<p>Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim', '<p>Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.', '<p>Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-014: Gestão de Assets e Biblioteca 3D ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Gestão de Assets e Biblioteca 3D',
    'tbo-3d-014-gestao-de-assets-e-biblioteca-3d',
    'digital-3d',
    'checklist',
    'Gestão de Assets e Biblioteca 3D',
    'Standard Operating Procedure

Gestão de Assets e Biblioteca 3D

Código

TBO-3D-014

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

Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.

  2. Escopo

2.1 O que está coberto

Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.

2.2 Exclusões

Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Curar, organizar e manter a biblioteca 3D; aprovar novos assets

Responsável

—

Diretor Criativo (Marco Andolfato)

Definir padrões de qualidade e estilo dos assets da biblioteca

Aprovador

—

Visualizador 3D Júnior

Contribuir com novos assets e seguir processos de admissão

Consultado

—

Gerente de Projetos

Garantir orçamento para aquisição de assets e licenças

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.

4.2 Ferramentas e Acessos

Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).



  5. Procedimento Passo a Passo

5.1. Estrutura e organização da biblioteca

Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.

Responsável: Visualizador 3D Sênior

Output: Estrutura de biblioteca documentada e mantida

Prazo referência: Manutenção contínua; revisão trimestral completa

5.2. Processo de admissão de novos assets

Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.

Responsável: Visualizador 3D Sênior

Output: Asset admitido, testado, nomeado e registrado no inventário

Prazo referência: 30–60 min por asset

[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.

5.3. Nomenclatura e tagging de assets

Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.

Responsável: Visualizador 3D Sênior

Output: Assets nomeados e com tags atualizadas

Prazo referência: 15 min por asset

5.4. Controle de licenças e conformidade

Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.

Responsável: Visualizador 3D Sênior

Output: Planilha de inventário de licenças atualizada

Prazo referência: Atualização contínua; revisão semestral em 1 dia útil

5.5. Manutenção, limpeza e expansão periódica

Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.

Responsável: Visualizador 3D Sênior

Output: Biblioteca limpa, atualizada e com plano de expansão

Prazo referência: 1 dia útil por ciclo trimestral

5.6. Onboarding e acesso do time

Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.

Responsável: Visualizador 3D Sênior

Output: Novo membro onboarded na biblioteca; acesso configurado

Prazo referência: 2 h por novo membro

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.

6.2 Erros Comuns a Evitar

Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).

  7. Ferramentas e Templates

Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).

  8. SLAs e Prazos

Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.

  9. Fluxograma

Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim

  10. Glossário

Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Gestão de Assets e Biblioteca 3D</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-014</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Curar, organizar e manter a biblioteca 3D; aprovar novos assets</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Definir padrões de qualidade e estilo dos assets da biblioteca</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Contribuir com novos assets e seguir processos de admissão</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Garantir orçamento para aquisição de assets e licenças</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Estrutura e organização da biblioteca</strong></p><p>Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Estrutura de biblioteca documentada e mantida</p><p>Prazo referência: Manutenção contínua; revisão trimestral completa</p><p><strong>5.2. Processo de admissão de novos assets</strong></p><p>Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Asset admitido, testado, nomeado e registrado no inventário</p><p>Prazo referência: 30–60 min por asset</p><p><strong>[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.</strong></p><p><strong>5.3. Nomenclatura e tagging de assets</strong></p><p>Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Assets nomeados e com tags atualizadas</p><p>Prazo referência: 15 min por asset</p><p><strong>5.4. Controle de licenças e conformidade</strong></p><p>Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Planilha de inventário de licenças atualizada</p><p>Prazo referência: Atualização contínua; revisão semestral em 1 dia útil</p><p><strong>5.5. Manutenção, limpeza e expansão periódica</strong></p><p>Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Biblioteca limpa, atualizada e com plano de expansão</p><p>Prazo referência: 1 dia útil por ciclo trimestral</p><p><strong>5.6. Onboarding e acesso do time</strong></p><p>Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Novo membro onboarded na biblioteca; acesso configurado</p><p>Prazo referência: 2 h por novo membro</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.</p><p><strong>  9. Fluxograma</strong></p><p>Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim</p><p><strong>  10. Glossário</strong></p><p>Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','aprovacao']::TEXT[],
    13,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-3D-014
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.', '<p>Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.', '<p>Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).', '<p>Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Curar, organizar e manter a biblioteca 3D; aprovar novos assets

Responsável

—

Diretor Criativo (Marco Andolfato)

Definir padrões de qualidade e estilo dos assets da biblioteca

Aprovador

—

Visualizador 3D Júnior

Contribuir com novos assets e seguir processos de admissão

Consultado

—

Gerente de Projetos

Garantir orçamento para aquisição de assets e licenças

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Curar, organizar e manter a biblioteca 3D; aprovar novos assets</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Definir padrões de qualidade e estilo dos assets da biblioteca</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Contribuir com novos assets e seguir processos de admissão</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Garantir orçamento para aquisição de assets e licenças</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.', '<p>Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).', '<p>Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Estrutura e organização da biblioteca', 'Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.

Responsável: Visualizador 3D Sênior

Output: Estrutura de biblioteca documentada e mantida

Prazo referência: Manutenção contínua; revisão trimestral completa', '<p>Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Estrutura de biblioteca documentada e mantida</p><p>Prazo referência: Manutenção contínua; revisão trimestral completa</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Processo de admissão de novos assets', 'Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.

Responsável: Visualizador 3D Sênior

Output: Asset admitido, testado, nomeado e registrado no inventário

Prazo referência: 30–60 min por asset

[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.', '<p>Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Asset admitido, testado, nomeado e registrado no inventário</p><p>Prazo referência: 30–60 min por asset</p><p><strong>[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Nomenclatura e tagging de assets', 'Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.

Responsável: Visualizador 3D Sênior

Output: Assets nomeados e com tags atualizadas

Prazo referência: 15 min por asset', '<p>Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Assets nomeados e com tags atualizadas</p><p>Prazo referência: 15 min por asset</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Controle de licenças e conformidade', 'Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.

Responsável: Visualizador 3D Sênior

Output: Planilha de inventário de licenças atualizada

Prazo referência: Atualização contínua; revisão semestral em 1 dia útil', '<p>Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Planilha de inventário de licenças atualizada</p><p>Prazo referência: Atualização contínua; revisão semestral em 1 dia útil</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Manutenção, limpeza e expansão periódica', 'Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.

Responsável: Visualizador 3D Sênior

Output: Biblioteca limpa, atualizada e com plano de expansão

Prazo referência: 1 dia útil por ciclo trimestral', '<p>Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Biblioteca limpa, atualizada e com plano de expansão</p><p>Prazo referência: 1 dia útil por ciclo trimestral</p>', 10, 'tip');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Onboarding e acesso do time', 'Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.

Responsável: Visualizador 3D Sênior

Output: Novo membro onboarded na biblioteca; acesso configurado

Prazo referência: 2 h por novo membro', '<p>Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Novo membro onboarded na biblioteca; acesso configurado</p><p>Prazo referência: 2 h por novo membro</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.', '<p>[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).', '<p>Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).', '<p>Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.', '<p>Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim', '<p>Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.', '<p>Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-001: Naming ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Naming',
    'tbo-brd-001-naming',
    'branding',
    'checklist',
    'Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.',
    'Standard Operating Procedure

Naming

Código

TBO-BRD-001

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Branding

Responsável

Nelson (PO Branding)

Aprovador

Marco Andolfato



  1. Objetivo

Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.

  2. Escopo

2.1 O que está coberto

Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.

2.2 Exclusões

Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Naming

Pesquisa e geração de alternativas

Aprovador

Informado

Nelson (PO Branding)

Curadoria e alinhamento estratégico

Aprovador

Informado

Marco Andolfato

Aprovação final antes da entrega ao cliente

Aprovador



Cliente/Incorporadora

Briefing e aprovação do nome



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.

4.2 Ferramentas e Acessos

Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.



  5. Procedimento Passo a Passo

5.1. Imersão e análise de briefing

Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.

Responsável: Estrategista de Naming

Output: Mapa conceitual e painel de referências de naming

Prazo referência: 1 dia útil

5.2. Geração de alternativas

Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.

Responsável: Estrategista de Naming

Output: Planilha com 30+ opções categorizadas e avaliadas

Prazo referência: 2 dias úteis

5.3. Curadoria interna e seleção de finalistas

Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.

Responsável: Nelson (PO Branding)

Output: Lista curada de 6–10 finalistas

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova lista antes da verificação formal

5.4. Verificação de disponibilidade

Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.

Responsável: Estrategista de Naming

Output: Relatório de disponibilidade por nome

Prazo referência: 1 dia útil

[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.

5.5. Apresentação ao cliente

Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.

Responsável: Nelson (PO Branding)

Output: Deck de naming apresentado ao cliente

Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)

5.6. Aprovação e documentação

Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.

Responsável: Marco Andolfato / Nelson

Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado

Prazo referência: 1 dia útil após apresentação

[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.

6.2 Erros Comuns a Evitar

Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.

  7. Ferramentas e Templates

INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.

  8. SLAs e Prazos

Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).

  9. Fluxograma

Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim

  10. Glossário

INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Naming</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.</p><p><strong>2.2 Exclusões</strong></p><p>Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Naming</p></td><td><p>Pesquisa e geração de alternativas</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Curadoria e alinhamento estratégico</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes da entrega ao cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Briefing e aprovação do nome</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Imersão e análise de briefing</strong></p><p>Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.</p><p>Responsável: Estrategista de Naming</p><p>Output: Mapa conceitual e painel de referências de naming</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Geração de alternativas</strong></p><p>Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.</p><p>Responsável: Estrategista de Naming</p><p>Output: Planilha com 30+ opções categorizadas e avaliadas</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.3. Curadoria interna e seleção de finalistas</strong></p><p>Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista curada de 6–10 finalistas</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova lista antes da verificação formal</strong></p><p><strong>5.4. Verificação de disponibilidade</strong></p><p>Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.</p><p>Responsável: Estrategista de Naming</p><p>Output: Relatório de disponibilidade por nome</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.</strong></p><p><strong>5.5. Apresentação ao cliente</strong></p><p>Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Deck de naming apresentado ao cliente</p><p>Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)</p><p><strong>5.6. Aprovação e documentação</strong></p><p>Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado</p><p>Prazo referência: 1 dia útil após apresentação</p><p><strong>[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim</p><p><strong>  10. Glossário</strong></p><p>INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    0,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.', '<p>Desenvolver o nome do empreendimento imobiliário com identidade fonética, semântica e registrável, alinhado ao posicionamento estratégico definido no briefing.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.', '<p>Pesquisa de naming, geração de alternativas, análise de disponibilidade junto ao INPI e cartório, apresentação ao cliente e aprovação final.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.', '<p>Registro formal no INPI (responsabilidade do cliente ou jurídico), criação de identidade visual (SOP BRD-02), domínio de internet.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator/Estrategista de Naming

Pesquisa e geração de alternativas

Aprovador

Informado

Nelson (PO Branding)

Curadoria e alinhamento estratégico

Aprovador

Informado

Marco Andolfato

Aprovação final antes da entrega ao cliente

Aprovador

Cliente/Incorporadora

Briefing e aprovação do nome

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator/Estrategista de Naming</p></td><td><p>Pesquisa e geração de alternativas</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Curadoria e alinhamento estratégico</p></td><td><p>Aprovador</p></td><td><p>Informado</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final antes da entrega ao cliente</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Briefing e aprovação do nome</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.', '<p>Briefing de posicionamento aprovado (público-alvo, segmento, localização, conceito), moodboard de referências, lista de nomes a evitar fornecida pelo cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.', '<p>Google Sheets (planilha de opções), INPI (busca de marca), Registro.br (domínio), Notion (documentação do processo), ferramentas de análise fonética.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Imersão e análise de briefing', 'Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.

Responsável: Estrategista de Naming

Output: Mapa conceitual e painel de referências de naming

Prazo referência: 1 dia útil', '<p>Ação: Revisar o briefing de posicionamento, identificar arquétipos de marca, tom desejado (sofisticado, jovem, regional, internacional) e restrições do cliente. Realizar desk research de nomes de empreendimentos concorrentes na região.</p><p>Responsável: Estrategista de Naming</p><p>Output: Mapa conceitual e painel de referências de naming</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Geração de alternativas', 'Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.

Responsável: Estrategista de Naming

Output: Planilha com 30+ opções categorizadas e avaliadas

Prazo referência: 2 dias úteis', '<p>Ação: Gerar mínimo de 30 alternativas de nomes distribuídas em ao menos 3 direcionamentos estratégicos distintos (ex: toponímico, aspiracional, descritivo premium). Avaliar cada opção por critérios: memorabilidade, pronúncia, significado, originalidade.</p><p>Responsável: Estrategista de Naming</p><p>Output: Planilha com 30+ opções categorizadas e avaliadas</p><p>Prazo referência: 2 dias úteis</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Curadoria interna e seleção de finalistas', 'Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.

Responsável: Nelson (PO Branding)

Output: Lista curada de 6–10 finalistas

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova lista antes da verificação formal', '<p>Ação: Nelson revisa a lista completa e seleciona 6 a 10 opções finalistas para verificação de disponibilidade. Eliminar nomes com conotações negativas, difíceis de pronunciar ou muito similares a concorrentes.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Lista curada de 6–10 finalistas</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova lista antes da verificação formal</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Verificação de disponibilidade', 'Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.

Responsável: Estrategista de Naming

Output: Relatório de disponibilidade por nome

Prazo referência: 1 dia útil

[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.', '<p>Ação: Pesquisar os nomes finalistas no INPI (classes 36, 37 e 44 do protocolo Madrid), Registro.br para domínios .com.br e .com, e busca no Google por marcas homônimas. Documentar status de cada nome.</p><p>Responsável: Estrategista de Naming</p><p>Output: Relatório de disponibilidade por nome</p><p>Prazo referência: 1 dia útil</p><p><strong>[DECISÃO] Nome disponível? Sim → avançar para apresentação. Não → retornar ao pool ou gerar novos nomes.</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Apresentação ao cliente', 'Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.

Responsável: Nelson (PO Branding)

Output: Deck de naming apresentado ao cliente

Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)', '<p>Ação: Preparar deck de apresentação com 3 a 5 opções finalistas disponíveis, contextualizando cada nome com seu conceito, referências visuais e fonéticas, e argumentação estratégica. Apresentar em reunião ou via vídeo gravado.</p><p>Responsável: Nelson (PO Branding)</p><p>Output: Deck de naming apresentado ao cliente</p><p>Prazo referência: Agendado com cliente (máx. 3 dias após curadoria)</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Aprovação e documentação', 'Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.

Responsável: Marco Andolfato / Nelson

Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado

Prazo referência: 1 dia útil após apresentação

[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP', '<p>Ação: Cliente confirma o nome escolhido por e-mail ou assinatura em documento de aprovação. Marco Andolfato valida a entrega final. Arquivar o processo completo no Notion do projeto.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Nome aprovado documentado, e-mail de confirmação do cliente arquivado</p><p>Prazo referência: 1 dia útil após apresentação</p><p><strong>[APROVAÇÃO] Marco Andolfato assina entrega antes do encerramento do SOP</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.', '<p>Nome fonético e de fácil pronuncia em português; sem conotações negativas em PT-BR e EN; disponível no INPI nas classes relevantes; domínio .com.br disponível ou estratégia alternativa documentada; aprovado pelo cliente por escrito; arquivado no Notion.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.', '<p>Nome com registro conflitante no INPI não identificado antes da apresentação ao cliente; opções sem conceito estratégico definido; deck sem argumentação — só lista de nomes; aprovação verbal sem registro formal.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.', '<p>INPI (busca.inpi.gov.br), Registro.br, Google Sheets, Notion, Canva ou PowerPoint para deck de apresentação.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).', '<p>Geração de alternativas: 2 dias úteis. Verificação INPI: 1 dia útil. Apresentação ao cliente: até 5 dias úteis do início. Aprovação final: depende do cliente (máx. 3 rodadas em 10 dias úteis).</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim', '<p>Início → Receber briefing → Imersão e análise → Gerar 30+ alternativas → Curadoria interna Nelson → [APROVAÇÃO INTERNA?] → Não: revisar pool → Sim: Verificação INPI/domínio → [DISPONÍVEL?] → Não: gerar substitutos → Sim: Preparar deck → Apresentação ao cliente → [CLIENTE APROVA?] → Não: nova rodada (máx. 3) → Sim: Documentar aprovação → Marco valida → Arquivar no Notion → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.', '<p>INPI: Instituto Nacional da Propriedade Industrial, órgão de registro de marcas no Brasil. Naming: processo criativo de criação de nomes para marcas ou produtos. Arquétipo de marca: perfil psicológico e simbólico que norteia o posicionamento da marca. Classe de Nice: classificação internacional de produtos e serviços para registro de marcas.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-002: Identidade Visual Logo Manual KVs ──
END $$;