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
    'Pílulas Social Conteúdo para Redes Sociais',
    'tbo-av-005-pilulas-social-conteudo-para-redes-sociais',
    'audiovisual',
    'checklist',
    'Pílulas Social (Conteúdo para Redes Sociais)',
    'Standard Operating Procedure

Pílulas Social (Conteúdo para Redes Sociais)

Código

TBO-AV-005

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Audiovisual

Responsável

Marco Andolfato (Diretor Criativo)

Aprovador

Marco Andolfato



  1. Objetivo

Produzir série de vídeos curtos (15–60s) derivados de produções maiores ou captados originalmente para alimentar redes sociais (Instagram Reels, TikTok, LinkedIn, WhatsApp) com frequência semanal.

  2. Escopo

2.1 O que está coberto

Edição de vídeos verticais e quadrados a partir de material existente ou captação rápida; motion graphics simples; legenda em todos os vídeos; entrega em lote semanal ou quinzenal.

2.2 Exclusões

Criação de copy/legenda escrita (responsabilidade do time de conteúdo/marketing), gerenciamento e publicação nas plataformas, captação de filmagem principal (depende dos SOPs AV-01 a AV-04).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Aprovação final de qualidade criativa

Aprovador

—

Editor AV

Edição, cortes e legendagem

Executor

—

Cliente / Marketing

Calendário de conteúdo e aprovações rápidas

Consultado

Informado

Carol (Ops)

Controle de entregas e prazos

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Material bruto ou master de produções anteriores; calendário editorial do cliente; identidade visual atualizada (cores, fontes, logo); guia de formato por plataforma (1:1, 9:16, 16:9).

4.2 Ferramentas e Acessos

Adobe Premiere Pro, After Effects, CapCut Pro (edição rápida mobile), Canva Pro (templates), frame.io ou WeTransfer para entrega.



  5. Procedimento Passo a Passo

5.1. Planejamento do Lote

Ação: Reunião rápida (30min) com cliente/marketing para definir os 4–8 vídeos do lote: tema de cada pílula, cenas a usar do material master, mensagem principal e CTA.

Responsável: Editor AV + Cliente

Output: Lista do lote com tema e cenas de cada pílula

Prazo referência: Dia 1

5.2. Seleção e Recorte de Cenas

Ação: Selecionar os melhores takes do material disponível; fazer cortes para cada pílula respeitando o timing da plataforma (15s, 30s ou 60s); salvar como subclips.

Responsável: Editor AV

Output: Subclips selecionados por pílula

Prazo referência: Dia 1–2

5.3. Edição e Motion

Ação: Montar cada pílula com transições rápidas, trilha (TikTok-style ou emocional), motion graphics de logo e CTA; inserir legenda automática (Rev.ai ou CapCut AI) e revisar manualmente.

Responsável: Editor AV

Output: Pílulas montadas em rascunho

Prazo referência: Dia 2–3

5.4. Revisão Interna (Marco)

Ação: Marco revisar lote completo: qualidade de corte, identidade visual, mensagem e timing. Aprovar ou solicitar ajustes pontuais.

Responsável: Marco Andolfato

Output: Lote aprovado internamente

Prazo referência: Dia 3

5.5. Entrega ao Cliente e Ajustes

Ação: Enviar lote ao cliente via frame.io ou pasta Google Drive; consolidar feedback; ajustar se necessário (máx. 1 rodada por pílula); entregar versões finais em MP4 por plataforma.

Responsável: Editor AV + Carol (Ops)

Output: Lote final entregue

Prazo referência: Dia 4–5

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os vídeos com legenda revisada manualmente; [ ] Logo e CTA presentes em todos os formatos; [ ] Proporção correta por plataforma (9:16 Reels, 1:1 Feed, 16:9 YouTube); [ ] Nenhum vídeo com corte abrupto sem intenção; [ ] Trilha com volume balanceado (não abafa fala).

6.2 Erros Comuns a Evitar

Legenda automática sem revisão → erros graves (nomes, valores). Formato incorreto por plataforma → vídeo cortado. Trilha muito alta → fala incompreensível. Lote sem revisão de Marco → identidade visual inconsistente.

  7. Ferramentas e Templates

Adobe Premiere Pro, After Effects, CapCut Pro, frame.io, Google Drive, Asana.

  8. SLAs e Prazos

Lote de 4–8 pílulas: entregue em até 5 dias úteis. Revisão de cliente: 1 rodada inclusa por pílula. Frequência recomendada: lote quinzenal.

  9. Fluxograma

Início → Planejamento do Lote → Seleção de Cenas → Edição + Legenda + Motion → Revisão Interna (Marco) → Envio ao Cliente → Feedback → Ajustes (1 rodada) → Entrega Final → Fim

  10. Glossário

Pílula: vídeo curto e direto com uma mensagem central. Lote: conjunto de pílulas produzidas em uma sprint. CTA: Call to Action — texto ou elemento que convida ação do espectador. Subclip: trecho selecionado de um arquivo maior.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Pílulas Social (Conteúdo para Redes Sociais)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-005</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir série de vídeos curtos (15–60s) derivados de produções maiores ou captados originalmente para alimentar redes sociais (Instagram Reels, TikTok, LinkedIn, WhatsApp) com frequência semanal.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Edição de vídeos verticais e quadrados a partir de material existente ou captação rápida; motion graphics simples; legenda em todos os vídeos; entrega em lote semanal ou quinzenal.</p><p><strong>2.2 Exclusões</strong></p><p>Criação de copy/legenda escrita (responsabilidade do time de conteúdo/marketing), gerenciamento e publicação nas plataformas, captação de filmagem principal (depende dos SOPs AV-01 a AV-04).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final de qualidade criativa</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Editor AV</p></td><td><p>Edição, cortes e legendagem</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Marketing</p></td><td><p>Calendário de conteúdo e aprovações rápidas</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Controle de entregas e prazos</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Material bruto ou master de produções anteriores; calendário editorial do cliente; identidade visual atualizada (cores, fontes, logo); guia de formato por plataforma (1:1, 9:16, 16:9).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Premiere Pro, After Effects, CapCut Pro (edição rápida mobile), Canva Pro (templates), frame.io ou WeTransfer para entrega.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Planejamento do Lote</strong></p><p>Ação: Reunião rápida (30min) com cliente/marketing para definir os 4–8 vídeos do lote: tema de cada pílula, cenas a usar do material master, mensagem principal e CTA.</p><p>Responsável: Editor AV + Cliente</p><p>Output: Lista do lote com tema e cenas de cada pílula</p><p>Prazo referência: Dia 1</p><p><strong>5.2. Seleção e Recorte de Cenas</strong></p><p>Ação: Selecionar os melhores takes do material disponível; fazer cortes para cada pílula respeitando o timing da plataforma (15s, 30s ou 60s); salvar como subclips.</p><p>Responsável: Editor AV</p><p>Output: Subclips selecionados por pílula</p><p>Prazo referência: Dia 1–2</p><p><strong>5.3. Edição e Motion</strong></p><p>Ação: Montar cada pílula com transições rápidas, trilha (TikTok-style ou emocional), motion graphics de logo e CTA; inserir legenda automática (Rev.ai ou CapCut AI) e revisar manualmente.</p><p>Responsável: Editor AV</p><p>Output: Pílulas montadas em rascunho</p><p>Prazo referência: Dia 2–3</p><p><strong>5.4. Revisão Interna (Marco)</strong></p><p>Ação: Marco revisar lote completo: qualidade de corte, identidade visual, mensagem e timing. Aprovar ou solicitar ajustes pontuais.</p><p>Responsável: Marco Andolfato</p><p>Output: Lote aprovado internamente</p><p>Prazo referência: Dia 3</p><p><strong>5.5. Entrega ao Cliente e Ajustes</strong></p><p>Ação: Enviar lote ao cliente via frame.io ou pasta Google Drive; consolidar feedback; ajustar se necessário (máx. 1 rodada por pílula); entregar versões finais em MP4 por plataforma.</p><p>Responsável: Editor AV + Carol (Ops)</p><p>Output: Lote final entregue</p><p>Prazo referência: Dia 4–5</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Todos os vídeos com legenda revisada manualmente; [ ] Logo e CTA presentes em todos os formatos; [ ] Proporção correta por plataforma (9:16 Reels, 1:1 Feed, 16:9 YouTube); [ ] Nenhum vídeo com corte abrupto sem intenção; [ ] Trilha com volume balanceado (não abafa fala).</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Legenda automática sem revisão → erros graves (nomes, valores). Formato incorreto por plataforma → vídeo cortado. Trilha muito alta → fala incompreensível. Lote sem revisão de Marco → identidade visual inconsistente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Premiere Pro, After Effects, CapCut Pro, frame.io, Google Drive, Asana.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Lote de 4–8 pílulas: entregue em até 5 dias úteis. Revisão de cliente: 1 rodada inclusa por pílula. Frequência recomendada: lote quinzenal.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Planejamento do Lote → Seleção de Cenas → Edição + Legenda + Motion → Revisão Interna (Marco) → Envio ao Cliente → Feedback → Ajustes (1 rodada) → Entrega Final → Fim</p><p><strong>  10. Glossário</strong></p><p>Pílula: vídeo curto e direto com uma mensagem central. Lote: conjunto de pílulas produzidas em uma sprint. CTA: Call to Action — texto ou elemento que convida ação do espectador. Subclip: trecho selecionado de um arquivo maior.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
    4,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-AV-005
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir série de vídeos curtos (15–60s) derivados de produções maiores ou captados originalmente para alimentar redes sociais (Instagram Reels, TikTok, LinkedIn, WhatsApp) com frequência semanal.', '<p>Produzir série de vídeos curtos (15–60s) derivados de produções maiores ou captados originalmente para alimentar redes sociais (Instagram Reels, TikTok, LinkedIn, WhatsApp) com frequência semanal.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Edição de vídeos verticais e quadrados a partir de material existente ou captação rápida; motion graphics simples; legenda em todos os vídeos; entrega em lote semanal ou quinzenal.', '<p>Edição de vídeos verticais e quadrados a partir de material existente ou captação rápida; motion graphics simples; legenda em todos os vídeos; entrega em lote semanal ou quinzenal.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criação de copy/legenda escrita (responsabilidade do time de conteúdo/marketing), gerenciamento e publicação nas plataformas, captação de filmagem principal (depende dos SOPs AV-01 a AV-04).', '<p>Criação de copy/legenda escrita (responsabilidade do time de conteúdo/marketing), gerenciamento e publicação nas plataformas, captação de filmagem principal (depende dos SOPs AV-01 a AV-04).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Aprovação final de qualidade criativa

Aprovador

—

Editor AV

Edição, cortes e legendagem

Executor

—

Cliente / Marketing

Calendário de conteúdo e aprovações rápidas

Consultado

Informado

Carol (Ops)

Controle de entregas e prazos

Informado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final de qualidade criativa</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Editor AV</p></td><td><p>Edição, cortes e legendagem</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Marketing</p></td><td><p>Calendário de conteúdo e aprovações rápidas</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Controle de entregas e prazos</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Material bruto ou master de produções anteriores; calendário editorial do cliente; identidade visual atualizada (cores, fontes, logo); guia de formato por plataforma (1:1, 9:16, 16:9).', '<p>Material bruto ou master de produções anteriores; calendário editorial do cliente; identidade visual atualizada (cores, fontes, logo); guia de formato por plataforma (1:1, 9:16, 16:9).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Premiere Pro, After Effects, CapCut Pro (edição rápida mobile), Canva Pro (templates), frame.io ou WeTransfer para entrega.', '<p>Adobe Premiere Pro, After Effects, CapCut Pro (edição rápida mobile), Canva Pro (templates), frame.io ou WeTransfer para entrega.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Planejamento do Lote', 'Ação: Reunião rápida (30min) com cliente/marketing para definir os 4–8 vídeos do lote: tema de cada pílula, cenas a usar do material master, mensagem principal e CTA.

Responsável: Editor AV + Cliente

Output: Lista do lote com tema e cenas de cada pílula

Prazo referência: Dia 1', '<p>Ação: Reunião rápida (30min) com cliente/marketing para definir os 4–8 vídeos do lote: tema de cada pílula, cenas a usar do material master, mensagem principal e CTA.</p><p>Responsável: Editor AV + Cliente</p><p>Output: Lista do lote com tema e cenas de cada pílula</p><p>Prazo referência: Dia 1</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Seleção e Recorte de Cenas', 'Ação: Selecionar os melhores takes do material disponível; fazer cortes para cada pílula respeitando o timing da plataforma (15s, 30s ou 60s); salvar como subclips.

Responsável: Editor AV

Output: Subclips selecionados por pílula

Prazo referência: Dia 1–2', '<p>Ação: Selecionar os melhores takes do material disponível; fazer cortes para cada pílula respeitando o timing da plataforma (15s, 30s ou 60s); salvar como subclips.</p><p>Responsável: Editor AV</p><p>Output: Subclips selecionados por pílula</p><p>Prazo referência: Dia 1–2</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Edição e Motion', 'Ação: Montar cada pílula com transições rápidas, trilha (TikTok-style ou emocional), motion graphics de logo e CTA; inserir legenda automática (Rev.ai ou CapCut AI) e revisar manualmente.

Responsável: Editor AV

Output: Pílulas montadas em rascunho

Prazo referência: Dia 2–3', '<p>Ação: Montar cada pílula com transições rápidas, trilha (TikTok-style ou emocional), motion graphics de logo e CTA; inserir legenda automática (Rev.ai ou CapCut AI) e revisar manualmente.</p><p>Responsável: Editor AV</p><p>Output: Pílulas montadas em rascunho</p><p>Prazo referência: Dia 2–3</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão Interna (Marco)', 'Ação: Marco revisar lote completo: qualidade de corte, identidade visual, mensagem e timing. Aprovar ou solicitar ajustes pontuais.

Responsável: Marco Andolfato

Output: Lote aprovado internamente

Prazo referência: Dia 3', '<p>Ação: Marco revisar lote completo: qualidade de corte, identidade visual, mensagem e timing. Aprovar ou solicitar ajustes pontuais.</p><p>Responsável: Marco Andolfato</p><p>Output: Lote aprovado internamente</p><p>Prazo referência: Dia 3</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Entrega ao Cliente e Ajustes', 'Ação: Enviar lote ao cliente via frame.io ou pasta Google Drive; consolidar feedback; ajustar se necessário (máx. 1 rodada por pílula); entregar versões finais em MP4 por plataforma.

Responsável: Editor AV + Carol (Ops)

Output: Lote final entregue

Prazo referência: Dia 4–5', '<p>Ação: Enviar lote ao cliente via frame.io ou pasta Google Drive; consolidar feedback; ajustar se necessário (máx. 1 rodada por pílula); entregar versões finais em MP4 por plataforma.</p><p>Responsável: Editor AV + Carol (Ops)</p><p>Output: Lote final entregue</p><p>Prazo referência: Dia 4–5</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os vídeos com legenda revisada manualmente; [ ] Logo e CTA presentes em todos os formatos; [ ] Proporção correta por plataforma (9:16 Reels, 1:1 Feed, 16:9 YouTube); [ ] Nenhum vídeo com corte abrupto sem intenção; [ ] Trilha com volume balanceado (não abafa fala).', '<p>[ ] Todos os vídeos com legenda revisada manualmente; [ ] Logo e CTA presentes em todos os formatos; [ ] Proporção correta por plataforma (9:16 Reels, 1:1 Feed, 16:9 YouTube); [ ] Nenhum vídeo com corte abrupto sem intenção; [ ] Trilha com volume balanceado (não abafa fala).</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Legenda automática sem revisão → erros graves (nomes, valores). Formato incorreto por plataforma → vídeo cortado. Trilha muito alta → fala incompreensível. Lote sem revisão de Marco → identidade visual inconsistente.', '<p>Legenda automática sem revisão → erros graves (nomes, valores). Formato incorreto por plataforma → vídeo cortado. Trilha muito alta → fala incompreensível. Lote sem revisão de Marco → identidade visual inconsistente.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Premiere Pro, After Effects, CapCut Pro, frame.io, Google Drive, Asana.', '<p>Adobe Premiere Pro, After Effects, CapCut Pro, frame.io, Google Drive, Asana.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Lote de 4–8 pílulas: entregue em até 5 dias úteis. Revisão de cliente: 1 rodada inclusa por pílula. Frequência recomendada: lote quinzenal.', '<p>Lote de 4–8 pílulas: entregue em até 5 dias úteis. Revisão de cliente: 1 rodada inclusa por pílula. Frequência recomendada: lote quinzenal.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Planejamento do Lote → Seleção de Cenas → Edição + Legenda + Motion → Revisão Interna (Marco) → Envio ao Cliente → Feedback → Ajustes (1 rodada) → Entrega Final → Fim', '<p>Início → Planejamento do Lote → Seleção de Cenas → Edição + Legenda + Motion → Revisão Interna (Marco) → Envio ao Cliente → Feedback → Ajustes (1 rodada) → Entrega Final → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Pílula: vídeo curto e direto com uma mensagem central. Lote: conjunto de pílulas produzidas em uma sprint. CTA: Call to Action — texto ou elemento que convida ação do espectador. Subclip: trecho selecionado de um arquivo maior.', '<p>Pílula: vídeo curto e direto com uma mensagem central. Lote: conjunto de pílulas produzidas em uma sprint. CTA: Call to Action — texto ou elemento que convida ação do espectador. Subclip: trecho selecionado de um arquivo maior.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-AV-006: Acompanhamento de Obras Videolog ──
END $$;