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
    'Book de Vendas',
    'tbo-brd-006-book-de-vendas',
    'branding',
    'checklist',
    'Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.',
    'Standard Operating Procedure

Book de Vendas

Código

TBO-BRD-006

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

Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.

  2. Escopo

2.1 O que está coberto

Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.

2.2 Exclusões

Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.

  3. Responsáveis (RACI)

Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e arte final

Responsável



Redator

Textos e legendas

Responsável



Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador



Marco Andolfato

Aprovação final

Aprovador



Cliente/Incorporadora

Fornecimento de conteúdo (plantas, renders, dados) e aprovação



Informado

  4. Pré-requisitos

4.1 Inputs necessários

Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.

4.2 Ferramentas e Acessos

Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.



  5. Procedimento Passo a Passo

5.1. Reunião de conteúdo e coleta de materiais

Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.

Responsável: Atendimento + Redator

Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente

Prazo referência: 1 dia útil

5.2. Estrutura editorial e roteiro

Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.

Responsável: Redator + Nelson

Output: Roteiro editorial aprovado (índice com descrição de cada seção)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação

5.3. Diagramação — versão 1

Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).

Responsável: Designer Senior + Redator

Output: Book completo em INDD + PDF de revisão para aprovação interna

Prazo referência: 5 dias úteis

5.4. Revisão interna e de conteúdo

Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.

Responsável: Nelson + Marco Andolfato

Output: Lista consolidada de ajustes internos aplicados

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente

5.5. Aprovação do cliente e ajustes

Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.

Responsável: Nelson / Atendimento

Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados

Prazo referência: Máx. 2 rodadas em 5 dias úteis

[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.

5.6. Arte final, PDF interativo e entrega

Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.

Responsável: Designer Senior

Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente

Prazo referência: 2 dias úteis

  6. Critérios de Qualidade

6.1 Checklist de Entrega

Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.

6.2 Erros Comuns a Evitar

Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.

  7. Ferramentas e Templates

Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).

  8. SLAs e Prazos

Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.

  9. Fluxograma

Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim

  10. Glossário

Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.



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
    '<p><em>Standard Operating Procedure</em></p><p><strong>Book de Vendas</strong></p><table><tr><td><p><strong>Código</strong></p></td><td><p><strong>TBO-BRD-006</strong></p></td></tr><tr><td><p><strong>Versão</strong></p></td><td><p>1.0</p></td></tr><tr><td><p><strong>Data de Criação</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Última Atualização</strong></p></td><td><p>2026-03-19</p></td></tr><tr><td><p><strong>Área / BU</strong></p></td><td><p>Branding</p></td></tr><tr><td><p><strong>Responsável</strong></p></td><td><p>Nelson (PO Branding)</p></td></tr><tr><td><p><strong>Aprovador</strong></p></td><td><p>Marco Andolfato</p></td></tr></table><p><strong>  1. Objetivo</strong></p><p>Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.</p><p><strong>  2. Escopo</strong></p><p><strong>2.1 O que está coberto</strong></p><p>Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.</p><p><strong>2.2 Exclusões</strong></p><p>Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.</p><p><strong>  3. Responsáveis (RACI)</strong></p><table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Textos e legendas</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de conteúdo (plantas, renders, dados) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table><p><strong>  4. Pré-requisitos</strong></p><p><strong>4.1 Inputs necessários</strong></p><p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.</p><p><strong>4.2 Ferramentas e Acessos</strong></p><p>Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.</p><p><strong>  5. Procedimento Passo a Passo</strong></p><p><strong>5.1. Reunião de conteúdo e coleta de materiais</strong></p><p>Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.</p><p>Responsável: Atendimento + Redator</p><p>Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente</p><p>Prazo referência: 1 dia útil</p><p><strong>5.2. Estrutura editorial e roteiro</strong></p><p>Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro editorial aprovado (índice com descrição de cada seção)</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação</strong></p><p><strong>5.3. Diagramação — versão 1</strong></p><p>Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).</p><p>Responsável: Designer Senior + Redator</p><p>Output: Book completo em INDD + PDF de revisão para aprovação interna</p><p>Prazo referência: 5 dias úteis</p><p><strong>5.4. Revisão interna e de conteúdo</strong></p><p>Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Lista consolidada de ajustes internos aplicados</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente</strong></p><p><strong>5.5. Aprovação do cliente e ajustes</strong></p><p>Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados</p><p>Prazo referência: Máx. 2 rodadas em 5 dias úteis</p><p><strong>[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.</strong></p><p><strong>5.6. Arte final, PDF interativo e entrega</strong></p><p>Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.</p><p>Responsável: Designer Senior</p><p>Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente</p><p>Prazo referência: 2 dias úteis</p><p><strong>  6. Critérios de Qualidade</strong></p><p><strong>6.1 Checklist de Entrega</strong></p><p>Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.</p><p><strong>6.2 Erros Comuns a Evitar</strong></p><p>Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.</p><p><strong>  7. Ferramentas e Templates</strong></p><p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).</p><p><strong>  8. SLAs e Prazos</strong></p><p>Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.</p><p><strong>  9. Fluxograma</strong></p><p>Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim</p><p><strong>  10. Glossário</strong></p><p>Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.</p><p><strong>  11. Histórico de Revisões</strong></p><table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>',
    'published',
    'medium',
    ARRAY['marca','identidade','design','entrega','qualidade','cliente']::TEXT[],
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

  -- Steps for TBO-BRD-006
  DELETE FROM knowledge_sop_steps WHERE sop_id = v_sop_id;
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '1. Objetivo', 'Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.', '<p>Produzir o book de vendas do empreendimento — principal ferramenta de apresentação para corretores e compradores — com todas as informações técnicas, visuais e emocionais do empreendimento.</p>', 0, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 1 O que está coberto', 'Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.', '<p>Criação e diagramação do book de vendas completo (versão impressa e digital/PDF interativo), incluindo conceito, plantas, tabela de preços, diferenciais, área de lazer e ficha técnica.</p>', 1, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '2. 2 Exclusões', 'Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.', '<p>Produção das renderizações (responsabilidade do estúdio de arquitetura/visualização 3D), impressão e encadernação (responsabilidade do cliente ou produtora), book digital em formato de app.</p>', 2, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '3. Responsáveis (RACI)', 'Papel

Responsável

Aprovador

Informado

Designer Senior (Branding)

Diagramação e arte final

Responsável

Redator

Textos e legendas

Responsável

Nelson (PO Branding)

Direção criativa e aprovação interna

Aprovador

Marco Andolfato

Aprovação final

Aprovador

Cliente/Incorporadora

Fornecimento de conteúdo (plantas, renders, dados) e aprovação

Informado', '<table><tr><td><p><strong>Papel</strong></p></td><td><p><strong>Responsável</strong></p></td><td><p><strong>Aprovador</strong></p></td><td><p><strong>Informado</strong></p></td></tr><tr><td><p>Designer Senior (Branding)</p></td><td><p>Diagramação e arte final</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Redator</p></td><td><p>Textos e legendas</p></td><td><p>Responsável</p></td><td></td></tr><tr><td><p>Nelson (PO Branding)</p></td><td><p>Direção criativa e aprovação interna</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Marco Andolfato</p></td><td><p>Aprovação final</p></td><td><p>Aprovador</p></td><td></td></tr><tr><td><p>Cliente/Incorporadora</p></td><td><p>Fornecimento de conteúdo (plantas, renders, dados) e aprovação</p></td><td></td><td><p>Informado</p></td></tr></table>', 3, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 1 Inputs necessários', 'Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.', '<p>Identidade visual aprovada (BRD-02), storytelling aprovado (BRD-03), renderizações aprovadas pelo cliente (fachada, perspectiva, interiores, área de lazer), plantas baixas cotadas, tabela de tipologias e preços (se autorizada), ficha técnica do empreendimento.</p>', 4, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '4. 2 Ferramentas e Acessos', 'Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.', '<p>Adobe InDesign (diagramação), Adobe Photoshop (tratamento de imagens), Adobe Illustrator (ícones e infográficos), Adobe Acrobat (PDF interativo), fornecedor gráfico para especificação de impressão.</p>', 5, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.1. Reunião de conteúdo e coleta de materiais', 'Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.

Responsável: Atendimento + Redator

Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente

Prazo referência: 1 dia útil', '<p>Ação: Receber e organizar todos os conteúdos do cliente: renders, plantas, fotos do terreno/localização, dados técnicos, ficha de especificações, diferenciais de lazer, mapa de localização. Identificar lacunas e comunicar ao cliente o que está faltando.</p><p>Responsável: Atendimento + Redator</p><p>Output: Checklist de conteúdo preenchido, pasta organizada no Google Drive, itens faltantes comunicados ao cliente</p><p>Prazo referência: 1 dia útil</p>', 6, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.2. Estrutura editorial e roteiro', 'Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.

Responsável: Redator + Nelson

Output: Roteiro editorial aprovado (índice com descrição de cada seção)

Prazo referência: 1 dia útil

[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação', '<p>Ação: Definir a estrutura do book: índice de seções (capa, conceito/manifesto, localização, implantação, tipologias de planta, lazer, especificações, incorporadora, contato). Definir número de páginas estimado e fluxo narrativo. Aprovação interna do roteiro.</p><p>Responsável: Redator + Nelson</p><p>Output: Roteiro editorial aprovado (índice com descrição de cada seção)</p><p>Prazo referência: 1 dia útil</p><p><strong>[APROVAÇÃO] Nelson valida roteiro antes do início da diagramação</strong></p>', 7, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.3. Diagramação — versão 1', 'Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).

Responsável: Designer Senior + Redator

Output: Book completo em INDD + PDF de revisão para aprovação interna

Prazo referência: 5 dias úteis', '<p>Ação: Diagramar o book completo em InDesign seguindo o sistema visual da identidade. Montar todas as seções com conteúdo definitivo, renders tratados, plantas diagramadas, infográficos de lazer e localização. Textos finais inseridos (não lorem ipsum).</p><p>Responsável: Designer Senior + Redator</p><p>Output: Book completo em INDD + PDF de revisão para aprovação interna</p><p>Prazo referência: 5 dias úteis</p>', 8, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.4. Revisão interna e de conteúdo', 'Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.

Responsável: Nelson + Marco Andolfato

Output: Lista consolidada de ajustes internos aplicados

Prazo referência: 2 dias úteis

[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente', '<p>Ação: Nelson revisa design e hierarquia visual. Redator revisa todos os textos (ortografia, coerência, dados técnicos). Marco Andolfato faz revisão final interna. Compilar todos os apontamentos em lista única antes de abrir revisão com o cliente.</p><p>Responsável: Nelson + Marco Andolfato</p><p>Output: Lista consolidada de ajustes internos aplicados</p><p>Prazo referência: 2 dias úteis</p><p><strong>[APROVAÇÃO] Marco Andolfato aprova versão antes de enviar ao cliente</strong></p>', 9, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.5. Aprovação do cliente e ajustes', 'Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.

Responsável: Nelson / Atendimento

Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados

Prazo referência: Máx. 2 rodadas em 5 dias úteis

[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.', '<p>Ação: Enviar PDF ao cliente com formulário de feedback ou reunião de revisão. Registrar todos os apontamentos. Realizar até 2 rodadas de ajuste incluídas no escopo. Ajustes adicionais são cobrados via aditivo.</p><p>Responsável: Nelson / Atendimento</p><p>Output: Book aprovado pelo cliente por escrito, ajustes aplicados e registrados</p><p>Prazo referência: Máx. 2 rodadas em 5 dias úteis</p><p><strong>[DECISÃO] Dentro de 2 rodadas? Sim → aprovar. Não → emitir aditivo e continuar.</strong></p>', 10, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '5.6. Arte final, PDF interativo e entrega', 'Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.

Responsável: Designer Senior

Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente

Prazo referência: 2 dias úteis', '<p>Ação: Finalizar arte final para impressão (CMYK, 300dpi, com sangria e marcas de corte). Exportar PDF interativo (com links, sumário clicável, formulário de contato). Organizar entrega: PDF impressão, PDF digital, INDD editável. Enviar ao cliente e ao gráfico.</p><p>Responsável: Designer Senior</p><p>Output: Pasta de entrega completa no Google Drive, e-mail de entrega enviado ao cliente</p><p>Prazo referência: 2 dias úteis</p>', 11, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 1 Checklist de Entrega', 'Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.', '<p>Todos os renders tratados e com padrão de qualidade uniforme; plantas com numeração de cômodos e metragens; textos sem clichês imobiliários; dados técnicos validados pelo cliente; PDF de impressão com corte e sangria corretos; PDF digital com hiperlinks funcionais; encadernação especificada para o gráfico.</p>', 12, 'checkpoint');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '6. 2 Erros Comuns a Evitar', 'Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.', '<p>Diagramar com lorem ipsum e não substituir antes da entrega; usar renders não aprovados pelo cliente; tabela de preços sem autorização do cliente (risco legal); plantas sem escala ou sem legendas; PDF digital com arquivo de tamanho acima de 20MB sem otimização.</p>', 13, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '7. Ferramentas e Templates', 'Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).', '<p>Adobe InDesign CC, Adobe Photoshop CC, Adobe Illustrator CC, Adobe Acrobat Pro (PDF interativo), Google Drive (organização de conteúdo), WeTransfer ou Drive (entrega de arquivos pesados).</p>', 14, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '8. SLAs e Prazos', 'Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.', '<p>Coleta de conteúdo: 1 dia útil. Roteiro: 1 dia útil. Diagramação V1: 5 dias úteis. Revisão interna: 2 dias úteis. Aprovação cliente (2 rodadas): 5 dias úteis. Arte final: 2 dias úteis. Total: 16–20 dias úteis.</p>', 15, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '9. Fluxograma', 'Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim', '<p>Início → Receber conteúdo do cliente → [CONTEÚDO COMPLETO?] → Não: solicitar itens faltantes → Sim: Definir roteiro editorial → [NELSON APROVA ROTEIRO?] → Não: revisar → Sim: Diagramar book (V1) → Revisão interna → [MARCO APROVA?] → Não: ajustar → Sim: Enviar ao cliente → [CLIENTE APROVA EM ATÉ 2 RODADAS?] → Não: emitir aditivo → Sim: Arte final + PDF interativo → Entregar ao cliente e gráfico → Fim</p>', 16, 'step');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '10. Glossário', 'Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.', '<p>Book de vendas: principal material de apresentação de um empreendimento, utilizado por corretores e no stand de vendas. Diagramação: processo de organização visual de textos e imagens em um layout. PDF interativo: arquivo PDF com elementos clicáveis (hiperlinks, botões, sumário). Sangria: área extra além do corte final do impresso para garantir impressão sem bordas brancas.</p>', 17, 'note');
  INSERT INTO knowledge_sop_steps (sop_id, title, content, content_html, order_index, step_type)
  VALUES (v_sop_id, '11. Histórico de Revisões', 'Versão

Data

Autor

Alterações

1.0

2026-03-19

Claude Code

Criação inicial do SOP', '<table><tr><td><p><strong>Versão</strong></p></td><td><p><strong>Data</strong></p></td><td><p><strong>Autor</strong></p></td><td><p><strong>Alterações</strong></p></td></tr><tr><td><p>1.0</p></td><td><p>2026-03-19</p></td><td><p>Claude Code</p></td><td><p>Criação inicial do SOP</p></td></tr></table>', 18, 'step');

  -- ── TBO-BRD-007: Folder Combate ──
END $$;