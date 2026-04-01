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
    'Imagens Estáticas Câmeras e Ângulos',
    'tbo-3d-002-imagens-estaticas-cameras-e-angulos',
    'digital-3d',
    'checklist',
    'Imagens Estáticas — Câmeras e Ângulos',
    'Standard Operating Procedure

Imagens Estáticas — Câmeras e Ângulos

Código

TBO-3D-002

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

Padronizar a definição de câmeras e ângulos para imagens estáticas de empreendimentos imobiliários, garantindo composição fotográfica profissional e alinhamento com o briefing criativo.

  2. Escopo

2.1 O que está coberto

Posicionamento de câmeras, definição de lentes, composição, ângulos padrão por tipo de imagem (fachada, aérea, interna, detalhe).

2.2 Exclusões

Iluminação, render settings e pós-produção são tratados em SOPs separados.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Artista 3D

Posicionamento de câmeras

Marco (Dir. Criativo)

PO do projeto

Marco Andolfato

Aprovação de composição

—

Cliente

  4. Pré-requisitos

4.1 Inputs necessários

Modelo 3D finalizado (SOP TBO-3D-001), briefing criativo com referências visuais, lista de imagens contratadas.

4.2 Ferramentas e Acessos

3ds Max ou SketchUp, V-Ray/Corona Physical Camera, referências fotográficas do briefing.



  5. Procedimento Passo a Passo

5.1. Análise do briefing visual

Ação: Estudar referências visuais, identificar ângulos-chave, mapear imagens contratadas

Responsável: Artista 3D

Output: Lista de câmeras planejadas

Prazo referência: 0,5 dia

5.2. Setup de câmeras

Ação: Posicionar câmeras na cena com lentes adequadas (24mm fachada, 18mm aérea, 28mm interna)

Responsável: Artista 3D

Output: Câmeras posicionadas

Prazo referência: 0,5 dia

5.3. Composição e enquadramento

Ação: Aplicar regra dos terços, linhas de fuga, ponto focal. Gerar previews de baixa resolução.

Responsável: Artista 3D

Output: Previews para aprovação

Prazo referência: 0,5 dia

5.4. Aprovação de ângulos

Ação: Submeter previews para aprovação da direção criativa

Responsável: Marco Andolfato

Output: Ângulos aprovados

Prazo referência: 1 dia

[APROVAÇÃO] Direção criativa aprova composição antes do render final

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Horizonte nivelado. Sem distorção excessiva de lente. Ponto focal claro. Linhas verticais paralelas (correção de perspectiva). Proporção correta do empreendimento. Enquadramento valoriza fachada principal.

6.2 Erros Comuns a Evitar

Lente muito aberta distorcendo proporções. Câmera muito alta (efeito drone não intencional). Composição centralizada sem dinamismo. Falta de contexto urbano no enquadramento.

  7. Ferramentas e Templates

3ds Max/SketchUp, V-Ray Physical Camera, Photoshop (overlay de composição), referências Pinterest/Archdaily.

  8. SLAs e Prazos

Definição de câmeras: 1 dia útil. Aprovação: até 2 dias úteis com revisão. Extensão: nova rodada de ajuste = +0,5 dia.

  9. Fluxograma

Início → Análise de Briefing → Setup de Câmeras → Composição → Preview → [APROVAÇÃO Dir. Criativa] → Aprovado: Seguir para Render → Reprovado: Ajustar câmeras → Fim

  10. Glossário

Lente: distância focal da câmera virtual em mm. Regra dos terços: divisão do frame em 9 partes iguais para composição. Preview: imagem de baixa resolução para validação. Ponto focal: elemento principal de atenção na composição.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Imagens Estáticas — Câmeras e Ângulos</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-002</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Padronizar a definição de câmeras e ângulos para imagens estáticas de empreendimentos imobiliários, garantindo composição fotográfica profissional e alinhamento com o briefing criativo.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Posicionamento de câmeras, definição de lentes, composição, ângulos padrão por tipo de imagem (fachada, aérea, interna, detalhe).</p><p><strong>2.2 Exclusões</strong></p><p>Iluminação, render settings e pós-produção são tratados em SOPs separados.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Artista 3D</p></td><td><p>Posicionamento de câmeras</p></td><td><p>Marco (Dir. Criativo)</p></td><td><p>PO do projeto</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação de composição</p></td><td><p>—</p></td><td><p>Cliente</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Modelo 3D finalizado (SOP TBO-3D-001), briefing criativo com referências visuais, lista de imagens contratadas.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max ou SketchUp, V-Ray/Corona Physical Camera, referências fotográficas do briefing.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Análise do briefing visual</strong></p><p>Ação: Estudar referências visuais, identificar ângulos-chave, mapear imagens contratadas</p><p>Responsável: Artista 3D</p><p>Output: Lista de câmeras planejadas</p><p>Prazo referência: 0,5 dia</p><p><strong>5.2. Setup de câmeras</strong></p><p>Ação: Posicionar câmeras na cena com lentes adequadas (24mm fachada, 18mm aérea, 28mm interna)</p><p>Responsável: Artista 3D</p><p>Output: Câmeras posicionadas</p><p>Prazo referência: 0,5 dia</p><p><strong>5.3. Composição e enquadramento</strong></p><p>Ação: Aplicar regra dos terços, linhas de fuga, ponto focal. Gerar previews de baixa resolução.</p><p>Responsável: Artista 3D</p><p>Output: Previews para aprovação</p><p>Prazo referência: 0,5 dia</p><p><strong>5.4. Aprovação de ângulos</strong></p><p>Ação: Submeter previews para aprovação da direção criativa</p><p>Responsável: Marco Andolfato</p><p>Output: Ângulos aprovados</p><p>Prazo referência: 1 dia</p><p><strong>[APROVAÇÃO] Direção criativa aprova composição antes do render final</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Horizonte nivelado. Sem distorção excessiva de lente. Ponto focal claro. Linhas verticais paralelas (correção de perspectiva). Proporção correta do empreendimento. Enquadramento valoriza fachada principal.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Lente muito aberta distorcendo proporções. Câmera muito alta (efeito drone não intencional). Composição centralizada sem dinamismo. Falta de contexto urbano no enquadramento.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max/SketchUp, V-Ray Physical Camera, Photoshop (overlay de composição), referências Pinterest/Archdaily.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Definição de câmeras: 1 dia útil. Aprovação: até 2 dias úteis com revisão. Extensão: nova rodada de ajuste = +0,5 dia.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Análise de Briefing → Setup de Câmeras → Composição → Preview → [APROVAÇÃO Dir. Criativa] → Aprovado: Seguir para Render → Reprovado: Ajustar câmeras → Fim</p><p><strong>  10. Glossário</strong></p><p>Lente: distância focal da câmera virtual em mm. Regra dos terços: divisão do frame em 9 partes iguais para composição. Preview: imagem de baixa resolução para validação. Ponto focal: elemento principal de atenção na composição.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-002
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Padronizar a definição de câmeras e ângulos para imagens estáticas de empreendimentos imobiliários, garantindo composição fotográfica profissional e alinhamento com o briefing criativo.', '<p>Padronizar a definição de câmeras e ângulos para imagens estáticas de empreendimentos imobiliários, garantindo composição fotográfica profissional e alinhamento com o briefing criativo.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Posicionamento de câmeras, definição de lentes, composição, ângulos padrão por tipo de imagem (fachada, aérea, interna, detalhe).', '<p>Posicionamento de câmeras, definição de lentes, composição, ângulos padrão por tipo de imagem (fachada, aérea, interna, detalhe).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Iluminação, render settings e pós-produção são tratados em SOPs separados.', '<p>Iluminação, render settings e pós-produção são tratados em SOPs separados.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Artista 3D

Posicionamento de câmeras

Marco (Dir. Criativo)

PO do projeto

Marco Andolfato

Aprovação de composição

—

Cliente', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Artista 3D</p></td><td><p>Posicionamento de câmeras</p></td><td><p>Marco (Dir. Criativo)</p></td><td><p>PO do projeto</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação de composição</p></td><td><p>—</p></td><td><p>Cliente</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Modelo 3D finalizado (SOP TBO-3D-001), briefing criativo com referências visuais, lista de imagens contratadas.', '<p>Modelo 3D finalizado (SOP TBO-3D-001), briefing criativo com referências visuais, lista de imagens contratadas.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max ou SketchUp, V-Ray/Corona Physical Camera, referências fotográficas do briefing.', '<p>3ds Max ou SketchUp, V-Ray/Corona Physical Camera, referências fotográficas do briefing.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Análise do briefing visual', 'Ação: Estudar referências visuais, identificar ângulos-chave, mapear imagens contratadas

Responsável: Artista 3D

Output: Lista de câmeras planejadas

Prazo referência: 0,5 dia', '<p>Ação: Estudar referências visuais, identificar ângulos-chave, mapear imagens contratadas</p><p>Responsável: Artista 3D</p><p>Output: Lista de câmeras planejadas</p><p>Prazo referência: 0,5 dia</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Setup de câmeras', 'Ação: Posicionar câmeras na cena com lentes adequadas (24mm fachada, 18mm aérea, 28mm interna)

Responsável: Artista 3D

Output: Câmeras posicionadas

Prazo referência: 0,5 dia', '<p>Ação: Posicionar câmeras na cena com lentes adequadas (24mm fachada, 18mm aérea, 28mm interna)</p><p>Responsável: Artista 3D</p><p>Output: Câmeras posicionadas</p><p>Prazo referência: 0,5 dia</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Composição e enquadramento', 'Ação: Aplicar regra dos terços, linhas de fuga, ponto focal. Gerar previews de baixa resolução.

Responsável: Artista 3D

Output: Previews para aprovação

Prazo referência: 0,5 dia', '<p>Ação: Aplicar regra dos terços, linhas de fuga, ponto focal. Gerar previews de baixa resolução.</p><p>Responsável: Artista 3D</p><p>Output: Previews para aprovação</p><p>Prazo referência: 0,5 dia</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Aprovação de ângulos', 'Ação: Submeter previews para aprovação da direção criativa

Responsável: Marco Andolfato

Output: Ângulos aprovados

Prazo referência: 1 dia

[APROVAÇÃO] Direção criativa aprova composição antes do render final', '<p>Ação: Submeter previews para aprovação da direção criativa</p><p>Responsável: Marco Andolfato</p><p>Output: Ângulos aprovados</p><p>Prazo referência: 1 dia</p><p><strong>[APROVAÇÃO] Direção criativa aprova composição antes do render final</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Horizonte nivelado. Sem distorção excessiva de lente. Ponto focal claro. Linhas verticais paralelas (correção de perspectiva). Proporção correta do empreendimento. Enquadramento valoriza fachada principal.', '<p>Horizonte nivelado. Sem distorção excessiva de lente. Ponto focal claro. Linhas verticais paralelas (correção de perspectiva). Proporção correta do empreendimento. Enquadramento valoriza fachada principal.</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Lente muito aberta distorcendo proporções. Câmera muito alta (efeito drone não intencional). Composição centralizada sem dinamismo. Falta de contexto urbano no enquadramento.', '<p>Lente muito aberta distorcendo proporções. Câmera muito alta (efeito drone não intencional). Composição centralizada sem dinamismo. Falta de contexto urbano no enquadramento.</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max/SketchUp, V-Ray Physical Camera, Photoshop (overlay de composição), referências Pinterest/Archdaily.', '<p>3ds Max/SketchUp, V-Ray Physical Camera, Photoshop (overlay de composição), referências Pinterest/Archdaily.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Definição de câmeras: 1 dia útil. Aprovação: até 2 dias úteis com revisão. Extensão: nova rodada de ajuste = +0,5 dia.', '<p>Definição de câmeras: 1 dia útil. Aprovação: até 2 dias úteis com revisão. Extensão: nova rodada de ajuste = +0,5 dia.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Análise de Briefing → Setup de Câmeras → Composição → Preview → [APROVAÇÃO Dir. Criativa] → Aprovado: Seguir para Render → Reprovado: Ajustar câmeras → Fim', '<p>Início → Análise de Briefing → Setup de Câmeras → Composição → Preview → [APROVAÇÃO Dir. Criativa] → Aprovado: Seguir para Render → Reprovado: Ajustar câmeras → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Lente: distância focal da câmera virtual em mm. Regra dos terços: divisão do frame em 9 partes iguais para composição. Preview: imagem de baixa resolução para validação. Ponto focal: elemento principal de atenção na composição.', '<p>Lente: distância focal da câmera virtual em mm. Regra dos terços: divisão do frame em 9 partes iguais para composição. Preview: imagem de baixa resolução para validação. Ponto focal: elemento principal de atenção na composição.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-3D-003: Imagens Estáticas Iluminação e Render ──
END $$;