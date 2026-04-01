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
END $$;