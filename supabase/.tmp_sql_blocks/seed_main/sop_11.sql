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
END $$;