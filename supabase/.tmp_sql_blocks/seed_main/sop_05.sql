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