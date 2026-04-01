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
    'Folder Combate',
    'tbo-brd-007-folder-combate',
    'branding',
    'checklist',
    'Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.',
    'Standard Operating Procedure

Folder Combate

Código

TBO-BRD-007

Versão

1.0

Data de Criação

2026-03-19

Última Atualização

2026-03-19

Área / BU

Branding

Responsável

Nelson (PO Branding)

Aprovador

Marco Andolfato



  1. Objetivo

Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.

  2. Escopo

2.1 O que está coberto

Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.

2.2 Exclusões

Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator

Curadoria dos argumentos e copy

Responsável



Designer Senior (Branding)

Diagramação e arte final

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).



  5. Procedimento Passo a Passo

5.1. Levantamento de objeções e argumentos

Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.

Responsável: Redator + Atendimento

Output: Matriz de objeções e argumentos de combate (documento de 1 página)

Prazo referência: 1 dia útil

5.2. Curadoria e hierarquia de conteúdo

Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.

Responsável: Redator + Nelson

Output: Roteiro de conteúdo aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação

5.3. Diagramação e arte final

Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.

Responsável: Designer Senior

Output: Layout em PDF para revisão interna + arquivo INDD editável

Prazo referência: 2 dias úteis

5.4. Revisão interna e aprovação do cliente

Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado por escrito, arte final pronta para impressão

Prazo referência: 3 dias úteis (incluindo revisões)

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente

5.5. Arte final e entrega

Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).

Responsável: Designer Senior

Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente

Prazo referência: 1 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.

6.2 Erros Comuns a Evitar

Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.

  8. SLAs e Prazos

Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.

  9. Fluxograma

Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim

  10. Glossário

Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Folder Combate</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-007</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.</p><p><strong>2.2 Exclusões</strong></p><p>Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator</p></td><td><p>Curadoria dos argumentos e copy</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Levantamento de objeções e argumentos</strong></p><p>Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.</p><p>Responsável: Redator + Atendimento</p><p>Output: Matriz de objeções e argumentos de combate (documento de 1 página)</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Curadoria e hierarquia de conteúdo</strong></p><p>Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro de conteúdo aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação</strong></p><p><strong>5.3. Diagramação e arte final</strong></p><p>Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Layout em PDF para revisão interna + arquivo INDD editável</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.4. Revisão interna e aprovação do cliente</strong></p><p>Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Folder aprovado por escrito, arte final pronta para impressão</p><p>Prazo referência: 3 dias úteis (incluindo revisões)</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p><p><strong>5.5. Arte final e entrega</strong></p><p>Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).</p><p>Responsável: Designer Senior</p><p>Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente</p><p>Prazo referência: 1 dia útil</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim</p><p><strong>  10. Glossário</strong></p><p>Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    5,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-007
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.', '<p>Produzir o folder combate — material de alta densidade informativa para corretores usarem em situações de objeção e comparação competitiva — sintetizando os principais argumentos de venda do empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.', '<p>Criação do conceito, seleção de argumentos de combate, diagramação e arte final do folder combate (formato padrão A4 ou A3 dobrado), versão impressa e digital.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).', '<p>Treinamento de corretores (responsabilidade da incorporadora), produção da impressão (responsabilidade do cliente), folder sanfona (SOP BRD-08).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator

Curadoria dos argumentos e copy

Responsável

Designer Senior (Branding)

Diagramação e arte final

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator</p></td><td><p>Curadoria dos argumentos e copy</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).', '<p>Storytelling aprovado (BRD-03), book de vendas em andamento ou aprovado (BRD-06), briefing com os 5 principais objeções do público-alvo (fornecido pela equipe de vendas da incorporadora), tabela comparativa de concorrentes (se disponível).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).', '<p>Adobe InDesign (diagramação), Adobe Illustrator (elementos gráficos), Adobe Photoshop (tratamento de imagens).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Levantamento de objeções e argumentos', 'Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.

Responsável: Redator + Atendimento

Output: Matriz de objeções e argumentos de combate (documento de 1 página)

Prazo referência: 1 dia útil', '<p>Ação: Reunir com a equipe de vendas da incorporadora para mapear as 5 principais objeções dos compradores. Para cada objeção, definir o argumento de combate do empreendimento com evidências (dado, diferencial, comparativo). Resultado: matriz objeção x argumento.</p><p>Responsável: Redator + Atendimento</p><p>Output: Matriz de objeções e argumentos de combate (documento de 1 página)</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Curadoria e hierarquia de conteúdo', 'Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.

Responsável: Redator + Nelson

Output: Roteiro de conteúdo aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação', '<p>Ação: Selecionar os 3 a 5 argumentos mais fortes para o folder (os demais vão para o guia do corretor, BRD-12). Definir hierarquia: argumento principal de destaque, argumentos de suporte, dados comparativos, chamada para ação. Aprovação de Nelson no roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro de conteúdo aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova hierarquia de conteúdo antes da diagramação</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação e arte final', 'Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.

Responsável: Designer Senior

Output: Layout em PDF para revisão interna + arquivo INDD editável

Prazo referência: 2 dias úteis', '<p>Ação: Diagramar o folder em InDesign no formato definido (A4 recto-verso ou A3 dobrado). Aplicar identidade visual com alta densidade informativa mas leitura clara. Incluir: headline impactante, argumentos com ícones e dados, imagem principal do empreendimento, QR Code para mais informações, dados de contato.</p><p>Responsável: Designer Senior</p><p>Output: Layout em PDF para revisão interna + arquivo INDD editável</p><p>Prazo referência: 2 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna e aprovação do cliente', 'Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado por escrito, arte final pronta para impressão

Prazo referência: 3 dias úteis (incluindo revisões)

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', '<p>Ação: Nelson revisa design. Redator confere todos os dados e textos. Marco Andolfato aprova. Enviar ao cliente para validação de dados técnicos e aprovação formal. Máx. 2 rodadas de revisão.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Folder aprovado por escrito, arte final pronta para impressão</p><p>Prazo referência: 3 dias úteis (incluindo revisões)</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Arte final e entrega', 'Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).

Responsável: Designer Senior

Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente

Prazo referência: 1 dia útil', '<p>Ação: Exportar PDF para impressão (CMYK, 300dpi, sangria e marcas de corte) e PDF digital. Organizar entrega no Drive. Enviar ao cliente com especificações de impressão recomendadas (papel, gramatura, acabamento).</p><p>Responsável: Designer Senior</p><p>Output: PDF de impressão, PDF digital e recomendação de impressão enviados ao cliente</p><p>Prazo referência: 1 dia útil</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.', '<p>Cada argumento de combate tem uma evidência concreta (dado, comparativo ou benefício mensurável); folder legível em 30 segundos (teste com pessoa externa); QR Code funcional; dados validados pelo cliente; arte final em CMYK com sangria; aprovação do cliente registrada.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.', '<p>Argumentos genéricos sem evidências (''o melhor empreendimento da região''); folder com excesso de informação (mais de 7 elementos por face); dados de concorrentes sem validação (risco legal); arte final em RGB; enviar para impressão sem aprovação formal.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.', '<p>Adobe InDesign CC, Adobe Illustrator CC, Adobe Photoshop CC, QR Code Generator.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.', '<p>Levantamento de argumentos: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 2 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 8–10 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim', '<p>Início → Reunião com equipe de vendas → Mapear objeções e argumentos → Curar top 5 argumentos → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar folder → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Entregar → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.', '<p>Folder combate: material de vendas projetado para rebater objeções e apresentar argumentos comparativos. Objeção de venda: resistência ou dúvida do comprador que impede o avanço na negociação. Matriz objeção x argumento: ferramenta que cruza as principais objeções com os melhores argumentos de resposta.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-008: Folder Sanfona ──
END $$;