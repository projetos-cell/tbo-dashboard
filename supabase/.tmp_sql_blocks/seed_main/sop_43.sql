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
END $$;