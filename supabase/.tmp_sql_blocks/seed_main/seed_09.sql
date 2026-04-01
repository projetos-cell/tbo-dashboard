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
    'Teaser de Lançamento',
    'tbo-av-001-teaser-de-lancamento',
    'audiovisual',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Teaser de Lançamento

Código

TBO-AV-001

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

Produzir um vídeo teaser de até 60 segundos para disparar campanha de expectativa de lançamento imobiliário, gerando curiosidade e captura de leads qualificados antes da divulgação oficial.

  2. Escopo

2.1 O que está coberto

Conceituação, roteiro, captação, edição, finalização e entrega do teaser para uso em mídias digitais (Instagram, YouTube, landing page).

2.2 Exclusões

Produção de material gráfico estático, impulsionamento pago de mídia, criação de landing page e captação fotográfica.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Diretor Criativo — conceito, roteiro e aprovação final

Aprovador

—

Equipe AV

Captação, edição e finalização

Executor

—

Cliente / Incorporadora

Briefing, aprovações intermediárias e assets

Consultado

Informado

Carol (Ops)

Abertura de projeto, prazo e entrega

Informado

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Briefing aprovado do lançamento; moodboard de referências visuais; nome do empreendimento e conceito criativo; assets da incorporadora (logo, paleta, perspectivas ou renders parciais).

4.2 Ferramentas e Acessos

Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve (grading), câmeras cinema (Sony FX6 / BMPCC 6K), gimbal, drone (quando aplicável), Adobe Audition, frame.io para revisões.



  5. Procedimento Passo a Passo

5.1. Briefing e Conceituação

Ação: Receber briefing do cliente, alinhar com Marco o conceito criativo central, definir tom (misterioso, aspiracional, emocional) e redigir roteiro + decupagem de cenas.

Responsável: Marco Andolfato + Cliente

Output: Roteiro aprovado e decupagem de cenas

Prazo referência: Dia 1–2

5.2. Pré-produção

Ação: Definir locações ou renders a usar, contratar atores/figurantes se necessário, montar lista de equipamentos, agendar captação e obter autorizações de locação.

Responsável: Equipe AV + Carol (Ops)

Output: Call sheet finalizado

Prazo referência: Dia 3–4

5.3. Captação

Ação: Executar as gravações conforme decupagem: cenas ambiente, product shots de maquete/renders, depoimentos (se houver), cobertura aérea com drone.

Responsável: Equipe AV

Output: Rushes brutos organizados por cena no servidor

Prazo referência: Dia 5

5.4. Edição e Motion

Ação: Montar corte inicial no Premiere, criar motion graphics e animação de logo no After Effects, inserir trilha licenciada e sound design.

Responsável: Equipe AV

Output: Cut v1 exportado para revisão no frame.io

Prazo referência: Dia 6–8

5.5. Revisão e Aprovação

Ação: Enviar v1 ao cliente via frame.io; consolidar feedback; aplicar até duas rodadas de ajuste; submeter para aprovação final de Marco.

Responsável: Marco Andolfato + Cliente

Output: Arquivo aprovado

Prazo referência: Dia 9–11

5.6. Color Grading e Masterização

Ação: Realizar color grading final no DaVinci Resolve seguindo guia de cor do empreendimento; masterizar áudio; exportar versões em H.264 (Instagram/Web) e ProRes 4444 (broadcast).

Responsável: Equipe AV

Output: Arquivos finais em todos os formatos

Prazo referência: Dia 12

5.7. Entrega e Arquivamento

Ação: Enviar pacote de entrega ao cliente (Google Drive estruturado); arquivar projeto completo (raw + projeto editado) no servidor TBO; fechar tarefa no Asana.

Responsável: Carol (Ops) + Equipe AV

Output: Entrega confirmada, projeto arquivado

Prazo referência: Dia 13

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Roteiro aprovado antes da captação; [ ] Rushes organizados por cena; [ ] Cut v1 revisado internamente antes de enviar ao cliente; [ ] Legenda e grafismos conferidos ortograficamente; [ ] Versões exportadas em todos os formatos solicitados; [ ] Arquivo raw mantido no servidor por mínimo 12 meses.

6.2 Erros Comuns a Evitar

Captação sem decupagem → retrabalho em campo. Envio de cut sem revisão interna → feedback excessivo do cliente. Exportação em formato errado → rejeição pela plataforma. Uso de trilha sem licença → risco jurídico.

  7. Ferramentas e Templates

Adobe Premiere Pro, After Effects, DaVinci Resolve, Adobe Audition, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.

  8. SLAs e Prazos

Entrega de cut v1 ao cliente: até 8 dias úteis após briefing aprovado. Resposta a feedback: 24h. Entrega final: até 13 dias úteis. Rodadas de revisão inclusas: 2 (adicionais cobradas à parte).

  9. Fluxograma

Início → Briefing e Conceituação → Aprovação de Roteiro → Pré-produção → Captação → Edição + Motion → Cut v1 (frame.io) → Feedback Cliente → Ajustes (até 2x) → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim

  10. Glossário

Teaser: vídeo curto de expectativa, sem revelar produto final. Decupagem: descrição técnica plano a plano do roteiro. Rushes: material bruto não editado pós-captação. Cut v1: primeiro corte montado para revisão. Grading: processo de correção e estética de cor. ProRes: codec de alta qualidade para broadcast.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Teaser de Lançamento</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir um vídeo teaser de até 60 segundos para disparar campanha de expectativa de lançamento imobiliário, gerando curiosidade e captura de leads qualificados antes da divulgação oficial.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Conceituação, roteiro, captação, edição, finalização e entrega do teaser para uso em mídias digitais (Instagram, YouTube, landing page).</p><p><strong>2.2 Exclusões</strong></p><p>Produção de material gráfico estático, impulsionamento pago de mídia, criação de landing page e captação fotográfica.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Diretor Criativo — conceito, roteiro e aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição e finalização</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Briefing, aprovações intermediárias e assets</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Abertura de projeto, prazo e entrega</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing aprovado do lançamento; moodboard de referências visuais; nome do empreendimento e conceito criativo; assets da incorporadora (logo, paleta, perspectivas ou renders parciais).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve (grading), câmeras cinema (Sony FX6 / BMPCC 6K), gimbal, drone (quando aplicável), Adobe Audition, frame.io para revisões.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing e Conceituação</strong></p><p>Ação: Receber briefing do cliente, alinhar com Marco o conceito criativo central, definir tom (misterioso, aspiracional, emocional) e redigir roteiro + decupagem de cenas.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Roteiro aprovado e decupagem de cenas</p><p>Prazo referência: Dia 1–2</p><p><strong>5.2. Pré-produção</strong></p><p>Ação: Definir locações ou renders a usar, contratar atores/figurantes se necessário, montar lista de equipamentos, agendar captação e obter autorizações de locação.</p><p>Responsável: Equipe AV + Carol (Ops)</p><p>Output: Call sheet finalizado</p><p>Prazo referência: Dia 3–4</p><p><strong>5.3. Captação</strong></p><p>Ação: Executar as gravações conforme decupagem: cenas ambiente, product shots de maquete/renders, depoimentos (se houver), cobertura aérea com drone.</p><p>Responsável: Equipe AV</p><p>Output: Rushes brutos organizados por cena no servidor</p><p>Prazo referência: Dia 5</p><p><strong>5.4. Edição e Motion</strong></p><p>Ação: Montar corte inicial no Premiere, criar motion graphics e animação de logo no After Effects, inserir trilha licenciada e sound design.</p><p>Responsável: Equipe AV</p><p>Output: Cut v1 exportado para revisão no frame.io</p><p>Prazo referência: Dia 6–8</p><p><strong>5.5. Revisão e Aprovação</strong></p><p>Ação: Enviar v1 ao cliente via frame.io; consolidar feedback; aplicar até duas rodadas de ajuste; submeter para aprovação final de Marco.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Arquivo aprovado</p><p>Prazo referência: Dia 9–11</p><p><strong>5.6. Color Grading e Masterização</strong></p><p>Ação: Realizar color grading final no DaVinci Resolve seguindo guia de cor do empreendimento; masterizar áudio; exportar versões em H.264 (Instagram/Web) e ProRes 4444 (broadcast).</p><p>Responsável: Equipe AV</p><p>Output: Arquivos finais em todos os formatos</p><p>Prazo referência: Dia 12</p><p><strong>5.7. Entrega e Arquivamento</strong></p><p>Ação: Enviar pacote de entrega ao cliente (Google Drive estruturado); arquivar projeto completo (raw + projeto editado) no servidor TBO; fechar tarefa no Asana.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Entrega confirmada, projeto arquivado</p><p>Prazo referência: Dia 13</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Roteiro aprovado antes da captação; [ ] Rushes organizados por cena; [ ] Cut v1 revisado internamente antes de enviar ao cliente; [ ] Legenda e grafismos conferidos ortograficamente; [ ] Versões exportadas em todos os formatos solicitados; [ ] Arquivo raw mantido no servidor por mínimo 12 meses.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Captação sem decupagem → retrabalho em campo. Envio de cut sem revisão interna → feedback excessivo do cliente. Exportação em formato errado → rejeição pela plataforma. Uso de trilha sem licença → risco jurídico.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, Adobe Audition, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Entrega de cut v1 ao cliente: até 8 dias úteis após briefing aprovado. Resposta a feedback: 24h. Entrega final: até 13 dias úteis. Rodadas de revisão inclusas: 2 (adicionais cobradas à parte).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing e Conceituação → Aprovação de Roteiro → Pré-produção → Captação → Edição + Motion → Cut v1 (frame.io) → Feedback Cliente → Ajustes (até 2x) → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim</p><p><strong>  10. Glossário</strong></p><p>Teaser: vídeo curto de expectativa, sem revelar produto final. Decupagem: descrição técnica plano a plano do roteiro. Rushes: material bruto não editado pós-captação. Cut v1: primeiro corte montado para revisão. Grading: processo de correção e estética de cor. ProRes: codec de alta qualidade para broadcast.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-AV-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir um vídeo teaser de até 60 segundos para disparar campanha de expectativa de lançamento imobiliário, gerando curiosidade e captura de leads qualificados antes da divulgação oficial.', '<p>Produzir um vídeo teaser de até 60 segundos para disparar campanha de expectativa de lançamento imobiliário, gerando curiosidade e captura de leads qualificados antes da divulgação oficial.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Conceituação, roteiro, captação, edição, finalização e entrega do teaser para uso em mídias digitais (Instagram, YouTube, landing page).', '<p>Conceituação, roteiro, captação, edição, finalização e entrega do teaser para uso em mídias digitais (Instagram, YouTube, landing page).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de material gráfico estático, impulsionamento pago de mídia, criação de landing page e captação fotográfica.', '<p>Produção de material gráfico estático, impulsionamento pago de mídia, criação de landing page e captação fotográfica.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Diretor Criativo — conceito, roteiro e aprovação final

Aprovador

—

Equipe AV

Captação, edição e finalização

Executor

—

Cliente / Incorporadora

Briefing, aprovações intermediárias e assets

Consultado

Informado

Carol (Ops)

Abertura de projeto, prazo e entrega

Informado

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Diretor Criativo — conceito, roteiro e aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição e finalização</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Incorporadora</p></td><td><p>Briefing, aprovações intermediárias e assets</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Abertura de projeto, prazo e entrega</p></td><td><p>Informado</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing aprovado do lançamento; moodboard de referências visuais; nome do empreendimento e conceito criativo; assets da incorporadora (logo, paleta, perspectivas ou renders parciais).', '<p>Briefing aprovado do lançamento; moodboard de referências visuais; nome do empreendimento e conceito criativo; assets da incorporadora (logo, paleta, perspectivas ou renders parciais).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve (grading), câmeras cinema (Sony FX6 / BMPCC 6K), gimbal, drone (quando aplicável), Adobe Audition, frame.io para revisões.', '<p>Adobe Premiere Pro, Adobe After Effects, DaVinci Resolve (grading), câmeras cinema (Sony FX6 / BMPCC 6K), gimbal, drone (quando aplicável), Adobe Audition, frame.io para revisões.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing e Conceituação', 'Ação: Receber briefing do cliente, alinhar com Marco o conceito criativo central, definir tom (misterioso, aspiracional, emocional) e redigir roteiro + decupagem de cenas.

Responsável: Marco Andolfato + Cliente

Output: Roteiro aprovado e decupagem de cenas

Prazo referência: Dia 1–2', '<p>Ação: Receber briefing do cliente, alinhar com Marco o conceito criativo central, definir tom (misterioso, aspiracional, emocional) e redigir roteiro + decupagem de cenas.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Roteiro aprovado e decupagem de cenas</p><p>Prazo referência: Dia 1–2</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Pré-produção', 'Ação: Definir locações ou renders a usar, contratar atores/figurantes se necessário, montar lista de equipamentos, agendar captação e obter autorizações de locação.

Responsável: Equipe AV + Carol (Ops)

Output: Call sheet finalizado

Prazo referência: Dia 3–4', '<p>Ação: Definir locações ou renders a usar, contratar atores/figurantes se necessário, montar lista de equipamentos, agendar captação e obter autorizações de locação.</p><p>Responsável: Equipe AV + Carol (Ops)</p><p>Output: Call sheet finalizado</p><p>Prazo referência: Dia 3–4</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Captação', 'Ação: Executar as gravações conforme decupagem: cenas ambiente, product shots de maquete/renders, depoimentos (se houver), cobertura aérea com drone.

Responsável: Equipe AV

Output: Rushes brutos organizados por cena no servidor

Prazo referência: Dia 5', '<p>Ação: Executar as gravações conforme decupagem: cenas ambiente, product shots de maquete/renders, depoimentos (se houver), cobertura aérea com drone.</p><p>Responsável: Equipe AV</p><p>Output: Rushes brutos organizados por cena no servidor</p><p>Prazo referência: Dia 5</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Edição e Motion', 'Ação: Montar corte inicial no Premiere, criar motion graphics e animação de logo no After Effects, inserir trilha licenciada e sound design.

Responsável: Equipe AV

Output: Cut v1 exportado para revisão no frame.io

Prazo referência: Dia 6–8', '<p>Ação: Montar corte inicial no Premiere, criar motion graphics e animação de logo no After Effects, inserir trilha licenciada e sound design.</p><p>Responsável: Equipe AV</p><p>Output: Cut v1 exportado para revisão no frame.io</p><p>Prazo referência: Dia 6–8</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Revisão e Aprovação', 'Ação: Enviar v1 ao cliente via frame.io; consolidar feedback; aplicar até duas rodadas de ajuste; submeter para aprovação final de Marco.

Responsável: Marco Andolfato + Cliente

Output: Arquivo aprovado

Prazo referência: Dia 9–11', '<p>Ação: Enviar v1 ao cliente via frame.io; consolidar feedback; aplicar até duas rodadas de ajuste; submeter para aprovação final de Marco.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Arquivo aprovado</p><p>Prazo referência: Dia 9–11</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Color Grading e Masterização', 'Ação: Realizar color grading final no DaVinci Resolve seguindo guia de cor do empreendimento; masterizar áudio; exportar versões em H.264 (Instagram/Web) e ProRes 4444 (broadcast).

Responsável: Equipe AV

Output: Arquivos finais em todos os formatos

Prazo referência: Dia 12', '<p>Ação: Realizar color grading final no DaVinci Resolve seguindo guia de cor do empreendimento; masterizar áudio; exportar versões em H.264 (Instagram/Web) e ProRes 4444 (broadcast).</p><p>Responsável: Equipe AV</p><p>Output: Arquivos finais em todos os formatos</p><p>Prazo referência: Dia 12</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.7. Entrega e Arquivamento', 'Ação: Enviar pacote de entrega ao cliente (Google Drive estruturado); arquivar projeto completo (raw + projeto editado) no servidor TBO; fechar tarefa no Asana.

Responsável: Carol (Ops) + Equipe AV

Output: Entrega confirmada, projeto arquivado

Prazo referência: Dia 13', '<p>Ação: Enviar pacote de entrega ao cliente (Google Drive estruturado); arquivar projeto completo (raw + projeto editado) no servidor TBO; fechar tarefa no Asana.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Entrega confirmada, projeto arquivado</p><p>Prazo referência: Dia 13</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Roteiro aprovado antes da captação; [ ] Rushes organizados por cena; [ ] Cut v1 revisado internamente antes de enviar ao cliente; [ ] Legenda e grafismos conferidos ortograficamente; [ ] Versões exportadas em todos os formatos solicitados; [ ] Arquivo raw mantido no servidor por mínimo 12 meses.', '<p>[ ] Roteiro aprovado antes da captação; [ ] Rushes organizados por cena; [ ] Cut v1 revisado internamente antes de enviar ao cliente; [ ] Legenda e grafismos conferidos ortograficamente; [ ] Versões exportadas em todos os formatos solicitados; [ ] Arquivo raw mantido no servidor por mínimo 12 meses.</p>', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Captação sem decupagem → retrabalho em campo. Envio de cut sem revisão interna → feedback excessivo do cliente. Exportação em formato errado → rejeição pela plataforma. Uso de trilha sem licença → risco jurídico.', '<p>Captação sem decupagem → retrabalho em campo. Envio de cut sem revisão interna → feedback excessivo do cliente. Exportação em formato errado → rejeição pela plataforma. Uso de trilha sem licença → risco jurídico.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, Adobe Audition, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, Adobe Audition, frame.io, Sony FX6 / BMPCC 6K, DJI Drone, Asana, Google Drive.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Entrega de cut v1 ao cliente: até 8 dias úteis após briefing aprovado. Resposta a feedback: 24h. Entrega final: até 13 dias úteis. Rodadas de revisão inclusas: 2 (adicionais cobradas à parte).', '<p>Entrega de cut v1 ao cliente: até 8 dias úteis após briefing aprovado. Resposta a feedback: 24h. Entrega final: até 13 dias úteis. Rodadas de revisão inclusas: 2 (adicionais cobradas à parte).</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing e Conceituação → Aprovação de Roteiro → Pré-produção → Captação → Edição + Motion → Cut v1 (frame.io) → Feedback Cliente → Ajustes (até 2x) → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim', '<p>Início → Briefing e Conceituação → Aprovação de Roteiro → Pré-produção → Captação → Edição + Motion → Cut v1 (frame.io) → Feedback Cliente → Ajustes (até 2x) → Aprovação Final → Color Grading + Masterização → Exportação Multi-formato → Entrega + Arquivamento → Fim</p>', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Teaser: vídeo curto de expectativa, sem revelar produto final. Decupagem: descrição técnica plano a plano do roteiro. Rushes: material bruto não editado pós-captação. Cut v1: primeiro corte montado para revisão. Grading: processo de correção e estética de cor. ProRes: codec de alta qualidade para broadcast.', '<p>Teaser: vídeo curto de expectativa, sem revelar produto final. Decupagem: descrição técnica plano a plano do roteiro. Rushes: material bruto não editado pós-captação. Cut v1: primeiro corte montado para revisão. Grading: processo de correção e estética de cor. ProRes: codec de alta qualidade para broadcast.</p>', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 19, 'step');

  -- ── TBO-AV-002: Filme de Lançamento ──
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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Vídeo Institucional',
    'tbo-av-003-video-institucional',
    'audiovisual',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Vídeo Institucional

Código

TBO-AV-003

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

Produzir vídeo institucional da incorporadora ou construtora (2–3 minutos) comunicando história, valores, diferenciais de mercado e cultura de entrega para uso em site, eventos e prospecção B2B.

  2. Escopo

2.1 O que está coberto

Roteiro, captação de depoimentos e ambientes corporativos, edição, motion graphics, trilha e entrega em formatos web e apresentação.

2.2 Exclusões

Filmes de produto ou empreendimentos específicos (SOP AV-04), materiais de campanha de lançamento (SOP AV-02).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa e roteiro

Aprovador

—

Equipe AV

Captação, edição e finalização

Executor

—

Cliente / Diretoria

Aprovação de roteiro, depoimentos, revisões

Consultado

Informado

Carol (Ops)

Logística de captação e entrega

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Briefing institucional do cliente; lista de porta-vozes/depoentes; tour pelo espaço físico da empresa; materiais de identidade visual (logo, brandbook); lista de projetos entregues para referência.

4.2 Ferramentas e Acessos

Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, equipamento de iluminação para interior, lavalier wireless, frame.io.



  5. Procedimento Passo a Passo

5.1. Briefing e Definição de Narrativa

Ação: Reunião com cliente para mapear a história da empresa, valores centrais, público-alvo do vídeo e tom desejado (confiança, inovação, tradição). Marco define linha narrativa e estrutura do roteiro.

Responsável: Marco Andolfato + Cliente

Output: Narrativa e estrutura aprovadas

Prazo referência: Dia 1–2

5.2. Roteiro e Perguntas para Depoimentos

Ação: Escrever roteiro completo com narração em off e/ou falas dos depoentes; preparar roteiro de perguntas guiadas para cada entrevistado; validar com cliente.

Responsável: Marco Andolfato

Output: Roteiro e perguntas aprovados

Prazo referência: Dia 3–4

5.3. Pré-produção e Agendamento

Ação: Agendar captação de depoimentos com cada porta-voz, definir ambientes a filmar (escritório, obras entregues, canteiro), montar lista de equipamentos e call sheet.

Responsável: Carol (Ops)

Output: Call sheet e agendamentos confirmados

Prazo referência: Dia 5–6

5.4. Captação

Ação: Filmar depoimentos com iluminação profissional e som lavalier; captar ambientes institucionais (sede, equipe em trabalho, empreendimentos entregues); cobertura aérea se pertinente.

Responsável: Equipe AV

Output: Rushes organizados e backup realizado

Prazo referência: Dia 7–8

5.5. Edição e Motion

Ação: Montar narrativa intercalando depoimentos e B-roll; inserir motion graphics corporativos (dados, logotipo animado, números de projetos); trilha emocional de fundo.

Responsável: Equipe AV

Output: Cut v1 no frame.io

Prazo referência: Dia 9–12

5.6. Revisão, Grading e Entrega

Ação: Aplicar feedback do cliente (até 2 rodadas); color grading no DaVinci; masterização de áudio; exportar versões web (H.264), apresentação (ProRes) e LinkedIn; entregar no Google Drive.

Responsável: Equipe AV + Carol (Ops)

Output: Arquivos finais entregues e projeto arquivado

Prazo referência: Dia 13–16

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Roteiro aprovado antes de gravar; [ ] Som lavalier testado antes de cada entrevista; [ ] Depoentes informados sobre duração e formato antes da captação; [ ] Nenhuma informação sensível da empresa incluída sem aprovação; [ ] Versões exportadas em todos os formatos acordados.

6.2 Erros Comuns a Evitar

Depoente sem preparação → respostas longas e sem foco, necessidade de refilmagem. Iluminação de interior inadequada → imagem inaproveitável. Enviar cut com erros ortográficos em motion → constrangimento com o cliente.

  7. Ferramentas e Templates

Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, lavalier wireless, frame.io, Asana, Google Drive.

  8. SLAs e Prazos

Entrega de roteiro: 4 dias úteis. Cut v1: 5 dias após captação. Entrega final: 16 dias úteis pós-briefing. Revisões inclusas: 2.

  9. Fluxograma

Início → Briefing e Narrativa → Roteiro Aprovado → Pré-produção → Captação (depoimentos + ambientes) → Edição + Motion → Cut v1 (frame.io) → Feedback (até 2x) → Color Grading → Masterização → Exportação → Entrega → Fim

  10. Glossário

B-roll: imagens de apoio complementares aos depoimentos. Lavalier: microfone de lapela. Narração em off: voz do narrador sem aparecer na tela. Motion graphic corporativo: animação de dados e identidade visual.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Vídeo Institucional</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir vídeo institucional da incorporadora ou construtora (2–3 minutos) comunicando história, valores, diferenciais de mercado e cultura de entrega para uso em site, eventos e prospecção B2B.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Roteiro, captação de depoimentos e ambientes corporativos, edição, motion graphics, trilha e entrega em formatos web e apresentação.</p><p><strong>2.2 Exclusões</strong></p><p>Filmes de produto ou empreendimentos específicos (SOP AV-04), materiais de campanha de lançamento (SOP AV-02).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa e roteiro</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição e finalização</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Diretoria</p></td><td><p>Aprovação de roteiro, depoimentos, revisões</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Logística de captação e entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing institucional do cliente; lista de porta-vozes/depoentes; tour pelo espaço físico da empresa; materiais de identidade visual (logo, brandbook); lista de projetos entregues para referência.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, equipamento de iluminação para interior, lavalier wireless, frame.io.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing e Definição de Narrativa</strong></p><p>Ação: Reunião com cliente para mapear a história da empresa, valores centrais, público-alvo do vídeo e tom desejado (confiança, inovação, tradição). Marco define linha narrativa e estrutura do roteiro.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Narrativa e estrutura aprovadas</p><p>Prazo referência: Dia 1–2</p><p><strong>5.2. Roteiro e Perguntas para Depoimentos</strong></p><p>Ação: Escrever roteiro completo com narração em off e/ou falas dos depoentes; preparar roteiro de perguntas guiadas para cada entrevistado; validar com cliente.</p><p>Responsável: Marco Andolfato</p><p>Output: Roteiro e perguntas aprovados</p><p>Prazo referência: Dia 3–4</p><p><strong>5.3. Pré-produção e Agendamento</strong></p><p>Ação: Agendar captação de depoimentos com cada porta-voz, definir ambientes a filmar (escritório, obras entregues, canteiro), montar lista de equipamentos e call sheet.</p><p>Responsável: Carol (Ops)</p><p>Output: Call sheet e agendamentos confirmados</p><p>Prazo referência: Dia 5–6</p><p><strong>5.4. Captação</strong></p><p>Ação: Filmar depoimentos com iluminação profissional e som lavalier; captar ambientes institucionais (sede, equipe em trabalho, empreendimentos entregues); cobertura aérea se pertinente.</p><p>Responsável: Equipe AV</p><p>Output: Rushes organizados e backup realizado</p><p>Prazo referência: Dia 7–8</p><p><strong>5.5. Edição e Motion</strong></p><p>Ação: Montar narrativa intercalando depoimentos e B-roll; inserir motion graphics corporativos (dados, logotipo animado, números de projetos); trilha emocional de fundo.</p><p>Responsável: Equipe AV</p><p>Output: Cut v1 no frame.io</p><p>Prazo referência: Dia 9–12</p><p><strong>5.6. Revisão, Grading e Entrega</strong></p><p>Ação: Aplicar feedback do cliente (até 2 rodadas); color grading no DaVinci; masterização de áudio; exportar versões web (H.264), apresentação (ProRes) e LinkedIn; entregar no Google Drive.</p><p>Responsável: Equipe AV + Carol (Ops)</p><p>Output: Arquivos finais entregues e projeto arquivado</p><p>Prazo referência: Dia 13–16</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Roteiro aprovado antes de gravar; [ ] Som lavalier testado antes de cada entrevista; [ ] Depoentes informados sobre duração e formato antes da captação; [ ] Nenhuma informação sensível da empresa incluída sem aprovação; [ ] Versões exportadas em todos os formatos acordados.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Depoente sem preparação → respostas longas e sem foco, necessidade de refilmagem. Iluminação de interior inadequada → imagem inaproveitável. Enviar cut com erros ortográficos em motion → constrangimento com o cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, lavalier wireless, frame.io, Asana, Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Entrega de roteiro: 4 dias úteis. Cut v1: 5 dias após captação. Entrega final: 16 dias úteis pós-briefing. Revisões inclusas: 2.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing e Narrativa → Roteiro Aprovado → Pré-produção → Captação (depoimentos + ambientes) → Edição + Motion → Cut v1 (frame.io) → Feedback (até 2x) → Color Grading → Masterização → Exportação → Entrega → Fim</p><p><strong>  10. Glossário</strong></p><p>B-roll: imagens de apoio complementares aos depoimentos. Lavalier: microfone de lapela. Narração em off: voz do narrador sem aparecer na tela. Motion graphic corporativo: animação de dados e identidade visual.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-AV-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir vídeo institucional da incorporadora ou construtora (2–3 minutos) comunicando história, valores, diferenciais de mercado e cultura de entrega para uso em site, eventos e prospecção B2B.', '<p>Produzir vídeo institucional da incorporadora ou construtora (2–3 minutos) comunicando história, valores, diferenciais de mercado e cultura de entrega para uso em site, eventos e prospecção B2B.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Roteiro, captação de depoimentos e ambientes corporativos, edição, motion graphics, trilha e entrega em formatos web e apresentação.', '<p>Roteiro, captação de depoimentos e ambientes corporativos, edição, motion graphics, trilha e entrega em formatos web e apresentação.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Filmes de produto ou empreendimentos específicos (SOP AV-04), materiais de campanha de lançamento (SOP AV-02).', '<p>Filmes de produto ou empreendimentos específicos (SOP AV-04), materiais de campanha de lançamento (SOP AV-02).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção criativa e roteiro

Aprovador

—

Equipe AV

Captação, edição e finalização

Executor

—

Cliente / Diretoria

Aprovação de roteiro, depoimentos, revisões

Consultado

Informado

Carol (Ops)

Logística de captação e entrega

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção criativa e roteiro</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição e finalização</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Cliente / Diretoria</p></td><td><p>Aprovação de roteiro, depoimentos, revisões</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Logística de captação e entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing institucional do cliente; lista de porta-vozes/depoentes; tour pelo espaço físico da empresa; materiais de identidade visual (logo, brandbook); lista de projetos entregues para referência.', '<p>Briefing institucional do cliente; lista de porta-vozes/depoentes; tour pelo espaço físico da empresa; materiais de identidade visual (logo, brandbook); lista de projetos entregues para referência.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, equipamento de iluminação para interior, lavalier wireless, frame.io.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, equipamento de iluminação para interior, lavalier wireless, frame.io.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing e Definição de Narrativa', 'Ação: Reunião com cliente para mapear a história da empresa, valores centrais, público-alvo do vídeo e tom desejado (confiança, inovação, tradição). Marco define linha narrativa e estrutura do roteiro.

Responsável: Marco Andolfato + Cliente

Output: Narrativa e estrutura aprovadas

Prazo referência: Dia 1–2', '<p>Ação: Reunião com cliente para mapear a história da empresa, valores centrais, público-alvo do vídeo e tom desejado (confiança, inovação, tradição). Marco define linha narrativa e estrutura do roteiro.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Narrativa e estrutura aprovadas</p><p>Prazo referência: Dia 1–2</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Roteiro e Perguntas para Depoimentos', 'Ação: Escrever roteiro completo com narração em off e/ou falas dos depoentes; preparar roteiro de perguntas guiadas para cada entrevistado; validar com cliente.

Responsável: Marco Andolfato

Output: Roteiro e perguntas aprovados

Prazo referência: Dia 3–4', '<p>Ação: Escrever roteiro completo com narração em off e/ou falas dos depoentes; preparar roteiro de perguntas guiadas para cada entrevistado; validar com cliente.</p><p>Responsável: Marco Andolfato</p><p>Output: Roteiro e perguntas aprovados</p><p>Prazo referência: Dia 3–4</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Pré-produção e Agendamento', 'Ação: Agendar captação de depoimentos com cada porta-voz, definir ambientes a filmar (escritório, obras entregues, canteiro), montar lista de equipamentos e call sheet.

Responsável: Carol (Ops)

Output: Call sheet e agendamentos confirmados

Prazo referência: Dia 5–6', '<p>Ação: Agendar captação de depoimentos com cada porta-voz, definir ambientes a filmar (escritório, obras entregues, canteiro), montar lista de equipamentos e call sheet.</p><p>Responsável: Carol (Ops)</p><p>Output: Call sheet e agendamentos confirmados</p><p>Prazo referência: Dia 5–6</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Captação', 'Ação: Filmar depoimentos com iluminação profissional e som lavalier; captar ambientes institucionais (sede, equipe em trabalho, empreendimentos entregues); cobertura aérea se pertinente.

Responsável: Equipe AV

Output: Rushes organizados e backup realizado

Prazo referência: Dia 7–8', '<p>Ação: Filmar depoimentos com iluminação profissional e som lavalier; captar ambientes institucionais (sede, equipe em trabalho, empreendimentos entregues); cobertura aérea se pertinente.</p><p>Responsável: Equipe AV</p><p>Output: Rushes organizados e backup realizado</p><p>Prazo referência: Dia 7–8</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Edição e Motion', 'Ação: Montar narrativa intercalando depoimentos e B-roll; inserir motion graphics corporativos (dados, logotipo animado, números de projetos); trilha emocional de fundo.

Responsável: Equipe AV

Output: Cut v1 no frame.io

Prazo referência: Dia 9–12', '<p>Ação: Montar narrativa intercalando depoimentos e B-roll; inserir motion graphics corporativos (dados, logotipo animado, números de projetos); trilha emocional de fundo.</p><p>Responsável: Equipe AV</p><p>Output: Cut v1 no frame.io</p><p>Prazo referência: Dia 9–12</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Revisão, Grading e Entrega', 'Ação: Aplicar feedback do cliente (até 2 rodadas); color grading no DaVinci; masterização de áudio; exportar versões web (H.264), apresentação (ProRes) e LinkedIn; entregar no Google Drive.

Responsável: Equipe AV + Carol (Ops)

Output: Arquivos finais entregues e projeto arquivado

Prazo referência: Dia 13–16', '<p>Ação: Aplicar feedback do cliente (até 2 rodadas); color grading no DaVinci; masterização de áudio; exportar versões web (H.264), apresentação (ProRes) e LinkedIn; entregar no Google Drive.</p><p>Responsável: Equipe AV + Carol (Ops)</p><p>Output: Arquivos finais entregues e projeto arquivado</p><p>Prazo referência: Dia 13–16</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Roteiro aprovado antes de gravar; [ ] Som lavalier testado antes de cada entrevista; [ ] Depoentes informados sobre duração e formato antes da captação; [ ] Nenhuma informação sensível da empresa incluída sem aprovação; [ ] Versões exportadas em todos os formatos acordados.', '<p>[ ] Roteiro aprovado antes de gravar; [ ] Som lavalier testado antes de cada entrevista; [ ] Depoentes informados sobre duração e formato antes da captação; [ ] Nenhuma informação sensível da empresa incluída sem aprovação; [ ] Versões exportadas em todos os formatos acordados.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Depoente sem preparação → respostas longas e sem foco, necessidade de refilmagem. Iluminação de interior inadequada → imagem inaproveitável. Enviar cut com erros ortográficos em motion → constrangimento com o cliente.', '<p>Depoente sem preparação → respostas longas e sem foco, necessidade de refilmagem. Iluminação de interior inadequada → imagem inaproveitável. Enviar cut com erros ortográficos em motion → constrangimento com o cliente.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, lavalier wireless, frame.io, Asana, Google Drive.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema, lavalier wireless, frame.io, Asana, Google Drive.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Entrega de roteiro: 4 dias úteis. Cut v1: 5 dias após captação. Entrega final: 16 dias úteis pós-briefing. Revisões inclusas: 2.', '<p>Entrega de roteiro: 4 dias úteis. Cut v1: 5 dias após captação. Entrega final: 16 dias úteis pós-briefing. Revisões inclusas: 2.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing e Narrativa → Roteiro Aprovado → Pré-produção → Captação (depoimentos + ambientes) → Edição + Motion → Cut v1 (frame.io) → Feedback (até 2x) → Color Grading → Masterização → Exportação → Entrega → Fim', '<p>Início → Briefing e Narrativa → Roteiro Aprovado → Pré-produção → Captação (depoimentos + ambientes) → Edição + Motion → Cut v1 (frame.io) → Feedback (até 2x) → Color Grading → Masterização → Exportação → Entrega → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'B-roll: imagens de apoio complementares aos depoimentos. Lavalier: microfone de lapela. Narração em off: voz do narrador sem aparecer na tela. Motion graphic corporativo: animação de dados e identidade visual.', '<p>B-roll: imagens de apoio complementares aos depoimentos. Lavalier: microfone de lapela. Narração em off: voz do narrador sem aparecer na tela. Motion graphic corporativo: animação de dados e identidade visual.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-AV-004: Filme de Produto Empreendimento ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Filme de Produto Empreendimento',
    'tbo-av-004-filme-de-produto-empreendimento',
    'audiovisual',
    'checklist',
    'Filme de Produto (Empreendimento)',
    'Standard Operating Procedure

Filme de Produto (Empreendimento)

Código

TBO-AV-004

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

Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.

  2. Escopo

2.1 O que está coberto

Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.

2.2 Exclusões

Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção e aprovação final

Aprovador

—

Equipe AV

Captação, edição, motion

Executor

—

Arquiteto / Incorporadora

Informações técnicas do produto

Consultado

Informado

Carol (Ops)

Agendamento de decorado, entrega

Executor

—

  4. Pré-requisitos

4.1 Inputs necessários

Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.

4.2 Ferramentas e Acessos

Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.



  5. Procedimento Passo a Passo

5.1. Briefing de Produto

Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.

Responsável: Marco Andolfato + Cliente

Output: Lista de cenas e ângulos prioritários aprovada

Prazo referência: Dia 1–2

5.2. Pré-produção e Logística

Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.

Responsável: Carol (Ops) + Equipe AV

Output: Call sheet e agendamento confirmados

Prazo referência: Dia 3

5.3. Captação de Ambientes

Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.

Responsável: Equipe AV

Output: Rushes completos, backup no servidor

Prazo referência: Dia 4

5.4. Integração de Renders e Plantas

Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.

Responsável: Equipe AV

Output: Sequência de renders e planta animada

Prazo referência: Dia 5–6

5.5. Edição, Revisão e Entrega

Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.

Responsável: Equipe AV + Marco + Carol (Ops)

Output: Arquivos finais entregues no Google Drive

Prazo referência: Dia 7–12

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.

6.2 Erros Comuns a Evitar

Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.

  7. Ferramentas e Templates

Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.

  8. SLAs e Prazos

Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.

  9. Fluxograma

Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim

  10. Glossário

Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Filme de Produto (Empreendimento)</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-AV-004</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Audiovisual</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.</p><p><strong>2.2 Exclusões</strong></p><p>Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção e aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição, motion</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Informações técnicas do produto</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Agendamento de decorado, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing de Produto</strong></p><p>Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Lista de cenas e ângulos prioritários aprovada</p><p>Prazo referência: Dia 1–2</p><p><strong>5.2. Pré-produção e Logística</strong></p><p>Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Call sheet e agendamento confirmados</p><p>Prazo referência: Dia 3</p><p><strong>5.3. Captação de Ambientes</strong></p><p>Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.</p><p>Responsável: Equipe AV</p><p>Output: Rushes completos, backup no servidor</p><p>Prazo referência: Dia 4</p><p><strong>5.4. Integração de Renders e Plantas</strong></p><p>Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.</p><p>Responsável: Equipe AV</p><p>Output: Sequência de renders e planta animada</p><p>Prazo referência: Dia 5–6</p><p><strong>5.5. Edição, Revisão e Entrega</strong></p><p>Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.</p><p>Responsável: Equipe AV + Marco + Carol (Ops)</p><p>Output: Arquivos finais entregues no Google Drive</p><p>Prazo referência: Dia 7–12</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim</p><p><strong>  10. Glossário</strong></p><p>Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['video','filme','audiovisual','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-AV-004
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.', '<p>Produzir vídeo específico de um empreendimento imobiliário (apartamento, casa, lote) com foco em diferenciais arquitetônicos, planta, acabamentos e lifestyle, para uso em stand de vendas e plataformas digitais.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.', '<p>Captação de ambientes decorados, maquete física ou digital, renders em movimento, depoimento de arquiteto/incorporador (opcional), edição e entrega.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).', '<p>Filme de lançamento com campanha completa (SOP AV-02), fotos do produto (demanda separada), visita virtual 360° (demanda de Gamificação).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Marco Andolfato

Direção e aprovação final

Aprovador

—

Equipe AV

Captação, edição, motion

Executor

—

Arquiteto / Incorporadora

Informações técnicas do produto

Consultado

Informado

Carol (Ops)

Agendamento de decorado, entrega

Executor

—', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Direção e aprovação final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Equipe AV</p></td><td><p>Captação, edição, motion</p></td><td><p>Executor</p></td><td><p>—</p></td></tr><tr><td><p>Arquiteto / Incorporadora</p></td><td><p>Informações técnicas do produto</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Carol (Ops)</p></td><td><p>Agendamento de decorado, entrega</p></td><td><p>Executor</p></td><td><p>—</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.', '<p>Briefing do produto; plantas e memorial descritivo; acesso ao decorado ou renders finais em 4K; identidade visual do empreendimento; lista de diferenciais técnicos e de design.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmeras cinema + lentes grande angular, steady/gimbal para ambientes internos, drone (áreas externas), frame.io.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing de Produto', 'Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.

Responsável: Marco Andolfato + Cliente

Output: Lista de cenas e ângulos prioritários aprovada

Prazo referência: Dia 1–2', '<p>Ação: Receber briefing técnico do produto; visitar decorado ou revisar renders; definir com Marco os ângulos e cenas prioritárias para comunicar os diferenciais.</p><p>Responsável: Marco Andolfato + Cliente</p><p>Output: Lista de cenas e ângulos prioritários aprovada</p><p>Prazo referência: Dia 1–2</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Pré-produção e Logística', 'Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.

Responsável: Carol (Ops) + Equipe AV

Output: Call sheet e agendamento confirmados

Prazo referência: Dia 3', '<p>Ação: Agendar acesso ao decorado; montar lista de equipamentos para interiores (iluminação, gran-angular, gimbal); definir horário de melhor luz natural.</p><p>Responsável: Carol (Ops) + Equipe AV</p><p>Output: Call sheet e agendamento confirmados</p><p>Prazo referência: Dia 3</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Captação de Ambientes', 'Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.

Responsável: Equipe AV

Output: Rushes completos, backup no servidor

Prazo referência: Dia 4', '<p>Ação: Filmar todos os ambientes do decorado com movimentos de câmera fluidos (gimbal); captar área de lazer, fachada e entorno com drone; registrar detalhes de acabamento em close.</p><p>Responsável: Equipe AV</p><p>Output: Rushes completos, backup no servidor</p><p>Prazo referência: Dia 4</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Integração de Renders e Plantas', 'Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.

Responsável: Equipe AV

Output: Sequência de renders e planta animada

Prazo referência: Dia 5–6', '<p>Ação: Integrar renders 3D do empreendimento ao corte no After Effects; animar planta baixa com destaques dos ambientes; inserir cards de texto com metragens e especificações.</p><p>Responsável: Equipe AV</p><p>Output: Sequência de renders e planta animada</p><p>Prazo referência: Dia 5–6</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Edição, Revisão e Entrega', 'Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.

Responsável: Equipe AV + Marco + Carol (Ops)

Output: Arquivos finais entregues no Google Drive

Prazo referência: Dia 7–12', '<p>Ação: Montar corte completo; trilha emocional; inserir logo e informações do produto; enviar cut v1 ao cliente; aplicar até 2 rodadas de ajuste; color grading; exportar e entregar.</p><p>Responsável: Equipe AV + Marco + Carol (Ops)</p><p>Output: Arquivos finais entregues no Google Drive</p><p>Prazo referência: Dia 7–12</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.', '<p>[ ] Acesso ao decorado confirmado com antecedência; [ ] Todos os ambientes listados no briefing filmados; [ ] Renders recebidos em resolução mínima 4K; [ ] Cards de texto com dados conferidos pelo cliente; [ ] Todas as versões (web, stand, redes) exportadas.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.', '<p>Decorado com móveis fora do lugar → imagem não representativa do produto. Renders em baixa resolução → qualidade visivelmente inferior. Informações técnicas incorretas nos cards → problema jurídico/comercial.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.', '<p>Adobe Premiere Pro, After Effects, DaVinci Resolve, câmera cinema, gimbal, drone, frame.io, Google Drive, Asana.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.', '<p>Cut v1: 6 dias úteis após captação. Entrega final: 12 dias úteis pós-início. Revisões inclusas: 2.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim', '<p>Início → Briefing de Produto → Pré-produção → Captação de Ambientes → Integração de Renders + Plantas → Edição + Motion → Cut v1 → Feedback (até 2x) → Color Grading → Exportação → Entrega → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.', '<p>Decorado: apartamento/casa montado e decorado para visitação comercial. Memorial descritivo: documento técnico com especificações de acabamento. Gran-angular: lente de campo visual amplo para ambientes internos. Card: sobreposição de texto com informações na tela.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-AV-005: Pílulas Social Conteúdo para Redes Sociais ──
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