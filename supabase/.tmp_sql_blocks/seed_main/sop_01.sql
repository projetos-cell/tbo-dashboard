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
END $$;