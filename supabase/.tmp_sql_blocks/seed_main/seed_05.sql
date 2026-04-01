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
    'Folder Sanfona',
    'tbo-brd-008-folder-sanfona',
    'branding',
    'checklist',
    'Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.',
    'Standard Operating Procedure

Folder Sanfona

Código

TBO-BRD-008

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

Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.

  2. Escopo

2.1 O que está coberto

Definição da estrutura de dobras, roteiro de conteúdo por painel, diagramação, arte final e especificação de impressão do folder sanfona.

2.2 Exclusões

Produção e impressão física (responsabilidade do cliente), folder combate (SOP BRD-07), flyer (SOP BRD-09).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Layout, diagramação e arte final

Responsável



Redator

Roteiro narrativo por painel

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renders do empreendimento, plantas baixas, conteúdo de lazer e diferenciais, tamanho final definido (formato e número de dobras: 4, 6 ou 8 painéis).

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação com dobras), Adobe Illustrator, Adobe Photoshop, template de diagramação com guias de dobra do fornecedor gráfico.



  5. Procedimento Passo a Passo

5.1. Definição do formato e dobras

Ação: Definir com o cliente o formato final desejado (ex: A4 com 6 painéis, DL com 4 painéis). Solicitar template de diagramação ao fornecedor gráfico com guias de dobra, sangria e área segura. Definir o modo de abertura e a sequência de leitura dos painéis.

Responsável: Designer Senior + Atendimento

Output: Template de diagramação recebido do gráfico, formato definido e aprovado

Prazo referência: 1 dia útil

5.2. Roteiro narrativo por painel

Ação: Criar o roteiro de conteúdo painel a painel seguindo uma narrativa progressiva: Capa (gancho visual) → Conceito/manifesto → Localização → Implantação e áreas → Tipologias → Lazer e diferenciais → Incorporadora e contato (contracapa). Cada painel com título, texto e visual definidos.

Responsável: Redator + Nelson

Output: Roteiro completo por painel aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes da diagramação

5.3. Diagramação na estrutura de dobras

Ação: Diagramar o folder em InDesign seguindo o template com guias de dobra. Atenção especial à continuidade visual entre painéis adjacentes e ao alinhamento de elementos que cruzam dobras. Aplicar identidade visual em toda a estrutura.

Responsável: Designer Senior

Output: Layout completo em INDD + PDF com simulação de dobras para revisão

Prazo referência: 3 dias úteis

5.4. Revisão interna, ajustes e aprovação do cliente

Ação: Revisão interna por Nelson e Marco Andolfato. Enviar ao cliente PDF com simulação visual de como o folder fica dobrado (mockup fotorrealístico). Registrar aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado pelo cliente, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente

5.5. Arte final e especificação de impressão

Ação: Finalizar arte em PDF para impressão (CMYK, 300dpi, com sangria e corte). Emitir especificação de impressão para o cliente: papel recomendado (ex: couchê 150g para miolo, 300g para capa), tipo de dobra, quantidade mínima econômica, acabamento (verniz, laminação fosca/brilhosa).

Responsável: Designer Senior

Output: PDF de impressão + PDF digital + especificação de impressão entregues

Prazo referência: 1 dia útil

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Template do fornecedor gráfico utilizado (não template genérico); dobras não cortam elementos críticos (faces, textos principais); continuidade visual entre painéis testada em mockup impresso; todos os textos revisados; dados validados pelo cliente; arte final em CMYK com sangria correta.

6.2 Erros Comuns a Evitar

Criar o layout sem o template do gráfico (gera problemas de alinhamento na impressão); elementos críticos cruzando dobras sem intenção; excesso de texto por painel (folder deve ser visual); sequência narrativa confusa; mockup de dobra não apresentado ao cliente antes da aprovação.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Smartmockups (simulação de dobras), fornecedor gráfico homologado.

  8. SLAs e Prazos

Definição de formato: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 3 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 9–12 dias úteis.

  9. Fluxograma

Início → Definir formato e dobras com cliente → Solicitar template ao gráfico → Criar roteiro por painel → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar em InDesign com dobras → Mockup de simulação → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Especificação de impressão → Entregar → Fim

  10. Glossário

Folder sanfona: material impresso com múltiplas dobras paralelas (como um acordeão), criando uma narrativa visual sequencial. DL (Dimension Lengthwise): formato de envelope padrão (220x110mm), comum em materiais corporativos. Couchê: papel com acabamento liso e brilhante, padrão para materiais gráficos de qualidade. Laminação fosca: acabamento superficial que elimina o brilho e dá aparência premium ao impresso.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Folder Sanfona</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-008</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Definição da estrutura de dobras, roteiro de conteúdo por painel, diagramação, arte final e especificação de impressão do folder sanfona.</p><p><strong>2.2 Exclusões</strong></p><p>Produção e impressão física (responsabilidade do cliente), folder combate (SOP BRD-07), flyer (SOP BRD-09).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Layout, diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Roteiro narrativo por painel</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renders do empreendimento, plantas baixas, conteúdo de lazer e diferenciais, tamanho final definido (formato e número de dobras: 4, 6 ou 8 painéis).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe InDesign (diagramação com dobras), Adobe Illustrator, Adobe Photoshop, template de diagramação com guias de dobra do fornecedor gráfico.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Definição do formato e dobras</strong></p><p>Ação: Definir com o cliente o formato final desejado (ex: A4 com 6 painéis, DL com 4 painéis). Solicitar template de diagramação ao fornecedor gráfico com guias de dobra, sangria e área segura. Definir o modo de abertura e a sequência de leitura dos painéis.</p><p>Responsável: Designer Senior + Atendimento</p><p>Output: Template de diagramação recebido do gráfico, formato definido e aprovado</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Roteiro narrativo por painel</strong></p><p>Ação: Criar o roteiro de conteúdo painel a painel seguindo uma narrativa progressiva: Capa (gancho visual) → Conceito/manifesto → Localização → Implantação e áreas → Tipologias → Lazer e diferenciais → Incorporadora e contato (contracapa). Cada painel com título, texto e visual definidos.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro completo por painel aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova roteiro antes da diagramação</strong></p><p><strong>5.3. Diagramação na estrutura de dobras</strong></p><p>Ação: Diagramar o folder em InDesign seguindo o template com guias de dobra. Atenção especial à continuidade visual entre painéis adjacentes e ao alinhamento de elementos que cruzam dobras. Aplicar identidade visual em toda a estrutura.</p><p>Responsável: Designer Senior</p><p>Output: Layout completo em INDD + PDF com simulação de dobras para revisão</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.4. Revisão interna, ajustes e aprovação do cliente</strong></p><p>Ação: Revisão interna por Nelson e Marco Andolfato. Enviar ao cliente PDF com simulação visual de como o folder fica dobrado (mockup fotorrealístico). Registrar aprovação formal. Máx. 2 rodadas de revisão.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Folder aprovado pelo cliente, ajustes aplicados</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p><p><strong>5.5. Arte final e especificação de impressão</strong></p><p>Ação: Finalizar arte em PDF para impressão (CMYK, 300dpi, com sangria e corte). Emitir especificação de impressão para o cliente: papel recomendado (ex: couchê 150g para miolo, 300g para capa), tipo de dobra, quantidade mínima econômica, acabamento (verniz, laminação fosca/brilhosa).</p><p>Responsável: Designer Senior</p><p>Output: PDF de impressão + PDF digital + especificação de impressão entregues</p><p>Prazo referência: 1 dia útil</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Template do fornecedor gráfico utilizado (não template genérico); dobras não cortam elementos críticos (faces, textos principais); continuidade visual entre painéis testada em mockup impresso; todos os textos revisados; dados validados pelo cliente; arte final em CMYK com sangria correta.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Criar o layout sem o template do gráfico (gera problemas de alinhamento na impressão); elementos críticos cruzando dobras sem intenção; excesso de texto por painel (folder deve ser visual); sequência narrativa confusa; mockup de dobra não apresentado ao cliente antes da aprovação.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Smartmockups (simulação de dobras), fornecedor gráfico homologado.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Definição de formato: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 3 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 9–12 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Definir formato e dobras com cliente → Solicitar template ao gráfico → Criar roteiro por painel → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar em InDesign com dobras → Mockup de simulação → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Especificação de impressão → Entregar → Fim</p><p><strong>  10. Glossário</strong></p><p>Folder sanfona: material impresso com múltiplas dobras paralelas (como um acordeão), criando uma narrativa visual sequencial. DL (Dimension Lengthwise): formato de envelope padrão (220x110mm), comum em materiais corporativos. Couchê: papel com acabamento liso e brilhante, padrão para materiais gráficos de qualidade. Laminação fosca: acabamento superficial que elimina o brilho e dá aparência premium ao impresso.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    6,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-008
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.', '<p>Criar o folder sanfona do empreendimento — peça de apresentação sequencial com dobras múltiplas que guia o comprador pela jornada do empreendimento de forma lúdica e narrativa.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Definição da estrutura de dobras, roteiro de conteúdo por painel, diagramação, arte final e especificação de impressão do folder sanfona.', '<p>Definição da estrutura de dobras, roteiro de conteúdo por painel, diagramação, arte final e especificação de impressão do folder sanfona.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção e impressão física (responsabilidade do cliente), folder combate (SOP BRD-07), flyer (SOP BRD-09).', '<p>Produção e impressão física (responsabilidade do cliente), folder combate (SOP BRD-07), flyer (SOP BRD-09).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Layout, diagramação e arte final

Responsável

Redator

Roteiro narrativo por painel

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Layout, diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Roteiro narrativo por painel</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renders do empreendimento, plantas baixas, conteúdo de lazer e diferenciais, tamanho final definido (formato e número de dobras: 4, 6 ou 8 painéis).', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renders do empreendimento, plantas baixas, conteúdo de lazer e diferenciais, tamanho final definido (formato e número de dobras: 4, 6 ou 8 painéis).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação com dobras), Adobe Illustrator, Adobe Photoshop, template de diagramação com guias de dobra do fornecedor gráfico.', '<p>Adobe InDesign (diagramação com dobras), Adobe Illustrator, Adobe Photoshop, template de diagramação com guias de dobra do fornecedor gráfico.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Definição do formato e dobras', 'Ação: Definir com o cliente o formato final desejado (ex: A4 com 6 painéis, DL com 4 painéis). Solicitar template de diagramação ao fornecedor gráfico com guias de dobra, sangria e área segura. Definir o modo de abertura e a sequência de leitura dos painéis.

Responsável: Designer Senior + Atendimento

Output: Template de diagramação recebido do gráfico, formato definido e aprovado

Prazo referência: 1 dia útil', '<p>Ação: Definir com o cliente o formato final desejado (ex: A4 com 6 painéis, DL com 4 painéis). Solicitar template de diagramação ao fornecedor gráfico com guias de dobra, sangria e área segura. Definir o modo de abertura e a sequência de leitura dos painéis.</p><p>Responsável: Designer Senior + Atendimento</p><p>Output: Template de diagramação recebido do gráfico, formato definido e aprovado</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Roteiro narrativo por painel', 'Ação: Criar o roteiro de conteúdo painel a painel seguindo uma narrativa progressiva: Capa (gancho visual) → Conceito/manifesto → Localização → Implantação e áreas → Tipologias → Lazer e diferenciais → Incorporadora e contato (contracapa). Cada painel com título, texto e visual definidos.

Responsável: Redator + Nelson

Output: Roteiro completo por painel aprovado internamente

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson aprova roteiro antes da diagramação', '<p>Ação: Criar o roteiro de conteúdo painel a painel seguindo uma narrativa progressiva: Capa (gancho visual) → Conceito/manifesto → Localização → Implantação e áreas → Tipologias → Lazer e diferenciais → Incorporadora e contato (contracapa). Cada painel com título, texto e visual definidos.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro completo por painel aprovado internamente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova roteiro antes da diagramação</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação na estrutura de dobras', 'Ação: Diagramar o folder em InDesign seguindo o template com guias de dobra. Atenção especial à continuidade visual entre painéis adjacentes e ao alinhamento de elementos que cruzam dobras. Aplicar identidade visual em toda a estrutura.

Responsável: Designer Senior

Output: Layout completo em INDD + PDF com simulação de dobras para revisão

Prazo referência: 3 dias úteis', '<p>Ação: Diagramar o folder em InDesign seguindo o template com guias de dobra. Atenção especial à continuidade visual entre painéis adjacentes e ao alinhamento de elementos que cruzam dobras. Aplicar identidade visual em toda a estrutura.</p><p>Responsável: Designer Senior</p><p>Output: Layout completo em INDD + PDF com simulação de dobras para revisão</p><p>Prazo referência: 3 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna, ajustes e aprovação do cliente', 'Ação: Revisão interna por Nelson e Marco Andolfato. Enviar ao cliente PDF com simulação visual de como o folder fica dobrado (mockup fotorrealístico). Registrar aprovação formal. Máx. 2 rodadas de revisão.

Responsável: Marco Andolfato / Nelson

Output: Folder aprovado pelo cliente, ajustes aplicados

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente', '<p>Ação: Revisão interna por Nelson e Marco Andolfato. Enviar ao cliente PDF com simulação visual de como o folder fica dobrado (mockup fotorrealístico). Registrar aprovação formal. Máx. 2 rodadas de revisão.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Folder aprovado pelo cliente, ajustes aplicados</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes do envio ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Arte final e especificação de impressão', 'Ação: Finalizar arte em PDF para impressão (CMYK, 300dpi, com sangria e corte). Emitir especificação de impressão para o cliente: papel recomendado (ex: couchê 150g para miolo, 300g para capa), tipo de dobra, quantidade mínima econômica, acabamento (verniz, laminação fosca/brilhosa).

Responsável: Designer Senior

Output: PDF de impressão + PDF digital + especificação de impressão entregues

Prazo referência: 1 dia útil', '<p>Ação: Finalizar arte em PDF para impressão (CMYK, 300dpi, com sangria e corte). Emitir especificação de impressão para o cliente: papel recomendado (ex: couchê 150g para miolo, 300g para capa), tipo de dobra, quantidade mínima econômica, acabamento (verniz, laminação fosca/brilhosa).</p><p>Responsável: Designer Senior</p><p>Output: PDF de impressão + PDF digital + especificação de impressão entregues</p><p>Prazo referência: 1 dia útil</p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Template do fornecedor gráfico utilizado (não template genérico); dobras não cortam elementos críticos (faces, textos principais); continuidade visual entre painéis testada em mockup impresso; todos os textos revisados; dados validados pelo cliente; arte final em CMYK com sangria correta.', '<p>Template do fornecedor gráfico utilizado (não template genérico); dobras não cortam elementos críticos (faces, textos principais); continuidade visual entre painéis testada em mockup impresso; todos os textos revisados; dados validados pelo cliente; arte final em CMYK com sangria correta.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Criar o layout sem o template do gráfico (gera problemas de alinhamento na impressão); elementos críticos cruzando dobras sem intenção; excesso de texto por painel (folder deve ser visual); sequência narrativa confusa; mockup de dobra não apresentado ao cliente antes da aprovação.', '<p>Criar o layout sem o template do gráfico (gera problemas de alinhamento na impressão); elementos críticos cruzando dobras sem intenção; excesso de texto por painel (folder deve ser visual); sequência narrativa confusa; mockup de dobra não apresentado ao cliente antes da aprovação.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Smartmockups (simulação de dobras), fornecedor gráfico homologado.', '<p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Smartmockups (simulação de dobras), fornecedor gráfico homologado.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Definição de formato: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 3 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 9–12 dias úteis.', '<p>Definição de formato: 1 dia útil. Roteiro: 1 dia útil. Diagramação: 3 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 1 dia útil. Total: 9–12 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Definir formato e dobras com cliente → Solicitar template ao gráfico → Criar roteiro por painel → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar em InDesign com dobras → Mockup de simulação → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Especificação de impressão → Entregar → Fim', '<p>Início → Definir formato e dobras com cliente → Solicitar template ao gráfico → Criar roteiro por painel → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar em InDesign com dobras → Mockup de simulação → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 2x) → Sim: Arte final → Especificação de impressão → Entregar → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Folder sanfona: material impresso com múltiplas dobras paralelas (como um acordeão), criando uma narrativa visual sequencial. DL (Dimension Lengthwise): formato de envelope padrão (220x110mm), comum em materiais corporativos. Couchê: papel com acabamento liso e brilhante, padrão para materiais gráficos de qualidade. Laminação fosca: acabamento superficial que elimina o brilho e dá aparência premium ao impresso.', '<p>Folder sanfona: material impresso com múltiplas dobras paralelas (como um acordeão), criando uma narrativa visual sequencial. DL (Dimension Lengthwise): formato de envelope padrão (220x110mm), comum em materiais corporativos. Couchê: papel com acabamento liso e brilhante, padrão para materiais gráficos de qualidade. Laminação fosca: acabamento superficial que elimina o brilho e dá aparência premium ao impresso.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-009: Flyer ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Flyer',
    'tbo-brd-009-flyer',
    'branding',
    'checklist',
    'Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.',
    'Standard Operating Procedure

Flyer

Código

TBO-BRD-009

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

Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.

  2. Escopo

2.1 O que está coberto

Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.

2.2 Exclusões

Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final

Responsável



Redator

Headline e copy do flyer

Responsável



Nelson (PO Branding)

Aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).

4.2 Ferramentas e Acessos

Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).



  5. Procedimento Passo a Passo

5.1. Briefing e definição de formatos

Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).

Responsável: Atendimento + Redator

Output: Briefing de flyer preenchido e aprovado, formatos confirmados

Prazo referência: 0,5 dia útil

5.2. Copy e headline

Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.

Responsável: Redator

Output: Copy aprovado internamente por Nelson

Prazo referência: 0,5 dia útil

[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual

5.3. Desenvolvimento visual

Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.

Responsável: Designer

Output: Layout em todos os formatos em PDF/PNG para revisão

Prazo referência: 1 dia útil

5.4. Revisão, aprovação e arte final

Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).

Responsável: Marco Andolfato / Designer

Output: Arte final entregue em todos os formatos com nomenclatura padrão

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.

6.2 Erros Comuns a Evitar

Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).

  8. SLAs e Prazos

Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.

  9. Fluxograma

Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim

  10. Glossário

Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Flyer</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-009</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.</p><p><strong>2.2 Exclusões</strong></p><p>Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Headline e copy do flyer</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Briefing e definição de formatos</strong></p><p>Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).</p><p>Responsável: Atendimento + Redator</p><p>Output: Briefing de flyer preenchido e aprovado, formatos confirmados</p><p>Prazo referência: 0,5 dia útil</p><p><strong>5.2. Copy e headline</strong></p><p>Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.</p><p>Responsável: Redator</p><p>Output: Copy aprovado internamente por Nelson</p><p>Prazo referência: 0,5 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual</strong></p><p><strong>5.3. Desenvolvimento visual</strong></p><p>Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.</p><p>Responsável: Designer</p><p>Output: Layout em todos os formatos em PDF/PNG para revisão</p><p>Prazo referência: 1 dia útil</p><p><strong>5.4. Revisão, aprovação e arte final</strong></p><p>Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).</p><p>Responsável: Marco Andolfato / Designer</p><p>Output: Arte final entregue em todos os formatos com nomenclatura padrão</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim</p><p><strong>  10. Glossário</strong></p><p>Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    7,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-009
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.', '<p>Produzir flyers de impacto para distribuição física e digital, comunicando o empreendimento de forma rápida e persuasiva em ações de mídia, plantões de vendas e eventos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.', '<p>Criação de flyers em formato A5 (padrão), versão digital (1080x1920 stories e 1080x1080 feed), arte final para impressão offset ou digital.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.', '<p>Criativos para tráfego pago (cobre SOP BRD-13), folders (SOP BRD-07 e BRD-08), produção e impressão física.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final

Responsável

Redator

Headline e copy do flyer

Responsável

Nelson (PO Branding)

Aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Headline e copy do flyer</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).', '<p>Identidade visual aprovada (BRD-02), briefing da ação (objetivo do flyer, data de evento ou validade, oferta ou chamada principal, público-alvo), imagem principal (render ou foto).</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).', '<p>Adobe Illustrator ou InDesign (flyer impresso), Figma ou Photoshop (versão digital), Canva (apenas para versões de uso autônomo pelo cliente).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Briefing e definição de formatos', 'Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).

Responsável: Atendimento + Redator

Output: Briefing de flyer preenchido e aprovado, formatos confirmados

Prazo referência: 0,5 dia útil', '<p>Ação: Confirmar com o cliente: objetivo do flyer (plantão de vendas, evento, promoção), formatos necessários (impresso A5, digital stories, digital feed), chamada principal (headline), data limite. Definir se é peça única ou kit (múltiplos formatos).</p><p>Responsável: Atendimento + Redator</p><p>Output: Briefing de flyer preenchido e aprovado, formatos confirmados</p><p>Prazo referência: 0,5 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Copy e headline', 'Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.

Responsável: Redator

Output: Copy aprovado internamente por Nelson

Prazo referência: 0,5 dia útil

[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual', '<p>Ação: Criar headline principal com foco em benefício ou urgência (ex: ''Unidades com vista permanente. Últimas disponíveis.''). Redigir textos de suporte (subtítulo, chamada para ação, dados de evento se houver). Máx. 30 palavras no total do impresso.</p><p>Responsável: Redator</p><p>Output: Copy aprovado internamente por Nelson</p><p>Prazo referência: 0,5 dia útil</p><p><strong>[APROVAÇÃO] Nelson aprova copy antes do desenvolvimento visual</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Desenvolvimento visual', 'Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.

Responsável: Designer

Output: Layout em todos os formatos em PDF/PNG para revisão

Prazo referência: 1 dia útil', '<p>Ação: Criar o layout do flyer com hierarquia visual clara: imagem impactante (render ou foto tratada), headline em destaque, informações secundárias, logo do empreendimento + incorporadora, contato e QR Code. Desenvolver simultaneamente todas as versões de formato.</p><p>Responsável: Designer</p><p>Output: Layout em todos os formatos em PDF/PNG para revisão</p><p>Prazo referência: 1 dia útil</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão, aprovação e arte final', 'Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).

Responsável: Marco Andolfato / Designer

Output: Arte final entregue em todos os formatos com nomenclatura padrão

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente', '<p>Ação: Nelson revisa. Marco Andolfato aprova. Enviar ao cliente para validação. Aplicar ajustes (máx. 1 rodada incluída). Exportar arte final para impressão (CMYK, 300dpi) e arquivos digitais (RGB, 72dpi para web).</p><p>Responsável: Marco Andolfato / Designer</p><p>Output: Arte final entregue em todos os formatos com nomenclatura padrão</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato assina antes de enviar ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.', '<p>Headline legível em 3 segundos a 1 metro de distância (impresso); QR Code funcional; logo do empreendimento e da incorporadora presentes; data e informações de evento corretas; arte final impressa em CMYK; arte digital em RGB; nomenclatura de arquivos padronizada.</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.', '<p>Mais de 50 palavras no impresso (flyer deve ser visual, não texto); imagem de baixa resolução esticada; QR Code não testado; versão para print em RGB; versão para web em CMYK com tamanho excessivo; aprovação verbal sem registro.</p>', 11, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).', '<p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Figma (digital), Canva (versão autônoma para cliente).</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.', '<p>Briefing: 0,5 dia útil. Copy: 0,5 dia útil. Layout: 1 dia útil. Aprovação: 1 dia útil. Arte final: 0,5 dia útil. Total: 3–5 dias úteis.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim', '<p>Início → Briefing com cliente → Definir formatos e copy → [NELSON APROVA COPY?] → Não: revisar → Sim: Desenvolver layout → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE APROVA?] → Não: ajustar (máx. 1 rodada) → Sim: Arte final (print + digital) → Entregar → Fim</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.', '<p>Flyer: material gráfico de pequeno formato com comunicação direta e objetiva, para distribuição física ou digital. A5: formato de papel 148x210mm, padrão para flyers impressos. Stories: formato vertical 1080x1920px para Instagram e WhatsApp. Feed: formato quadrado 1080x1080px para publicações em redes sociais. Offset: processo de impressão industrial de alta qualidade para grandes tiragens.</p>', 15, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 16, 'step');

  -- ── TBO-BRD-010: Papelaria ──
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Papelaria',
    'tbo-brd-010-papelaria',
    'branding',
    'checklist',
    'Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.',
    'Standard Operating Procedure

Papelaria

Código

TBO-BRD-010

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

Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.

  2. Escopo

2.1 O que está coberto

Cartão de visita, papel timbrado, envelope, pasta institucional, assinatura de e-mail, bloco de anotações, crachá e lacre de contrato. Arte final pronta para produção.

2.2 Exclusões

Impressão e produção física (responsabilidade do cliente), brindes e merchandising, papelaria de obra (EPI, placas de segurança).

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final de todos os itens

Responsável



Nelson (PO Branding)

Curadoria e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



Cliente/Incorporadora

Fornecimento de dados (contatos, endereços) e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), lista de itens de papelaria solicitados pelo cliente, dados para os itens (nomes, cargos, telefones, endereço, site, e-mail), logotipos em todos os formatos necessários.

4.2 Ferramentas e Acessos

Adobe Illustrator (cartão, crachá, envelope), Adobe InDesign (papel timbrado, pasta), Adobe Photoshop (composições), fornecedores gráficos para especificação técnica.



  5. Procedimento Passo a Passo

5.1. Levantamento dos itens e coleta de dados

Ação: Confirmar com o cliente a lista completa de itens, quantidade de versões (ex: 5 cartões com nomes diferentes), todos os dados para cada peça. Identificar especificações de produção necessárias (ex: cartão 9x5cm com verniz UV localizado).

Responsável: Atendimento + Designer

Output: Lista de itens com dados completos e especificações técnicas

Prazo referência: 0,5 dia útil

5.2. Desenvolvimento dos layouts

Ação: Criar layouts de todos os itens de papelaria aplicando o sistema visual da identidade. Para cada item: desenvolver frente e verso quando aplicável, testar legibilidade, verificar hierarquia de informações. Apresentar internamente para aprovação antes de enviar ao cliente.

Responsável: Designer

Output: Layouts de todos os itens em PDF para revisão interna

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente

5.3. Aprovação do cliente e ajustes

Ação: Enviar PDF ao cliente mostrando todos os itens em mockup fotorrealístico. Registrar feedback. Aplicar ajustes (máx. 2 rodadas incluídas). Confirmar todos os dados (nomes, e-mails, telefones) na última versão antes da arte final.

Responsável: Nelson / Atendimento

Output: Todos os itens aprovados pelo cliente por escrito

Prazo referência: 3 dias úteis

5.4. Arte final e especificações de produção

Ação: Exportar arte final de cada item conforme especificação do gráfico. Para assinatura de e-mail: gerar em HTML ou PNG + instruções de instalação. Para cartão e itens com corte especial: incluir linha de corte e sangria. Emitir guia de produção com recomendações de material e acabamento.

Responsável: Designer

Output: Pasta completa de arte final + guia de produção

Prazo referência: 2 dias úteis

5.5. Entrega e instrução de uso

Ação: Marco Andolfato revisa entrega final. Organizar pasta de entrega no Drive com nomenclatura padronizada. Enviar e-mail de entrega ao cliente com instruções de uso de cada item (especialmente assinatura de e-mail e papel timbrado).

Responsável: Marco Andolfato / Nelson

Output: Entrega concluída, e-mail com instruções de uso enviado ao cliente

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato valida entrega final

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Todos os dados revisados pelo cliente na última versão (nomes, cargos, contatos); cartão de visita conforme norma gráfica (9x5cm ou 8.5x5.4cm); arte final de cartão com sangria e linha de corte; assinatura de e-mail testada no Gmail e Outlook; papel timbrado com margens adequadas para impressão doméstica; guia de produção entregue.

6.2 Erros Comuns a Evitar

Erro de digitação em nome ou cargo (revisão exclusiva do designer, sem conferência do cliente); assinatura de e-mail entregue apenas em PNG sem HTML (não funciona em todos os clientes de e-mail); cartão sem sangria; dados desatualizados não comunicados pelo cliente.

  7. Ferramentas e Templates

Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Smartmockups (mockups de papelaria), Stripo ou similar (HTML de assinatura de e-mail), Google Drive (entrega organizada).

  8. SLAs e Prazos

Levantamento: 0,5 dia útil. Layouts: 3 dias úteis. Aprovação: 3 dias úteis. Arte final: 2 dias úteis. Entrega: 1 dia útil. Total: 9–12 dias úteis.

  9. Fluxograma

Início → Coletar dados e lista de itens → Desenvolver layouts de todos os itens → [NELSON APROVA INTERNAMENTE?] → Não: revisar → Sim: Enviar ao cliente em mockup → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Arte final + guia de produção → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar Drive + enviar instruções → Fim

  10. Glossário

Papelaria corporativa: conjunto de materiais impressos e digitais de identidade de uma empresa ou empreendimento. Verniz UV localizado: acabamento brilhante aplicado em área específica da peça, destacando elementos. Lacre de contrato: peça gráfica adesiva usada para selar documentos de compra e venda. Mockup: simulação fotorrealística de como uma peça ficará no ambiente real.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Papelaria</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-010</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Cartão de visita, papel timbrado, envelope, pasta institucional, assinatura de e-mail, bloco de anotações, crachá e lacre de contrato. Arte final pronta para produção.</p><p><strong>2.2 Exclusões</strong></p><p>Impressão e produção física (responsabilidade do cliente), brindes e merchandising, papelaria de obra (EPI, placas de segurança).</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final de todos os itens</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Curadoria e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de dados (contatos, endereços) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), lista de itens de papelaria solicitados pelo cliente, dados para os itens (nomes, cargos, telefones, endereço, site, e-mail), logotipos em todos os formatos necessários.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe Illustrator (cartão, crachá, envelope), Adobe InDesign (papel timbrado, pasta), Adobe Photoshop (composições), fornecedores gráficos para especificação técnica.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Levantamento dos itens e coleta de dados</strong></p><p>Ação: Confirmar com o cliente a lista completa de itens, quantidade de versões (ex: 5 cartões com nomes diferentes), todos os dados para cada peça. Identificar especificações de produção necessárias (ex: cartão 9x5cm com verniz UV localizado).</p><p>Responsável: Atendimento + Designer</p><p>Output: Lista de itens com dados completos e especificações técnicas</p><p>Prazo referência: 0,5 dia útil</p><p><strong>5.2. Desenvolvimento dos layouts</strong></p><p>Ação: Criar layouts de todos os itens de papelaria aplicando o sistema visual da identidade. Para cada item: desenvolver frente e verso quando aplicável, testar legibilidade, verificar hierarquia de informações. Apresentar internamente para aprovação antes de enviar ao cliente.</p><p>Responsável: Designer</p><p>Output: Layouts de todos os itens em PDF para revisão interna</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente</strong></p><p><strong>5.3. Aprovação do cliente e ajustes</strong></p><p>Ação: Enviar PDF ao cliente mostrando todos os itens em mockup fotorrealístico. Registrar feedback. Aplicar ajustes (máx. 2 rodadas incluídas). Confirmar todos os dados (nomes, e-mails, telefones) na última versão antes da arte final.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Todos os itens aprovados pelo cliente por escrito</p><p>Prazo referência: 3 dias úteis</p><p><strong>5.4. Arte final e especificações de produção</strong></p><p>Ação: Exportar arte final de cada item conforme especificação do gráfico. Para assinatura de e-mail: gerar em HTML ou PNG + instruções de instalação. Para cartão e itens com corte especial: incluir linha de corte e sangria. Emitir guia de produção com recomendações de material e acabamento.</p><p>Responsável: Designer</p><p>Output: Pasta completa de arte final + guia de produção</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.5. Entrega e instrução de uso</strong></p><p>Ação: Marco Andolfato revisa entrega final. Organizar pasta de entrega no Drive com nomenclatura padronizada. Enviar e-mail de entrega ao cliente com instruções de uso de cada item (especialmente assinatura de e-mail e papel timbrado).</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Entrega concluída, e-mail com instruções de uso enviado ao cliente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Marco Andolfato valida entrega final</strong></p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Todos os dados revisados pelo cliente na última versão (nomes, cargos, contatos); cartão de visita conforme norma gráfica (9x5cm ou 8.5x5.4cm); arte final de cartão com sangria e linha de corte; assinatura de e-mail testada no Gmail e Outlook; papel timbrado com margens adequadas para impressão doméstica; guia de produção entregue.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Erro de digitação em nome ou cargo (revisão exclusiva do designer, sem conferência do cliente); assinatura de e-mail entregue apenas em PNG sem HTML (não funciona em todos os clientes de e-mail); cartão sem sangria; dados desatualizados não comunicados pelo cliente.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Smartmockups (mockups de papelaria), Stripo ou similar (HTML de assinatura de e-mail), Google Drive (entrega organizada).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Levantamento: 0,5 dia útil. Layouts: 3 dias úteis. Aprovação: 3 dias úteis. Arte final: 2 dias úteis. Entrega: 1 dia útil. Total: 9–12 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Coletar dados e lista de itens → Desenvolver layouts de todos os itens → [NELSON APROVA INTERNAMENTE?] → Não: revisar → Sim: Enviar ao cliente em mockup → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Arte final + guia de produção → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar Drive + enviar instruções → Fim</p><p><strong>  10. Glossário</strong></p><p>Papelaria corporativa: conjunto de materiais impressos e digitais de identidade de uma empresa ou empreendimento. Verniz UV localizado: acabamento brilhante aplicado em área específica da peça, destacando elementos. Lacre de contrato: peça gráfica adesiva usada para selar documentos de compra e venda. Mockup: simulação fotorrealística de como uma peça ficará no ambiente real.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    8,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-010
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.', '<p>Desenvolver e entregar o kit de papelaria corporativa do empreendimento e/ou da incorporadora, garantindo coerência visual e aplicação correta da identidade em todos os pontos de contato físicos.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Cartão de visita, papel timbrado, envelope, pasta institucional, assinatura de e-mail, bloco de anotações, crachá e lacre de contrato. Arte final pronta para produção.', '<p>Cartão de visita, papel timbrado, envelope, pasta institucional, assinatura de e-mail, bloco de anotações, crachá e lacre de contrato. Arte final pronta para produção.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Impressão e produção física (responsabilidade do cliente), brindes e merchandising, papelaria de obra (EPI, placas de segurança).', '<p>Impressão e produção física (responsabilidade do cliente), brindes e merchandising, papelaria de obra (EPI, placas de segurança).</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer (Branding)

Criação e arte final de todos os itens

Responsável

Nelson (PO Branding)

Curadoria e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador

Cliente/Incorporadora

Fornecimento de dados (contatos, endereços) e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer (Branding)</p></td><td><p>Criação e arte final de todos os itens</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Curadoria e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de dados (contatos, endereços) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), lista de itens de papelaria solicitados pelo cliente, dados para os itens (nomes, cargos, telefones, endereço, site, e-mail), logotipos em todos os formatos necessários.', '<p>Identidade visual aprovada (BRD-02), lista de itens de papelaria solicitados pelo cliente, dados para os itens (nomes, cargos, telefones, endereço, site, e-mail), logotipos em todos os formatos necessários.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe Illustrator (cartão, crachá, envelope), Adobe InDesign (papel timbrado, pasta), Adobe Photoshop (composições), fornecedores gráficos para especificação técnica.', '<p>Adobe Illustrator (cartão, crachá, envelope), Adobe InDesign (papel timbrado, pasta), Adobe Photoshop (composições), fornecedores gráficos para especificação técnica.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Levantamento dos itens e coleta de dados', 'Ação: Confirmar com o cliente a lista completa de itens, quantidade de versões (ex: 5 cartões com nomes diferentes), todos os dados para cada peça. Identificar especificações de produção necessárias (ex: cartão 9x5cm com verniz UV localizado).

Responsável: Atendimento + Designer

Output: Lista de itens com dados completos e especificações técnicas

Prazo referência: 0,5 dia útil', '<p>Ação: Confirmar com o cliente a lista completa de itens, quantidade de versões (ex: 5 cartões com nomes diferentes), todos os dados para cada peça. Identificar especificações de produção necessárias (ex: cartão 9x5cm com verniz UV localizado).</p><p>Responsável: Atendimento + Designer</p><p>Output: Lista de itens com dados completos e especificações técnicas</p><p>Prazo referência: 0,5 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Desenvolvimento dos layouts', 'Ação: Criar layouts de todos os itens de papelaria aplicando o sistema visual da identidade. Para cada item: desenvolver frente e verso quando aplicável, testar legibilidade, verificar hierarquia de informações. Apresentar internamente para aprovação antes de enviar ao cliente.

Responsável: Designer

Output: Layouts de todos os itens em PDF para revisão interna

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente', '<p>Ação: Criar layouts de todos os itens de papelaria aplicando o sistema visual da identidade. Para cada item: desenvolver frente e verso quando aplicável, testar legibilidade, verificar hierarquia de informações. Apresentar internamente para aprovação antes de enviar ao cliente.</p><p>Responsável: Designer</p><p>Output: Layouts de todos os itens em PDF para revisão interna</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Nelson aprova internamente antes de enviar ao cliente</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Aprovação do cliente e ajustes', 'Ação: Enviar PDF ao cliente mostrando todos os itens em mockup fotorrealístico. Registrar feedback. Aplicar ajustes (máx. 2 rodadas incluídas). Confirmar todos os dados (nomes, e-mails, telefones) na última versão antes da arte final.

Responsável: Nelson / Atendimento

Output: Todos os itens aprovados pelo cliente por escrito

Prazo referência: 3 dias úteis', '<p>Ação: Enviar PDF ao cliente mostrando todos os itens em mockup fotorrealístico. Registrar feedback. Aplicar ajustes (máx. 2 rodadas incluídas). Confirmar todos os dados (nomes, e-mails, telefones) na última versão antes da arte final.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Todos os itens aprovados pelo cliente por escrito</p><p>Prazo referência: 3 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Arte final e especificações de produção', 'Ação: Exportar arte final de cada item conforme especificação do gráfico. Para assinatura de e-mail: gerar em HTML ou PNG + instruções de instalação. Para cartão e itens com corte especial: incluir linha de corte e sangria. Emitir guia de produção com recomendações de material e acabamento.

Responsável: Designer

Output: Pasta completa de arte final + guia de produção

Prazo referência: 2 dias úteis', '<p>Ação: Exportar arte final de cada item conforme especificação do gráfico. Para assinatura de e-mail: gerar em HTML ou PNG + instruções de instalação. Para cartão e itens com corte especial: incluir linha de corte e sangria. Emitir guia de produção com recomendações de material e acabamento.</p><p>Responsável: Designer</p><p>Output: Pasta completa de arte final + guia de produção</p><p>Prazo referência: 2 dias úteis</p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Entrega e instrução de uso', 'Ação: Marco Andolfato revisa entrega final. Organizar pasta de entrega no Drive com nomenclatura padronizada. Enviar e-mail de entrega ao cliente com instruções de uso de cada item (especialmente assinatura de e-mail e papel timbrado).

Responsável: Marco Andolfato / Nelson

Output: Entrega concluída, e-mail com instruções de uso enviado ao cliente

Prazo referência: 1 dia útil

[APROVAÇÃO] Marco Andolfato valida entrega final', '<p>Ação: Marco Andolfato revisa entrega final. Organizar pasta de entrega no Drive com nomenclatura padronizada. Enviar e-mail de entrega ao cliente com instruções de uso de cada item (especialmente assinatura de e-mail e papel timbrado).</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Entrega concluída, e-mail com instruções de uso enviado ao cliente</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Marco Andolfato valida entrega final</strong></p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Todos os dados revisados pelo cliente na última versão (nomes, cargos, contatos); cartão de visita conforme norma gráfica (9x5cm ou 8.5x5.4cm); arte final de cartão com sangria e linha de corte; assinatura de e-mail testada no Gmail e Outlook; papel timbrado com margens adequadas para impressão doméstica; guia de produção entregue.', '<p>Todos os dados revisados pelo cliente na última versão (nomes, cargos, contatos); cartão de visita conforme norma gráfica (9x5cm ou 8.5x5.4cm); arte final de cartão com sangria e linha de corte; assinatura de e-mail testada no Gmail e Outlook; papel timbrado com margens adequadas para impressão doméstica; guia de produção entregue.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Erro de digitação em nome ou cargo (revisão exclusiva do designer, sem conferência do cliente); assinatura de e-mail entregue apenas em PNG sem HTML (não funciona em todos os clientes de e-mail); cartão sem sangria; dados desatualizados não comunicados pelo cliente.', '<p>Erro de digitação em nome ou cargo (revisão exclusiva do designer, sem conferência do cliente); assinatura de e-mail entregue apenas em PNG sem HTML (não funciona em todos os clientes de e-mail); cartão sem sangria; dados desatualizados não comunicados pelo cliente.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Smartmockups (mockups de papelaria), Stripo ou similar (HTML de assinatura de e-mail), Google Drive (entrega organizada).', '<p>Adobe Illustrator CC, Adobe InDesign CC, Adobe Photoshop CC, Smartmockups (mockups de papelaria), Stripo ou similar (HTML de assinatura de e-mail), Google Drive (entrega organizada).</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Levantamento: 0,5 dia útil. Layouts: 3 dias úteis. Aprovação: 3 dias úteis. Arte final: 2 dias úteis. Entrega: 1 dia útil. Total: 9–12 dias úteis.', '<p>Levantamento: 0,5 dia útil. Layouts: 3 dias úteis. Aprovação: 3 dias úteis. Arte final: 2 dias úteis. Entrega: 1 dia útil. Total: 9–12 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Coletar dados e lista de itens → Desenvolver layouts de todos os itens → [NELSON APROVA INTERNAMENTE?] → Não: revisar → Sim: Enviar ao cliente em mockup → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Arte final + guia de produção → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar Drive + enviar instruções → Fim', '<p>Início → Coletar dados e lista de itens → Desenvolver layouts de todos os itens → [NELSON APROVA INTERNAMENTE?] → Não: revisar → Sim: Enviar ao cliente em mockup → [CLIENTE APROVA?] → Não: ajustar (máx. 2 rodadas) → Sim: Arte final + guia de produção → [MARCO VALIDA ENTREGA?] → Não: corrigir → Sim: Organizar Drive + enviar instruções → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Papelaria corporativa: conjunto de materiais impressos e digitais de identidade de uma empresa ou empreendimento. Verniz UV localizado: acabamento brilhante aplicado em área específica da peça, destacando elementos. Lacre de contrato: peça gráfica adesiva usada para selar documentos de compra e venda. Mockup: simulação fotorrealística de como uma peça ficará no ambiente real.', '<p>Papelaria corporativa: conjunto de materiais impressos e digitais de identidade de uma empresa ou empreendimento. Verniz UV localizado: acabamento brilhante aplicado em área específica da peça, destacando elementos. Lacre de contrato: peça gráfica adesiva usada para selar documentos de compra e venda. Mockup: simulação fotorrealística de como uma peça ficará no ambiente real.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-011: Apresentação Comercial ──
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
  INSERT INTO knowledge_sops (tenant_id, title, slug, bu, category, description, content, content_html, status, priority, tags, order_index, version)
  VALUES (
    v_tenant_id,
    'Guia do Corretor',
    'tbo-brd-012-guia-do-corretor',
    'branding',
    'checklist',
    'Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.',
    'Standard Operating Procedure

Guia do Corretor

Código

TBO-BRD-012

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

Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.

  2. Escopo

2.1 O que está coberto

Guia do corretor em formato impresso (A4 espiral ou wire-o) e digital (PDF interativo), com: manifesto do empreendimento, tabela de tipologias, diferenciais, argumentos de venda, respostas a objeções, mapa de localização e contatos da incorporadora.

2.2 Exclusões

Treinamento presencial de corretores (responsabilidade da incorporadora), script de abordagem digital (módulo Digital), materiais para mídia paga.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Redator

Conteúdo, scripts e argumentos

Responsável



Designer Senior (Branding)

Diagramação e arte final

Responsável



Nelson (PO Branding)

Direção criativa e curadoria de conteúdo

Aprovador



Marco Andolfato

Aprovação final

Aprovador



Cliente/Incorporadora

Validação de dados técnicos e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Storytelling aprovado (BRD-03), folder combate (BRD-07) em andamento ou aprovado, dados técnicos completos do empreendimento, lista de objeções da equipe de vendas, tabela de tipologias e metragens, mapa de implantação.

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação), Adobe Illustrator, Adobe Photoshop, Adobe Acrobat Pro (PDF interativo com índice clicável).



  5. Procedimento Passo a Passo

5.1. Estrutura e levantamento de conteúdo

Ação: Definir os capítulos do guia: (1) Bem-vindo ao empreendimento, (2) Conceito e manifesto, (3) Localização e mapa, (4) O empreendimento em números, (5) Tipologias (plantas + metragens), (6) Infraestrutura e lazer, (7) Diferenciais do produto, (8) Argumentos de venda e respostas a objeções, (9) Incorporadora e equipe, (10) Contatos. Levantar todos os conteúdos necessários.

Responsável: Redator + Atendimento

Output: Estrutura de capítulos aprovada, todo conteúdo coletado e organizado

Prazo referência: 2 dias úteis

5.2. Criação do conteúdo textual

Ação: Redigir todos os textos do guia: introdução motivacional para corretores, argumentos de venda por segmento (investidor, família, casal jovem), scripts de resposta para as 10 principais objeções (preço, localização, concorrência, prazo de entrega), textos descritivos de cada tipologia.

Responsável: Redator

Output: Conteúdo textual completo revisado por Nelson

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson valida todo o conteúdo antes da diagramação

5.3. Diagramação completa

Ação: Diagramar o guia em InDesign com design coerente com a identidade visual do empreendimento, porém funcional para uso prático (fácil navegação, páginas com tabs ou separadores de capítulo, iconografia clara). Incluir sumário com hyperlinks na versão digital.

Responsável: Designer Senior

Output: Guia completo diagramado em PDF para revisão interna

Prazo referência: 4 dias úteis

5.4. Revisão interna e do cliente

Ação: Revisão por Nelson (design e narrativa) e Marco Andolfato (estratégia e qualidade). Enviar ao cliente para validação de todos os dados técnicos. Coletar aprovação formal. Ajustes máx. 2 rodadas.

Responsável: Marco Andolfato / Nelson

Output: Guia aprovado com dados validados pelo cliente

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação antes da arte final

5.5. Arte final, PDF interativo e entrega

Ação: Produzir arte final para impressão (CMYK, 300dpi, com guias de sangria). Criar PDF interativo com sumário clicável, links para WhatsApp e site. Organizar pasta de entrega. Recomendar acabamento de impressão (wire-o ou espiral para facilitar uso em campo).

Responsável: Designer Senior

Output: Arte final de impressão + PDF interativo + especificação de encadernação entregues

Prazo referência: 2 dias úteis

  6. Critérios de Qualidade

6.1 Checklist de Entrega

10 objeções principais com respostas documentadas; scripts de venda por perfil de comprador (mín. 3 perfis); dados técnicos validados pelo cliente por escrito; plantas com metragens e numeração de cômodos; PDF digital com sumário clicável; links de contato (WhatsApp, site) testados e funcionais.

6.2 Erros Comuns a Evitar

Dados de metragem ou preço sem validação do cliente (risco legal); scripts genéricos sem adaptação ao público do empreendimento; PDF com arquivo pesado demais para uso mobile (máx. 15MB); guia diagramado sem divisores de capítulo (dificulta navegação em campo); sem instrução de uso enviada ao corretor.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive.

  8. SLAs e Prazos

Estrutura e conteúdo: 5 dias úteis. Diagramação: 4 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 2 dias úteis. Total: 14–18 dias úteis.

  9. Fluxograma

Início → Definir estrutura de capítulos → Levantar conteúdo → Redigir textos e scripts → [NELSON VALIDA CONTEÚDO?] → Não: revisar → Sim: Diagramar guia completo → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Arte final + PDF interativo → Especificar encadernação → Entregar → Fim

  10. Glossário

Guia do corretor: manual operacional de vendas entregue aos corretores, com argumentos, scripts e dados do empreendimento. Script de venda: roteiro estruturado de argumentação para uso em atendimento. Wire-o: tipo de encadernação com espiral metálico, permite abertura total de 360° e é prático para uso em campo. Objeção: resistência do comprador que precisa ser respondida com argumento específico.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Guia do Corretor</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-012</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Guia do corretor em formato impresso (A4 espiral ou wire-o) e digital (PDF interativo), com: manifesto do empreendimento, tabela de tipologias, diferenciais, argumentos de venda, respostas a objeções, mapa de localização e contatos da incorporadora.</p><p><strong>2.2 Exclusões</strong></p><p>Treinamento presencial de corretores (responsabilidade da incorporadora), script de abordagem digital (módulo Digital), materiais para mídia paga.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator</p></td><td><p>Conteúdo, scripts e argumentos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e curadoria de conteúdo</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Validação de dados técnicos e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Storytelling aprovado (BRD-03), folder combate (BRD-07) em andamento ou aprovado, dados técnicos completos do empreendimento, lista de objeções da equipe de vendas, tabela de tipologias e metragens, mapa de implantação.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe InDesign (diagramação), Adobe Illustrator, Adobe Photoshop, Adobe Acrobat Pro (PDF interativo com índice clicável).</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Estrutura e levantamento de conteúdo</strong></p><p>Ação: Definir os capítulos do guia: (1) Bem-vindo ao empreendimento, (2) Conceito e manifesto, (3) Localização e mapa, (4) O empreendimento em números, (5) Tipologias (plantas + metragens), (6) Infraestrutura e lazer, (7) Diferenciais do produto, (8) Argumentos de venda e respostas a objeções, (9) Incorporadora e equipe, (10) Contatos. Levantar todos os conteúdos necessários.</p><p>Responsável: Redator + Atendimento</p><p>Output: Estrutura de capítulos aprovada, todo conteúdo coletado e organizado</p><p>Prazo referência: 2 dias úteis</p><p><strong>5.2. Criação do conteúdo textual</strong></p><p>Ação: Redigir todos os textos do guia: introdução motivacional para corretores, argumentos de venda por segmento (investidor, família, casal jovem), scripts de resposta para as 10 principais objeções (preço, localização, concorrência, prazo de entrega), textos descritivos de cada tipologia.</p><p>Responsável: Redator</p><p>Output: Conteúdo textual completo revisado por Nelson</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Nelson valida todo o conteúdo antes da diagramação</strong></p><p><strong>5.3. Diagramação completa</strong></p><p>Ação: Diagramar o guia em InDesign com design coerente com a identidade visual do empreendimento, porém funcional para uso prático (fácil navegação, páginas com tabs ou separadores de capítulo, iconografia clara). Incluir sumário com hyperlinks na versão digital.</p><p>Responsável: Designer Senior</p><p>Output: Guia completo diagramado em PDF para revisão interna</p><p>Prazo referência: 4 dias úteis</p><p><strong>5.4. Revisão interna e do cliente</strong></p><p>Ação: Revisão por Nelson (design e narrativa) e Marco Andolfato (estratégia e qualidade). Enviar ao cliente para validação de todos os dados técnicos. Coletar aprovação formal. Ajustes máx. 2 rodadas.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Guia aprovado com dados validados pelo cliente</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação antes da arte final</strong></p><p><strong>5.5. Arte final, PDF interativo e entrega</strong></p><p>Ação: Produzir arte final para impressão (CMYK, 300dpi, com guias de sangria). Criar PDF interativo com sumário clicável, links para WhatsApp e site. Organizar pasta de entrega. Recomendar acabamento de impressão (wire-o ou espiral para facilitar uso em campo).</p><p>Responsável: Designer Senior</p><p>Output: Arte final de impressão + PDF interativo + especificação de encadernação entregues</p><p>Prazo referência: 2 dias úteis</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>10 objeções principais com respostas documentadas; scripts de venda por perfil de comprador (mín. 3 perfis); dados técnicos validados pelo cliente por escrito; plantas com metragens e numeração de cômodos; PDF digital com sumário clicável; links de contato (WhatsApp, site) testados e funcionais.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Dados de metragem ou preço sem validação do cliente (risco legal); scripts genéricos sem adaptação ao público do empreendimento; PDF com arquivo pesado demais para uso mobile (máx. 15MB); guia diagramado sem divisores de capítulo (dificulta navegação em campo); sem instrução de uso enviada ao corretor.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive.</p><p><strong>  8. SLAs e Prazos</strong></p><p>Estrutura e conteúdo: 5 dias úteis. Diagramação: 4 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 2 dias úteis. Total: 14–18 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Definir estrutura de capítulos → Levantar conteúdo → Redigir textos e scripts → [NELSON VALIDA CONTEÚDO?] → Não: revisar → Sim: Diagramar guia completo → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Arte final + PDF interativo → Especificar encadernação → Entregar → Fim</p><p><strong>  10. Glossário</strong></p><p>Guia do corretor: manual operacional de vendas entregue aos corretores, com argumentos, scripts e dados do empreendimento. Script de venda: roteiro estruturado de argumentação para uso em atendimento. Wire-o: tipo de encadernação com espiral metálico, permite abertura total de 360° e é prático para uso em campo. Objeção: resistência do comprador que precisa ser respondida com argumento específico.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
    10,
    1
  )
  ON CONFLICT (tenant_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    content_html = EXCLUDED.content_html,
    description = EXCLUDED.description,
    updated_at = now()
  RETURNING id INTO v_sop_id;

  -- Steps for TBO-BRD-012
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.', '<p>Produzir o guia completo para corretores de imóveis que atuam na venda do empreendimento, consolidando argumentos de venda, scripts, objeções, plantas e informações técnicas em um documento de fácil consulta.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Guia do corretor em formato impresso (A4 espiral ou wire-o) e digital (PDF interativo), com: manifesto do empreendimento, tabela de tipologias, diferenciais, argumentos de venda, respostas a objeções, mapa de localização e contatos da incorporadora.', '<p>Guia do corretor em formato impresso (A4 espiral ou wire-o) e digital (PDF interativo), com: manifesto do empreendimento, tabela de tipologias, diferenciais, argumentos de venda, respostas a objeções, mapa de localização e contatos da incorporadora.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Treinamento presencial de corretores (responsabilidade da incorporadora), script de abordagem digital (módulo Digital), materiais para mídia paga.', '<p>Treinamento presencial de corretores (responsabilidade da incorporadora), script de abordagem digital (módulo Digital), materiais para mídia paga.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Redator

Conteúdo, scripts e argumentos

Responsável

Designer Senior (Branding)

Diagramação e arte final

Responsável

Nelson (PO Branding)

Direção criativa e curadoria de conteúdo

Aprovador

Marco Andolfato

Aprovação final

Aprovador

Cliente/Incorporadora

Validação de dados técnicos e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Redator</p></td><td><p>Conteúdo, scripts e argumentos</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e curadoria de conteúdo</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Validação de dados técnicos e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Storytelling aprovado (BRD-03), folder combate (BRD-07) em andamento ou aprovado, dados técnicos completos do empreendimento, lista de objeções da equipe de vendas, tabela de tipologias e metragens, mapa de implantação.', '<p>Storytelling aprovado (BRD-03), folder combate (BRD-07) em andamento ou aprovado, dados técnicos completos do empreendimento, lista de objeções da equipe de vendas, tabela de tipologias e metragens, mapa de implantação.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Illustrator, Adobe Photoshop, Adobe Acrobat Pro (PDF interativo com índice clicável).', '<p>Adobe InDesign (diagramação), Adobe Illustrator, Adobe Photoshop, Adobe Acrobat Pro (PDF interativo com índice clicável).</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Estrutura e levantamento de conteúdo', 'Ação: Definir os capítulos do guia: (1) Bem-vindo ao empreendimento, (2) Conceito e manifesto, (3) Localização e mapa, (4) O empreendimento em números, (5) Tipologias (plantas + metragens), (6) Infraestrutura e lazer, (7) Diferenciais do produto, (8) Argumentos de venda e respostas a objeções, (9) Incorporadora e equipe, (10) Contatos. Levantar todos os conteúdos necessários.

Responsável: Redator + Atendimento

Output: Estrutura de capítulos aprovada, todo conteúdo coletado e organizado

Prazo referência: 2 dias úteis', '<p>Ação: Definir os capítulos do guia: (1) Bem-vindo ao empreendimento, (2) Conceito e manifesto, (3) Localização e mapa, (4) O empreendimento em números, (5) Tipologias (plantas + metragens), (6) Infraestrutura e lazer, (7) Diferenciais do produto, (8) Argumentos de venda e respostas a objeções, (9) Incorporadora e equipe, (10) Contatos. Levantar todos os conteúdos necessários.</p><p>Responsável: Redator + Atendimento</p><p>Output: Estrutura de capítulos aprovada, todo conteúdo coletado e organizado</p><p>Prazo referência: 2 dias úteis</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Criação do conteúdo textual', 'Ação: Redigir todos os textos do guia: introdução motivacional para corretores, argumentos de venda por segmento (investidor, família, casal jovem), scripts de resposta para as 10 principais objeções (preço, localização, concorrência, prazo de entrega), textos descritivos de cada tipologia.

Responsável: Redator

Output: Conteúdo textual completo revisado por Nelson

Prazo referência: 3 dias úteis

[APROVAÇÃO] Nelson valida todo o conteúdo antes da diagramação', '<p>Ação: Redigir todos os textos do guia: introdução motivacional para corretores, argumentos de venda por segmento (investidor, família, casal jovem), scripts de resposta para as 10 principais objeções (preço, localização, concorrência, prazo de entrega), textos descritivos de cada tipologia.</p><p>Responsável: Redator</p><p>Output: Conteúdo textual completo revisado por Nelson</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Nelson valida todo o conteúdo antes da diagramação</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação completa', 'Ação: Diagramar o guia em InDesign com design coerente com a identidade visual do empreendimento, porém funcional para uso prático (fácil navegação, páginas com tabs ou separadores de capítulo, iconografia clara). Incluir sumário com hyperlinks na versão digital.

Responsável: Designer Senior

Output: Guia completo diagramado em PDF para revisão interna

Prazo referência: 4 dias úteis', '<p>Ação: Diagramar o guia em InDesign com design coerente com a identidade visual do empreendimento, porém funcional para uso prático (fácil navegação, páginas com tabs ou separadores de capítulo, iconografia clara). Incluir sumário com hyperlinks na versão digital.</p><p>Responsável: Designer Senior</p><p>Output: Guia completo diagramado em PDF para revisão interna</p><p>Prazo referência: 4 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna e do cliente', 'Ação: Revisão por Nelson (design e narrativa) e Marco Andolfato (estratégia e qualidade). Enviar ao cliente para validação de todos os dados técnicos. Coletar aprovação formal. Ajustes máx. 2 rodadas.

Responsável: Marco Andolfato / Nelson

Output: Guia aprovado com dados validados pelo cliente

Prazo referência: 3 dias úteis

[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação antes da arte final', '<p>Ação: Revisão por Nelson (design e narrativa) e Marco Andolfato (estratégia e qualidade). Enviar ao cliente para validação de todos os dados técnicos. Coletar aprovação formal. Ajustes máx. 2 rodadas.</p><p>Responsável: Marco Andolfato / Nelson</p><p>Output: Guia aprovado com dados validados pelo cliente</p><p>Prazo referência: 3 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato + cliente assinam aprovação antes da arte final</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Arte final, PDF interativo e entrega', 'Ação: Produzir arte final para impressão (CMYK, 300dpi, com guias de sangria). Criar PDF interativo com sumário clicável, links para WhatsApp e site. Organizar pasta de entrega. Recomendar acabamento de impressão (wire-o ou espiral para facilitar uso em campo).

Responsável: Designer Senior

Output: Arte final de impressão + PDF interativo + especificação de encadernação entregues

Prazo referência: 2 dias úteis', '<p>Ação: Produzir arte final para impressão (CMYK, 300dpi, com guias de sangria). Criar PDF interativo com sumário clicável, links para WhatsApp e site. Organizar pasta de entrega. Recomendar acabamento de impressão (wire-o ou espiral para facilitar uso em campo).</p><p>Responsável: Designer Senior</p><p>Output: Arte final de impressão + PDF interativo + especificação de encadernação entregues</p><p>Prazo referência: 2 dias úteis</p>', 10, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', '10 objeções principais com respostas documentadas; scripts de venda por perfil de comprador (mín. 3 perfis); dados técnicos validados pelo cliente por escrito; plantas com metragens e numeração de cômodos; PDF digital com sumário clicável; links de contato (WhatsApp, site) testados e funcionais.', '<p>10 objeções principais com respostas documentadas; scripts de venda por perfil de comprador (mín. 3 perfis); dados técnicos validados pelo cliente por escrito; plantas com metragens e numeração de cômodos; PDF digital com sumário clicável; links de contato (WhatsApp, site) testados e funcionais.</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Dados de metragem ou preço sem validação do cliente (risco legal); scripts genéricos sem adaptação ao público do empreendimento; PDF com arquivo pesado demais para uso mobile (máx. 15MB); guia diagramado sem divisores de capítulo (dificulta navegação em campo); sem instrução de uso enviada ao corretor.', '<p>Dados de metragem ou preço sem validação do cliente (risco legal); scripts genéricos sem adaptação ao público do empreendimento; PDF com arquivo pesado demais para uso mobile (máx. 15MB); guia diagramado sem divisores de capítulo (dificulta navegação em campo); sem instrução de uso enviada ao corretor.</p>', 12, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive.', '<p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Estrutura e conteúdo: 5 dias úteis. Diagramação: 4 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 2 dias úteis. Total: 14–18 dias úteis.', '<p>Estrutura e conteúdo: 5 dias úteis. Diagramação: 4 dias úteis. Revisão e aprovação: 3 dias úteis. Arte final: 2 dias úteis. Total: 14–18 dias úteis.</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Definir estrutura de capítulos → Levantar conteúdo → Redigir textos e scripts → [NELSON VALIDA CONTEÚDO?] → Não: revisar → Sim: Diagramar guia completo → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Arte final + PDF interativo → Especificar encadernação → Entregar → Fim', '<p>Início → Definir estrutura de capítulos → Levantar conteúdo → Redigir textos e scripts → [NELSON VALIDA CONTEÚDO?] → Não: revisar → Sim: Diagramar guia completo → Revisão interna → [MARCO APROVA?] → Não: corrigir → Sim: Enviar ao cliente → [CLIENTE VALIDA DADOS?] → Não: corrigir dados → Sim: Arte final + PDF interativo → Especificar encadernação → Entregar → Fim</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Guia do corretor: manual operacional de vendas entregue aos corretores, com argumentos, scripts e dados do empreendimento. Script de venda: roteiro estruturado de argumentação para uso em atendimento. Wire-o: tipo de encadernação com espiral metálico, permite abertura total de 360° e é prático para uso em campo. Objeção: resistência do comprador que precisa ser respondida com argumento específico.', '<p>Guia do corretor: manual operacional de vendas entregue aos corretores, com argumentos, scripts e dados do empreendimento. Script de venda: roteiro estruturado de argumentação para uso em atendimento. Wire-o: tipo de encadernação com espiral metálico, permite abertura total de 360° e é prático para uso em campo. Objeção: resistência do comprador que precisa ser respondida com argumento específico.</p>', 16, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 17, 'step');

  -- ── TBO-BRD-013: Criativos On Off ──
END $$;