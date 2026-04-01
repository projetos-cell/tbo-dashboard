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
END $$;