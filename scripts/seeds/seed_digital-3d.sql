-- Seed: digital-3d (14 SOPs)
DO $$
DECLARE v_sop_id UUID;
BEGIN

  -- TBO-3D-001
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Modelagem 3D', 'tbo-3d-001-modelagem-3d', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 0, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Definir o fluxo completo de modelagem 3D para empreendimentos imobiliários, desde o recebimento do projeto arquitetônico até a entrega do modelo finalizado pronto para render. Este SOP garante padronização de escala, materialidade e organização de cena entre todos os artistas 3D da TBO.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem de fachadas, áreas comuns, unidades-tipo, implantação e entorno imediato. Inclui importação de CAD/BIM, modelagem poligonal, aplicação de materiais base e organização de layers/grupos.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Iluminação, renderização, pós-produção e animação são cobertos por SOPs específicos. Modelagem de mobiliário customizado sob demanda segue briefing à parte.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Equipe de render', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Projeto arquitetônico em DWG/RVT, memorial descritivo, referências visuais aprovadas pelo cliente, briefing criativo aprovado, paleta de materiais definida.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max ou SketchUp, V-Ray ou Corona, AutoCAD (leitura de plantas), servidor de assets TBO (biblioteca de materiais e mobiliário).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Recebimento e análise do projeto', 'Ação: Importar arquivos CAD/BIM, verificar escalas e cotas, identificar inconsistências

Responsável: Artista 3D

Output: Checklist de recebimento preenchido

Prazo referência: 0,5 dia', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Setup da cena', 'Ação: Criar arquivo de cena padrão TBO, configurar unidades (metros), importar base CAD limpa

Responsável: Artista 3D

Output: Cena base configurada

Prazo referência: 0,5 dia', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Modelagem de volumetria', 'Ação: Modelar estrutura principal do edifício: fachada, varandas, cobertura, térreo

Responsável: Artista 3D

Output: Modelo volumétrico aprovado

Prazo referência: 2-3 dias

[DECISÃO] Se volumetria difere do CAD, alinhar com arquiteto antes de prosseguir', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Detalhamento e materiais base', 'Ação: Adicionar detalhes arquitetônicos (caixilhos, brises, gradis), aplicar materiais da biblioteca TBO

Responsável: Artista 3D

Output: Modelo detalhado com materiais

Prazo referência: 2-3 dias', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Modelagem de entorno e paisagismo', 'Ação: Modelar entorno imediato, inserir vegetação da biblioteca, configurar terreno

Responsável: Artista 3D

Output: Cena completa com entorno

Prazo referência: 1-2 dias', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Revisão técnica', 'Ação: Verificar escala, poligonagem, naming de objetos, organização de layers

Responsável: Coordenador 3D

Output: Relatório de revisão

Prazo referência: 0,5 dia

[APROVAÇÃO] Modelo aprovado para fase de render', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.7. Entrega interna', 'Ação: Salvar versão final no servidor, documentar especificidades, handoff para equipe de render

Responsável: Artista 3D

Output: Modelo entregue + documentação

Prazo referência: 0,5 dia', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Escala correta (1 unidade = 1 metro). Sem faces invertidas ou geometria corrompida. Materiais da biblioteca TBO aplicados. Layers organizados (Fachada, Interiores, Entorno, Paisagismo, Terreno). Nomenclatura padrão de objetos. Arquivo abaixo de 500MB (otimizado).', 13, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Escala incorreta na importação de CAD (conferir cotas de referência). Excesso de polígonos em elementos distantes. Materiais duplicados na cena. Falta de organização de layers dificultando handoff.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+, SketchUp Pro 2024+, V-Ray 6+, Corona 10+, AutoCAD 2024+ (leitura), Biblioteca de Assets TBO (servidor interno), Google Drive (entrega de referências).', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Prazo padrão total: 5-8 dias úteis (dependendo da complexidade). Modelagem simples (residencial baixo): 5 dias. Modelagem média (residencial alto padrão): 7 dias. Modelagem complexa (multiuso/comercial): 10 dias. Extensão: mediante aprovação do PO com justificativa documentada.', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebimento CAD/BIM → Análise e Checklist → Setup de Cena → Modelagem Volumétrica → [DECISÃO: Volumetria OK?] → Sim: Detalhamento → Não: Retorno ao arquiteto → Materiais Base → Entorno e Paisagismo → Revisão Técnica → [APROVAÇÃO] → Entrega Interna → Fim', 17, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'CAD: Computer-Aided Design. BIM: Building Information Modeling. Poligonagem: contagem de polígonos do modelo. Layer: camada de organização de objetos. Caixilho: esquadria de janela/porta. Brise: elemento de proteção solar. KV: Key Visual (imagem-chave).', 18, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 19, 'step');

  -- TBO-3D-002
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Imagens Estáticas Câmeras e Ângulos', 'tbo-3d-002-imagens-estaticas-cameras-e-angulos', 'digital-3d', 'checklist', 'Imagens Estáticas — Câmeras e Ângulos', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 1, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Padronizar a definição de câmeras e ângulos para imagens estáticas de empreendimentos imobiliários, garantindo composição fotográfica profissional e alinhamento com o briefing criativo.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Posicionamento de câmeras, definição de lentes, composição, ângulos padrão por tipo de imagem (fachada, aérea, interna, detalhe).', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Iluminação, render settings e pós-produção são tratados em SOPs separados.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Cliente', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Modelo 3D finalizado (SOP TBO-3D-001), briefing criativo com referências visuais, lista de imagens contratadas.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max ou SketchUp, V-Ray/Corona Physical Camera, referências fotográficas do briefing.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Análise do briefing visual', 'Ação: Estudar referências visuais, identificar ângulos-chave, mapear imagens contratadas

Responsável: Artista 3D

Output: Lista de câmeras planejadas

Prazo referência: 0,5 dia', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Setup de câmeras', 'Ação: Posicionar câmeras na cena com lentes adequadas (24mm fachada, 18mm aérea, 28mm interna)

Responsável: Artista 3D

Output: Câmeras posicionadas

Prazo referência: 0,5 dia', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Composição e enquadramento', 'Ação: Aplicar regra dos terços, linhas de fuga, ponto focal. Gerar previews de baixa resolução.

Responsável: Artista 3D

Output: Previews para aprovação

Prazo referência: 0,5 dia', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Aprovação de ângulos', 'Ação: Submeter previews para aprovação da direção criativa

Responsável: Marco Andolfato

Output: Ângulos aprovados

Prazo referência: 1 dia

[APROVAÇÃO] Direção criativa aprova composição antes do render final', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Horizonte nivelado. Sem distorção excessiva de lente. Ponto focal claro. Linhas verticais paralelas (correção de perspectiva). Proporção correta do empreendimento. Enquadramento valoriza fachada principal.', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Lente muito aberta distorcendo proporções. Câmera muito alta (efeito drone não intencional). Composição centralizada sem dinamismo. Falta de contexto urbano no enquadramento.', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max/SketchUp, V-Ray Physical Camera, Photoshop (overlay de composição), referências Pinterest/Archdaily.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Definição de câmeras: 1 dia útil. Aprovação: até 2 dias úteis com revisão. Extensão: nova rodada de ajuste = +0,5 dia.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Análise de Briefing → Setup de Câmeras → Composição → Preview → [APROVAÇÃO Dir. Criativa] → Aprovado: Seguir para Render → Reprovado: Ajustar câmeras → Fim', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Lente: distância focal da câmera virtual em mm. Regra dos terços: divisão do frame em 9 partes iguais para composição. Preview: imagem de baixa resolução para validação. Ponto focal: elemento principal de atenção na composição.', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 16, 'step');

  -- TBO-3D-003
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Imagens Estáticas Iluminação e Render', 'tbo-3d-003-imagens-estaticas-iluminacao-e-render', 'digital-3d', 'checklist', 'Imagens Estáticas — Iluminação e Render', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 2, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Configurar iluminação fotorrealista e executar o render final de imagens estáticas de arquitetura, garantindo qualidade técnica e aderência ao briefing criativo aprovado.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Setup de iluminação (HDRI, luz solar, luz artificial), configuração de câmera, ajuste de materiais para render, renderização via V-Ray ou Corona Renderer, gestão de passes de render (beauty, diffuse, specular, shadow, depth, AO).', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização (cobertas pelo SOP 02), pós-produção em Photoshop (coberta pelo SOP 04), aprovação criativa do briefing.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cena 3D finalizada e aprovada (output do SOP 02); briefing criativo com referências de luz, hora do dia, clima e ângulo de câmera; aprovação do storyboard/ângulos pelo cliente.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max + V-Ray ou Corona Renderer; biblioteca HDRI (HDRI Haven / custom TBO); render farm local ou Chaos Cloud; monitor calibrado (perfil sRGB); checklist de iluminação TBO.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Revisão de briefing e referências', 'Ação: Revisar briefing criativo e moodboard aprovado pelo cliente; identificar hora do dia, clima, temperatura de cor e atmosfera desejada; listar ângulos de câmera solicitados.

Responsável: Visualizador 3D Sênior

Output: Lista de parâmetros de iluminação e ângulos confirmados

Prazo referência: 30 min', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Setup de iluminação', 'Ação: Configurar VRaySun/VRaySky ou Corona Sun + HDRI para cena exterior; para interiores, configurar luzes artificiais (IES, retangulares, spot) conforme projeto luminotécnico; ajustar intensidade e temperatura de cor.

Responsável: Visualizador 3D Sênior

Output: Iluminação configurada e testada em preview

Prazo referência: 1–2 h

[DECISÃO] A direção de luz e temperatura de cor batem com a referência aprovada? Sim → prosseguir. Não → ajustar e retestar.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Configuração de câmera e composição', 'Ação: Posicionar câmera com altura de olho realista (1,65 m para exterior; 1,20 m para interiores); ajustar FOV (24–35 mm equiv.); aplicar regra dos terços; configurar profundidade de campo se aprovada no briefing.

Responsável: Visualizador 3D Sênior

Output: Câmera posicionada com composição aprovada

Prazo referência: 30–45 min', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Render de teste (baixa resolução)', 'Ação: Executar render de teste em resolução reduzida (800×450 px, qualidade draft); verificar iluminação, sombras, reflexos, materiais problemáticos e artefatos de render.

Responsável: Visualizador 3D Sênior

Output: Imagem de teste revisada e lista de ajustes documentada

Prazo referência: 30–60 min

[DECISÃO] Teste aprovado internamente? Sim → submeter ao Diretor Criativo. Não → corrigir e retestar.', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Aprovação interna e ajustes finais', 'Ação: Enviar render de teste ao Diretor Criativo via plataforma de gestão (TBO OS); incorporar feedback; realizar ajustes de luz, câmera e materiais conforme indicado.

Responsável: Visualizador 3D Sênior

Output: Cena aprovada internamente para render final

Prazo referência: 1–3 h (incluindo ciclo de feedback)

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → render final. Não → novo ciclo de ajuste.', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Render final com passes', 'Ação: Configurar resolução final (mínimo 4000×2250 px para impressão; 1920×1080 para digital); renderizar beauty pass + passes complementares (diffuse, reflection, shadow, depth, AO, mask por objeto); salvar em EXR 32-bit por passe.

Responsável: Visualizador 3D Sênior

Output: Pasta de passes organizados em EXR, nomeados conforme convenção TBO

Prazo referência: 2–8 h (variável por complexidade e hardware)', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Iluminação coerente com hora do dia e clima do briefing. [ ] Temperatura de cor dentro da faixa aprovada (±200K). [ ] Ausência de artefatos de render (fireflies, manchas, z-fighting). [ ] Todos os passes de render presentes e nomeados corretamente. [ ] Resolução mínima atendida. [ ] Câmera em altura realista. [ ] Arquivo EXR salvo com backup na nuvem.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Fireflies/ruído excessivo: aumentar amostras de render ou usar denoiser (VRay Denoiser / Corona Denoiser). Materiais pretos/errados no render: verificar paths de textura e unidades da cena. Sombras muito duras ou ausentes: revisar configuração de VRaySun e enable shadows. Render com cor estourada: verificar exposure/white balance da câmera.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou render farm local; HDRI Haven library; VFB (V-Ray Frame Buffer) / Corona VFB; calibrador de monitor Datacolor/X-Rite.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Render de teste (draft): entregue em até 4 h após início do setup. Ciclo de revisão interna: até 24 h. Render final (por ângulo, cena média): 4–12 h de processamento. Entrega de passes ao pós: no mesmo dia do render final.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Revisão de briefing → Setup de iluminação → Config. câmera → Render draft → [APROVAÇÃO INTERNA: OK?] → Não: Ajustes → Render draft (loop) → Sim: Render final com passes → Organização de passes EXR → Handoff para Pós-produção → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'HDRI: High Dynamic Range Image, mapa esférico usado como fonte de luz e reflexo. Passes de render: camadas separadas do render final (sombra, reflexo, AO etc.) para composição em pós. Fireflies: pixels superiluminados causados por ruído de Monte Carlo em engines de ray-tracing. EXR: formato de imagem HDR de 32 bits, padrão VFX/arquitetura. FOV: Field of View, ângulo de visão da câmera 3D. IES: perfil fotométrico de lâmpada real usado em iluminação artificial 3D.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-3D-004
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Imagens Estáticas Pós produção', 'tbo-3d-004-imagens-estaticas-pos-producao', 'digital-3d', 'checklist', 'Imagens Estáticas — Pós-produção', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 3, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Realizar o tratamento completo das imagens estáticas em pós-produção — compositing de passes, correção de cor, inserção de elementos de ambientação e finalização para entrega — gerando arquivos prontos para apresentação ao cliente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Compositing de passes de render no Photoshop; correção e gradação de cor; inserção de elementos 2D (céu, vegetação, pessoas, veículos, reflexos de poça); ajustes locais de luz e sombra; finalização e exportação em formatos de entrega.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Renderização 3D (coberta pelo SOP 03); tratamento de vídeo e animações (cobertos pelos SOPs 09–11); criação de peças de marketing final (responsabilidade do time de Design).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Pasta de passes EXR entregue pelo Visualizador 3D (output SOP 03); briefing criativo com referências de cor, clima e estilo de ambientação; biblioteca de assets 2D TBO (céus, pessoas, vegetação PNG recortados).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Photoshop 2024+; Adobe Camera Raw; biblioteca de assets 2D TBO (sky library, entourage library); Nik Collection (opcional para gradação); monitor calibrado; perfil de cor sRGB.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Importação e organização de passes', 'Ação: Abrir passes EXR no Photoshop; nomear grupos e layers conforme convenção TBO (Beauty, Diffuse, Reflection, Shadow, AO, Depth, Masks); configurar modo de mesclagem correto por passe (Multiply para AO, Screen para reflexos etc.).

Responsável: Pós-produtor

Output: Arquivo PSD organizado com passes em grupos nomeados

Prazo referência: 30–45 min', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Compositing base e ajuste de exposição', 'Ação: Montar composição base com passes; ajustar exposição geral e balanço de branco via Camera Raw; revisar áreas críticas (janelas, céu, sombras profundas); garantir que o range dinâmico esteja equilibrado.

Responsável: Pós-produtor

Output: Composição base equilibrada e revisada

Prazo referência: 30–60 min

[DECISÃO] Base está equilibrada e sem artefatos visíveis? Sim → prosseguir. Não → solicitar re-render de passe específico ao 3D.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Inserção de elementos de ambientação', 'Ação: Inserir céu (da sky library TBO ou sky photography aprovada); adicionar vegetação, pessoas, veículos e outros entourage em escala correta; ajustar sombras e reflexos dos elementos inseridos para integração realista; inserir efeitos atmosféricos (névoa, god rays) se indicado no briefing.

Responsável: Pós-produtor

Output: Imagem com ambientação completa e escala coerente

Prazo referência: 1–3 h', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Gradação de cor e finalização criativa', 'Ação: Aplicar gradação de cor (LUT ou ajustes Curves/Hue-Saturation) conforme referência do briefing; reforçar contraste local em pontos de interesse; suavizar transições entre elementos 3D e 2D inseridos; aplicar vignette sutil se adequado ao estilo.

Responsável: Pós-produtor

Output: Versão final com paleta de cor aprovada

Prazo referência: 30–60 min', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Revisão interna e aprovação do Dir. Criativo', 'Ação: Enviar versão final para revisão do Diretor Criativo via TBO OS (comments na tarefa); incorporar feedback de cor, elementos e ajustes; máximo de 2 rodadas de revisão interna.

Responsável: Pós-produtor

Output: Imagem aprovada internamente

Prazo referência: 24 h (ciclo de revisão)

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → novo ciclo (máx. 2x).', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Exportação e nomenclatura final', 'Ação: Exportar JPEG alta qualidade (90–95%, sRGB, 72 dpi para digital / 300 dpi para impressão); exportar PNG sem fundo se solicitado; salvar PSD master com layers preservadas; nomear arquivos conforme padrão: [PROJETO]_[ANGULO]_[VERSAO]_[DATA].

Responsável: Pós-produtor

Output: Arquivos finais exportados e nomeados; PSD master salvo em servidor

Prazo referência: 30 min', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Passes corretamente compostos (sem banding, sem artefatos de borda). [ ] Elementos de ambientação em escala correta e com sombra coerente. [ ] Paleta de cor aderente ao briefing. [ ] Sem halos ou franjas em bordas de recorte. [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] PSD master salvo no servidor com todas as layers. [ ] Nomenclatura de arquivo conforme padrão TBO.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Halo branco em recortes: refinar máscara com Select and Mask ou Defringe. Escala errada de entourage: recalibrar pela altura de portas/pessoas (porta padrão = 2,10 m). Cor dessaturada/acinzentada: verificar perfil de cor do documento (deve ser sRGB IEC61966-2.1). Artefatos de compressão no JPEG: aumentar qualidade para 95 ou exportar como TIFF.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Photoshop 2024+; Adobe Camera Raw; Nik Color Efex Pro (opcional); biblioteca TBO de assets 2D (sky, entourage); Pantone Connect (para validação de cor em materiais de impressão).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Compositing + inserção de elementos: 3–6 h por imagem. Ciclo de revisão interna: até 24 h por rodada. Máximo de 2 rodadas de revisão interna inclusas. Exportação final: entregue no mesmo dia da aprovação interna.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe passes EXR → Importação e organização no PSD → Compositing base → [ARTEFATOS?] → Sim: Solicita re-render → Não: Inserção de ambientação → Gradação de cor → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega ao Gerente de Projetos → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Passes de render: camadas separadas para composição flexível em pós. Entourage: elementos de ambientação (pessoas, carros, vegetação) inseridos em pós. Compositing: processo de combinar múltiplas camadas/imagens em uma composição final. LUT: Look-Up Table, tabela de gradação de cor pré-definida. Vignette: escurecimento sutil das bordas para guiar o olhar ao centro. PSD master: arquivo Photoshop com todas as layers preservadas para futuras revisões.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-3D-005
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Plantas Humanizadas', 'tbo-3d-005-plantas-humanizadas', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 4, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir plantas baixas humanizadas de alta qualidade — com mobiliário, vegetação, pessoas e acabamentos ilustrados — que comuniquem o espaço de forma atraente e comercial para materiais de venda do empreendimento.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Recebimento e preparo de planta CAD/PDF; montagem em Photoshop ou Illustrator com mobiliário vetorial/bitmap; inserção de texturas de piso, vegetação, pessoas vista superior e elementos decorativos; exportação em formatos para uso em material gráfico e digital.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Desenho técnico arquitetônico (responsabilidade do escritório de arquitetura); layout de mobiliário (responsabilidade do projeto de interiores); adaptações para marketing (responsabilidade do time de Design).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Arquivo CAD (.dwg) ou PDF vetorial da planta baixa aprovada pelo arquiteto; briefing com estilo visual desejado (clean/minimalista, aquarela, colorido, dark); lista de ambientes a humanizar; referências visuais aprovadas.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD ou DraftSight (para extração de linhas CAD); biblioteca de blocos humanizados TBO (mobiliário, vegetação, pessoas top-view); Sketchup (opcional para perspectiva isométrica).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Recebimento e limpeza do CAD', 'Ação: Receber arquivo CAD do cliente; abrir no AutoCAD e verificar layers, cotas e nomenclaturas; limpar elementos desnecessários (cotas, textos, layers de estrutura); exportar planta limpa como PDF ou importar diretamente no Photoshop/Illustrator.

Responsável: Visualizador 3D / Designer 3D

Output: Planta base limpa pronta para humanização

Prazo referência: 30–60 min

[DECISÃO] Planta CAD está atualizada e com aprovação do arquiteto? Sim → prosseguir. Não → solicitar versão atualizada ao cliente.', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Definição de estilo e paleta', 'Ação: Com base no briefing e referências aprovadas, definir paleta de cores para pisos, paredes e elementos; escolher estilo de mobiliário (clean linework, sombreado realista ou aquarela); registrar decisões no briefing de produção.

Responsável: Visualizador 3D / Designer 3D

Output: Style guide da planta aprovado internamente

Prazo referência: 30 min', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Montagem de mobiliário e ambientação', 'Ação: Inserir blocos de mobiliário da biblioteca TBO (sofa, cama, mesa, bancada etc.) nos ambientes conforme layout aprovado; ajustar escala proporcional ao CAD; inserir texturas de piso por ambiente (madeira, porcelanato, cimento queimado etc.); adicionar vegetação indoor e outdoor top-view.

Responsável: Visualizador 3D / Designer 3D

Output: Planta com mobiliário e texturas em escala

Prazo referência: 2–4 h', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Inserção de pessoas e elementos de vida', 'Ação: Adicionar silhuetas de pessoas em escala (altura referência = ~1,70 m em planta); inserir elementos de vida (livros, louças, plantas, toalhas) para dar escala e habitabilidade; ajustar opacidade e sombras para integração visual.

Responsável: Visualizador 3D / Designer 3D

Output: Planta com sensação de habitabilidade e escala humana

Prazo referência: 30–60 min', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Finalização, revisão e exportação', 'Ação: Revisar escala geral, proporcionalidade do mobiliário, legibilidade dos ambientes e coerência da paleta; enviar para aprovação do Dir. Criativo; após aprovação, exportar JPG 300 dpi (impressão) + PNG 72 dpi (digital) + PDF vetorial se aplicável; nomear conforme padrão TBO.

Responsável: Visualizador 3D / Designer 3D

Output: Arquivos exportados e nomeados; PSD/AI master salvo

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar. Não → ajustar (máx. 2 rodadas).', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Escala de mobiliário proporcional ao CAD (sofá ≈ 2,20 m, cama queen ≈ 1,60×2,00 m). [ ] Texturas de piso coerentes com o projeto de interiores. [ ] Pessoas em escala correta (≈ 1,70 m). [ ] Paleta de cor aderente ao briefing e identidade do empreendimento. [ ] Todos os ambientes identificados e humanizados conforme escopo. [ ] Legibilidade: fácil distinguir ambientes, circulações e mobiliário. [ ] Arquivos exportados nos formatos e resoluções corretos.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Mobiliário fora de escala: usar linha de cota do CAD como referência (paredes de 15 cm = referência de espessura). Texturas pixeladas: usar texturas com resolução mínima de 300 dpi no tamanho final de uso. Planta com baixa legibilidade: aumentar contraste entre piso e mobiliário; adicionar outline sutil nas paredes.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Photoshop 2024+; Adobe Illustrator 2024+; AutoCAD LT; biblioteca de blocos humanizados TBO (atualizada semestralmente); referências em Pinterest/Behance para benchmarking de estilo.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Planta humanizada padrão (até 150 m²): entrega em 2 dias úteis. Planta humanizada complexa (150–400 m², múltiplos pavimentos): 3–4 dias úteis. Revisão após feedback do cliente: 1 dia útil por rodada (máx. 2 inclusas no escopo).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe CAD do cliente → [CAD atualizado?] → Não: Solicita revisão ao cliente → Sim: Limpeza CAD → Definição de estilo → Montagem mobiliário/texturas → Inserção de pessoas/vida → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes (max 2x) → Sim: Exportação final → Entrega → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Planta humanizada: planta baixa com mobiliário, texturas e pessoas inseridos para comunicação comercial. Top-view: vista de cima (perspectiva usada em plantas). Entourage top-view: silhuetas de pessoas e elementos vistos de cima. CAD: Computer-Aided Design, arquivo técnico de arquitetura (.dwg). Linework: estilo de ilustração baseado em linhas limpas sem preenchimento fotorrealista.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-006
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Planta Perspectivada', 'tbo-3d-006-planta-perspectivada', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Planta Perspectivada

Código

TBO-3D-006

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

Criar plantas perspectivadas (isométricas ou com perspectiva cônica) que permitam ao comprador visualizar o espaço em três dimensões, comunicando pé-direito, volumetria interna e layout de forma intuitiva.

  2. Escopo

2.1 O que está coberto

Modelagem simplificada do layout em 3D (SketchUp ou 3ds Max); configuração de câmera isométrica ou perspectiva; renderização e pós-produção; inserção de mobiliário 3D simplificado; finalização para uso em material comercial.

2.2 Exclusões

Renderização fotorrealista de fachada (coberta pelo SOP 03); planta humanizada 2D (coberta pelo SOP 05); modelagem completa de interiores com materiais fotorrealistas.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D

Modelagem, configuração de câmera e render da planta perspectivada

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo, estilo visual e versão final

Aprovador

—

Gerente de Projetos

Briefing com cliente e entrega de arquivos

Consultado

Informado

Designer Gráfico

Integrar planta perspectivada em layouts de material comercial

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Planta CAD (.dwg) atualizada e aprovada; briefing definindo estilo (isométrico clean, perspectiva realista, estilo explodido); referências visuais aprovadas; lista de ambientes a incluir na visualização.

4.2 Ferramentas e Acessos

SketchUp Pro 2023+ ou 3ds Max; V-Ray for SketchUp ou 3ds Max; Adobe Photoshop; biblioteca de mobiliário 3D simplificado TBO; LayOut (SketchUp) para isométricas técnicas.



  5. Procedimento Passo a Passo

5.1. Importação do CAD e modelagem base

Ação: Importar CAD para SketchUp ou 3ds Max; extrudar paredes na altura de pé-direito real (ex.: 2,70 m, 3,00 m); modelar laje, vãos de porta e janela; não modelar detalhes de acabamento (simplificação intencional).

Responsável: Visualizador 3D

Output: Modelo 3D simplificado com geometria fiel à planta

Prazo referência: 1–2 h

5.2. Inserção de mobiliário 3D simplificado

Ação: Popular os ambientes com mobiliário 3D low-poly da biblioteca TBO; manter escala proporcional; evitar mobiliário excessivamente detalhado — o foco é leitura espacial, não fotorrealismo.

Responsável: Visualizador 3D

Output: Cena com mobiliário em escala e bem distribuído

Prazo referência: 1–2 h

5.3. Configuração de câmera isométrica ou perspectiva

Ação: Para isométrica: configurar projeção paralela em SketchUp (Camera > Parallel Projection), ângulo 45°; para perspectiva cônica: FOV 30–45 mm, câmera elevada; validar com o briefing o ângulo aprovado.

Responsável: Visualizador 3D

Output: Câmera configurada com ângulo aprovado

Prazo referência: 30 min

[DECISÃO] Ângulo e enquadramento aprovados internamente? Sim → render. Não → ajustar câmera.

5.4. Render e linhas de estilo

Ação: Renderizar a cena com iluminação neutra (luz ambiente uniforme + sombra suave); adicionar linhas de arestas (edge rendering) para leitura clara de volumes; se estilo aquarela/sketch, aplicar estilo no SketchUp Style Builder.

Responsável: Visualizador 3D

Output: Render com estilo visual definido exportado

Prazo referência: 1–3 h

5.5. Pós-produção e finalização

Ação: Tratar render no Photoshop: ajustar cor e contraste; inserir fundo branco ou gradiente; adicionar legenda de ambientes (tipografia padrão TBO); inserir escala gráfica e norte se aplicável; revisar com Dir. Criativo e exportar.

Responsável: Visualizador 3D / Pós-produtor

Output: Planta perspectivada finalizada e exportada

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas).

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Pé-direito correto e proporcional (verificar com medida real do projeto). [ ] Mobiliário em escala coerente. [ ] Linhas de aresta limpas e legíveis. [ ] Legenda de ambientes presente e legível. [ ] Estilo visual aderente ao briefing. [ ] Exportação em resolução adequada ao uso (impressão ou digital). [ ] Nomenclatura de arquivo conforme padrão TBO.

6.2 Erros Comuns a Evitar

Proporção distorcida: verificar se pé-direito e largura estão na mesma unidade no CAD importado (1 unidade = 1 cm no SketchUp). Isométrica deformada: confirmar que Parallel Projection está ativado no SketchUp. Mobiliário gigante/minúsculo: reescalar usando grupos e verificar com porta como referência (2,10 m).

  7. Ferramentas e Templates

SketchUp Pro 2023+ com V-Ray for SketchUp; 3ds Max + Corona (alternativa para renders mais realistas); Photoshop; LayOut para composição final com legendas e escalas.

  8. SLAs e Prazos

Planta perspectivada padrão (até 100 m²): 2 dias úteis. Planta perspectivada complexa / múltiplos ângulos: 3–4 dias úteis. Revisão pós-feedback cliente: 1 dia útil por rodada.

  9. Fluxograma

Início → Recebe CAD → Modelagem base (extrusão de paredes) → Inserção de mobiliário → Config. câmera → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render → Pós-produção + legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação → Fim

  10. Glossário

Isométrica: projeção paralela em 30/45° que mantém proporções sem convergência de paralelas. Perspectiva cônica: projeção com ponto de fuga, mais próxima da percepção humana real. Pé-direito: altura interna entre o piso e o teto. Edge rendering: técnica de renderizar linhas de aresta sobre a imagem para reforçar leitura volumétrica. Low-poly: modelo 3D com baixa contagem de polígonos, usado para visualizações esquemáticas.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 5, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Criar plantas perspectivadas (isométricas ou com perspectiva cônica) que permitam ao comprador visualizar o espaço em três dimensões, comunicando pé-direito, volumetria interna e layout de forma intuitiva.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Modelagem simplificada do layout em 3D (SketchUp ou 3ds Max); configuração de câmera isométrica ou perspectiva; renderização e pós-produção; inserção de mobiliário 3D simplificado; finalização para uso em material comercial.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Renderização fotorrealista de fachada (coberta pelo SOP 03); planta humanizada 2D (coberta pelo SOP 05); modelagem completa de interiores com materiais fotorrealistas.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D

Modelagem, configuração de câmera e render da planta perspectivada

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo, estilo visual e versão final

Aprovador

—

Gerente de Projetos

Briefing com cliente e entrega de arquivos

Consultado

Informado

Designer Gráfico

Integrar planta perspectivada em layouts de material comercial

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Planta CAD (.dwg) atualizada e aprovada; briefing definindo estilo (isométrico clean, perspectiva realista, estilo explodido); referências visuais aprovadas; lista de ambientes a incluir na visualização.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'SketchUp Pro 2023+ ou 3ds Max; V-Ray for SketchUp ou 3ds Max; Adobe Photoshop; biblioteca de mobiliário 3D simplificado TBO; LayOut (SketchUp) para isométricas técnicas.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Importação do CAD e modelagem base', 'Ação: Importar CAD para SketchUp ou 3ds Max; extrudar paredes na altura de pé-direito real (ex.: 2,70 m, 3,00 m); modelar laje, vãos de porta e janela; não modelar detalhes de acabamento (simplificação intencional).

Responsável: Visualizador 3D

Output: Modelo 3D simplificado com geometria fiel à planta

Prazo referência: 1–2 h', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Inserção de mobiliário 3D simplificado', 'Ação: Popular os ambientes com mobiliário 3D low-poly da biblioteca TBO; manter escala proporcional; evitar mobiliário excessivamente detalhado — o foco é leitura espacial, não fotorrealismo.

Responsável: Visualizador 3D

Output: Cena com mobiliário em escala e bem distribuído

Prazo referência: 1–2 h', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Configuração de câmera isométrica ou perspectiva', 'Ação: Para isométrica: configurar projeção paralela em SketchUp (Camera > Parallel Projection), ângulo 45°; para perspectiva cônica: FOV 30–45 mm, câmera elevada; validar com o briefing o ângulo aprovado.

Responsável: Visualizador 3D

Output: Câmera configurada com ângulo aprovado

Prazo referência: 30 min

[DECISÃO] Ângulo e enquadramento aprovados internamente? Sim → render. Não → ajustar câmera.', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Render e linhas de estilo', 'Ação: Renderizar a cena com iluminação neutra (luz ambiente uniforme + sombra suave); adicionar linhas de arestas (edge rendering) para leitura clara de volumes; se estilo aquarela/sketch, aplicar estilo no SketchUp Style Builder.

Responsável: Visualizador 3D

Output: Render com estilo visual definido exportado

Prazo referência: 1–3 h', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Pós-produção e finalização', 'Ação: Tratar render no Photoshop: ajustar cor e contraste; inserir fundo branco ou gradiente; adicionar legenda de ambientes (tipografia padrão TBO); inserir escala gráfica e norte se aplicável; revisar com Dir. Criativo e exportar.

Responsável: Visualizador 3D / Pós-produtor

Output: Planta perspectivada finalizada e exportada

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas).', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Pé-direito correto e proporcional (verificar com medida real do projeto). [ ] Mobiliário em escala coerente. [ ] Linhas de aresta limpas e legíveis. [ ] Legenda de ambientes presente e legível. [ ] Estilo visual aderente ao briefing. [ ] Exportação em resolução adequada ao uso (impressão ou digital). [ ] Nomenclatura de arquivo conforme padrão TBO.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Proporção distorcida: verificar se pé-direito e largura estão na mesma unidade no CAD importado (1 unidade = 1 cm no SketchUp). Isométrica deformada: confirmar que Parallel Projection está ativado no SketchUp. Mobiliário gigante/minúsculo: reescalar usando grupos e verificar com porta como referência (2,10 m).', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'SketchUp Pro 2023+ com V-Ray for SketchUp; 3ds Max + Corona (alternativa para renders mais realistas); Photoshop; LayOut para composição final com legendas e escalas.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Planta perspectivada padrão (até 100 m²): 2 dias úteis. Planta perspectivada complexa / múltiplos ângulos: 3–4 dias úteis. Revisão pós-feedback cliente: 1 dia útil por rodada.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe CAD → Modelagem base (extrusão de paredes) → Inserção de mobiliário → Config. câmera → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render → Pós-produção + legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Isométrica: projeção paralela em 30/45° que mantém proporções sem convergência de paralelas. Perspectiva cônica: projeção com ponto de fuga, mais próxima da percepção humana real. Pé-direito: altura interna entre o piso e o teto. Edge rendering: técnica de renderizar linhas de aresta sobre a imagem para reforçar leitura volumétrica. Low-poly: modelo 3D com baixa contagem de polígonos, usado para visualizações esquemáticas.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-007
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Implantações Humanizadas', 'tbo-3d-007-implantacoes-humanizadas', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Implantações Humanizadas

Código

TBO-3D-007

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

Produzir imagens de implantação humanizada do empreendimento — vista aérea ou axonométrica do terreno com o projeto implantado, área de lazer, paisagismo e contexto urbano — para uso em material comercial e apresentações ao cliente.

  2. Escopo

2.1 O que está coberto

Montagem de implantação aérea/axonométrica a partir de CAD de implantação; inserção de fachadas renderizadas, paisagismo 3D ou 2D, pessoas, veículos; tratamento de contexto urbano (ruas, lotes vizinhos, arborização); pós-produção e finalização.

2.2 Exclusões

Render fotorrealista de fachada (coberta pelo SOP 03); projeto de paisagismo e posicionamento de blocos (responsabilidade do arquiteto); imagens aéreas reais de drone.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Produzir implantação humanizada completa

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo aéreo, paleta e versão final

Aprovador

—

Gerente de Projetos

Receber CAD do cliente e fazer briefing

Consultado

Informado

Arquiteto / Incorporadora

Fornecer CAD de implantação atualizado e aprovar posicionamento de blocos

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

CAD de implantação com todos os blocos posicionados, vias, áreas comuns e limites de terreno; renders de fachada aprovados (output SOP 03/04); briefing com estilo (realista, aquarela, colorido clean); imagem de satélite do entorno (Google Maps ou Nearmap).

4.2 Ferramentas e Acessos

3ds Max ou SketchUp (modelagem do entorno); V-Ray / Corona (render); Photoshop (compositing aéreo); Google Maps / Nearmap (referência de entorno); biblioteca de assets aéreos TBO (árvores top-view, veículos, sombras).



  5. Procedimento Passo a Passo

5.1. Análise do CAD e mapeamento do entorno

Ação: Abrir CAD de implantação; identificar todos os blocos, áreas de lazer, vias internas e externas, limites de terreno; capturar imagem de satélite do entorno no Google Maps ou Nearmap para referência de contexto urbano e arborização existente.

Responsável: Visualizador 3D Sênior

Output: CAD mapeado + imagem de satélite do entorno salva

Prazo referência: 30–45 min

5.2. Modelagem do empreendimento e entorno

Ação: Modelar volumes dos blocos em 3D com alturas corretas (número de pavimentos × pé-direito); modelar cobertura, piscina, quadra e demais elementos de lazer; modelar entorno simplificado (ruas, calçadas, lotes vizinhos sem detalhe de fachada).

Responsável: Visualizador 3D Sênior

Output: Modelo 3D de implantação com entorno simplificado

Prazo referência: 2–4 h

5.3. Configuração de câmera aérea e render

Ação: Posicionar câmera aérea em altitude que mostre o empreendimento completo + contexto; ângulo sugerido: 45–60° de elevação; configurar iluminação solar de horário nobre (14–16h, luz dourada); renderizar com passes para compositing.

Responsável: Visualizador 3D Sênior

Output: Render aéreo base com passes exportados

Prazo referência: 2–6 h

[DECISÃO] Ângulo aéreo aprovado internamente? Sim → prosseguir. Não → reposicionar câmera.

5.4. Compositing e humanização

Ação: Compor passes no Photoshop; substituir céu por imagem de qualidade da sky library; inserir árvores e paisagismo em escala real (palmeira = 8–12 m, ipê = 6–8 m); adicionar veículos e pessoas em escala; inserir sombras projetadas dos elementos 2D inseridos; ajustar cor para integração.

Responsável: Visualizador 3D Sênior / Pós-produtor

Output: Implantação humanizada com paisagismo e contexto integrados

Prazo referência: 3–5 h

5.5. Legenda, revisão e exportação

Ação: Adicionar legenda com identificação de blocos, áreas e pontos de destaque conforme briefing do cliente; enviar para revisão do Dir. Criativo; incorporar feedback; exportar JPG 300 dpi + PNG + versão sem legenda para uso flexível.

Responsável: Visualizador 3D Sênior

Output: Implantação humanizada finalizada e exportada em múltiplas versões

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo e pelo cliente? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas inclusas).

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Alturas dos blocos corretas (conferir gabarito no CAD). [ ] Paisagismo em escala real. [ ] Entorno simplificado mas reconhecível. [ ] Iluminação solar coerente (sombras na direção correta). [ ] Legenda presente e legível. [ ] Sem distorção de perspectiva aérea. [ ] Exportação em múltiplas versões (com/sem legenda, JPG/PNG). [ ] Nomes de arquivo conforme padrão TBO.

6.2 Erros Comuns a Evitar

Blocos com altura errada: verificar número de pavimentos no memorial descritivo ou corte do projeto. Árvores em escala incorreta: usar altura média de espécie (palmeira imperial ≈ 15 m, ipê ≈ 7 m, gramínea ≈ 0,5 m). Sombras de elementos 2D inconsistentes com o render: criar sombra sintética no Photoshop com Multiply + blur compatível com ângulo solar do render.

  7. Ferramentas e Templates

SketchUp Pro + V-Ray for SketchUp; 3ds Max + Corona; Photoshop; Google Maps / Nearmap; biblioteca de assets aéreos TBO; SunCalc.net (para calcular ângulo solar real por data e localização).

  8. SLAs e Prazos

Implantação humanizada padrão (até 4 blocos): 3–4 dias úteis. Implantação complexa (condomínio clube, múltiplos blocos, área de lazer extensa): 5–7 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas).

  9. Fluxograma

Início → Recebe CAD implantação → Análise + satélite do entorno → Modelagem blocos + entorno → Config. câmera aérea → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render com passes → Compositing + paisagismo → Legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação múltiplas versões → Fim

  10. Glossário

Implantação: planta/imagem mostrando o posicionamento do empreendimento no terreno e seu entorno. Axonométrica: projeção paralela que mostra largura, profundidade e altura sem perspectiva. Gabarito: número máximo de pavimentos permitido para o lote. Nearmap: serviço de imagens aéreas de alta resolução e data recente. Paisagismo top-view: representação de árvores e arbustos vistos de cima.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 6, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir imagens de implantação humanizada do empreendimento — vista aérea ou axonométrica do terreno com o projeto implantado, área de lazer, paisagismo e contexto urbano — para uso em material comercial e apresentações ao cliente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Montagem de implantação aérea/axonométrica a partir de CAD de implantação; inserção de fachadas renderizadas, paisagismo 3D ou 2D, pessoas, veículos; tratamento de contexto urbano (ruas, lotes vizinhos, arborização); pós-produção e finalização.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Render fotorrealista de fachada (coberta pelo SOP 03); projeto de paisagismo e posicionamento de blocos (responsabilidade do arquiteto); imagens aéreas reais de drone.', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Produzir implantação humanizada completa

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar ângulo aéreo, paleta e versão final

Aprovador

—

Gerente de Projetos

Receber CAD do cliente e fazer briefing

Consultado

Informado

Arquiteto / Incorporadora

Fornecer CAD de implantação atualizado e aprovar posicionamento de blocos

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'CAD de implantação com todos os blocos posicionados, vias, áreas comuns e limites de terreno; renders de fachada aprovados (output SOP 03/04); briefing com estilo (realista, aquarela, colorido clean); imagem de satélite do entorno (Google Maps ou Nearmap).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max ou SketchUp (modelagem do entorno); V-Ray / Corona (render); Photoshop (compositing aéreo); Google Maps / Nearmap (referência de entorno); biblioteca de assets aéreos TBO (árvores top-view, veículos, sombras).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Análise do CAD e mapeamento do entorno', 'Ação: Abrir CAD de implantação; identificar todos os blocos, áreas de lazer, vias internas e externas, limites de terreno; capturar imagem de satélite do entorno no Google Maps ou Nearmap para referência de contexto urbano e arborização existente.

Responsável: Visualizador 3D Sênior

Output: CAD mapeado + imagem de satélite do entorno salva

Prazo referência: 30–45 min', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Modelagem do empreendimento e entorno', 'Ação: Modelar volumes dos blocos em 3D com alturas corretas (número de pavimentos × pé-direito); modelar cobertura, piscina, quadra e demais elementos de lazer; modelar entorno simplificado (ruas, calçadas, lotes vizinhos sem detalhe de fachada).

Responsável: Visualizador 3D Sênior

Output: Modelo 3D de implantação com entorno simplificado

Prazo referência: 2–4 h', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Configuração de câmera aérea e render', 'Ação: Posicionar câmera aérea em altitude que mostre o empreendimento completo + contexto; ângulo sugerido: 45–60° de elevação; configurar iluminação solar de horário nobre (14–16h, luz dourada); renderizar com passes para compositing.

Responsável: Visualizador 3D Sênior

Output: Render aéreo base com passes exportados

Prazo referência: 2–6 h

[DECISÃO] Ângulo aéreo aprovado internamente? Sim → prosseguir. Não → reposicionar câmera.', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Compositing e humanização', 'Ação: Compor passes no Photoshop; substituir céu por imagem de qualidade da sky library; inserir árvores e paisagismo em escala real (palmeira = 8–12 m, ipê = 6–8 m); adicionar veículos e pessoas em escala; inserir sombras projetadas dos elementos 2D inseridos; ajustar cor para integração.

Responsável: Visualizador 3D Sênior / Pós-produtor

Output: Implantação humanizada com paisagismo e contexto integrados

Prazo referência: 3–5 h', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Legenda, revisão e exportação', 'Ação: Adicionar legenda com identificação de blocos, áreas e pontos de destaque conforme briefing do cliente; enviar para revisão do Dir. Criativo; incorporar feedback; exportar JPG 300 dpi + PNG + versão sem legenda para uso flexível.

Responsável: Visualizador 3D Sênior

Output: Implantação humanizada finalizada e exportada em múltiplas versões

Prazo referência: 1 h + ciclo revisão 24 h

[DECISÃO] Aprovada pelo Dir. Criativo e pelo cliente? Sim → exportar versões finais. Não → ajustar (máx. 2 rodadas inclusas).', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Alturas dos blocos corretas (conferir gabarito no CAD). [ ] Paisagismo em escala real. [ ] Entorno simplificado mas reconhecível. [ ] Iluminação solar coerente (sombras na direção correta). [ ] Legenda presente e legível. [ ] Sem distorção de perspectiva aérea. [ ] Exportação em múltiplas versões (com/sem legenda, JPG/PNG). [ ] Nomes de arquivo conforme padrão TBO.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Blocos com altura errada: verificar número de pavimentos no memorial descritivo ou corte do projeto. Árvores em escala incorreta: usar altura média de espécie (palmeira imperial ≈ 15 m, ipê ≈ 7 m, gramínea ≈ 0,5 m). Sombras de elementos 2D inconsistentes com o render: criar sombra sintética no Photoshop com Multiply + blur compatível com ângulo solar do render.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'SketchUp Pro + V-Ray for SketchUp; 3ds Max + Corona; Photoshop; Google Maps / Nearmap; biblioteca de assets aéreos TBO; SunCalc.net (para calcular ângulo solar real por data e localização).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Implantação humanizada padrão (até 4 blocos): 3–4 dias úteis. Implantação complexa (condomínio clube, múltiplos blocos, área de lazer extensa): 5–7 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe CAD implantação → Análise + satélite do entorno → Modelagem blocos + entorno → Config. câmera aérea → [Ângulo aprovado?] → Não: Reposicionar → Sim: Render com passes → Compositing + paisagismo → Legenda → Revisão Dir. Criativo → [APROVADO?] → Não: Ajustes → Sim: Exportação múltiplas versões → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Implantação: planta/imagem mostrando o posicionamento do empreendimento no terreno e seu entorno. Axonométrica: projeção paralela que mostra largura, profundidade e altura sem perspectiva. Gabarito: número máximo de pavimentos permitido para o lote. Nearmap: serviço de imagens aéreas de alta resolução e data recente. Paisagismo top-view: representação de árvores e arbustos vistos de cima.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-008
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Tour 360', 'tbo-3d-008-tour-360', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Tour 360°

Código

TBO-3D-008

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

Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.

  2. Escopo

2.1 O que está coberto

Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.

2.2 Exclusões

Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Renderizar panoramas 360° e configurar o tour virtual

Responsável

—

Pós-produtor

Tratar imagens equiretangulares e corrigir costuras

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar qualidade visual, navegação e fluxo do tour

Aprovador

—

Gerente de Projetos

Briefing de ambientes, entrega do link ao cliente e suporte ao acesso

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.

4.2 Ferramentas e Acessos

3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.



  5. Procedimento Passo a Passo

5.1. Planejamento do tour e mapeamento de ambientes

Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).

Responsável: Visualizador 3D Sênior

Output: Mapa de navegação do tour documentado

Prazo referência: 30 min

5.2. Configuração e render de panoramas 360°

Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.

Responsável: Visualizador 3D Sênior

Output: Panoramas EXR 360° de todos os ambientes renderizados

Prazo referência: 4–12 h (por quantidade de ambientes)

[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.

5.3. Pós-produção das imagens equiretangulares

Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.

Responsável: Pós-produtor

Output: Panoramas finalizados em JPEG 90%+ prontos para upload

Prazo referência: 1–2 h por ambiente

5.4. Montagem do tour na plataforma

Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.

Responsável: Visualizador 3D Sênior

Output: Tour virtual montado e funcionando na plataforma

Prazo referência: 2–3 h

5.5. QA, aprovação e publicação

Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.

Responsável: Visualizador 3D Sênior

Output: Tour virtual publicado, link final entregue ao cliente

Prazo referência: 1 h QA + ciclo revisão 24 h

[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.

6.2 Erros Comuns a Evitar

Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.

  7. Ferramentas e Templates

3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.

  8. SLAs e Prazos

Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.

  9. Fluxograma

Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim

  10. Glossário

Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 7, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Produzir tours virtuais 360° interativos de ambientes internos e externos do empreendimento, permitindo ao comprador explorar os espaços de forma imersiva em dispositivo desktop, mobile ou óculos VR.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Renderização de imagens equiretangulares (360°) dos ambientes; pós-produção das imagens panorâmicas; montagem do tour interativo na plataforma de tour virtual; configuração de hotspots de navegação; publicação e entrega do link.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização dos ambientes (cobertos pelo SOP 02); criação de aplicativo VR nativo; integração com site do cliente (responsabilidade do time de Tecnologia/Dev).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Renderizar panoramas 360° e configurar o tour virtual

Responsável

—

Pós-produtor

Tratar imagens equiretangulares e corrigir costuras

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar qualidade visual, navegação e fluxo do tour

Aprovador

—

Gerente de Projetos

Briefing de ambientes, entrega do link ao cliente e suporte ao acesso

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Cenas 3D finalizadas e aprovadas dos ambientes a incluir no tour; lista de ambientes e sequência de navegação definida no briefing; logo do empreendimento e identidade visual para personalização do tour.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max + V-Ray (render equiretangular via VRay360 ou VRaySphericalCamera); Adobe Photoshop (pós-produção de panoramas); Matterport / Kuula / Pano2VR (plataforma de tour virtual); servidor de hospedagem ou CDN para publicação.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Planejamento do tour e mapeamento de ambientes', 'Ação: Com base no briefing, listar todos os ambientes a incluir no tour (sala, cozinha, suite, área de lazer etc.); definir sequência de navegação (fluxo de hotspots); identificar posição de câmera em cada ambiente (centro do cômodo, 1,50 m de altura).

Responsável: Visualizador 3D Sênior

Output: Mapa de navegação do tour documentado

Prazo referência: 30 min', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Configuração e render de panoramas 360°', 'Ação: Configurar VRaySphericalCamera (360° × 180°) em cada ambiente; resolução mínima 8000×4000 px; renderizar com amostras suficientes para eliminar ruído (ISO equivalente baixo); salvar EXR por ambiente.

Responsável: Visualizador 3D Sênior

Output: Panoramas EXR 360° de todos os ambientes renderizados

Prazo referência: 4–12 h (por quantidade de ambientes)

[DECISÃO] Qualidade do render sem artefatos e ruído aceitável? Sim → prosseguir. Não → aumentar amostras e re-renderizar.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Pós-produção das imagens equiretangulares', 'Ação: Processar cada panorama no Photoshop: correção de exposição, balanço de branco, saturação; corrigir o nadir (ponto inferior — substituir por logomarca do empreendimento ou piso limpo); verificar e corrigir costuras visíveis.

Responsável: Pós-produtor

Output: Panoramas finalizados em JPEG 90%+ prontos para upload

Prazo referência: 1–2 h por ambiente', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Montagem do tour na plataforma', 'Ação: Fazer upload dos panoramas na plataforma escolhida (Kuula, Pano2VR ou similar); configurar hotspots de navegação entre ambientes; personalizar interface com logo e cores do empreendimento; configurar título de cada cômodo; testar navegação completa.

Responsável: Visualizador 3D Sênior

Output: Tour virtual montado e funcionando na plataforma

Prazo referência: 2–3 h', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. QA, aprovação e publicação', 'Ação: Realizar QA completo do tour: testar em desktop (Chrome, Safari), mobile (iOS e Android) e VR se aplicável; verificar carregamento, transições e hotspots; enviar link de preview ao Dir. Criativo para aprovação; após aprovação, publicar versão final e enviar link ao cliente.

Responsável: Visualizador 3D Sênior

Output: Tour virtual publicado, link final entregue ao cliente

Prazo referência: 1 h QA + ciclo revisão 24 h

[DECISÃO] Tour aprovado pelo Dir. Criativo em todos os dispositivos? Sim → publicar. Não → corrigir e retestar.', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Resolução mínima de 8000×4000 px por panorama. [ ] Ausência de ruído/artefatos visíveis. [ ] Nadir tratado (logo ou piso limpo). [ ] Costuras invisíveis. [ ] Hotspots de navegação funcionando em todos os ambientes. [ ] Tour testado em desktop e mobile. [ ] Interface personalizada com logo do empreendimento. [ ] Link de acesso público funcionando.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Costuras visíveis no panorama: verificar se câmera está exatamente no centro e re-renderizar; usar Photoshop para correção manual de faixas de 50 px nas bordas. Nadir com artefatos: clonar área limpa de piso ou inserir logo com máscara circular. Tour lento no mobile: comprimir JPEGs para 85% e reduzir resolução para 6000×3000 px na versão mobile. Hotspot apontando para o local errado: recalibrar coordenadas na plataforma de tour.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max + V-Ray 6 (VRaySphericalCamera); Adobe Photoshop; Kuula Pro / Pano2VR Pro / Matterport; Krpano (alternativa profissional); Google Cardboard para teste VR básico.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Tour com até 5 ambientes: entrega em 4 dias úteis. Tour com 6–12 ambientes: 6–8 dias úteis. Revisão pós-feedback: 1 dia útil por rodada (máx. 2 inclusas). Link de preview para aprovação: 24 h antes da publicação final.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing: lista de ambientes → Planejamento do tour (mapa de navegação) → Render panoramas 360° EXR → [Qualidade OK?] → Não: Ajustar amostras → Sim: Pós-produção (nadir, costura, cor) → Upload na plataforma → Config. hotspots + identidade visual → QA desktop/mobile → [Aprovado Dir. Criativo?] → Não: Corrigir → Sim: Publicação → Entrega do link → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Equiretangular: formato de imagem panorâmica que mapeia 360°×180° em retângulo 2:1. Nadir: ponto diretamente abaixo da câmera em um panorama esférico (geralmente mostra o tripé). VRaySphericalCamera: configuração de câmera do V-Ray para render de panoramas 360°. Hotspot: ponto clicável no tour virtual que navega para outro ambiente ou exibe informação. Kuula/Pano2VR: plataformas web para hospedagem e publicação de tours virtuais 360°.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-009
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Animações 3D Pré produção', 'tbo-3d-009-animacoes-3d-pre-producao', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Animações 3D — Pré-produção

Código

TBO-3D-009

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

Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.

  2. Escopo

2.1 O que está coberto

Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.

2.2 Exclusões

Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Liderar briefing criativo, validar roteiro e aprovar storyboard

Aprovador

—

Visualizador 3D Sênior

Desenvolver storyboard técnico e validar viabilidade de produção

Responsável

—

Gerente de Projetos

Conduzir reunião de briefing com cliente, documentar e distribuir

Responsável

Informado

Cliente / Incorporadora

Aprovar roteiro, storyboard e cronograma antes do início da produção

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.

4.2 Ferramentas e Acessos

Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).



  5. Procedimento Passo a Passo

5.1. Reunião de briefing de animação

Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.

Responsável: Gerente de Projetos + Dir. Criativo

Output: Briefing de animação documentado e assinado pelo cliente

Prazo referência: 1–2 h (reunião) + 30 min (documentação)

5.2. Desenvolvimento do roteiro

Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.

Responsável: Diretor Criativo

Output: Roteiro de animação aprovado internamente

Prazo referência: 1 dia útil

[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.

5.3. Criação do storyboard

Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.

Responsável: Visualizador 3D Sênior

Output: Storyboard completo em apresentação (PDF ou Slides)

Prazo referência: 1–2 dias úteis

5.4. Aprovação do storyboard pelo cliente

Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.

Responsável: Gerente de Projetos

Output: Storyboard aprovado formalmente pelo cliente

Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)

[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).

5.5. Definição técnica e cronograma de produção

Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.

Responsável: Gerente de Projetos + Visualizador 3D Sênior

Output: Documento técnico e cronograma de produção criados e distribuídos

Prazo referência: 4 h

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.

6.2 Erros Comuns a Evitar

Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.

  7. Ferramentas e Templates

Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).

  8. SLAs e Prazos

Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.

  9. Fluxograma

Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim

  10. Glossário

Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 8, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Estruturar e documentar todo o planejamento criativo e técnico de uma animação 3D antes do início da produção, garantindo alinhamento com o cliente, viabilidade técnica e cronograma realista.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Briefing detalhado de animação; criação de roteiro e storyboard; definição técnica (duração, resolução, FPS, estilo visual, trilha sonora); aprovação do storyboard pelo cliente; planejamento de câmeras e cenas; cronograma de produção.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem e texturização (cobertos pelo SOP 02); animação e render de cenas (cobertos pelo SOP 10); edição e trilha sonora (cobertos pelo SOP 11).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Diretor Criativo (Marco Andolfato)

Liderar briefing criativo, validar roteiro e aprovar storyboard

Aprovador

—

Visualizador 3D Sênior

Desenvolver storyboard técnico e validar viabilidade de produção

Responsável

—

Gerente de Projetos

Conduzir reunião de briefing com cliente, documentar e distribuir

Responsável

Informado

Cliente / Incorporadora

Aprovar roteiro, storyboard e cronograma antes do início da produção

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Contrato assinado com escopo de animação definido; modelos 3D do empreendimento finalizados ou em produção; referências de animações de arquitetura fornecidas pelo cliente; logomarca e identidade visual do empreendimento.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Slides ou Keynote (apresentação do storyboard); Adobe Illustrator ou Photoshop (frames do storyboard); frame.io ou Loom (apresentação remota ao cliente); TBO OS (gestão de tarefas e aprovações); Shotcut ou Premiere Pro (para animatic de referência).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Reunião de briefing de animação', 'Ação: Conduzir reunião de briefing com o cliente (presencial ou remota); levantar: objetivo da animação, público-alvo, duração desejada, ambientes a mostrar, pontos de destaque do empreendimento, trilha sonora (animação com voice-over, música ambiente, sem áudio), prazo de entrega e aprovações.

Responsável: Gerente de Projetos + Dir. Criativo

Output: Briefing de animação documentado e assinado pelo cliente

Prazo referência: 1–2 h (reunião) + 30 min (documentação)', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Desenvolvimento do roteiro', 'Ação: Com base no briefing, escrever roteiro descritivo da animação: sequência de cenas, duração estimada de cada cena, movimentos de câmera, o que é destacado em cada momento, transições; incluir texto de voice-over ou legenda se aplicável.

Responsável: Diretor Criativo

Output: Roteiro de animação aprovado internamente

Prazo referência: 1 dia útil

[DECISÃO] Roteiro aprovado pelo Dir. Criativo? Sim → storyboard. Não → revisar narrativa.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Criação do storyboard', 'Ação: Criar storyboard frame a frame (mínimo 1 frame por cena): desenhos ou renders de preview mostrando composição, ângulo de câmera, foco e movimento; indicar direção de movimento com setas; indicar duração de cada cena; montar apresentação visual para o cliente.

Responsável: Visualizador 3D Sênior

Output: Storyboard completo em apresentação (PDF ou Slides)

Prazo referência: 1–2 dias úteis', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Aprovação do storyboard pelo cliente', 'Ação: Apresentar storyboard ao cliente (reunião ou envio via TBO OS); coletar feedback; realizar ajustes (máx. 2 rodadas inclusas no escopo); obter aprovação formal por escrito (e-mail ou assinatura na plataforma) antes de iniciar produção.

Responsável: Gerente de Projetos

Output: Storyboard aprovado formalmente pelo cliente

Prazo referência: 3–5 dias úteis (incluindo ciclo de revisão)

[DECISÃO] Cliente aprovou storyboard? Sim → definição técnica e cronograma. Não → ajustar e reapresentar (máx. 2x).', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Definição técnica e cronograma de produção', 'Ação: Definir especificações finais: resolução (1920×1080 ou 4K), FPS (25 ou 30), duração total, número de cenas; listar todas as cenas com estimativa de horas de produção; criar cronograma detalhado no TBO OS com responsáveis e datas; comunicar ao time de produção.

Responsável: Gerente de Projetos + Visualizador 3D Sênior

Output: Documento técnico e cronograma de produção criados e distribuídos

Prazo referência: 4 h', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Briefing documentado e validado pelo cliente. [ ] Roteiro com sequência lógica de cenas (fachada → acesso → ambientes comuns → unidade tipo). [ ] Storyboard com todos os ângulos de câmera especificados. [ ] Duração total coerente com escopo (animação padrão: 2–4 min). [ ] Aprovação formal do cliente registrada. [ ] Cronograma criado no TBO OS com marcos e datas. [ ] Especificações técnicas documentadas.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Briefing incompleto: usar formulário padrão de briefing TBO para garantir que todas as informações sejam coletadas. Storyboard não aprovado antes do início da produção: NUNCA iniciar produção sem aprovação formal — retrabalho em animação é extremamente custoso. Cronograma irreal: consultar Visualizador Sênior para estimar horas antes de comunicar prazo ao cliente.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Slides (storyboard); Notion ou TBO OS (documentação e aprovações); Miro (mapeamento de cenas colaborativo); Loom (apresentação assíncrona para cliente); Adobe Illustrator (frames do storyboard em vetor).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Entrega do briefing documentado: 24 h após reunião. Desenvolvimento do roteiro: 1 dia útil. Criação do storyboard: 2 dias úteis. Ciclo de aprovação do cliente: até 5 dias úteis. Entrega do cronograma de produção: 1 dia útil após aprovação do storyboard.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Reunião de briefing → Documentação do briefing → Desenvolvimento do roteiro → [Roteiro aprovado internamente?] → Não: Revisar → Sim: Criação do storyboard → Apresentação ao cliente → [Cliente aprova storyboard?] → Não: Ajustes (max 2x) → Sim: Definição técnica + cronograma → Início da Produção (SOP 10) → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Storyboard: sequência de frames ilustrados que representam visualmente cada cena da animação. Animatic: versão simplificada da animação com storyboard em movimento, para validar ritmo e timing. Voice-over: narração em áudio sobreposta à animação. FPS: Frames Per Second, taxa de quadros por segundo (25 para cinema BR; 30 para digital). Roteiro descritivo: documento textual que descreve cada cena da animação em linguagem não técnica.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-010
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Animações 3D Produção', 'tbo-3d-010-animacoes-3d-producao', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Animações 3D — Produção

Código

TBO-3D-010

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

Executar a produção técnica completa da animação 3D — animação de câmeras, iluminação animada, render de frames e organização dos passes — conforme storyboard e especificações aprovadas na pré-produção.

  2. Escopo

2.1 O que está coberto

Animação de câmeras e objetos; setup de iluminação para cenas animadas; configuração e execução do render de frames via render farm; organização e entrega de pastas de frames para pós-produção.

2.2 Exclusões

Pré-produção e storyboard (cobertos pelo SOP 09); edição de vídeo, trilha sonora e entrega final (cobertos pelo SOP 11); modelagem e texturização (cobertos pelo SOP 02).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Animar câmeras, configurar iluminação animada e gerenciar render

Responsável

—

Visualizador 3D Júnior

Suporte em render de cenas secundárias e organização de frames

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar preview de câmeras antes do render final

Aprovador

—

Gerente de Projetos

Monitorar cronograma de produção e comunicar desvios

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Storyboard aprovado pelo cliente (output SOP 09); cenas 3D finalizadas com materiais e iluminação base (output SOP 02 e 03); especificações técnicas (resolução, FPS, duração por cena); render farm disponível e configurado.

4.2 Ferramentas e Acessos

3ds Max 2024+ com V-Ray ou Corona; Chaos Cloud ou render farm local (Deadline, Thinkbox); script de câmera para movimentos cinematográficos (Visu Motion ou câmeras manuais com curvas Bezier); monitor calibrado.



  5. Procedimento Passo a Passo

5.1. Configuração das câmeras animadas

Ação: Criar câmeras de acordo com o storyboard aprovado; animar movimentos: dolly, pan, orbit, crane, fly-through; ajustar timing e suavidade das curvas de animação (ease in/out); verificar que não há colisões de câmera com geometria.

Responsável: Visualizador 3D Sênior

Output: Câmeras animadas por cena, movimento suave e sem colisão

Prazo referência: 1–2 h por cena

5.2. Preview em baixa resolução (animatic 3D)

Ação: Renderizar preview de todas as câmeras em baixa resolução (720p, qualidade draft, 5–10 min por cena); montar sequência de cenas no Premiere Pro ou DaVinci Resolve; revisar ritmo, timing e movimentos de câmera.

Responsável: Visualizador 3D Sênior

Output: Animatic 3D em MP4 para revisão interna

Prazo referência: Meio dia útil

[DECISÃO] Movimentos de câmera e timing aprovados pelo Dir. Criativo? Sim → render final. Não → ajustar curvas de animação e retestar.

5.3. Ajuste de iluminação para cenas em movimento

Ação: Revisar iluminação de cada cena considerando que a câmera estará em movimento; verificar que não há áreas superexpostas ou escuras demais durante o trajeto da câmera; ajustar GI e amostras para consistência entre frames consecutivos.

Responsável: Visualizador 3D Sênior

Output: Iluminação validada para todas as cenas animadas

Prazo referência: 2–4 h

5.4. Configuração e submissão para render farm

Ação: Configurar parâmetros de render final (resolução, FPS, passes necessários); verificar paths de textura e dependências; submeter jobs para render farm via Deadline ou Chaos Cloud; configurar alertas de erro e monitoramento de progresso.

Responsável: Visualizador 3D Sênior

Output: Jobs submetidos ao render farm, monitoramento ativo

Prazo referência: 2–4 h (configuração) + tempo de render (varia)

[DECISÃO] Primeiros frames renderizados sem artefatos? Sim → continuar farm. Não → pausar job, corrigir e reiniciar.

5.5. Monitoramento e controle de qualidade de frames

Ação: Monitorar frames renderizados a cada 10% de conclusão; verificar artefatos (fireflies, flicker de GI, z-fighting animado, artefatos de motion blur); corrigir problemas críticos imediatamente; documentar frames problemáticos para re-render pontual.

Responsável: Visualizador 3D Júnior

Output: Log de QA de frames; re-renders pontuais concluídos

Prazo referência: Contínuo durante render (1–3 dias)

5.6. Organização e entrega dos frames para pós

Ação: Organizar frames renderizados em estrutura de pastas por cena e por passe (EXR sequences nomeadas por frame: CENA01_BEAUTY_0001.exr etc.); verificar completude de todos os frames (sem gaps na sequência); compactar e transferir para servidor de pós-produção.

Responsável: Visualizador 3D Júnior

Output: Pastas de frames organizadas e entregues ao pós-produtor

Prazo referência: 2–4 h (verificação e organização)

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Animatic 3D aprovado pelo Dir. Criativo antes do render final. [ ] Sem colisão de câmera com geometria em nenhuma cena. [ ] Movimentos de câmera suaves (sem jitter ou movimento robótico). [ ] Iluminação consistente entre frames consecutivos (sem flicker). [ ] Todos os frames renderizados sem gaps na sequência. [ ] Passes organizados conforme convenção de nomenclatura TBO. [ ] Backup dos frames em servidor de armazenamento.

6.2 Erros Comuns a Evitar

Flicker de GI entre frames: aumentar amostras de irradiance map ou usar modo ''animation'' do GI engine. Jitter de câmera: suavizar curvas de animação no Track View com filtro de tangente Smooth. Gap em sequência de frames (frame faltante): identificar no log do Deadline e re-renderizar frame específico. Motion blur excessivo: reduzir duração do shutter (VRay motion blur duration: 0,25–0,5).

  7. Ferramentas e Templates

3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou Thinkbox Deadline (render farm); VFB para monitoramento de qualidade de frame; Premiere Pro / DaVinci Resolve (montagem do animatic); Backblaze B2 / Google Drive (backup de frames).

  8. SLAs e Prazos

Preview animatic 3D: entregue em 1–2 dias úteis após início da animação. Render de frames (por cena de 10 segundos em FHD): 4–12 h de farm. Organização e entrega de frames para pós: até 24 h após conclusão do render. Duração total de produção (animação 2–3 min): 5–10 dias úteis.

  9. Fluxograma

Início → Recebe storyboard aprovado → Animação de câmeras por cena → Animatic 3D (preview draft) → [Aprovado Dir. Criativo?] → Não: Ajustar câmeras → Sim: Ajuste de iluminação → Config. render farm → Submissão de jobs → Monitoramento de frames → [Artefatos críticos?] → Sim: Pausar e corrigir → Não: Continuar → Organização de pastas → Entrega para Pós (SOP 11) → Fim

  10. Glossário

Render farm: conjunto de computadores (físicos ou nuvem) dedicados ao processamento de render em paralelo. Animatic 3D: versão em baixa qualidade da animação para validação de câmeras e timing. Flicker: variação não intencional de brilho entre frames consecutivos. Deadline: software de gerenciamento de render farm da Thinkbox/AWS. EXR sequence: série de arquivos EXR numerados representando cada frame de uma animação. Motion blur: desfoque de movimento aplicado a objetos ou câmera em movimento para realismo cinematográfico.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 9, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Executar a produção técnica completa da animação 3D — animação de câmeras, iluminação animada, render de frames e organização dos passes — conforme storyboard e especificações aprovadas na pré-produção.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Animação de câmeras e objetos; setup de iluminação para cenas animadas; configuração e execução do render de frames via render farm; organização e entrega de pastas de frames para pós-produção.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Pré-produção e storyboard (cobertos pelo SOP 09); edição de vídeo, trilha sonora e entrega final (cobertos pelo SOP 11); modelagem e texturização (cobertos pelo SOP 02).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Animar câmeras, configurar iluminação animada e gerenciar render

Responsável

—

Visualizador 3D Júnior

Suporte em render de cenas secundárias e organização de frames

Responsável

—

Diretor Criativo (Marco Andolfato)

Aprovar preview de câmeras antes do render final

Aprovador

—

Gerente de Projetos

Monitorar cronograma de produção e comunicar desvios

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storyboard aprovado pelo cliente (output SOP 09); cenas 3D finalizadas com materiais e iluminação base (output SOP 02 e 03); especificações técnicas (resolução, FPS, duração por cena); render farm disponível e configurado.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', '3ds Max 2024+ com V-Ray ou Corona; Chaos Cloud ou render farm local (Deadline, Thinkbox); script de câmera para movimentos cinematográficos (Visu Motion ou câmeras manuais com curvas Bezier); monitor calibrado.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Configuração das câmeras animadas', 'Ação: Criar câmeras de acordo com o storyboard aprovado; animar movimentos: dolly, pan, orbit, crane, fly-through; ajustar timing e suavidade das curvas de animação (ease in/out); verificar que não há colisões de câmera com geometria.

Responsável: Visualizador 3D Sênior

Output: Câmeras animadas por cena, movimento suave e sem colisão

Prazo referência: 1–2 h por cena', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Preview em baixa resolução (animatic 3D)', 'Ação: Renderizar preview de todas as câmeras em baixa resolução (720p, qualidade draft, 5–10 min por cena); montar sequência de cenas no Premiere Pro ou DaVinci Resolve; revisar ritmo, timing e movimentos de câmera.

Responsável: Visualizador 3D Sênior

Output: Animatic 3D em MP4 para revisão interna

Prazo referência: Meio dia útil

[DECISÃO] Movimentos de câmera e timing aprovados pelo Dir. Criativo? Sim → render final. Não → ajustar curvas de animação e retestar.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Ajuste de iluminação para cenas em movimento', 'Ação: Revisar iluminação de cada cena considerando que a câmera estará em movimento; verificar que não há áreas superexpostas ou escuras demais durante o trajeto da câmera; ajustar GI e amostras para consistência entre frames consecutivos.

Responsável: Visualizador 3D Sênior

Output: Iluminação validada para todas as cenas animadas

Prazo referência: 2–4 h', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Configuração e submissão para render farm', 'Ação: Configurar parâmetros de render final (resolução, FPS, passes necessários); verificar paths de textura e dependências; submeter jobs para render farm via Deadline ou Chaos Cloud; configurar alertas de erro e monitoramento de progresso.

Responsável: Visualizador 3D Sênior

Output: Jobs submetidos ao render farm, monitoramento ativo

Prazo referência: 2–4 h (configuração) + tempo de render (varia)

[DECISÃO] Primeiros frames renderizados sem artefatos? Sim → continuar farm. Não → pausar job, corrigir e reiniciar.', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Monitoramento e controle de qualidade de frames', 'Ação: Monitorar frames renderizados a cada 10% de conclusão; verificar artefatos (fireflies, flicker de GI, z-fighting animado, artefatos de motion blur); corrigir problemas críticos imediatamente; documentar frames problemáticos para re-render pontual.

Responsável: Visualizador 3D Júnior

Output: Log de QA de frames; re-renders pontuais concluídos

Prazo referência: Contínuo durante render (1–3 dias)', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Organização e entrega dos frames para pós', 'Ação: Organizar frames renderizados em estrutura de pastas por cena e por passe (EXR sequences nomeadas por frame: CENA01_BEAUTY_0001.exr etc.); verificar completude de todos os frames (sem gaps na sequência); compactar e transferir para servidor de pós-produção.

Responsável: Visualizador 3D Júnior

Output: Pastas de frames organizadas e entregues ao pós-produtor

Prazo referência: 2–4 h (verificação e organização)', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Animatic 3D aprovado pelo Dir. Criativo antes do render final. [ ] Sem colisão de câmera com geometria em nenhuma cena. [ ] Movimentos de câmera suaves (sem jitter ou movimento robótico). [ ] Iluminação consistente entre frames consecutivos (sem flicker). [ ] Todos os frames renderizados sem gaps na sequência. [ ] Passes organizados conforme convenção de nomenclatura TBO. [ ] Backup dos frames em servidor de armazenamento.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Flicker de GI entre frames: aumentar amostras de irradiance map ou usar modo ''animation'' do GI engine. Jitter de câmera: suavizar curvas de animação no Track View com filtro de tangente Smooth. Gap em sequência de frames (frame faltante): identificar no log do Deadline e re-renderizar frame específico. Motion blur excessivo: reduzir duração do shutter (VRay motion blur duration: 0,25–0,5).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', '3ds Max 2024+; V-Ray 6 / Corona 10+; Chaos Cloud ou Thinkbox Deadline (render farm); VFB para monitoramento de qualidade de frame; Premiere Pro / DaVinci Resolve (montagem do animatic); Backblaze B2 / Google Drive (backup de frames).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Preview animatic 3D: entregue em 1–2 dias úteis após início da animação. Render de frames (por cena de 10 segundos em FHD): 4–12 h de farm. Organização e entrega de frames para pós: até 24 h após conclusão do render. Duração total de produção (animação 2–3 min): 5–10 dias úteis.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe storyboard aprovado → Animação de câmeras por cena → Animatic 3D (preview draft) → [Aprovado Dir. Criativo?] → Não: Ajustar câmeras → Sim: Ajuste de iluminação → Config. render farm → Submissão de jobs → Monitoramento de frames → [Artefatos críticos?] → Sim: Pausar e corrigir → Não: Continuar → Organização de pastas → Entrega para Pós (SOP 11) → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Render farm: conjunto de computadores (físicos ou nuvem) dedicados ao processamento de render em paralelo. Animatic 3D: versão em baixa qualidade da animação para validação de câmeras e timing. Flicker: variação não intencional de brilho entre frames consecutivos. Deadline: software de gerenciamento de render farm da Thinkbox/AWS. EXR sequence: série de arquivos EXR numerados representando cada frame de uma animação. Motion blur: desfoque de movimento aplicado a objetos ou câmera em movimento para realismo cinematográfico.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-3D-011
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Animações 3D Pós produção', 'tbo-3d-011-animacoes-3d-pos-producao', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

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

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 10, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Transformar as sequências de frames renderizados em um vídeo final polido — com compositing, gradação de cor, trilha sonora, motion graphics e entrega nos formatos contratados — pronto para apresentação e distribuição ao cliente.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Compositing de passes de render em After Effects; gradação de cor; inserção de elementos 2D animados (céu, vegetação, pessoas); trilha sonora e voice-over; criação de títulos e motion graphics; exportação em formatos de entrega (MP4, MOV, DPX).', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção de frames 3D (coberta pelo SOP 10); criação de conteúdo de voice-over pelo time TBO; distribuição em plataformas digitais (responsabilidade do time de Marketing).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Pastas de frames EXR organizados por cena e passe (output SOP 10); trilha sonora ou diretrizes de trilha (licença confirmada); voice-over gravado (se aplicável); logo animado e identidade visual do empreendimento; storyboard aprovado como referência de edição.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe After Effects 2024+ (compositing e motion graphics); Adobe Premiere Pro (edição e montagem final); DaVinci Resolve (gradação de cor profissional); Adobe Audition (edição de áudio); ATEM Mini ou rodada de voice-over (gravação); biblioteca de trilhas licenciadas (Epidemic Sound, Artlist).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Importação e organização no After Effects', 'Ação: Importar sequences EXR de todos os passes no After Effects; criar composições por cena com duração correta; montar grupos de camadas por passe (Beauty, Diffuse, Reflection, AO, Depth); configurar project settings (FPS, espaço de cor ACES ou sRGB conforme workflow).

Responsável: Pós-produtor / Motion Designer

Output: Projeto AE organizado com todas as cenas importadas

Prazo referência: 2–4 h', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Compositing de passes e enriquecimento de cenas', 'Ação: Combinar passes com blending modes corretos; inserir elementos 2D animados (céu em movimento, vegetação com wind effect, pessoas animadas); adicionar profundidade de campo em pós (Lens Blur via passe de depth); adicionar efeitos atmosféricos (névoa, partículas de poeira, flares de luz).

Responsável: Pós-produtor / Motion Designer

Output: Compositing completo de todas as cenas

Prazo referência: 1–2 dias úteis', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Montagem e ritmo de edição', 'Ação: Montar sequência de cenas no Premiere Pro seguindo storyboard aprovado; ajustar duração de cada cena ao ritmo da trilha sonora; criar transições entre cenas (cross-fade, wipe, cut no beat da música); inserir marcadores de aprovação por segmento.

Responsável: Pós-produtor / Motion Designer

Output: Cut de edição montado com trilha em rough cut

Prazo referência: 4–8 h

[DECISÃO] Rough cut aprovado internamente pelo Dir. Criativo? Sim → gradação de cor. Não → ajustar timing/cortes.', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Gradação de cor no DaVinci Resolve', 'Ação: Exportar sequência do Premiere como DPX ou XML para DaVinci Resolve; aplicar gradação de cor global para consistência entre cenas; ajustar cenas individualmente (balanço de cenas externas vs. internas); criar look final coerente com identidade do empreendimento.

Responsável: Pós-produtor / Motion Designer

Output: Versão com gradação de cor finalizada

Prazo referência: 4–8 h', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Motion graphics, títulos e end card', 'Ação: Criar animação de logo do empreendimento (logo reveal); inserir títulos de ambientes no formato e tipografia aprovados; criar end card com CTA, contato da incorporadora e logomarca TBO; verificar sincronismo com áudio.

Responsável: Pós-produtor / Motion Designer

Output: Versão com motion graphics completos

Prazo referência: 4–8 h', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Revisão final e exportação master', 'Ação: Enviar versão final para aprovação do Dir. Criativo e em seguida ao cliente via link Vimeo ou Frame.io (senha protegido); incorporar feedback final (máx. 2 rodadas inclusas); exportar master H.264 1080p/4K + versão para Instagram Reels (9:16) + versão para apresentação (4:3 se necessário).

Responsável: Pós-produtor / Motion Designer

Output: Arquivos master exportados e organizados; link de entrega enviado ao cliente

Prazo referência: 1 h exportação + ciclo revisão 3–5 dias úteis

[DECISÃO] Aprovado pelo cliente? Sim → exportação master e entrega. Não → ajustar (máx. 2 rodadas).', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todas as cenas compostas sem artefatos de borda ou transição. [ ] Gradação de cor consistente entre todas as cenas. [ ] Trilha sonora em volume adequado (pico máximo -3 dB; voz, se houver, inteligível). [ ] Motion graphics alinhados com identidade visual. [ ] End card com informações corretas. [ ] Versão 9:16 para redes sociais produzida (se no escopo). [ ] Arquivos exportados nos formatos e resoluções corretos. [ ] Nomenclatura de arquivo conforme padrão TBO.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Flicker entre cenas no compositing: verificar se todas as composições usam o mesmo espaço de cor. Áudio fora de sincronia: verificar se FPS do projeto AE/Premiere bate com FPS do audio (25 vs 30 fps). Logo pixelado no end card: usar arquivo SVG ou AI vetorial, nunca PNG de baixa resolução. Exportação com banding de cor: aumentar bit depth para 10-bit na exportação (ProRes 422 HQ ou H.265 Main10).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe After Effects 2024+; Adobe Premiere Pro 2024+; DaVinci Resolve 18+ (Studio para noise reduction); Adobe Audition; Frame.io ou Vimeo Review (aprovação do cliente); Epidemic Sound / Artlist (trilhas licenciadas); HandBrake (compressão para entrega web).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Rough cut (primeira montagem): 2–3 dias úteis após recebimento dos frames. Gradação de cor e MGs: +2 dias úteis. Ciclo de revisão com cliente: 3–5 dias úteis por rodada (máx. 2 inclusas). Exportação master após aprovação: mesmo dia. Duração total de pós-produção (animação 2–3 min): 7–12 dias úteis.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Recebe frames EXR → Importação e organização no AE → Compositing de passes + enriquecimento → Montagem no Premiere (rough cut) → [Rough cut aprovado internamente?] → Não: Ajustar cortes → Sim: Gradação DaVinci → Motion graphics + títulos → Envio ao cliente para revisão → [Cliente aprova?] → Não: Ajustes (max 2x) → Sim: Exportação master → Entrega → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Rough cut: primeira montagem da edição com todas as cenas na sequência, sem refinamentos finais. Gradação de cor: processo de ajuste artístico de cor para criar consistência visual e atmosfera. Motion graphics: animações gráficas (textos animados, logos, transições) sobrepostas ao vídeo. DPX: formato de arquivo de vídeo profissional sem perda de qualidade, usado em pipelines VFX. End card: tela final de um vídeo com chamada para ação, contato e identidade da marca. LUT: tabela de gradação de cor pré-definida (Look-Up Table).', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

  -- TBO-3D-012
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Controle de Qualidade 3D', 'tbo-3d-012-controle-de-qualidade-3d', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

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

', 'published', 'critical', ARRAY['3d','render']::TEXT[], 11, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Garantir que todos os entregáveis do time Digital 3D — imagens estáticas, plantas, tours e animações — atendam aos padrões técnicos e criativos da TBO antes de qualquer envio ao cliente, eliminando retrabalho pós-entrega.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Checklist de QA técnico e criativo por tipo de entregável; processo de revisão por pares; aprovação final do Diretor Criativo; registro de não-conformidades e retrabalho; métricas de qualidade do time.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Aprovação final pelo cliente (responsabilidade do Gerente de Projetos); QA de materiais gráficos de design (responsabilidade do time de Design); testes de plataformas digitais (responsabilidade do time de Tecnologia).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

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

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Entregável finalizado pelo Visualizador 3D; briefing original e referências aprovadas pelo cliente; checklists de QA por tipo de entregável (imagem estática, planta, tour, animação).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Monitor calibrado (perfil sRGB); ferramenta de comparação de imagens (Lightroom Compare View ou FastStone Image Viewer); checklist TBO de QA em formato digital (TBO OS ou Google Sheets); histograma de cor (Photoshop).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Auto-revisão pelo produtor (nível 1)', 'Ação: Antes de submeter qualquer entregável para revisão, o produtor realiza auto-revisão com checklist específico do tipo de entregável; verifica: resolução, formato, nomenclatura, ausência de artefatos visíveis, aderência ao briefing; documenta no TBO OS.

Responsável: Visualizador 3D (quem produziu)

Output: Checklist de auto-revisão preenchido e arquivado

Prazo referência: 30–60 min por entregável', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Revisão técnica por par sênior (nível 2)', 'Ação: Visualizador Sênior diferente do produtor revisa o entregável usando histograma de cor, zoom em áreas críticas (reflexos, sombras, bordas de recorte), verificação de escala e consistência com briefing; registra não-conformidades com screenshots.

Responsável: Visualizador 3D Sênior

Output: Relatório de não-conformidades (ou aprovação) documentado

Prazo referência: 30–60 min por entregável

[DECISÃO] Entregável aprovado na revisão técnica? Sim → submeter para Dir. Criativo. Não → devolver para correção com lista de ajustes.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Correções e re-submissão (quando necessário)', 'Ação: Produtor recebe lista de não-conformidades; executa correções; re-submete para revisão técnica; máximo de 1 ciclo de correção antes de escalar para discussão com Dir. Criativo se o problema for de interpretação de briefing.

Responsável: Visualizador 3D (quem produziu)

Output: Entregável corrigido re-submetido para revisão

Prazo referência: 1–4 h por rodada de correção', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Aprovação do Diretor Criativo (nível 3)', 'Ação: Dir. Criativo revisa entregável aprovado tecnicamente; avalia: impacto visual, coerência criativa com posicionamento do empreendimento, apelo comercial; fornece feedback via TBO OS com comentários precisos; aprova ou solicita ajustes criativos.

Responsável: Diretor Criativo

Output: Aprovação ou lista de ajustes criativos documentada no TBO OS

Prazo referência: 24 h

[DECISÃO] Aprovado pelo Dir. Criativo? Sim → entregável liberado para cliente. Não → ajustes criativos e novo ciclo.', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Registro de métricas e lições aprendidas', 'Ação: Após conclusão do QA, registrar no TBO OS: número de não-conformidades por tipo, tempo de retrabalho, tipo de erro (técnico/criativo/briefing); revisar mensalmente para identificar padrões e melhorar treinamento do time.

Responsável: Visualizador 3D Sênior

Output: Registro de métricas de QA atualizado

Prazo referência: 15 min por entregável', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Auto-revisão nível 1 realizada e documentada. [ ] Revisão técnica nível 2 por par sênior realizada. [ ] Não-conformidades corrigidas e verificadas. [ ] Aprovação do Dir. Criativo registrada no TBO OS. [ ] Arquivos nomeados conforme padrão TBO. [ ] Backup do arquivo final em servidor. [ ] Métricas de QA registradas.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Entregável enviado ao cliente sem aprovação do Dir. Criativo: BLOQUEANTE — nunca enviar sem aprovação formal. Checklist não preenchido: não aceitar submissão para revisão sem checklist preenchido. Ciclo de correção longo (mais de 2 rodadas): escalar para reunião com Dir. Criativo para realinhamento de briefing.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'TBO OS (registro de aprovações e não-conformidades); Adobe Photoshop (histograma, zoom de inspeção); FastStone Image Viewer (comparação de versões); Google Sheets (dashboard de métricas de qualidade mensal).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Auto-revisão nível 1: concluída antes de submeter (não bloqueia cronograma externo). Revisão técnica nível 2: até 24 h após submissão. Aprovação do Dir. Criativo: até 24 h após submissão (entregável padrão); até 48 h (animação). Meta de qualidade: máx. 1 rodada de retrabalho por entregável enviado ao cliente.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Entregável finalizado → [NÍVEL 1] Auto-revisão produtor → [NÍVEL 2] Revisão técnica sênior → [Aprovado tecnicamente?] → Não: Correções → Re-submissão → Sim: [NÍVEL 3] Aprovação Dir. Criativo → [Aprovado criativamente?] → Não: Ajustes criativos → Re-submissão → Sim: Entregável liberado para cliente → Registro de métricas → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Não-conformidade: desvio detectado em relação ao padrão de qualidade ou briefing aprovado. Revisão por pares: processo de revisão feito por colega diferente do produtor, eliminando viés de auto-análise. Histograma de cor: representação gráfica da distribuição de tons em uma imagem (detecta overexposure e clipping). Auto-revisão: primeira camada de controle de qualidade feita pelo próprio produtor antes de submeter o trabalho.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-013
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Entrega e Handoff ao Cliente', 'tbo-3d-013-entrega-e-handoff-ao-cliente', 'digital-3d', 'checklist', 'Marco Andolfato (Diretor Criativo)', 'Standard Operating Procedure

Entrega e Handoff ao Cliente

Código

TBO-3D-013

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

Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.

  2. Escopo

2.1 O que está coberto

Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.

2.2 Exclusões

Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Gerente de Projetos

Organizar entrega, comunicar cliente e coletar aceite formal

Responsável

—

Visualizador 3D Sênior

Organizar e nomear arquivos conforme padrão TBO

Responsável

—

Diretor Criativo (Marco Andolfato)

Confirmar que todos os itens do escopo foram entregues

Aprovador

—

Cliente / Incorporadora

Confirmar recebimento, revisar e emitir aceite formal

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).

4.2 Ferramentas e Acessos

Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.



  5. Procedimento Passo a Passo

5.1. Conferência final do escopo entregue

Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.

Responsável: Gerente de Projetos

Output: Checklist de escopo 100% concluído documentado

Prazo referência: 30 min

[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.

5.2. Organização e nomenclatura dos arquivos

Ação: Criar estrutura de pastas padrão: [PROJETO] > [DATA_ENTREGA] > [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.

Responsável: Visualizador 3D Sênior

Output: Pasta de entrega organizada e nomeada conforme padrão TBO

Prazo referência: 30–60 min

5.3. Upload e geração de link de entrega

Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.

Responsável: Gerente de Projetos

Output: Link de entrega funcional e verificado

Prazo referência: 30–60 min

5.4. Comunicação formal de entrega ao cliente

Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.

Responsável: Gerente de Projetos

Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS

Prazo referência: 1 h

5.5. Coleta de aceite e encerramento do projeto

Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.

Responsável: Gerente de Projetos

Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO

Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite

[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.

6.2 Erros Comuns a Evitar

Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.

  7. Ferramentas e Templates

Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.

  8. SLAs e Prazos

Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.

  9. Fluxograma

Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim

  10. Glossário

Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'high', ARRAY['3d','render']::TEXT[], 12, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Executar a entrega formal e organizada de todos os entregáveis 3D ao cliente — com nomenclatura padronizada, formatos corretos, documentação de uso e registro formal de aceite — encerrando o ciclo de produção com excelência.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Organização final de arquivos; nomenclatura conforme padrão TBO; empacotamento e upload para pasta de entrega; comunicação formal de entrega; coleta de aceite do cliente; arquivamento do projeto.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Produção dos entregáveis (coberta pelos SOPs anteriores); QA e aprovação interna (cobertos pelo SOP 12); distribuição em plataformas do cliente (responsabilidade do cliente ou time de Mkt TBO).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Gerente de Projetos

Organizar entrega, comunicar cliente e coletar aceite formal

Responsável

—

Visualizador 3D Sênior

Organizar e nomear arquivos conforme padrão TBO

Responsável

—

Diretor Criativo (Marco Andolfato)

Confirmar que todos os itens do escopo foram entregues

Aprovador

—

Cliente / Incorporadora

Confirmar recebimento, revisar e emitir aceite formal

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Todos os entregáveis aprovados pelo Dir. Criativo (output SOP 12); briefing original com lista de entregáveis contratados; padrão de nomenclatura TBO; conta de armazenamento em nuvem ativa (Google Drive / WeTransfer Pro).', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Google Drive ou WeTransfer Pro (entrega de arquivos); TBO OS (registro formal de entrega e aceite); e-mail ou plataforma de comunicação com o cliente; planilha de checklist de entrega.', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Conferência final do escopo entregue', 'Ação: Abrir contrato/briefing e verificar item a item se todos os entregáveis contratados foram produzidos e aprovados; listar itens pendentes; confirmar com Dir. Criativo que tudo está completo e aprovado.

Responsável: Gerente de Projetos

Output: Checklist de escopo 100% concluído documentado

Prazo referência: 30 min

[DECISÃO] Todos os itens do escopo estão prontos e aprovados? Sim → organizar arquivos. Não → acionar produção para completar pendências.', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Organização e nomenclatura dos arquivos', 'Ação: Criar estrutura de pastas padrão: [PROJETO] > [DATA_ENTREGA] > [TIPO] (Imagens_Estaticas / Plantas / Tour_360 / Animacoes); nomear cada arquivo conforme padrão: [PROJETO]_[TIPO]_[NUMERO]_[VERSAO].extensao; verificar que não há arquivos de rascunho ou WIP na pasta de entrega.

Responsável: Visualizador 3D Sênior

Output: Pasta de entrega organizada e nomeada conforme padrão TBO

Prazo referência: 30–60 min', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Upload e geração de link de entrega', 'Ação: Fazer upload da pasta de entrega no Google Drive do projeto ou WeTransfer Pro; gerar link de acesso (com senha se o cliente solicitou confidencialidade); verificar que o link funciona e que todos os arquivos estão acessíveis e não corrompidos.

Responsável: Gerente de Projetos

Output: Link de entrega funcional e verificado

Prazo referência: 30–60 min', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Comunicação formal de entrega ao cliente', 'Ação: Enviar e-mail formal de entrega ao cliente com: lista completa dos entregáveis, link de acesso, instruções de uso (formatos, resoluções, usos recomendados), prazo para revisão final do cliente (5 dias úteis padrão); registrar envio no TBO OS.

Responsável: Gerente de Projetos

Output: E-mail de entrega enviado e registrado; tarefa de acompanhamento criada no TBO OS

Prazo referência: 1 h', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Coleta de aceite e encerramento do projeto', 'Ação: Acompanhar revisão do cliente; responder dúvidas sobre uso dos arquivos; coletar aceite formal por e-mail ou via plataforma TBO OS (assinatura digital); arquivar todos os arquivos do projeto (fontes, renders, cenas 3D) no servidor TBO por 2 anos; marcar projeto como concluído no TBO OS.

Responsável: Gerente de Projetos

Output: Aceite formal do cliente registrado; projeto arquivado no servidor TBO

Prazo referência: 5 dias úteis (prazo de revisão do cliente) + arquivamento no dia do aceite

[DECISÃO] Cliente emitiu aceite formal? Sim → arquivar e encerrar. Não (cliente solicita ajuste dentro do escopo): verificar se é revisão contratual ou escopo adicional.', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Todos os itens do escopo contratado entregues e aprovados. [ ] Nomenclatura de arquivos conforme padrão TBO. [ ] Nenhum arquivo de rascunho/WIP na pasta de entrega. [ ] Link de entrega testado e funcional. [ ] E-mail de entrega enviado com lista completa de entregáveis. [ ] Aceite formal do cliente registrado. [ ] Projeto arquivado no servidor TBO. [ ] Tarefa encerrada no TBO OS.', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Arquivo corrompido no link de entrega: sempre verificar download de amostra antes de enviar link ao cliente. Entregável faltando na pasta: usar checklist de escopo para conferência obrigatória antes de qualquer entrega. Cliente solicita ajuste que não está no escopo: registrar como solicitação adicional, gerar proposta de aditivo antes de produzir.', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Google Drive (armazenamento e compartilhamento); WeTransfer Pro (entregas grandes, +10 GB); TBO OS (gestão de tarefas, registro de aceite); e-mail corporativo TBO; checklist de entrega em Google Sheets ou TBO OS.', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Organização e upload de arquivos: 1 dia útil após aprovação final do Dir. Criativo. E-mail formal de entrega ao cliente: mesmo dia do upload. Prazo para revisão final do cliente: 5 dias úteis (padrão; pode variar conforme contrato). Arquivamento após aceite: até 2 dias úteis após aceite recebido.', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → Conferência do escopo → [Tudo aprovado?] → Não: Acionar produção para pendências → Sim: Organização e nomenclatura de arquivos → Upload e geração de link → Comunicação formal ao cliente → Cliente revisa → [Aceite formal emitido?] → Não: Verificar se é ajuste contratual ou adicional → Sim: Arquivamento no servidor → Encerramento no TBO OS → Fim', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Aceite formal: confirmação escrita (e-mail ou assinatura digital) do cliente de que os entregáveis foram recebidos e aprovados. WIP (Work In Progress): arquivo de trabalho em andamento, não adequado para entrega. Escopo adicional: solicitação de entregável ou ajuste não previsto no contrato original, que requer nova proposta. Handoff: processo de transferência organizada de arquivos e responsabilidades ao final de um projeto.', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 17, 'step');

  -- TBO-3D-014
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, status, priority, tags, order_index, version)
  VALUES ('89080d1a-bc79-4c3f-8fce-20aabc561c0d', 'Gestão de Assets e Biblioteca 3D', 'tbo-3d-014-gestao-de-assets-e-biblioteca-3d', 'digital-3d', 'checklist', 'Gestão de Assets e Biblioteca 3D', 'Standard Operating Procedure

Gestão de Assets e Biblioteca 3D

Código

TBO-3D-014

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

Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.

  2. Escopo

2.1 O que está coberto

Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.

2.2 Exclusões

Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Curar, organizar e manter a biblioteca 3D; aprovar novos assets

Responsável

—

Diretor Criativo (Marco Andolfato)

Definir padrões de qualidade e estilo dos assets da biblioteca

Aprovador

—

Visualizador 3D Júnior

Contribuir com novos assets e seguir processos de admissão

Consultado

—

Gerente de Projetos

Garantir orçamento para aquisição de assets e licenças

—

Informado

  4. Pré-requisitos

4.1 Inputs necessários

Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.

4.2 Ferramentas e Acessos

Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).



  5. Procedimento Passo a Passo

5.1. Estrutura e organização da biblioteca

Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.

Responsável: Visualizador 3D Sênior

Output: Estrutura de biblioteca documentada e mantida

Prazo referência: Manutenção contínua; revisão trimestral completa

5.2. Processo de admissão de novos assets

Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.

Responsável: Visualizador 3D Sênior

Output: Asset admitido, testado, nomeado e registrado no inventário

Prazo referência: 30–60 min por asset

[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.

5.3. Nomenclatura e tagging de assets

Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.

Responsável: Visualizador 3D Sênior

Output: Assets nomeados e com tags atualizadas

Prazo referência: 15 min por asset

5.4. Controle de licenças e conformidade

Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.

Responsável: Visualizador 3D Sênior

Output: Planilha de inventário de licenças atualizada

Prazo referência: Atualização contínua; revisão semestral em 1 dia útil

5.5. Manutenção, limpeza e expansão periódica

Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.

Responsável: Visualizador 3D Sênior

Output: Biblioteca limpa, atualizada e com plano de expansão

Prazo referência: 1 dia útil por ciclo trimestral

5.6. Onboarding e acesso do time

Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.

Responsável: Visualizador 3D Sênior

Output: Novo membro onboarded na biblioteca; acesso configurado

Prazo referência: 2 h por novo membro

  6. Critérios de Qualidade

6.1 Checklist de Entrega

[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.

6.2 Erros Comuns a Evitar

Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).

  7. Ferramentas e Templates

Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).

  8. SLAs e Prazos

Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.

  9. Fluxograma

Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim

  10. Glossário

Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.



  11. Histórico de Revisões

Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP

', 'published', 'medium', ARRAY['3d','render']::TEXT[], 13, 1)
  ON CONFLICT (tenant_id, slug) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, description=EXCLUDED.description, updated_at=now()
  RETURNING id INTO v_sop_id;
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '1. Objetivo', 'Manter, organizar e expandir a biblioteca centralizada de assets 3D da TBO — modelos, materiais, HDRIs, texturas, scripts e entourage — garantindo reutilização eficiente, padronização de qualidade e rastreabilidade de licenças.', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 1 O que está coberto', 'Estrutura e organização da biblioteca de assets; processo de admissão e curadoria de novos assets; nomenclatura e tagging; licenciamento e conformidade; manutenção e limpeza periódica; acesso e onboarding do time.', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '2. 2 Exclusões', 'Modelagem de assets específicos para projetos (coberta pelo SOP 02); compra de licenças de software (responsabilidade da Gerência); assets de vídeo e motion (responsabilidade do time de Motion Design).', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Visualizador 3D Sênior

Curar, organizar e manter a biblioteca 3D; aprovar novos assets

Responsável

—

Diretor Criativo (Marco Andolfato)

Definir padrões de qualidade e estilo dos assets da biblioteca

Aprovador

—

Visualizador 3D Júnior

Contribuir com novos assets e seguir processos de admissão

Consultado

—

Gerente de Projetos

Garantir orçamento para aquisição de assets e licenças

—

Informado', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 1 Inputs necessários', 'Servidor de armazenamento TBO com espaço adequado (mínimo 2 TB para biblioteca 3D); lista de softwares suportados (3ds Max, SketchUp, V-Ray, Corona); processo de licenciamento definido; guia de nomenclatura TBO.', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Servidor local ou NAS TBO (armazenamento primário); Google Drive (backup em nuvem); Bridge (Adobe) ou Connecter (gerenciador de assets para 3ds Max); planilha de inventário de licenças (Google Sheets); Git LFS (versionamento de assets grandes, opcional).', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.1. Estrutura e organização da biblioteca', 'Ação: Manter estrutura de pastas padronizada no servidor: /Biblioteca_3D/Modelos/[Categoria] (Mobiliario, Vegetacao, Pessoas, Veiculos, Arquitetura, Props); /Materiais/[Motor] (VRay, Corona); /Texturas/[Resolucao]; /HDRIs/[Tipo]; /Scripts_Plugins; cada asset em pasta própria com preview JPG, arquivo 3D e arquivo de licença.

Responsável: Visualizador 3D Sênior

Output: Estrutura de biblioteca documentada e mantida

Prazo referência: Manutenção contínua; revisão trimestral completa', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.2. Processo de admissão de novos assets', 'Ação: Ao adicionar novo asset: verificar origem e licença (livre de royalties, uso comercial permitido); verificar qualidade técnica (poly count adequado, UVs limpos, sem geometria problemática); testar render em cena padrão TBO; nomear conforme padrão; registrar na planilha de inventário com fonte e tipo de licença.

Responsável: Visualizador 3D Sênior

Output: Asset admitido, testado, nomeado e registrado no inventário

Prazo referência: 30–60 min por asset

[DECISÃO] Asset aprovado em qualidade e licença? Sim → adicionar à biblioteca. Não → descartar ou solicitar versão comercial.', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.3. Nomenclatura e tagging de assets', 'Ação: Nomear assets conforme padrão: [CATEGORIA]_[SUBCATEGORIA]_[DESCRICAO]_[VARIACOES]_TBO (ex.: MOB_SALA_SOFA_3LUG_CINZA_TBO.max); adicionar tags descritivas nos metadados para buscabilidade (estilo, cor, dimensão aproximada, motor compatível); manter preview JPG em 512×512 px.

Responsável: Visualizador 3D Sênior

Output: Assets nomeados e com tags atualizadas

Prazo referência: 15 min por asset', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.4. Controle de licenças e conformidade', 'Ação: Manter planilha de inventário de licenças com: nome do asset, fonte (TurboSquid, Evermotion, Sketchfab, custom TBO etc.), tipo de licença (royalty-free comercial, editorial only, exclusivo TBO), data de aquisição, valor pago, validade; revisar conformidade semestralmente.

Responsável: Visualizador 3D Sênior

Output: Planilha de inventário de licenças atualizada

Prazo referência: Atualização contínua; revisão semestral em 1 dia útil', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.5. Manutenção, limpeza e expansão periódica', 'Ação: Trimestralmente: identificar e remover assets não utilizados nos últimos 12 meses (após consulta ao time); identificar gaps na biblioteca (categorias com poucos assets de qualidade); propor aquisições ao Dir. Criativo; converter assets legados para formatos atuais (ex.: max 2015 → max 2024); verificar backup em nuvem.

Responsável: Visualizador 3D Sênior

Output: Biblioteca limpa, atualizada e com plano de expansão

Prazo referência: 1 dia útil por ciclo trimestral', 10, 'tip');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '5.6. Onboarding e acesso do time', 'Ação: Ao integrar novo membro ao time 3D: apresentar estrutura da biblioteca, regras de nomenclatura, processo de admissão de novos assets e proibição de uso de assets sem licença verificada; criar acesso ao servidor com permissões adequadas (read para júniores, read/write para seniores); documentar no guia de onboarding TBO.

Responsável: Visualizador 3D Sênior

Output: Novo membro onboarded na biblioteca; acesso configurado

Prazo referência: 2 h por novo membro', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 1 Checklist de Entrega', '[ ] Estrutura de pastas conforme padrão TBO. [ ] Todo asset com preview JPG em 512×512 px. [ ] Nomenclatura conforme padrão [CATEGORIA]_[DESC]_TBO. [ ] Licença verificada e registrada na planilha de inventário. [ ] Backup em nuvem atualizado. [ ] Nenhum asset sem origem rastreável na biblioteca. [ ] Revisão trimestral realizada e documentada.', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Asset sem licença identificada: mover imediatamente para pasta de quarentena e verificar origem antes de uso em produção. Arquivo 3D corrompido ou com geometria problemática: remover da biblioteca e documentar na planilha como descartado com motivo. Backup desatualizado: configurar rotina automática de sync para Google Drive (ex.: rclone agendado).', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '7. Ferramentas e Templates', 'Servidor NAS local TBO; Google Drive (backup); Adobe Bridge ou Connecter 4 para 3ds Max (navegação de assets); Google Sheets (inventário de licenças); TurboSquid, Evermotion, Sketchfab, CGAxis (fontes de assets licenciados); rclone (sync automático servidor → nuvem).', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '8. SLAs e Prazos', 'Admissão de novo asset solicitado pelo time: até 2 dias úteis (verificação de licença + teste de qualidade). Revisão trimestral da biblioteca: concluída em 1 dia útil. Backup em nuvem: atualizado automaticamente a cada 24 h. Onboarding de novo membro: concluído no primeiro dia de trabalho no time 3D.', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '9. Fluxograma', 'Início → [ADMISSÃO] Novo asset identificado → Verificar licença comercial → [Licença OK?] → Não: Descartar / Adquirir versão comercial → Sim: Teste de qualidade (render em cena padrão) → [Qualidade OK?] → Não: Descartar → Sim: Nomear + taggar + gerar preview → Registrar no inventário → Adicionar à biblioteca → [MANUTENÇÃO TRIMESTRAL] Revisão de uso → Remover obsoletos → Identificar gaps → Propor expansão → Backup nuvem → Fim', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '10. Glossário', 'Asset: recurso 3D reutilizável (modelo, material, textura, HDRI etc.) armazenado na biblioteca para uso em múltiplos projetos. Royalty-free: licença que permite uso comercial sem pagamento recorrente por uso (paga uma vez, usa sempre). Poly count: número de polígonos de um modelo 3D (impacta performance de render e viewport). UVs: coordenadas de mapeamento de textura em um modelo 3D. NAS (Network Attached Storage): dispositivo de armazenamento em rede acessível por todos os membros do time. Quarentena: pasta temporária para assets com licença não verificada, bloqueados para uso em produção.', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, order_index, step_type) VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', 18, 'step');

END $$;
