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
END $$;