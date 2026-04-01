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
    'Filme de Lançamento',
    'tbo-av-002-filme-de-lancamento',
    'audiovisual',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Filme de Lançamento

Código

TBO-AV-002

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

Produzir o filme principal de lançamento imobiliário (2–4 minutos), comunicando conceito, diferenciais e estilo de vida do empreendimento para campanhas de mídia paga, eventos e site.

  2. Escopo

2.1 O que está coberto

Roteiro, pré-produção completa, captação com equipe ampliada, edição narrativa, motion graphics, trilha original ou licenciada, color grading e entrega multi-plataforma.

2.2 Exclusões

Produção de peças curtas derivadas (responsabilidade do SOP AV-05 Pílulas Social), distribuição em mídia paga, locução em idioma diferente do português sem acordo prévio.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, roteiro, aprovação de cortes

Aprovador

—

Equipe AV Sênior

DOP, câmera, som direto, making of

Executor

—

Cliente / Incorporadora

Briefing, aprovações, fornecimento de assets e locações

Consultado

Informado

Carol (Ops)

Planejamento de produção, contratos de atores/locação, entrega

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Briefing completo aprovado; conceito criativo definido; moodboard visual e de referências; renders ou maquete 3D em alta resolução; identidade visual do empreendimento; lista de diferenciais aprovada pelo cliente.

4.2 Ferramentas e Acessos

Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D (se necessário para integrações 3D), câmeras cinema, equipamentos de iluminação, som direto (boom + wireless), frame.io.



  5. Procedimento Passo a Passo

5.1. Briefing Estratégico e Conceito

Ação: Workshop de briefing com cliente (1–2h); mapear público-alvo, emoção central, diferenciais do empreendimento e key visual. Marco define conceito criativo e pitch do filme.

Responsável: Marco Andolfato + Cliente

Output: Documento de conceito criativo aprovado

Prazo referência: Dia 1–2

5.2. Roteiro e Storyboard

Ação: Desenvolver roteiro narrativo (cenas, falas, narração, mood), criar storyboard simplificado por cena; apresentar ao cliente para aprovação.

Responsável: Marco Andolfato

Output: Roteiro + storyboard aprovados

Prazo referência: Dia 3–5

5.3. Pré-produção Executiva

Ação: Casting de atores/modelos, scouting de locações, montagem de equipe técnica ampliada, cronograma de captação, call sheets por dia de gravação, contratação de trilha.

Responsável: Carol (Ops) + Equipe AV

Output: Pacote de pré-produção completo

Prazo referência: Dia 6–10

5.4. Captação (1–3 dias)

Ação: Executar captação conforme call sheet: cenas lifestyle, ambientes, produto (maquete/renders integrados em campo), aerial (drone), making of para redes sociais.

Responsável: Equipe AV (DOP + câmera B + som + PA)

Output: Rushes organizados, backup duplo no servidor

Prazo referência: Dia 11–13

5.5. Offline Edit e Trilha

Ação: Montar corte narrativo offline no Premiere; encaixar trilha final; inserir placeholders para motion graphics; enviar cut v1 ao cliente via frame.io.

Responsável: Equipe AV

Output: Cut v1 no frame.io

Prazo referência: Dia 14–17

5.6. Motion, VFX e Revisões

Ação: Criar motion graphics, title cards, animações de logotipo e eventuais integrações 3D no After Effects/C4D; aplicar feedback do cliente (até 2 rodadas).

Responsável: Equipe AV + Marco

Output: Corte final aprovado pelo cliente

Prazo referência: Dia 18–23

5.7. Color Grading, Masterização e Entrega

Ação: Color grading no DaVinci Resolve; masterização de áudio; exportar versões: ProRes master, H.264 web, 9:16 stories, 1:1 feed, 16:9 YouTube; entregar pacote no Google Drive do cliente.

Responsável: Equipe AV + Carol (Ops)

Output: Pacote completo entregue, projeto arquivado

Prazo referência: Dia 24–25

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Conceito criativo aprovado antes de qualquer produção; [ ] Contratos de atores e locações assinados; [ ] Backup duplo dos rushes no mesmo dia de captação; [ ] Cut v1 revisado por Marco antes de enviar ao cliente; [ ] Todos os formatos de exportação conferidos (resolução, bitrate, proporção); [ ] Trilha com licença documentada; [ ] Arquivo de projeto guardado no servidor.

6.2 Erros Comuns a Evitar

Captação sem locação contratada → atraso ou impedimento em campo. Aprovação de roteiro pulada → refilmagem. Trilha sem licença → risco jurídico e retrabalho. Cut enviado sem revisão interna → mais de 2 rodadas de feedback.

  7. Ferramentas e Templates

Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.

  8. SLAs e Prazos

Entrega de roteiro: 5 dias úteis pós-briefing. Cut v1: 7 dias após captação. Aprovação final: 23–25 dias úteis pós-início. Rodadas de revisão: 2 inclusas.

  9. Fluxograma

Início → Briefing Estratégico → Conceito Criativo Aprovado → Roteiro + Storyboard → Pré-produção Executiva → Captação (1–3 dias) → Offline Edit → Cut v1 (frame.io) → Feedback (até 2x) → Motion + VFX → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim

  10. Glossário

DOP: Director of Photography. Call Sheet: cronograma detalhado do dia de gravação. Offline Edit: montagem sem finalização de cor/som. Title Card: tela com texto e logotipo. Storyboard: sequência visual de cenas do roteiro.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Filme de Lançamento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir o filme principal de lançamento imobiliário (2–4 minutos), comunicando conceito, diferenciais e estilo de vida do empreendimento para campanhas de mídia paga, eventos e site.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Roteiro, pré-produção completa, captação com equipe ampliada, edição narrativa, motion graphics, trilha original ou licenciada, color grading e entrega multi-plataforma.</p><p><strong>2.2 Exclusões</strong></p><p>Produção de peças curtas derivadas (responsabilidade do SOP AV-05 Pílulas Social), distribuição em mídia paga, locução em idioma diferente do português sem acordo prévio.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, roteiro, aprovação de cortes</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV Sênior</p></td><td><p>DOP, câmera, som direto, making of</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Briefing, aprovações, fornecimento de assets e locações</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Planejamento de produção, contratos de atores/locação, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing completo aprovado; conceito criativo definido; moodboard visual e de referências; renders ou maquete 3D em alta resolução; identidade visual do empreendimento; lista de diferenciais aprovada pelo cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D (se necessário para integrações 3D), câmeras cinema, equipamentos de iluminação, som direto (boom + wireless), frame.io.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing Estratégico e Conceito</strong></p><p>Ação: Workshop de briefing com cliente (1–2h); mapear público-alvo, emoção central, diferenciais do empreendimento e key visual. Marco define conceito criativo e pitch do filme.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Documento de conceito criativo aprovado</p><p>Prazo referência: Dia 1–2</p><p><strong>5.2. Roteiro e Storyboard</strong></p><p>Ação: Desenvolver roteiro narrativo (cenas, falas, narração, mood), criar storyboard simplificado por cena; apresentar ao cliente para aprovação.</p><p>Responsável: Marco Andolfato</p><p>Output: Roteiro + storyboard aprovados</p><p>Prazo referência: Dia 3–5</p><p><strong>5.3. Pré-produção Executiva</strong></p><p>Ação: Casting de atores/modelos, scouting de locações, montagem de equipe técnica ampliada, cronograma de captação, call sheets por dia de gravação, contratação de trilha.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Pacote de pré-produção completo</p><p>Prazo referência: Dia 6–10</p><p><strong>5.4. Captação (1–3 dias)</strong></p><p>Ação: Executar captação conforme call sheet: cenas lifestyle, ambientes, produto (maquete/renders integrados em campo), aerial (drone), making of para redes sociais.</p><p>Responsável: Equipe AV (DOP + câmera B + som + PA)</p><p>Output: Rushes organizados, backup duplo no servidor</p><p>Prazo referência: Dia 11–13</p><p><strong>5.5. Offline Edit e Trilha</strong></p><p>Ação: Montar corte narrativo offline no Premiere; encaixar trilha final; inserir placeholders para motion graphics; enviar cut v1 ao cliente via frame.io.</p><p>Responsável: Equipe AV</p><p>Output: Cut v1 no frame.io</p><p>Prazo referência: Dia 14–17</p><p><strong>5.6. Motion, VFX e Revisões</strong></p><p>Ação: Criar motion graphics, title cards, animações de logotipo e eventuais integrações 3D no After Effects/C4D; aplicar feedback do cliente (até 2 rodadas).</p><p>Responsável: Equipe AV + Marco</p><p>Output: Corte final aprovado pelo cliente</p><p>Prazo referência: Dia 18–23</p><p><strong>5.7. Color Grading, Masterização e Entrega</strong></p><p>Ação: Color grading no DaVinci Resolve; masterização de áudio; exportar versões: ProRes master, H.264 web, 9:16 stories, 1:1 feed, 16:9 YouTube; entregar pacote no Google Drive do cliente.</p><p>Responsável: Equipe AV + Carol (Ops)</p><p>Output: Pacote completo entregue, projeto arquivado</p><p>Prazo referência: Dia 24–25</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Conceito criativo aprovado antes de qualquer produção; [ ] Contratos de atores e locações assinados; [ ] Backup duplo dos rushes no mesmo dia de captação; [ ] Cut v1 revisado por Marco antes de enviar ao cliente; [ ] Todos os formatos de exportação conferidos (resolução, bitrate, proporção); [ ] Trilha com licença documentada; [ ] Arquivo de projeto guardado no servidor.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Captação sem locação contratada → atraso ou impedimento em campo. Aprovação de roteiro pulada → refilmagem. Trilha sem licença → risco jurídico e retrabalho. Cut enviado sem revisão interna → mais de 2 rodadas de feedback.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Entrega de roteiro: 5 dias úteis pós-briefing. Cut v1: 7 dias após captação. Aprovação final: 23–25 dias úteis pós-início. Rodadas de revisão: 2 inclusas.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing Estratégico → Conceito Criativo Aprovado → Roteiro + Storyboard → Pré-produção Executiva → Captação (1–3 dias) → Offline Edit → Cut v1 (frame.io) → Feedback (até 2x) → Motion + VFX → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim</p><p><strong>  10. Glossário</strong></p><p>DOP: Director of Photography. Call Sheet: cronograma detalhado do dia de gravação. Offline Edit: montagem sem finalização de cor/som. Title Card: tela com texto e logotipo. Storyboard: sequência visual de cenas do roteiro.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
    1,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-AV-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir o filme principal de lançamento imobiliário (2–4 minutos), comunicando conceito, diferenciais e estilo de vida do empreendimento para campanhas de mídia paga, eventos e site.', '<p>Produzir o filme principal de lançamento imobiliário (2–4 minutos), comunicando conceito, diferenciais e estilo de vida do empreendimento para campanhas de mídia paga, eventos e site.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Roteiro, pré-produção completa, captação com equipe ampliada, edição narrativa, motion graphics, trilha original ou licenciada, color grading e entrega multi-plataforma.', '<p>Roteiro, pré-produção completa, captação com equipe ampliada, edição narrativa, motion graphics, trilha original ou licenciada, color grading e entrega multi-plataforma.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de peças curtas derivadas (responsabilidade do SOP AV-05 Pílulas Social), distribuição em mídia paga, locução em idioma diferente do português sem acordo prévio.', '<p>Produção de peças curtas derivadas (responsabilidade do SOP AV-05 Pílulas Social), distribuição em mídia paga, locução em idioma diferente do português sem acordo prévio.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa, roteiro, aprovação de cortes

Aprovador

—

Equipe AV Sênior

DOP, câmera, som direto, making of

Executor

—

Cliente / Incorporadora

Briefing, aprovações, fornecimento de assets e locações

Consultado

Informado

Carol (Ops)

Planejamento de produção, contratos de atores/locação, entrega

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa, roteiro, aprovação de cortes</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV Sênior</p></td><td><p>DOP, câmera, som direto, making of</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Briefing, aprovações, fornecimento de assets e locações</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Planejamento de produção, contratos de atores/locação, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing completo aprovado; conceito criativo definido; moodboard visual e de referências; renders ou maquete 3D em alta resolução; identidade visual do empreendimento; lista de diferenciais aprovada pelo cliente.', '<p>Briefing completo aprovado; conceito criativo definido; moodboard visual e de referências; renders ou maquete 3D em alta resolução; identidade visual do empreendimento; lista de diferenciais aprovada pelo cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D (se necessário para integrações 3D), câmeras cinema, equipamentos de iluminação, som direto (boom + wireless), frame.io.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D (se necessário para integrações 3D), câmeras cinema, equipamentos de iluminação, som direto (boom + wireless), frame.io.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing Estratégico e Conceito', 'Ação: Workshop de briefing com cliente (1–2h); mapear público-alvo, emoção central, diferenciais do empreendimento e key visual. Marco define conceito criativo e pitch do filme.

Responsável: Marco Andolfato + Cliente

Output: Documento de conceito criativo aprovado

Prazo referência: Dia 1–2', '<p>Ação: Workshop de briefing com cliente (1–2h); mapear público-alvo, emoção central, diferenciais do empreendimento e key visual. Marco define conceito criativo e pitch do filme.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Documento de conceito criativo aprovado</p><p>Prazo referência: Dia 1–2</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Roteiro e Storyboard', 'Ação: Desenvolver roteiro narrativo (cenas, falas, narração, mood), criar storyboard simplificado por cena; apresentar ao cliente para aprovação.

Responsável: Marco Andolfato

Output: Roteiro + storyboard aprovados

Prazo referência: Dia 3–5', '<p>Ação: Desenvolver roteiro narrativo (cenas, falas, narração, mood), criar storyboard simplificado por cena; apresentar ao cliente para aprovação.</p><p>Responsável: Marco Andolfato</p><p>Output: Roteiro + storyboard aprovados</p><p>Prazo referência: Dia 3–5</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Pré-produção Executiva', 'Ação: Casting de atores/modelos, scouting de locações, montagem de equipe técnica ampliada, cronograma de captação, call sheets por dia de gravação, contratação de trilha.

Responsável: Carol (Ops) + Equipe AV

Output: Pacote de pré-produção completo

Prazo referência: Dia 6–10', '<p>Ação: Casting de atores/modelos, scouting de locações, montagem de equipe técnica ampliada, cronograma de captação, call sheets por dia de gravação, contratação de trilha.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Pacote de pré-produção completo</p><p>Prazo referência: Dia 6–10</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Captação (1–3 dias)', 'Ação: Executar captação conforme call sheet: cenas lifestyle, ambientes, produto (maquete/renders integrados em campo), aerial (drone), making of para redes sociais.

Responsável: Equipe AV (DOP + câmera B + som + PA)

Output: Rushes organizados, backup duplo no servidor

Prazo referência: Dia 11–13', '<p>Ação: Executar captação conforme call sheet: cenas lifestyle, ambientes, produto (maquete/renders integrados em campo), aerial (drone), making of para redes sociais.</p><p>Responsável: Equipe AV (DOP + câmera B + som + PA)</p><p>Output: Rushes organizados, backup duplo no servidor</p><p>Prazo referência: Dia 11–13</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Offline Edit e Trilha', 'Ação: Montar corte narrativo offline no Premiere; encaixar trilha final; inserir placeholders para motion graphics; enviar cut v1 ao cliente via frame.io.

Responsável: Equipe AV

Output: Cut v1 no frame.io

Prazo referência: Dia 14–17', '<p>Ação: Montar corte narrativo offline no Premiere; encaixar trilha final; inserir placeholders para motion graphics; enviar cut v1 ao cliente via frame.io.</p><p>Responsável: Equipe AV</p><p>Output: Cut v1 no frame.io</p><p>Prazo referência: Dia 14–17</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Motion, VFX e Revisões', 'Ação: Criar motion graphics, title cards, animações de logotipo e eventuais integrações 3D no After Effects/C4D; aplicar feedback do cliente (até 2 rodadas).

Responsável: Equipe AV + Marco

Output: Corte final aprovado pelo cliente

Prazo referência: Dia 18–23', '<p>Ação: Criar motion graphics, title cards, animações de logotipo e eventuais integrações 3D no After Effects/C4D; aplicar feedback do cliente (até 2 rodadas).</p><p>Responsável: Equipe AV + Marco</p><p>Output: Corte final aprovado pelo cliente</p><p>Prazo referência: Dia 18–23</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.7. Color Grading, Masterização e Entrega', 'Ação: Color grading no DaVinci Resolve; masterização de áudio; exportar versões: ProRes master, H.264 web, 9:16 stories, 1:1 feed, 16:9 YouTube; entregar pacote no Google Drive do cliente.

Responsável: Equipe AV + Carol (Ops)

Output: Pacote completo entregue, projeto arquivado

Prazo referência: Dia 24–25', '<p>Ação: Color grading no DaVinci Resolve; masterização de áudio; exportar versões: ProRes master, H.264 web, 9:16 stories, 1:1 feed, 16:9 YouTube; entregar pacote no Google Drive do cliente.</p><p>Responsável: Equipe AV + Carol (Ops)</p><p>Output: Pacote completo entregue, projeto arquivado</p><p>Prazo referência: Dia 24–25</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Conceito criativo aprovado antes de qualquer produção; [ ] Contratos de atores e locações assinados; [ ] Backup duplo dos rushes no mesmo dia de captação; [ ] Cut v1 revisado por Marco antes de enviar ao cliente; [ ] Todos os formatos de exportação conferidos (resolução, bitrate, proporção); [ ] Trilha com licença documentada; [ ] Arquivo de projeto guardado no servidor.', '<p>[ ] Conceito criativo aprovado antes de qualquer produção; [ ] Contratos de atores e locações assinados; [ ] Backup duplo dos rushes no mesmo dia de captação; [ ] Cut v1 revisado por Marco antes de enviar ao cliente; [ ] Todos os formatos de exportação conferidos (resolução, bitrate, proporção); [ ] Trilha com licença documentada; [ ] Arquivo de projeto guardado no servidor.</p>', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Captação sem locação contratada → atraso ou impedimento em campo. Aprovação de roteiro pulada → refilmagem. Trilha sem licença → risco jurídico e retrabalho. Cut enviado sem revisão interna → mais de 2 rodadas de feedback.', '<p>Captação sem locação contratada → atraso ou impedimento em campo. Aprovação de roteiro pulada → refilmagem. Trilha sem licença → risco jurídico e retrabalho. Cut enviado sem revisão interna → mais de 2 rodadas de feedback.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, Cinema 4D, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Entrega de roteiro: 5 dias úteis pós-briefing. Cut v1: 7 dias após captação. Aprovação final: 23–25 dias úteis pós-início. Rodadas de revisão: 2 inclusas.', '<p>Entrega de roteiro: 5 dias úteis pós-briefing. Cut v1: 7 dias após captação. Aprovação final: 23–25 dias úteis pós-início. Rodadas de revisão: 2 inclusas.</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing Estratégico → Conceito Criativo Aprovado → Roteiro + Storyboard → Pré-produção Executiva → Captação (1–3 dias) → Offline Edit → Cut v1 (frame.io) → Feedback (até 2x) → Motion + VFX → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim', '<p>Início → Briefing Estratégico → Conceito Criativo Aprovado → Roteiro + Storyboard → Pré-produção Executiva → Captação (1–3 dias) → Offline Edit → Cut v1 (frame.io) → Feedback (até 2x) → Motion + VFX → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim</p>', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'DOP: Director of Photography. Call Sheet: cronograma detalhado do dia de gravação. Offline Edit: montagem sem finalização de cor/som. Title Card: tela com texto e logotipo. Storyboard: sequência visual de cenas do roteiro.', '<p>DOP: Director of Photography. Call Sheet: cronograma detalhado do dia de gravação. Offline Edit: montagem sem finalização de cor/som. Title Card: tela com texto e logotipo. Storyboard: sequência visual de cenas do roteiro.</p>', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 19, 'step');

  -- ── TBO-AV-003: Vídeo Institucional ──
END $$;