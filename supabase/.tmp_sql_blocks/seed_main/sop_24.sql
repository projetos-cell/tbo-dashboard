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
    'Apresentação Comercial',
    'tbo-brd-011-apresentacao-comercial',
    'branding',
    'checklist',
    'Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.',
    'Standard Operating Procedure

Apresentação Comercial

Código

TBO-BRD-011

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

Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.

  2. Escopo

2.1 O que está coberto

Apresentação em PowerPoint/Google Slides e/ou Keynote com design aplicado, diagramação de todos os slides, versão para projeção e versão para envio (PDF).

2.2 Exclusões

Apresentações de resultado financeiro (responsabilidade da diretoria), vídeos institucionais, apresentações de briefing interno TBO.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e design dos slides

Responsável



Redator

Estrutura de conteúdo e textos

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação estratégica final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing da apresentação (objetivo, audiência, número de slides estimado, dados a incluir), conteúdo do cliente (textos, dados, fotos).

4.2 Ferramentas e Acessos

Microsoft PowerPoint ou Google Slides (edição pelo cliente), Apple Keynote (apresentações premium), Adobe Illustrator (assets gráficos customizados), Figma (design de slide template).



  5. Procedimento Passo a Passo

5.1. Estrutura narrativa e roteiro de slides

Ação: Definir a estrutura da apresentação com o cliente: problema/oportunidade → solução/empreendimento → diferenciais → provas → proposta/CTA. Criar roteiro slide a slide com título, conteúdo principal e visual sugerido para cada. Máx. 1 ideia por slide.

Responsável: Redator + Nelson

Output: Roteiro de slides aprovado (1 ideia por slide, máx. 20 slides)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes do design

5.2. Design do template de slides

Ação: Criar o template de slides no software escolhido: slide de capa, slide de título de seção, slide de conteúdo com texto + imagem, slide de dados/gráfico, slide de citação/depoimento, slide de encerramento e CTA. Todos dentro do sistema visual da identidade.

Responsável: Designer Senior

Output: Template de slides com todas as variações (master slides)

Prazo referência: 2 dias úteis

5.3. Diagramação de todos os slides

Ação: Aplicar o conteúdo definitivo em todos os slides. Tratar e inserir imagens, criar infográficos e gráficos de dados, formatar textos conforme hierarquia do template. Garantir consistência visual e fluidez da narrativa.

Responsável: Designer Senior + Redator

Output: Apresentação completa diagramada em PDF para revisão interna

Prazo referência: 3 dias úteis

5.4. Revisão interna e do cliente

Ação: Nelson e Marco Andolfato revisam design e narrativa. Enviar ao cliente para aprovação de conteúdo e design. Máx. 2 rodadas de revisão incluídas. Garantir que dados e informações estejam validados pelo cliente.

Responsável: Marco Andolfato / Nelson

Output: Apresentação aprovada, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente

5.5. Exportação e entrega

Ação: Exportar em 3 formatos: (a) arquivo editável no software solicitado (.pptx ou .key); (b) PDF para projeção (alta resolução, widescreen 16:9); (c) PDF para envio (comprimido para e-mail, máx. 10MB). Incluir instrução de uso (como usar os master slides para editar).

Responsável: Designer Senior

Output: Pasta de entrega com 3 formatos + instrução de uso

Prazo referência: 1 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Máx. 1 ideia por slide; sem bullet points longos (máx. 3 bullets por slide); imagens com licença de uso; gráficos com fonte de dados citada; versão editável com master slides organizados; PDF de projeção em 16:9; PDF de envio abaixo de 10MB; aprovação do cliente registrada.

6.2 Erros Comuns a Evitar

Slides com parágrafos longos (''death by PowerPoint''); imagens baixadas do Google sem licença; gráficos sem fonte (risco de credibilidade); template sem master slides (cliente não consegue editar); arquivo editável sem as fontes embarcadas; enviar só PDF sem o arquivo editável.

  7. Ferramentas e Templates

Microsoft PowerPoint, Google Slides, Apple Keynote, Adobe Illustrator (assets), Figma (design inicial), Unsplash/Adobe Stock (imagens com licença).

  8. SLAs e Prazos

Roteiro: 1 dia útil. Template: 2 dias úteis. Diagramação: 3 dias úteis. Revisão: 3 dias úteis. Exportação: 1 dia útil. Total: 10–14 dias úteis.

  9. Fluxograma

Início → Briefing com objetivo e audiência → Criar roteiro de slides → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Design do template → Diagramar todos os slides → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Exportar 3 formatos → Entregar com instrução → Fim

  10. Glossário

Master slide: slide modelo em PowerPoint/Keynote que define o design padrão e é aplicado automaticamente. Death by PowerPoint: fenômeno de apresentações excessivamente textuais que perdem o engajamento da audiência. Widescreen 16:9: proporção de tela padrão para projetores e monitores modernos. CTA (Call to Action): elemento que convida o receptor a realizar uma ação específica.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Apresentação Comercial</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-011</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Apresentação em PowerPoint/Google Slides e/ou Keynote com design aplicado, diagramação de todos os slides, versão para projeção e versão para envio (PDF).</p><p><strong>2.2 Exclusões</strong></p><p>Apresentações de resultado financeiro (responsabilidade da diretoria), vídeos institucionais, apresentações de briefing interno TBO.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e design dos slides</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Estrutura de conteúdo e textos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing da apresentação (objetivo, audiência, número de slides estimado, dados a incluir), conteúdo do cliente (textos, dados, fotos).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Microsoft PowerPoint ou Google Slides (edição pelo cliente), Apple Keynote (apresentações premium), Adobe Illustrator (assets gráficos customizados), Figma (design de slide template).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Estrutura narrativa e roteiro de slides</strong></p><p>Ação: Definir a estrutura da apresentação com o cliente: problema/oportunidade → solução/empreendimento → diferenciais → provas → proposta/CTA. Criar roteiro slide a slide com título, conteúdo principal e visual sugerido para cada. Máx. 1 ideia por slide.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro de slides aprovado (1 ideia por slide, máx. 20 slides)</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova roteiro antes do design</strong></p><p><strong>5.2. Design do template de slides</strong></p><p>Ação: Criar o template de slides no software escolhido: slide de capa, slide de título de seção, slide de conteúdo com texto + imagem, slide de dados/gráfico, slide de citação/depoimento, slide de encerramento e CTA. Todos dentro do sistema visual da identidade.</p><p>Responsável: Designer Senior</p><p>Output: Template de slides com todas as variações (master slides)</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.3. Diagramação de todos os slides</strong></p><p>Ação: Aplicar o conteúdo definitivo em todos os slides. Tratar e inserir imagens, criar infográficos e gráficos de dados, formatar textos conforme hierarquia do template. Garantir consistência visual e fluidez da narrativa.</p><p>Responsável: Designer Senior + Redator</p><p>Output: Apresentação completa diagramada em PDF para revisão interna</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.4. Revisão interna e do cliente</strong></p><p>Ação: Nelson e Marco Andolfato revisam design e narrativa. Enviar ao cliente para aprovação de conteúdo e design. Máx. 2 rodadas de revisão incluídas. Garantir que dados e informações estejam validados pelo cliente.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Apresentação aprovada, ajustes aplicados</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente</strong></p><p><strong>5.5. Exportação e entrega</strong></p><p>Ação: Exportar em 3 formatos: (a) arquivo editável no software solicitado (.pptx ou .key); (b) PDF para projeção (alta resolução, widescreen 16:9); (c) PDF para envio (comprimido para e-mail, máx. 10MB). Incluir instrução de uso (como usar os master slides para editar).</p><p>Responsável: Designer Senior</p><p>Output: Pasta de entrega com 3 formatos + instrução de uso</p><p>Prazo referência: 1 dia útil</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Máx. 1 ideia por slide; sem bullet points longos (máx. 3 bullets por slide); imagens com licença de uso; gráficos com fonte de dados citada; versão editável com master slides organizados; PDF de projeção em 16:9; PDF de envio abaixo de 10MB; aprovação do cliente registrada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Slides com parágrafos longos (''death by PowerPoint''); imagens baixadas do Google sem licença; gráficos sem fonte (risco de credibilidade); template sem master slides (cliente não consegue editar); arquivo editável sem as fontes embarcadas; enviar só PDF sem o arquivo editável.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Microsoft PowerPoint, Google Slides, Apple Keynote, Adobe Illustrator (assets), Figma (design inicial), Unsplash/Adobe Stock (imagens com licença).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Roteiro: 1 dia útil. Template: 2 dias úteis. Diagramação: 3 dias úteis. Revisão: 3 dias úteis. Exportação: 1 dia útil. Total: 10–14 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing com objetivo e audiência → Criar roteiro de slides → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Design do template → Diagramar todos os slides → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Exportar 3 formatos → Entregar com instrução → Fim</p><p><strong>  10. Glossário</strong></p><p>Master slide: slide modelo em PowerPoint/Keynote que define o design padrão e é aplicado automaticamente. Death by PowerPoint: fenômeno de apresentações excessivamente textuais que perdem o engajamento da audiência. Widescreen 16:9: proporção de tela padrão para projetores e monitores modernos. CTA (Call to Action): elemento que convida o receptor a realizar uma ação específica.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    9,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-011
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.', '<p>Criar a apresentação comercial institucional da incorporadora e/ou do empreendimento para reuniões de negociação, eventos e apresentações para investidores ou parceiros.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Apresentação em PowerPoint/Google Slides e/ou Keynote com design aplicado, diagramação de todos os slides, versão para projeção e versão para envio (PDF).', '<p>Apresentação em PowerPoint/Google Slides e/ou Keynote com design aplicado, diagramação de todos os slides, versão para projeção e versão para envio (PDF).</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Apresentações de resultado financeiro (responsabilidade da diretoria), vídeos institucionais, apresentações de briefing interno TBO.', '<p>Apresentações de resultado financeiro (responsabilidade da diretoria), vídeos institucionais, apresentações de briefing interno TBO.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e design dos slides

Responsável

Redator

Estrutura de conteúdo e textos

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação estratégica final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e design dos slides</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Estrutura de conteúdo e textos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação estratégica final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing da apresentação (objetivo, audiência, número de slides estimado, dados a incluir), conteúdo do cliente (textos, dados, fotos).', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), briefing da apresentação (objetivo, audiência, número de slides estimado, dados a incluir), conteúdo do cliente (textos, dados, fotos).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Microsoft PowerPoint ou Google Slides (edição pelo cliente), Apple Keynote (apresentações premium), Adobe Illustrator (assets gráficos customizados), Figma (design de slide template).', '<p>Microsoft PowerPoint ou Google Slides (edição pelo cliente), Apple Keynote (apresentações premium), Adobe Illustrator (assets gráficos customizados), Figma (design de slide template).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Estrutura narrativa e roteiro de slides', 'Ação: Definir a estrutura da apresentação com o cliente: problema/oportunidade → solução/empreendimento → diferenciais → provas → proposta/CTA. Criar roteiro slide a slide com título, conteúdo principal e visual sugerido para cada. Máx. 1 ideia por slide.

Responsável: Redator + Nelson

Output: Roteiro de slides aprovado (1 ideia por slide, máx. 20 slides)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes do design', '<p>Ação: Definir a estrutura da apresentação com o cliente: problema/oportunidade → solução/empreendimento → diferenciais → provas → proposta/CTA. Criar roteiro slide a slide com título, conteúdo principal e visual sugerido para cada. Máx. 1 ideia por slide.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro de slides aprovado (1 ideia por slide, máx. 20 slides)</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova roteiro antes do design</strong></p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Design do template de slides', 'Ação: Criar o template de slides no software escolhido: slide de capa, slide de título de seção, slide de conteúdo com texto + imagem, slide de dados/gráfico, slide de citação/depoimento, slide de encerramento e CTA. Todos dentro do sistema visual da identidade.

Responsável: Designer Senior

Output: Template de slides com todas as variações (master slides)

Prazo referência: 2 dias úteis', '<p>Ação: Criar o template de slides no software escolhido: slide de capa, slide de título de seção, slide de conteúdo com texto + imagem, slide de dados/gráfico, slide de citação/depoimento, slide de encerramento e CTA. Todos dentro do sistema visual da identidade.</p><p>Responsável: Designer Senior</p><p>Output: Template de slides com todas as variações (master slides)</p><p>Prazo referência: 2 dias úteis</p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação de todos os slides', 'Ação: Aplicar o conteúdo definitivo em todos os slides. Tratar e inserir imagens, criar infográficos e gráficos de dados, formatar textos conforme hierarquia do template. Garantir consistência visual e fluidez da narrativa.

Responsável: Designer Senior + Redator

Output: Apresentação completa diagramada em PDF para revisão interna

Prazo referência: 3 dias úteis', '<p>Ação: Aplicar o conteúdo definitivo em todos os slides. Tratar e inserir imagens, criar infográficos e gráficos de dados, formatar textos conforme hierarquia do template. Garantir consistência visual e fluidez da narrativa.</p><p>Responsável: Designer Senior + Redator</p><p>Output: Apresentação completa diagramada em PDF para revisão interna</p><p>Prazo referência: 3 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna e do cliente', 'Ação: Nelson e Marco Andolfato revisam design e narrativa. Enviar ao cliente para aprovação de conteúdo e design. Máx. 2 rodadas de revisão incluídas. Garantir que dados e informações estejam validados pelo cliente.

Responsável: Marco Andolfato / Nelson

Output: Apresentação aprovada, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente', '<p>Ação: Nelson e Marco Andolfato revisam design e narrativa. Enviar ao cliente para aprovação de conteúdo e design. Máx. 2 rodadas de revisão incluídas. Garantir que dados e informações estejam validados pelo cliente.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Apresentação aprovada, ajustes aplicados</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Exportação e entrega', 'Ação: Exportar em 3 formatos: (a) arquivo editável no software solicitado (.pptx ou .key); (b) PDF para projeção (alta resolução, widescreen 16:9); (c) PDF para envio (comprimido para e-mail, máx. 10MB). Incluir instrução de uso (como usar os master slides para editar).

Responsável: Designer Senior

Output: Pasta de entrega com 3 formatos + instrução de uso

Prazo referência: 1 dia útil', '<p>Ação: Exportar em 3 formatos: (a) arquivo editável no software solicitado (.pptx ou .key); (b) PDF para projeção (alta resolução, widescreen 16:9); (c) PDF para envio (comprimido para e-mail, máx. 10MB). Incluir instrução de uso (como usar os master slides para editar).</p><p>Responsável: Designer Senior</p><p>Output: Pasta de entrega com 3 formatos + instrução de uso</p><p>Prazo referência: 1 dia útil</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Máx. 1 ideia por slide; sem bullet points longos (máx. 3 bullets por slide); imagens com licença de uso; gráficos com fonte de dados citada; versão editável com master slides organizados; PDF de projeção em 16:9; PDF de envio abaixo de 10MB; aprovação do cliente registrada.', '<p>Máx. 1 ideia por slide; sem bullet points longos (máx. 3 bullets por slide); imagens com licença de uso; gráficos com fonte de dados citada; versão editável com master slides organizados; PDF de projeção em 16:9; PDF de envio abaixo de 10MB; aprovação do cliente registrada.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Slides com parágrafos longos (''death by PowerPoint''); imagens baixadas do Google sem licença; gráficos sem fonte (risco de credibilidade); template sem master slides (cliente não consegue editar); arquivo editável sem as fontes embarcadas; enviar só PDF sem o arquivo editável.', '<p>Slides com parágrafos longos (''death by PowerPoint''); imagens baixadas do Google sem licença; gráficos sem fonte (risco de credibilidade); template sem master slides (cliente não consegue editar); arquivo editável sem as fontes embarcadas; enviar só PDF sem o arquivo editável.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Microsoft PowerPoint, Google Slides, Apple Keynote, Adobe Illustrator (assets), Figma (design inicial), Unsplash/Adobe Stock (imagens com licença).', '<p>Microsoft PowerPoint, Google Slides, Apple Keynote, Adobe Illustrator (assets), Figma (design inicial), Unsplash/Adobe Stock (imagens com licença).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Roteiro: 1 dia útil. Template: 2 dias úteis. Diagramação: 3 dias úteis. Revisão: 3 dias úteis. Exportação: 1 dia útil. Total: 10–14 dias úteis.', '<p>Roteiro: 1 dia útil. Template: 2 dias úteis. Diagramação: 3 dias úteis. Revisão: 3 dias úteis. Exportação: 1 dia útil. Total: 10–14 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com objetivo e audiência → Criar roteiro de slides → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Design do template → Diagramar todos os slides → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Exportar 3 formatos → Entregar com instrução → Fim', '<p>Início → Briefing com objetivo e audiência → Criar roteiro de slides → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Design do template → Diagramar todos os slides → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Exportar 3 formatos → Entregar com instrução → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Master slide: slide modelo em PowerPoint/Keynote que define o design padrão e é aplicado automaticamente. Death by PowerPoint: fenômeno de apresentações excessivamente textuais que perdem o engajamento da audiência. Widescreen 16:9: proporção de tela padrão para projetores e monitores modernos. CTA (Call to Action): elemento que convida o receptor a realizar uma ação específica.', '<p>Master slide: slide modelo em PowerPoint/Keynote que define o design padrão e é aplicado automaticamente. Death by PowerPoint: fenômeno de apresentações excessivamente textuais que perdem o engajamento da audiência. Widescreen 16:9: proporção de tela padrão para projetores e monitores modernos. CTA (Call to Action): elemento que convida o receptor a realizar uma ação específica.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-012: Guia do Corretor ──
END $$;