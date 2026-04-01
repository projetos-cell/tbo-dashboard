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
END $$;