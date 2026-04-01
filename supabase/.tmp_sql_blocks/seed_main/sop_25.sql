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