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
    'Modelagem 3D',
    'tbo-3d-001-modelagem-3d',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Modelagem 3D

Código

TBO-3D-001

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

Definir o fluxo completo de modelagem 3D para empreendimentos imobiliários, desde o recebimento do projeto arquitetônico até a entrega do modelo finalizado pronto para render. Este SOP garante padronização de escala, materialidade e organização de cena entre todos os artistas 3D da TBO.

  2. Escopo

2.1 O que está coberto

Modelagem de fachadas, áreas comuns, unidades-tipo, implantação e entorno imediato. Inclui importação de CAD/BIM, modelagem poligonal, aplicação de materiais base e organização de layers/grupos.

2.2 Exclusões

Iluminação, renderização, pós-produção e animação são cobertos por SOPs específicos. Modelagem de mobiliário customizado sob demanda segue briefing à parte.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Artista 3D

Execução da modelagem

Marco (Dir. Criativo)

PO do projeto

Coordenador 3D

Revisão técnica do modelo

Marco (Dir. Criativo)

Cliente (se aplicável)

Marco Andolfato

Aprovação final de qualidade

—

Equipe de render

  4. Pré-requisitos

4.1 Inputs necessários

Projeto arquitetônico em DWG/RVT, memorial descritivo, referências visuais aprovadas pelo cliente, briefing criativo aprovado, paleta de materiais definida.

4.2 Ferramentas e Acessos

3ds Max ou SketchUp, V-Ray ou Corona, AutoCAD (leitura de plantas), servidor de assets TBO (biblioteca de materiais e mobiliário).



  5. Procedimento Passo a Passo

5.1. Recebimento e análise do projeto

Ação: Importar arquivos CAD/BIM, verificar escalas e cotas, identificar inconsistências

Responsável: Artista 3D

Output: Checklist de recebimento preenchido

Prazo referência: 0,5 dia

5.2. Setup da cena

Ação: Criar arquivo de cena padrão TBO, configurar unidades (metros), importar base CAD limpa

Responsável: Artista 3D

Output: Cena base configurada

Prazo referência: 0,5 dia

5.3. Modelagem de volumetria

Ação: Modelar estrutura principal do edifício: fachada, varandas, cobertura, térreo

Responsável: Artista 3D

Output: Modelo volumétrico aprovado

Prazo referência: 2-3 dias

[DECISÃO] Se volumetria difere do CAD, alinhar com arquiteto antes de prosseguir

5.4. Detalhamento e materiais base

Ação: Adicionar detalhes arquitetônicos (caixilhos, brises, gradis), aplicar materiais da biblioteca TBO

Responsável: Artista 3D

Output: Modelo detalhado com materiais

Prazo referência: 2-3 dias

5.5. Modelagem de entorno e paisagismo

Ação: Modelar entorno imediato, inserir vegetação da biblioteca, configurar terreno

Responsável: Artista 3D

Output: Cena completa com entorno

Prazo referência: 1-2 dias

5.6. Revisão técnica

Ação: Verificar escala, poligonagem, naming de objetos, organização de layers

Responsável: Coordenador 3D

Output: Relatório de revisão

Prazo referência: 0,5 dia

[APROVAÇÃO] Modelo aprovado para fase de render

5.7. Entrega interna

Ação: Salvar versão final no servidor, documentar especificidades, handoff para equipe de render

Responsável: Artista 3D

Output: Modelo entregue + documentação

Prazo referência: 0,5 dia

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Escala correta (1 unidade = 1 metro). Sem faces invertidas ou geometria corrompida. Materiais da biblioteca TBO aplicados. Layers organizados (Fachada, Interiores, Entorno, Paisagismo, Terreno). Nomenclatura padrão de objetos. Arquivo abaixo de 500MB (otimizado).

6.2 Erros Comuns a Evitar

Escala incorreta na importação de CAD (conferir cotas de referência). Excesso de polígonos em elementos distantes. Materiais duplicados na cena. Falta de organização de layers dificultando handoff.

  7. Ferramentas e Templates

3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+, Corona 10+, AutoCAD 2024+ (leitura), Biblioteca de Assets TBO (servidor interno), Google Drive (entrega de referências).

  8. SLAs e Prazos

Prazo padrão total: 5-8 dias úteis (dependendo da complexidade). Modelagem simples (residencial baixo): 5 dias. Modelagem média (residencial alto padrão): 7 dias. Modelagem complexa (multiuso/comercial): 10 dias. Extensão: mediante aprovação do PO com justificativa documentada.

  9. Fluxograma

Início → Recebimento CAD/BIM → Análise e Checklist → Setup de Cena → Modelagem Volumétrica → [DECISÃO: Volumetria OK?] → Sim: Detalhamento → Não: Retorno ao arquiteto → Materiais Base → Entorno e Paisagismo → Revisão Técnica → [APROVAÇÃO] → Entrega Interna → Fim

  10. Glossário

CAD: Computer-Aided Design. BIM: Building Information Modeling. Poligonagem: contagem de polígonos do modelo. Layer: camada de organização de objetos. Caixilho: esquadria de janela/porta. Brise: elemento de proteção solar. KV: Key Visual (imagem-chave).



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Modelagem 3D</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-001</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Definir o fluxo completo de modelagem 3D para empreendimentos imobiliários, desde o recebimento do projeto arquitetônico até a entrega do modelo finalizado pronto para render. Este SOP garante padronização de escala, materialidade e organização de cena entre todos os artistas 3D da TBO.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Modelagem de fachadas, áreas comuns, unidades-tipo, implantação e entorno imediato. Inclui importação de CAD/BIM, modelagem poligonal, aplicação de materiais base e organização de layers/grupos.</p><p><strong>2.2 Exclusões</strong></p><p>Iluminação, renderização, pós-produção e animação são cobertos por SOPs específicos. Modelagem de mobiliário customizado sob demanda segue briefing à parte.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Artista 3D</p></td><td><p>Execução da modelagem</p></td><td><p>Marco (Dir. Criativo)</p></td><td><p>PO do projeto</p></td></tr><tr><td><p>Coordenador 3D</p></td><td><p>Revisão técnica do modelo</p></td><td><p>Marco (Dir. Criativo)</p></td><td><p>Cliente (se aplicável)</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final de qualidade</p></td><td><p>—</p></td><td><p>Equipe de render</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Projeto arquitetônico em DWG/RVT, memorial descritivo, referências visuais aprovadas pelo cliente, briefing criativo aprovado, paleta de materiais definida.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max ou SketchUp, V-Ray ou Corona, AutoCAD (leitura de plantas), servidor de assets TBO (biblioteca de materiais e mobiliário).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Recebimento e análise do projeto</strong></p><p>Ação: Importar arquivos CAD/BIM, verificar escalas e cotas, identificar inconsistências</p><p>Responsável: Artista 3D</p><p>Output: Checklist de recebimento preenchido</p><p>Prazo referência: 0,5 dia</p><p><strong>5.2. Setup da cena</strong></p><p>Ação: Criar arquivo de cena padrão TBO, configurar unidades (metros), importar base CAD limpa</p><p>Responsável: Artista 3D</p><p>Output: Cena base configurada</p><p>Prazo referência: 0,5 dia</p><p><strong>5.3. Modelagem de volumetria</strong></p><p>Ação: Modelar estrutura principal do edifício: fachada, varandas, cobertura, térreo</p><p>Responsável: Artista 3D</p><p>Output: Modelo volumétrico aprovado</p><p>Prazo referência: 2-3 dias</p><p><strong>[DECISÃO] Se volumetria difere do CAD, alinhar com arquiteto antes de prosseguir</strong></p><p><strong>5.4. Detalhamento e materiais base</strong></p><p>Ação: Adicionar detalhes arquitetônicos (caixilhos, brises, gradis), aplicar materiais da biblioteca TBO</p><p>Responsável: Artista 3D</p><p>Output: Modelo detalhado com materiais</p><p>Prazo referência: 2-3 dias</p><p><strong>5.5. Modelagem de entorno e paisagismo</strong></p><p>Ação: Modelar entorno imediato, inserir vegetação da biblioteca, configurar terreno</p><p>Responsável: Artista 3D</p><p>Output: Cena completa com entorno</p><p>Prazo referência: 1-2 dias</p><p><strong>5.6. Revisão técnica</strong></p><p>Ação: Verificar escala, poligonagem, naming de objetos, organização de layers</p><p>Responsável: Coordenador 3D</p><p>Output: Relatório de revisão</p><p>Prazo referência: 0,5 dia</p><p><strong>[APROVAÇÃO] Modelo aprovado para fase de render</strong></p><p><strong>5.7. Entrega interna</strong></p><p>Ação: Salvar versão final no servidor, documentar especificidades, handoff para equipe de render</p><p>Responsável: Artista 3D</p><p>Output: Modelo entregue + documentação</p><p>Prazo referência: 0,5 dia</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Escala correta (1 unidade = 1 metro). Sem faces invertidas ou geometria corrompida. Materiais da biblioteca TBO aplicados. Layers organizados (Fachada, Interiores, Entorno, Paisagismo, Terreno). Nomenclatura padrão de objetos. Arquivo abaixo de 500MB (otimizado).</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Escala incorreta na importação de CAD (conferir cotas de referência). Excesso de polígonos em elementos distantes. Materiais duplicados na cena. Falta de organização de layers dificultando handoff.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+, Corona 10+, AutoCAD 2024+ (leitura), Biblioteca de Assets TBO (servidor interno), Google Drive (entrega de referências).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Prazo padrão total: 5-8 dias úteis (dependendo da complexidade). Modelagem simples (residencial baixo): 5 dias. Modelagem média (residencial alto padrão): 7 dias. Modelagem complexa (multiuso/comercial): 10 dias. Extensão: mediante aprovação do PO com justificativa documentada.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebimento CAD/BIM → Análise e Checklist → Setup de Cena → Modelagem Volumétrica → [DECISÃO: Volumetria OK?] → Sim: Detalhamento → Não: Retorno ao arquiteto → Materiais Base → Entorno e Paisagismo → Revisão Técnica → [APROVAÇÃO] → Entrega Interna → Fim</p><p><strong>  10. Glossário</strong></p><p>CAD: Computer-Aided Design. BIM: Building Information Modeling. Poligonagem: contagem de polígonos do modelo. Layer: camada de organização de objetos. Caixilho: esquadria de janela/porta. Brise: elemento de proteção solar. KV: Key Visual (imagem-chave).</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-001
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Definir o fluxo completo de modelagem 3D para empreendimentos imobiliários, desde o recebimento do projeto arquitetônico até a entrega do modelo finalizado pronto para render. Este SOP garante padronização de escala, materialidade e organização de cena entre todos os artistas 3D da TBO.', '<p>Definir o fluxo completo de modelagem 3D para empreendimentos imobiliários, desde o recebimento do projeto arquitetônico até a entrega do modelo finalizado pronto para render. Este SOP garante padronização de escala, materialidade e organização de cena entre todos os artistas 3D da TBO.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem de fachadas, áreas comuns, unidades-tipo, implantação e entorno imediato. Inclui importação de CAD/BIM, modelagem poligonal, aplicação de materiais base e organização de layers/grupos.', '<p>Modelagem de fachadas, áreas comuns, unidades-tipo, implantação e entorno imediato. Inclui importação de CAD/BIM, modelagem poligonal, aplicação de materiais base e organização de layers/grupos.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Iluminação, renderização, pós-produção e animação são cobertos por SOPs específicos. Modelagem de mobiliário customizado sob demanda segue briefing à parte.', '<p>Iluminação, renderização, pós-produção e animação são cobertos por SOPs específicos. Modelagem de mobiliário customizado sob demanda segue briefing à parte.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Artista 3D

Execução da modelagem

Marco (Dir. Criativo)

PO do projeto

Coordenador 3D

Revisão técnica do modelo

Marco (Dir. Criativo)

Cliente (se aplicável)

Marco Andolfato

Aprovação final de qualidade

—

Equipe de render', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Artista 3D</p></td><td><p>Execução da modelagem</p></td><td><p>Marco (Dir. Criativo)</p></td><td><p>PO do projeto</p></td></tr><tr><td><p>Coordenador 3D</p></td><td><p>Revisão técnica do modelo</p></td><td><p>Marco (Dir. Criativo)</p></td><td><p>Cliente (se aplicável)</p></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final de qualidade</p></td><td><p>—</p></td><td><p>Equipe de render</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto arquitetônico em DWG/RVT, memorial descritivo, referências visuais aprovadas pelo cliente, briefing criativo aprovado, paleta de materiais definida.', '<p>Projeto arquitetônico em DWG/RVT, memorial descritivo, referências visuais aprovadas pelo cliente, briefing criativo aprovado, paleta de materiais definida.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max ou SketchUp, V-Ray ou Corona, AutoCAD (leitura de plantas), servidor de assets TBO (biblioteca de materiais e mobiliário).', '<p>3ds Max ou SketchUp, V-Ray ou Corona, AutoCAD (leitura de plantas), servidor de assets TBO (biblioteca de materiais e mobiliário).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Recebimento e análise do projeto', 'Ação: Importar arquivos CAD/BIM, verificar escalas e cotas, identificar inconsistências

Responsável: Artista 3D

Output: Checklist de recebimento preenchido

Prazo referência: 0,5 dia', '<p>Ação: Importar arquivos CAD/BIM, verificar escalas e cotas, identificar inconsistências</p><p>Responsável: Artista 3D</p><p>Output: Checklist de recebimento preenchido</p><p>Prazo referência: 0,5 dia</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Setup da cena', 'Ação: Criar arquivo de cena padrão TBO, configurar unidades (metros), importar base CAD limpa

Responsável: Artista 3D

Output: Cena base configurada

Prazo referência: 0,5 dia', '<p>Ação: Criar arquivo de cena padrão TBO, configurar unidades (metros), importar base CAD limpa</p><p>Responsável: Artista 3D</p><p>Output: Cena base configurada</p><p>Prazo referência: 0,5 dia</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Modelagem de volumetria', 'Ação: Modelar estrutura principal do edifício: fachada, varandas, cobertura, térreo

Responsável: Artista 3D

Output: Modelo volumétrico aprovado

Prazo referência: 2-3 dias

[DECISÃO] Se volumetria difere do CAD, alinhar com arquiteto antes de prosseguir', '<p>Ação: Modelar estrutura principal do edifício: fachada, varandas, cobertura, térreo</p><p>Responsável: Artista 3D</p><p>Output: Modelo volumétrico aprovado</p><p>Prazo referência: 2-3 dias</p><p><strong>[DECISÃO] Se volumetria difere do CAD, alinhar com arquiteto antes de prosseguir</strong></p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Detalhamento e materiais base', 'Ação: Adicionar detalhes arquitetônicos (caixilhos, brises, gradis), aplicar materiais da biblioteca TBO

Responsável: Artista 3D

Output: Modelo detalhado com materiais

Prazo referência: 2-3 dias', '<p>Ação: Adicionar detalhes arquitetônicos (caixilhos, brises, gradis), aplicar materiais da biblioteca TBO</p><p>Responsável: Artista 3D</p><p>Output: Modelo detalhado com materiais</p><p>Prazo referência: 2-3 dias</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Modelagem de entorno e paisagismo', 'Ação: Modelar entorno imediato, inserir vegetação da biblioteca, configurar terreno

Responsável: Artista 3D

Output: Cena completa com entorno

Prazo referência: 1-2 dias', '<p>Ação: Modelar entorno imediato, inserir vegetação da biblioteca, configurar terreno</p><p>Responsável: Artista 3D</p><p>Output: Cena completa com entorno</p><p>Prazo referência: 1-2 dias</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Revisão técnica', 'Ação: Verificar escala, poligonagem, naming de objetos, organização de layers

Responsável: Coordenador 3D

Output: Relatório de revisão

Prazo referência: 0,5 dia

[APROVAÇÃO] Modelo aprovado para fase de render', '<p>Ação: Verificar escala, poligonagem, naming de objetos, organização de layers</p><p>Responsável: Coordenador 3D</p><p>Output: Relatório de revisão</p><p>Prazo referência: 0,5 dia</p><p><strong>[APROVAÇÃO] Modelo aprovado para fase de render</strong></p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.7. Entrega interna', 'Ação: Salvar versão final no servidor, documentar especificidades, handoff para equipe de render

Responsável: Artista 3D

Output: Modelo entregue + documentação

Prazo referência: 0,5 dia', '<p>Ação: Salvar versão final no servidor, documentar especificidades, handoff para equipe de render</p><p>Responsável: Artista 3D</p><p>Output: Modelo entregue + documentação</p><p>Prazo referência: 0,5 dia</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Escala correta (1 unidade = 1 metro). Sem faces invertidas ou geometria corrompida. Materiais da biblioteca TBO aplicados. Layers organizados (Fachada, Interiores, Entorno, Paisagismo, Terreno). Nomenclatura padrão de objetos. Arquivo abaixo de 500MB (otimizado).', '<p>Escala correta (1 unidade = 1 metro). Sem faces invertidas ou geometria corrompida. Materiais da biblioteca TBO aplicados. Layers organizados (Fachada, Interiores, Entorno, Paisagismo, Terreno). Nomenclatura padrão de objetos. Arquivo abaixo de 500MB (otimizado).</p>', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Escala incorreta na importação de CAD (conferir cotas de referência). Excesso de polígonos em elementos distantes. Materiais duplicados na cena. Falta de organização de layers dificultando handoff.', '<p>Escala incorreta na importação de CAD (conferir cotas de referência). Excesso de polígonos em elementos distantes. Materiais duplicados na cena. Falta de organização de layers dificultando handoff.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+, Corona 10+, AutoCAD 2024+ (leitura), Biblioteca de Assets TBO (servidor interno), Google Drive (entrega de referências).', '<p>3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+, Corona 10+, AutoCAD 2024+ (leitura), Biblioteca de Assets TBO (servidor interno), Google Drive (entrega de referências).</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Prazo padrão total: 5-8 dias úteis (dependendo da complexidade). Modelagem simples (residencial baixo): 5 dias. Modelagem média (residencial alto padrão): 7 dias. Modelagem complexa (multiuso/comercial): 10 dias. Extensão: mediante aprovação do PO com justificativa documentada.', '<p>Prazo padrão total: 5-8 dias úteis (dependendo da complexidade). Modelagem simples (residencial baixo): 5 dias. Modelagem média (residencial alto padrão): 7 dias. Modelagem complexa (multiuso/comercial): 10 dias. Extensão: mediante aprovação do PO com justificativa documentada.</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebimento CAD/BIM → Análise e Checklist → Setup de Cena → Modelagem Volumétrica → [DECISÃO: Volumetria OK?] → Sim: Detalhamento → Não: Retorno ao arquiteto → Materiais Base → Entorno e Paisagismo → Revisão Técnica → [APROVAÇÃO] → Entrega Interna → Fim', '<p>Início → Recebimento CAD/BIM → Análise e Checklist → Setup de Cena → Modelagem Volumétrica → [DECISÃO: Volumetria OK?] → Sim: Detalhamento → Não: Retorno ao arquiteto → Materiais Base → Entorno e Paisagismo → Revisão Técnica → [APROVAÇÃO] → Entrega Interna → Fim</p>', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'CAD: Computer-Aided Design. BIM: Building Information Modeling. Poligonagem: contagem de polígonos do modelo. Layer: camada de organização de objetos. Caixilho: esquadria de janela/porta. Brise: elemento de proteção solar. KV: Key Visual (imagem-chave).', '<p>CAD: Computer-Aided Design. BIM: Building Information Modeling. Poligonagem: contagem de polígonos do modelo. Layer: camada de organização de objetos. Caixilho: esquadria de janela/porta. Brise: elemento de proteção solar. KV: Key Visual (imagem-chave).</p>', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 19, 'step');

  -- ── TBO-3D-002: Imagens Estáticas Câmeras e Ângulos ──
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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Imagens Estáticas Iluminação e Render',
    'tbo-3d-003-imagens-estaticas-iluminacao-e-render',
    'digital-3d',
    'checklist',
    'Imagens Estáticas — Iluminação e Render',
    'Standard Operating Procedure

Imagens Estáticas — Iluminação e Render

Código

TBO-3D-003

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

Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.

  2. Escopo

2.1 O que está coberto

Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).

2.2 Exclusões

Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Executar setup de iluminação e configurar parâmetros de render

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar configuração de luz e câmera antes do render final

Aprovador

—

Visualizador 3D Júnior

Suporte em testes de render e organização de passes

Consultado

—

Gerente de Projetos

Acompanhar prazo e comunicar cliente sobre status

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.

4.2 Ferramentas e Acessos

3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.



  5. Procedimento Passo a Passo

5.1. Revisão de briefing e referências

Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.

Responsável: Visualizador 3D Sênior

Output: Lista de parâmetros de iluminação e ângulos confirmados

Prazo referência: 30 min

5.2. Setup de iluminação

Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.

Responsável: Visualizador 3D Sênior

Output: Iluminação configurada e testada em preview

Prazo referência: 1–2 h

[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.

5.3. Configuração de câmera e composição

Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.

Responsável: Visualizador 3D Sênior

Output: Câmera posicionada com composição aprovada

Prazo referência: 30–45 min

5.4. Render de teste (baixa resolução)

Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.

Responsável: Visualizador 3D Sênior

Output: Imagem de teste revisada e lista de ajustes documentada

Prazo referência: 30–60 min

[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.

5.5. Aprovação interna e ajustes finais

Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.

Responsável: Visualizador 3D Sênior

Output: Cena aprovada internamente para render final

Prazo referência: 1–3 h (incluindo ciclo de feedback)

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.

5.6. Render final com passes

Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.

Responsável: Visualizador 3D Sênior

Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO

Prazo referência: 2–8 h (variável por complexidade e hardware)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.

6.2 Erros Comuns a Evitar

Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.

  7. Ferramentas e Templates

3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.

  8. SLAs e Prazos

Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.

  9. Fluxograma

Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim

  10. Glossário

HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Imagens Estáticas — Iluminação e Render</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-003</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).</p><p><strong>2.2 Exclusões</strong></p><p>Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Executar setup de iluminação e configurar parâmetros de render</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar configuração de luz e câmera antes do render final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Suporte em testes de render e organização de passes</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Acompanhar prazo e comunicar cliente sobre status</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Revisão de briefing e referências</strong></p><p>Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Lista de parâmetros de iluminação e ângulos confirmados</p><p>Prazo referência: 30 min</p><p><strong>5.2. Setup de iluminação</strong></p><p>Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Iluminação configurada e testada em preview</p><p>Prazo referência: 1–2 h</p><p><strong>[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.</strong></p><p><strong>5.3. Configuração de câmera e composição</strong></p><p>Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Câmera posicionada com composição aprovada</p><p>Prazo referência: 30–45 min</p><p><strong>5.4. Render de teste (baixa resolução)</strong></p><p>Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Imagem de teste revisada e lista de ajustes documentada</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.</strong></p><p><strong>5.5. Aprovação interna e ajustes finais</strong></p><p>Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Cena aprovada internamente para render final</p><p>Prazo referência: 1–3 h (incluindo ciclo de feedback)</p><p><strong>[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.</strong></p><p><strong>5.6. Render final com passes</strong></p><p>Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO</p><p>Prazo referência: 2–8 h (variável por complexidade e hardware)</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim</p><p><strong>  10. Glossário</strong></p><p>HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-003
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.', '<p>Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).', '<p>Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.', '<p>Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Executar setup de iluminação e configurar parâmetros de render

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar configuração de luz e câmera antes do render final

Aprovador

—

Visualizador 3D Júnior

Suporte em testes de render e organização de passes

Consultado

—

Gerente de Projetos

Acompanhar prazo e comunicar cliente sobre status

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D Sênior</p></td><td><p>Executar setup de iluminação e configurar parâmetros de render</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar configuração de luz e câmera antes do render final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Visualizador 3D Júnior</p></td><td><p>Suporte em testes de render e organização de passes</p></td><td><p>Consultado</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Acompanhar prazo e comunicar cliente sobre status</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.', '<p>Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.', '<p>3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Revisão de briefing e referências', 'Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.

Responsável: Visualizador 3D Sênior

Output: Lista de parâmetros de iluminação e ângulos confirmados

Prazo referência: 30 min', '<p>Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Lista de parâmetros de iluminação e ângulos confirmados</p><p>Prazo referência: 30 min</p>', 6, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Setup de iluminação', 'Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.

Responsável: Visualizador 3D Sênior

Output: Iluminação configurada e testada em preview

Prazo referência: 1–2 h

[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.', '<p>Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Iluminação configurada e testada em preview</p><p>Prazo referência: 1–2 h</p><p><strong>[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Configuração de câmera e composição', 'Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.

Responsável: Visualizador 3D Sênior

Output: Câmera posicionada com composição aprovada

Prazo referência: 30–45 min', '<p>Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Câmera posicionada com composição aprovada</p><p>Prazo referência: 30–45 min</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Render de teste (baixa resolução)', 'Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.

Responsável: Visualizador 3D Sênior

Output: Imagem de teste revisada e lista de ajustes documentada

Prazo referência: 30–60 min

[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.', '<p>Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Imagem de teste revisada e lista de ajustes documentada</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação interna e ajustes finais', 'Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.

Responsável: Visualizador 3D Sênior

Output: Cena aprovada internamente para render final

Prazo referência: 1–3 h (incluindo ciclo de feedback)

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.', '<p>Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Cena aprovada internamente para render final</p><p>Prazo referência: 1–3 h (incluindo ciclo de feedback)</p><p><strong>[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Render final com passes', 'Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.

Responsável: Visualizador 3D Sênior

Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO

Prazo referência: 2–8 h (variável por complexidade e hardware)', '<p>Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.</p><p>Responsável: Visualizador 3D Sênior</p><p>Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO</p><p>Prazo referência: 2–8 h (variável por complexidade e hardware)</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.', '<p>[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.', '<p>Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.', '<p>3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.', '<p>Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim', '<p>Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.', '<p>HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-3D-004: Imagens Estáticas Pós produção ──
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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Plantas Humanizadas',
    'tbo-3d-005-plantas-humanizadas',
    'digital-3d',
    'checklist',
    'Marco Andolfato (Diretor Criativo)',
    'Standard Operating Procedure

Plantas Humanizadas

Código

TBO-3D-005

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

Produzir plantas baixas humanizadas de alta qualidade — com mobiliário, vegetação, pessoas e acabamentos ilustrados — que comuniquem o espaço de forma atraente e comercial para materiais de venda do empreendimento.

  2. Escopo

2.1 O que está coberto

Recebimento e preparo de planta CAD/PDF; montagem em Photoshop ou Illustrator com mobiliário vetorial/bitmap; inserção de texturas de piso, vegetação, pessoas vista superior e elementos decorativos; exportação em formatos para uso em material gráfico e digital.

2.2 Exclusões

Desenho técnico arquitetônico (responsabilidade do escritório de arquitetura); layout de mobiliário (responsabilidade do projeto de interiores); adaptações para marketing (responsabilidade do time de Design).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D / Designer 3D

Executar produção da planta humanizada

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar estilo visual e versão final

Aprovador

—

Gerente de Projetos

Receber planta do cliente, fazer briefing e entregar resultado

Consultado

Informado

Cliente / Arquiteto

Fornecer planta CAD atualizada e aprovar layout de mobiliário

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Arquivo CAD (.dwg) ou PDF vetorial da planta baixa aprovada pelo arquiteto; briefing com estilo visual desejado (clean/minimalista, aquarela, colorido, dark); lista de ambientes a humanizar; referências visuais aprovadas.

4.2 Ferramentas e Acessos

Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD ou DraftSight (para extração de linhas CAD); biblioteca de blocos humanizados TBO (mobiliário, vegetação, pessoas top-view); Sketchup (opcional para perspectiva isométrica).



  5. Procedimento Passo a Passo

5.1. Recebimento e limpeza do CAD

Ação: Receber arquivo CAD do cliente; abrir no AutoCAD e verificar layers, cotas e nomenclaturas; limpar elementos desnecessários (cotas, textos, layers de estrutura); exportar planta limpa como PDF ou importar diretamente no Photoshop/Illustrator.

Responsável: Visualizador 3D / Designer 3D

Output: Planta base limpa pronta para humanização

Prazo referência: 30–60 min

[DECISÃO] Planta CAD está atualizada e com aprovação do arquiteto? Sim → prosseguir. Não → solicitar versão atualizada ao cliente.

5.2. Definição de estilo e paleta

Ação: Com base no briefing e referências aprovadas, definir paleta de cores para pisos, paredes e elementos; escolher estilo de mobiliário (clean linework, sombreado realista ou aquarela); registrar decisões no briefing de produção.

Responsável: Visualizador 3D / Designer 3D

Output: Style guide da planta aprovado internamente

Prazo referência: 30 min

5.3. Montagem de mobiliário e ambientação

Ação: Inserir blocos de mobiliário da biblioteca TBO (sofa, cama, mesa, bancada etc.) nos ambientes conforme layout aprovado; ajustar escala proporcional ao CAD; inserir texturas de piso por ambiente (madeira, porcelanato, cimento queimado etc.); adicionar vegetação indoor e outdoor top-view.

Responsável: Visualizador 3D / Designer 3D

Output: Planta com mobiliário e texturas em escala

Prazo referência: 2–4 h

5.4. Inserção de pessoas e elementos de vida

Ação: Adicionar silhuetas de pessoas em escala (altura referência = ~1,70 m em planta); inserir elementos de vida (livros, louças, plantas, toalhas) para dar escala e habitabilidade; ajustar opacidade e sombras para integração visual.

Responsável: Visualizador 3D / Designer 3D

Output: Planta com sensação de habitabilidade e escala humana

Prazo referência: 30–60 min

5.5. Finalização, revisão e exportação

Ação: Revisar escala geral, proporcionalidade do mobiliário, legibilidade dos ambientes e coerência da paleta; enviar para aprovação do Dir. Criativo; após aprovação, exportar JPG 300 dpi (impressão) + PNG 72 dpi (digital) + PDF vetorial se aplicável; nomear conforme padrão TBO.

Responsável: Visualizador 3D / Designer 3D

Output: Arquivos exportados e nomeados; PSD/AI master salvo

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → ajustar (máx. 2 rodadas).

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Escala de mobiliário proporcional ao CAD (sofá ≈ 2,20 m, cama queen ≈ 1,60×2,00 m). [ ] Texturas de piso coerentes com o projeto de interiores. [ ] Pessoas em escala correta (≈ 1,70 m). [ ] Paleta de cor aderente ao briefing e identidade do empreendimento. [ ] Todos os ambientes identificados e humanizados conforme escopo. [ ] Legibilidade: fácil distinguir ambientes, circulações e mobiliário. [ ] Arquivos exportados nos formatos e resoluções corretos.

6.2 Erros Comuns a Evitar

Mobiliário fora de escala: usar linha de cota do CAD como referência (paredes de 15 cm = referência de espessura). Texturas pixeladas: usar texturas com resolução mínima de 300 dpi no tamanho final de uso. Planta com baixa legibilidade: aumentar contraste entre piso e mobiliário; adicionar outline sutil nas paredes.

  7. Ferramentas e Templates

Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD LT; biblioteca de blocos humanizados TBO (atualizada semestralmente); referências em Pinterest/Behance para benchmarking de estilo.

  8. SLAs e Prazos

Planta humanizada padrão (até 150 m²): entrega em 2 dias úteis. Planta humanizada complexa (150–400 m², múltiplos pavimentos): 3–4 dias úteis. Revisão após feedback do cliente: 1 dia útil por rodada (máx. 2 inclusas no escopo).

  9. Fluxograma

Início → Recebe CAD do cliente → [CAD atualizado?] → Não: Solicita revisão ao cliente → Sim: Limpeza CAD → Definição de estilo → Montagem mobiliário/texturas → Inserção de pessoas/vida → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega → Fim

  10. Glossário

Planta humanizada: planta baixa com mobiliário, texturas e pessoas inseridos para comunicação comercial. Top-view: vista de cima (perspectiva usada em plantas). Entourage top-view: silhuetas de pessoas e elementos vistos de cima. CAD: Computer-Aided Design, arquivo técnico de arquitetura (.dwg). Linework: estilo de ilustração baseado em linhas limpas sem preenchimento fotorrealista.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Plantas Humanizadas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-3D-005</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Digital 3D</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Marco Andolfato (Diretor Criativo)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir plantas baixas humanizadas de alta qualidade — com mobiliário, vegetação, pessoas e acabamentos ilustrados — que comuniquem o espaço de forma atraente e comercial para materiais de venda do empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Recebimento e preparo de planta CAD/PDF; montagem em Photoshop ou Illustrator com mobiliário vetorial/bitmap; inserção de texturas de piso, vegetação, pessoas vista superior e elementos decorativos; exportação em formatos para uso em material gráfico e digital.</p><p><strong>2.2 Exclusões</strong></p><p>Desenho técnico arquitetônico (responsabilidade do escritório de arquitetura); layout de mobiliário (responsabilidade do projeto de interiores); adaptações para marketing (responsabilidade do time de Design).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D / Designer 3D</p></td><td><p>Executar produção da planta humanizada</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar estilo visual e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Receber planta do cliente, fazer briefing e entregar resultado</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Arquiteto</p></td><td><p>Fornecer planta CAD atualizada e aprovar layout de mobiliário</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Arquivo CAD (.dwg) ou PDF vetorial da planta baixa aprovada pelo arquiteto; briefing com estilo visual desejado (clean/minimalista, aquarela, colorido, dark); lista de ambientes a humanizar; referências visuais aprovadas.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD ou DraftSight (para extração de linhas CAD); biblioteca de blocos humanizados TBO (mobiliário, vegetação, pessoas top-view); Sketchup (opcional para perspectiva isométrica).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Recebimento e limpeza do CAD</strong></p><p>Ação: Receber arquivo CAD do cliente; abrir no AutoCAD e verificar layers, cotas e nomenclaturas; limpar elementos desnecessários (cotas, textos, layers de estrutura); exportar planta limpa como PDF ou importar diretamente no Photoshop/Illustrator.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Planta base limpa pronta para humanização</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Planta CAD está atualizada e com aprovação do arquiteto? Sim → prosseguir. Não → solicitar versão atualizada ao cliente.</strong></p><p><strong>5.2. Definição de estilo e paleta</strong></p><p>Ação: Com base no briefing e referências aprovadas, definir paleta de cores para pisos, paredes e elementos; escolher estilo de mobiliário (clean linework, sombreado realista ou aquarela); registrar decisões no briefing de produção.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Style guide da planta aprovado internamente</p><p>Prazo referência: 30 min</p><p><strong>5.3. Montagem de mobiliário e ambientação</strong></p><p>Ação: Inserir blocos de mobiliário da biblioteca TBO (sofa, cama, mesa, bancada etc.) nos ambientes conforme layout aprovado; ajustar escala proporcional ao CAD; inserir texturas de piso por ambiente (madeira, porcelanato, cimento queimado etc.); adicionar vegetação indoor e outdoor top-view.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Planta com mobiliário e texturas em escala</p><p>Prazo referência: 2–4 h</p><p><strong>5.4. Inserção de pessoas e elementos de vida</strong></p><p>Ação: Adicionar silhuetas de pessoas em escala (altura referência = ~1,70 m em planta); inserir elementos de vida (livros, louças, plantas, toalhas) para dar escala e habitabilidade; ajustar opacidade e sombras para integração visual.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Planta com sensação de habitabilidade e escala humana</p><p>Prazo referência: 30–60 min</p><p><strong>5.5. Finalização, revisão e exportação</strong></p><p>Ação: Revisar escala geral, proporcionalidade do mobiliário, legibilidade dos ambientes e coerência da paleta; enviar para aprovação do Dir. Criativo; após aprovação, exportar JPG 300 dpi (impressão) + PNG 72 dpi (digital) + PDF vetorial se aplicável; nomear conforme padrão TBO.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Arquivos exportados e nomeados; PSD/AI master salvo</p><p>Prazo referência: 1 h + ciclo revisão 24 h</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → ajustar (máx. 2 rodadas).</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>[ ] Escala de mobiliário proporcional ao CAD (sofá ≈ 2,20 m, cama queen ≈ 1,60×2,00 m). [ ] Texturas de piso coerentes com o projeto de interiores. [ ] Pessoas em escala correta (≈ 1,70 m). [ ] Paleta de cor aderente ao briefing e identidade do empreendimento. [ ] Todos os ambientes identificados e humanizados conforme escopo. [ ] Legibilidade: fácil distinguir ambientes, circulações e mobiliário. [ ] Arquivos exportados nos formatos e resoluções corretos.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Mobiliário fora de escala: usar linha de cota do CAD como referência (paredes de 15 cm = referência de espessura). Texturas pixeladas: usar texturas com resolução mínima de 300 dpi no tamanho final de uso. Planta com baixa legibilidade: aumentar contraste entre piso e mobiliário; adicionar outline sutil nas paredes.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD LT; biblioteca de blocos humanizados TBO (atualizada semestralmente); referências em Pinterest/Behance para benchmarking de estilo.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Planta humanizada padrão (até 150 m²): entrega em 2 dias úteis. Planta humanizada complexa (150–400 m², múltiplos pavimentos): 3–4 dias úteis. Revisão após feedback do cliente: 1 dia útil por rodada (máx. 2 inclusas no escopo).</p><p><strong>  9. Fluxograma</strong></p><p>Início → Recebe CAD do cliente → [CAD atualizado?] → Não: Solicita revisão ao cliente → Sim: Limpeza CAD → Definição de estilo → Montagem mobiliário/texturas → Inserção de pessoas/vida → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega → Fim</p><p><strong>  10. Glossário</strong></p><p>Planta humanizada: planta baixa com mobiliário, texturas e pessoas inseridos para comunicação comercial. Top-view: vista de cima (perspectiva usada em plantas). Entourage top-view: silhuetas de pessoas e elementos vistos de cima. CAD: Computer-Aided Design, arquivo técnico de arquitetura (.dwg). Linework: estilo de ilustração baseado em linhas limpas sem preenchimento fotorrealista.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['3d','render','archviz','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-3D-005
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir plantas baixas humanizadas de alta qualidade — com mobiliário, vegetação, pessoas e acabamentos ilustrados — que comuniquem o espaço de forma atraente e comercial para materiais de venda do empreendimento.', '<p>Produzir plantas baixas humanizadas de alta qualidade — com mobiliário, vegetação, pessoas e acabamentos ilustrados — que comuniquem o espaço de forma atraente e comercial para materiais de venda do empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Recebimento e preparo de planta CAD/PDF; montagem em Photoshop ou Illustrator com mobiliário vetorial/bitmap; inserção de texturas de piso, vegetação, pessoas vista superior e elementos decorativos; exportação em formatos para uso em material gráfico e digital.', '<p>Recebimento e preparo de planta CAD/PDF; montagem em Photoshop ou Illustrator com mobiliário vetorial/bitmap; inserção de texturas de piso, vegetação, pessoas vista superior e elementos decorativos; exportação em formatos para uso em material gráfico e digital.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Desenho técnico arquitetônico (responsabilidade do escritório de arquitetura); layout de mobiliário (responsabilidade do projeto de interiores); adaptações para marketing (responsabilidade do time de Design).', '<p>Desenho técnico arquitetônico (responsabilidade do escritório de arquitetura); layout de mobiliário (responsabilidade do projeto de interiores); adaptações para marketing (responsabilidade do time de Design).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D / Designer 3D

Executar produção da planta humanizada

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar estilo visual e versão final

Aprovador

—

Gerente de Projetos

Receber planta do cliente, fazer briefing e entregar resultado

Consultado

Informado

Cliente / Arquiteto

Fornecer planta CAD atualizada e aprovar layout de mobiliário

—

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Visualizador 3D / Designer 3D</p></td><td><p>Executar produção da planta humanizada</p></td><td><p>Responsável</p></td><td><p>—</p></td></tr><tr><td><p>Diretor Criativo (Marco Andolfato)</p></td><td><p>Aprovar estilo visual e versão final</p></td><td><p>Aprovador</p></td><td><p>—</p></td></tr><tr><td><p>Gerente de Projetos</p></td><td><p>Receber planta do cliente, fazer briefing e entregar resultado</p></td><td><p>Consultado</p></td><td><p>Informado</p></td></tr><tr><td><p>Cliente / Arquiteto</p></td><td><p>Fornecer planta CAD atualizada e aprovar layout de mobiliário</p></td><td><p>—</p></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Arquivo CAD (.dwg) ou PDF vetorial da planta baixa aprovada pelo arquiteto; briefing com estilo visual desejado (clean/minimalista, aquarela, colorido, dark); lista de ambientes a humanizar; referências visuais aprovadas.', '<p>Arquivo CAD (.dwg) ou PDF vetorial da planta baixa aprovada pelo arquiteto; briefing com estilo visual desejado (clean/minimalista, aquarela, colorido, dark); lista de ambientes a humanizar; referências visuais aprovadas.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD ou DraftSight (para extração de linhas CAD); biblioteca de blocos humanizados TBO (mobiliário, vegetação, pessoas top-view); Sketchup (opcional para perspectiva isométrica).', '<p>Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD ou DraftSight (para extração de linhas CAD); biblioteca de blocos humanizados TBO (mobiliário, vegetação, pessoas top-view); Sketchup (opcional para perspectiva isométrica).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Recebimento e limpeza do CAD', 'Ação: Receber arquivo CAD do cliente; abrir no AutoCAD e verificar layers, cotas e nomenclaturas; limpar elementos desnecessários (cotas, textos, layers de estrutura); exportar planta limpa como PDF ou importar diretamente no Photoshop/Illustrator.

Responsável: Visualizador 3D / Designer 3D

Output: Planta base limpa pronta para humanização

Prazo referência: 30–60 min

[DECISÃO] Planta CAD está atualizada e com aprovação do arquiteto? Sim → prosseguir. Não → solicitar versão atualizada ao cliente.', '<p>Ação: Receber arquivo CAD do cliente; abrir no AutoCAD e verificar layers, cotas e nomenclaturas; limpar elementos desnecessários (cotas, textos, layers de estrutura); exportar planta limpa como PDF ou importar diretamente no Photoshop/Illustrator.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Planta base limpa pronta para humanização</p><p>Prazo referência: 30–60 min</p><p><strong>[DECISÃO] Planta CAD está atualizada e com aprovação do arquiteto? Sim → prosseguir. Não → solicitar versão atualizada ao cliente.</strong></p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Definição de estilo e paleta', 'Ação: Com base no briefing e referências aprovadas, definir paleta de cores para pisos, paredes e elementos; escolher estilo de mobiliário (clean linework, sombreado realista ou aquarela); registrar decisões no briefing de produção.

Responsável: Visualizador 3D / Designer 3D

Output: Style guide da planta aprovado internamente

Prazo referência: 30 min', '<p>Ação: Com base no briefing e referências aprovadas, definir paleta de cores para pisos, paredes e elementos; escolher estilo de mobiliário (clean linework, sombreado realista ou aquarela); registrar decisões no briefing de produção.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Style guide da planta aprovado internamente</p><p>Prazo referência: 30 min</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Montagem de mobiliário e ambientação', 'Ação: Inserir blocos de mobiliário da biblioteca TBO (sofa, cama, mesa, bancada etc.) nos ambientes conforme layout aprovado; ajustar escala proporcional ao CAD; inserir texturas de piso por ambiente (madeira, porcelanato, cimento queimado etc.); adicionar vegetação indoor e outdoor top-view.

Responsável: Visualizador 3D / Designer 3D

Output: Planta com mobiliário e texturas em escala

Prazo referência: 2–4 h', '<p>Ação: Inserir blocos de mobiliário da biblioteca TBO (sofa, cama, mesa, bancada etc.) nos ambientes conforme layout aprovado; ajustar escala proporcional ao CAD; inserir texturas de piso por ambiente (madeira, porcelanato, cimento queimado etc.); adicionar vegetação indoor e outdoor top-view.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Planta com mobiliário e texturas em escala</p><p>Prazo referência: 2–4 h</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Inserção de pessoas e elementos de vida', 'Ação: Adicionar silhuetas de pessoas em escala (altura referência = ~1,70 m em planta); inserir elementos de vida (livros, louças, plantas, toalhas) para dar escala e habitabilidade; ajustar opacidade e sombras para integração visual.

Responsável: Visualizador 3D / Designer 3D

Output: Planta com sensação de habitabilidade e escala humana

Prazo referência: 30–60 min', '<p>Ação: Adicionar silhuetas de pessoas em escala (altura referência = ~1,70 m em planta); inserir elementos de vida (livros, louças, plantas, toalhas) para dar escala e habitabilidade; ajustar opacidade e sombras para integração visual.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Planta com sensação de habitabilidade e escala humana</p><p>Prazo referência: 30–60 min</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Finalização, revisão e exportação', 'Ação: Revisar escala geral, proporcionalidade do mobiliário, legibilidade dos ambientes e coerência da paleta; enviar para aprovação do Dir. Criativo; após aprovação, exportar JPG 300 dpi (impressão) + PNG 72 dpi (digital) + PDF vetorial se aplicável; nomear conforme padrão TBO.

Responsável: Visualizador 3D / Designer 3D

Output: Arquivos exportados e nomeados; PSD/AI master salvo

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → ajustar (máx. 2 rodadas).', '<p>Ação: Revisar escala geral, proporcionalidade do mobiliário, legibilidade dos ambientes e coerência da paleta; enviar para aprovação do Dir. Criativo; após aprovação, exportar JPG 300 dpi (impressão) + PNG 72 dpi (digital) + PDF vetorial se aplicável; nomear conforme padrão TBO.</p><p>Responsável: Visualizador 3D / Designer 3D</p><p>Output: Arquivos exportados e nomeados; PSD/AI master salvo</p><p>Prazo referência: 1 h + ciclo revisão 24 h</p><p><strong>[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → ajustar (máx. 2 rodadas).</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Escala de mobiliário proporcional ao CAD (sofá ≈ 2,20 m, cama queen ≈ 1,60×2,00 m). [ ] Texturas de piso coerentes com o projeto de interiores. [ ] Pessoas em escala correta (≈ 1,70 m). [ ] Paleta de cor aderente ao briefing e identidade do empreendimento. [ ] Todos os ambientes identificados e humanizados conforme escopo. [ ] Legibilidade: fácil distinguir ambientes, circulações e mobiliário. [ ] Arquivos exportados nos formatos e resoluções corretos.', '<p>[ ] Escala de mobiliário proporcional ao CAD (sofá ≈ 2,20 m, cama queen ≈ 1,60×2,00 m). [ ] Texturas de piso coerentes com o projeto de interiores. [ ] Pessoas em escala correta (≈ 1,70 m). [ ] Paleta de cor aderente ao briefing e identidade do empreendimento. [ ] Todos os ambientes identificados e humanizados conforme escopo. [ ] Legibilidade: fácil distinguir ambientes, circulações e mobiliário. [ ] Arquivos exportados nos formatos e resoluções corretos.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Mobiliário fora de escala: usar linha de cota do CAD como referência (paredes de 15 cm = referência de espessura). Texturas pixeladas: usar texturas com resolução mínima de 300 dpi no tamanho final de uso. Planta com baixa legibilidade: aumentar contraste entre piso e mobiliário; adicionar outline sutil nas paredes.', '<p>Mobiliário fora de escala: usar linha de cota do CAD como referência (paredes de 15 cm = referência de espessura). Texturas pixeladas: usar texturas com resolução mínima de 300 dpi no tamanho final de uso. Planta com baixa legibilidade: aumentar contraste entre piso e mobiliário; adicionar outline sutil nas paredes.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD LT; biblioteca de blocos humanizados TBO (atualizada semestralmente); referências em Pinterest/Behance para benchmarking de estilo.', '<p>Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD LT; biblioteca de blocos humanizados TBO (atualizada semestralmente); referências em Pinterest/Behance para benchmarking de estilo.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Planta humanizada padrão (até 150 m²): entrega em 2 dias úteis. Planta humanizada complexa (150–400 m², múltiplos pavimentos): 3–4 dias úteis. Revisão após feedback do cliente: 1 dia útil por rodada (máx. 2 inclusas no escopo).', '<p>Planta humanizada padrão (até 150 m²): entrega em 2 dias úteis. Planta humanizada complexa (150–400 m², múltiplos pavimentos): 3–4 dias úteis. Revisão após feedback do cliente: 1 dia útil por rodada (máx. 2 inclusas no escopo).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe CAD do cliente → [CAD atualizado?] → Não: Solicita revisão ao cliente → Sim: Limpeza CAD → Definição de estilo → Montagem mobiliário/texturas → Inserção de pessoas/vida → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega → Fim', '<p>Início → Recebe CAD do cliente → [CAD atualizado?] → Não: Solicita revisão ao cliente → Sim: Limpeza CAD → Definição de estilo → Montagem mobiliário/texturas → Inserção de pessoas/vida → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Planta humanizada: planta baixa com mobiliário, texturas e pessoas inseridos para comunicação comercial. Top-view: vista de cima (perspectiva usada em plantas). Entourage top-view: silhuetas de pessoas e elementos vistos de cima. CAD: Computer-Aided Design, arquivo técnico de arquitetura (.dwg). Linework: estilo de ilustração baseado em linhas limpas sem preenchimento fotorrealista.', '<p>Planta humanizada: planta baixa com mobiliário, texturas e pessoas inseridos para comunicação comercial. Top-view: vista de cima (perspectiva usada em plantas). Entourage top-view: silhuetas de pessoas e elementos vistos de cima. CAD: Computer-Aided Design, arquivo técnico de arquitetura (.dwg). Linework: estilo de ilustração baseado em linhas limpas sem preenchimento fotorrealista.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-3D-006: Planta Perspectivada ──
END $$;